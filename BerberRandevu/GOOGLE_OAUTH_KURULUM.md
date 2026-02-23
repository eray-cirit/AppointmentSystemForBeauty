# 🔐 Ciryt - Google OAuth Kurulum Rehberi

Bu rehber, Google ile giriş özelliğini aktifleştirmek için gereken tüm adımları içerir.

---

## 📋 Adım 1: OAuth Consent Screen Yapılandırması

1. **Sol menüden** → `APIs & Services` → `OAuth consent screen` tıkla
2. **User Type** olarak `External` seç → `Create` tıkla
3. **App information** doldur:
   - **App name:** `Ciryt`
   - **User support email:** `erayserkan0@gmail.com` (kendi emailin)
   - **App logo:** (opsiyonel, şimdilik boş bırakabilirsin)
4. **Developer contact information:**
   - **Email:** `erayserkan0@gmail.com`
5. **Save and Continue** tıkla
6. **Scopes** sayfasında → `Save and Continue` (değişiklik yapma)
7. **Test users** sayfasında:
   - `+ Add Users` tıkla
   - `erayserkan0@gmail.com` ekle
   - `Save and Continue`
8. **Summary** → `Back to Dashboard`

---

## 📋 Adım 2: OAuth Credentials Oluşturma

1. **Sol menüden** → `APIs & Services` → `Credentials` tıkla
2. **Üstte** → `+ Create Credentials` → `OAuth client ID` seç
3. **Application type:** `Web application` seç
4. **Name:** `Ciryt Web Client`
5. **Authorized JavaScript origins** → `+ Add URI`:
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs** → `+ Add URI`:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. **Create** tıkla
8. Açılan popup'ta **Client ID** ve **Client Secret** gösterilecek - bunları kopyala!

---

## 📋 Adım 3: .env.local Dosyasını Güncelle

Proje klasöründeki `.env.local` dosyasını aç ve şu değerleri güncelle:

```env
# Google OAuth (Google Console'dan aldığın değerler)
GOOGLE_CLIENT_ID=buraya-client-id-yapistir
GOOGLE_CLIENT_SECRET=buraya-client-secret-yapistir

# NextAuth (bunlar zaten varsa dokunma, yoksa ekle)
NEXTAUTH_SECRET=ciryt-super-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
```

> ⚠️ **ÖNEMLİ:** Client ID ve Secret'ı kopyalarken başında veya sonunda boşluk olmadığından emin ol!

---

## 📋 Adım 4: Sunucuyu Yeniden Başlat

Terminal'de:

```bash
# Çalışan sunucuyu durdur (Ctrl+C)
# Tekrar başlat
npm run dev
```

---

## ✅ Test Et

1. `http://localhost:3000/giris/erkek` veya `/giris/kadin` sayfasına git
2. "Google ile Giriş Yap" butonuna tıkla
3. Google hesabınla giriş yap
4. Başarılı bir şekilde yönlendirilmen gerekiyor!

---

## ❌ Hata Çözümleri

### "Error 401: invalid_client"
- Client ID veya Client Secret yanlış
- `.env.local` dosyasındaki değerleri kontrol et

### "Error 400: redirect_uri_mismatch"
- Redirect URI yanlış yazılmış
- Google Console'da `http://localhost:3000/api/auth/callback/google` olarak ekle

### "Access blocked: This app's request is invalid"
- OAuth consent screen yapılandırılmamış
- Adım 1'i tekrar kontrol et

### "Error: OAuthSignin"
- NEXTAUTH_SECRET eksik
- `.env.local` dosyasına ekle

---

## 🚀 Canlıya Çıkarken (Production)

Canlı ortamda şunları eklemeyi unutma:

**Authorized JavaScript origins:**
```
https://ciryt.com
https://www.ciryt.com
```

**Authorized redirect URIs:**
```
https://ciryt.com/api/auth/callback/google
https://www.ciryt.com/api/auth/callback/google
```

**`.env.local` güncelle:**
```env
NEXTAUTH_URL=https://ciryt.com
```

---

## 💡 İpuçları

- Test modundayken sadece eklediğin test kullanıcıları giriş yapabilir
- Uygulamayı yayınlamak için OAuth consent screen'de "Publish App" yapmalısın
- Yayınlamak için Google'ın onayı gerekebilir (birkaç gün sürebilir)

---

**Sorun yaşarsan bana sor! 🚀**
