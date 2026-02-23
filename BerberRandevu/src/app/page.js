'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useGender } from '@/context/GenderContext';
import CategorySlider from '@/components/business/CategorySlider';
import styles from './page.module.css';

// Gender için Türkçe label'lar (sadece UI gösterimi)
const GENDER_LABELS = {
  male: { greeting: 'Hoş geldiniz, Beyefendi', label: 'Erkek' },
  female: { greeting: 'Hoş geldiniz, Hanımefendi', label: 'Kadın' }
};

/**
 * Ciryt - Ana Sayfa (Landing Page)
 * 
 * Giriş yapmış kullanıcılar: Kompakt hero + kategorilere göre işletme listesi
 * Giriş yapmamış: Landing page
 */
export default function HomePage() {
  const { gender, handleGenderChange } = useGender();
  const { data: session, status } = useSession();
  const pageRef = useRef(null);
  const [location, setLocation] = useState(null);

  // Giriş yapmış kullanıcının cinsiyetine göre tema ayarla
  const userGender = session?.user?.gender;
  const isLoggedIn = status === 'authenticated' && session?.user;

  // Konum bilgisini localStorage'dan al
  useEffect(() => {
    if (isLoggedIn) {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        try {
          setLocation(JSON.parse(savedLocation));
        } catch (e) {
          console.error('Konum okunamadı');
        }
      }
    }
  }, [isLoggedIn]);

  // Giriş yapmış kullanıcı için cinsiyeti session'dan al
  const effectiveGender = isLoggedIn && userGender ? userGender : gender;

  // Theme class based on gender
  const themeClass = effectiveGender === 'male' ? styles.maleTheme : styles.femaleTheme;

  // VIP mesajları
  const vipMessages = {
    male: { greeting: 'Hoş geldiniz,', title: 'Beyefendi' },
    female: { greeting: 'Hoş geldiniz,', title: 'Hanımefendi' }
  };

  const vipData = userGender === 'female' ? vipMessages.female : vipMessages.male;

  // Demo işletme verileri - Erkekler için (Dikey görseller)
  const maleCategories = [
    {
      title: 'Berberler',
      icon: '💈',
      businesses: [
        { id: 1, name: 'Classic Barber', rating: 4.8, reviewCount: 324, distance: '0.5 km', badge: 'Popüler', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=600&fit=crop' },
        { id: 2, name: 'Modern Cuts', rating: 4.6, reviewCount: 189, distance: '0.8 km', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=600&fit=crop' },
        { id: 3, name: 'Gentleman\'s Club', rating: 4.9, reviewCount: 512, distance: '1.2 km', badge: 'En İyi', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=600&fit=crop' },
        { id: 4, name: 'Style Masters', rating: 4.4, reviewCount: 98, distance: '1.5 km', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=600&fit=crop' },
        { id: 5, name: 'King Barber', rating: 4.7, reviewCount: 256, distance: '2.0 km', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=600&fit=crop' },
        { id: 6, name: 'Royal Cuts', rating: 4.5, reviewCount: 143, distance: '2.3 km', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=600&fit=crop' },
      ]
    },
    {
      title: 'Erkek Güzellik Salonları',
      icon: '✨',
      businesses: [
        { id: 10, name: 'Men\'s Spa', rating: 4.7, reviewCount: 187, distance: '1.0 km', badge: 'Yeni', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec8d?w=400&h=600&fit=crop' },
        { id: 11, name: 'Grooming House', rating: 4.5, reviewCount: 95, distance: '1.4 km', image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&h=600&fit=crop' },
        { id: 12, name: 'Urban Wellness', rating: 4.8, reviewCount: 234, distance: '1.8 km', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' },
        { id: 13, name: 'Prime Care', rating: 4.3, reviewCount: 78, distance: '2.1 km', image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=600&fit=crop' },
        { id: 14, name: 'Elite Grooming', rating: 4.6, reviewCount: 156, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=600&fit=crop' },
      ]
    },
    {
      title: 'Sakal & Bıyık Uzmanları',
      icon: '🧔',
      businesses: [
        { id: 20, name: 'Beard Masters', rating: 4.9, reviewCount: 423, distance: '0.7 km', badge: 'Uzman', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=600&fit=crop' },
        { id: 21, name: 'Ottoman Style', rating: 4.7, reviewCount: 267, distance: '1.1 km', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=600&fit=crop' },
        { id: 22, name: 'Beard Art', rating: 4.6, reviewCount: 189, distance: '1.6 km', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop' },
        { id: 23, name: 'Mustache House', rating: 4.4, reviewCount: 112, distance: '2.0 km', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop' },
      ]
    }
  ];

  // Demo işletme verileri - Kadınlar için (Dikey görseller)
  const femaleCategories = [
    {
      title: 'Kuaförler',
      icon: '💇‍♀️',
      businesses: [
        { id: 100, name: 'Glamour Salon', rating: 4.9, reviewCount: 567, distance: '0.4 km', badge: 'En İyi', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=600&fit=crop' },
        { id: 101, name: 'Hair Studio', rating: 4.7, reviewCount: 321, distance: '0.7 km', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=600&fit=crop' },
        { id: 102, name: 'Beauty House', rating: 4.8, reviewCount: 445, distance: '1.0 km', badge: 'Popüler', image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=600&fit=crop' },
        { id: 103, name: 'Style Queen', rating: 4.5, reviewCount: 198, distance: '1.3 km', image: 'https://images.unsplash.com/photo-1633681122611-ea01e798f2f1?w=400&h=600&fit=crop' },
        { id: 104, name: 'Hair Art', rating: 4.6, reviewCount: 267, distance: '1.6 km', image: 'https://images.unsplash.com/photo-1562322140-8baeacacf948?w=400&h=600&fit=crop' },
        { id: 105, name: 'Belle Coiffure', rating: 4.4, reviewCount: 145, distance: '2.0 km', image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=600&fit=crop' },
      ]
    },
    {
      title: 'Güzellik Merkezleri',
      icon: '💄',
      businesses: [
        { id: 110, name: 'Beauty Center', rating: 4.8, reviewCount: 389, distance: '0.6 km', badge: 'Yeni', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec8d?w=400&h=600&fit=crop' },
        { id: 111, name: 'Spa & Beauty', rating: 4.7, reviewCount: 278, distance: '0.9 km', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=600&fit=crop' },
        { id: 112, name: 'Wellness Hub', rating: 4.9, reviewCount: 512, distance: '1.2 km', image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=600&fit=crop' },
        { id: 113, name: 'Glow Studio', rating: 4.5, reviewCount: 167, distance: '1.5 km', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=600&fit=crop' },
        { id: 114, name: 'Pure Beauty', rating: 4.6, reviewCount: 234, distance: '1.8 km', image: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=600&fit=crop' },
      ]
    },
    {
      title: 'Nail Art & Manikür',
      icon: '💅',
      businesses: [
        { id: 120, name: 'Nail Paradise', rating: 4.9, reviewCount: 456, distance: '0.5 km', badge: 'En İyi', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=600&fit=crop' },
        { id: 121, name: 'Polish Studio', rating: 4.7, reviewCount: 289, distance: '0.8 km', image: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=400&h=600&fit=crop' },
        { id: 122, name: 'Nail Art Pro', rating: 4.8, reviewCount: 378, distance: '1.1 km', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=600&fit=crop' },
        { id: 123, name: 'Color Nails', rating: 4.4, reviewCount: 134, distance: '1.4 km', image: 'https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=400&h=600&fit=crop' },
        { id: 124, name: 'Fancy Nails', rating: 4.6, reviewCount: 212, distance: '1.7 km', image: 'https://images.unsplash.com/photo-1610992015732-2449b0bb0d6e?w=400&h=600&fit=crop' },
      ]
    },
    {
      title: 'Makyaj Uzmanları',
      icon: '👄',
      businesses: [
        { id: 130, name: 'Makeup Artist', rating: 4.8, reviewCount: 345, distance: '0.7 km', badge: 'Uzman', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=600&fit=crop' },
        { id: 131, name: 'Glam Studio', rating: 4.6, reviewCount: 198, distance: '1.0 km', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=600&fit=crop' },
        { id: 132, name: 'Beauty Touch', rating: 4.7, reviewCount: 267, distance: '1.3 km', image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&h=600&fit=crop' },
        { id: 133, name: 'Face Art', rating: 4.5, reviewCount: 156, distance: '1.6 km', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=600&fit=crop' },
      ]
    },
    {
      title: 'Cilt Bakımı & SPA',
      icon: '🧖‍♀️',
      businesses: [
        { id: 140, name: 'Skin Care Plus', rating: 4.9, reviewCount: 423, distance: '0.8 km', badge: 'Premium', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=600&fit=crop' },
        { id: 141, name: 'Relaxation Spa', rating: 4.7, reviewCount: 312, distance: '1.1 km', image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400&h=600&fit=crop' },
        { id: 142, name: 'Zen Wellness', rating: 4.8, reviewCount: 389, distance: '1.4 km', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=600&fit=crop' },
        { id: 143, name: 'Pure Skin', rating: 4.5, reviewCount: 178, distance: '1.7 km', image: 'https://images.unsplash.com/photo-1596178060810-72660ee71848?w=400&h=600&fit=crop' },
      ]
    }
  ];

  const categories = effectiveGender === 'male' ? maleCategories : femaleCategories;

  // Cinsiyete göre özellikler (giriş yapmamış için)
  const maleFeatures = [
    { icon: '💈', title: 'Yakınındaki Berberler', description: 'Konumuna göre en yakın berberleri haritada gör.' },
    { icon: '📅', title: 'Kolay Randevu', description: 'Tek tıkla randevu al.' },
    { icon: '⭐', title: 'Gerçek Yorumlar', description: 'Diğer müşterilerin yorumlarını oku.' },
    { icon: '✂️', title: 'Profesyonel Berberler', description: 'Onaylı ve deneyimli berberler.' }
  ];

  const femaleFeatures = [
    { icon: '💅', title: 'Yakınındaki Salonlar', description: 'Kuaför, güzellik merkezi ve nail art.' },
    { icon: '📅', title: 'Kolay Randevu', description: 'Tek tıkla randevu al.' },
    { icon: '⭐', title: 'Gerçek Yorumlar', description: 'Diğer müşterilerin yorumlarını oku.' },
    { icon: '💄', title: 'Profesyonel Uzmanlar', description: 'Onaylı kuaförler ve güzellik uzmanları.' }
  ];

  const features = effectiveGender === 'male' ? maleFeatures : femaleFeatures;

  // Loading state - session yüklenirken modern loading ekranı
  if (status === 'loading') {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingLogo}>
            <span className={styles.loadingIcon}>✦</span>
          </div>
          <div className={styles.loadingPulse}></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className={`${styles.page} ${themeClass} ${isLoggedIn ? styles.loggedIn : ''}`}>
      {/* Arka Plan */}
      <div className={styles.backgroundGlow}></div>
      <div className={styles.backgroundImage}></div>

      {/* ===================== GİRİŞ YAPMIŞ KULLANICI ===================== */}
      {isLoggedIn ? (
        <>
          {/* VIP Header - Sabit Yukarıda */}
          <div className={styles.vipHeader}>
            <div className={styles.vipCard}>
              <span className={styles.vipGreeting}>
                {GENDER_LABELS[effectiveGender]?.greeting}
              </span>
              {location && (
                <div className={styles.vipLocation}>
                  <span>📍 {location.neighborhood}, {location.district}</span>
                  <Link href="/konum-sec" className={styles.vipChangeBtn}>Değiştir</Link>
                </div>
              )}
            </div>
          </div>

          {/* Kategori Sliderları */}
          <section className={styles.categoriesSection}>
            {categories.map((category, index) => (
              <CategorySlider
                key={index}
                title={category.title}
                icon={category.icon}
                businesses={category.businesses}
                gender={effectiveGender}
              />
            ))}
          </section>
        </>
      ) : (
        /* ===================== GİRİŞ YAPMAMIŞ KULLANICI ===================== */
        <>
          {/* SVG Filters */}
          <svg className={styles.svgFilters} aria-hidden="true">
            <defs>
              <filter id="merge-outline" x="-20%" y="-20%" width="140%" height="140%">
                <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="expanded" />
                <feComposite in="expanded" in2="SourceAlpha" operator="out" result="frameOnly" />
                <feFlood floodColor="#ffffff" floodOpacity="1" result="frameColor" />
                <feComposite in="frameColor" in2="frameOnly" operator="in" result="coloredFrame" />
                <feMerge>
                  <feMergeNode in="coloredFrame" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* Hero Section */}
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              {/* Cinsiyet Toggle */}
              <div className={styles.genderToggle}>
                <div className={`${styles.toggleSlider} ${styles[gender]}`} />
                <button
                  className={`${styles.genderBtn} ${gender === 'male' ? styles.active : ''}`}
                  onClick={() => handleGenderChange('male')}
                >
                  Erkek
                </button>
                <button
                  className={`${styles.genderBtn} ${gender === 'female' ? styles.active : ''}`}
                  onClick={() => handleGenderChange('female')}
                >
                  Kadın
                </button>
              </div>

              <h1 className={styles.heroTitle}>
                <span className={styles.heroTitleLine}>Randevunu</span>
                <span className={styles.heroTitleGradient}>Hemen Al</span>
              </h1>

              <p className={styles.heroDescription}>
                Türkiye'nin güzellik ve randevu platformu.
                <br />
                {effectiveGender === 'male'
                  ? 'Yakınındaki berberleri bul, kolayca randevu al.'
                  : 'Kuaför, güzellik merkezi ve nail art randevusu al.'
                }
              </p>

              <div className={styles.loginCta}>
                <p>Yakınındaki işletmeleri görmek için giriş yap!</p>
                <Link
                  href={effectiveGender === 'male' ? '/giris/erkek' : '/giris/kadin'}
                  className={styles.ctaButton}
                >
                  Giriş Yap
                </Link>
              </div>
            </div>
          </section>

          {/* Özellikler Section */}
          <section className={styles.features}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Neden Ciryt?</h2>
                <p className={styles.sectionDescription}>
                  {effectiveGender === 'male'
                    ? 'Berber bulmak hiç bu kadar kolay olmamıştı'
                    : 'Güzellik salonu bulmak hiç bu kadar kolay olmamıştı'}
                </p>
              </div>
              <div className={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <div key={index} className={styles.featureCard}>
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* İşletmeler İçin CTA */}
          <section className={styles.business}>
            <div className={styles.container}>
              <div className={styles.businessCard}>
                <div className={styles.businessContent}>
                  <h2 className={styles.businessTitle}>İşletme misiniz?</h2>
                  <p className={styles.businessDescription}>
                    Ciryt'e katılın, yeni müşteriler kazanın.
                  </p>
                  <Link href="/yakinda" className={styles.businessButton}>
                    Hemen Başla
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
