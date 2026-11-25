'use strict';
// AND web sitesinin sayfalarını üretir: index.html (İngilizce), tr/index.html
// (Türkçe), 404.html ve sitemap.xml. İki dil aynı şablondan çıkar, yapıları
// hiç ayrışmaz; metinler aşağıdaki M (sayfa) ve R (ana ekran kopyası)
// tablolarındadır. Kopyanın metinleri AND'ın çeviri kataloğundan (AND
// deposunda dil/ceviriler) alındı; uygulamanın ana ekranı değişirse burası da
// güncellenmeli. Kullanım: node tools/olustur.js
const fs = require('fs');
const path = require('path');
const { pencere } = require('./pencere');

const KOK = path.resolve(__dirname, '..');
const SITE = 'https://and-community.github.io';
const ORG = 'https://github.com/AND-community';
const DEPO = `${ORG}/AND`;
const DOSYA = `${DEPO}/blob/main`;
const SURUM = 'v0.1.0';
const GUNCELLEME = '2026-11-01';
const IMZA_ANAHTARI = '40f36782755018ac90475013594691b41886813ab842148d537b4f44fddd89a4';

const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const a = (href, metin, ek = '') => `<a href="${e(href)}"${ek}>${metin}</a>`;

// AND'ın logosu (küre) ve ondan üretilen simgeler: node tools/simge-uret.js
const SIMGELER = `<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/assets/img/logo.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">`;
const MARKA = '<img src="/assets/img/logo.png" width="28" height="28" alt=""><span class="hap">AND</span>';

// AND'ın yerleşik temaları (internal/ui/theme.go Presets): vurgu, seçim
// zemini, kişi adı ve rozet renkleri; site.css'teki tema blokları aynı
// değerleri kullanır.
const TEMALAR = [
  { id: 'klasik', tr: 'Klasik', en: 'Classic', renk: ['#5f5fff', '#5f00ff', '#5fffd7', '#0087ff'] },
  { id: 'turkuaz', tr: 'Turkuaz', en: 'Turquoise', renk: ['#5fd7d7', '#005f5f', '#ffaf87', '#af87ff'] },
  { id: 'gece-moru', tr: 'Gece Moru', en: 'Night Purple', renk: ['#875fff', '#5f00af', '#5fffd7', '#5fafff'] },
  { id: 'kehribar', tr: 'Kehribar', en: 'Amber', renk: ['#ffaf00', '#875f00', '#d7af87', '#87d7ff'] },
  { id: 'orman', tr: 'Orman', en: 'Forest', renk: ['#87d787', '#005f00', '#ffd7af', '#87d7ff'] },
  { id: 'gul', tr: 'Gül', en: 'Rose', renk: ['#ff87af', '#af005f', '#ffd7af', '#87d7ff'] },
  { id: 'okyanus', tr: 'Okyanus', en: 'Ocean', renk: ['#00afff', '#005f87', '#87ffd7', '#ffaf5f'] },
  { id: 'gun-batimi', tr: 'Gün Batımı', en: 'Sunset', renk: ['#ff875f', '#af0000', '#ffd787', '#af87ff'] },
  { id: 'lavanta', tr: 'Lavanta', en: 'Lavender', renk: ['#d7afff', '#5f5faf', '#afd7d7', '#ffafd7'] },
  { id: 'mono', tr: 'Mono', en: 'Mono', renk: ['#eeeeee', '#585858', '#d0d0d0', '#bcbcbc'] },
];

// ui.LogoArt
const LOGO = [
  ' █████╗ ███╗   ██╗██████╗',
  '██╔══██╗████╗  ██║██╔══██╗',
  '███████║██╔██╗ ██║██║  ██║',
  '██╔══██║██║╚██╗██║██║  ██║',
  '██║  ██║██║ ╚████║██████╔╝',
  '╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝',
];

// og.html'deki amblem: bloklar vurgu, gölgeler seçim renginde.
function amblem() {
  return LOGO.map((s) => s.replace(/█+|[^█ ]+/g, (m) => (m[0] === '█' ? `<span class="d">${m}</span>` : `<span class="g">${m}</span>`))).join('\n');
}

// ─── Ağ çizimi ("Nasıl çalışır") ────────────────────────────────────────────

const k = (s) => `<span class="k">${s}</span>`;
const s_ = (s) => `<span class="s">${s}</span>`;
const n_ = (s) => `<span class="n">${s}</span>`;
const m_ = (s) => `<span class="m">${s}</span>`;

