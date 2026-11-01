// AND'ın logosundan (tools/logo.png, 500×500, saydam zemin) sitenin
// simgelerini üretir: assets/img/logo.png (192×192, üst çubuk, alt bilgi ve
// paylaşım görseli için), favicon.ico (16, 32, 48) ve
// assets/img/apple-touch-icon.png (180×180; iOS saydamlığı desteklemediği
// için koyu zemin üzerinde).
//
// Kullanım (sitenin kök dizininde):
//   node tools/simge-uret.js
//   node tools/simge-uret.js --png <çıktı.png> <boyut> --ico <çıktı.ico> <boyut,boyut,...>
// İkinci biçim yalnızca istenen dosyaları yazar; AND deposundaki README
// logosu ve Windows simgesi (cmd/and/winres/icon.ico) böyle üretildi.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const KOK = path.resolve(__dirname, '..');
const ZEMIN = [0x0e, 0x0c, 0x24]; // sitenin --ink rengi

// ─── PNG okuma/yazma (8 bit, taramasız) ───────────────────────────────────

function pngOku(yol) {
  const b = fs.readFileSync(yol);
  let o = 8, w = 0, h = 0, tur = 0;
  const idat = [];
  while (o < b.length) {
    const uz = b.readUInt32BE(o), ad = b.toString('latin1', o + 4, o + 8);
    const veri = b.subarray(o + 8, o + 8 + uz);
    if (ad === 'IHDR') {
      w = veri.readUInt32BE(0); h = veri.readUInt32BE(4); tur = veri[9];
      if (veri[8] !== 8 || veri[12] !== 0 || (tur !== 6 && tur !== 2)) throw new Error(`${yol}: yalnızca 8 bit RGB/RGBA, taramasız PNG`);
    } else if (ad === 'IDAT') idat.push(veri);
    o += 12 + uz;
  }
  const kanal = tur === 6 ? 4 : 3;
  const satir = w * kanal;
  const ham = zlib.inflateSync(Buffer.concat(idat));
  const g = Buffer.alloc(h * satir);
  for (let y = 0; y < h; y++) {
    const f = ham[y * (satir + 1)];
    for (let i = 0; i < satir; i++) {
      const a = i >= kanal ? g[y * satir + i - kanal] : 0;
      const b2 = y > 0 ? g[(y - 1) * satir + i] : 0;
      const c = y > 0 && i >= kanal ? g[(y - 1) * satir + i - kanal] : 0;
      let t = 0;
      if (f === 1) t = a;
      else if (f === 2) t = b2;
      else if (f === 3) t = (a + b2) >> 1;
      else if (f === 4) {
        const p = a + b2 - c, pa = Math.abs(p - a), pb = Math.abs(p - b2), pc = Math.abs(p - c);
        t = pa <= pb && pa <= pc ? a : pb <= pc ? b2 : c;
      }
      g[y * satir + i] = (ham[y * (satir + 1) + 1 + i] + t) & 255;
    }
  }
  const px = new Float64Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const al = kanal === 4 ? g[i * 4 + 3] / 255 : 1;
    for (let k = 0; k < 3; k++) px[i * 4 + k] = (g[i * kanal + k] / 255) * al; // önceden çarpılmış
    px[i * 4 + 3] = al;
  }
  return { w, h, px };
}

const crcTablo = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function parca(ad, veri) {
  const b = Buffer.alloc(12 + veri.length);
  b.writeUInt32BE(veri.length, 0);
  b.write(ad, 4, 'latin1');
  veri.copy(b, 8);
  let c = 0xffffffff;
  for (const x of b.subarray(4, 8 + veri.length)) c = crcTablo[(c ^ x) & 255] ^ (c >>> 8);
  b.writeUInt32BE((c ^ 0xffffffff) >>> 0, 8 + veri.length);
  return b;
}

