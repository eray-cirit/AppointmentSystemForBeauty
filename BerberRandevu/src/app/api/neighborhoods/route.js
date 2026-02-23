import { NextResponse } from 'next/server';

/**
 * Mahalle API - OpenStreetMap Nominatim
 * İlçeye göre mahalleleri getirir
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get('district');
        const city = searchParams.get('city');

        if (!district || !city) {
            return NextResponse.json({
                success: false,
                error: 'district ve city parametreleri gerekli'
            }, { status: 400 });
        }

        // OpenStreetMap Nominatim API - mahalle araması
        // "Mahallesi" kelimesiyle birlikte ilçe ve şehir ara
        const searchQuery = `Mahallesi, ${district}, ${city}`;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=50&accept-language=tr`,
            {
                headers: {
                    'User-Agent': 'Ciryt-App/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Nominatim API hatası');
        }

        const data = await response.json();

        // Sonuçlardan mahalle bilgilerini çıkar
        const neighborhoods = [];
        const seenNames = new Set();

        for (const result of data) {
            const addr = result.address;
            // Mahalle bilgisi varsa ekle
            const hood = addr?.suburb || addr?.neighbourhood || addr?.quarter || result.name;

            // Sadece doğru ilçedekileri al
            const resultDistrict = addr?.town || addr?.county || addr?.city_district;

            if (hood && !seenNames.has(hood)) {
                // İlçe eşleşmesi kontrolü (case-insensitive)
                const districtMatch = !resultDistrict ||
                    resultDistrict.toLowerCase().includes(district.toLowerCase()) ||
                    district.toLowerCase().includes(resultDistrict.toLowerCase());

                if (districtMatch) {
                    seenNames.add(hood);
                    neighborhoods.push({
                        id: `nominatim-${result.place_id}`,
                        name: hood,
                        lat: parseFloat(result.lat),
                        lng: parseFloat(result.lon)
                    });
                }
            }
        }

        // Eğer sonuç bulunamadıysa, "Merkez" ekle
        if (neighborhoods.length === 0) {
            // İlçe koordinatını al
            const districtResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(district + ', ' + city)}&format=json&limit=1&accept-language=tr`,
                { headers: { 'User-Agent': 'Ciryt-App/1.0' } }
            );
            const districtData = await districtResponse.json();

            neighborhoods.push({
                id: 'center',
                name: 'Merkez',
                lat: districtData[0]?.lat ? parseFloat(districtData[0].lat) : null,
                lng: districtData[0]?.lon ? parseFloat(districtData[0].lon) : null
            });
        }

        // Alfabetik sırala
        neighborhoods.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

        return NextResponse.json({
            success: true,
            district,
            city,
            count: neighborhoods.length,
            data: neighborhoods
        });

    } catch (error) {
        console.error('Neighborhoods API Error:', error);

        // Fallback: Merkez döndür
        const { searchParams } = new URL(request.url);
        return NextResponse.json({
            success: true,
            district: searchParams.get('district') || '',
            city: searchParams.get('city') || '',
            count: 1,
            data: [{
                id: 'fallback',
                name: 'Merkez',
                lat: null,
                lng: null
            }]
        });
    }
}
