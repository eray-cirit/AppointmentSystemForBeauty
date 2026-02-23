'use client';

import { useRef } from 'react';
import Link from 'next/link';
import styles from './CategorySlider.module.css';

/**
 * Kategori Slider Bileşeni
 * Yemeksepeti tarzı yana kaydırmalı işletme listesi
 */
export default function CategorySlider({ title, icon, businesses, gender }) {
    const sliderRef = useRef(null);
    const themeClass = gender === 'male' ? styles.maleTheme : styles.femaleTheme;

    const scroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = 300;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!businesses || businesses.length === 0) {
        return null;
    }

    return (
        <div className={`${styles.categorySection} ${themeClass}`}>
            <div className={styles.categoryHeader}>
                <h2 className={styles.categoryTitle}>
                    <span className={styles.categoryIcon}>{icon}</span>
                    {title}
                </h2>
                <div className={styles.scrollButtons}>
                    <button
                        className={styles.scrollBtn}
                        onClick={() => scroll('left')}
                        aria-label="Sola kaydır"
                    >
                        ←
                    </button>
                    <button
                        className={styles.scrollBtn}
                        onClick={() => scroll('right')}
                        aria-label="Sağa kaydır"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className={styles.sliderContainer} ref={sliderRef}>
                {businesses.map((business) => (
                    <Link
                        href={`/isletme/${business.id}`}
                        key={business.id}
                        className={styles.businessCard}
                    >
                        <div className={styles.cardImage}>
                            {business.image ? (
                                <img src={business.image} alt={business.name} />
                            ) : (
                                <div className={styles.placeholderImage}>
                                    {business.name.charAt(0)}
                                </div>
                            )}
                            {business.badge && (
                                <span className={styles.badge}>{business.badge}</span>
                            )}
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.businessName}>{business.name}</h3>
                            <div className={styles.businessInfo}>
                                {business.rating && (
                                    <span className={styles.rating}>
                                        ⭐ {business.rating}
                                        {business.reviewCount && (
                                            <span className={styles.reviewCount}>
                                                ({business.reviewCount})
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>
                            <div className={styles.businessMeta}>
                                {business.distance && (
                                    <span className={styles.distance}>📍 {business.distance}</span>
                                )}
                                {business.priceRange && (
                                    <span className={styles.price}>{business.priceRange}</span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
