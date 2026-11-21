// LingoPingo – minimaler Server ohne Abhängigkeiten.
// Liefert die statische App aus und speichert Profile als JSON in DATA_DIR.
'use strict';
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '8080', 10);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || '8443', 10);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.apk': 'application/vnd.android.package-archive',
};

// ---------- Profil-Speicher ----------
let profiles = {};
try {
  profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8'));
} catch { profiles = {}; }

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const tmp = PROFILES_FILE + '.tmp';
    fs.writeFile(tmp, JSON.stringify(profiles), (err) => {
      if (err) return console.error('Speichern fehlgeschlagen:', err);
      fs.rename(tmp, PROFILES_FILE, (e) => e && console.error(e));
    });
  }, 300);
}

const validName = (n) => typeof n === 'string' && /^[\p{L}\p{N} _.-]{1,24}$/u.test(n);
const key = (n) => n.trim().toLowerCase();

function send(res, status, body, headers = {}) {
  const data = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'object' && !Buffer.isBuffer(body) ? MIME['.json'] : 'text/plain; charset=utf-8',
    ...headers,
  });
  res.end(data);
}

function readBody(req, limit = 512 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// CORS: the Android app (origin https://appassets.androidplatform.net) talks to this server
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Private-Network': 'true',
  'Access-Control-Max-Age': '86400',
};

async function api(req, res, url) {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'profiles', name?]
  if (parts[1] !== 'profiles') return send(res, 404, { error: 'not found' });

  if (parts.length === 2 && req.method === 'GET') {
    // Übersicht / Rangliste (ohne Detaildaten)
    const list = Object.values(profiles).map((p) => ({
      name: p.name, avatar: p.avatar, xp: p.xp || 0, level: p.level || 1,
      streak: p.streak || 0, weekXp: p.weekXp || 0, weekId: p.weekId || '',
      course: p.currentCourse || null, updatedAt: p.updatedAt || 0,
    }));
    return send(res, 200, list);
  }

  const name = parts[2] ? decodeURIComponent(parts[2]) : '';
  if (!validName(name)) return send(res, 400, { error: 'ungültiger Name' });
  const k = key(name);

  if (req.method === 'GET') {
    return profiles[k] ? send(res, 200, profiles[k]) : send(res, 404, { error: 'not found' });
  }
  if (req.method === 'PUT') {
    let body;
    try { body = JSON.parse(await readBody(req)); } catch { return send(res, 400, { error: 'bad json' }); }
    if (!body || typeof body !== 'object') return send(res, 400, { error: 'bad body' });
    body.name = name.trim();
    body.updatedAt = Date.now();
    profiles[k] = body;
    persist();
    return send(res, 200, { ok: true, updatedAt: body.updatedAt });
  }
  if (req.method === 'DELETE') {
    delete profiles[k];
    persist();
    return send(res, 200, { ok: true });
  }
  return send(res, 405, { error: 'method not allowed' });
}

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, 'forbidden');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      // SPA-Fallback
      return fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e, buf) =>
        e ? send(res, 404, 'not found') : send(res, 200, buf, { 'Content-Type': MIME['.html'] }));
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'Content-Length': st.size,
    });
    fs.createReadStream(file).pipe(res);
  });
}

async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/healthz') return send(res, 200, 'ok');
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    return serveStatic(req, res, url);
  } catch (e) {
    console.error(e);
    send(res, 500, { error: 'server error' });
  }
}

http.createServer(handler).listen(PORT, () => console.log(`🐧 LingoPingo läuft auf http://localhost:${PORT}`));

// Optionales HTTPS (nötig für Mikrofon/Spracherkennung auf dem Handy im LAN)
const certFile = process.env.TLS_CERT || path.join(DATA_DIR, 'certs', 'cert.pem');
const keyFile = process.env.TLS_KEY || path.join(DATA_DIR, 'certs', 'key.pem');
if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
  https.createServer({ cert: fs.readFileSync(certFile), key: fs.readFileSync(keyFile) }, handler)
    .listen(HTTPS_PORT, () => console.log(`🔒 HTTPS auf https://localhost:${HTTPS_PORT}`));
}