function cizim(dil) {
  if (dil === 'en') {
    return [
      k('╭───────╮') + m_('  topic   ') + s_('╭────────╮') + '        ' + s_('╭────────╮'),
      k('│  you  │') + k(' ───────▶ ') + s_('│') + ' node A ' + s_('│') + k(' ─────▶ ') + s_('│') + ' node C ' + s_('│'),
      k('╰───┬───╯') + '          ' + s_('╰───') + k('┬') + s_('────╯') + '        ' + s_('╰────────╯'),
      '    ' + k('│') + ' '.repeat(18) + k('│'),
      '    ' + k('│') + ' '.repeat(18) + k('▼'),
      '    ' + k('│') + ' '.repeat(14) + s_('╭────────╮') + '        ' + s_('╭────────╮'),
      '    ' + k('╰────────────▶ ') + s_('│') + ' node B ' + s_('│') + n_(' ┄┄┄┄▶  ') + s_('│') + ' node D ' + s_('│'),
      ' '.repeat(19) + s_('╰────────╯') + n_('  sync  ') + s_('╰────────╯'),
      ' '.repeat(37) + m_('was offline'),
    ].join('\n');
  }
  return [
    k('╭───────╮') + m_('  konu    ') + s_('╭─────────╮') + '         ' + s_('╭─────────╮'),
    k('│  sen  │') + k(' ───────▶ ') + s_('│') + ' düğüm A ' + s_('│') + k(' ──────▶ ') + s_('│') + ' düğüm C ' + s_('│'),
    k('╰───┬───╯') + '          ' + s_('╰────') + k('┬') + s_('────╯') + '         ' + s_('╰─────────╯'),
    '    ' + k('│') + ' '.repeat(19) + k('│'),
    '    ' + k('│') + ' '.repeat(19) + k('▼'),
    '    ' + k('│') + ' '.repeat(14) + s_('╭─────────╮') + '         ' + s_('╭─────────╮'),
    '    ' + k('╰────────────▶ ') + s_('│') + ' düğüm B ' + s_('│') + n_(' ┄┄┄┄┄▶  ') + s_('│') + ' düğüm D ' + s_('│'),
    ' '.repeat(19) + s_('╰─────────╯') + n_(' senkron ') + s_('╰─────────╯'),
    ' '.repeat(39) + m_('çevrimdışıydı'),
  ].join('\n');
}

// ─── Sayfa metinleri ────────────────────────────────────────────────────────

