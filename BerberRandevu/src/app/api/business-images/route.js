import { NextResponse } from 'next/server';

/**
 * Unsplash API - Stok Fotoğraf Çekme
 * Demo için ücretsiz stok fotoğraflar
 * Sonra Google Places API'ye geçilecek
 */

// Unsplash Access Key (demo için)
const UNSPLASH_ACCESS_KEY = 'demo_key'; // Production'da .env'den alınacak

// Kategori bazlı arama terimleri - çeşitlilik için
const CATEGORY_KEYWORDS = {
    'berber': ['barber shop', 'barbershop interior', 'men haircut', 'barber cutting hair', 'traditional barber'],
    'erkek_guzellik': ['men grooming', 'men spa', 'male wellness', 'men facial', 'grooming salon'],
    'sakal': ['beard trim', 'beard styling', 'mustache grooming', 'barber beard', 'beard care'],
    'kuafor': ['hair salon', 'hairdresser', 'women haircut', 'hairstylist', 'beauty salon hair'],
    'guzellik_merkezi': ['beauty center', 'spa treatment', 'beauty salon', 'facial treatment', 'wellness spa'],
    'nail_art': ['nail salon', 'manicure', 'nail art', 'pedicure salon', 'nail polish'],
    'makyaj': ['makeup artist', 'makeup studio', 'beauty makeup', 'cosmetics', 'makeup application'],
    'cilt_bakimi': ['skin care', 'facial spa', 'dermatology', 'skin treatment', 'beauty facial']
};

// Demo Unsplash görselleri (API key olmadan da çalışsın)
const DEMO_IMAGES = {
    'berber': [
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
        'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
        'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    ],
    'erkek_guzellik': [
        'https://images.unsplash.com/photo-1540555700478-4be289fbec8d?w=400',
        'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400',
        'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400',
    ],
    'sakal': [
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
        'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    ],
    'kuafor': [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
        'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400',
        'https://images.unsplash.com/photo-1633681122611-ea01e798f2f1?w=400',
        'https://images.unsplash.com/photo-1562322140-8baeacacf948?w=400',
        'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400',
    ],
    'guzellik_merkezi': [
        'https://images.unsplash.com/photo-1540555700478-4be289fbec8d?w=400',
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
        'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400',
    ],
    'nail_art': [
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
        'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=400',
        'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400',
        'https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=400',
        'https://images.unsplash.com/photo-1610992015732-2449b0bb0d6e?w=400',
    ],
    'makyaj': [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
        'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    ],
    'cilt_bakimi': [
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
        'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400',
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400',
        'https://images.unsplash.com/photo-1596178060810-72660ee71848?w=400',
    ]
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'berber';
        const count = parseInt(searchParams.get('count')) || 6;

        // Demo modda - önceden tanımlanmış görselleri kullan
        const categoryImages = DEMO_IMAGES[category] || DEMO_IMAGES['berber'];

        // Rastgele sıralama ile çeşitlilik sağla
        const shuffled = [...categoryImages].sort(() => Math.random() - 0.5);
        const selectedImages = shuffled.slice(0, Math.min(count, shuffled.length));

        return NextResponse.json({
            success: true,
            category,
            count: selectedImages.length,
            images: selectedImages,
            source: 'unsplash_demo'
        });

    } catch (error) {
        console.error('Business Images API Error:', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            images: []
        }, { status: 500 });
    }
}
