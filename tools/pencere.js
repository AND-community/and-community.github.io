'use strict';
// Sitenin giriş bölümündeki AND masaüstü penceresi kopyası.
//
// Görünüm ve ölçüler AND deposundaki internal/masaustu/web/uygulama.css'ten,
// ikonlar uygulama.js'teki IKONLAR'dan, tema kartlarının çizimi temaOnizleme'den
// alındı. Metinler AND'ın ve eklentilerinin çeviri kataloglarındadır
// (dil/ceviriler/tui.json, eklentiler.json, kategoriler.json,
// Eklentiler/*/ceviri.json); İngilizcesi katalogdaki "en" değeridir.
// Forum, Özel Chat, Site, Yönetici Paneli ve DeltaX ekranları bu eklentilerin
// AND'da arayüz bileşenleriyle çizilen hâlidir. Uygulama değişirse burası da
// güncellenmeli. Davranış assets/js/site.js'te, stiller site.css'in
// "Masaüstü penceresi kopyası" bölümündedir. olustur.js kullanır.

// ─── İkonlar (uygulama.js IKONLAR) ──────────────────────────────────────────

const IKONLAR = {
  forum: 'M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v5a2.5 2.5 0 0 1-2.5 2.5H9l-4 3v-3.1a2.5 2.5 0 0 1-2-2.4zM20 9.5v6a2.5 2.5 0 0 1-2 2.45V21l-3.5-3H11',
  sohbet: 'M21 12a8.5 8.5 0 0 1-12.4 7.55L4 21l1.45-4.6A8.5 8.5 0 1 1 21 12zM8.5 12h.01M12.5 12h.01M16.5 12h.01',
  eklenti: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  ayarlar: 'M4 6h9M19 6h1M4 12h3M11 12h9M4 18h11M19 18h1M13 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0M5 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0M13 18a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
  bilgi: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 11v5M12 7.5h.01',
  guc: 'M12 3v8M6.3 6.3a8 8 0 1 0 11.4 0',
  arti: 'M12 5v14M5 12h14',
  gonder: 'M4 12L20 4l-6 16-3-7-7-1zM11 13l9-9',
  kopyala: 'M9 9h10v10H9zM5 15V5h10',
  ara: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4-4',
  geri: 'M15 5l-7 7 7 7',
  ag: 'M10 5a2 2 0 1 0 4 0a2 2 0 1 0-4 0M3 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M17 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M11 6.8l-5 9.4M13 6.8l5 9.4M7 18h10',
  profil: 'M12 12a4 4 0 1 0 0-8a4 4 0 1 0 0 8zM4 21a8 8 0 0 1 16 0',
  palet: 'M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.6 0-1.4-1.2-1.4-1.2-2.6 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5C21 6.4 17 3 12 3zM7.5 11h.01M10 7.5h.01M15 7.5h.01',
  dil: 'M4 5h8M8 3v2M10.5 5c-.8 3.5-3 6.3-6.5 8M6 9c1.2 1.8 3 3.2 5 4M13 21l4-9 4 9M14.5 18h5',
  kalkan: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z',
  belge: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  tamam: 'M5 12.5l4.5 4.5L19 7',
  asagi: 'M6 9l6 6 6-6',
  muhur: 'M12 3l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.9 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.9-2.6-2.2-1.6.9-2.6-.9-2.6 2.2-1.6.9-2.6 2.7.2zM9 12l2 2 4-4',
  kod: 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
  kapat: 'M6 6l12 12M18 6L6 18',
};

// Kategori simgeleri (uygulama.js kategoriIkonu).
const KATEGORI_IKONU = { iletisim: 'sohbet', icerik: 'belge', yonetim: 'kalkan', gelistirme: 'kod', tema: 'palet' };

// Avatar renkleri (uygulama.js RENKLER); her kişi hep aynı rengi alır.
const AVATAR = { umut: '#0ea5e9', zeynep: '#14b8a6', mehmet: '#f97316', deniz: '#8b5cf6', 'ayşe': '#ec4899' };

// ─── Metinler ───────────────────────────────────────────────────────────────

