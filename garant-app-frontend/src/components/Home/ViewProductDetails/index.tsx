// src/components/Home/ViewProductDetails/index.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext"; // Uvozite useAuth
import stylesNac from '../styles.module.css';
import styles from './styles.module.css';

interface Product {
    _id: string;
    name: string;
    Manufacturer: string;
    warrantyExpiryDate: string;
    productImage: string;
    receiptImage: string;
    Notes: string;
}

const ProductDetails = () => {
    const { user, logout } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    console.log('ProductDetails id:', id);

    useEffect(() => {
        const fetchProductFromLocalStorage = async () => {
            try {
                const products = JSON.parse(localStorage.getItem('products') ?? '') || [];
                console.log('Products from local storage:', products);
                const foundProduct = products.find((p: Product) => p._id === id);
                console.log('Found product:', foundProduct);

                setProduct(foundProduct);
            } catch (error) {
                console.error('Error fetching product details from local storage:', error);
            }
        };

        fetchProductFromLocalStorage();
    }, [id, navigate, user]);


    const deleteProduct = async () => {
        try {
            const response = await fetch(`http://localhost:3002/users/${user.id}/items/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            });
            console.log('Delete product response:', response);

            // Remove the deleted product from local storage
            try {
                const products = JSON.parse(localStorage.getItem('products') || '[]');
                const updatedProducts = products.filter((p: Product) => p._id !== id);
                localStorage.setItem('products', JSON.stringify(updatedProducts));
            } catch (error) {
                console.error('Error updating local storage after deletion:', error);
            }
            navigate('/');

        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };
    const downloadReceipt = () => {
        // Preveri, ali ima izdelek račun
        if (!product?.receiptImage) {
            console.error('Receipt image not found for product:', product);
            return;
        }

        // Neposredna povezava do slike
        const receiptUrl = `http://localhost:3002/${product.receiptImage}`;

        // Ustvari XMLHttpRequest objekt
        const xhr = new XMLHttpRequest();
        xhr.open('GET', receiptUrl, true);
        xhr.responseType = 'blob'; // Nastavi odgovor kot binarni podatki

        // Ko je prenos končan
        xhr.onload = function () {
            // Preveri, ali je zahteva uspešna
            if (xhr.status === 200) {
                // Ustvari URL za objekt v pomnilniku
                const blobUrl = window.URL.createObjectURL(xhr.response);

                // Ustvari skriti <a> element za prenos
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = 'receipt'; // Ime datoteke za prenos
                link.target = '_blank';

                // Dodaj <a> element na stran in sproži klik nanj
                document.body.appendChild(link);
                link.click();

                // Odstrani <a> element iz strani
                document.body.removeChild(link);

                // Sprosti URL za objekt v pomnilniku
                window.URL.revokeObjectURL(blobUrl);
            } else {
                console.error('Error downloading receipt. Status:', xhr.status);
            }
        };

        // Ko pride do napake med prenosom
        xhr.onerror = function () {
            console.error('Error downloading receipt. Network error.');
        };

        // Pošlji zahtevek za prenos slike
        xhr.send();
    };

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
                <h2 className={styles.title}>{(product as { name: string }).name}</h2>
                <img src={`http://localhost:3002/${product.productImage}`} alt={product.name} className={styles.image} />
                <p className={styles.productDetails}><strong>Manufacturer:</strong> {product.Manufacturer}</p>
                <p className={styles.productDetails}><strong>Warranty Expiry Date:</strong> {new Date(product.warrantyExpiryDate).toLocaleDateString()}</p>
                <p className={styles.productDetails}><strong>Notes:</strong> {product.Notes}</p>
                <div>
                    <button onClick={() => navigate(`/edit/${id}`)} className={styles.EditButton}>Uredi izdelek</button>
                    <button onClick={downloadReceipt} className={styles.DownloadButton}>Prenesi račun</button>
                </div>
                <div>
                    <button onClick={deleteProduct} className={styles.deleteButton}>Izbriši izdelek</button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;