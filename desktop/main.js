// LingoPingo for Windows: the web app runs from the bundled "public" folder via the
// app:// protocol (secure context, localStorage works). Updates come from GitHub releases.
'use strict';
const { app, BrowserWindow, protocol, net, shell, dialog, Menu, nativeTheme } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const { autoUpdater } = require('electron-updater');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

const PUBLIC = app.isPackaged ? path.join(process.resourcesPath, 'public') : path.join(__dirname, '..', 'public');
let win = null;

if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

function createWindow() {
  win = new BrowserWindow({
    width: 480, height: 880, minWidth: 360, minHeight: 600,
    title: 'LingoPingo',
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#131f24' : '#ffffff',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      // optional sync with a LingoPingo server in the home network (often plain http)
      allowRunningInsecureContent: true,
    },
  });
  Menu.setApplicationMenu(null);
  win.loadURL('app://lingopingo/index.html');
  // external links open in the browser
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) { e.preventDefault(); shell.openExternal(url); } });
  win.on('closed', () => { win = null; });
}

app.whenReady().then(() => {
  protocol.handle('app', async (req) => {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (!p || p === '/') p = '/index.html';
    if (p.startsWith('/api/')) return new Response('not found', { status: 404 });
    const file = path.normalize(path.join(PUBLIC, p));
    if (!file.startsWith(PUBLIC)) return new Response('forbidden', { status: 403 });
    try { return await net.fetch(pathToFileURL(file).toString()); } catch { return new Response('not found', { status: 404 }); }
  });
  createWindow();
  setupUpdates();
});

app.on('window-all-closed', () => app.quit());

// Self-signed certificates are accepted only for servers in the private home network
app.on('certificate-error', (event, wc, url, error, cert, callback) => {
  const host = new URL(url).hostname;
  const ok = /^(localhost|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(host) || host.endsWith('.local');
  if (ok) { event.preventDefault(); callback(true); } else callback(false);
});

// ---------- Updates (GitHub releases) ----------
const T = {
  de: { available: 'Eine neue Version von LingoPingo ist verfügbar: {v}', detail: 'Jetzt herunterladen? Dein Fortschritt bleibt erhalten.', download: 'Herunterladen', later: 'Später', ready: 'Das Update {v} ist bereit.', readyDetail: 'LingoPingo jetzt neu starten und installieren?', restart: 'Neu starten' },
  en: { available: 'A new version of LingoPingo is available: {v}', detail: 'Download it now? Your progress is kept.', download: 'Download', later: 'Later', ready: 'Update {v} is ready.', readyDetail: 'Restart LingoPingo now to install it?', restart: 'Restart' },
  es: { available: 'Hay una nueva versión de LingoPingo: {v}', detail: '¿Descargarla ahora? Tu progreso se conserva.', download: 'Descargar', later: 'Más tarde', ready: 'La actualización {v} está lista.', readyDetail: '¿Reiniciar LingoPingo ahora para instalarla?', restart: 'Reiniciar' },
  fr: { available: 'Une nouvelle version de LingoPingo est disponible : {v}', detail: 'La télécharger maintenant ? Ta progression est conservée.', download: 'Télécharger', later: 'Plus tard', ready: 'La mise à jour {v} est prête.', readyDetail: 'Redémarrer LingoPingo maintenant pour l\'installer ?', restart: 'Redémarrer' },
  it: { available: 'È disponibile una nuova versione di LingoPingo: {v}', detail: 'Scaricarla ora? I tuoi progressi restano salvati.', download: 'Scarica', later: 'Più tardi', ready: 'L\'aggiornamento {v} è pronto.', readyDetail: 'Riavviare LingoPingo ora per installarlo?', restart: 'Riavvia' },
  hr: { available: 'Dostupna je nova verzija LingoPinga: {v}', detail: 'Preuzeti je sada? Tvoj napredak ostaje sačuvan.', download: 'Preuzmi', later: 'Kasnije', ready: 'Ažuriranje {v} je spremno.', readyDetail: 'Ponovno pokrenuti LingoPingo i instalirati?', restart: 'Ponovno pokreni' },
  tr: { available: 'LingoPingo\'nun yeni bir sürümü var: {v}', detail: 'Şimdi indirilsin mi? İlerlemen korunur.', download: 'İndir', later: 'Sonra', ready: '{v} güncellemesi hazır.', readyDetail: 'Yüklemek için LingoPingo şimdi yeniden başlatılsın mı?', restart: 'Yeniden başlat' },
  zh: { available: 'LingoPingo 有新版本：{v}', detail: '现在下载吗？你的进度会保留。', download: '下载', later: '稍后', ready: '更新 {v} 已准备就绪。', readyDetail: '现在重启 LingoPingo 进行安装吗？', restart: '重启' },
  ja: { available: 'LingoPingo の新しいバージョンがあります：{v}', detail: '今すぐダウンロードしますか？進捗はそのまま残ります。', download: 'ダウンロード', later: 'あとで', ready: 'アップデート {v} の準備ができました。', readyDetail: '今すぐ LingoPingo を再起動してインストールしますか？', restart: '再起動' },
};
async function texts() {
  let l = null;
  try { l = await win.webContents.executeJavaScript("localStorage.getItem('lingopingo.ui')"); } catch { /* ignore */ }
  l = T[l] ? l : app.getLocale().slice(0, 2);
  return T[l] || T.en;
}

function setupUpdates() {
  if (!app.isPackaged) return;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  let asked = null;
  autoUpdater.on('update-available', async (info) => {
    if (!win || asked === info.version) return;
    asked = info.version;
    const L = await texts();
    const r = await dialog.showMessageBox(win, {
      type: 'info', title: 'LingoPingo', buttons: [L.download, L.later], defaultId: 0, cancelId: 1,
      message: L.available.replace('{v}', info.version), detail: L.detail,
    });
    if (r.response === 0) autoUpdater.downloadUpdate().catch((e) => console.error(e));
  });
  autoUpdater.on('download-progress', (p) => { if (win) win.setProgressBar(p.percent / 100); });
  autoUpdater.on('update-downloaded', async (info) => {
    if (!win) return;
    win.setProgressBar(-1);
    const L = await texts();
    const r = await dialog.showMessageBox(win, {
      type: 'info', title: 'LingoPingo', buttons: [L.restart, L.later], defaultId: 0, cancelId: 1,
      message: L.ready.replace('{v}', info.version), detail: L.readyDetail,
    });
    if (r.response === 0) autoUpdater.quitAndInstall();
  });
  autoUpdater.on('error', (e) => { if (win) win.setProgressBar(-1); console.error('update error', e?.message || e); });
  const check = () => autoUpdater.checkForUpdates().catch(() => { /* offline */ });
  setTimeout(check, 4000);
  setInterval(check, 4 * 60 * 60 * 1000);
}
