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
| `assets/css/site.css` | All styles. The colours are AND's ten themes (`ui/theme.go` in AND); the desktop-window replica follows `internal/masaustu/web/uygulama.css` |
| `assets/js/site.js` | Theme switching, the desktop-window replica (screens, forum, settings, narrow layout), the release check, copy buttons |
| `assets/fonts/` | AND Site Mono and AND Site Slab, with their licence (`OFL.txt`) |
| `assets/img/`, `favicon.ico` | Icons and share images |
| `tools/olustur.js` | Generates the pages, `sitemap.xml` and the image templates from one template |
| `tools/pencere.js` | The desktop-window replica: its text (table `R`, both languages) and its HTML |
| `tools/denetle.js` | Checks the generated pages: themes, the replica's structure, the copy, English/Turkish parity |
| `tools/tema-tonlari.js` | Derives a theme's darker and lighter tones the way the existing themes were made |
| `tools/og.html` | Template for the share images (generated) |
| `tools/logo.png` | AND's logo (500×500); the icons are made from it |
| `tools/simge-uret.js` | Makes the icons from the logo |
| `tools/sunucu.js` | A small local server for previewing |
| `tools/yazitipi-hazirla.js` | Builds the fonts from Monaspace |

## Editing

The page copy is table `M` in `tools/olustur.js`; the replica's text is table `R` in
`tools/pencere.js`. Both languages come from one template, so they always share one structure.
After a change:

```bash
node tools/olustur.js
node tools/denetle.js          # every check must pass
node tools/sunucu.js .        # then open http://127.0.0.1:8123/
```

The replica copies AND's desktop window (`internal/masaustu/web` in AND) and the screens the
bundled plugins draw in it. Its icons are the app's own, and its text comes from AND's and the
plugins' translation catalogues (`dil/ceviriler`, `Eklentiler/*/ceviri.json`). When the app's
screens change, update `tools/pencere.js` and the replica's section of `site.css` too.

A new AND theme needs its colours in `TEMALAR` (`tools/olustur.js`), a block in `site.css` (run
`node tools/tema-tonlari.js` for the derived tones) and its name in `site.js`.

## Images

`assets/img/og.png` and `og-tr.png` are 1200×630 screenshots of `tools/og.html` (`?dil=tr` for
Turkish).

The icons come from AND's logo, `tools/logo.png`. `node tools/simge-uret.js` writes:

- `assets/img/logo.png` (192×192): used in the header, the footer and the share images
- `favicon.ico`: 16, 32 and 48 px
- `assets/img/apple-touch-icon.png` (180×180): on the page's dark background, because iOS doesn't
  show transparency

When the logo changes, run it, then retake the share images.

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
