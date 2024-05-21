// src/components/Home/ViewProductDetails/index.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext"; // Uvozite useAuth
import stylesNac from '../styles.module.css';
import styles from './styles.module.css';

const ProductDetails = () => {
    const { user, logout  } = useAuth();  // Uporabite kontekst za uporabnika in odjavo
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    console.log('ProductDetails id:', id);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        const fetchProductFromLocalStorage = async () => {
            try {
                const products = JSON.parse(localStorage.getItem('products') ?? '') || [];
                console.log('Products from local storage:', products);
                const foundProduct = products.find(p => p._id === id);
                console.log('Found product:', foundProduct);

                setProduct(foundProduct);
            } catch (error) {
                console.error('Error fetching product details from local storage:', error);
            }
        };

        fetchProductFromLocalStorage();
    }, [id,navigate,user]);

    if (!product) {
        console.log('Product not found');
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className={stylesNac.nav}>
                <label>Home</label>
                <button onClick={() => navigate('/')}>Izdelki</button>
                <button onClick={logout}>Odjava</button>
            </div>
        <div className={styles.productDetails}>
            <h2 className={styles.title}>{product.name}</h2>
            <img src={`http://localhost:3002/${product.productImage}`} alt={product.name} className={styles.image} />
            <p className= {styles.productDetails}><strong>Manufacturer:</strong> {product.Manufacturer}</p>
            <p className= {styles.productDetails}><strong>Warranty Expiry Date:</strong> {new Date(product.warrantyExpiryDate).toLocaleDateString()}</p>
            <p className= {styles.productDetails}><strong>Notes:</strong> {product.Notes}</p>
            <div>
                <button onClick={() => navigate(`/edit-product/${product._id}`)} className={styles.EditButton}>Uredi izdelek</button>
                <button onClick={null} className={styles.DownloadButton}>Prenesi račun</button>

            </div>
        </div>
        </div>
    );
};

export default ProductDetails;
