---
description: Hero yazıları için liquid glass ve yumuşak kenar efektleri nasıl uygulanır
---

# Text Styling - Liquid Glass & Soft Edges

## Randevunu Yazısı (Liquid Glass Efekt)

**Dosya:** `src/app/page.module.css`

### 1. Temel Stiller
```css
.heroTitleLine {
    font-weight: 1000;
    letter-spacing: 2px;
    position: relative;
}
```

### 2. SVG Filter ile Mat Çerçeve
```css
.heroTitleLine::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    z-index: -1;
    filter: url(#merge-outline);
    /* ... */
}
```

### 3. Tema Bazlı İç Renkler
- Erkek: `color: rgba(189, 99, 38, 0.35);`
- Kadın: `color: rgba(114, 34, 63, 0.35);`

### 4. SVG Filter (page.js)
```jsx
<filter id="merge-outline">
  <feMorphology operator="dilate" radius="2" />  {/* Çerçeve kalınlığı */}
  <feComposite operator="out" />  {/* İç kısmı çıkar */}
  <feFlood floodColor="#ffffff" floodOpacity="1" />  {/* Mat beyaz */}
</filter>
```

---

## Hemen Al Yazısı (Yumuşak Kenar Efekt)

### 1. Temel Stiller
```css
.heroTitleGradient {
    font-weight: 700;
    letter-spacing: 1px;
    -webkit-font-smoothing: antialiased;
}
```

### 2. Yumuşak Glow Kenarlar (text-shadow ile)
```css
.maleTheme .heroTitleGradient {
    color: #bd6326;
    text-shadow: 
        0 0 2px #bd6326,                    /* İnce glow - kenarları yumuşatır */
        0 0 4px rgba(189, 99, 38, 0.6),     /* Orta glow */
        0 4px 20px rgba(0, 0, 0, 0.3);      /* Alt gölge */
}
```

---

## Önemli Notlar

- **Çerçeve kalınlığı:** SVG'de `feMorphology radius` değeri ile ayarlanır
- **Yumuşak kenar:** Blur yerine text-shadow kullan (blur tüm yazıyı etkiler)
- **data-text attribute:** JSX'te `data-text={heroText.main}` olarak eklenmeli
