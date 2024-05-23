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
    const [imageSrc, setImageSrc] = useState<string | null>(null);

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
                    fetchImage(productData.productImage);
                } else {
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
                if (foundProduct) {
                    setProduct(foundProduct);
                    const cachedImage = localStorage.getItem(foundProduct._id);
                    if (cachedImage) {
                        setImageSrc(cachedImage);
                    }
                }
            } catch (error) {
                console.error('Error fetching product details from local storage:', error);
            }
        };

        const fetchImage = async (imagePath: string) => {
            try {
                const response = await fetch(`http://localhost:3002/${imagePath}`);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    localStorage.setItem(id, base64data);
                    setImageSrc(base64data);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error('Error fetching image from server, falling back to local storage:', error);
                const cachedImage = localStorage.getItem(id);
                if (cachedImage) {
                    setImageSrc(cachedImage);
                }
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
            console.error('Error deleting product from server, falling back to local storage:', error);
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const updatedProducts = products.filter((p: Product) => p._id !== id);
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            navigate('/');
        }
    };

    const downloadReceipt = async () => {
        if (!product?.receiptImage) {
            console.error('Receipt image not found for product:', product);
            return;
        }

        const receiptUrl = `http://localhost:3002/${product.receiptImage}`;
        try {
            const response = await fetch(receiptUrl);
            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = 'receipt';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } else {
                throw new Error('Server response not ok');
            }
        } catch (error) {
            console.error('Error downloading receipt from server, falling back to local storage:', error);
            const cachedReceipt = localStorage.getItem(`${id}-receipt`);
            if (cachedReceipt) {
                const link = document.createElement('a');
                link.href = cachedReceipt;
                link.download = 'receipt';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
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
                {imageSrc && <img src={imageSrc} alt={product.name} className={styles.image} />}
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
