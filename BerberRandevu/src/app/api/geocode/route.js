'use server';

import { NextResponse } from 'next/server';

/**
 * Reverse Geocoding API
 * Koordinatları adrese çevirir
 * OpenStreetMap Nominatim API kullanıyor (ücretsiz)
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        if (!lat || !lng) {
            return NextResponse.json({
                success: false,
                error: 'lat ve lng parametreleri gerekli'
            }, { status: 400 });
        }

        // OpenStreetMap Nominatim API
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=tr`,
            {
                headers: {
                    'User-Agent': 'Ciryt-App/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Geocoding API hatası');
        }

        const data = await response.json();

        if (!data || !data.address) {
            return NextResponse.json({
                success: false,
                error: 'Adres bulunamadı'
            }, { status: 404 });
        }

        // Türkiye lokasyon bilgilerini çıkar
        const address = data.address;

        // Şehir (il)
        const city = address.province || address.city || address.state || '';

        // İlçe
        const district = address.county || address.town || address.municipality || '';

        // Mahalle
        const neighborhood = address.neighbourhood || address.suburb || address.quarter || address.residential || '';

        // Cadde/Sokak
        const street = address.road || address.street || '';

        return NextResponse.json({
            success: true,
            data: {
                city,
                district,
                neighborhood,
                street,
                fullAddress: data.display_name,
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            }
        });
    } catch (error) {
        console.error('Geocoding hatası:', error);
        return NextResponse.json({
            success: false,
            error: 'Konum bilgisi alınamadı'
        }, { status: 500 });
    }
}
