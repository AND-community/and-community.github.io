// Yalnızca 127.0.0.1'de dinleyen küçük statik dosya sunucusu: siteyi GitHub
// Pages gibi kökten sunar (dizin → index.html, olmayan yol → 404.html, 404).
// Kullanım: node tools/sunucu.js . [port]   (sitenin kök dizininde)
const http = require('http');
const fs = require('fs');
const path = require('path');

const kok = path.resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 8123);
const turler = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
};

function gonder(res, durum, dosya) {
  res.writeHead(durum, { 'Content-Type': turler[path.extname(dosya)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(dosya).pipe(res);
}

http.createServer((req, res) => {
  let yol;
  try {
    yol = path.join(kok, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (!yol.startsWith(kok)) {
    res.writeHead(403).end();
    return;
  }
  fs.stat(yol, (err, st) => {
    if (!err && st.isDirectory()) yol = path.join(yol, 'index.html');
    fs.access(yol, fs.constants.R_OK, (e) => {
      if (!e) return gonder(res, 200, yol);
      const bulunamadi = path.join(kok, '404.html');
      if (fs.existsSync(bulunamadi)) return gonder(res, 404, bulunamadi);
      res.writeHead(404).end('404');
    });
  });
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}/ → ${kok}`));
