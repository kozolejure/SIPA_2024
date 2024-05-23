import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";
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
    const { user, logout  } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:3002/users/${user.id}/items/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (response.ok) {
                    const productData = await response.json();
                    setProduct(productData);
                } else {
                    // If server response is not ok, fallback to local storage
                    throw new Error('Server response not ok');
                }
            } catch (error) {
                console.error('Error fetching product from server, falling back to local storage:', error);
                fetchProductFromLocalStorage();
            }
        };

        const fetchProductFromLocalStorage = () => {
            try {
                const products = JSON.parse(localStorage.getItem('products') ?? '[]');
                const foundProduct = products.find((p: Product) => p._id === id);
                setProduct(foundProduct);
            } catch (error) {
                console.error('Error fetching product details from local storage:', error);
            }
        };

        fetchProduct();
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

            if (response.ok) {
                const products = JSON.parse(localStorage.getItem('products') || '[]');
                const updatedProducts = products.filter((p: Product) => p._id !== id);
                localStorage.setItem('products', JSON.stringify(updatedProducts));
                navigate('/');
            } else {
                throw new Error('Server response not ok');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const downloadReceipt = () => {
        if (!product?.receiptImage) {
            console.error('Receipt image not found for product:', product);
            return;
        }

        const receiptUrl = `http://localhost:3002/${product.receiptImage}`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', receiptUrl, true);
        xhr.responseType = 'blob';

        xhr.onload = function() {
            if (xhr.status === 200) {
                const blobUrl = window.URL.createObjectURL(xhr.response);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = 'receipt';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } else {
                console.error('Error downloading receipt. Status:', xhr.status);
            }
        };

        xhr.onerror = function() {
            console.error('Error downloading receipt. Network error.');
        };

        xhr.send();
    };

    if (!product) {
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