const M = {
  en: {
    dil: 'en', yerel: 'en_US', yol: '/', diger: { dil: 'tr', yol: '/tr/', ad: 'Türkçe' },
    baslik: 'AND: a forum with no server in the middle',
    aciklama: 'AND is a free, open-source forum, chat and personal-site network that runs in your terminal. It is peer to peer: no accounts and no central server.',
    ogResim: '/assets/img/og.png',
    ogAlt: 'The AND emblem and the line: a forum with no server in the middle.',
    atla: 'Skip to content', ana: 'AND home', navEtiket: 'Main', altNavEtiket: 'Footer',
    nav: [['features', 'What’s in it'], ['how-it-works', 'How it works'], ['get-and', 'Get AND'], ['security', 'Security'], ['questions', 'Questions']],
    h1: 'A forum with no server in the middle.',
    ozet: 'AND runs in your terminal. Topics, chat and private messages travel directly between the people using it, each signed with a key that only its author holds. There are no accounts and no central server.',
    cta1: 'Get AND', cta2: 'Source code on GitHub',
    ekranBaslik: 'AND’s desktop window',
    ekranNot: 'This is AND’s desktop window, drawn in HTML with the app’s own colours and text. Pick a screen in the sidebar, open a topic or try a theme. AND also has a full-screen terminal interface: <code>and --terminal</code>.',
    tema: 'Theme',
    ozellik: {
      id: 'features', baslik: 'What’s in it',
      giris: 'Everything here runs on your computer and on the computers of the people you talk to.',
      liste: [
        ['Forum', '34 categories. A topic reaches peers the moment it’s posted and deletes itself after 5 days.'],
        ['Chat', 'One public channel. Messages are signed, not encrypted, and kept for 48 hours.'],
        ['Private messages', 'Sent straight to the other person over an encrypted connection. If they’re offline, AND keeps the message and delivers it when they’re back, for up to 7 days.'],
        ['Files', 'Send a file to a peer. Nothing arrives without the recipient’s approval, and interrupted transfers resume.'],
        ['Personal site', 'Publish up to 20 pages of your own. They’re signed and synced like the forum, and your edits reach everyone.'],
        ['Moderation', 'The founder signs moderator certificates. Moderators can delete topics early and ban peers for an hour or for good; every decision is signed and logged.'],
        ['Plugins', 'Separate programs that extend AND. Each one asks for the permissions it needs the first time you open it.'],
        ['Themes and languages', 'Six built-in themes, and an interface in Turkish, English, German, Spanish, French and Russian.'],
        ['Updates', 'Official releases update themselves and their plugins, and only after the release’s signature checks out.'],
        ['Search', `The ${a(`${ORG}/and-arama-motoru`, 'AND Search Engine')} joins the network as a read-only peer and makes forum, chat and site content searchable from the terminal.`],
      ],
    },
    nasil: {
      id: 'how-it-works', baslik: 'How it works',
      giris: 'AND has no server to send things to. Every computer running it is a node: it keeps its own copy of what it receives and passes new messages on to the nodes it’s connected to.',
      adimlar: [
        ['You post a topic.', 'AND signs it with your key and publishes it to the nodes you’re connected to.'],
        ['The nodes pass it on.', 'Every node checks the signature before storing anything, and discards messages that are unsigned or have been altered.'],
        ['Each node keeps its own copy', 'in a local database. Topics delete themselves after 5 days, chat messages after 48 hours.'],
        ['A node that was offline catches up', 'when it reconnects, by syncing the history it missed directly with its peers.'],
      ],
      cizimEtiket: 'Diagram: you send a topic to node A and node B; node A passes it on to node C; node D, which was offline, later syncs it from node B.',
      cizimAlt: 'There’s no server in this picture: every box is a computer running AND.',
      son: 'Nodes find each other through the public libp2p DHT on the internet and through mDNS on your local network. Connections are encrypted with the Noise protocol. If you’re behind a NAT, a relay can carry the encrypted traffic, but it can’t read it.',
    },
    kurulum: {
      id: 'get-and', baslik: 'Get AND',
      giris: 'AND runs in a terminal on Windows, Linux and macOS.',
      yedek: `Every release has a ready-to-run archive for each platform on the ${a(`${DEPO}/releases`, 'Releases page')}.`,
      derleBaslik: 'Build from source',
      derle: 'You need Go 1.26.4 or later. These commands build AND and Konu Aç, the plugin that lets you start topics:',
      derleSon: `On Windows, add .exe to the output names and run and.exe. The ${a(`${DEPO}#building-from-source`, 'README')} covers every plugin and build option.`,
    },
    guvenlik: {
      id: 'security', baslik: 'Security',
      giris: 'AND is built so that you don’t have to trust a server, and it tells you plainly what others can see.',
      liste: [
        ['Your identity', 'An Ed25519 key pair made on your computer from 128 bits of randomness and stored encrypted with your password (Argon2id and AES-256-GCM). The 32-character recovery code you get when you create it is the only way to restore it.'],
        ['Signatures', 'Every topic, reply, chat message and moderation decision is signed. Nodes reject anything that’s unsigned or has been altered.'],
        ['What’s public', 'Topics, replies, chat, profiles and personal sites are public: they spread to other nodes and are stored there. AND is pseudonymous, not anonymous; the nodes you connect to can see your IP address.'],
        ['Private messages', 'They travel over a direct, encrypted connection, and your message history is stored encrypted on your computer.'],
        ['Updates', 'Before replacing anything, an official release checks the release’s SHA-256 checksums and their Ed25519 signature. Builds you make from source never update themselves.'],
        ['Plugins', 'Each plugin runs as a separate program with its own API key and only the permissions you approved.'],
        ['Your terminal', 'Text from the network is cleaned of escape sequences and control characters before it’s drawn.'],
        ['Telemetry', 'None. AND doesn’t collect or send usage data or crash reports.'],
      ],
      anahtar: 'Release signing key (Ed25519):',
      son: `Found a vulnerability? Please report it privately, as described in the ${a(`${DOSYA}/SECURITY.md`, 'security policy')} (in Turkish).`,
    },
    projeler: {
      id: 'projects', baslik: 'Projects',
      giris: `AND is split into a few repositories in the ${a(ORG, 'AND-community')} organisation on GitHub.`,
      liste: [
        ['AND', DEPO, 'the app, with the Admin Panel, Private Chat, Website and example plugins and the VS Code extension'],
        ['konu_ac', `${ORG}/konu_ac`, 'the new-topic plugin; you need it to start topics'],
        ['DeltaX', `${ORG}/DeltaX`, 'private groups with their own version control'],
        ['Pembis', `${ORG}/Pembis`, 'a pink theme'],
        ['and-arama-motoru', `${ORG}/and-arama-motoru`, 'AND Search Engine'],
        ['and-community.github.io', `${ORG}/and-community.github.io`, 'this website'],
      ],
    },
    sorular: {
      id: 'questions', baslik: 'Questions',
      liste: [
        ['Is AND anonymous?', 'No. AND is pseudonymous: you appear under a name and a key rather than your real identity, but the nodes you connect to can see your IP address. AND doesn’t hide it for you.'],
        ['Do I need a server, a domain or an account?', 'No. Install AND, pick a name and a password, and you’re on the network. Every node is both a client and a server.'],
        ['How long do posts stay?', 'Topics delete themselves 5 days after they’re posted, chat messages after 48 hours. Content that has already spread can’t be guaranteed to disappear from every node.'],
        ['I forgot my password.', 'Press ctrl+r on the login screen and type your recovery code. AND restores your identity and asks for a new password.'],
        ['I lost my recovery code.', 'If you still know your password, open Settings, go to the Info tab and press m to show the code. If you’ve lost both, nobody can restore your identity: it never leaves your computer.'],
        ['Which systems does it run on?', 'Windows, Linux and macOS, in any terminal. Releases are built for x86-64 on all three, and for ARM64 on Linux and macOS.'],
        ['Is it free?', 'Yes. AND is free software under the GNU AGPL-3.0: you can use, study, change and share it. If you run a modified version for others over a network, you have to offer them its source code.'],
        ['Can I write my own plugin?', `Yes. A plugin is a separate program that talks to AND over a local HTTP API, with its own key. Start from the ${a(`${DEPO}/tree/main/Eklentiler/ornek`, 'example plugin and its guide')} (in Turkish).`],
        ['Who moderates?', 'The founder, whose key is built into AND, and the moderators the founder appoints with signed certificates, which can be revoked at any time. They can delete topics early and ban peers; every node checks each decision’s signature.'],
      ],
    },
    katki: {
      id: 'contribute', baslik: 'Contribute',
      metin: 'AND is developed in the open on GitHub. Report bugs and suggest features in the issue tracker, and read the contribution guide (in Turkish) before you send a pull request.',
      baglantilar: [[`${DEPO}/issues`, 'Issues'], [`${DOSYA}/CONTRIBUTING.md`, 'Contribution guide'], [`${DOSYA}/CODE_OF_CONDUCT.md`, 'Code of conduct']],
    },
    alt: {
      lisans: 'AND is free software under the GNU AGPL-3.0. © 2026 AND contributors.',
      baglantilar: [[DEPO, 'GitHub'], [`${DEPO}/releases`, 'Releases'], [`${DOSYA}/SECURITY.md`, 'Security policy']],
      gizlilik: 'This site sets no cookies and has no analytics. To show the latest release it asks GitHub’s API; nothing else is loaded from another server.',
    },
  },
  tr: {
    dil: 'tr', yerel: 'tr_TR', yol: '/tr/', diger: { dil: 'en', yol: '/', ad: 'English' },
    baslik: 'AND: ortada sunucu olmayan bir forum',
    aciklama: 'AND, terminalde çalışan ücretsiz ve açık kaynaklı bir forum, sohbet ve kişisel site ağıdır. Eşten eşe çalışır: hesap yok, merkezi sunucu yok.',
    ogResim: '/assets/img/og-tr.png',
    ogAlt: 'AND amblemi ve “Ortada sunucu olmayan bir forum.” cümlesi.',
    atla: 'İçeriğe geç', ana: 'AND ana sayfa', navEtiket: 'Ana menü', altNavEtiket: 'Alt bilgi',
    nav: [['neler-var', 'Neler var'], ['nasil-calisir', 'Nasıl çalışır'], ['kurulum', 'Kurulum'], ['guvenlik', 'Güvenlik'], ['sorular', 'Sorular']],
    h1: 'Ortada sunucu olmayan bir forum.',
    ozet: 'AND terminalinde çalışır. Konular, sohbet ve özel mesajlar onu kullananlar arasında doğrudan dolaşır; her biri yalnızca yazarının elindeki bir anahtarla imzalanır. Hesap yok, merkezi sunucu yok.',
    cta1: 'AND’ı kur', cta2: 'GitHub’da kaynak kodu',
    ekranBaslik: 'AND’ın masaüstü penceresi',
    ekranNot: 'Bu, AND’ın masaüstü penceresi; uygulamanın kendi renkleri ve metinleriyle HTML olarak çizildi. Kenar çubuğundan bir ekran seç, bir konu aç ya da bir tema dene. AND’ın tam ekran bir terminal arayüzü de var: <code>and --terminal</code>.',
    tema: 'Tema',
    ozellik: {
      id: 'neler-var', baslik: 'Neler var',
      giris: 'Buradaki her şey senin bilgisayarında ve konuştuğun kişilerin bilgisayarlarında çalışır.',
      liste: [
        ['Forum', '34 kategori. Bir konu yazıldığı anda eşlere ulaşır ve 5 gün sonra kendiliğinden silinir.'],
        ['Sohbet', 'Herkese açık tek bir kanal. Mesajlar imzalıdır, şifreli değildir ve 48 saat tutulur.'],
        ['Özel mesajlar', 'Şifreli bir bağlantıyla doğrudan karşındakine gider. Karşındaki çevrimdışıysa AND mesajı saklar ve 7 güne kadar, bağlandığında iletir.'],
        ['Dosyalar', 'Bir eşe dosya gönder. Alıcı onaylamadan hiçbir şey gelmez; yarıda kalan aktarım kaldığı yerden sürer.'],
        ['Kişisel site', 'Kendine ait en çok 20 sayfa yayınla. Sayfalar forum gibi imzalanır ve senkronlanır; yaptığın düzenlemeler herkese ulaşır.'],
        ['Moderasyon', 'Kurucu moderatör sertifikalarını imzalar. Moderatörler bir konuyu erken silebilir, bir eşi bir saatliğine ya da kalıcı olarak banlayabilir; her karar imzalanır ve kaydedilir.'],
        ['Eklentiler', 'AND’ı genişleten ayrı programlar. Her biri ihtiyaç duyduğu izinleri ilk açtığında sorar.'],
        ['Temalar ve diller', 'Altı yerleşik tema; arayüz Türkçe, İngilizce, Almanca, İspanyolca, Fransızca ve Rusça.'],
        ['Güncellemeler', 'Resmi sürümler kendini ve eklentilerini günceller; bunu yalnızca sürümün imzası doğrulandıktan sonra yapar.'],
        ['Arama', `${a(`${ORG}/and-arama-motoru`, 'AND Arama Motoru')} ağa salt-okunur bir eş olarak katılır; forum, sohbet ve site içeriğini terminalden aranabilir kılar.`],
      ],
    },
    nasil: {
      id: 'nasil-calisir', baslik: 'Nasıl çalışır',
      giris: 'AND’ın bir şey göndereceği bir sunucusu yoktur. Onu çalıştıran her bilgisayar bir düğümdür: aldığının kendi kopyasını tutar ve yeni mesajları bağlı olduğu düğümlere iletir.',
      adimlar: [
        ['Bir konu yazarsın.', 'AND onu anahtarınla imzalar ve bağlı olduğun düğümlere yayınlar.'],
        ['Düğümler onu iletir.', 'Her düğüm bir şeyi kaydetmeden önce imzasını denetler; imzasız ya da değiştirilmiş mesajları atar.'],
        ['Her düğüm kendi kopyasını', 'yerel bir veritabanında tutar. Konular 5 gün, sohbet mesajları 48 saat sonra kendiliğinden silinir.'],
        ['Çevrimdışı olan bir düğüm', 'yeniden bağlandığında, kaçırdığı geçmişi eşleriyle doğrudan senkronlayarak yetişir.'],
      ],
      cizimEtiket: 'Diyagram: Konuyu düğüm A’ya ve düğüm B’ye gönderiyorsun; düğüm A onu düğüm C’ye iletiyor; çevrimdışı olan düğüm D konuyu sonra düğüm B’den senkronluyor.',
      cizimAlt: 'Bu çizimde sunucu yok: her kutu AND çalıştıran bir bilgisayar.',
      son: 'Düğümler birbirini internette herkese açık libp2p DHT’si, yerel ağda mDNS ile bulur. Bağlantılar Noise protokolüyle şifrelidir. NAT arkasındaysan şifreli trafiği bir röle taşıyabilir ama okuyamaz.',
    },
    kurulum: {
      id: 'kurulum', baslik: 'Kurulum',
      giris: 'AND, Windows, Linux ve macOS’ta bir terminalde çalışır.',
      yedek: `Her sürümde her platform için açılıp çalıştırılmaya hazır bir arşiv vardır: ${a(`${DEPO}/releases`, 'Sürümler sayfası')}.`,
      derleBaslik: 'Kaynaktan derle',
      derle: 'Go 1.26.4 ya da üzeri gerekir. Bu komutlar AND’ı ve konu açmanı sağlayan Konu Aç eklentisini derler:',
      derleSon: `Windows’ta derlenen dosya adlarına .exe ekle ve and.exe’yi çalıştır. Bütün eklentiler ve derleme seçenekleri ${a(`${DOSYA}/README.tr.md#kaynaktan-derleme`, 'README’de')}.`,
    },
    guvenlik: {
      id: 'guvenlik', baslik: 'Güvenlik',
      giris: 'AND, bir sunucuya güvenmek zorunda kalmaman için tasarlandı ve başkalarının neyi görebildiğini açıkça söyler.',
      liste: [
        ['Kimliğin', 'Bilgisayarında 128 bit rastgelelikten üretilen bir Ed25519 anahtar çifti; parolanla şifrelenerek (Argon2id ve AES-256-GCM) saklanır. Kimliği oluştururken aldığın 32 karakterlik kurtarma kodu, onu geri getirmenin tek yoludur.'],
        ['İmzalar', 'Her konu, yanıt, sohbet mesajı ve moderasyon kararı imzalanır. Düğümler imzasız ya da değiştirilmiş her şeyi reddeder.'],
        ['Herkese açık olan', 'Konular, yanıtlar, sohbet, profiller ve kişisel siteler herkese açıktır: diğer düğümlere yayılır ve orada saklanır. AND anonim değil, takma adlıdır; bağlandığın düğümler IP adresini görebilir.'],
        ['Özel mesajlar', 'Doğrudan, şifreli bir bağlantıyla gider; mesaj geçmişin bilgisayarında şifreli saklanır.'],
        ['Güncellemeler', 'Resmi bir sürüm, hiçbir şeyi değiştirmeden önce sürümün SHA-256 özetlerini ve onların Ed25519 imzasını denetler. Kaynaktan derlediğin sürümler kendini hiç güncellemez.'],
        ['Eklentiler', 'Her eklenti kendi API anahtarıyla, yalnızca senin onayladığın izinlerle ayrı bir program olarak çalışır.'],
        ['Terminalin', 'Ağdan gelen metin, ekrana basılmadan önce kaçış dizilerinden ve kontrol karakterlerinden temizlenir.'],
        ['Telemetri', 'Yok. AND kullanım verisi ya da hata raporu toplamaz, göndermez.'],
      ],
      anahtar: 'Sürüm imzalama anahtarı (Ed25519):',
      son: `Bir güvenlik açığı mı buldun? Lütfen ${a(`${DOSYA}/SECURITY.md`, 'güvenlik politikasında')} anlatıldığı gibi gizlice bildir.`,
    },
    projeler: {
      id: 'projeler', baslik: 'Projeler',
      giris: `AND, GitHub’daki ${a(ORG, 'AND-community')} organizasyonunda birkaç depoya ayrılmıştır.`,
      liste: [
        ['AND', DEPO, 'uygulamanın kendisi; Yönetici Paneli, Özel Chat, Site ve örnek eklentiler ile VS Code uzantısı'],
        ['konu_ac', `${ORG}/konu_ac`, 'konu açma eklentisi; konu açmak için gerekir'],
        ['DeltaX', `${ORG}/DeltaX`, 'kendi sürüm kontrol sistemiyle özel gruplar'],
        ['Pembis', `${ORG}/Pembis`, 'pembe bir tema'],
        ['and-arama-motoru', `${ORG}/and-arama-motoru`, 'AND Arama Motoru'],
        ['and-community.github.io', `${ORG}/and-community.github.io`, 'bu web sitesi'],
      ],
    },
    sorular: {
      id: 'sorular', baslik: 'Sorular',
      liste: [
        ['AND anonim mi?', 'Hayır. AND takma adlıdır: gerçek kimliğinle değil bir ad ve bir anahtarla görünürsün, ama bağlandığın düğümler IP adresini görebilir. AND bunu senin için gizlemez.'],
        ['Sunucu, alan adı ya da hesap gerekiyor mu?', 'Hayır. AND’ı kur, bir ad ve parola seç; ağdasın. Her düğüm hem istemci hem sunucudur.'],
        ['Yazılanlar ne kadar kalır?', 'Konular yazıldıktan 5 gün, sohbet mesajları 48 saat sonra kendiliğinden silinir. Yayılmış bir içeriğin her düğümden silineceği garanti edilemez.'],
        ['Parolamı unuttum.', 'Giriş ekranında ctrl+r’ye bas ve kurtarma kodunu yaz. AND kimliğini geri getirir ve yeni bir parola ister.'],
        ['Kurtarma kodumu kaybettim.', 'Parolanı hâlâ biliyorsan Ayarlar’ı aç, Bilgi sekmesine gel ve kodu göstermek için m’ye bas. İkisini de kaybettiysen kimliğini kimse geri getiremez: bilgisayarından hiç çıkmaz.'],
        ['Hangi sistemlerde çalışır?', 'Windows, Linux ve macOS’ta, herhangi bir terminalde. Sürümler üçü için x86-64, Linux ve macOS için ayrıca ARM64 olarak derlenir.'],
        ['Ücretsiz mi?', 'Evet. AND, GNU AGPL-3.0 ile lisanslı özgür bir yazılımdır: kullanabilir, inceleyebilir, değiştirebilir ve paylaşabilirsin. Değiştirdiğin bir sürümü ağ üzerinden başkalarına sunarsan kaynak kodunu da onlara sunman gerekir.'],
        ['Kendi eklentimi yazabilir miyim?', `Evet. Eklenti, AND’la yerel bir HTTP API üzerinden kendi anahtarıyla konuşan ayrı bir programdır. ${a(`${DEPO}/tree/main/Eklentiler/ornek`, 'Örnek eklentiden ve rehberinden')} başla.`],
        ['Moderasyonu kim yapar?', 'Anahtarı AND’ın içine gömülü olan kurucu ve kurucunun imzalı sertifikalarla atadığı moderatörler; sertifikalar her an iptal edilebilir. Konuları erken silebilir ve eşleri banlayabilirler; her düğüm her kararın imzasını denetler.'],
      ],
    },
    katki: {
      id: 'katki', baslik: 'Katkı',
      metin: 'AND, GitHub’da açık olarak geliştirilir. Hataları ve önerileri sorun takibine yaz; çekme isteği göndermeden önce katkı rehberini oku.',
      baglantilar: [[`${DEPO}/issues`, 'Sorunlar'], [`${DOSYA}/CONTRIBUTING.md`, 'Katkı rehberi'], [`${DOSYA}/CODE_OF_CONDUCT.md`, 'Davranış kuralları']],
    },
    alt: {
      lisans: 'AND, GNU AGPL-3.0 ile lisanslı özgür bir yazılımdır. © 2026 AND katkıcıları.',
      baglantilar: [[DEPO, 'GitHub'], [`${DEPO}/releases`, 'Sürümler'], [`${DOSYA}/SECURITY.md`, 'Güvenlik politikası']],
      gizlilik: 'Bu site çerez kullanmaz ve ziyaretçi istatistiği tutmaz. Son sürümü göstermek için GitHub’ın API’sine sorar; başka hiçbir sunucudan bir şey yüklenmez.',
    },
  },
};

