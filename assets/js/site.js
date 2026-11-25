// AND web sitesi: tema seçimi, masaüstü penceresi kopyasının davranışı,
// açılıştaki eş bağlantısı animasyonu, son sürümün GitHub'dan bulunması ve kopyalama
// düğmeleri. Dışarıdan yüklenen tek şey GitHub API'sine giden sürüm sorgusudur.
(() => {
  'use strict';

  const kok = document.documentElement;
  const dil = kok.lang === 'tr' ? 'tr' : 'en';
  const sayi = (n) => new Intl.NumberFormat(dil, { maximumFractionDigits: 1 }).format(n);

  const M = {
    en: {
      temaAdi: { klasik: 'Classic', turkuaz: 'Turquoise', 'gece-moru': 'Night Purple', kehribar: 'Amber', orman: 'Forest', gul: 'Rose', okyanus: 'Ocean', 'gun-batimi': 'Sunset', lavanta: 'Lavender', mono: 'Mono' },
      es: (n) => `${n} ${n === 1 ? 'peer' : 'peers'} connected`,
      dugum: (n) => `${n} AND ${n === 1 ? 'node' : 'nodes'}`,
      baglaniyor: 'connecting to the network…',
      kopyala: 'Copy',
      kopyalandi: 'Copied',
      denetleniyor: 'Checking GitHub for the latest release…',
      surumYok: 'No release has been published yet. Until the first one is out, build AND from source as shown below.',
      ulasilamadi: 'GitHub couldn’t be reached to check for releases.',
      arsivYok: 'This release has no ready-to-run archives. Pick a file on its release page, or build from source.',
      yayimlandi: (t) => `released ${t}`,
      indir: (p) => `Download for ${p}`,
      digerleri: 'Other platforms',
      hepsi: 'All platforms',
      mobil: 'AND runs on desktop computers with Windows, Linux or macOS.',
      notlar: 'Release notes',
      arsivNot: 'Extract the archive and run and (and.exe on Windows). The plugins are already in place, and AND keeps itself and its plugins up to date.',
      ozetNot: ['Check your download against ', ', and that file against its signature, ', ', with the key in the Security section.'],
    },
    tr: {
      temaAdi: { klasik: 'Klasik', turkuaz: 'Turkuaz', 'gece-moru': 'Gece Moru', kehribar: 'Kehribar', orman: 'Orman', gul: 'Gül', okyanus: 'Okyanus', 'gun-batimi': 'Gün Batımı', lavanta: 'Lavanta', mono: 'Mono' },
      es: (n) => `${n} eş bağlı`,
      dugum: (n) => `${n} AND düğümü`,
      baglaniyor: 'ağa bağlanıyor…',
      kopyala: 'Kopyala',
      kopyalandi: 'Kopyalandı',
      denetleniyor: 'GitHub’da son sürüme bakılıyor…',
      surumYok: 'Henüz yayımlanmış bir sürüm yok. İlki çıkana kadar AND’ı aşağıdaki gibi kaynaktan derleyebilirsin.',
      ulasilamadi: 'Sürümlere bakmak için GitHub’a ulaşılamadı.',
      arsivYok: 'Bu sürümde çalıştırılmaya hazır arşiv yok. Sürüm sayfasından bir dosya seç ya da kaynaktan derle.',
      yayimlandi: (t) => `${t} tarihinde yayımlandı`,
      indir: (p) => `${p} için indir`,
      digerleri: 'Diğer platformlar',
      hepsi: 'Bütün platformlar',
      mobil: 'AND, Windows, Linux ya da macOS çalıştıran masaüstü bilgisayarlarda çalışır.',
      notlar: 'Sürüm notları',
      arsivNot: 'Arşivi aç ve içindeki and’ı (Windows’ta and.exe) çalıştır. Eklentiler yerinde; AND kendini ve eklentilerini güncel tutar.',
      ozetNot: ['İndirdiğin dosyayı ', ' ile, o dosyayı da imzası ', ' ve Güvenlik bölümündeki anahtarla denetleyebilirsin.'],
    },
  }[dil];

  const PLATFORM = {
    en: { 'windows-amd64': 'Windows (x86-64)', 'linux-amd64': 'Linux (x86-64)', 'linux-arm64': 'Linux (ARM64)', 'darwin-arm64': 'macOS (Apple silicon)', 'darwin-amd64': 'macOS (Intel)' },
    tr: { 'windows-amd64': 'Windows (x86-64)', 'linux-amd64': 'Linux (x86-64)', 'linux-arm64': 'Linux (ARM64)', 'darwin-arm64': 'macOS (Apple Silicon)', 'darwin-amd64': 'macOS (Intel)' },
  }[dil];
  const PLATFORM_SIRASI = ['windows-amd64', 'linux-amd64', 'linux-arm64', 'darwin-arm64', 'darwin-amd64'];

  const el = (etiket, sinif, metin) => {
    const d = document.createElement(etiket);
    if (sinif) d.className = sinif;
    if (metin !== undefined) d.textContent = metin;
    return d;
  };

  // ─── Tema ────────────────────────────────────────────────────────────────

  const TEMALAR = ['klasik', 'turkuaz', 'gece-moru', 'kehribar', 'orman', 'gul', 'okyanus', 'gun-batimi', 'lavanta', 'mono'];
  const ZEMIN = { klasik: '#0e0c24', turkuaz: '#0a0f15', 'gece-moru': '#0f091c', kehribar: '#130f10', orman: '#0a0f0f', gul: '#180a15', okyanus: '#0a0f19', 'gun-batimi': '#180b0f', lavanta: '#0f0f1c', mono: '#0f0e14' };

  function temaUygula(id, kaydet) {
    if (!TEMALAR.includes(id)) id = 'klasik';
    kok.dataset.tema = id;
    document.querySelectorAll('[data-tema-sec]').forEach((d) => {
      const etkin = d.dataset.temaSec === id;
      d.setAttribute('aria-pressed', String(etkin));
      d.classList.toggle('etkin', etkin);
      const isaret = d.querySelector('[data-etkin]');
      if (isaret) isaret.hidden = !etkin;
    });
    document.querySelectorAll('[data-tema-adi]').forEach((d) => { d.textContent = M.temaAdi[id]; });
    const renk = document.querySelector('meta[name="theme-color"]');
    if (renk) renk.content = ZEMIN[id];
    if (kaydet) {
      try { localStorage.setItem('and-tema', id); } catch (e) { /* tarayıcı depolamaya izin vermiyor */ }
    }
  }

  document.addEventListener('click', (olay) => {
    const d = olay.target.closest('[data-tema-sec]');
    if (d) temaUygula(d.dataset.temaSec, true);
  });
  temaUygula(kok.dataset.tema, false);

  // ─── Masaüstü penceresi kopyası ────────────────────────────────────────────
  // Uygulamadaki gibi: kenar çubuğu ekranı değiştirir, Forum'un altındaki
  // kategoriler konu listesini süzer, listeden bir konu açılır, Ayarlar'ın
  // sekmeleri değişir. Dar pencerede forumda ya liste ya konu görünür; konuya
  // girince geri düğmesi çıkar. Tema kartları belge düzeyindeki
  // [data-tema-sec] dinleyicisine düşer. Bütün öğeler gerçek düğmedir; Enter
  // ve Space onları tarayıcının kendisi tıklatır.

  const pencere = document.querySelector('[data-pencere]');
  if (pencere) {
    const hepsi = (s) => Array.from(pencere.querySelectorAll(s));
    const konular = hepsi('.p-konu');
    const okumaAlani = pencere.querySelector('.p-forum .p-sag');
    const geri = pencere.querySelector('[data-geri]');
    const gorunur = (x) => !!x && x.getClientRects().length > 0;
    let kategori = null;

    const sec = (ogeler, oge, ozellik, deger) => ogeler.forEach((x) => {
      if (x === oge) x.setAttribute(ozellik, deger);
      else x.removeAttribute(ozellik);
    });

    const ekranAc = (id) => {
      sec(hepsi('.p-nav'), hepsi('.p-nav').find((n) => n.dataset.ekran === id), 'aria-current', 'page');
      hepsi('[data-ekran-icerik]').forEach((x) => { x.hidden = x.dataset.ekranIcerik !== id; });
      pencere.removeAttribute('data-okuma');
    };

    const konuAc = (konu) => {
      sec(konular, konu, 'aria-current', 'true');
      hepsi('[data-konu-icerik]').forEach((x) => { x.hidden = x.dataset.konuIcerik !== konu.dataset.konu; });
      if (okumaAlani) okumaAlani.scrollTop = 0;
    };

    // suz, konu listesini bir kategoriye indirir (kat boşsa hepsi); açık konu
    // süzgecin dışında kalırsa listedeki ilk konu açılır.
    const suz = (kat) => {
      kategori = kat;
      hepsi('.p-kat').forEach((k) => k.setAttribute('aria-pressed', String(k.dataset.kategori === kat)));
      konular.forEach((k) => { k.hidden = !!kat && k.dataset.kategori !== kat; });
      const acik = konular.find((k) => k.getAttribute('aria-current') === 'true');
      if (!acik || acik.hidden) {
        const ilk = konular.find((k) => !k.hidden);
        if (ilk) konuAc(ilk);
      }
    };

    pencere.addEventListener('click', (olay) => {
      const nav = olay.target.closest('.p-nav');
      if (nav) {
        ekranAc(nav.dataset.ekran);
        if (nav.dataset.ekran === 'forum') suz(null);
        return;
      }
      const kat = olay.target.closest('.p-kat');
      if (kat) {
        ekranAc('forum');
        suz(kategori === kat.dataset.kategori ? null : kat.dataset.kategori);
        return;
      }
      const konu = olay.target.closest('.p-konu');
      if (konu) {
        konuAc(konu);
        pencere.setAttribute('data-okuma', '');
        // Dar pencerede liste gizlenir; odak geri düğmesine geçer.
        if (gorunur(geri)) geri.focus();
        return;
      }
      if (olay.target.closest('[data-geri]')) {
        pencere.removeAttribute('data-okuma');
        const acik = konular.find((k) => k.getAttribute('aria-current') === 'true');
        if (acik) acik.focus();
        return;
      }
      const sekme = olay.target.closest('.p-sekme');
      if (sekme) {
        sec(hepsi('.p-sekme'), sekme, 'aria-current', 'true');
        hepsi('[data-sekme-icerik]').forEach((x) => { x.hidden = x.dataset.sekmeIcerik !== sekme.dataset.sekme; });
      }
    });

    // Kenar çubuğunda ↑ ↓ Home End odağı görünen öğeler arasında gezdirir;
    // ekranı Enter ya da Space açar.
    const kenar = pencere.querySelector('.p-kenar');
    if (kenar) {
      kenar.addEventListener('keydown', (olay) => {
        const ogeler = Array.from(kenar.querySelectorAll('.p-nav, .p-kat')).filter(gorunur);
        const i = ogeler.indexOf(document.activeElement);
        if (i < 0) return;
        const j = { ArrowDown: Math.min(i + 1, ogeler.length - 1), ArrowUp: Math.max(i - 1, 0), Home: 0, End: ogeler.length - 1 }[olay.key];
        if (j === undefined) return;
        olay.preventDefault();
        ogeler[j].focus();
      });
    }
  }

  // ─── Açılış: eşler bağlanır ───────────────────────────────────────────────
  // Uygulama açıldığında durum çubuğunda önce "ağa bağlanıyor…" yazar, sonra
  // bağlanan eşlerin ve AND düğümlerinin sayısı artar. Hareket azaltma
  // tercihinde durum çubuğu son hâliyle (HTML'deki gibi) kalır.

  const durumYerleri = document.querySelectorAll('[data-es]');
  if (durumYerleri.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const yaz = (html) => durumYerleri.forEach((y) => { y.innerHTML = html; });
    const durum = (es, dugum) => `<i class="p-nokta iyi"></i>${M.es(es)}<span class="p-ayrac" aria-hidden="true"></span><span class="p-soluk">${M.dugum(dugum)}</span>`;
    yaz(`<i class="p-nokta uyari"></i><span class="p-uyari">${M.baglaniyor}</span>`);
    [[1, 0], [4, 1], [9, 2], [15, 3], [23, 4]].forEach(([es, dugum], i) => {
      setTimeout(() => yaz(durum(es, dugum)), 900 + i * 320);
    });
  }

  // ─── Son sürüm ───────────────────────────────────────────────────────────

  const SURUM_API = 'https://api.github.com/repos/AND-community/AND/releases/latest';
  const INDIRME = 'https://github.com/AND-community/AND/releases/download/';
  const SURUM_SAYFASI = 'https://github.com/AND-community/AND/releases';

  function platformBul() {
    const ua = navigator.userAgent;
    const p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    if (/android|iphone|ipad|ipod/i.test(ua) || (/mac/i.test(p) && navigator.maxTouchPoints > 1)) return 'mobil';
    if (/win/i.test(p) || /windows/i.test(ua)) return 'windows-amd64';
    if (/mac/i.test(p) || /mac os x/i.test(ua)) return 'darwin-arm64';
    if (/linux/i.test(p) || /linux/i.test(ua)) return /aarch64|arm64/i.test(ua + p) ? 'linux-arm64' : 'linux-amd64';
    return null;
  }

  async function surumuGetir() {
    try {
      const k = JSON.parse(sessionStorage.getItem('and-surum') || 'null');
      if (k && Date.now() - k.zaman < 10 * 60 * 1000) return k.veri;
    } catch (e) { /* önbellek yok */ }
    const iptal = new AbortController();
    const sure = setTimeout(() => iptal.abort(), 8000);
    let veri;
    try {
      const y = await fetch(SURUM_API, { headers: { Accept: 'application/vnd.github+json' }, signal: iptal.signal });
      if (y.status === 404) {
        veri = { yok: true };
      } else if (y.ok) {
        const j = await y.json();
        veri = {
          etiket: String(j.tag_name || ''),
          tarih: j.published_at,
          sayfa: String(j.html_url || ''),
          dosyalar: (j.assets || []).map((d) => ({ ad: String(d.name), adres: String(d.browser_download_url), boyut: Number(d.size) || 0 })),
        };
      } else {
        return { hata: true };
      }
    } catch (e) {
      return { hata: true };
    } finally {
      clearTimeout(sure);
    }
    try { sessionStorage.setItem('and-surum', JSON.stringify({ zaman: Date.now(), veri })); } catch (e) { /* önbelleğe yazılamadı */ }
    return veri;
  }

  const guvenliDosya = (d) => d.adres.startsWith(INDIRME);
  const baglanti = (adres, metin, sinif) => {
    const b = el('a', sinif, metin);
    b.href = adres;
    return b;
  };

  async function surumGoster() {
    const kutu = document.querySelector('[data-indir]');
    if (!kutu) return;
    const yedek = Array.from(kutu.childNodes);
    kutu.replaceChildren(el('p', 'indir-durum', M.denetleniyor));
    const v = await surumuGetir();

    if (v.yok) {
      kutu.replaceChildren(el('p', 'indir-durum', M.surumYok));
      return;
    }
    if (v.hata) {
      const p = el('p', 'indir-durum', M.ulasilamadi + ' ');
      kutu.replaceChildren(p, ...yedek);
      return;
    }

    const arsivler = {};
    for (const d of v.dosyalar) {
      const m = /^AND-.+-(windows|linux|darwin)-(amd64|arm64)\.(zip|tar\.gz)$/.exec(d.ad);
      if (m && guvenliDosya(d)) arsivler[`${m[1]}-${m[2]}`] = d;
    }
    const surumSayfasi = v.sayfa.startsWith(SURUM_SAYFASI) ? v.sayfa : SURUM_SAYFASI;

    const ust = el('p', 'indir-surum');
    ust.append(el('strong', '', `AND ${v.etiket}`));
    if (v.tarih) {
      const t = new Intl.DateTimeFormat(dil, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(v.tarih));
      ust.append(' ', el('span', 'soluk', M.yayimlandi(t)));
    }
    ust.append(' ', baglanti(surumSayfasi, M.notlar));
    const parcalar = [ust];

    const anahtarlar = PLATFORM_SIRASI.filter((p) => arsivler[p]);
    if (!anahtarlar.length) {
      parcalar.push(el('p', 'indir-durum', M.arsivYok));
      kutu.replaceChildren(...parcalar);
      return;
    }

    const bu = platformBul();
    const bilgi = (d) => `${d.ad}, ${sayi(d.boyut / 1048576)} MB`;
    if (bu && arsivler[bu]) {
      const ana = el('p', 'indir-ana');
      ana.append(baglanti(arsivler[bu].adres, M.indir(PLATFORM[bu]), 'dugme dugme-dolu'), el('span', 'soluk', bilgi(arsivler[bu])));
      parcalar.push(ana);
    } else if (bu === 'mobil') {
      parcalar.push(el('p', '', M.mobil));
    }

    const digerleri = anahtarlar.filter((p) => p !== bu || !arsivler[bu]);
    if (digerleri.length) {
      parcalar.push(el('p', 'soluk', bu && arsivler[bu] ? M.digerleri : M.hepsi));
      const liste = el('ul', 'platformlar');
      for (const p of digerleri) {
        const li = el('li');
        li.append(baglanti(arsivler[p].adres, PLATFORM[p]), el('span', 'soluk', bilgi(arsivler[p])));
        liste.append(li);
      }
      parcalar.push(liste);
    }

    parcalar.push(el('p', 'soluk', M.arsivNot));
    const ozet = v.dosyalar.find((d) => d.ad === 'SHA256SUMS.txt' && guvenliDosya(d));
    const imza = v.dosyalar.find((d) => d.ad === 'SHA256SUMS.txt.sig' && guvenliDosya(d));
    if (ozet && imza) {
      const p = el('p', 'soluk');
      p.append(M.ozetNot[0], baglanti(ozet.adres, ozet.ad), M.ozetNot[1], baglanti(imza.adres, imza.ad), M.ozetNot[2]);
      parcalar.push(p);
    }
    kutu.replaceChildren(...parcalar);
  }

  surumGoster();

  // ─── Kopyalama ───────────────────────────────────────────────────────────

  document.addEventListener('click', async (olay) => {
    const d = olay.target.closest('[data-kopyala]');
    if (!d) return;
    const hedef = document.getElementById(d.dataset.kopyala);
    if (!hedef) return;
    try {
      await navigator.clipboard.writeText(hedef.textContent);
      d.textContent = M.kopyalandi;
    } catch (e) {
      const aralik = document.createRange();
      aralik.selectNodeContents(hedef);
      const secim = window.getSelection();
      secim.removeAllRanges();
      secim.addRange(aralik);
    }
    setTimeout(() => { d.textContent = M.kopyala; }, 2000);
  });
})();
