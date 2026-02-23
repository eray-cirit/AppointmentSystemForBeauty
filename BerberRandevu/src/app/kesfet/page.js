"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useLocation } from '@/context/LocationContext';
import LocationPicker from '@/components/common/LocationPicker';
import BusinessCard from '@/components/business/BusinessCard';
import dynamic from 'next/dynamic';
import styles from './kesfet.module.css';

// MapView'u SSR olmadan yükle (Leaflet client-only)
const MapView = dynamic(() => import('@/components/business/MapView'), {
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Harita yükleniyor...</div>
});

export default function KesfetPage() {
    const { data: session, status } = useSession();
    const { city, lat, lng } = useLocation();

    // Cinsiyet - session'dan al
    const [gender, setGender] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [viewMode, setViewMode] = useState('map'); // 'grid' | 'map'

    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    // Session'dan cinsiyet al - Google OAuth kullanıcıları için fallback
    useEffect(() => {
        if (status === 'authenticated') {
            if (session?.user?.gender) {
                setGender(session.user.gender);
            } else {
                // Google OAuth ile giriş yapan kullanıcılar için varsayılan
                setGender('female');
            }
        }
    }, [session, status]);

    // Body scroll'u sadece harita modunda kapat
    useEffect(() => {
        if (viewMode === 'map') {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [viewMode]);

    // İşletmeleri getir
    const fetchBusinesses = useCallback(async (pageNum = 1, append = false) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                city,
                gender,
                lat: lat.toString(),
                lng: lng.toString(),
                page: pageNum.toString(),
                limit: '12'
            });

            const res = await fetch(`/api/businesses?${params}`);
            const data = await res.json();

            if (data.success) {
                if (append) {
                    setBusinesses(prev => [...prev, ...data.data]);
                } else {
                    setBusinesses(data.data);
                }
                setHasMore(data.pagination.hasMore);
            }
        } catch (error) {
            console.error('İşletmeler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    }, [city, gender, lat, lng]);

    // İlk yükleme ve konum/cinsiyet değişimi
    useEffect(() => {
        if (gender) {
            setPage(1);
            fetchBusinesses(1, false);
        }
    }, [city, gender, fetchBusinesses]);

    // Infinite scroll observer
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchBusinesses(nextPage, true);
            }
        }, { threshold: 0.1 });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [hasMore, loading, page, fetchBusinesses]);

    // İşletme tıklama
    const handleBusinessClick = (business) => {
        // TODO: İşletme detay sayfasına git
        console.log('Seçilen işletme:', business);
    };

    // Giriş yapmamış kullanıcılar için liquid glass auth prompt
    if (status === 'unauthenticated') {
        return (
            <div className={styles.authPromptPage}>
                {/* Animated Background */}
                <div className={styles.authPromptBackground}>
                    <div className={styles.gradientOrb1}></div>
                    <div className={styles.gradientOrb2}></div>
                    <div className={styles.gradientOrb3}></div>
                </div>

                {/* Main Glass Card */}
                <div className={styles.authPromptCard}>
                    <div className={styles.authPromptIcon}>✨</div>
                    <h1 className={styles.authPromptTitle}>Binlerce Güzellik Salonu</h1>
                    <p className={styles.authPromptSubtitle}>
                        Berberler, kuaförler, güzellik merkezleri ve nail art salonları seni bekliyor
                    </p>

                    <div className={styles.authPromptStats}>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>500+</span>
                            <span className={styles.statLabel}>Salon</span>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>50+</span>
                            <span className={styles.statLabel}>Şehir</span>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>10K+</span>
                            <span className={styles.statLabel}>Kullanıcı</span>
                        </div>
                    </div>

                    <p className={styles.authPromptCta}>
                        Keşfetmeye başlamak için lütfen giriş yapın
                    </p>

                    <div className={styles.authPromptButtons}>
                        <a href="/giris/erkek" className={styles.authPromptBtnMale}>
                            <span className={styles.btnIcon}>👨</span>
                            Erkek Girişi
                        </a>
                        <a href="/giris/kadin" className={styles.authPromptBtnFemale}>
                            <span className={styles.btnIcon}>👩</span>
                            Kadın Girişi
                        </a>
                    </div>

                    <p className={styles.authPromptRegister}>
                        Hesabın yok mu?{' '}
                        <a href="/kayit/erkek" className={styles.registerLinkMale}>Erkek Kayıt</a>
                        {' '}/{' '}
                        <a href="/kayit/kadin" className={styles.registerLinkFemale}>Kadın Kayıt</a>
                    </p>
                </div>
            </div>
        );
    }

    // Session yüklenene kadar loading göster
    if (status === 'loading' || !gender) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className={`${styles.kesfetPage} ${styles[gender]}`}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <h1 className={styles.title}>
                            {gender === 'male' ? 'Berber & Kuaför' : 'Güzellik Salonu'}
                        </h1>
                        <p className={styles.subtitle}>
                            {city} bölgesinde {businesses.length}+ işletme
                        </p>
                    </div>

                    <div className={styles.controls}>
                        <LocationPicker gender={gender} />

                        <div className={styles.viewToggle}>
                            <button
                                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                ⊞
                            </button>
                            <button
                                className={`${styles.viewBtn} ${viewMode === 'map' ? styles.active : ''}`}
                                onClick={() => setViewMode('map')}
                            >
                                🗺️
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className={styles.main}>
                {viewMode === 'grid' ? (
                    <>
                        {/* Business Grid */}
                        <div className={styles.grid}>
                            {businesses.map((business) => (
                                <BusinessCard
                                    key={business.id}
                                    business={business}
                                    gender={gender}
                                    onClick={handleBusinessClick}
                                />
                            ))}
                        </div>

                        {/* Loading / Load More */}
                        {loading && (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner} />
                                <p>İşletmeler yükleniyor...</p>
                            </div>
                        )}

                        {!loading && businesses.length === 0 && (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>🔍</span>
                                <h3>İşletme Bulunamadı</h3>
                                <p>{city} bölgesinde {gender === 'male' ? 'erkek' : 'kadın'} işletmesi bulunamadı.</p>
                            </div>
                        )}

                        {/* Infinite Scroll Trigger */}
                        {hasMore && <div ref={loadMoreRef} className={styles.loadMoreTrigger} />}
                    </>
                ) : (
                    /* Map View */
                    <div className={styles.mapWrapper}>
                        <MapView
                            businesses={businesses}
                            userLocation={{ lat, lng }}
                            gender={gender}
                            onMarkerClick={handleBusinessClick}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