// ─── Sayfa ──────────────────────────────────────────────────────────────────

const KOD = `git clone ${DEPO}.git
cd AND
go build -o and ./cmd/and
git clone ${ORG}/konu_ac.git Eklentiler/konu_ac
go build -o Eklentiler/konu_ac/and-plugin-konu_ac ./Eklentiler/konu_ac
./and`;

function bas(m) {
  const url = SITE + m.yol;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AND',
    description: m.aciklama,
    url,
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Windows, Linux, macOS',
    softwareVersion: SURUM,
    license: 'https://www.gnu.org/licenses/agpl-3.0.html',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    downloadUrl: `${DEPO}/releases`,
    sameAs: [DEPO],
    inLanguage: m.dil,
  };
  return `<!doctype html>
<html lang="${m.dil}" data-tema="klasik">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(m.baslik)}</title>
<meta name="description" content="${e(m.aciklama)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${SITE}/">
<link rel="alternate" hreflang="tr" href="${SITE}/tr/">
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0e0c24">
${SIMGELER}
<link rel="preload" href="/assets/fonts/and-site-mono.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/and-site-slab.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AND">
<meta property="og:title" content="${e(m.baslik)}">
<meta property="og:description" content="${e(m.aciklama)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}${m.ogResim}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${e(m.ogAlt)}">
<meta property="og:locale" content="${m.yerel}">
<meta property="og:locale:alternate" content="${m.dil === 'en' ? 'tr_TR' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<script>try{var t=localStorage.getItem("and-tema");if(/^(klasik|turkuaz|gece-moru|kehribar|orman|gul|okyanus|gun-batimi|lavanta|mono)$/.test(t))document.documentElement.dataset.tema=t}catch(e){}</script>
<script src="/assets/js/site.js" defer></script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>`;
}

