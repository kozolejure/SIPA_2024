import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

const ProductCard = ({ product, onViewDetails }) => {
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                console.log('Fetching image from server');
                const response = await fetch(`http://localhost:3002/${product.productImage}`);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string; // Cast reader.result to string
                    localStorage.setItem(product._id, base64data);
                    setImageSrc(base64data);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.log('Error fetching image, loading from cache', error);
                const cachedImage = localStorage.getItem(product._id);
                if (cachedImage) {
                    setImageSrc(cachedImage);
                } else {
                    console.log('No cached image found in local storage.');
                }
            }
        };

        fetchImage();
    }, [product]);

    return (
        <div className={styles.card}>
            {imageSrc && (
                <img src={imageSrc} alt={product.name} className={styles.image} />
            )}
            <div className={styles.info}>
                <h3 className={styles.title}>{product.name}</h3>
                <p className={styles.description}>{product.notes}</p>
                <p className={styles.date}>Datum garancije do: <b>{new Date(product.warrantyExpiryDate).toLocaleDateString()}</b></p>
                <button onClick={() => onViewDetails(product._id)} className={styles.detailsButton}>Več podrobnosti</button>
            </div>
        </div>
    );
};

export default ProductCard;
