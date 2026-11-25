// Erzeugt Lektionen passend zu Fortschritt & Können und prüft Antworten.
import { UNITS, LANGS, LESSONS_PER_UNIT, main, alts, itemsOfUnit, joinCjk, HAS_CJK } from './course.js';
import { JA as READ_JA, ZH as READ_ZH } from './lang/readings.js';
import { itemState, unitProgress, isUnitUnlocked, skillBonus } from './store.js';
import { recognitionSupported, ttsSupported } from './audio.js';

// ---------- Utils ----------
export const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const PUNCT = /[¿¡?!.,;:"„“”«»…()–—\-？！。，、；：“”（）]/g;
export function norm(s) {
  return joinCjk((s || '').toLowerCase().normalize('NFC')
    .replace(/i̇/g, 'i') // Turkish "İ".toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(PUNCT, ' ')
    .replace(/\s+/g, ' ').trim());
}
function strip(s) {
  return norm(s).replace(/dj/g, 'đ').replace(/đ/g, 'd').replace(/ı/g, 'i').replace(/œ/g, 'oe')
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
// Like lev, but swapping two neighbouring letters counts as one mistake ("guo" ~ "gou")
function osa(a, b) {
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[m][n];
}

// Japanese/Chinese typed in romaji/pinyin: compare without tones, long-vowel marks,
// spaces and apostrophes ("wo he shui", "ni3 hao3", "arigatou", "watashiwaanadesu").
const READINGS = { ja: READ_JA, zh: READ_ZH };
function flatReading(x, lang) {
  let f = strip(x).replace(/[\s'-]/g, '');
  if (lang === 'zh') f = f.replace(/[1-5]/g, '').replace(/v/g, 'u');
  if (lang === 'ja') f = f.replace(/ou/g, 'o').replace(/([aeiou])\1+/g, '$1');
  return f;
}
// All accepted answers of a Japanese/Chinese entry as [shown answer, Latin reading] pairs.
function cjkReadings(options, lang) {
  const out = [];
  const head = joinCjk(options[0]);
  for (const a of options) {
    if (!HAS_CJK.test(a)) out.push([head, a]);
    else if (READINGS[lang]?.[a]) out.push([joinCjk(a), READINGS[lang][a]]);
  }
  return out;
}

// Prüft getippte Antworten: exakt / ohne Akzente / mit kleinem Tippfehler
export function checkText(input, answerStr, lang) {
  const options = alts(answerStr);
  const best = joinCjk(options[0]);
  const ni = norm(input), si = strip(input);
  if (!ni) return { ok: false, best };
  for (const a of options) if (norm(a) === ni) return { ok: true, best };
  if (LANGS[lang]?.cjk) {
    // Answers may be typed in romaji/pinyin instead of characters, with small typos allowed
    const fi = flatReading(input, lang);
    const pairs = cjkReadings(options, lang);
    for (const [, r] of pairs) if (flatReading(r, lang) === fi) return { ok: true, best };
    for (const a of options) if (HAS_CJK.test(a) && norm(a).replace(/\s/g, '') === ni.replace(/\s/g, '')) return { ok: true, best };
    for (const [shown, r] of pairs) {
      const fr = flatReading(r, lang);
      const allowed = fr.length >= 15 ? 3 : fr.length >= 8 ? 2 : fr.length >= 4 ? 1 : 0;
      if (allowed && osa(fi, fr) <= allowed) return { ok: true, best: `${shown} (${r})`, note: 'typo' };
    }
  }
  for (const a of options) if (strip(a) === si) return { ok: true, best: a, note: 'accents' };
  for (const a of options) {
    const sa = strip(a);
    const allowed = sa.length >= 14 ? 2 : sa.length >= 5 ? 1 : 0;
    if (allowed && lev(si, sa) <= allowed) return { ok: true, best: a, note: 'typo' };
  }
  return { ok: false, best }; // Chinese/Japanese: shown without word gaps, with the reading
}

// Ähnlichkeit für Spracherkennung (0..1)
export function similarity(heard, answerStr) {
  let best = 0;
  for (const a of alts(answerStr)) {
    const x = strip(heard), y = strip(a);
    best = Math.max(best, 1 - lev(x, y) / Math.max(x.length, y.length, 1));
  }
  return best;
}

export const tokens = (sentence) => sentence.split(/\s+/).map((t) => t.replace(/[¿¡?!.,;:"„“”？！。，、；：]/g, '')).filter(Boolean);

// ---------- Schwierigkeit ----------
// 0 (ganz leicht) … 10 (sehr schwer). Steigt mit Einheit, Lektion, Level und Trefferquote.
export function difficulty(p, unit = 0, lesson = 0) {
  return clamp(Math.round(unit * 0.7 + lesson * 0.6 + (p.level - 1) / 4 + skillBonus(p)), 0, 10);
}

// Aufgabentypen: minimale Schwierigkeit & ob Wort/Satz
const TYPES = {
  pickImage:   { min: 0, kind: 'word', max: 6 },
  toTarget:    { min: 0, kind: 'word' },
  toNative:    { min: 0, kind: 'word' },
  listenPick:  { min: 1, kind: 'word', tts: true },
  typeTarget:  { min: 3, kind: 'word', minS: 1 },
  listenType:  { min: 5, kind: 'any', tts: true, minS: 2 },
  buildTarget: { min: 0, kind: 'sentence' },
  buildNative: { min: 0, kind: 'sentence' },
  listenBuild: { min: 3, kind: 'sentence', tts: true },
  typeSentence:{ min: 6, kind: 'sentence', minS: 2 },
  speak:       { min: 2, kind: 'any', speak: true },
};

function allowedTypes(p, item, d, only) {
  const s = itemState(p, item.key).s;
  const out = [];
  for (const [t, cfg] of Object.entries(TYPES)) {
    if (only && !only.includes(t)) continue;
    if (cfg.kind !== 'any' && cfg.kind !== item.kind) continue;
    if (!only && (d < cfg.min || (cfg.max !== undefined && d > cfg.max && s > 1))) continue;
    if (!only && cfg.minS && s < cfg.minS) continue;
    if (t === 'pickImage' && item.np) continue;
    if (cfg.tts && (!ttsSupported() || !p.settings.tts || !p.settings.listenEx)) continue;
    if (cfg.speak && (!recognitionSupported() || !p.settings.speakEx || speakPausedUntil > Date.now())) continue;
    if (t === 'speak' && item.kind === 'word' && d < 4) continue;
    out.push(t);
  }
  return out;
}

export let speakPausedUntil = 0;
export const pauseSpeaking = (min = 15) => { speakPausedUntil = Date.now() + min * 60000; };

// Höchstens so viele Aufgaben dieses Typs pro Lektion
const CAPS = { speak: 2, listenType: 3, typeSentence: 3, pickImage: 5 };

function chooseType(p, item, d, only, ctx = { seen: new Set(), counts: {} }) {
  const s = itemState(p, item.key).s;
  const firstTime = s === 0 && !ctx.seen.has(item.key);
  ctx.seen.add(item.key);
  let types = allowedTypes(p, item, d, only);
  if (!only) types = types.filter((t) => (ctx.counts[t] || 0) < (CAPS[t] ?? 99) || (t === 'pickImage' && firstTime));
  const use = (t) => { ctx.counts[t] = (ctx.counts[t] || 0) + 1; return t; };
  if (!types.length) return use(item.kind === 'word' ? 'toTarget' : 'buildTarget');
  // Neues Wort: zuerst mit Bild vorstellen, danach andere Aufgabentypen
  if (!only && item.kind === 'word' && types.includes('pickImage')) {
    if (firstTime) return use('pickImage');
    if (types.length > 1) types = types.filter((t) => t !== 'pickImage');
  }
  // Neuer Satz: zuerst mit Wortbausteinen kennenlernen
  if (!only && item.kind === 'sentence' && firstTime) return use(Math.random() < 0.6 ? 'buildTarget' : 'buildNative');
  return use(weightedType(types, d, s));
}

function weightedType(types, d, s) {
  // schwerere Typen werden mit steigender Schwierigkeit wahrscheinlicher
  const weights = types.map((t) => 1 + (TYPES[t].min / 10) * d * 0.6 + (s >= 3 ? TYPES[t].min / 4 : 0));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < types.length; i++) { r -= weights[i]; if (r <= 0) return types[i]; }
  return types[types.length - 1];
}

// Pool aller Wörter/Sätze aus freigeschalteten Einheiten (für Ablenker)
// 18+ units are only used inside their own lessons, never in normal lessons or practice.
function unlockedItems(p, withAdult = false) {
  const out = [];
  UNITS.forEach((u, ui) => { if ((withAdult || !u.adult) && isUnitUnlocked(p, ui)) out.push(...itemsOfUnit(ui)); });
  return out;
}

function optionCount(d) { return d < 2 ? 3 : d < 6 ? 4 : 5; }

// Zwei Items "kollidieren", wenn sie in irgendeiner Sprache eine gleiche Übersetzung haben
// (z. B. Arzt/Ärztin → "doctor"). Solche Paare dürfen nie gemeinsam als Optionen erscheinen.
const FIELDS = Object.keys(LANGS);
export function conflicts(a, b) {
  if (a.key === b.key) return true;
  return FIELDS.some((f) => {
    const A = alts(a[f]).map(norm), B = new Set(alts(b[f]).map(norm));
    return A.some((x) => x && B.has(x));
  });
}

function distractors(item, pool, n, field) {
  const ok = (x) => x.kind === item.kind && !conflicts(x, item);
  const same = pool.filter((x) => ok(x) && x.unit === item.unit);
  const other = pool.filter((x) => ok(x) && x.unit !== item.unit);
  const res = []; const seen = new Set([main(item[field]).toLowerCase()]);
  for (const x of [...shuffle(same), ...shuffle(other)]) {
    const v = main(x[field]).toLowerCase();
    if (seen.has(v)) continue;
    seen.add(v); res.push(x);
    if (res.length >= n) break;
  }
  return res;
}

function tileDistractors(answerTokens, pool, field, n) {
  const have = new Set(answerTokens.map((t) => t.toLowerCase()));
  const cands = shuffle(pool.filter((x) => x.kind === 'sentence').flatMap((x) => tokens(main(x[field]))));
  const res = [];
  for (const t of cands) {
    if (have.has(t.toLowerCase())) continue;
    have.add(t.toLowerCase()); res.push(t);
    if (res.length >= n) break;
  }
  return res;
}

// Baut eine einzelne Aufgabe
export function makeExercise(p, lang, item, type, d, pool) {
  const nat = p.native || 'de'; // learner's own language = source language
  const ex = { type, item, lang, nat, key: item.key, kind: item.kind };
  const n = optionCount(d);
  switch (type) {
    case 'pickImage': {
      const ds = distractors(item, pool.filter((x) => !x.np), Math.min(3, n - 1) + (d >= 2 ? 1 : 0), lang);
      ex.options = shuffle([item, ...ds].slice(0, 4));
      break;
    }
    case 'toTarget': case 'listenPick':
      ex.options = shuffle([item, ...distractors(item, pool, n - 1, lang)]);
      break;
    case 'toNative':
      ex.options = shuffle([item, ...distractors(item, pool, n - 1, nat)]);
      break;
    case 'buildTarget': case 'listenBuild': {
      const ans = tokens(main(item[lang]));
      ex.tiles = shuffle([...ans, ...tileDistractors(ans, pool, lang, clamp(2 + Math.floor(d / 2), 2, 6))]);
      break;
    }
    case 'buildNative': {
      const ans = tokens(main(item[nat]));
      ex.tiles = shuffle([...ans, ...tileDistractors(ans, pool, nat, clamp(2 + Math.floor(d / 2), 2, 6))]);
      break;
    }
    default: break;
  }
  return ex;
}

function matchExercise(p, lang, items) {
  const words = [];
  for (const w of shuffle(items.filter((x) => x.kind === 'word'))) {
    if (words.length >= 5) break;
    if (!words.some((o) => conflicts(o, w))) words.push(w);
  }
  return { type: 'match', lang, nat: p.native || 'de', key: null, items: words, left: shuffle(words), right: shuffle(words) };
}

// Gewichtete Auswahl: schwache und lange nicht gesehene Items zuerst
function weakFirst(p, items) {
  return [...items].sort((a, b) => {
    const A = itemState(p, a.key), B = itemState(p, b.key);
    return (A.s - B.s) * 3 + (A.t - B.t) / 8.64e7 + (Math.random() - 0.5) * 2;
  });
}

/**
 * opts.mode: 'lesson' | 'practice' | 'listen' | 'speak' | 'turbo'
 */
export function buildSession(p, lang, opts) {
  const { mode, unit = 0, lesson = 0 } = opts;
  const pool = unlockedItems(p, mode === 'lesson' && !!UNITS[unit]?.adult);
  const exam = mode === 'lesson' && lesson === LESSONS_PER_UNIT - 1;
  let d, focus, extra = [], count, only = null;

  if (mode === 'lesson') {
    // 18+ units sit at the end of the list but are not harder: rank them among themselves
    const rank = UNITS[unit].adult ? UNITS.filter((u) => u.adult).indexOf(UNITS[unit]) : unit;
    d = difficulty(p, rank, lesson) + (exam ? 1 : 0);
    const items = itemsOfUnit(unit);
    const words = items.filter((x) => x.kind === 'word');
    const sents = items.filter((x) => x.kind === 'sentence');
    if (lesson === 0) focus = words.slice(0, 4);
    else if (lesson === 1) focus = [...words.slice(4), ...shuffle(words.slice(0, 4)).slice(0, 2)];
    else if (lesson === 2) focus = [...words, ...sents.slice(0, 2)];
    else focus = [...shuffle(words).slice(0, 5), ...sents];
    // Wiederholung aus früheren Einheiten
    const prev = pool.filter((x) => x.unit < unit);
    extra = weakFirst(p, prev).slice(0, exam ? 4 : lesson >= 2 ? 2 : 1);
    count = clamp(9 + Math.floor(d / 3) + (exam ? 4 : 0), 9, 16);
  } else {
    d = clamp(difficulty(p, Math.max(0, highestUnit(p)), 2), 0, 10);
    const seen = pool.filter((x) => itemState(p, x.key).n > 0);
    const base = seen.length >= 6 ? seen : pool.slice(0, 12);
    if (mode === 'listen') only = ['listenPick', 'listenType', 'listenBuild'];
    if (mode === 'speak') only = ['speak'];
    if (mode === 'turbo') only = ['toTarget', 'toNative', 'pickImage', 'listenPick'];
    let cand = base;
    if (only) cand = base.filter((x) => allowedTypes(p, x, 10, only).length);
    focus = weakFirst(p, cand).slice(0, 12);
    count = mode === 'turbo' ? 200 : 12;
  }

  const list = [];
  const ctx = { seen: new Set(), counts: {} };
  const seq = [...focus, ...extra];
  if (!seq.length) return null;
  // Erst jedes Fokus-Item einmal, dann auffüllen (schwache bevorzugt)
  let order = mode === 'lesson' ? [...focus.filter((x) => itemState(p, x.key).s === 0), ...shuffle(focus.filter((x) => itemState(p, x.key).s > 0)), ...extra] : seq;
  while (list.length < count) {
    for (const it of order) {
      if (list.length >= count) break;
      const type = chooseType(p, it, d, only, ctx);
      list.push(makeExercise(p, lang, it, type, d, pool));
    }
    order = mode === 'turbo' ? shuffle(seq) : weakFirst(p, seq);
  }
  // Paare-Zuordnen-Aufgabe einstreuen
  if (mode === 'lesson' || mode === 'practice') {
    const wordsAvail = [...focus, ...extra].filter((x) => x.kind === 'word');
    if (wordsAvail.length >= 4) list.splice(Math.floor(list.length / 2), 0, matchExercise(p, lang, wordsAvail));
    if (exam && wordsAvail.length >= 4) list.push(matchExercise(p, lang, wordsAvail));
  }
  // nicht zweimal dieselbe Aufgabe direkt hintereinander
  for (let i = 1; i < list.length; i++) if (list[i].key && list[i].key === list[i - 1].key && i + 1 < list.length) [list[i], list[i + 1]] = [list[i + 1], list[i]];

  return {
    mode, unit, lesson, exam, lang, d,
    queue: list, total: mode === 'turbo' ? 0 : list.length,
    done: 0, correct: 0, wrong: 0, combo: 0, bestCombo: 0, xp: 0,
    startedAt: Date.now(),
    timeLimit: mode === 'turbo' ? 60 : 0,
    perQuestion: exam ? Math.max(12, 26 - d) : 0,
    pool,
  };
}

export function highestUnit(p) {
  let h = 0;
  UNITS.forEach((u, i) => { if (!u.adult && isUnitUnlocked(p, i)) h = i; });
  return h;
}


export { pick, unitProgress };