function ust(m) {
  return `<a class="atla" href="#icerik">${e(m.atla)}</a>
<header class="ust sayfa">
<a class="marka" href="${m.yol}" aria-label="${e(m.ana)}">${MARKA}</a>
<nav class="ust-nav" aria-label="${e(m.navEtiket)}"><ul>${m.nav.map(([id, t]) => `<li><a href="#${id}">${e(t)}</a></li>`).join('')}</ul></nav>
<ul class="ust-sag"><li><a href="${DEPO}">GitHub</a></li><li><a href="${m.diger.yol}" hreflang="${m.diger.dil}" lang="${m.diger.dil}">${m.diger.ad}</a></li></ul>
</header>`;
}

function bolum(b, icerik) {
  return `<section class="bolum" id="${b.id}" aria-labelledby="${b.id}-baslik">
<h2 id="${b.id}-baslik">${e(b.baslik)}</h2>
<div class="bolum-icerik">
${icerik}
</div>
</section>`;
}

function altBilgi(m) {
  return `<footer class="alt sayfa">
<div class="alt-ust"><span class="marka">${MARKA}</span><p>${e(m.alt.lisans)}</p>
<ul class="alt-nav" aria-label="${e(m.altNavEtiket)}">${m.alt.baglantilar.map(([h, t]) => `<li>${a(h, e(t))}</li>`).join('')}<li><a href="${m.diger.yol}" hreflang="${m.diger.dil}" lang="${m.diger.dil}">${m.diger.ad}</a></li></ul></div>
<p class="alt-gizlilik">${e(m.alt.gizlilik)}</p>
</footer>`;
}

