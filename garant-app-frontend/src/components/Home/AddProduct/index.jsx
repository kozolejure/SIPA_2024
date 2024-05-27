import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../../context/AuthContext';

const AddProduct = () => {
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [receiptImage, setReceiptImage] = useState(null);
    const [notes, setNotes] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

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
            await axios.post(`http://localhost:3002/users/${user.id}/items`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate('/');
        } catch (error) {
            console.error('Failed to add product:', error);
            saveProductToLocal();
        }
    };

    const saveProductToLocal = () => {
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

                <button type="submit" className={styles.submitButton}>Add Product</button>
            </form>
        </div>
    );
};

export default AddProduct;
