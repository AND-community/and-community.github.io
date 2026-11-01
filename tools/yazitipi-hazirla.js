// Monaspace'ten site için yazı tipi üretir: alt küme + eksen sabitleme
// (subset-font/HarfBuzz), ad tablosunda "Monaspace" ve alt aile adlarının
// değiştirilmesi, woff2'ye sıkıştırma (fontverter).
//
// Neden yeniden adlandırma: Monaspace'in OFL lisansı "Monaspace" adını ve
// Argon/Neon/Xenon/Radon/Krypton alt aile adlarını Ayrılmış Yazı Tipi Adı
// olarak tutar; alt kümelenmiş (değiştirilmiş) bir sürüm bu adları taşıyamaz
// (OFL 1.1, koşul 3). Telif, ticari marka ve lisans kayıtlarına dokunulmaz.
//
// Kullanım: node tools/yazitipi-hazirla.js <girdi.ttf> <çıktı.woff2> <yeni aile adı> <wghtMin> <wghtMax> [kutu]
const fs = require('fs');
// subset-font ve fontverter çalışılan dizinde kurulu olmalı (npm install subset-font@2.9.0);
// başka bir yerdeyse ARACLAR_NPM o dizini göstersin.
const npm = process.env.ARACLAR_NPM ? process.env.ARACLAR_NPM + '/node_modules/' : '';
const subsetFont = require(npm + 'subset-font');
const fontverter = require(npm + 'fontverter');

const [girdi, cikti, yeniAd, wMin, wMax, kutu] = process.argv.slice(2);
const AYRILMIS = /Monaspace|Argon|Neon|Xenon|Radon|Krypton/;
// 0 telif, 7 ticari marka, 8 üretici, 9 tasarımcı, 10 açıklama, 11–12 adresler,
// 13–14 lisans: bunlar bildirimdir, ad değildir; olduğu gibi kalır.
const KORUNAN = new Set([0, 7, 8, 9, 10, 11, 12, 13, 14]);

function karakterler() {
  const araliklar = [
    [0x20, 0x7e], [0xa0, 0xff], [0x100, 0x17f],
    [0x2010, 0x2027], [0x2030, 0x203a], [0x20ac, 0x20ac], [0x2122, 0x2122],
    [0x2190, 0x2193], [0x2713, 0x2713], [0x2717, 0x2717],
  ];
  if (kutu) araliklar.push([0x2500, 0x257f], [0x2580, 0x259f], [0x25a0, 0x25ff]);
  let s = '';
  for (const [a, b] of araliklar) for (let c = a; c <= b; c++) s += String.fromCodePoint(c);
  return s;
}

const utf16 = {
  coz: (b) => { const k = Buffer.from(b); k.swap16(); return k.toString('utf16le'); },
  kodla: (s) => { const k = Buffer.from(s, 'utf16le'); k.swap16(); return k; },
};

function kayitlariOku(tablo) {
  if (tablo.readUInt16BE(0) !== 0) throw new Error('yalnızca biçim 0 ad tablosu destekleniyor');
  const sayi = tablo.readUInt16BE(2), depo = tablo.readUInt16BE(4);
  const kayitlar = [];
  for (let i = 0; i < sayi; i++) {
    const o = 6 + i * 12;
    const [pid, eid, lid, nid, uz, of] = [0, 2, 4, 6, 8, 10].map((d) => tablo.readUInt16BE(o + d));
    const ham = tablo.subarray(depo + of, depo + of + uz);
    kayitlar.push({ pid, eid, lid, nid, metin: pid === 1 ? ham.toString('latin1') : utf16.coz(ham) });
  }
  return kayitlar;
}

// HarfBuzz alt kümede telif/lisans gibi bildirim kayıtlarını düşürür; OFL'nin
// istediği bildirimler yazı tipinin içinde de kalsın diye bunlar orijinalden
// olduğu gibi geri eklenir.
function adlariDegistir(tablo, orijinal) {
  const psAd = yeniAd.replace(/ /g, '');
  const kayitlar = kayitlariOku(tablo).filter((k) => !KORUNAN.has(k.nid));
  for (const k of kayitlar) {
    k.metin = k.metin
      .replace(/Monaspace ?(Argon|Neon|Xenon|Radon|Krypton)/g, (m) => (m.includes(' ') ? yeniAd : psAd))
      .replace(/Monaspace/g, 'AND Site');
    if (AYRILMIS.test(k.metin)) throw new Error(`ad kaydı ${k.nid} hâlâ ayrılmış bir ad içeriyor: ${k.metin}`);
  }
  kayitlar.push(...kayitlariOku(orijinal).filter((k) => KORUNAN.has(k.nid)));
  kayitlar.sort((a, b) => a.pid - b.pid || a.eid - b.eid || a.lid - b.lid || a.nid - b.nid);
  for (const k of kayitlar) k.veri = k.pid === 1 ? Buffer.from(k.metin, 'latin1') : utf16.kodla(k.metin);
  const sayi = kayitlar.length;
  const bas = Buffer.alloc(6 + sayi * 12);
  bas.writeUInt16BE(0, 0); bas.writeUInt16BE(sayi, 2); bas.writeUInt16BE(6 + sayi * 12, 4);
  let of = 0;
  kayitlar.forEach((k, i) => {
    const o = 6 + i * 12;
    [k.pid, k.eid, k.lid, k.nid, k.veri.length, of].forEach((v, j) => bas.writeUInt16BE(v, o + j * 2));
    of += k.veri.length;
  });
  return { tablo: Buffer.concat([bas, ...kayitlar.map((k) => k.veri)]), kayitlar };
}