const R = {
  en: {
    pencereEtiket: 'AND desktop window (replica)',
    kenarEtiket: 'Sidebar',
    arama: 'Search or jump to…',
    gruplar: { topluluk: 'Community', iletisim: 'Communication', icerik: 'Content', yonetim: 'Moderation', gelistirme: 'Development' },
    ogeler: { forum: 'Forum', sohbet: 'Chat', ozel_chat: 'Private Chat', site: 'Website', admin: 'Admin Panel', deltax: 'DeltaX', ayarlar: 'Settings', hakkinda: 'About AND' },
    calisiyor: 'running',
    okunmamis: 'unread messages',
    kategoriEtiket: 'Forum categories',
    profil: 'Profile',
    durum: {
      es: (n) => `${n} ${n === 1 ? 'peer' : 'peers'} connected`,
      dugum: (n) => `${n} AND ${n === 1 ? 'node' : 'nodes'}`,
      baglaniyor: 'connecting to the network…',
    },
    forum: {
      tum: 'All topics', yeni: 'New topic', suz: 'Filter…', geri: 'Topics', listeEtiket: 'Topics',
      profil: 'Author’s profile', yanitlar: (n) => `Replies (${n})`, imzali: 'signed', kopyala: 'Copy',
      kategoriler: [['yazilim', 'Software'], ['guvenlik', 'Cybersecurity'], ['etkinlik', 'Events & Announcements'], ['genel', 'General']],
      konular: [
        {
          kat: 'yazilim', baslik: 'Things to watch for when building peer-to-peer apps in Go', yazar: 'zeynep', zaman: '2h ago',
          govde: [
            'Hi! I’m building a small project with libp2p. Once a connection is up, how do you check that a message really comes from who it says?',
            'Right now I do this:',
            { dil: 'go', kod: ['sig := ed25519.Sign(key, data)', 'if !ed25519.Verify(pub, data, sig) {', '    return errors.New("invalid signature")', '}'] },
            { baglanti: 'https://docs.libp2p.io/concepts/', once: 'Docs: ' },
          ],
          yanitlar: [
            ['mehmet', '1h ago', 'I do the same. Deriving the message ID from the signed content also weeds out replayed messages.'],
            ['deniz', '40 min ago', 'A session key per connection is worth a look too.'],
          ],
        },
        {
          kat: 'guvenlik', baslik: 'When will quantum computers break encryption?', yazar: 'deniz', zaman: '5h ago',
          govde: ['Curious what your guesses are. Ed25519 isn’t quantum-safe, so what would a network like this have to change?'],
          yanitlar: [['zeynep', '4h ago', 'Not soon, I think. And every message already names its signature scheme through its key, so it can be swapped later.']],
        },
        {
          kat: 'etkinlik', baslik: 'Open-source game night this weekend?', yazar: 'mehmet', zaman: 'yesterday',
          govde: ['Anyone up for it? I’ll set up a DeltaX group so we can share the levels we make.'],
          yanitlar: [],
        },
        {
          kat: 'genel', baslik: 'Albums you listen to while working', yazar: 'ayşe', zaman: 'yesterday',
          govde: ['Share yours! Mine are mostly ambient this week.'],
          yanitlar: [['umut', 'yesterday', 'Anything without lyrics. Film soundtracks work well.'], ['mehmet', '20h ago', 'Old jazz records, every time.']],
        },
        {
          kat: 'genel', baslik: 'Welcome to AND', yazar: 'umut', zaman: '2 days ago',
          govde: ['Say hello here. Topics delete themselves after 5 days, so nothing you write stays forever.'],
          yanitlar: [['deniz', '2 days ago', 'Hello! Glad there’s no server to trust.']],
        },
      ],
    },
    sohbet: {
      aciklama: 'Public general chat; messages are deleted after 48 hours.',
      gun: 'Today',
      yaz: 'Write a public message…', gonder: 'Send',
      iletiler: [
        ['21:04', 'zeynep', 'anyone tried the branch view in the new DeltaX?'],
        ['21:05', 'mehmet', 'yes, the folded diffs make big files readable'],
        ['21:07', 'deniz', 'is there a Rust category?'],
        ['21:07', 'zeynep', 'there are 34 categories, Rust is one of them'],
        ['21:09', 'umut', 'welcome, deniz'],
        ['21:12', 'ayşe', 'switched the interface to English in Settings › Language, works great'],
      ],
    },
    ozelChat: {
      yeni: 'New conversation', listeEtiket: 'Conversations', yaz: 'Write a message…', gonder: 'Send',
      konusmalar: [['zeynep', 'see you at game night?', 2], ['mehmet', 'sent you the level file', 0], ['deniz', 'thanks!', 0]],
      iletiler: [['gelen', 'did you get the invite to the DeltaX group?', '20:41'], ['giden', 'yes, joined a minute ago', '20:43'], ['gelen', 'great, the first level is already in', '20:44'], ['gelen', 'see you at game night?', '20:45']],
    },
    site: {
      yeni: 'New page', listeEtiket: 'Pages',
      sayfalar: [['home', 'Home'], ['projects', 'Projects'], ['first-post', 'My first post']],
      baslik: 'umut’s corner of AND',
      paragraf: 'This site lives on the network like the forum: every page is signed, and my edits reach everyone.',
      altBaslik: 'What’s here',
      liste: ['Projects I’m working on', 'Notes from game nights', 'A few short posts'],
    },
    admin: {
      ozet: [['Your role', 'Founder'], ['Active bans', '2'], ['Moderators', '3']],
      yasaklarBaslik: 'Bans',
      sutunlar: ['Who', 'Reason', 'Time left'],
      yasaklar: [['spammer', 'cdcd…cdcd', 'spam', '2 days 22 h'], ['12D3KooWEs…5555', '', 'flooding the network', 'permanent']],
    },
    deltax: {
      yol: ['Groups', 'game-night', 'levels'],
      ozet: [['Branch', 'main'], ['Changes', '3 files'], ['Ahead', '1 commit'], ['Members', '3 · 2 online']],
      sonBaslik: 'Recent commits',
      commitler: [['a41c9e2', 'Add the ice level', 'mehmet', '2h ago'], ['7b02d1f', 'Fix the door on level 2', 'zeynep', 'yesterday'], ['e9f3a07', 'First two levels', 'mehmet', '2 days ago']],
    },
    ayarlar: {
      sekmeler: [['profil', 'Profile', 'profil'], ['gorunum', 'Appearance', 'palet'], ['dil', 'Language', 'dil'], ['eklentiler', 'Plugins', 'eklenti'], ['ag', 'Network', 'ag']],
      profil: { durum: 'building AND’s website', bio: 'Writes Go, plays chess badly.', etiketler: ['Go', 'P2P', 'Web'], kimlik: 'Identity', peer: 'Peer ID' },
      tema: 'Theme', temaAciklama: 'The theme also applies to the terminal interface and plugins.',
      ozel: 'Custom colour', ozelAciklama: 'Pick your own accent colour; AND derives the other colours from it so that everything stays readable.', uygula: 'Apply',
      diller: [['Türkçe', 'tr'], ['English', 'en'], ['Deutsch', 'de'], ['Español', 'es'], ['Français', 'fr'], ['Русский', 'ru']],
      dilKodu: 'en',
      eklentiGruplari: [
        ['iletisim', 'Communication', [['Forum', '1.0.0', 'Categories, topics and replies.'], ['Private Chat', '2.2.0', 'Message peers directly and send files.']]],
        ['icerik', 'Content', [['Website', '1.4.0', 'Create and publish your own multi-page site.']]],
        ['yonetim', 'Moderation', [['Admin Panel', '4.2.0', 'Topic management, bans and moderators.']]],
        ['gelistirme', 'Development', [['DeltaX', '1.8.0', 'Private groups with their own version control.']]],
        ['tema', 'Themes', [['Pembiş Theme', '1.2.0', 'Paints AND pink.']]],
      ],
      calisiyor: 'Running',
      vscode: ['VS Code connection', 'The VS Code extension can read and write the forum while this is on.', 'On'],
      ag: [['Reachability', 'through a relay'], ['NAT', 'endpoint-independent'], ['Port', '4001'], ['Connected AND nodes', '4'], ['Known peers', '37']],
    },
    hakkinda: {
      sekmeler: ['General', 'Privacy', 'Rules', 'License', 'Third party'],
      aciklama: 'A serverless, peer-to-peer forum community. No accounts and no central server: your identity is a key that stays on your computer.',
      kv: [['License', 'GNU AGPL-3.0'], ['Source code', 'github.com/AND-community/AND'], ['Components', '151 open-source components']],
    },
  },
  tr: {
    pencereEtiket: 'AND masaüstü penceresi (kopya)',
    kenarEtiket: 'Kenar çubuğu',
    arama: 'Ara ya da git…',
    gruplar: { topluluk: 'Topluluk', iletisim: 'İletişim', icerik: 'İçerik', yonetim: 'Yönetim', gelistirme: 'Geliştirme' },
    ogeler: { forum: 'Forum', sohbet: 'Sohbet', ozel_chat: 'Özel Chat', site: 'Site', admin: 'Yönetici Paneli', deltax: 'DeltaX', ayarlar: 'Ayarlar', hakkinda: 'AND hakkında' },
    calisiyor: 'çalışıyor',
    okunmamis: 'okunmamış mesaj',
    kategoriEtiket: 'Forum kategorileri',
    profil: 'Profil',
    durum: {
      es: (n) => `${n} eş bağlı`,
      dugum: (n) => `${n} AND düğümü`,
      baglaniyor: 'ağa bağlanıyor…',
    },
    forum: {
      tum: 'Tüm konular', yeni: 'Yeni konu', suz: 'Süz…', geri: 'Konular', listeEtiket: 'Konular',
      profil: 'Yazarın profili', yanitlar: (n) => `Yanıtlar (${n})`, imzali: 'imzalı', kopyala: 'Kopyala',
      kategoriler: [['yazilim', 'Yazılım'], ['guvenlik', 'Siber Güvenlik'], ['etkinlik', 'Etkinlikler ve Duyurular'], ['genel', 'Genel']],
      konular: [
        {
          kat: 'yazilim', baslik: 'Go ile eşten eşe uygulama geliştirirken dikkat edilmesi gerekenler', yazar: 'zeynep', zaman: '2 sa önce',
          govde: [
            'Merhaba! libp2p ile küçük bir proje yapıyorum. Bağlantı kurulduktan sonra bir mesajın gerçekten söylediği kişiden geldiğini nasıl denetliyorsunuz?',
            'Şu an şöyle yapıyorum:',
            { dil: 'go', kod: ['imza := ed25519.Sign(anahtar, veri)', 'if !ed25519.Verify(genel, veri, imza) {', '    return errors.New("imza geçersiz")', '}'] },
            { baglanti: 'https://docs.libp2p.io/concepts/', once: 'Belgeler için: ' },
          ],
          yanitlar: [
            ['mehmet', '1 sa önce', 'Ben de aynı yöntemi kullanıyorum. Mesaj kimliğini imzalı içerikten türetmek tekrarlanan mesajları da ayıklıyor.'],
            ['deniz', '40 dk önce', 'Bağlantı başına bir oturum anahtarına da bakmaya değer.'],
          ],
        },
        {
          kat: 'guvenlik', baslik: 'Kuantum bilgisayarlar şifrelemeyi ne zaman kırar?', yazar: 'deniz', zaman: '5 sa önce',
          govde: ['Tahminlerinizi merak ediyorum. Ed25519 kuantuma dayanıklı değil; böyle bir ağın neyi değiştirmesi gerekirdi?'],
          yanitlar: [['zeynep', '4 sa önce', 'Yakında değil bence. Hem her mesaj imza yöntemini anahtarıyla zaten belli ediyor; sonradan değiştirilebilir.']],
        },
        {
          kat: 'etkinlik', baslik: 'Bu hafta sonu açık kaynak oyun gecesi?', yazar: 'mehmet', zaman: 'dün',
          govde: ['Katılmak isteyen? Yaptığımız bölümleri paylaşmak için bir DeltaX grubu kuracağım.'],
          yanitlar: [],
        },
        {
          kat: 'genel', baslik: 'Çalışırken dinlediğiniz albümler', yazar: 'ayşe', zaman: 'dün',
          govde: ['Paylaşın! Bu hafta benimkiler çoğunlukla ambient.'],
          yanitlar: [['umut', 'dün', 'Sözsüz olan her şey. Film müzikleri iyi gidiyor.'], ['mehmet', '20 sa önce', 'Her seferinde eski caz plakları.']],
        },
        {
          kat: 'genel', baslik: 'AND’a hoş geldin', yazar: 'umut', zaman: '2 gün önce',
          govde: ['Merhabanı buraya yaz. Konular 5 gün sonra kendiliğinden silinir; yazdığın hiçbir şey sonsuza kadar kalmaz.'],
          yanitlar: [['deniz', '2 gün önce', 'Merhaba! Güvenmem gereken bir sunucu olmaması çok iyi.']],
        },
      ],
    },
    sohbet: {
      aciklama: 'Herkese açık genel sohbet; iletiler 48 saat sonra silinir.',
      gun: 'Bugün',
      yaz: 'Herkese açık bir ileti yaz…', gonder: 'Gönder',
      iletiler: [
        ['21:04', 'zeynep', 'yeni DeltaX’teki dal görünümünü deneyen oldu mu?'],
        ['21:05', 'mehmet', 'evet, katlanan farklar büyük dosyaları okunur yapıyor'],
        ['21:07', 'deniz', 'Rust kategorisi var mı?'],
        ['21:07', 'zeynep', '34 kategori var, Rust da içinde'],
        ['21:09', 'umut', 'hoş geldin deniz'],
        ['21:12', 'ayşe', 'Ayarlar › Dil’den arayüzü İngilizceye aldım, gayet iyi'],
      ],
    },
    ozelChat: {
      yeni: 'Yeni konuşma', listeEtiket: 'Konuşmalar', yaz: 'Bir mesaj yaz…', gonder: 'Gönder',
      konusmalar: [['zeynep', 'oyun gecesinde görüşür müyüz?', 2], ['mehmet', 'bölüm dosyasını gönderdim', 0], ['deniz', 'teşekkürler!', 0]],
      iletiler: [['gelen', 'DeltaX grubunun davetini aldın mı?', '20:41'], ['giden', 'evet, bir dakika önce katıldım', '20:43'], ['gelen', 'harika, ilk bölüm şimdiden içinde', '20:44'], ['gelen', 'oyun gecesinde görüşür müyüz?', '20:45']],
    },
    site: {
      yeni: 'Yeni sayfa', listeEtiket: 'Sayfalar',
      sayfalar: [['home', 'Ana Sayfa'], ['projeler', 'Projelerim'], ['ilk-yazi', 'İlk yazım']],
      baslik: 'umut’un AND köşesi',
      paragraf: 'Bu site ağda forum gibi yaşar: her sayfası imzalıdır ve yaptığım düzenlemeler herkese ulaşır.',
      altBaslik: 'Neler var',
      liste: ['Üzerinde çalıştığım projeler', 'Oyun gecelerinden notlar', 'Birkaç kısa yazı'],
    },
    admin: {
      ozet: [['Rolün', 'Kurucu'], ['Etkin yasaklar', '2'], ['Moderatörler', '3']],
      yasaklarBaslik: 'Yasaklar',
      sutunlar: ['Kim', 'Gerekçe', 'Kalan süre'],
      yasaklar: [['reklamci', 'cdcd…cdcd', 'reklam', '2 gün 22 sa'], ['12D3KooWEs…5555', '', 'ağı boğma', 'kalıcı']],
    },
    deltax: {
      yol: ['Gruplar', 'oyun-gecesi', 'bolumler'],
      ozet: [['Dal', 'main'], ['Değişiklikler', '3 dosya'], ['Önde', '1 commit'], ['Üyeler', '3 · 2 çevrimiçi']],
      sonBaslik: 'Son commit’ler',
      commitler: [['a41c9e2', 'Buz bölümü eklendi', 'mehmet', '2 sa önce'], ['7b02d1f', '2. bölümdeki kapı düzeltildi', 'zeynep', 'dün'], ['e9f3a07', 'İlk iki bölüm', 'mehmet', '2 gün önce']],
    },
    ayarlar: {
      sekmeler: [['profil', 'Profil', 'profil'], ['gorunum', 'Görünüm', 'palet'], ['dil', 'Dil', 'dil'], ['eklentiler', 'Eklentiler', 'eklenti'], ['ag', 'Ağ', 'ag']],
      profil: { durum: 'AND’ın sitesini yapıyor', bio: 'Go yazar, kötü satranç oynar.', etiketler: ['Go', 'P2P', 'Web'], kimlik: 'Kimlik', peer: 'Peer ID' },
      tema: 'Tema', temaAciklama: 'Tema, terminal arayüzünde ve eklentilerde de geçerlidir.',
      ozel: 'Özel renk', ozelAciklama: 'Kendi vurgu rengini seç; AND öteki renkleri okunur kalacak biçimde ondan türetir.', uygula: 'Uygula',
      diller: [['Türkçe', 'tr'], ['English', 'en'], ['Deutsch', 'de'], ['Español', 'es'], ['Français', 'fr'], ['Русский', 'ru']],
      dilKodu: 'tr',
      eklentiGruplari: [
        ['iletisim', 'İletişim', [['Forum', '1.0.0', 'Kategoriler, konular ve yanıtlar.'], ['Özel Chat', '2.2.0', 'Eşlerle doğrudan mesajlaş, dosya gönder.']]],
        ['icerik', 'İçerik', [['Site', '1.4.0', 'Kendi çok sayfalı siteni oluştur ve yayınla.']]],
        ['yonetim', 'Yönetim', [['Yönetici Paneli', '4.2.0', 'Konu yönetimi, yasaklar ve moderatörler.']]],
        ['gelistirme', 'Geliştirme', [['DeltaX', '1.8.0', 'Kendi sürüm kontrolüyle özel gruplar.']]],
        ['tema', 'Temalar', [['Pembiş Tema', '1.2.0', 'AND’ı pembeye boyar.']]],
      ],
      calisiyor: 'Çalışıyor',
      vscode: ['VS Code bağlantısı', 'Bu açıkken VS Code uzantısı forumu okuyup yazabilir.', 'Açık'],
      ag: [['Ulaşılabilirlik', 'bir relay üzerinden'], ['NAT', 'uç noktadan bağımsız'], ['Port', '4001'], ['Bağlı AND düğümleri', '4'], ['Bilinen eşler', '37']],
    },
    hakkinda: {
      sekmeler: ['Genel', 'Gizlilik', 'Kurallar', 'Lisans', 'Üçüncü taraf'],
      aciklama: 'Sunucusuz, eşten eşe bir forum topluluğu. Hesap yok, merkezi sunucu yok: kimliğin bilgisayarında kalan bir anahtardır.',
      kv: [['Lisans', 'GNU AGPL-3.0'], ['Kaynak kodu', 'github.com/AND-community/AND'], ['Bileşenler', '151 açık kaynak bileşen']],
    },
  },
};

