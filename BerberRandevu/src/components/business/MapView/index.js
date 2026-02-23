"use client";

import { useEffect, useRef } from 'react';
import styles from './MapView.module.css';

// Leaflet sadece client-side'da yüklenmeli
let L = null;

export default function MapView({
    businesses = [],
    userLocation = null,
    gender = 'male',
    onMarkerClick,
    center = null,
    zoom = 12
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    // Leaflet'i dinamik olarak yükle
    useEffect(() => {
        const loadLeaflet = async () => {
            if (typeof window !== 'undefined' && !L) {
                L = (await import('leaflet')).default;

                // Leaflet CSS
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);

                // Fix default marker icon issue
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });
            }
            initMap();
        };

        loadLeaflet();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Haritayı başlat
    const initMap = () => {
        if (!mapRef.current || !L || mapInstanceRef.current) return;

        const defaultCenter = center ||
            (userLocation ? [userLocation.lat, userLocation.lng] : [41.0082, 28.9784]);

        mapInstanceRef.current = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView(defaultCenter, zoom);

        // OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(mapInstanceRef.current);

        updateMarkers();
    };

    // Marker'ları güncelle
    useEffect(() => {
        if (mapInstanceRef.current && L) {
            updateMarkers();
        }
    }, [businesses, userLocation, gender]);

    const updateMarkers = () => {
        if (!mapInstanceRef.current || !L) return;

        // Eski marker'ları temizle
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Kullanıcı konumu marker'ı
        if (userLocation) {
            const userIcon = L.divIcon({
                html: `<div class="${styles.userMarker} ${styles[gender]}">📍</div>`,
                className: styles.userMarkerContainer,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });

            const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                .addTo(mapInstanceRef.current)
                .bindPopup('<strong>Konumunuz</strong>');

            markersRef.current.push(userMarker);
        }

        // İşletme marker'ları
        businesses.forEach(business => {
            const { coordinates, name, type, rating, district } = business;
            if (!coordinates?.lat || !coordinates?.lng) return;

            const icon = type === 'barber' ? '💈' :
                type === 'nail_art' ? '💅' :
                    type === 'beauty_center' ? '🏪' : '✨';

            const businessIcon = L.divIcon({
                html: `<div class="${styles.businessMarker} ${styles[gender]}">${icon}</div>`,
                className: styles.businessMarkerContainer,
                iconSize: [36, 36],
                iconAnchor: [18, 36]
            });

            const marker = L.marker([coordinates.lat, coordinates.lng], { icon: businessIcon })
                .addTo(mapInstanceRef.current)
                .bindPopup(`
                    <div class="${styles.popup}">
                        <strong>${name}</strong><br/>
                        <span>⭐ ${rating} • ${district}</span>
                    </div>
                `);

            marker.on('click', () => {
                onMarkerClick?.(business);
            });

            markersRef.current.push(marker);
        });

        // Tüm marker'ları görecek şekilde zoom ayarla
        if (markersRef.current.length > 1) {
            const group = L.featureGroup(markersRef.current);
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }
    };

    // Merkezi güncelle
    useEffect(() => {
        if (mapInstanceRef.current && center) {
            mapInstanceRef.current.setView([center.lat, center.lng], zoom);
        }
    }, [center, zoom]);

    return (
        <div className={`${styles.mapContainer} ${styles[gender]}`}>
            <div ref={mapRef} className={styles.map} />
        </div>
    );
}
