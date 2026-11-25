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
| `assets/css/site.css` | Bütün stiller. Renkler AND'ın on temasıdır (AND'da `ui/theme.go`); masaüstü penceresi kopyası `internal/masaustu/web/uygulama.css`'i izler |
| `assets/js/site.js` | Tema seçimi, masaüstü penceresi kopyası (ekranlar, forum, ayarlar, dar ekran), sürüm sorgusu, kopyalama düğmeleri |
| `assets/fonts/` | AND Site Mono ve AND Site Slab, lisanslarıyla (`OFL.txt`) |
| `assets/img/`, `favicon.ico` | Simgeler ve paylaşım görselleri |
| `tools/olustur.js` | Sayfaları, `sitemap.xml`'i ve görsel şablonlarını tek şablondan üretir |
| `tools/pencere.js` | Masaüstü penceresi kopyası: metinleri (`R` tablosu, iki dil) ve HTML'i |
| `tools/denetle.js` | Üretilen sayfaları denetler: temalar, kopyanın yapısı, metinler, İngilizce/Türkçe eşitliği |
| `tools/tema-tonlari.js` | Bir temanın koyu ve açık tonlarını mevcut temalar nasıl yapıldıysa öyle türetir |
| `tools/og.html` | Paylaşım görsellerinin şablonu (üretilir) |
| `tools/logo.png` | AND'ın logosu (500×500); simgeler ondan üretilir |
| `tools/simge-uret.js` | Simgeleri logodan üretir |
| `tools/sunucu.js` | Önizleme için küçük bir yerel sunucu |
| `tools/yazitipi-hazirla.js` | Yazı tiplerini Monaspace'ten üretir |

## Düzenleme

Sayfanın metinleri `tools/olustur.js`'teki `M` tablosunda, kopyanınkiler `tools/pencere.js`'teki
`R` tablosundadır. İki dil tek şablondan çıkar, hep aynı yapıyı paylaşır. Bir değişiklikten sonra:

```bash
node tools/olustur.js
node tools/denetle.js          # bütün denetimler geçmeli
node tools/sunucu.js .        # sonra http://127.0.0.1:8123/ adresini aç
```

Kopya, AND'ın masaüstü penceresini (AND'da `internal/masaustu/web`) ve AND'la gelen eklentilerin
o pencerede çizdiği ekranları taklit eder. İkonları uygulamanınkidir; metinleri AND'ın ve
eklentilerin çeviri kataloglarından (`dil/ceviriler`, `Eklentiler/*/ceviri.json`) gelir.
Uygulamanın ekranları değişirse `tools/pencere.js` ve `site.css`'teki kopya bölümü de güncellenmeli.

Yeni bir AND teması için renkleri `TEMALAR`'a (`tools/olustur.js`), bir blok `site.css`'e (türetilen
tonlar için `node tools/tema-tonlari.js`) ve adı `site.js`'e eklenir.

## Görseller

`assets/img/og.png` ve `og-tr.png`, `tools/og.html`'in 1200×630 ekran görüntüleridir (Türkçesi
`?dil=tr` ile).

Simgeler AND'ın logosundan (`tools/logo.png`) gelir. `node tools/simge-uret.js` şunları yazar:

- `assets/img/logo.png` (192×192): üst çubukta, alt bilgide ve paylaşım görsellerinde kullanılır
- `favicon.ico`: 16, 32 ve 48 piksel
- `assets/img/apple-touch-icon.png` (180×180): iOS saydamlığı göstermediği için sayfanın koyu
  zemininde

Logo değişirse bunu çalıştır, sonra paylaşım görsellerini yeniden çek.

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
