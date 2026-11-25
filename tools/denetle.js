'use strict';
// AND web sitesinin üretilmiş çıktısını denetler: temalar, ana ekran kopyası,
// metinler ve iki dilin yapı eşitliği. Bağımlılık yok; önce sayfaları üret.
// Kullanım: node tools/olustur.js && node tools/denetle.js
// Her denetim "✓ ad" ya da "✗ ad: neden" yazar; biri bile başarısızsa çıkış 1.
const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..');
const oku = (yol) => fs.readFileSync(path.join(KOK, yol), 'utf8');

// AND'ın hazır temaları, ui.Presets sırasıyla (AND deposunda ui/theme.go).
const TEMA_KIMLIKLERI = ['klasik', 'turkuaz', 'gece-moru', 'kehribar', 'orman', 'gul', 'okyanus', 'gun-batimi', 'lavanta', 'mono'];

const sayfalar = { en: oku('index.html'), tr: oku('tr/index.html') };
const bulunamadi = oku('404.html');
const css = oku('assets/css/site.css');
const betik = oku('assets/js/site.js');

let basarisiz = 0;
function denetim(ad, fn) {
  try {
    fn();
    console.log(`✓ ${ad}`);
  } catch (h) {
    basarisiz++;
    console.log(`✗ ${ad}: ${h.message}`);
  }
}
function bekle(kosul, mesaj) {
  if (!kosul) throw new Error(mesaj);
}
const anahtarlar = (govde) => [...govde.matchAll(/'?([a-z-]+)'?\s*:/g)].map((m) => m[1]);
const ayni = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ─── Temalar ────────────────────────────────────────────────────────────────

denetim('temalar-css', () => {
  const eksik = TEMA_KIMLIKLERI.slice(1).filter((id) => !css.includes(`:root[data-tema="${id}"] {`));
  bekle(!eksik.length, `site.css'te blok yok: ${eksik.join(', ')}`);
});

denetim('temalar-js', () => {
  const t = /const TEMALAR = \[([^\]]*)\]/.exec(betik);
  bekle(t, 'site.js: TEMALAR bulunamadı');
  const liste = [...t[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  bekle(ayni(liste, TEMA_KIMLIKLERI), `site.js TEMALAR: ${liste.join(', ')}`);
  const z = /const ZEMIN = \{([^}]*)\}/.exec(betik);
  bekle(z, 'site.js: ZEMIN bulunamadı');
  bekle(ayni(anahtarlar(z[1]), TEMA_KIMLIKLERI), `site.js ZEMIN: ${anahtarlar(z[1]).join(', ')}`);
  const adlar = [...betik.matchAll(/temaAdi: \{([^}]*)\}/g)];
  bekle(adlar.length === 2, `site.js: ${adlar.length} temaAdi nesnesi (2 bekleniyor)`);
  adlar.forEach((m) => bekle(ayni(anahtarlar(m[1]), TEMA_KIMLIKLERI), `site.js temaAdi: ${anahtarlar(m[1]).join(', ')}`));
});

denetim('temalar-regex', () => {
  for (const [ad, html] of [['index.html', sayfalar.en], ['tr/index.html', sayfalar.tr], ['404.html', bulunamadi]]) {
    const m = /if\((\/[^/]+\/)\.test\(t\)\)document\.documentElement\.dataset\.tema=t/.exec(html);
    bekle(m, `${ad}: satır içi tema betiği bulunamadı`);
    const re = new RegExp(m[1].slice(1, -1));
    const kabulEtmeyen = TEMA_KIMLIKLERI.filter((id) => !re.test(id));
    bekle(!kabulEtmeyen.length, `${ad}: kabul edilmeyen: ${kabulEtmeyen.join(', ')}`);
    for (const yanlis of ['pembe', '', 'klasik2', 'xklasik']) bekle(!re.test(yanlis), `${ad}: "${yanlis}" kabul ediliyor`);
  }
});

denetim('temalar-dugme', () => {
  for (const [dil, html] of Object.entries(sayfalar)) {
    const eksik = TEMA_KIMLIKLERI.filter((id) => !html.includes(`data-tema-sec="${id}"`));
    bekle(!eksik.length, `${dil}: tema düğmesi yok: ${eksik.join(', ')}`);
  }
});

// WCAG 2 bağıl parlaklık ve kontrast oranı.
function parlaklik(hex) {
  const k = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
}
function kontrast(a, b) {
  const x = parlaklik(a);
  const y = parlaklik(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function temaDegiskenleri(id) {
  const blok = (bas) => {
    const i = css.indexOf(bas);
    return i < 0 ? '' : css.slice(i, css.indexOf('}', i));
  };
  const deg = {};
  for (const govde of [blok(':root {'), id === 'klasik' ? '' : blok(`:root[data-tema="${id}"] {`)]) {
    for (const m of govde.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) deg[m[1]] = m[2].toLowerCase();
  }
  return deg;
}

denetim('temalar-kontrast', () => {
  const sinirlar = [['text', 15], ['soft', 7.5], ['accent-ink', 7], ['muted', 4.5]];
  const sorunlar = [];
  for (const id of TEMA_KIMLIKLERI) {
    const d = temaDegiskenleri(id);
    for (const [ad, en] of sinirlar) {
      bekle(d[ad] && d.ink, `${id}: --${ad} ya da --ink yok`);
      const oran = kontrast(d[ad], d.ink);
      if (oran < en) sorunlar.push(`${id} --${ad}/--ink ${oran.toFixed(2)} < ${en}`);
    }
  }
  bekle(!sorunlar.length, sorunlar.join('; '));
});

if (basarisiz) {
  console.log(`\n${basarisiz} denetim başarısız.`);
  process.exit(1);
}
console.log('\nBütün denetimler geçti.');
