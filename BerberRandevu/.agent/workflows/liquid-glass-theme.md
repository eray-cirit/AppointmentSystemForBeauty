---
description: Liquid Glass teması nasıl uygulanır - tüm UI bileşenlerinde kullanılacak
---

# Liquid Glass Tema

Bu projede tüm UI bileşenlerinde "Liquid Glass" efekti kullanılacak. 

## ⚠️ KRİTİK KURAL
- **Koyu/Dark tema KESINLIKLE YASAK!**
- Tüm sayfalar AÇIK tema olmalı (beyaz, krem, açık tonlar)
- Keşfet, panel ve diğer sayfalar da dahil - HİÇBİR SAYFA KOYU OLMAYACAK
- Arka planlar: #FEF7F0 (erkek), #FDF5F7 (kadın) veya beyaz tonları
- Mürdüm/turuncu renkler sadece ACCENT olarak kullanılacak, arka plan DEĞİL
- Bulutsu, akışkan, camsı efektler tercih edilecek

## Temel CSS Özellikleri

```css
/* Liquid Glass Card */
background: rgba(255, 255, 255, 0.15);  /* veya 0.2-0.3 arası */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.3);
border-radius: 16px;  /* veya 20px, 24px */
box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;
```

## Renk Paleti

- **Arka plan**: Beyaz veya çok açık tonlar (rgba ile şeffaf)
- **Text**: Koyu gri (#333, #1a1a1a) - SİYAH DEĞİL
- **Accent (Erkek)**: #bd6326 (Terracotta/Turuncu)
- **Accent (Kadın)**: #72223f (Mürdüm/Pembe)
- **Border**: rgba(255, 255, 255, 0.3-0.5)

## Dropdown/Popup Stilleri

```css
.dropdown {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.dropdownItem {
    color: #333;  /* Koyu gri, siyah değil */
    background: none;
}

.dropdownItem:hover {
    background: rgba(0, 0, 0, 0.05);  /* Çok hafif hover */
}
```

## Button Stilleri

```css
/* Primary Button */
background: linear-gradient(135deg, #bd6326 0%, #72223f 100%);
color: white;
border: none;
border-radius: 12px;

/* Secondary/Ghost Button */
background: rgba(255, 255, 255, 0.5);
border: 1px solid rgba(0, 0, 0, 0.1);
color: #333;
```

## YASAK Stiller

- ❌ `background: black` veya koyu renkler
- ❌ `color: black` (bunun yerine #333 kullan)
- ❌ `var(--color-bg-card)` gibi dark mode değişkenleri
- ❌ Siyah gölgeler

## Kontrol Listesi

Yeni bir bileşen oluştururken:
1. [ ] Arka plan beyaz/şeffaf mı?
2. [ ] Backdrop-filter blur var mı?
3. [ ] Border beyaz/şeffaf mı?
4. [ ] Text rengi koyu gri mi (#333)?
5. [ ] Hover efektleri yumuşak mı?
