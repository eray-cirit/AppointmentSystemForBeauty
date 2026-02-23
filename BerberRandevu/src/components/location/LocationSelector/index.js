'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './LocationSelector.module.css';

/**
 * Profesyonel Konum Seçici
 * Dropdown + Arama çubuklu şehir ve ilçe seçimi
 */
export default function LocationSelector({ onLocationSelect, gender }) {
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [citySearch, setCitySearch] = useState('');
    const [districtSearch, setDistrictSearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
    const [loading, setLoading] = useState(true);

    const cityRef = useRef(null);
    const districtRef = useRef(null);

    // Şehirleri yükle
    useEffect(() => {
        async function loadCities() {
            try {
                const res = await fetch('/api/locations?type=cities');
                const data = await res.json();
                if (data.success) {
                    setCities(data.data);
                }
            } catch (error) {
                console.error('Şehirler yüklenemedi:', error);
            } finally {
                setLoading(false);
            }
        }
        loadCities();
    }, []);

    // Dropdown dışına tıklanınca kapat
    useEffect(() => {
        function handleClickOutside(event) {
            if (cityRef.current && !cityRef.current.contains(event.target)) {
                setShowCityDropdown(false);
            }
            if (districtRef.current && !districtRef.current.contains(event.target)) {
                setShowDistrictDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Şehir seçildiğinde ilçeleri yükle
    useEffect(() => {
        if (!selectedCity) return;

        async function loadDistricts() {
            try {
                const res = await fetch(`/api/locations?type=districts&cityId=${selectedCity.id}`);
                const data = await res.json();
                if (data.success) {
                    setDistricts(data.data);
                }
            } catch (error) {
                console.error('İlçeler yüklenemedi:', error);
            }
        }
        loadDistricts();
    }, [selectedCity]);

    // Şehir seç
    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setCitySearch(city.name);
        setShowCityDropdown(false);
        setSelectedDistrict(null);
        setDistrictSearch('');
        setDistricts([]);
    };

    // İlçe seç ve konum onayla
    const handleDistrictSelect = (district) => {
        setSelectedDistrict(district);
        setDistrictSearch(district.name);
        setShowDistrictDropdown(false);

        // Konumu bildir
        if (onLocationSelect) {
            onLocationSelect({
                city: selectedCity.name,
                cityId: selectedCity.id,
                district: district.name,
                districtId: district.id,
                lat: district.lat,
                lng: district.lng
            });
        }
    };

    // Filtrelenmiş şehirler
    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(citySearch.toLowerCase())
    );

    // Filtrelenmiş ilçeler
    const filteredDistricts = districts.filter(district =>
        district.name.toLowerCase().includes(districtSearch.toLowerCase())
    );

    // Tema sınıfı
    const themeClass = gender === 'male' ? styles.male : styles.female;

    if (loading) {
        return (
            <div className={`${styles.container} ${themeClass}`}>
                <div className={styles.loading}>
                    <span className={styles.spinner}></span>
                    <span>Yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${themeClass}`}>
            <h3 className={styles.title}>📍 Konumunu Seç</h3>

            <div className={styles.selectorsRow}>
                {/* Şehir Seçici */}
                <div className={styles.selectWrapper} ref={cityRef}>
                    <label className={styles.label}>Şehir</label>
                    <div className={styles.selectBox}>
                        <input
                            type="text"
                            value={citySearch}
                            onChange={(e) => {
                                setCitySearch(e.target.value);
                                setShowCityDropdown(true);
                                if (selectedCity && e.target.value !== selectedCity.name) {
                                    setSelectedCity(null);
                                    setSelectedDistrict(null);
                                    setDistrictSearch('');
                                }
                            }}
                            onFocus={() => setShowCityDropdown(true)}
                            placeholder="Şehir ara..."
                            className={styles.searchInput}
                        />
                        <span className={styles.arrow}>▼</span>
                    </div>

                    {showCityDropdown && (
                        <div className={styles.dropdown}>
                            {filteredCities.length > 0 ? (
                                filteredCities.map((city) => (
                                    <button
                                        key={city.id}
                                        className={`${styles.dropdownItem} ${selectedCity?.id === city.id ? styles.selected : ''}`}
                                        onClick={() => handleCitySelect(city)}
                                    >
                                        🏙️ {city.name}
                                    </button>
                                ))
                            ) : (
                                <div className={styles.noResults}>Sonuç bulunamadı</div>
                            )}
                        </div>
                    )}
                </div>

                {/* İlçe Seçici */}
                <div className={styles.selectWrapper} ref={districtRef}>
                    <label className={styles.label}>İlçe</label>
                    <div className={`${styles.selectBox} ${!selectedCity ? styles.disabled : ''}`}>
                        <input
                            type="text"
                            value={districtSearch}
                            onChange={(e) => {
                                setDistrictSearch(e.target.value);
                                setShowDistrictDropdown(true);
                            }}
                            onFocus={() => selectedCity && setShowDistrictDropdown(true)}
                            placeholder={selectedCity ? "İlçe ara..." : "Önce şehir seç"}
                            className={styles.searchInput}
                            disabled={!selectedCity}
                        />
                        <span className={styles.arrow}>▼</span>
                    </div>

                    {showDistrictDropdown && selectedCity && (
                        <div className={styles.dropdown}>
                            {filteredDistricts.length > 0 ? (
                                filteredDistricts.map((district) => (
                                    <button
                                        key={district.id}
                                        className={`${styles.dropdownItem} ${selectedDistrict?.id === district.id ? styles.selected : ''}`}
                                        onClick={() => handleDistrictSelect(district)}
                                    >
                                        📍 {district.name}
                                    </button>
                                ))
                            ) : (
                                <div className={styles.noResults}>Sonuç bulunamadı</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Seçilen konum özeti */}
            {selectedCity && selectedDistrict && (
                <div className={styles.selectedSummary}>
                    <span className={styles.checkIcon}>✅</span>
                    <span>{selectedDistrict.name}, {selectedCity.name}</span>
                    <button
                        className={styles.clearBtn}
                        onClick={() => {
                            setSelectedCity(null);
                            setSelectedDistrict(null);
                            setCitySearch('');
                            setDistrictSearch('');
                            onLocationSelect && onLocationSelect(null);
                        }}
                    >
                        Değiştir
                    </button>
                </div>
            )}
        </div>
    );
}
