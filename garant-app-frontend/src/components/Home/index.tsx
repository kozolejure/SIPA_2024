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
            if (navigator.onLine) {
                try {
                    // Fetching data from server
                    const response = await axios.get(`http://localhost:3002/users/${user.id}/items`);
                    setProducts(response.data);
                    localStorage.setItem('products', JSON.stringify(response.data));
                    console.log("Fetched data from server:", response.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    loadProductsFromLocal();
                }
            } else {
                loadProductsFromLocal();
            }
        };

        

        const loadProductsFromLocal = () => {
            console.log('Loading products from local storage...');
            const cachedProducts = localStorage.getItem('products');
            if (cachedProducts) {
                const products = JSON.parse(cachedProducts);
                products.forEach(product => {
                    if (product.productImage && !product.productImage.startsWith('data:image')) {
                        product.productImage = localStorage.getItem(product._id) || product.productImage;
                    }
                    if (product.receiptImage && !product.receiptImage.startsWith('data:image')) {
                        product.receiptImage = localStorage.getItem(`${product._id}-receipt`) || product.receiptImage;
                    }
                });
                setProducts(products);
                console.log('Loaded cached products:', products);
            } else {
                console.log('No cached products found in local storage.');
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
                <button onClick={() => navigate('/add-product')}>Add Product</button>
                <button onClick={logout}>Logout</button>
            </div>
            {products.length === 0 && <div className={styles.container}>No products added</div>}
            <div className={styles.container}>
                {products.map(product => (
                    <ProductCard key={product._id} product={product} onViewDetails={handleViewDetails} />
                ))}
            </div>
        </div>
    );
}

export default HomeScreen;
