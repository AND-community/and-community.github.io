# and-community.github.io

**English** · [Türkçe](README.tr.md)

The website of [AND](https://github.com/AND-community/AND), published by GitHub Pages at
<https://and-community.github.io/> from the root of the `main` branch.

It is a static site: GitHub builds nothing, and the pages make no third-party requests. The fonts
are hosted here, there are no cookies or analytics, and the only request to another server is the
download section asking GitHub's API for the latest release.

## Layout

| Path | What it is |
|---|---|
| `index.html`, `tr/index.html` | The English and Turkish pages (generated) |
| `404.html` | The page GitHub Pages shows for unknown addresses (generated) |
| `assets/css/site.css` | All styles. The colours are AND's own themes (`internal/ui/theme.go` in AND) |
| `assets/js/site.js` | Theme switching, the home-screen replica's menu, the release check, copy buttons |
| `assets/fonts/` | AND Site Mono and AND Site Slab, with their licence (`OFL.txt`) |
| `assets/img/`, `favicon.ico` | Icons and share images |
| `tools/olustur.js` | Generates the pages, `sitemap.xml` and the image templates from one template |
| `tools/og.html`, `tools/simge.html` | Templates for the share images and the icons (generated) |
| `tools/sunucu.js` | A small local server for previewing |
| `tools/yazitipi-hazirla.js` | Builds the fonts from Monaspace |

## Editing

All text is in `tools/olustur.js`: table `M` holds the page copy and table `R` the home-screen
replica, so the two languages always share one structure. After a change:

```bash
node tools/olustur.js
node tools/sunucu.js .        # then open http://127.0.0.1:8123/
```

The replica copies AND's home screen (`internal/tui/home.go`), and its text comes from AND's
translation catalogue (`dil/ceviriler`). When the app's home screen changes, update it here too.

## Images

`assets/img/og.png` and `og-tr.png` are 1200×630 screenshots of `tools/og.html` (`?dil=tr` for
Turkish). `assets/img/apple-touch-icon.png` (180×180) and the 32×32 PNG inside `favicon.ico` are
screenshots of `tools/simge.html`.

## Fonts

AND Site Mono and AND Site Slab are subsets of Monaspace Neon and Monaspace Xenon v1.400 by GitHub
(<https://github.com/githubnext/monaspace>). They keep only the characters this site uses (Latin
with Turkish, box drawing, blocks and geometric shapes) and the weights 400–700 and 500–700. The
SIL Open Font License reserves the name "Monaspace" and its subfamily names for unmodified fonts,
so the subsets are renamed; their copyright and licence records are kept. To rebuild them from the
variable TTFs of a Monaspace release:

```bash
npm install subset-font@2.9.0
node tools/yazitipi-hazirla.js "Monaspace Neon Var.ttf" assets/fonts/and-site-mono.woff2 "AND Site Mono" 400 700 kutu
node tools/yazitipi-hazirla.js "Monaspace Xenon Var.ttf" assets/fonts/and-site-slab.woff2 "AND Site Slab" 500 700
```
