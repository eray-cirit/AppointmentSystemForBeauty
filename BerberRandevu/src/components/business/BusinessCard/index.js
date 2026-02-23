"use client";

import Image from 'next/image';
import styles from './BusinessCard.module.css';

export default function BusinessCard({ business, gender = 'male', onClick }) {
    const {
        name,
        type,
        address,
        district,
        city,
        rating,
        reviewCount,
        priceRange,
        isOpen,
        distance,
        images
    } = business;

    // İşletme tipi badge'i
    const getTypeLabel = () => {
        const types = {
            barber: 'Kuaför',
            salon: 'Güzellik Salonu',
            beauty_center: 'Güzellik Merkezi',
            nail_art: 'Nail Art'
        };
        return types[type] || type;
    };

    // Mesafeyi formatla
    const formatDistance = (km) => {
        if (!km) return null;
        if (km < 1) {
            return `${Math.round(km * 1000)}m`;
        }
        return `${km.toFixed(1)}km`;
    };

    // Rating yıldızları
    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className={styles.star}>★</span>);
        }
        if (hasHalfStar) {
            stars.push(<span key="half" className={styles.starHalf}>★</span>);
        }
        return stars;
    };

    // Placeholder görsel
    const imageSrc = images?.[0] || `/api/placeholder/400/250?text=${encodeURIComponent(name)}`;

    return (
        <div
            className={`${styles.card} ${styles[gender]}`}
            onClick={() => onClick?.(business)}
        >
            {/* Görsel Alanı */}
            <div className={styles.imageContainer}>
                <div className={styles.imagePlaceholder}>
                    <span className={styles.placeholderIcon}>
                        {type === 'barber' ? '💈' : type === 'nail_art' ? '💅' : '✨'}
                    </span>
                    <span className={styles.placeholderText}>{name}</span>
                </div>

                {/* Badges */}
                <div className={styles.badges}>
                    <span className={styles.typeBadge}>{getTypeLabel()}</span>
                    {isOpen && <span className={styles.openBadge}>Açık</span>}
                </div>

                {/* Mesafe */}
                {distance && (
                    <div className={styles.distanceBadge}>
                        {formatDistance(distance)}
                    </div>
                )}
            </div>

            {/* İçerik Alanı */}
            <div className={styles.content}>
                <h3 className={styles.name}>{name}</h3>

                <p className={styles.address}>
                    📍 {district}, {city}
                </p>

                <div className={styles.meta}>
                    <div className={styles.rating}>
                        <span className={styles.stars}>{renderStars()}</span>
                        <span className={styles.ratingValue}>{rating}</span>
                        <span className={styles.reviewCount}>({reviewCount})</span>
                    </div>

                    <span className={styles.price}>{priceRange}</span>
                </div>
            </div>
        </div>
    );
}
