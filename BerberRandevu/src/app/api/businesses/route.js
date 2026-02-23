import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore';

// Haversine formülü - iki koordinat arası mesafe (km)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Firebase'den işletmeleri çek
async function getBusinessesFromFirebase(city, gender) {
    try {
        const businessesRef = collection(db, 'businesses');
        let q;

        if (city && gender) {
            // Hem şehir hem cinsiyet filtresi
            const genderFilter = gender === 'male' ? 'male' : 'female';
            q = query(
                businessesRef,
                where('city', '==', city),
                where('gender', 'in', [genderFilter, 'unisex'])
            );
        } else if (city) {
            q = query(businessesRef, where('city', '==', city));
        } else {
            q = query(businessesRef, firestoreLimit(100));
        }

        const snapshot = await getDocs(q);
        const businesses = [];

        snapshot.forEach((doc) => {
            businesses.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return businesses;
    } catch (error) {
        console.error('Firebase fetch error:', error);
        return [];
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    // Query parametreleri
    const city = searchParams.get('city');
    const gender = searchParams.get('gender'); // male | female
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = parseFloat(searchParams.get('radius')) || 50; // default 50km
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;

    try {
        // Firebase'den işletmeleri al
        let businesses = await getBusinessesFromFirebase(city, gender);

        // Cinsiyet filtreleme (client-side ek filtre)
        if (gender) {
            businesses = businesses.filter(biz =>
                biz.gender === gender || biz.gender === 'unisex'
            );
        }

        // Konum bazlı filtreleme ve sıralama
        if (!isNaN(lat) && !isNaN(lng)) {
            businesses = businesses.map(biz => ({
                ...biz,
                distance: calculateDistance(lat, lng, biz.lat || 0, biz.lng || 0),
                // Kesfet sayfası için uyumluluk
                coordinates: {
                    lat: biz.lat || 0,
                    lng: biz.lng || 0
                }
            }));

            // Mesafe filtreleme
            businesses = businesses.filter(biz => biz.distance <= radius);

            // Mesafeye göre sıralama
            businesses.sort((a, b) => a.distance - b.distance);
        } else {
            // Konum yoksa rating'e göre sırala
            businesses.sort((a, b) => (b.rating || 0) - (a.rating || 0));

            // Kesfet uyumluluğu için coordinates ekle
            businesses = businesses.map(biz => ({
                ...biz,
                coordinates: {
                    lat: biz.lat || 0,
                    lng: biz.lng || 0
                }
            }));
        }

        // Pagination
        const totalCount = businesses.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedBusinesses = businesses.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            data: paginatedBusinesses,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: endIndex < totalCount
            }
        });

    } catch (error) {
        console.error('Business API Error:', error);
        return NextResponse.json(
            { success: false, error: 'İşletmeler yüklenirken hata oluştu' },
            { status: 500 }
        );
    }
}
