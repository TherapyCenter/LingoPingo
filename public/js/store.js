// Profile, Fortschritt & Spielmechanik (XP, Level, Streak, Herzen, Perlen, Erfolge).
import { UNITS, LESSONS_PER_UNIT } from './course.js';

export const MAX_HEARTS = 5;
export const HEART_REFILL_MIN = 30;   // 1 Herz alle 30 Minuten
export const HEART_REFILL_COST = 50;  // Perlen für volle Herzen

const LS_KEY = 'lingopingo.profiles';
const LS_CURRENT = 'lingopingo.current';

export const today = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD
export function weekId(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${Math.ceil(((t - y) / 86400000 + 1) / 7)}`;
}

// Level-Kurve: jedes Level braucht 60 XP mehr als das vorige
export const xpForLevel = (lvl) => 30 * (lvl - 1) * lvl; // Gesamt-XP um Level lvl zu erreichen
export function levelFromXp(xp) {
  let l = 1;
  while (xp >= xpForLevel(l + 1)) l++;
  return l;
}

export const LEAGUES = [
  { name: 'Bronze', icon: '🥉', min: 0 },
  { name: 'Silber', icon: '🥈', min: 300 },
  { name: 'Gold', icon: '🥇', min: 900 },
  { name: 'Saphir', icon: '💠', min: 2000 },
  { name: 'Rubin', icon: '♦️', min: 4000 },
  { name: 'Diamant', icon: '💎', min: 8000 },
];
export const leagueOf = (xp) => [...LEAGUES].reverse().find((l) => xp >= l.min);

export const ACHIEVEMENTS = [
  { id: 'first', icon: '🐣', name: 'Erster Schritt', desc: 'Schließe deine erste Lektion ab', test: (p) => p.stats.lessons >= 1 },
  { id: 'perfect', icon: '💯', name: 'Fehlerfrei', desc: 'Eine Lektion ohne Fehler', test: (p) => p.stats.perfect >= 1 },
  { id: 'perfect10', icon: '🎯', name: 'Scharfschütze', desc: '10 fehlerfreie Lektionen', test: (p) => p.stats.perfect >= 10 },
  { id: 'combo10', icon: '🔥', name: 'Combo-König', desc: '10 richtige Antworten am Stück', test: (p) => p.stats.bestCombo >= 10 },
  { id: 'combo25', icon: '⚡', name: 'Unaufhaltsam', desc: '25er-Combo', test: (p) => p.stats.bestCombo >= 25 },
  { id: 'streak3', icon: '📆', name: 'Dranbleiber', desc: '3 Tage Streak', test: (p) => p.bestStreak >= 3 },
  { id: 'streak7', icon: '🗓️', name: 'Wochenheld', desc: '7 Tage Streak', test: (p) => p.bestStreak >= 7 },
  { id: 'streak30', icon: '🏆', name: 'Monatsmeister', desc: '30 Tage Streak', test: (p) => p.bestStreak >= 30 },
  { id: 'xp500', icon: '⭐', name: 'Sammler', desc: '500 XP gesammelt', test: (p) => p.xp >= 500 },
  { id: 'xp2000', icon: '🌟', name: 'Superstar', desc: '2000 XP gesammelt', test: (p) => p.xp >= 2000 },
  { id: 'speaker', icon: '🎤', name: 'Plaudertasche', desc: '20 Sprechübungen richtig', test: (p) => p.stats.spoken >= 20 },
  { id: 'unit1', icon: '👑', name: 'Gekrönt', desc: 'Bestehe eine Meisterprüfung', test: (p) => p.stats.exams >= 1 },
  { id: 'polyglot', icon: '🌍', name: 'Polyglott', desc: 'Lerne zwei Sprachen', test: (p) => Object.values(p.courses).filter((c) => c.xp > 0).length >= 2 },
  { id: 'turbo', icon: '⏱️', name: 'Turbo', desc: '15 richtige in einer Turbo-Runde', test: (p) => p.stats.bestTurbo >= 15 },
];

export function newProfile(name, avatar) {
  return {
    name, avatar, createdAt: Date.now(),
    xp: 0, level: 1, gems: 50,
    hearts: MAX_HEARTS, heartsAt: Date.now(),
    streak: 0, bestStreak: 0, lastDay: null, freezes: 0,
    dailyGoal: 30, history: {}, weekId: weekId(), weekXp: 0,
    currentCourse: null, courses: {},
    achievements: [],
    stats: { lessons: 0, perfect: 0, bestCombo: 0, correct: 0, wrong: 0, spoken: 0, exams: 0, bestTurbo: 0, seconds: 0 },
    settings: { sound: true, tts: true, speakEx: true, listenEx: true, rate: 0.95 },
  };
}

export function course(p, c = p.currentCourse) {
  if (!p.courses[c]) p.courses[c] = { xp: 0, progress: {}, items: {}, skill: 0, recent: [] };
  return p.courses[c];
}

// ---------- Herzen ----------
export function refreshHearts(p) {
  if (p.hearts >= MAX_HEARTS) { p.heartsAt = Date.now(); return; }
  const steps = Math.floor((Date.now() - p.heartsAt) / (HEART_REFILL_MIN * 60000));
  if (steps > 0) {
    p.hearts = Math.min(MAX_HEARTS, p.hearts + steps);
    p.heartsAt += steps * HEART_REFILL_MIN * 60000;
  }
}
export function nextHeartIn(p) {
  if (p.hearts >= MAX_HEARTS) return 0;
  return Math.max(0, p.heartsAt + HEART_REFILL_MIN * 60000 - Date.now());
}

// ---------- Streak ----------
export function checkStreak(p) {
  if (!p.lastDay) return;
  const diff = Math.round((new Date(today()) - new Date(p.lastDay)) / 86400000);
  if (diff > 1) {
    // Streak-Schutz verbrauchen, falls vorhanden
    if (diff === 2 && p.freezes > 0) { p.freezes--; p.lastDay = new Date(Date.now() - 86400000).toLocaleDateString('sv'); }
    else p.streak = 0;
  }
}

// ---------- Fortschritt ----------
export const unitProgress = (p, ui) => course(p).progress[UNITS[ui].id] || 0;
export function isUnitUnlocked(p, ui) { return ui === 0 || unitProgress(p, ui - 1) >= LESSONS_PER_UNIT; }

// Lernstärke eines Items (0..5) – wird für Wiederholungen & Schwierigkeit genutzt
export function itemState(p, key) { return course(p).items[key] || { s: 0, n: 0, w: 0, t: 0 }; }
export function recordItem(p, key, ok) {
  const c = course(p);
  const it = c.items[key] || { s: 0, n: 0, w: 0, t: 0 };
  it.n++;
  if (ok) it.s = Math.min(5, it.s + 1); else { it.s = Math.max(0, it.s - 2); it.w++; }
  it.t = Date.now();
  c.items[key] = it;
  // gleitende Trefferquote für adaptive Schwierigkeit
  c.recent = [...(c.recent || []), ok ? 1 : 0].slice(-40);
}

// Adaptiver Bonus: wer sehr sicher ist, bekommt schwerere Aufgaben
export function skillBonus(p) {
  const r = course(p).recent || [];
  if (r.length < 10) return 0;
  const acc = r.reduce((a, b) => a + b, 0) / r.length;
  if (acc > 0.92) return 2;
  if (acc > 0.82) return 1;
  if (acc < 0.55) return -2;
  if (acc < 0.7) return -1;
  return 0;
}

// ---------- XP vergeben ----------
export function addXp(p, amount) {
  const before = p.level;
  if (p.weekId !== weekId()) { p.weekId = weekId(); p.weekXp = 0; }
  p.xp += amount; p.weekXp += amount;
  course(p).xp += amount;
  const d = today();
  const prevToday = p.history[d] || 0;
  p.history[d] = prevToday + amount;
  // Streak zählt, sobald heute XP gesammelt wurden
  let streakUp = false;
  if (p.lastDay !== d) {
    checkStreak(p);
    p.streak += 1; p.lastDay = d; streakUp = true;
    p.bestStreak = Math.max(p.bestStreak, p.streak);
    if (p.streak % 7 === 0) p.freezes = Math.min(2, p.freezes + 1);
  }
  const goalReached = prevToday < p.dailyGoal && p.history[d] >= p.dailyGoal;
  if (goalReached) p.gems += 10;
  p.level = levelFromXp(p.xp);
  return { levelUp: p.level > before, streakUp, goalReached };
}

export function checkAchievements(p) {
  const fresh = ACHIEVEMENTS.filter((a) => !p.achievements.includes(a.id) && a.test(p));
  fresh.forEach((a) => { p.achievements.push(a.id); p.gems += 15; });
  return fresh;
}

// ---------- Persistenz (Server + localStorage als Fallback) ----------
function lsAll() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } }
function lsSave(p) {
  try {
    const all = lsAll(); all[p.name.toLowerCase()] = p;
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch { /* voll/privat */ }
}

export let serverOnline = true;

export async function listProfiles() {
  const local = Object.values(lsAll()).map((p) => ({ name: p.name, avatar: p.avatar, xp: p.xp, level: p.level, streak: p.streak, weekXp: p.weekXp, weekId: p.weekId, updatedAt: p.updatedAt || 0 }));
  try {
    const r = await fetch('/api/profiles');
    if (!r.ok) throw new Error();
    const remote = await r.json();
    serverOnline = true;
    const map = new Map(remote.map((x) => [x.name.toLowerCase(), x]));
    local.forEach((x) => { if (!map.has(x.name.toLowerCase())) map.set(x.name.toLowerCase(), x); });
    return [...map.values()];
  } catch {
    serverOnline = false;
    return local;
  }
}

function migrate(p) {
  const base = newProfile(p.name, p.avatar);
  p.stats = { ...base.stats, ...(p.stats || {}) };
  p.settings = { ...base.settings, ...(p.settings || {}) };
  for (const k of Object.keys(base)) if (p[k] === undefined) p[k] = base[k];
  return p;
}

export async function loadProfile(name) {
  const local = lsAll()[name.toLowerCase()];
  try {
    const r = await fetch('/api/profiles/' + encodeURIComponent(name));
    if (r.ok) {
      const remote = await r.json();
      // Neuere Version gewinnt
      return migrate(local && (local.updatedAt || 0) > (remote.updatedAt || 0) ? local : remote);
    }
  } catch { /* offline */ }
  return local ? migrate(local) : null;
}

let syncTimer = null;
export function save(p, immediate = false) {
  p.updatedAt = Date.now();
  lsSave(p);
  localStorage.setItem(LS_CURRENT, p.name);
  clearTimeout(syncTimer);
  const push = () => fetch('/api/profiles/' + encodeURIComponent(p.name), {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p), keepalive: true,
  }).then(() => { serverOnline = true; }).catch(() => { serverOnline = false; });
  if (immediate) push(); else syncTimer = setTimeout(push, 800);
}

export async function deleteProfile(name) {
  const all = lsAll(); delete all[name.toLowerCase()];
  localStorage.setItem(LS_KEY, JSON.stringify(all));
  if (localStorage.getItem(LS_CURRENT) === name) localStorage.removeItem(LS_CURRENT);
  try { await fetch('/api/profiles/' + encodeURIComponent(name), { method: 'DELETE' }); } catch { /* offline */ }
}

export const lastProfileName = () => localStorage.getItem(LS_CURRENT);
export const forgetCurrent = () => localStorage.removeItem(LS_CURRENT);
