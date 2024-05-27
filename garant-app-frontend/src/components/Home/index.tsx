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
                console.log("fetching data with user id: ", user.id);
                const response = await axios.get(`http://localhost:3002/users/${user.id}/items`);
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
        };

        fetchData();
    }, [user, navigate]);

    useEffect(() => {
        const syncData = async () => {
            try {
                console.log("Syncing data...");
                await axios.post(`http://localhost:3002/users/${user.id}/sync`, products);
                console.log("Data synced successfully");
            } catch (error) {
                console.error('Error syncing data:', error);
            }
        };

        syncData();
    }, [user, products]);

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
