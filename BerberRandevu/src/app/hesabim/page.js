'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import styles from './hesabim.module.css';

/**
 * Hesabım Sayfası
 * Kullanıcı bilgilerini ve konum ayarlarını gösterir
 */
export default function HesabimPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [location, setLocation] = useState(null);

    // Giriş yapmamış kullanıcıları giriş sayfasına yönlendir
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/giris/erkek');
        }
    }, [status, router]);

    // Konum bilgisini localStorage'dan al
    useEffect(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            try {
                setLocation(JSON.parse(savedLocation));
            } catch (e) {
                console.error('Konum okunamadı');
            }
        }
    }, []);

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: '/' });
    };

    if (status === 'loading') {
        return (
            <div className={styles.loadingPage}>
                <div className={styles.spinner}></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    const user = session.user;
    const themeClass = user.gender === 'female' ? styles.femaleTheme : styles.maleTheme;

    return (
        <div className={`${styles.page} ${themeClass}`}>
            <div className={styles.container}>
                {/* Geri Butonu */}
                <Link href="/" className={styles.backButton}>
                    ← Ana Sayfa
                </Link>

                {/* Başlık */}
                <div className={styles.header}>
                    <h1 className={styles.title}>👤 Hesabım</h1>
                    <p className={styles.subtitle}>Profil bilgilerinizi görüntüleyin</p>
                </div>

                {/* Profil Kartı */}
                <div className={styles.profileCard}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            {user.firstName?.charAt(0) || user.name?.charAt(0) || '?'}
                        </div>
                        <div className={styles.userInfo}>
                            <h2 className={styles.userName}>
                                {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.name || 'Kullanıcı'
                                }
                            </h2>
                            <span className={styles.userRole}>
                                {user.gender === 'female' ? '👩 Kadın' : '👨 Erkek'}
                            </span>
                        </div>
                    </div>

                    {/* Bilgi Listeleri */}
                    <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>📧 E-posta</span>
                            <span className={styles.infoValue}>{user.email}</span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>🎭 Hesap Türü</span>
                            <span className={styles.infoValue}>
                                {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>📍 Konum</span>
                            <span className={styles.infoValue}>
                                {location
                                    ? `${location.neighborhood}, ${location.district}, ${location.city}`
                                    : 'Henüz seçilmedi'
                                }
                            </span>
                            <Link href="/konum-sec" className={styles.changeBtn}>
                                {location ? 'Değiştir' : 'Seç'}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Çıkış Butonu */}
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    🚪 Çıkış Yap
                </button>
            </div>
        </div>
    );
}
