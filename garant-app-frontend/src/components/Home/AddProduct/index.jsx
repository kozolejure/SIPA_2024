import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../../context/AuthContext';
import { getTokens } from '../../../utils/tokensIndexedDB';

const AddProduct = () => {
    
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [productImageBase64, setProductImageBase64] = useState('');
    const [receiptImage, setReceiptImage] = useState(null);
    const [receiptImageBase64, setReceiptImageBase64] = useState('');
    const [notes, setNotes] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    const convertToBase64 = (file, setBase64) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setBase64(reader.result);
        };
        reader.onerror = (error) => {
            console.error('Error converting image to Base64:', error);
        };
    };

    const handleProductImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProductImage(file);  // Set binary data for online use
            convertToBase64(file, setProductImageBase64);  // Convert and set Base64 for offline use
        }
    };

    const handleReceiptImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setReceiptImage(file);  // Set binary data for online use
            convertToBase64(file, setReceiptImageBase64);  // Convert and set Base64 for offline use
        }
    };

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
            if (navigator.onLine) {

                const tokens = await getTokens();

                await axios.post(`http://localhost:3002/users/${user.id}/items`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${tokens.jwtToken}`
                    }
                });
                navigate('/');
            } else {
                const productData = {
                    name,
                    manufacturer,
                    warrantyExpiryDate,
                    productImage: productImageBase64,
                    receiptImage: receiptImageBase64,
                    notes
                };
                const products = JSON.parse(localStorage.getItem('products')) || [];
                products.push(productData);
                localStorage.setItem('products', JSON.stringify(products));
                navigate('/');
            }
        } catch (error) {
            console.error('Failed to add product:', error);
            saveProductToLocal();
        } 
    };

    const saveProductToLocal = () => {
        console.log('Saving product to local storage');
        const newProduct = {
            _id: new Date().getTime().toString(),
            name,
            manufacturer,
            warrantyExpiryDate,
            productImage: productImage ? URL.createObjectURL(productImage) : null,
            receiptImage: receiptImage ? URL.createObjectURL(receiptImage) : null,
            notes
        };

        const products = JSON.parse(localStorage.getItem('products') || '[]');
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        if (productImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                localStorage.setItem(newProduct._id, reader.result);
            };
            reader.readAsDataURL(productImage);
        }
        if (receiptImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                localStorage.setItem(`${newProduct._id}-receipt`, reader.result);
            };
            reader.readAsDataURL(receiptImage);
        }
        navigate('/');
    };

    return (
        <div className={styles.formContainer}>
            <h2>Add a New Product</h2>
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
    );
};

export default AddProduct;
