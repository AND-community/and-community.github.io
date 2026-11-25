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

// ─── Ana ekran kopyası: AND'ın masaüstü penceresi ───────────────────────────

const EKRANLAR = ['forum', 'sohbet', 'ozel_chat', 'site', 'admin', 'deltax', 'ayarlar', 'hakkinda'];
const SEKMELER = ['profil', 'gorunum', 'dil', 'eklentiler', 'ag'];

// etiketler, sınıf listesinde `sinif` olan açılış etiketlerinin özniteliklerini
// belgedeki sırayla döndürür.
function etiketler(html, sinif) {
  const out = [];
  for (const m of html.matchAll(/<([a-z]+)\s([^>]*)>/g)) {
    const oz = { etiket: m[1] };
    for (const a of m[2].matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:="([^"]*)")?/g)) oz[a[1]] = a[2] === undefined ? '' : a[2];
    if ((oz.class || '').split(/\s+/).includes(sinif)) out.push(oz);
  }
  return out;
}

denetim('kopya-eski-yok', () => {
  for (const [dil, html] of Object.entries(sayfalar)) {
    for (const eski of ['class="terminal"', 't-agac', 'data-panel-icerik', 'data-ipucu-normal']) bekle(!html.includes(eski), `${dil}: eski kopyadan "${eski}" kaldı`);
    bekle(html.includes('data-pencere'), `${dil}: data-pencere yok`);
  }
});

denetim('kopya-ekranlar', () => {
  for (const [dil, html] of Object.entries(sayfalar)) {
    const nav = etiketler(html, 'p-nav');
    bekle(ayni(nav.map((n) => n['data-ekran']), EKRANLAR), `${dil}: kenar çubuğu ekranları: ${nav.map((n) => n['data-ekran']).join(', ')}`);
    bekle(nav.every((n) => n.etiket === 'button'), `${dil}: p-nav düğme değil`);
    const secili = nav.filter((n) => n['aria-current'] === 'page').map((n) => n['data-ekran']);
    bekle(ayni(secili, ['forum']), `${dil}: başlangıçta seçili: ${secili.join(', ')}`);
    const ekran = etiketler(html, 'p-ekran');
    bekle(ayni(ekran.map((e) => e['data-ekran-icerik']), EKRANLAR), `${dil}: ekranlar: ${ekran.map((e) => e['data-ekran-icerik']).join(', ')}`);
    const gorunen = ekran.filter((e) => !('hidden' in e)).map((e) => e['data-ekran-icerik']);
    bekle(ayni(gorunen, ['forum']), `${dil}: JS olmadan görünen ekranlar: ${gorunen.join(', ')}`);
  }
});

denetim('kopya-konular', () => {
  for (const [dil, html] of Object.entries(sayfalar)) {
    const konular = etiketler(html, 'p-konu');
    bekle(konular.length >= 4, `${dil}: ${konular.length} konu (en az 4)`);
    const okumalar = etiketler(html, 'p-okuma');
    bekle(ayni(konular.map((k) => k['data-konu']), okumalar.map((o) => o['data-konu-icerik'])), `${dil}: konu listesi ile okuma alanları eşleşmiyor`);
    bekle(ayni(okumalar.map((o) => 'hidden' in o), okumalar.map((_, i) => i > 0)), `${dil}: yalnızca ilk konu açık olmalı`);
    bekle(konular[0]['aria-current'] === 'true' && konular.slice(1).every((k) => !('aria-current' in k)), `${dil}: ilk konu seçili olmalı`);
    const kategoriler = new Set(etiketler(html, 'p-kat').map((k) => k['data-kategori']));
    bekle(kategoriler.size >= 3, `${dil}: ${kategoriler.size} kategori düğmesi`);
    const yetim = konular.filter((k) => !kategoriler.has(k['data-kategori'])).map((k) => k['data-kategori']);
    bekle(!yetim.length, `${dil}: kenar çubuğunda olmayan kategoriler: ${yetim.join(', ')}`);
  }
});

denetim('kopya-sekmeler', () => {
  for (const [dil, html] of Object.entries(sayfalar)) {
    const sekme = etiketler(html, 'p-sekme');
    bekle(ayni(sekme.map((s) => s['data-sekme']), SEKMELER), `${dil}: sekmeler: ${sekme.map((s) => s['data-sekme']).join(', ')}`);
    const icerik = [...html.matchAll(/data-sekme-icerik="([^"]+)"/g)].map((m) => m[1]);
    bekle(ayni(icerik, SEKMELER), `${dil}: sekme içerikleri: ${icerik.join(', ')}`);
    const kartlar = etiketler(html, 'p-tema-karti');
    bekle(ayni(kartlar.map((k) => k['data-tema-sec']), TEMA_KIMLIKLERI), `${dil}: tema kartları: ${kartlar.map((k) => k['data-tema-sec']).join(', ')}`);
  }
});

