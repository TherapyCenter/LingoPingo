// Builds the LingoPingo Android app (APK) without Gradle, using only the Android SDK
// build tools and a JDK:  node android/build.mjs
//
// Output: android/dist/LingoPingo.apk and a copy in public/download/ (so the server
// offers it for download at /download/LingoPingo.apk).
// Needs: JDK 17+ (javac, keytool), Android SDK with build-tools and a platform.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const win = process.platform === 'win32';
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT ||
  (win ? path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk') : path.join(process.env.HOME || '', 'Android', 'Sdk'));
if (!fs.existsSync(sdk)) fail(`Android SDK not found (${sdk}). Set ANDROID_HOME.`);

const newest = (dir) => fs.readdirSync(dir).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).pop();
const bt = path.join(sdk, 'build-tools', newest(path.join(sdk, 'build-tools')));
const platform = newest(path.join(sdk, 'platforms'));
const androidJar = path.join(sdk, 'platforms', platform, 'android.jar');
const targetSdk = platform.replace(/\D/g, '');
const tool = (n) => path.join(bt, win ? (['d8', 'apksigner'].includes(n) ? `${n}.bat` : `${n}.exe`) : n);
const jdk = (n) => (process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', n) : n);

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const versionName = pkg.version || '1.0.0';
const versionCode = String(Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 60000)); // grows with every build

const B = path.join(here, 'build');
const DIST = path.join(here, 'dist');
const KEYSTORE = path.join(here, 'lingopingo.keystore');
const KS_PASS = process.env.LINGOPINGO_KS_PASS || 'lingopingo';

function run(cmd, args, opts = {}) {
  console.log('>', path.basename(cmd), args.filter((a) => !String(a).startsWith('pass:')).join(' ').slice(0, 160));
  if (win && cmd.endsWith('.bat')) {
    // .bat files need cmd.exe; quote arguments ourselves
    const q = (a) => (/[\s"&|<>^]/.test(a) ? `"${String(a).replace(/"/g, '""')}"` : a);
    return execFileSync('cmd.exe', ['/d', '/s', '/c', `"${[cmd, ...args].map(q).join(' ')}"`], { stdio: 'inherit', windowsVerbatimArguments: true, ...opts });
  }
  return execFileSync(cmd, args, { stdio: 'inherit', ...opts });
}
function fail(msg) { console.error('ERROR:', msg); process.exit(1); }
function copyDir(src, dst, skip = () => false) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (skip(s)) continue;
    if (e.isDirectory()) copyDir(s, d, skip); else fs.copyFileSync(s, d);
  }
}
const listFiles = (dir, ext) => fs.readdirSync(dir, { recursive: true }).map((f) => path.join(dir, f)).filter((f) => f.endsWith(ext));

console.log(`LingoPingo ${versionName} (${versionCode}) – build-tools ${path.basename(bt)}, ${platform}`);
fs.rmSync(B, { recursive: true, force: true });
fs.mkdirSync(B, { recursive: true });
fs.mkdirSync(DIST, { recursive: true });

// 1. Web app -> assets/public (without the APK download folder)
copyDir(path.join(root, 'public'), path.join(B, 'assets', 'public'), (p) => path.basename(p) === 'download');

// 2. Resources + manifest
run(tool('aapt2'), ['compile', '--dir', path.join(here, 'res'), '-o', path.join(B, 'res.zip')]);
run(tool('aapt2'), ['link', '-o', path.join(B, 'base.apk'), '-I', androidJar,
  '--manifest', path.join(here, 'AndroidManifest.xml'),
  '--min-sdk-version', '24', '--target-sdk-version', targetSdk,
  '--version-code', versionCode, '--version-name', versionName,
  path.join(B, 'res.zip')]);

// 3. Java -> dex
const classes = path.join(B, 'classes');
run(jdk('javac'), ['--release', '11', '-classpath', androidJar, '-d', classes, '-encoding', 'UTF-8', '-nowarn',
  ...listFiles(path.join(here, 'src'), '.java')]);
run(tool('d8'), ['--release', '--min-api', '24', '--lib', androidJar, '--output', B, ...listFiles(classes, '.class')]);

// 4. classes.dex + assets into the APK (jar writes "/" paths; aapt2 -A writes "\\" on Windows), align, sign
run(jdk('jar'), ['-u', '-M', '-f', path.join(B, 'base.apk'), '-C', B, 'classes.dex', '-C', B, 'assets']);
run(tool('zipalign'), ['-f', '-p', '4', path.join(B, 'base.apk'), path.join(B, 'aligned.apk')]);
if (!fs.existsSync(KEYSTORE)) {
  console.log('Creating signing key', KEYSTORE);
  run(jdk('keytool'), ['-genkeypair', '-keystore', KEYSTORE, '-alias', 'lingopingo', '-keyalg', 'RSA', '-keysize', '2048',
    '-validity', '10000', '-storepass', KS_PASS, '-keypass', KS_PASS, '-dname', 'CN=LingoPingo']);
}
const out = path.join(DIST, 'LingoPingo.apk');
run(tool('apksigner'), ['sign', '--ks', KEYSTORE, '--ks-key-alias', 'lingopingo', '--ks-pass', `pass:${KS_PASS}`,
  '--key-pass', `pass:${KS_PASS}`, '--out', out, path.join(B, 'aligned.apk')]);
run(tool('apksigner'), ['verify', out]);

const dl = path.join(root, 'public', 'download');
fs.mkdirSync(dl, { recursive: true });
fs.copyFileSync(out, path.join(dl, 'LingoPingo.apk'));
console.log(`\nDone: ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)\nDownload via the server: /download/LingoPingo.apk`);
