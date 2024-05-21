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
                    <ProductCard key={product._id} product={product}  onViewDetails={handleViewDetails} />
                ))}
            </div>
        </div>
    );
}

export default HomeScreen;
