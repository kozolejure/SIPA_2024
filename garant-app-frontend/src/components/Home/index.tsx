import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProductCard from './ProductCard/index.tsx';
import styles from './styles.module.css';
import useNotification from '../../hooks/useNotification.js';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function HomeScreen() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [expiringProducts, setExpiringProducts] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [speechResult, setSpeechResult] = useState('');
    const notify = useNotification();

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'sl-SI';
    recognition.onend = () => recognition.start();

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
        setSpeechResult(transcript);
    };

    recognition.onend = () => {
        setIsListening(false);
        console.log('Govorno prepoznavanje se je zaključilo', speechResult);
        // Tukaj lahko dodate logiko za iskanje izdelkov ali dodajanje izdelkov na podlagi speechResult
        switch (speechResult) {
            case 'dodaj izdelek':
                navigate('/add-product');
                break;
            case 'odjava':
                logout();
                break;
            default:
                notify('Nisem prepoznal ukaza', 'info');
                console.log('Nisem prepoznal ukaza');
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
        setIsListening(!isListening);
    };

    const showLocalNotification = (productId, title, body, swRegistration) => {
        console.log("showing local notification, product id: " + productId);
        const options = {
            body: body,
            icon: './favicon.ico',
            vibrate: [100, 50, 100],
            data: { dateOfArrival: Date.now(), primaryKey: productId, productId: productId },
            tag: productId,
            actions: [
                { action: 'explore', title: 'View details', icon: 'images/checkmark.png' }
            ]
        };

        if (Notification.permission === 'granted') {
            swRegistration.showNotification(title, options);
        }
    };

    const fetchData = async () => {
        try {
            console.log("Fetching data with user id: ", user.id);

            if (navigator.onLine) {
                const response = await axios.get(`http://localhost:3002/users/${user.id}/items`);
                console.log("Response data: ", response.data);
                if (Array.isArray(response.data)) {
                    setProducts(response.data);
                    localStorage.setItem('products', JSON.stringify(response.data));
                } else {
                    console.error("Invalid data type received:", response.data);
                    setProducts([]);
                }
            } else {
                console.log("Offline mode detected. Retrieving data from local storage...");
                const storedProducts = localStorage.getItem('products');
                try {
                    const parsedProducts = JSON.parse(storedProducts);
                    console.log("Parsed products from storage:", parsedProducts);
                    if (Array.isArray(parsedProducts)) {
                        setProducts(parsedProducts);
                    } else {
                        console.error("Invalid data type in storage:", parsedProducts);
                        setProducts([]);
                    }
                } catch (parseError) {
                    console.error('Error parsing products from localStorage:', parseError);
                    setProducts([]);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getExpiringProducts = async () => {
        try {
            if (navigator.onLine) {
                const response = await axios.get(`http://localhost:3003/users/${user.id}/items/expiring`);

                if (Array.isArray(response.data)) {
                    console.log("Expiring products:", response.data);
                    setExpiringProducts(response.data);
                } else {
                    console.error("Invalid data type received:", response.data);
                    setExpiringProducts([]);
                }
            }
            else {
                navigator.serviceWorker.ready.then((swRegistration) => {
                    showLocalNotification(null, 'Potek garancije', 'Ste v offline načinu, kjer ni samodejnega preverjanja garancije', swRegistration);
                });
            }
        } catch (error) {
            console.error('Error fetching expiring products:', error);
            setExpiringProducts([]);
        }
    }

    const checkAndRequestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert("This browser does not support desktop notification");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                console.log("Notification permission granted.");
            } else {
                console.log("Notification permission denied.");
            }
        } catch (error) {
            console.error("Failed to request notification permission:", error);
        }
    }

    const getNotificationProductExpiry = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((swRegistration) => {
                expiringProducts.forEach(product => {
                    showLocalNotification(product._id, 'Potek garancije', 'Izdelku ' + product.name + ', bo kmalu potekla garancija', swRegistration);
                });
            });
        }
    }


    useEffect(() => {
        fetchData();
        getExpiringProducts();
        checkAndRequestNotificationPermission();

        return () => {
            recognition.stop();
            recognition.onend = null;
        };
    }, [user, navigate]);

    if (!Array.isArray(products)) {
        console.error("Critical error: products is not an array", products);
    }

    const handleViewDetails = (id) => {
        navigate(`/product-details/${id}`);
    };

    return (
        <div>
            <div className={styles.nav}>
                <button onClick={getNotificationProductExpiry}>Obvestilo o poteku</button>
                <button onClick={() => navigate('/add-product')}>Dodaj izdelek</button>
                <button onClick={toggleListening}>{isListening ? 'Stop Listening' : 'Start Listening'}</button>
                <button onClick={logout}>Odjava</button>
            </div>
            {products.length === 0 && <div className={styles.container}>Ni dodanih izdelkov</div>}
            <div className={styles.container}>
                {products.map(product => (
                    <ProductCard key={product._id} product={product} onViewDetails={handleViewDetails} />
                ))}
            </div>
        </div>
    );
}

export default HomeScreen;
