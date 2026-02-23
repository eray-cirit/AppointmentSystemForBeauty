'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useGender } from '@/context/GenderContext';
import LocationOnboarding from '@/components/location/LocationOnboarding';
import styles from './konum-sec.module.css';

/**
 * Konum Seçimi Sayfası
 * Kayıt sonrası veya ana sayfadan yönlendirilme ile gelinen sayfa
 */
export default function KonumSecPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { gender } = useGender();
    const [isReady, setIsReady] = useState(false);

    const userGender = session?.user?.gender;
    const isLoggedIn = status === 'authenticated' && session?.user;

    // Giriş yapmamış kullanıcıları giriş sayfasına yönlendir
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/giris/erkek');
        } else if (status === 'authenticated') {
            setIsReady(true);
        }
    }, [status, router]);

    // Konum seçimi tamamlandığında
    const handleLocationComplete = (location) => {
        // localStorage'a kaydet
        localStorage.setItem('userLocation', JSON.stringify(location));

        // Ana sayfaya yönlendir
        router.push('/');
    };

    const effectiveGender = isLoggedIn && userGender ? userGender : gender;

    const themeClass = effectiveGender === 'male' ? styles.maleTheme : styles.femaleTheme;

    if (status === 'loading' || !isReady) {
        return (
            <div className={`${styles.loadingPage} ${themeClass}`}>
                <div className={styles.spinner}></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className={`${styles.page} ${themeClass}`}>
            <LocationOnboarding
                isOpen={true}
                onComplete={handleLocationComplete}
                gender={effectiveGender}
            />
        </div>
    );
}
