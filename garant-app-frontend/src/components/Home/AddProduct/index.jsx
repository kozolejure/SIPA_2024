// src/components/AddProduct.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';  // Uporabite že obstoječi CSS modul ali ustvarite novega
import { useAuth } from '../../../context/AuthContext';

const AddProduct = () => {
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
    const [productImageBase64, setProductImageBase64] = useState('');
    const [receiptImageBase64, setReceiptImageBase64] = useState('');
    const [notes, setNotes] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, []);

    const handleProductImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductImageBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReceiptImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptImageBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('manufacturer', manufacturer);
        formData.append('warrantyExpiryDate', warrantyExpiryDate);
        formData.append('productImage', productImageBase64);
        formData.append('receiptImage', receiptImageBase64);
        formData.append('notes', notes);

        console.log('Product data:', JSON.stringify(formData, null, 2));

        try {
            const response = await axios.post('http://localhost:3002/' + user.id + '/items', {
                name: name,
                manufacturer: manufacturer,
                warrantyExpiryDate: warrantyExpiryDate,
                productImage: productImageBase64,
                receiptImage: receiptImageBase64,
                notes: notes
            });

            console.log('Product adding response:', response.data);
            navigate('/'); // Navigirajte nazaj na domačo stran po uspešnem dodajanju
        } catch (error) {
            console.error('Failed to add product:', error);
        }
    };

    return (
        <div>
            <h2 className={styles.title}>Add a New Product</h2>
            <div className={styles.formContainer}>
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
                        onChange={handleProductImageChange}
                    />

                    <label htmlFor="receiptImage">Receipt Image:</label>
                    <input
                        id="receiptImage"
                        type="file"
                        onChange={handleReceiptImageChange}
                    />

                    <label htmlFor="notes">Notes:</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />

                    <button type="submit" className={styles.submitButton}>Add Product</button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
