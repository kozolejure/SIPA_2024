import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProductCard from './ProductCard/index.tsx';
import styles from './styles.module.css';

function HomeScreen() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [expiringProducts, setExpiringProducts] = useState([]);

    const showLocalNotification = (productId, title, body, swRegistration) => {
        console.log("showing local notification, product id: " + productId);
        const options = {
            body: body,
            icon: './favicon.ico',
            vibrate: [100, 50, 100],
            data: { dateOfArrival: Date.now(), primaryKey: '1', productId: productId },
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
                    setProducts(response.data);
                    localStorage.setItem('products', JSON.stringify(response.data));

                    console.log("fetched data", response.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    const cachedProducts = localStorage.getItem('products');
                    if (cachedProducts) {
                        setProducts(JSON.parse(cachedProducts));
                    } else {
                        console.log('No cached products found in local storage.');
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

        const syncData = async () => {
            try {
                console.log("Syncing data...");
                await axios.post(`http://localhost:3002/users/${user.id}/sync`, products);
                console.log("Data synced successfully");
            } catch (error) {
                console.error('Error syncing data:', error);
            }
        };

        useEffect(() => {
            fetchData();
            getExpiringProducts();
            checkAndRequestNotificationPermission();
            syncData();

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
                    <label>Home</label>
                    <button onClick={() => navigate('/add-product')}>Dodaj izdelek</button>
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
