import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Uvozite useAuth
import ProductCard from './ProductCard/index.tsx';
import styles from './styles.module.css';

function HomeScreen() {
    const { user, logout } = useAuth();  // Uporabite kontekst za uporabnika in odjavo
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    useEffect(() => {
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

        const checkAndRequestNotificationPermission = async () => {
            // Check if the Notification API is available in the browser
            if (!('Notification' in window)) {
                alert("This browser does not support desktop notification");
                return;
            }

            try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    console.log("Notification permission granted.");
                    // You can now show notifications
                } else {
                    console.log("Notification permission denied.");
                    // Handle the denial of permission, perhaps by disabling notification features
                }
            } catch (error) {
                console.error("Failed to request notification permission:", error);
            }
        }


        fetchData();
        checkAndRequestNotificationPermission();
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
