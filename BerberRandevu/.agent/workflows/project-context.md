---
description: Ciryt projesi hakkında temel bilgiler ve context
---

# Ciryt - Türkiye'nin En Büyük Güzellik ve Randevu Platformu 🇹🇷

> **VİZYON:** Türkiye'nin en büyük randevu sistemi olacak. Her şey en profesyonel şekilde ve en yeni teknikler kullanılarak yapılmalı.

## Proje Özeti
Ciryt, Türkiye'nin güzellik ve randevu platformudur. Berber (erkek) ve kuaför/güzellik salonu (kadın) için tek bir platform.

## Teknoloji Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: CSS Modules + Vanilla CSS (TailwindCSS yok!)
- **Dil**: JavaScript (TypeScript değil)
- **Auth**: NextAuth.js (Google OAuth + Credentials)
- **Database**: Firebase Firestore
- **APIs**: Google Places API (New), Geocoding API
- **Maps**: Leaflet (harita için)

## Proje Yapısı
```
src/
├── app/
│   ├── page.js          # Ana sayfa (cinsiyet toggle'lı)
│   ├── page.module.css  # Ana sayfa stilleri
│   ├── globals.css      # Global stiller ve değişkenler
│   ├── layout.js        # Root layout
│   ├── giris/           # Giriş sayfaları (erkek/kadin)
│   ├── kayit/           # Kayıt sayfaları (erkek/kadin)
│   ├── kesfet/          # Keşfet sayfası (auth required)
│   ├── api/             # API Routes
│   │   ├── businesses/  # İşletme verileri (Firebase)
│   │   ├── locations/   # İl/İlçe verileri
│   │   └── places/      # Google Places API
│   └── yakinda/         # Coming soon placeholder
├── components/
│   └── common/
│       ├── Navbar/      # Üst navigasyon
│       └── Footer/      # Alt bilgi
├── data/
│   └── turkey-locations.json  # 12 şehir, 100+ ilçe
└── lib/
    └── firebase/        # Firebase config
```

## Marka Renkleri 🎨
> **ÖNEMLİ:** Marka rengi MOR değil! Ana marka rengi turuncu-kahve-mürdüm karışımı tonlardır.

### Tema Renkleri
- **Erkek (Male)**: Sıcak terracotta tonları (#bd6326, #d4793a, #a04f1a)
- **Kadın (Female)**: Mürdüm tonları (#72223f, #8a3352, #5a1a32)
- **Backgrounds**: #FEF7F0 (erkek), #FDF5F7 (kadın)

### VIP Toggle Renkleri
**Erkek (Beyefendi):** `#a55520 → #bd6326` ve `#bd6326 → #d4793a`
**Kadın (Hanımefendi):** `#8a3352 → #5a1a32` ve `#9c3d5c → #72223f`

## Konum Sistemi
- **Yemeksepeti tarzı**: Giriş yaparken 1 kere konum sorulur
- **Seçenekler**: GPS ile konum al veya manuel şehir/ilçe seç
- **İşletme sıralaması**: Konuma göre en yakından en uzağa

## Desteklenen Şehirler (12)
İstanbul, Ankara, İzmir, Antalya, Bursa, Adana, Konya, Gaziantep, Mersin, Kayseri, **Edirne**, **Tekirdağ**

## Önemli Özellikler
1. **Cinsiyet Toggle**: Erkek/Kadın seçimine göre tema ve içerik değişir
2. **VIP Toggle**: Giriş yapmış kullanıcılar için özel hoşgeldin mesajı
3. **Liquid Glass Tema**: Blur efektleri, cam görünümü
4. **Google OAuth**: Google ile giriş/kayıt
5. **Gerçek İşletme Verisi**: Google Places API
6. **Konum bazlı arama**: En yakın işletmeler

## Kalite Standartları
- ✅ Her özellik en yeni tekniklerle
- ✅ Profesyonel kod yapısı
- ✅ Mobile-first tasarım
- ✅ Hızlı yükleme süreleri
- ✅ SEO optimizasyonu

## Git Repo
- GitHub: eray-cirit/BerberRandevu
- Branch: main

## Domain
- Hedef: ciryt.com
