import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./public/', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.json':'application/json; charset=utf-8' };
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function publicOrigin(req) {
  const configured = process.env.PUBLIC_ORIGIN || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '');
  if (configured) {
    const url = new URL(configured);
    if (!['http:','https:'].includes(url.protocol)) throw new Error('PUBLIC_ORIGIN must start with https:// or http://');
    return url.origin;
  }
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost').split(',')[0].trim();
  if (!/^[a-zA-Z0-9.:[\]-]+$/.test(host)) throw new Error('Invalid host');
  const proto = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim() === 'https' ? 'https' : 'http';
  return `${proto}://${host}`;
}
export function createApp() {
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD'}); res.end('Method not allowed'); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
    catch { res.writeHead(400);res.end('Bad request');return; }
    if (pathname === '/health') {res.writeHead(200, {'Content-Type':'application/json'});res.end(req.method==='HEAD'?undefined:'{"status":"ok"}');return;}
    if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').some(part => part.startsWith('.'))) {res.writeHead(404);res.end('Not found');return;}
    let filename = path.resolve(root, '.' + pathname);
    if (filename !== path.resolve(root) && !filename.startsWith(path.resolve(root) + path.sep)) {res.writeHead(404);res.end('Not found');return;}
    try {
      const info = await stat(filename);
      if (info.isDirectory()) {
        if (!pathname.endsWith('/')) { const query = new URL(req.url,'http://localhost').search;res.writeHead(308, {Location:pathname+'/'+query});res.end();return; }
        filename = path.join(filename,'index.html');
      }
      let body = await readFile(filename);
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.html') body = Buffer.from(body.toString('utf8').replaceAll('__PUBLIC_ORIGIN__', escape(publicOrigin(req))));
      res.writeHead(200, {'Content-Type':mime[ext]||'application/octet-stream','Content-Length':body.length,'Cache-Control':ext==='.html'?'no-cache':'public, max-age=3600'});
      res.end(req.method==='HEAD'?undefined:body);
    } catch (err) {
      const missing = ['ENOENT','ENOTDIR','EISDIR'].includes(err.code);
      res.writeHead(missing?404:500, {'Content-Type':'text/plain; charset=utf-8'});
      res.end(missing?'ページが見つかりません。トップページから開いてください。':'ページを読み込めませんでした。');
      if (!missing) console.error(err.message);
    }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const server = createApp();server.listen(port,'0.0.0.0',()=>console.log(`Little Monsters is listening on port ${port}`));
  for (const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),10000).unref();});
}
