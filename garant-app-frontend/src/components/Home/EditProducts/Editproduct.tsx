import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

const EditProduct = () => {
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [receiptImage, setReceiptImage] = useState(null);
    const [notes, setNotes] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const fetchProductFromLocalStorage = useCallback(() => {
        try {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const product = products.find(p => p._id === id);
            if (product) {
                setName(product.name);
                setManufacturer(product.manufacturer);
                setWarrantyExpiryDate(formatDateForInput(product.warrantyExpiryDate));
                setNotes(product.notes);
                setProductImage(product.productImage || null);
                setReceiptImage(product.receiptImage || null);
            }
        } catch (error) {
            console.error('Failed to fetch product from local storage:', error);
        }
    }, [id]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProductFromLocalStorage();
    }, [user, navigate, fetchProductFromLocalStorage]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('manufacturer', manufacturer);
        formData.append('warrantyExpiryDate', warrantyExpiryDate);
        if (productImage) {
            formData.append('productImage', productImage);
        }
        if (receiptImage) {
            formData.append('receiptImage', receiptImage);
        }
        formData.append('notes', notes);

        try {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const updatedProducts = products.map((p) => {
                if (p._id === id) {
                    return { ...p, name, manufacturer, warrantyExpiryDate, notes };
                }
                return p;
            });
            localStorage.setItem('products', JSON.stringify(updatedProducts));

            await axios.put(`http://localhost:3002/users/${user.id}/items/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            navigate('/');
        } catch (error) {
            console.error('Failed to update product:', error);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Edit Product</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label htmlFor="name">Name:</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />

                <label htmlFor="manufacturer">Manufacturer:</label>
                <input
                    id="manufacturer"
                    type="text"
                    value={manufacturer}
                    onChange={e => setManufacturer(e.target.value)}
                    required
                />

                <label htmlFor="warrantyExpiryDate">Warranty Expiry Date:</label>
                <input
                    id="warrantyExpiryDate"
                    type="date"
                    value={warrantyExpiryDate}
                    onChange={e => setWarrantyExpiryDate(e.target.value)}
                    required
                />

                <label htmlFor="productImage">Product Image:</label>
                <input
                    id="productImage"
                    type="file"
                    onChange={e => setProductImage(e.target.files[0])}
                />

                <label htmlFor="receiptImage">Receipt Image:</label>
                <input
                    id="receiptImage"
                    type="file"
                    onChange={e => setReceiptImage(e.target.files[0])}
                />

                <label htmlFor="notes">Notes:</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />

                <button type="submit" className={styles.submitButton}>Update Product</button>
            </form>
        </div>
    );
};

export default EditProduct;
