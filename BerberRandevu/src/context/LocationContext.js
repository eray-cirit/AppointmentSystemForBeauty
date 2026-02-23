"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext(null);

// Türkiye'nin büyük şehirleri
const TURKISH_CITIES = [
    { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
    { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
    { name: 'İzmir', lat: 38.4192, lng: 27.1287 },
    { name: 'Bursa', lat: 40.1885, lng: 29.0610 },
    { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
    { name: 'Adana', lat: 37.0000, lng: 35.3213 },
    { name: 'Konya', lat: 37.8746, lng: 32.4932 },
    { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
    { name: 'Mersin', lat: 36.8121, lng: 34.6415 },
    { name: 'Diyarbakır', lat: 37.9144, lng: 40.2306 },
];

export function LocationProvider({ children }) {
    const [location, setLocation] = useState({
        city: 'İstanbul',
        lat: 41.0082,
        lng: 28.9784,
        source: 'default', // 'gps' | 'manual' | 'default'
        loading: false,
        error: null
    });

    // GPS ile konum al
    const detectLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocation(prev => ({
                ...prev,
                error: 'Tarayıcınız konum servisini desteklemiyor'
            }));
            return;
        }

        setLocation(prev => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Reverse geocoding - en yakın şehri bul
                const nearestCity = findNearestCity(latitude, longitude);

                setLocation({
                    city: nearestCity.name,
                    lat: latitude,
                    lng: longitude,
                    source: 'gps',
                    loading: false,
                    error: null
                });
            },
            (error) => {
                let errorMessage = 'Konum alınamadı';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Konum izni reddedildi';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Konum bilgisi mevcut değil';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Konum isteği zaman aşımına uğradı';
                        break;
                }
                setLocation(prev => ({
                    ...prev,
                    loading: false,
                    error: errorMessage
                }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 dakika cache
            }
        );
    }, []);

    // En yakın şehri bul
    function findNearestCity(lat, lng) {
        let nearest = TURKISH_CITIES[0];
        let minDistance = Infinity;

        for (const city of TURKISH_CITIES) {
            const distance = Math.sqrt(
                Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearest = city;
            }
        }

        return nearest;
    }

    // Şehri manuel değiştir
    const setCity = useCallback((cityName) => {
        const city = TURKISH_CITIES.find(c => c.name === cityName);
        if (city) {
            setLocation({
                city: city.name,
                lat: city.lat,
                lng: city.lng,
                source: 'manual',
                loading: false,
                error: null
            });
        }
    }, []);

    // Sayfa yüklendiğinde localStorage'dan oku
    useEffect(() => {
        const saved = localStorage.getItem('userLocation');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setLocation(prev => ({ ...prev, ...parsed, loading: false }));
            } catch (e) {
                // Invalid JSON, ignore
            }
        }
    }, []);

    // Konum değişince localStorage'a kaydet
    useEffect(() => {
        if (location.source !== 'default') {
            localStorage.setItem('userLocation', JSON.stringify({
                city: location.city,
                lat: location.lat,
                lng: location.lng,
                source: location.source
            }));
        }
    }, [location]);

    return (
        <LocationContext.Provider value={{
            ...location,
            cities: TURKISH_CITIES,
            detectLocation,
            setCity
        }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}

export default LocationContext;
