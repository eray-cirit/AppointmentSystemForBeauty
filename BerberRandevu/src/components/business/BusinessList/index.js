'use client';

import { useState, useEffect } from 'react';
import styles from './BusinessList.module.css';

/**
 * Ana sayfada işletme listesi
 * Konum seçildikten sonra gösterilir
 */
export default function BusinessList({ location, gender }) {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Placeholder görseller
    const placeholderImages = {
        male: [
            'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop',
        ],
        female: [
            'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop',
        ]
    };

    // Konum değiştiğinde işletmeleri yükle
    useEffect(() => {
        if (!location) return;

        async function loadBusinesses() {
            setLoading(true);
            setError(null);

            try {
                // Önce Google Places'dan veri çek (cache varsa kullanır)
                const fetchType = gender === 'male' ? 'barber' : 'hairdresser';
                await fetch(`/api/places/fetch-places?city=${encodeURIComponent(location.city)}&district=${encodeURIComponent(location.district)}&type=${fetchType}&lat=${location.lat}&lng=${location.lng}`);

                // Sonra businesses API'den listele
                const res = await fetch(`/api/businesses?city=${encodeURIComponent(location.city)}&gender=${gender}&lat=${location.lat}&lng=${location.lng}&limit=12`);
                const data = await res.json();

                if (data.success) {
                    setBusinesses(data.data);
                } else {
                    setError('İşletmeler yüklenemedi');
                }
            } catch (err) {
                console.error('Business load error:', err);
                setError('Bağlantı hatası');
            } finally {
                setLoading(false);
            }
        }

        loadBusinesses();
    }, [location, gender]);

    // Tema sınıfı
    const themeClass = gender === 'male' ? styles.male : styles.female;

    if (!location) return null;

    if (loading) {
        return (
            <div className={`${styles.container} ${themeClass}`}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Yakınlarındaki işletmeler aranıyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${styles.container} ${themeClass}`}>
                <div className={styles.error}>
                    <span>⚠️</span>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (businesses.length === 0) {
        return (
            <div className={`${styles.container} ${themeClass}`}>
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}>{gender === 'male' ? '💈' : '💅'}</span>
                    <h3>Henüz işletme bulunamadı</h3>
                    <p>{location.district}, {location.city} bölgesinde kayıtlı işletme yok.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${themeClass}`}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    {gender === 'male' ? '💈 Yakınındaki Berberler' : '💅 Yakınındaki Salonlar'}
                </h2>
                <p className={styles.subtitle}>
                    {location.district}, {location.city} • {businesses.length} sonuç
                </p>
            </div>

            <div className={styles.grid}>
                {businesses.map((business, index) => {
                    // Rastgele placeholder görsel
                    const images = gender === 'male' ? placeholderImages.male : placeholderImages.female;
                    const imageUrl = images[index % images.length];

                    return (
                        <div key={business.id} className={styles.card}>
                            <div className={styles.cardImage}>
                                <img
                                    src={imageUrl}
                                    alt={business.name}
                                    loading="lazy"
                                />
                                {business.rating > 0 && (
                                    <div className={styles.rating}>
                                        ⭐ {business.rating.toFixed(1)}
                                    </div>
                                )}
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{business.name}</h3>
                                <p className={styles.cardAddress}>{business.address}</p>
                                <div className={styles.cardMeta}>
                                    {business.distance && (
                                        <span className={styles.distance}>
                                            📍 {business.distance < 1
                                                ? `${Math.round(business.distance * 1000)}m`
                                                : `${business.distance.toFixed(1)}km`}
                                        </span>
                                    )}
                                    {business.reviewCount > 0 && (
                                        <span className={styles.reviews}>
                                            💬 {business.reviewCount} yorum
                                        </span>
                                    )}
                                </div>
                                {business.phone && (
                                    <a href={`tel:${business.phone}`} className={styles.phoneBtn}>
                                        📞 {business.phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