function sayfa(dil) {
  const m = M[dil];
  const kopyalaMetni = dil === 'en' ? 'Copy' : 'Kopyala';
  const temaDugmeleri = TEMALAR.map((t, i) => `<button type="button" data-tema-sec="${t.id}" aria-pressed="${i === 0}"><span class="ornek" style="--o:${t.renk[0]}" aria-hidden="true">██</span>${e(t[dil])}</button>`).join('');
  const kv = (liste) => `<dl class="kv">${liste.map(([dt, dd]) => `<dt>${e(dt)}</dt><dd>${dd}</dd>`).join('')}</dl>`;
  const o = m.ozellik, n = m.nasil, ku = m.kurulum, g = m.guvenlik, p = m.projeler, s = m.sorular, ka = m.katki;
  const guvenlikListesi = g.liste.map(([dt, dd]) => [dt, e(dd)]);
  const anahtarSatiri = `<div class="anahtar"><span class="soluk">${e(g.anahtar)}</span><code id="imza-anahtari">${IMZA_ANAHTARI}</code><button type="button" class="kopyala" data-kopyala="imza-anahtari">${kopyalaMetni}</button></div>`;
  guvenlikListesi[4][1] += anahtarSatiri;

  return `${bas(m)}
<body>
${ust(m)}
<main id="icerik">
<section class="giris sayfa" aria-labelledby="giris-baslik">
<h1 id="giris-baslik">${e(m.h1)}</h1>
<p class="ozet">${e(m.ozet)}</p>
<p class="eylemler"><a class="dugme dugme-dolu" href="#${ku.id}">${e(m.cta1)}</a><a class="dugme" href="${DEPO}">${e(m.cta2)}</a></p>
</section>
<section class="ekran sayfa" aria-labelledby="ekran-baslik">
<h2 id="ekran-baslik" class="gorsel-gizli">${e(m.ekranBaslik)}</h2>
${pencere(dil, { e, SURUM, DEPO, TEMALAR })}
<div class="ekran-alt">
<p class="ekran-not">${m.ekranNot}</p>
<fieldset class="tema-sec"><legend>${e(m.tema)}</legend>${temaDugmeleri}</fieldset>
</div>
</section>
<div class="sayfa">
${bolum(o, `<p class="giris-metni">${e(o.giris)}</p>
${kv(o.liste.map(([dt, dd]) => [dt, dd.includes('<a ') ? dd : e(dd)]))}`)}
${bolum(n, `<p class="giris-metni">${e(n.giris)}</p>
<figure class="cizim"><pre role="img" aria-label="${e(n.cizimEtiket)}">${cizim(dil)}</pre><figcaption>${e(n.cizimAlt)}</figcaption></figure>
<ol class="adimlar">${n.adimlar.map(([b, r]) => `<li><strong>${e(b)}</strong> ${e(r)}</li>`).join('')}</ol>
<p class="soluk">${e(n.son)}</p>`)}
${bolum(ku, `<p class="giris-metni">${e(ku.giris)}</p>
<div class="indir" data-indir><p class="indir-durum">${ku.yedek}</p></div>
<h3>${e(ku.derleBaslik)}</h3>
<p>${e(ku.derle)}</p>
<div class="kod"><pre><code id="derleme-komutlari">${e(KOD)}</code></pre><button type="button" class="kopyala" data-kopyala="derleme-komutlari">${kopyalaMetni}</button></div>
<p class="soluk">${ku.derleSon}</p>`)}
${bolum(g, `<p class="giris-metni">${e(g.giris)}</p>
${kv(guvenlikListesi)}
<p>${g.son}</p>`)}
${bolum(p, `<p class="giris-metni">${p.giris}</p>
<ul class="agac"><li class="agac-kok">AND-community/</li>${p.liste.map(([isim, h, ac], i) => `<li><span class="dal" aria-hidden="true">${i === p.liste.length - 1 ? '└── ' : '├── '}</span>${a(h, e(isim))}<span class="aciklama">${e(ac)}</span></li>`).join('')}</ul>`)}
${bolum(s, `<div class="sorular">${s.liste.map(([q, c]) => `<details><summary>${e(q)}</summary><p>${c.includes('<a ') ? c : e(c)}</p></details>`).join('')}</div>`)}
${bolum(ka, `<p>${e(ka.metin)}</p>
<ul class="baglantilar">${ka.baglantilar.map(([h, t]) => `<li>${a(h, e(t))}</li>`).join('')}</ul>`)}
</div>
</main>
${altBilgi(m)}
</body>
</html>
`.replace(/GNU AGPL-3\.0(?![^<]*>)/g, '<span class="kirilmaz">GNU AGPL-3.0</span>');
}