denetim('kopya-esitlik', () => {
  for (const oz of ['data-ekran', 'data-ekran-icerik', 'data-konu', 'data-konu-icerik', 'data-kategori', 'data-sekme', 'data-sekme-icerik', 'data-tema-sec']) {
    const dizi = (html) => [...html.matchAll(new RegExp(`\\s${oz}="([^"]*)"`, 'g'))].map((m) => m[1]);
    bekle(ayni(dizi(sayfalar.en), dizi(sayfalar.tr)), `${oz}: EN ve TR farklı`);
  }
});

denetim('id-tekil', () => {
  for (const [dil, html] of Object.entries(sayfalar)) {
    const sayac = {};
    for (const m of html.matchAll(/\sid="([^"]+)"/g)) sayac[m[1]] = (sayac[m[1]] || 0) + 1;
    const tekrar = Object.keys(sayac).filter((k) => sayac[k] > 1);
    bekle(!tekrar.length, `${dil}: birden fazla kez: ${tekrar.join(', ')}`);
  }
});

// ─── Sayfa metinleri ────────────────────────────────────────────────────────

const og = oku('tools/og.html');

denetim('metin-terminal', () => {
  // AND artık varsayılan olarak kendi penceresinde açılır; "terminalde çalışır"
  // demek yanlış olur (terminal arayüzü ancak seçenek olarak anılır).
  const yasak = [/runs in (a|your) terminal/i, /(?<!desktop or )in your terminal\./i, /terminalinde çalışır/i, /bir terminalde çalışır/i, /Terminalde eşten eşe/];
  for (const [ad, metin] of [['en', sayfalar.en], ['tr', sayfalar.tr], ['og.html', og]]) {
    const bulunan = yasak.filter((re) => re.test(metin)).map(String);
    bekle(!bulunan.length, `${ad}: ${bulunan.join(', ')}`);
  }
});

denetim('metin-konu-ac', () => {
  for (const [dil, html] of Object.entries(sayfalar)) {
    const kod = /<code id="derleme-komutlari">([\s\S]*?)<\/code>/.exec(html);
    bekle(kod, `${dil}: derleme komutları yok`);
    bekle(!kod[1].includes('konu_ac'), `${dil}: derleme komutlarında konu_ac var`);
    bekle(kod[1].includes('Eklentiler/forum/and-plugin-forum'), `${dil}: forum eklentisi derlenmiyor`);
  }
});

denetim('metin-surumler', () => {
  // Eski eklenti sürümleri (2026-11-01'deki kopya) kalmamalı.
  for (const [dil, html] of Object.entries(sayfalar)) {
    const eski = ['1.7.1', '2.1.1', '1.3.1'].filter((s) => html.includes(s));
    bekle(!eski.length, `${dil}: eski sürüm numaraları: ${eski.join(', ')}`);
  }
});

denetim('metin-esitlik', () => {
  const say = (html, re) => (html.match(re) || []).length;
  for (const [ad, re] of [['.kv dt', /<dl class="kv">[\s\S]*?<\/dl>/g], ['dt', /<dt>/g], ['details', /<details>/g], ['.agac li', /<li><span class="dal"/g]]) {
    bekle(say(sayfalar.en, re) === say(sayfalar.tr, re), `${ad}: EN ${say(sayfalar.en, re)}, TR ${say(sayfalar.tr, re)}`);
  }
  // Bölüm kimlikleri dile göredir (features / neler-var); sayıları aynı olmalı.
  const bolumler = (html) => [...html.matchAll(/<section class="bolum" id="([^"]+)"/g)].map((m) => m[1]);
  bekle(bolumler(sayfalar.en).length === bolumler(sayfalar.tr).length, `bölüm sayısı: EN ${bolumler(sayfalar.en).length}, TR ${bolumler(sayfalar.tr).length}`);
});

denetim('metin-guncelleme', () => {
  const tarih = [...oku('sitemap.xml').matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  bekle(tarih.length === 2 && tarih.every((t) => t >= '2026-11-25'), `sitemap lastmod: ${tarih.join(', ')}`);
});

if (basarisiz) {
  console.log(`\n${basarisiz} denetim başarısız.`);
  process.exit(1);
}
console.log('\nBütün denetimler geçti.');
