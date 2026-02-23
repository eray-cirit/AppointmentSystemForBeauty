'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

/**
 * Footer Bileşeni
 * 
 * Tüm sayfalarda görünen alt bilgi alanı.
 * İletişim bilgileri, sosyal medya linkleri ve yasal bilgiler içerir.
 */
export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Ana Grid */}
                <div className={styles.grid}>
                    {/* Logo ve Açıklama */}
                    <div className={styles.brandSection}>
                        <Link href="/" className={styles.logo}>
                            <span className={styles.logoIcon}>✦</span>
                            <span className={styles.logoText}>Ciryt</span>
                        </Link>
                        <p className={styles.description}>
                            Türkiye'nin güzellik ve randevu platformu.
                            Berber, kuaför, güzellik merkezi ve nail art salonlarını bul, kolayca randevu al.
                        </p>
                    </div>

                    {/* Hızlı Linkler */}
                    <div className={styles.linksSection}>
                        <h4 className={styles.sectionTitle}>Hızlı Linkler</h4>
                        <ul className={styles.linkList}>
                            <li><Link href="/">Ana Sayfa</Link></li>
                            <li><Link href="/yakinda">Salonlar</Link></li>
                            <li><Link href="/yakinda">Hakkımızda</Link></li>
                            <li><Link href="/yakinda">İletişim</Link></li>
                        </ul>
                    </div>

                    {/* Salonlar İçin */}
                    <div className={styles.linksSection}>
                        <h4 className={styles.sectionTitle}>Salonlar İçin</h4>
                        <ul className={styles.linkList}>
                            <li><Link href="/yakinda">Salon Kaydı</Link></li>
                            <li><Link href="/yakinda">Salon Paneli</Link></li>
                            <li><Link href="/yakinda">Fiyatlandırma</Link></li>
                            <li><Link href="/yakinda">SSS</Link></li>
                        </ul>
                    </div>

                    {/* İletişim */}
                    <div className={styles.linksSection}>
                        <h4 className={styles.sectionTitle}>İletişim</h4>
                        <ul className={styles.contactList}>
                            <li>
                                <span className={styles.contactIcon}>📧</span>
                                <a href="mailto:info@ciryt.com">info@ciryt.com</a>
                            </li>
                            <li>
                                <span className={styles.contactIcon}>📞</span>
                                <a href="tel:+905551234567">+90 555 123 45 67</a>
                            </li>
                            <li>
                                <span className={styles.contactIcon}>📍</span>
                                <span>İstanbul, Türkiye</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Alt Kısım */}
                <div className={styles.bottom}>
                    <div className={styles.bottomContent}>
                        <p className={styles.copyright}>
                            © {currentYear} Ciryt. Tüm hakları saklıdır.
                        </p>
                        <div className={styles.legalLinks}>
                            <Link href="/yakinda">Gizlilik Politikası</Link>
                            <Link href="/yakinda">Kullanım Şartları</Link>
                            <Link href="/yakinda">Çerez Politikası</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

