"use client";

import { useState, useRef, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import styles from './LocationPicker.module.css';

export default function LocationPicker({ gender = 'male', compact = false }) {
    const { city, cities, loading, error, detectLocation, setCity } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Dropdown dışına tıklama
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Şehirleri filtrele
    const filteredCities = cities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCitySelect = (cityName) => {
        setCity(cityName);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleDetectLocation = () => {
        detectLocation();
        setIsOpen(false);
    };

    return (
        <div
            className={`${styles.locationPicker} ${styles[gender]} ${compact ? styles.compact : ''}`}
            ref={dropdownRef}
        >
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
            >
                <span className={styles.icon}>📍</span>
                <span className={styles.cityName}>
                    {loading ? 'Konum alınıyor...' : city}
                </span>
                <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
            </button>

            {error && (
                <div className={styles.error}>{error}</div>
            )}

            {isOpen && (
                <div className={styles.dropdown}>
                    {/* GPS Butonu */}
                    <button
                        className={styles.gpsButton}
                        onClick={handleDetectLocation}
                        disabled={loading}
                    >
                        <span className={styles.gpsIcon}>🎯</span>
                        Konumumu Bul
                    </button>

                    {/* Arama */}
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="Şehir ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    {/* Şehir Listesi */}
                    <ul className={styles.cityList}>
                        {filteredCities.map((c) => (
                            <li
                                key={c.name}
                                className={`${styles.cityItem} ${c.name === city ? styles.active : ''}`}
                                onClick={() => handleCitySelect(c.name)}
                            >
                                {c.name}
                            </li>
                        ))}
                        {filteredCities.length === 0 && (
                            <li className={styles.noResult}>Şehir bulunamadı</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
