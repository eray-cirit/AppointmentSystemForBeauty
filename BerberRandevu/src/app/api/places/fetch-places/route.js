import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firebase';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';

/**
 * Google Places API (New) - Text Search endpoint
 * Berber, kuaför, güzellik salonlarını arar ve Firebase'e kaydeder
 */

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

// İşletme tipine göre arama terimleri
const SEARCH_QUERIES = {
    barber: ['berber', 'erkek kuaförü', 'barber shop'],
    hairdresser: ['kuaför', 'kadın kuaförü', 'hair salon'],
    beauty: ['güzellik salonu', 'güzellik merkezi', 'beauty salon'],
    nail: ['nail art', 'tırnak salonu', 'manikür pedikür']
};

// Places API'den işletmeleri çek
async function searchPlaces(searchQuery, location, radius = 5000) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
        throw new Error('GOOGLE_PLACES_API_KEY not configured');
    }

    const requestBody = {
        textQuery: searchQuery,
        locationBias: {
            circle: {
                center: {
                    latitude: location.lat,
                    longitude: location.lng
                },
                radius: radius
            }
        },
        languageCode: 'tr',
        regionCode: 'TR',
        maxResultCount: 20
    };

    const response = await fetch(PLACES_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.regularOpeningHours,places.photos,places.types'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Places API error:', error);
        throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();
    return data.places || [];
}

// İşletmeyi Firebase'e kaydet
async function saveBusinessToFirestore(place, city, district, type, gender) {
    const businessId = place.id.replace(/[^a-zA-Z0-9]/g, '_');

    const businessData = {
        name: place.displayName?.text || 'İsimsiz',
        address: place.formattedAddress || '',
        city: city,
        district: district,
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0,
        type: type,
        gender: gender,
        rating: place.rating || 0,
        reviewCount: place.userRatingCount || 0,
        phone: place.nationalPhoneNumber || '',
        placeId: place.id,
        photos: place.photos?.slice(0, 5).map(p => p.name) || [],
        openingHours: place.regularOpeningHours?.weekdayDescriptions || [],
        source: 'google_places',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'businesses', businessId), businessData, { merge: true });
    return businessData;
}

// Belirli bir konum için kaç işletme olduğunu kontrol et
async function getExistingCount(city, district) {
    const q = query(
        collection(db, 'businesses'),
        where('city', '==', city),
        where('district', '==', district)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city') || 'İstanbul';
        const district = searchParams.get('district') || 'Kadıköy';
        const type = searchParams.get('type') || 'barber'; // barber, hairdresser, beauty, nail
        const lat = parseFloat(searchParams.get('lat') || '40.9819');
        const lng = parseFloat(searchParams.get('lng') || '29.0618');
        const forceRefresh = searchParams.get('refresh') === 'true';

        // Önce mevcut veri var mı kontrol et (cache)
        if (!forceRefresh) {
            const existingCount = await getExistingCount(city, district);
            if (existingCount > 0) {
                return NextResponse.json({
                    success: true,
                    message: `${existingCount} işletme zaten mevcut`,
                    cached: true,
                    count: existingCount
                });
            }
        }

        // Arama terimlerini al
        const queries = SEARCH_QUERIES[type] || SEARCH_QUERIES.barber;
        const gender = type === 'barber' ? 'male' : 'female';

        let allBusinesses = [];

        // Her arama terimi için Places API'ye istek at
        for (const searchQuery of queries) {
            const fullQuery = `${searchQuery} ${district} ${city}`;
            console.log(`Searching: ${fullQuery}`);

            const places = await searchPlaces(fullQuery, { lat, lng });

            for (const place of places) {
                try {
                    const business = await saveBusinessToFirestore(place, city, district, type, gender);
                    allBusinesses.push(business);
                } catch (saveError) {
                    console.error('Error saving business:', saveError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `${allBusinesses.length} işletme bulundu ve kaydedildi`,
            count: allBusinesses.length,
            businesses: allBusinesses.slice(0, 10) // İlk 10'u göster
        });

    } catch (error) {
        console.error('Fetch places error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
