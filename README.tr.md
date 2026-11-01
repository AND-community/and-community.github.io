# and-community.github.io

[English](README.md) · **Türkçe**

[AND](https://github.com/AND-community/AND)'ın web sitesi; GitHub Pages `main` dalının kökünden
<https://and-community.github.io/> adresinde yayımlar.

Statik bir sitedir: GitHub hiçbir şey derlemez, sayfalar üçüncü taraflara istek göndermez. Yazı
tipleri bu depodadır, çerez ya da ziyaretçi istatistiği yoktur; başka bir sunucuya giden tek istek,
indirme bölümünün son sürümü GitHub'ın API'sine sormasıdır.

## Yapı

| Yol | Ne |
|---|---|
| `index.html`, `tr/index.html` | İngilizce ve Türkçe sayfalar (üretilir) |
| `404.html` | GitHub Pages'in bilinmeyen adreslerde gösterdiği sayfa (üretilir) |
| `assets/css/site.css` | Bütün stiller. Renkler AND'ın kendi temalarıdır (AND'da `internal/ui/theme.go`) |
| `assets/js/site.js` | Tema seçimi, ana ekran kopyasının menüsü, sürüm sorgusu, kopyalama düğmeleri |
| `assets/fonts/` | AND Site Mono ve AND Site Slab, lisanslarıyla (`OFL.txt`) |
| `assets/img/`, `favicon.ico` | Simgeler ve paylaşım görselleri |
| `tools/olustur.js` | Sayfaları, `sitemap.xml`'i ve görsel şablonlarını tek şablondan üretir |
| `tools/og.html`, `tools/simge.html` | Paylaşım görsellerinin ve simgelerin şablonları (üretilir) |
| `tools/sunucu.js` | Önizleme için küçük bir yerel sunucu |
| `tools/yazitipi-hazirla.js` | Yazı tiplerini Monaspace'ten üretir |

## Düzenleme

Bütün metinler `tools/olustur.js`'tedir: `M` tablosu sayfanın, `R` tablosu ana ekran kopyasının
metinlerini tutar; iki dil hep aynı yapıyı paylaşır. Bir değişiklikten sonra:

```bash
node tools/olustur.js
node tools/sunucu.js .        # sonra http://127.0.0.1:8123/ adresini aç
```

Kopya, AND'ın ana ekranını (`internal/tui/home.go`) taklit eder; metinleri AND'ın çeviri
kataloğundan (`dil/ceviriler`) gelir. Uygulamanın ana ekranı değişirse burası da güncellenmeli.

## Görseller

`assets/img/og.png` ve `og-tr.png`, `tools/og.html`'in 1200×630 ekran görüntüleridir (Türkçesi
`?dil=tr` ile). `assets/img/apple-touch-icon.png` (180×180) ve `favicon.ico`'nun içindeki 32×32
PNG, `tools/simge.html`'in ekran görüntüleridir.

## Yazı tipleri

AND Site Mono ve AND Site Slab, GitHub'ın Monaspace Neon ve Monaspace Xenon v1.400 yazı
tiplerinin (<https://github.com/githubnext/monaspace>) alt kümeleridir. Yalnızca bu sitenin
kullandığı karakterler (Türkçe dahil Latin, kutu çizgileri, bloklar ve geometrik şekiller) ve
400–700 ile 500–700 kalınlıkları tutulur. SIL Open Font License, "Monaspace" adını ve alt aile
adlarını değiştirilmemiş yazı tiplerine ayırır; bu yüzden alt kümeler yeniden adlandırıldı,
telif ve lisans kayıtları korundu. Bir Monaspace sürümünün değişken TTF'lerinden yeniden üretmek
için:

```bash
npm install subset-font@2.9.0
node tools/yazitipi-hazirla.js "Monaspace Neon Var.ttf" assets/fonts/and-site-mono.woff2 "AND Site Mono" 400 700 kutu
node tools/yazitipi-hazirla.js "Monaspace Xenon Var.ttf" assets/fonts/and-site-slab.woff2 "AND Site Slab" 500 700
```
