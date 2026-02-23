'use client';

import { useState, useEffect } from 'react';
import styles from './LocationOnboarding.module.css';

/**
 * Konum Onboarding Modal
 * Site açıldığında gösterilir
 * Adım adım: Şehir → İlçe → Mahalle (hepsi liste seçimi)
 * GPS ile otomatik konum algılama
 */
export default function LocationOnboarding({ isOpen, onComplete, gender }) {
    const [step, setStep] = useState(1); // 1: city, 2: district, 3: neighborhood
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [loading, setLoading] = useState(true);

    // GPS states
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState('');

    // Şehirleri yükle
    useEffect(() => {
        if (!isOpen) return;

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
    }, [isOpen]);

    // Şehir seçildiğinde ilçeleri yükle
    useEffect(() => {
        if (!selectedCity) return;

        async function loadDistricts() {
            setLoading(true);
            try {
                const res = await fetch(`/api/locations?type=districts&cityId=${selectedCity.id}`);
                const data = await res.json();
                if (data.success) {
                    setDistricts(data.data);
                }
            } catch (error) {
                console.error('İlçeler yüklenemedi:', error);
            } finally {
                setLoading(false);
            }
        }
        loadDistricts();
    }, [selectedCity]);

    // İlçe seçildiğinde mahalleleri yükle
    useEffect(() => {
        if (!selectedDistrict || !selectedCity) return;

        async function loadNeighborhoods() {
            setLoading(true);
            try {
                const res = await fetch(`/api/neighborhoods?district=${encodeURIComponent(selectedDistrict.name)}&city=${encodeURIComponent(selectedCity.name)}`);
                const data = await res.json();
                if (data.success) {
                    setNeighborhoods(data.data);
                }
            } catch (error) {
                console.error('Mahalleler yüklenemedi:', error);
                setNeighborhoods([{ id: 'fallback', name: 'Merkez', lat: null, lng: null }]);
            } finally {
                setLoading(false);
            }
        }
        loadNeighborhoods();
    }, [selectedDistrict, selectedCity]);

    // GPS ile konum al
    const handleGPSLocation = async () => {
        setGpsError('');
        setGpsLoading(true);

        if (!navigator.geolocation) {
            setGpsError('Tarayıcınız konum özelliğini desteklemiyor');
            setGpsLoading(false);
            return;
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 30000,
                    maximumAge: 60000
                });
            });

            const { latitude, longitude } = position.coords;

            const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Adres bulunamadı');
            }

            const { city, district, neighborhood: hood } = data.data;

            onComplete({
                city: city || 'Bilinmiyor',
                cityId: null,
                district: district || 'Bilinmiyor',
                districtId: null,
                neighborhood: hood || 'Merkez',
                lat: latitude,
                lng: longitude,
                isGPS: true
            });

        } catch (error) {
            console.error('GPS hatası:', error);

            if (error.code === 1) {
                setGpsError('Konum izni verilmedi. Manuel seçim yapabilirsiniz.');
            } else if (error.code === 2) {
                setGpsError('Konum bilgisi alınamadı. Lütfen tekrar deneyin.');
            } else if (error.code === 3) {
                setGpsError('Konum isteği zaman aşımına uğradı.');
            } else {
                setGpsError(error.message || 'Konum alınamadı. Manuel seçim yapabilirsiniz.');
            }
        } finally {
            setGpsLoading(false);
        }
    };

    // Şehir seç
    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setSearchQuery('');
        setStep(2);
    };

    // İlçe seç
    const handleDistrictSelect = (district) => {
        setSelectedDistrict(district);
        setSearchQuery('');
        setStep(3);
    };

    // Mahalle seç ve tamamla
    const handleNeighborhoodSelect = (neighborhood) => {
        onComplete({
            city: selectedCity.name,
            cityId: selectedCity.id,
            district: selectedDistrict.name,
            districtId: selectedDistrict.id,
            neighborhood: neighborhood.name,
            lat: neighborhood.lat || selectedDistrict.lat,
            lng: neighborhood.lng || selectedDistrict.lng
        });
    };

    // Geri git
    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setSelectedCity(null);
            setDistricts([]);
        } else if (step === 3) {
            setStep(2);
            setSelectedDistrict(null);
            setNeighborhoods([]);
        }
        setSearchQuery('');
        setGpsError('');
    };

    // Filtrelenmiş liste
    const getFilteredItems = () => {
        const query = searchQuery.toLowerCase();
        if (step === 1) {
            return cities.filter(c => c.name.toLowerCase().includes(query));
        } else if (step === 2) {
            return districts.filter(d => d.name.toLowerCase().includes(query));
        } else if (step === 3) {
            return neighborhoods.filter(n => n.name.toLowerCase().includes(query));
        }
        return [];
    };

    const filteredItems = getFilteredItems();
    const themeClass = gender === 'male' ? styles.male : styles.female;

    if (!isOpen) return null;

    return (
        <div className={`${styles.overlay} ${themeClass}`}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    {step > 1 && (
                        <button className={styles.backBtn} onClick={handleBack}>
                            ←
                        </button>
                    )}
                    <div className={styles.headerContent}>
                        <h2 className={styles.title}>
                            {step === 1 && '🏙️ Şehrini Seç'}
                            {step === 2 && '📍 İlçeni Seç'}
                            {step === 3 && '🏠 Mahalleni Seç'}
                        </h2>
                        <p className={styles.subtitle}>
                            {step === 1 && 'Yakınındaki işletmeleri gösterelim'}
                            {step === 2 && selectedCity?.name}
                            {step === 3 && `${selectedDistrict?.name}, ${selectedCity?.name}`}
                        </p>
                    </div>
                </div>

                {/* Progress - 3 adım */}
                <div className={styles.progress}>
                    <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`}>1</div>
                    <div className={`${styles.progressLine} ${step >= 2 ? styles.active : ''}`}></div>
                    <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}>2</div>
                    <div className={`${styles.progressLine} ${step >= 3 ? styles.active : ''}`}></div>
                    <div className={`${styles.progressStep} ${step >= 3 ? styles.active : ''}`}>3</div>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* GPS Butonu - Sadece ilk adımda göster */}
                    {step === 1 && (
                        <div className={styles.gpsSection}>
                            <button
                                className={styles.gpsButton}
                                onClick={handleGPSLocation}
                                disabled={gpsLoading}
                            >
                                {gpsLoading ? (
                                    <>
                                        <span className={styles.gpsSpinner}></span>
                                        Konum alınıyor...
                                    </>
                                ) : (
                                    <>
                                        📍 Konumumu Otomatik Algıla
                                    </>
                                )}
                            </button>
                            {gpsError && (
                                <p className={styles.gpsError}>{gpsError}</p>
                            )}
                            <div className={styles.divider}>
                                <span>veya manuel seçin</span>
                            </div>
                        </div>
                    )}

                    {/* Arama ve Liste */}
                    <div className={styles.searchBox}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                                step === 1 ? "Şehir ara..." :
                                    step === 2 ? "İlçe ara..." :
                                        "Mahalle ara..."
                            }
                            className={styles.searchInput}
                            autoFocus={step !== 1}
                        />
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <span>Yükleniyor...</span>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    className={styles.listItem}
                                    onClick={() => {
                                        if (step === 1) handleCitySelect(item);
                                        else if (step === 2) handleDistrictSelect(item);
                                        else handleNeighborhoodSelect(item);
                                    }}
                                >
                                    <span className={styles.itemIcon}>
                                        {step === 1 ? '🏙️' : step === 2 ? '📍' : '🏠'}
                                    </span>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.arrow}>{step === 3 ? '✓' : '→'}</span>
                                </button>
                            ))}
                            {filteredItems.length === 0 && (
                                <div className={styles.noResults}>
                                    Sonuç bulunamadı
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