function pngYaz({ w, h, px }) {
  const ham = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, o = y * (w * 4 + 1) + 1 + x * 4;
      const al = px[i + 3];
      for (let k = 0; k < 3; k++) ham[o + k] = al > 0 ? Math.round(Math.min(1, px[i + k] / al) * 255) : 0;
      ham[o + 3] = Math.round(al * 255);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    parca('IHDR', ihdr), parca('IDAT', zlib.deflateSync(ham, { level: 9 })), parca('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Küçültme ve yerleştirme ──────────────────────────────────────────────

// Her hedef pikselin kaynakta kapladığı alanın ortalaması (önceden çarpılmış
// alfa ile): çizginin ne kadarı pikselin içine düşüyorsa o kadar koyu olur.
function agirliklar(kaynak, hedef) {
  const s = kaynak / hedef;
  return Array.from({ length: hedef }, (_, t) => {
    const a = t * s, b = (t + 1) * s, liste = [];
    for (let x = Math.floor(a); x < Math.ceil(b); x++) {
      const p = Math.min(b, x + 1) - Math.max(a, x);
      if (p > 0) liste.push([x, p / s]);
    }
    return liste;
  });
}

function kucult(g, n) {
  const yatay = agirliklar(g.w, n), dikey = agirliklar(g.h, n);
  const ara = new Float64Array(n * g.h * 4);
  for (let y = 0; y < g.h; y++) {
    for (let t = 0; t < n; t++) {
      for (const [x, p] of yatay[t]) for (let k = 0; k < 4; k++) ara[(y * n + t) * 4 + k] += g.px[(y * g.w + x) * 4 + k] * p;
    }
  }
  const px = new Float64Array(n * n * 4);
  for (let t = 0; t < n; t++) {
    for (const [y, p] of dikey[t]) {
      for (let x = 0; x < n; x++) for (let k = 0; k < 4; k++) px[(t * n + x) * 4 + k] += ara[(y * n + x) * 4 + k] * p;
    }
  }
  return { w: n, h: n, px };
}

// Logoyu n×n'lik düz renkli bir zeminin ortasına, kenarlarda pay bırakarak koyar.
function zeminde(g, n, pay, renk) {
  const ic = kucult(g, n - 2 * pay);
  const px = new Float64Array(n * n * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = (y * n + x) * 4;
      const ix = x - pay, iy = y - pay;
      const j = ix >= 0 && iy >= 0 && ix < ic.w && iy < ic.h ? (iy * ic.w + ix) * 4 : -1;
      const al = j >= 0 ? ic.px[j + 3] : 0;
      for (let k = 0; k < 3; k++) px[i + k] = (j >= 0 ? ic.px[j + k] : 0) + (renk[k] / 255) * (1 - al);
      px[i + 3] = 1;
    }
  }
  return { w: n, h: n, px };
}

// Her boyutu PNG olarak taşıyan .ico (Windows Vista'dan beri desteklenir).
function icoYaz(g, boyutlar) {
  const resimler = boyutlar.map((n) => pngYaz(kucult(g, n)));
  const bas = Buffer.alloc(6 + 16 * boyutlar.length);
  bas.writeUInt16LE(0, 0); bas.writeUInt16LE(1, 2); bas.writeUInt16LE(boyutlar.length, 4);
  let konum = bas.length;
  boyutlar.forEach((n, i) => {
    const o = 6 + 16 * i;
    bas[o] = n >= 256 ? 0 : n; bas[o + 1] = n >= 256 ? 0 : n;
    bas.writeUInt16LE(1, o + 4); bas.writeUInt16LE(32, o + 6);
    bas.writeUInt32LE(resimler[i].length, o + 8); bas.writeUInt32LE(konum, o + 12);
    konum += resimler[i].length;
  });
  return Buffer.concat([bas, ...resimler]);
}

function yaz(yol, veri) {
  fs.mkdirSync(path.dirname(yol), { recursive: true });
  fs.writeFileSync(yol, veri);
  console.log(`${path.relative(process.cwd(), yol) || yol}: ${(veri.length / 1024).toFixed(1)} KB`);
}

// ─── Komut satırı ─────────────────────────────────────────────────────────

const arg = process.argv.slice(2);
const kaynak = arg[0] && !arg[0].startsWith('--') ? arg.shift() : path.join(KOK, 'tools/logo.png');
const logo = pngOku(kaynak);
if (logo.w !== logo.h) throw new Error('logo kare olmalı');

if (arg.length === 0) {
  yaz(path.join(KOK, 'assets/img/logo.png'), pngYaz(kucult(logo, 192)));
  yaz(path.join(KOK, 'favicon.ico'), icoYaz(logo, [16, 32, 48]));
  yaz(path.join(KOK, 'assets/img/apple-touch-icon.png'), pngYaz(zeminde(logo, 180, 22, ZEMIN)));
} else {
  while (arg.length) {
    const [tur, cikti, deger] = arg.splice(0, 3);
    if (tur === '--png') yaz(path.resolve(cikti), pngYaz(kucult(logo, Number(deger))));
    else if (tur === '--ico') yaz(path.resolve(cikti), icoYaz(logo, deger.split(',').map(Number)));
    else throw new Error(`bilinmeyen seçenek: ${tur}`);
  }
}
