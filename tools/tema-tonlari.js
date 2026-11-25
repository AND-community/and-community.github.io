'use strict';
// Sitenin tema bloklarındaki türetilmiş tonları (--ink, --ink-deep,
// --accent-ink, --soft, --line) hesaplar. Bu tonlar her temada temanın bir
// renginin sabit koyu/nötr bir tabanla OKLab'da karıştırılmasıdır. Kural
// burada mevcut renkli temalardan (Mono hariç) geri çıkarılır: her ton için
// taban ve oran en küçük kareler yöntemiyle bulunur, karışan renk (vurgu ya
// da seçim) en iyi uyandır. Betik önce kuralın mevcut temaları ne kadar
// yeniden ürettiğini, sonra yeni temaların CSS değerlerini yazar.
// Kullanım: node tools/tema-tonlari.js
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'site.css'), 'utf8');

// Yeni temalar: ANSI 256 renklerinin hex karşılıkları (AND ui/theme.go Presets).
const YENI = {
  gul: { accent: '#ff87af', sel: '#af005f' },
  okyanus: { accent: '#00afff', sel: '#005f87' },
  'gun-batimi': { accent: '#ff875f', sel: '#af0000' },
  lavanta: { accent: '#d7afff', sel: '#5f5faf' },
};
const ESKI = ['klasik', 'turkuaz', 'gece-moru', 'kehribar', 'orman'];
const TONLAR = ['ink', 'ink-deep', 'accent-ink', 'soft', 'line'];

function degiskenler(id) {
  const blok = (bas) => {
    const i = css.indexOf(bas);
    return i < 0 ? '' : css.slice(i, css.indexOf('}', i));
  };
  const d = {};
  for (const g of [blok(':root {'), id === 'klasik' ? '' : blok(`:root[data-tema="${id}"] {`)]) {
    for (const m of g.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) d[m[1]] = m[2].toLowerCase();
  }
  return d;
}

// sRGB ↔ OKLab (Björn Ottosson).
const dogrusal = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gama = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function oklab(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => dogrusal(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function hexe([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return '#' + rgb.map((c) => Math.round(Math.min(1, Math.max(0, gama(c))) * 255).toString(16).padStart(2, '0')).join('');
}
const karistir = (taban, renk, t) => taban.map((v, i) => v * (1 - t) + renk[i] * t);
const kanalFarki = (a, b) => Math.max(...[1, 3, 5].map((i) => Math.abs(parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16))));

// Bir ton için: her oranda tabanı en küçük karelerle bul, hatası en küçük
// (kaynak, oran) çiftini seç.
function uydur(ton) {
  let enIyi = null;
  for (const kaynak of ['accent', 'sel']) {
    for (let t = 0; t < 0.95; t += 0.0005) {
      const tabanlar = ESKI.map((id) => {
        const d = degiskenler(id);
        const v = oklab(d[ton]);
        const r = oklab(d[kaynak]);
        return v.map((x, i) => (x - t * r[i]) / (1 - t));
      });
      const taban = [0, 1, 2].map((i) => tabanlar.reduce((s, x) => s + x[i], 0) / tabanlar.length);
      let hata = 0;
      for (const id of ESKI) {
        const d = degiskenler(id);
        const tahmin = karistir(taban, oklab(d[kaynak]), t);
        const gercek = oklab(d[ton]);
        hata += tahmin.reduce((s, x, i) => s + (x - gercek[i]) ** 2, 0);
      }
      if (!enIyi || hata < enIyi.hata) enIyi = { kaynak, t, taban, hata };
    }
  }
  return enIyi;
}

const kurallar = {};
let enBuyukFark = 0;
console.log('Kural ve mevcut temaların yeniden üretimi (en büyük kanal farkı):');
for (const ton of TONLAR) {
  const k = uydur(ton);
  kurallar[ton] = k;
  const farklar = ESKI.map((id) => {
    const d = degiskenler(id);
    return kanalFarki(hexe(karistir(k.taban, oklab(d[k.kaynak]), k.t)), d[ton]);
  });
  enBuyukFark = Math.max(enBuyukFark, ...farklar);
  console.log(`  --${ton}: taban ${hexe(k.taban)} + ${k.kaynak} %${(k.t * 100).toFixed(2)}  farklar ${farklar.join(' ')}`);
}
console.log(`  en büyük fark: ${enBuyukFark} ${enBuyukFark <= 3 ? '(≤3, kabul)' : '(>3, KURAL UYMUYOR)'}`);

console.log('\nYeni temalar:');
for (const [id, renk] of Object.entries(YENI)) {
  const deger = TONLAR.map((ton) => `--${ton}: ${hexe(karistir(kurallar[ton].taban, oklab(renk[kurallar[ton].kaynak]), kurallar[ton].t))};`);
  console.log(`  ${id}: ${deger.join(' ')}`);
}
if (enBuyukFark > 3) process.exit(1);
