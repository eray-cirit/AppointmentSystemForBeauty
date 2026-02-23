import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Türkiye il/ilçe verileri API
 * Autocomplete için kullanılır
 */

const DATA_FILE = path.join(process.cwd(), 'data', 'turkey-locations.json');

let cachedData = null;

async function getLocationsData() {
    if (cachedData) return cachedData;

    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        cachedData = JSON.parse(data);
        return cachedData;
    } catch (error) {
        console.error('Error reading locations data:', error);
        return { cities: [] };
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const cityId = searchParams.get('cityId');
    const type = searchParams.get('type'); // 'cities' | 'districts' | 'all'

    try {
        const data = await getLocationsData();

        // Sadece şehirleri getir
        if (type === 'cities') {
            let cities = data.cities.map(c => ({
                id: c.id,
                name: c.name,
                lat: c.lat,
                lng: c.lng
            }));

            if (query) {
                cities = cities.filter(c =>
                    c.name.toLowerCase().includes(query)
                );
            }

            return NextResponse.json({
                success: true,
                data: cities
            });
        }

        // Belirli bir şehrin ilçelerini getir
        if (type === 'districts' && cityId) {
            const city = data.cities.find(c => c.id === cityId);
            if (!city) {
                return NextResponse.json({
                    success: false,
                    error: 'Şehir bulunamadı'
                }, { status: 404 });
            }

            let districts = city.districts || [];

            if (query) {
                districts = districts.filter(d =>
                    d.name.toLowerCase().includes(query)
                );
            }

            return NextResponse.json({
                success: true,
                city: { id: city.id, name: city.name },
                data: districts
            });
        }

        // Tüm ilçeleri ara (autocomplete için)
        if (query) {
            const results = [];

            for (const city of data.cities) {
                // Şehir adı eşleşiyor mu?
                if (city.name.toLowerCase().includes(query)) {
                    results.push({
                        type: 'city',
                        id: city.id,
                        name: city.name,
                        fullName: city.name,
                        lat: city.lat,
                        lng: city.lng
                    });
                }

                // İlçe adı eşleşiyor mu?
                for (const district of city.districts || []) {
                    if (district.name.toLowerCase().includes(query)) {
                        results.push({
                            type: 'district',
                            id: district.id,
                            name: district.name,
                            fullName: `${district.name}, ${city.name}`,
                            cityId: city.id,
                            cityName: city.name,
                            lat: district.lat,
                            lng: district.lng
                        });
                    }
                }
            }

            // En fazla 10 sonuç göster
            return NextResponse.json({
                success: true,
                data: results.slice(0, 10)
            });
        }

        // Query yoksa tüm şehirleri döndür
        return NextResponse.json({
            success: true,
            data: data.cities.map(c => ({
                id: c.id,
                name: c.name,
                lat: c.lat,
                lng: c.lng,
                districtCount: c.districts?.length || 0
            }))
        });

    } catch (error) {
        console.error('Locations API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Konum verileri yüklenemedi' },
            { status: 500 }
        );
    }
}
