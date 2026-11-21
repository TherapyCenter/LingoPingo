// Soundeffekte (synthetisiert), Vorlesen (TTS) und Spracherkennung.
import { LANGS } from './course.js';

let ctx = null;
let enabled = true;
export const setSoundEnabled = (v) => { enabled = v; };

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, { type = 'sine', vol = 0.18, slide = 0 } = {}) {
  const a = ac();
  const t = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  tap() { if (enabled) tone(660, 0, 0.06, { type: 'triangle', vol: 0.08 }); },
  correct() {
    if (!enabled) return;
    tone(784, 0, 0.12, { type: 'triangle' });
    tone(1175, 0.09, 0.22, { type: 'triangle' });
  },
  wrong() {
    if (!enabled) return;
    tone(220, 0, 0.18, { type: 'square', vol: 0.07, slide: 0.8 });
    tone(165, 0.13, 0.26, { type: 'square', vol: 0.07, slide: 0.8 });
  },
  combo(n) {
    if (!enabled) return;
    const base = 523 * Math.pow(2, Math.min(n, 12) / 12);
    [0, 4, 7, 12].forEach((s, i) => tone(base * Math.pow(2, s / 12), i * 0.06, 0.12, { type: 'triangle', vol: 0.1 }));
  },
  pop() { if (enabled) tone(900, 0, 0.08, { type: 'sine', vol: 0.12, slide: 1.6 }); },
  match() { if (enabled) { tone(988, 0, 0.08, { type: 'triangle', vol: 0.1 }); tone(1319, 0.06, 0.1, { type: 'triangle', vol: 0.1 }); } },
  fanfare() {
    if (!enabled) return;
    const n = [523, 659, 784, 1047, 784, 1047, 1319];
    n.forEach((f, i) => tone(f, i * 0.11, i === n.length - 1 ? 0.5 : 0.14, { type: 'triangle', vol: 0.14 }));
  },
  levelUp() {
    if (!enabled) return;
    [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.2, { type: 'square', vol: 0.06 }));
  },
  fail() {
    if (!enabled) return;
    [392, 370, 349, 262].forEach((f, i) => tone(f, i * 0.22, 0.3, { type: 'triangle', vol: 0.12 }));
  },
  tick() { if (enabled) tone(1200, 0, 0.03, { type: 'square', vol: 0.04 }); },
};

// ---------- Text-to-Speech ----------
let voices = [];
function loadVoices() { voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : []; }
if (window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}
export const ttsSupported = () => !!window.speechSynthesis;

export function voiceFor(lang) {
  const tag = (LANGS[lang]?.tts || lang).toLowerCase();
  const prefix = tag.split('-')[0];
  const list = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix));
  // Bevorzugt: exakte Region, dann "natürliche"/Online-Stimmen
  const score = (v) => (v.lang.toLowerCase().replace('_', '-') === tag ? 2 : 0) +
    (/natural|online|google|premium|enhanced/i.test(v.name) ? 1 : 0);
  return list.sort((a, b) => score(b) - score(a))[0] || null;
}
export const hasVoice = (lang) => !!voiceFor(lang);

let speechRate = 0.95;
export const setSpeechRate = (r) => { speechRate = r; };

export function speak(text, lang, { slow = false } = {}) {
  if (!window.speechSynthesis || !text) return Promise.resolve();
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANGS[lang]?.tts || lang;
    const v = voiceFor(lang);
    if (v) u.voice = v;
    u.rate = slow ? 0.6 : speechRate;
    u.onend = u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
    setTimeout(resolve, 8000);
  });
}

// ---------- Spracherkennung ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const recognitionSupported = () => !!SR && window.isSecureContext;

export function listen(lang, { onStart } = {}) {
  return new Promise((resolve, reject) => {
    if (!recognitionSupported()) return reject(new Error('unsupported'));
    const r = new SR();
    r.lang = LANGS[lang]?.tts || lang;
    r.interimResults = false;
    r.maxAlternatives = 5;
    let done = false;
    r.onstart = () => onStart && onStart();
    r.onresult = (e) => {
      done = true;
      const res = e.results[0];
      resolve(Array.from(res).map((a) => a.transcript));
    };
    r.onerror = (e) => { if (!done) { done = true; reject(new Error(e.error || 'error')); } };
    r.onend = () => { if (!done) { done = true; resolve([]); } };
    try { r.start(); } catch (e) { reject(e); }
    listen.stop = () => { try { r.stop(); } catch { /* noop */ } };
  });
}
