// src/components/ProductCard.js
import React from 'react';
import styles from './styles.module.css';

const ProductCard = ({ product, onViewDetails }) => {
    return (
        <div className={styles.card}>
            <img src={`http://localhost:3002/${product.productImage}`} className={styles.image} />
            <div className={styles.info}>
                <h3 className={styles.title}>{product.name}</h3>
                <p className={styles.description}>{product.description}</p>
                <p className={styles.date}>Kupljeno: {new Date(product.purchaseDate).toLocaleDateString()}</p>
                <button onClick={() => onViewDetails(product.id)} className={styles.detailsButton}>Več podrobnosti</button>
            </div>
        </div>
    );
};

export default ProductCard;
