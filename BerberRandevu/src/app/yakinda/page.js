'use client';

import Link from 'next/link';
import styles from './yakinda.module.css';

/**
 * Yakında Sayfası
 * 
 * Henüz hazır olmayan sayfalar için placeholder.
 */
export default function YakindaPage() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <span className={styles.icon}>🚀</span>
                </div>

                <h1 className={styles.title}>Yakında Sizlerle!</h1>

                <p className={styles.description}>
                    Bu sayfa üzerinde çalışıyoruz. Çok yakında harika özelliklerle karşınızda olacağız.
                </p>

                <div className={styles.features}>
                    <div className={styles.featureItem}>
                        <span>✨</span>
                        <span>Yeni tasarım</span>
                    </div>
                    <div className={styles.featureItem}>
                        <span>⚡</span>
                        <span>Hızlı deneyim</span>
                    </div>
                    <div className={styles.featureItem}>
                        <span>💜</span>
                        <span>Daha fazla özellik</span>
                    </div>
                </div>

                <Link href="/" className={styles.backButton}>
                    Ana Sayfaya Dön
                </Link>
            </div>

            <div className={styles.backgroundGlow}></div>
        </div>
    );
}
