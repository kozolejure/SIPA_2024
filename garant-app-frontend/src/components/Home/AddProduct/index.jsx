import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

const ProductCard = ({ product, onViewDetails }) => {
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                if (!navigator.onLine) {
                    console.log('Offline mode: Loading image from local storage');
                    const cachedImage = localStorage.getItem(product._id);
                    if (cachedImage) {
                        setImageSrc(cachedImage);
                    } else {
                        console.log('No cached image found in local storage.');
                    }
                    return;
                }

                console.log('Online mode: Fetching image from server');
                const response = await fetch(`http://localhost:3002/${product.productImage}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    localStorage.setItem(product._id, base64data);
                    setImageSrc(base64data);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.log('Error fetching image, loading from cache', error);
                const cachedImageFallback = localStorage.getItem(product._id);
                if (cachedImageFallback) {
                    setImageSrc(cachedImageFallback);
                } else {
                    console.log('No cached image found in local storage.');
                }
            }
        };

        fetchImage();
    }, [product]);

    return (
        <div className={styles.card}>
            {imageSrc ? (
                <img src={imageSrc} alt={product.name} className={styles.image} />
            ) : (
                <div className={styles.placeholder}>Loading...</div>
            )}
            <div className={styles.info}>
                <h3 className={styles.title}>{product.name}</h3>
                <p className={styles.description}>{product.notes}</p>
                <p className={styles.date}>Kupljeno: {new Date(product.warrantyExpiryDate).toLocaleDateString()}</p>
                <button onClick={() => onViewDetails(product._id)} className={styles.detailsButton}>Več podrobnosti</button>
            </div>
        </div>
    );
};

export default ProductCard;
