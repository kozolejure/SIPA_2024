import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { getTokens } from '../../../utils/tokensIndexedDB';

const EditProduct = () => {
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [productImagePreview, setProductImagePreview] = useState(null);
    const [receiptImage, setReceiptImage] = useState(null);
    const [receiptImagePreview, setReceiptImagePreview] = useState(null);
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
                setProductImagePreview(product.productImage || null);
                setReceiptImagePreview(product.receiptImage || null);
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
            if (!navigator.onLine) {
                await saveChangesToLocal();
                navigate('/');
                return;
            }
            
            const tokens = await getTokens();

            await axios.put(`http://localhost:3002/users/${user.id}/items/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${tokens.jwtToken}`,
                },
            });

            await updateLocalStorage();

            navigate('/');
        } catch (error) {
            console.error('Failed to update product:', error);
            navigate('/');
        }
    };

    const readAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            if (!(file instanceof Blob)) {
                resolve(file);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const saveChangesToLocal = async () => {
        const productImageBase64 = productImage ? await readAsDataURL(productImage) : productImagePreview;
        const receiptImageBase64 = receiptImage ? await readAsDataURL(receiptImage) : receiptImagePreview;

        const updatedProduct = {
            _id: id,
            name,
            manufacturer,
            warrantyExpiryDate,
            productImage: productImageBase64,
            receiptImage: receiptImageBase64,
            notes
        };

        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const updatedProducts = products.map((p) => {
            if (p._id === id) {
                return updatedProduct;
            }
            return p;
        });
        localStorage.setItem('products', JSON.stringify(updatedProducts));
    };

    const updateLocalStorage = async () => {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const updatedProducts = [];
        for (const product of products) {
            if (product._id === id) {
                const updatedProduct = {
                    ...product,
                    name,
                    manufacturer,
                    warrantyExpiryDate,
                    productImage: productImage ? await readAsDataURL(productImage) : product.productImage,
                    receiptImage: receiptImage ? await readAsDataURL(receiptImage) : product.receiptImage,
                    notes
                };
                updatedProducts.push(updatedProduct);
            } else {
                updatedProducts.push(product);
            }
        }
        localStorage.setItem('products', JSON.stringify(updatedProducts));
    };

    const handleProductImageChange = async (e) => {
        const file = e.target.files[0];
        setProductImage(file);
        setProductImagePreview(await readAsDataURL(file));
        
        // Shranjevanje v lokalno shrambo
        localStorage.setItem(id, await readAsDataURL(file));
    };

    const handleReceiptImageChange = async (e) => {
        const file = e.target.files[0];
        setReceiptImage(file);
        setReceiptImagePreview(await readAsDataURL(file));
        
        // Shranjevanje v lokalno shrambo
        localStorage.setItem(id + '-receipt', await readAsDataURL(file));
    };

    useEffect(() => {
        const handleStorageChange = () => {
            const cachedImage = localStorage.getItem(id);
            if (cachedImage) {
                setProductImagePreview(cachedImage);
            }
            const cachedReceipt = localStorage.getItem(id + '-receipt');
            if (cachedReceipt) {
                setReceiptImagePreview(cachedReceipt);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [id]);

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
                    onChange={handleProductImageChange}
                />
                {productImagePreview && (
                    <img src={productImagePreview} alt="Product Preview" className={styles.imagePreview} />
                )}

                <label htmlFor="receiptImage">Receipt Image:</label>
                <input
                    id="receiptImage"
                    type="file"
                    onChange={handleReceiptImageChange}
                />
                {receiptImagePreview && (
                    <img src={receiptImagePreview} alt="Receipt Preview" className={styles.imagePreview} />
                )}

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
