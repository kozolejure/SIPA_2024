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

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                console.log("Checking service availability...");
                await axios.get(`http://localhost:3002/users/${user.id}/items`);
                console.log("Service available, syncing data...");

                // Sinhronizacija podatkov
                

                // Pridobivanje podatkov po sinhronizaciji
                const response = await axios.get(`http://localhost:3002/users/${user.id}/items`);
                setProducts(response.data);
                localStorage.setItem('products', JSON.stringify(response.data));

                console.log("Fetched data:", response.data);
            } catch (error) {
                console.error('Error fetching data:', error);

                // Pridobivanje podatkov iz lokalnega pomnilnika
                const cachedProducts = localStorage.getItem('products');
                if (cachedProducts) {
                    setProducts(JSON.parse(cachedProducts));
                } else {
                    console.log('No cached products found in local storage.');
                }
            }
        };

        const syncData = async () => {
            try {
                console.log("Syncing data...");
                await axios.post(`http://localhost:3002/users/${user.id}/sync`, products);
                console.log("Data synced successfully");
            } catch (error) {
                console.error('Error syncing data:', error);
            }
        };

        fetchData();
    }, [user, navigate]);

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