function bulunamadi() {
  return `<!doctype html>
<html lang="en" data-tema="klasik">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found · Sayfa bulunamadı · AND</title>
<meta name="robots" content="noindex">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0e0c24">
${SIMGELER}
<link rel="stylesheet" href="/assets/css/site.css">
<script>try{var t=localStorage.getItem("and-tema");if(/^(klasik|turkuaz|gece-moru|kehribar|orman|gul|okyanus|gun-batimi|lavanta|mono)$/.test(t))document.documentElement.dataset.tema=t}catch(e){}</script>
</head>
<body>
<header class="ust sayfa"><a class="marka" href="/" aria-label="AND home">${MARKA}</a></header>
<main class="sayfa">
<div class="yok">
<p class="bildirim">✗ 404</p>
<h1>This page doesn’t exist.</h1>
<p>The address may be mistyped, or the page may have moved. ${a('/', 'Go to the home page')}.</p>
<h1 lang="tr" style="margin-top:3rem">Bu sayfa yok.</h1>
<p lang="tr">Adres yanlış yazılmış ya da sayfa taşınmış olabilir. ${a('/tr/', 'Ana sayfaya git')}.</p>
</div>
</main>
</body>
</html>
`;
}

function siteHaritasi() {
  const url = (yol) => `<url><loc>${SITE}${yol}</loc><lastmod>${GUNCELLEME}</lastmod>
<xhtml:link rel="alternate" hreflang="en" href="${SITE}/"/>
<xhtml:link rel="alternate" hreflang="tr" href="${SITE}/tr/"/>
</url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${url('/')}
${url('/tr/')}
</urlset>
`;
}