function toplam(b) {
  let s = 0;
  const p = Buffer.concat([b, Buffer.alloc((4 - (b.length % 4)) % 4)]);
  for (let i = 0; i < p.length; i += 4) s = (s + p.readUInt32BE(i)) >>> 0;
  return s;
}

// Tabloları değiştirilmiş hâlleriyle yeniden dizer; ofsetleri, tablo
// sağlamalarını ve head.checkSumAdjustment'ı yeniden hesaplar.
function yenidenKur(font, degisen) {
  const n = font.readUInt16BE(4);
  const tablolar = [];
  for (let i = 0; i < n; i++) {
    const o = 12 + i * 16;
    const etiket = font.toString('latin1', o, o + 4);
    const of = font.readUInt32BE(o + 8), uz = font.readUInt32BE(o + 12);
    tablolar.push({ etiket, veri: Buffer.from(degisen[etiket] || font.subarray(of, of + uz)) });
  }
  tablolar.sort((a, b) => (a.etiket < b.etiket ? -1 : 1));
  const head = tablolar.find((t) => t.etiket === 'head');
  head.veri.writeUInt32BE(0, 8);
  const us = Math.floor(Math.log2(n));
  const bas = Buffer.alloc(12 + n * 16);
  bas.writeUInt32BE(font.readUInt32BE(0), 0);
  bas.writeUInt16BE(n, 4); bas.writeUInt16BE(2 ** us * 16, 6); bas.writeUInt16BE(us, 8); bas.writeUInt16BE(n * 16 - 2 ** us * 16, 10);
  let of = bas.length;
  const parcalar = [];
  tablolar.forEach((t, i) => {
    const o = 12 + i * 16;
    bas.write(t.etiket, o, 'latin1');
    bas.writeUInt32BE(toplam(t.veri), o + 4);
    bas.writeUInt32BE(of, o + 8);
    bas.writeUInt32BE(t.veri.length, o + 12);
    const dolgu = Buffer.alloc((4 - (t.veri.length % 4)) % 4);
    parcalar.push(t.veri, dolgu);
    of += t.veri.length + dolgu.length;
  });
  const sonuc = Buffer.concat([bas, ...parcalar]);
  const headOf = sonuc.readUInt32BE(12 + tablolar.indexOf(head) * 16 + 8);
  sonuc.writeUInt32BE((0xb1b0afba - toplam(sonuc)) >>> 0, headOf + 8);
  return sonuc;
}

(async () => {
  const kaynak = fs.readFileSync(girdi);
  const eksen = { wdth: 100, slnt: 0, wght: Number(wMin) === Number(wMax) ? Number(wMin) : { min: Number(wMin), max: Number(wMax) } };
  const ttf = await subsetFont(kaynak, karakterler(), { targetFormat: 'truetype', variationAxes: eksen });
  const adTablosu = (f) => {
    for (let i = 0; i < f.readUInt16BE(4); i++) {
      const o = 12 + i * 16;
      if (f.toString('latin1', o, o + 4) === 'name') return f.subarray(f.readUInt32BE(o + 8), f.readUInt32BE(o + 8) + f.readUInt32BE(o + 12));
    }
    throw new Error('ad tablosu yok');
  };
  const { tablo, kayitlar } = adlariDegistir(adTablosu(ttf), adTablosu(kaynak));
  const yeni = yenidenKur(ttf, { name: tablo });
  const woff2 = await fontverter.convert(yeni, 'woff2');
  fs.writeFileSync(cikti, woff2);
  const goster = [...new Map(kayitlar.filter((k) => [1, 4, 6, 7, 13].includes(k.nid)).map((k) => [k.nid, k.metin.slice(0, 60)])).entries()];
  console.log(`${cikti.split(/[\\/]/).pop()}: ${(woff2.length / 1024).toFixed(1)} KB; adlar: ${goster.map(([i, m]) => `${i}=${m}`).join(' | ')}`);
})().catch((e) => { console.error('HATA', e.message); process.exit(1); });
