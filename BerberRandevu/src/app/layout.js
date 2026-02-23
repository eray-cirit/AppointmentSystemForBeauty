import { Montserrat, Dancing_Script } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import AuthProvider from "@/components/auth/AuthProvider";
import { GenderProvider } from "@/context/GenderContext";
import { LocationProvider } from "@/context/LocationContext";

/**
 * Root Layout
 * 
 * Tüm sayfalar için ana layout.
 * Navbar ve Footer tüm sayfalarda görünür.
 * 
 * Fontlar:
 * - Montserrat: Ana font
 * - Dancing Script: El yazısı efekti (özel yazılar için)
 */

const montserrat = Montserrat({
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-main',
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-signature',
});

export const metadata = {
  title: "Ciryt - Türkiye'nin Güzellik ve Randevu Platformu",
  description: "Berber, kuaför, güzellik merkezi ve nail art salonları tek platformda. Yakınındaki en iyi salonları bul, kolayca online randevu al.",
  keywords: "berber, kuaför, güzellik merkezi, nail art, randevu, saç kesimi, manikür, pedikür, cilt bakımı, online randevu",
  authors: [{ name: "Ciryt Team" }],
  openGraph: {
    title: "Ciryt - Güzellik ve Randevu Platformu",
    description: "Berber, kuaför ve güzellik merkezlerini bul, randevu al",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${montserrat.variable} ${dancingScript.variable}`}>
      <body className={montserrat.className}>
        <AuthProvider>
          <GenderProvider>
            <LocationProvider>
              {/* Navbar - Tüm sayfalarda görünür */}
              <Navbar />

              {/* Ana İçerik */}
              <main style={{
                minHeight: '100vh',
                paddingTop: '72px' // Navbar yüksekliği kadar boşluk
              }}>
                {children}
              </main>

              {/* Footer - Tüm sayfalarda görünür */}
              <Footer />
            </LocationProvider>
          </GenderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
