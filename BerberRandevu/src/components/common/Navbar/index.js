'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useGender } from '@/context/GenderContext';
import styles from './Navbar.module.css';

/**
 * Navbar Bileşeni
 * 
 * Tüm sayfalarda görünen üst navigasyon çubuğu.
 * NextAuth session'a göre kullanıcı durumunu gösterir.
 * Gender context'e göre giriş/kayıt linklerini yönlendirir.
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session, status } = useSession();
  const { isMale } = useGender();
  const pathname = usePathname();

  // Auth sayfalarında mıyız kontrol et
  const isAuthPage = pathname?.startsWith('/giris') || pathname?.startsWith('/kayit');

  // Gender'a göre linkler
  const loginLink = isMale ? '/giris/erkek' : '/giris/kadin';
  const registerLink = isMale ? '/kayit/erkek' : '/kayit/kadin';

  // Çıkış yap
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Kullanıcı bilgilerini al
  const user = session?.user;
  const userName = user?.name || user?.firstName || user?.email?.split('@')[0] || 'Kullanıcı';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>Ciryt</span>
        </Link>

        {/* Desktop Menü */}
        <div className={styles.desktopMenu}>
          <Link href="/" className={styles.navLink}>
            Ana Sayfa
          </Link>
          <Link href="/kesfet" className={styles.navLink}>
            Keşfet
          </Link>
          <Link href="/yakinda" className={styles.navLink}>
            Hakkımızda
          </Link>
        </div>

        {/* Auth Butonları - Auth sayfalarında gizle */}
        {!isAuthPage && (
          <div className={styles.authSection}>
            {status === 'loading' ? (
              // Yükleniyor
              <div className={styles.loadingAuth}>...</div>
            ) : session ? (
              // Giriş yapmış kullanıcı
              <div className={styles.userMenu}>
                <button
                  className={styles.userButton}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className={styles.avatar}>
                    {userInitial}
                  </div>
                  <span className={styles.userName}>{userName}</span>
                </button>

                {isProfileOpen && (
                  <div className={styles.dropdown}>
                    <Link href="/hesabim" className={styles.dropdownItem}>
                      👤 Hesabım
                    </Link>
                    <hr className={styles.dropdownDivider} />
                    <button onClick={handleLogout} className={styles.dropdownItem}>
                      🚪 Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Giriş yapmamış kullanıcı
              <div className={styles.authButtons}>
                <Link href={loginLink} className={styles.loginBtn}>
                  Giriş Yap
                </Link>
                <Link href={registerLink} className={styles.registerBtn}>
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mobil Menü Butonu */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menüyü aç/kapat"
        >
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}></span>
        </button>
      </div>

      {/* Mobil Menü */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" className={styles.mobileNavLink}>
            Ana Sayfa
          </Link>
          <Link href="/kesfet" className={styles.mobileNavLink}>
            Keşfet
          </Link>
          <Link href="/yakinda" className={styles.mobileNavLink}>
            Hakkımızda
          </Link>
          <hr className={styles.mobileDivider} />
          {session ? (
            <>
              <Link href="/hesabim" className={styles.mobileNavLink}>
                Hesabım
              </Link>
              <button onClick={handleLogout} className={styles.mobileNavLink}>
                Çıkış Yap
              </button>
            </>
          ) : !isAuthPage && (
            <>
              <Link href={loginLink} className={styles.mobileNavLink}>
                Giriş Yap
              </Link>
              <Link href={registerLink} className={styles.mobileNavLink}>
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