// ─── HTML ───────────────────────────────────────────────────────────────────

function pencere(dil, { e, SURUM, DEPO, TEMALAR }) {
  const r = R[dil];
  const ikon = (ad, sinif = '') => `<svg${sinif ? ` class="${sinif}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IKONLAR[ad]}"/></svg>`;
  const avatar = (kisi, boyut = '') => `<span class="p-avatar${boyut ? ` ${boyut}` : ''}" style="background:${AVATAR[kisi] || '#6366f1'}" aria-hidden="true">${e([...kisi][0].toLocaleUpperCase(dil))}</span>`;
  const ad = (kisi) => `<span class="p-ad${kisi === 'umut' ? ' kendi' : ''}">${e(kisi)}</span>`;
  // Süs düğmeler (Yeni konu, Gönder…): ziyaretçiyi oyalamasın diye odak almaz.
  const sus = (metin, ikonAd, sinif = '') => `<span class="p-dugme${sinif ? ` ${sinif}` : ''}" aria-hidden="true">${ikonAd ? ikon(ikonAd) : ''}${e(metin)}</span>`;
  const arac = (ikonAd, baslik, sag = '', alt = '') => `<header class="p-arac">${ikon(ikonAd, 'p-arac-ikon')}<h3>${e(baslik)}</h3>${alt ? `<span class="p-arac-alt">${e(alt)}</span>` : ''}<span class="p-bosluk"></span>${sag}</header>`;
  const kv = (satirlar) => `<dl class="p-kv">${satirlar.map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl>`;
  const ekran = (id, govde) => `<section class="p-ekran p-ekran-${id.replace('_', '-')}" data-ekran-icerik="${id}" aria-label="${e(r.ogeler[id])}"${id === 'forum' ? '' : ' hidden'}>${govde}</section>`;

  // Kenar çubuğu
  const nav = (id, ikonAd, ek = '') => `<button type="button" class="p-nav" data-ekran="${id}"${id === 'forum' ? ' aria-current="page"' : ''}>${ikon(ikonAd)}<span>${e(r.ogeler[id])}</span>${ek}</button>`;
  const calisan = `<i class="p-nokta iyi" title="${e(r.calisiyor)}"></i><span class="gorsel-gizli">, ${e(r.calisiyor)}</span>`;
  const f = r.forum;
  const kategoriSayisi = (kat) => f.konular.filter((k) => k.kat === kat).length;
  const kategoriler = `<div class="p-alt-gezinme" role="group" aria-label="${e(r.kategoriEtiket)}">${f.kategoriler.map(([id, isim]) => `<button type="button" class="p-kat" data-kategori="${id}"><span>${e(isim)}</span><span class="p-sayi">${kategoriSayisi(id)}</span></button>`).join('')}</div>`;
  const grup = (g) => `<p class="p-grup">${e(r.gruplar[g])}</p>`;
  const kenar = `<nav class="p-kenar" aria-label="${e(r.kenarEtiket)}">
<div class="p-marka"><img src="/assets/img/logo.png" width="26" height="26" alt=""><span>AND</span></div>
<div class="p-arama" aria-hidden="true">${ikon('ara')}<span>${e(r.arama)}</span><kbd>Ctrl K</kbd></div>
<div class="p-gezinme">
${grup('topluluk')}${nav('forum', 'forum', calisan)}${kategoriler}${nav('sohbet', 'sohbet')}
${grup('iletisim')}${nav('ozel_chat', KATEGORI_IKONU.iletisim, `${calisan}<b class="p-okunmamis" aria-hidden="true"></b><span class="gorsel-gizli">, 2 ${e(r.okunmamis)}</span>`)}
${grup('icerik')}${nav('site', KATEGORI_IKONU.icerik)}
${grup('yonetim')}${nav('admin', KATEGORI_IKONU.yonetim)}
${grup('gelistirme')}${nav('deltax', KATEGORI_IKONU.gelistirme, calisan)}
<div class="p-gezinme-alt">${nav('ayarlar', 'ayarlar')}${nav('hakkinda', 'bilgi')}</div>
</div>
<div class="p-kullanici" aria-hidden="true">${avatar('umut', 'kucuk')}<span class="p-kullanici-bilgi"><b>umut</b><span>${e(r.profil)}</span></span>${ikon('guc')}</div>
</nav>`;

  // Forum (forum eklentisi)
  const govdeHtml = (parca) => {
    if (typeof parca === 'string') return `<p>${e(parca)}</p>`;
    if (parca.kod) return `<div class="p-kod"><div class="p-kod-ust"><span>${e(parca.dil)}</span>${ikon('kopyala')}</div><pre><code>${e(parca.kod.join('\n'))}</code></pre></div>`;
    return `<p>${e(parca.once)}<a href="${e(parca.baglanti)}">${e(parca.baglanti)}</a></p>`;
  };
  const yazarSatiri = (kisi, zaman, boyut) => `<div class="p-yazar">${boyut ? avatar(kisi, boyut) : ''}${ad(kisi)}<span class="p-soluk">${e(zaman)}</span><span class="p-imza" title="${e(f.imzali)}">${ikon('muhur')}<span class="gorsel-gizli">${e(f.imzali)}</span></span></div>`;
  const katAdi = Object.fromEntries(f.kategoriler);
  const liste = f.konular.map((k, i) => `<button type="button" class="p-konu" data-konu="${i + 1}" data-kategori="${k.kat}"${i === 0 ? ' aria-current="true"' : ''}><span class="p-konu-baslik"><span>${e(k.baslik)}</span>${k.yanitlar.length ? `<b class="p-rozet">${k.yanitlar.length}</b>` : ''}</span><span class="p-konu-alt">${e(katAdi[k.kat])} · ${e(k.yazar)} · ${e(k.zaman)}</span></button>`).join('');
  const okumalar = f.konular.map((k, i) => `<article class="p-okuma" data-konu-icerik="${i + 1}"${i === 0 ? '' : ' hidden'}>
<h4>${e(k.baslik)}</h4>${yazarSatiri(k.yazar, k.zaman, 'kucuk')}
<div class="p-metin">${k.govde.map(govdeHtml).join('')}</div>
${sus(f.profil, 'profil', 'hayalet')}
${k.yanitlar.length ? `<h5>${e(f.yanitlar(k.yanitlar.length))}</h5><ol class="p-izlek">${k.yanitlar.map(([kisi, zaman, metin]) => `<li class="p-yanit">${avatar(kisi, 'kucuk')}<div>${yazarSatiri(kisi, zaman)}<p>${e(metin)}</p></div></li>`).join('')}</ol>` : ''}
</article>`).join('');
  const forum = ekran('forum', arac('forum', r.ogeler.forum, `<span class="p-secim" aria-hidden="true">${e(f.tum)}${ikon('asagi')}</span>${sus(f.yeni, 'arti', 'birincil')}`) +
    `<div class="p-bolunmus p-forum"><div class="p-sol"><div class="p-suz" aria-hidden="true">${e(f.suz)}</div><div class="p-liste" role="group" aria-label="${e(f.listeEtiket)}">${liste}</div></div>
<div class="p-sag"><button type="button" class="p-geri" data-geri>${ikon('geri')}${e(f.geri)}</button>${okumalar}</div></div>`);

  // Sohbet (AND'ın kendi ekranı)
  const s = r.sohbet;
  let onceki = '';
  const iletiler = s.iletiler.map(([saat, kisi, metin]) => {
    const devam = kisi === onceki;
    onceki = kisi;
    return `<div class="p-ileti${devam ? ' devam' : ''}">${avatar(kisi)}<div><div class="p-ileti-ust">${ad(kisi)}<span class="p-soluk">${saat}</span></div><p>${e(metin)}</p></div></div>`;
  }).join('');
  const sohbet = ekran('sohbet', arac('sohbet', r.ogeler.sohbet, '', s.aciklama) +
    `<div class="p-iletiler"><p class="p-gun">${e(s.gun)}</p>${iletiler}</div>
<div class="p-yaz" aria-hidden="true"><span class="p-girdi">${e(s.yaz)}</span><span class="p-soluk">0 / 500</span>${sus(s.gonder, 'gonder', 'birincil')}</div>`);

  // Özel Chat (eklenti)
  const o = r.ozelChat;
  const konusmalar = o.konusmalar.map(([kisi, son, n], i) => `<div class="p-oge${i === 0 ? ' etkin' : ''}">${avatar(kisi, 'kucuk')}<span class="p-oge-metin"><b>${e(kisi)}</b><span>${e(son)}</span></span>${n ? `<b class="p-rozet vurgu">${n}</b>` : ''}</div>`).join('');
  const balonlar = o.iletiler.map(([yon, metin, saat]) => `<div class="p-balon ${yon}">${yon === 'gelen' ? `<b>${e(o.konusmalar[0][0])}</b>` : ''}<span>${e(metin)}</span><small>${saat}</small></div>`).join('');
  const ozelChat = ekran('ozel_chat', arac(KATEGORI_IKONU.iletisim, r.ogeler.ozel_chat, sus(o.yeni, 'arti')) +
    `<div class="p-bolunmus"><div class="p-sol" role="group" aria-label="${e(o.listeEtiket)}">${konusmalar}</div>
<div class="p-sag p-sohbet-sag"><div class="p-balonlar">${balonlar}</div><div class="p-yaz" aria-hidden="true"><span class="p-girdi">${e(o.yaz)}</span>${sus(o.gonder, 'gonder', 'birincil')}</div></div></div>`);

  // Site (eklenti)
  const si = r.site;
  const sayfalar = si.sayfalar.map(([slug, baslik], i) => `<div class="p-oge${i === 0 ? ' etkin' : ''}">${ikon('belge', 'p-oge-ikon')}<span class="p-oge-metin"><b>${e(baslik)}</b><span>/${e(slug)}</span></span></div>`).join('');
  const site = ekran('site', arac(KATEGORI_IKONU.icerik, r.ogeler.site, sus(si.yeni, 'arti')) +
    `<div class="p-bolunmus"><div class="p-sol" role="group" aria-label="${e(si.listeEtiket)}">${sayfalar}</div>
<div class="p-sag"><div class="p-kart p-site-onizleme"><h4>${e(si.baslik)}</h4><p>${e(si.paragraf)}</p><h5>${e(si.altBaslik)}</h5><ul>${si.liste.map((x) => `<li>${e(x)}</li>`).join('')}</ul></div></div></div>`);

  // Yönetici Paneli (eklenti)
  const ad_ = r.admin;
  const admin = ekran('admin', arac(KATEGORI_IKONU.yonetim, r.ogeler.admin) +
    `<div class="p-govde">${kv(ad_.ozet)}<h4 class="p-bolum-baslik">${e(ad_.yasaklarBaslik)}</h4>
<div class="p-tablo-kap"><table class="p-tablo"><thead><tr>${ad_.sutunlar.map((x) => `<th>${e(x)}</th>`).join('')}</tr></thead><tbody>${ad_.yasaklar.map(([kim, anahtar, neden, kalan]) => `<tr><td><b>${e(kim)}</b>${anahtar ? ` <span class="p-soluk p-kod-yazi">${e(anahtar)}</span>` : ''}</td><td>${e(neden)}</td><td>${e(kalan)}</td></tr>`).join('')}</tbody></table></div></div>`);

  // DeltaX (eklenti)
  const d = r.deltax;
  const deltax = ekran('deltax', `<header class="p-arac">${ikon(KATEGORI_IKONU.gelistirme, 'p-arac-ikon')}<h3 class="p-yol">${d.yol.map((x, i) => `<span${i === d.yol.length - 1 ? ' class="son"' : ''}>${e(x)}</span>`).join('<span class="p-soluk" aria-hidden="true">›</span>')}</h3></header>` +
    `<div class="p-govde">${kv(d.ozet)}<h4 class="p-bolum-baslik">${e(d.sonBaslik)}</h4>
<div class="p-commitler">${d.commitler.map(([hash, mesaj, kisi, zaman]) => `<div class="p-commit"><code>${hash}</code><b>${e(mesaj)}</b><span class="p-soluk">${e(kisi)} · ${e(zaman)}</span></div>`).join('')}</div></div>`);

  // Ayarlar (AND'ın kendi ekranı)
  const ay = r.ayarlar;
  const sekmeler = `<div class="p-sekmeler">${ay.sekmeler.map(([id, isim, ikonAd]) => `<button type="button" class="p-sekme" data-sekme="${id}"${id === 'gorunum' ? ' aria-current="true"' : ''}>${ikon(ikonAd)}${e(isim)}</button>`).join('')}</div>`;
  const temaKarti = (t) => {
    const [vurgu, secim, isim, rozet] = t.renk;
    const etkin = t.id === 'klasik';
    return `<button type="button" class="p-tema-karti${etkin ? ' etkin' : ''}" data-tema-sec="${t.id}" aria-pressed="${etkin}" style="--onizleme-vurgu:${vurgu}"><span class="p-tema-onizleme"><svg viewBox="0 0 160 64" aria-hidden="true"><path d="M8 14H152" stroke="${isim}"/><path d="M90 6V58" stroke="${secim}"/><path d="M8 50H50L74 26H152" stroke="${vurgu}"/><circle class="aktarma" cx="90" cy="14" r="5"/><circle class="durak" cx="130" cy="26" r="4" fill="${rozet}"/><circle class="sen" cx="90" cy="26" r="7" fill="${vurgu}"/></svg></span><span class="p-tema-adi">${e(t[dil])}${ikon('tamam')}</span></button>`;
  };
  const sekmeIcerik = (id, html) => `<div class="p-sekme-icerik" data-sekme-icerik="${id}"${id === 'gorunum' ? '' : ' hidden'}>${html}</div>`;
  const p = ay.profil;
  const profilIcerik = `<div class="p-kart p-profil"><div class="p-profil-ust">${avatar('umut', 'buyuk')}<div><b class="p-profil-ad">umut</b><p>${e(p.durum)}</p></div></div><p>${e(p.bio)}</p><div class="p-cipler">${p.etiketler.map((x) => `<span class="p-cip">${e(x)}</span>`).join('')}</div></div>
<h4 class="p-bolum-baslik">${e(p.kimlik)}</h4><div class="p-kart p-kimlik"><span class="p-soluk">${e(p.peer)}</span><code>12D3KooW9rTnPq4sXhZ1bV7cLmK2yDdWngf13xEF</code></div>`;
  const gorunumIcerik = `<h4 class="p-bolum-baslik"><span>${e(ay.tema)} <span class="p-soluk">·</span> <span data-tema-adi>${e(TEMALAR[0][dil])}</span></span></h4><p class="p-soluk">${e(ay.temaAciklama)}</p>
<div class="p-tema-izgarasi">${TEMALAR.map(temaKarti).join('')}</div>
<h4 class="p-bolum-baslik">${e(ay.ozel)}</h4><p class="p-soluk">${e(ay.ozelAciklama)}</p>
<div class="p-ozel" aria-hidden="true"><span class="p-renk"><i></i>#5F5FFF</span>${sus(ay.uygula, 'palet', 'birincil')}</div>`;
  const dilIcerik = `<div class="p-kart p-diller">${ay.diller.map(([isim, kod]) => `<div class="p-dil${kod === ay.dilKodu ? ' etkin' : ''}"><i></i>${e(isim)}<code>${kod}</code></div>`).join('')}</div>`;
  const eklentiIcerik = ay.eklentiGruplari.map(([kat, baslik, ogeler]) => `<h4 class="p-bolum-baslik p-eklenti-grubu">${ikon(KATEGORI_IKONU[kat])}${e(baslik)} <span class="p-soluk">${ogeler.length}</span></h4><div class="p-kart p-eklentiler">${ogeler.map(([isim, surum, aciklama]) => `<div class="p-eklenti"><div><b>${e(isim)}</b> <span class="p-soluk">${surum}</span><p>${e(aciklama)}</p></div>${kat === 'tema' ? '' : `<span class="p-durum-rozet"><i class="p-nokta iyi"></i>${e(ay.calisiyor)}</span>`}</div>`).join('')}</div>`).join('') +
    `<div class="p-kart p-vscode"><div><b>${e(ay.vscode[0])}</b><p>${e(ay.vscode[1])}</p></div><span class="p-anahtar acik" aria-hidden="true"><i></i></span><span class="gorsel-gizli">${e(ay.vscode[2])}</span></div>`;
  const ayarlar = ekran('ayarlar', arac('ayarlar', r.ogeler.ayarlar) + sekmeler +
    `<div class="p-govde">${sekmeIcerik('profil', profilIcerik)}${sekmeIcerik('gorunum', gorunumIcerik)}${sekmeIcerik('dil', dilIcerik)}${sekmeIcerik('eklentiler', eklentiIcerik)}${sekmeIcerik('ag', kv(ay.ag))}</div>`);

  // AND hakkında
  const h = r.hakkinda;
  const hakkinda = ekran('hakkinda', arac('bilgi', r.ogeler.hakkinda) +
    `<div class="p-sekmeler p-sekmeler-sabit" aria-hidden="true">${h.sekmeler.map((x, i) => `<span class="p-sekme-sabit${i === 0 ? ' etkin' : ''}">${e(x)}</span>`).join('')}</div>
<div class="p-govde"><div class="p-hakkinda-ust"><img src="/assets/img/logo.png" width="56" height="56" alt=""><div><b>AND</b><span class="p-soluk">${SURUM}</span></div></div><p>${e(h.aciklama)}</p>${kv(h.kv).replace(e('github.com/AND-community/AND'), `<a href="${DEPO}">github.com/AND-community/AND</a>`)}</div>`);

  const durum = `<div class="p-durum"><span class="p-parca" data-es><i class="p-nokta iyi"></i>${e(r.durum.es(23))}<span class="p-ayrac" aria-hidden="true"></span><span class="p-soluk">${e(r.durum.dugum(4))}</span></span><span class="p-parca p-surum">AND ${SURUM}</span></div>`;

  return `<div class="pencere" data-pencere role="group" aria-label="${e(r.pencereEtiket)}">
<div class="p-cubuk" aria-hidden="true"><span class="p-cubuk-ad"><img src="/assets/img/logo.png" width="16" height="16" alt="">AND</span><span class="p-pencere-dugmeleri"><i class="kucult"></i><i class="buyut"></i><i class="kapat"></i></span></div>
<div class="p-uygulama">
${kenar}
<div class="p-ana">
${forum}
${sohbet}
${ozelChat}
${site}
${admin}
${deltax}
${ayarlar}
${hakkinda}
${durum}
</div>
</div>
</div>`;
}

module.exports = { pencere, R };