// Paylaşım görselinin (Open Graph, 1200×630) şablonu. Görsel bu sayfanın
// ekran görüntüsüdür: assets/img/og.png (İngilizce) ve og-tr.png (?dil=tr).
function ogSablonu() {
  return `<!doctype html>
<html lang="en" data-tema="klasik">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>AND paylaşım görseli</title>
<link rel="stylesheet" href="/assets/css/site.css">
<style>
html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; background: var(--ink); }
.og { position: absolute; inset: 40px; display: flex; flex-direction: column; padding: 64px 72px 56px; border: 2px solid var(--accent); border-radius: 16px; background: var(--ink-deep); }
.og-ust { position: absolute; top: 0; inset-inline: 36px; display: flex; justify-content: space-between; transform: translateY(-50%); font: 700 22px/1.4 var(--mono); }
.og-ust > span { padding-inline: 14px; background: var(--ink-deep); }
.og-ust .surum { color: var(--muted); font-weight: 400; }
.og .t-amblem { font: 700 calc(12px / 0.62) / 24px var(--mono); }
.og h1 { max-width: 22ch; margin: auto 0 20px; color: var(--text); font: 650 62px/1.04 var(--slab); letter-spacing: -0.03em; }
.og p { margin: 0; color: var(--soft); font: 400 23px/1.5 var(--mono); }
.og .adres { position: absolute; right: 72px; top: 64px; color: var(--accent-ink); font: 400 22px var(--mono); }
.og-marka { display: flex; align-items: center; gap: 36px; }
.og-marka img { display: block; width: 144px; height: 144px; }
</style>
</head>
<body>
<div class="og">
<div class="og-ust"><span><span class="hap">AND</span></span><span class="surum">${SURUM}</span></div>
<div class="og-marka"><img src="/assets/img/logo.png" alt=""><pre class="t-amblem" aria-hidden="true">${amblem()}</pre></div>
<span class="adres">and-community.github.io</span>
<h1 data-tr="${e(M.tr.h1)}">${e(M.en.h1)}</h1>
<p data-tr="Terminalde eşten eşe forum, sohbet ve kişisel siteler. Ücretsiz ve açık kaynak.">Peer-to-peer forum, chat and personal sites in your terminal. Free and open source.</p>
</div>
<script>if (new URLSearchParams(location.search).get('dil') === 'tr') { document.documentElement.lang = 'tr'; document.querySelectorAll('[data-tr]').forEach((d) => { d.textContent = d.dataset.tr; }); }</script>
</body>
</html>
`;
}

const yaz = (yol, icerik) => {
  fs.mkdirSync(path.dirname(path.join(KOK, yol)), { recursive: true });
  fs.writeFileSync(path.join(KOK, yol), icerik);
  console.log(`${yol}: ${(Buffer.byteLength(icerik) / 1024).toFixed(1)} KB`);
};

yaz('index.html', sayfa('en'));
yaz('tr/index.html', sayfa('tr'));
yaz('404.html', bulunamadi());
yaz('sitemap.xml', siteHaritasi());
yaz('tools/og.html', ogSablonu());
