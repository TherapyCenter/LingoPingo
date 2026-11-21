// UI translations. The UI language is the learner's own language (profile.native),
// which is also the source language of the exercises.
import de from './i18n/de.js';
import en from './i18n/en.js';
import es from './i18n/es.js';
import fr from './i18n/fr.js';
import it from './i18n/it.js';
import hr from './i18n/hr.js';
import tr from './i18n/tr.js';
import zh from './i18n/zh.js';
import ja from './i18n/ja.js';

const PACKS = { de, en, es, fr, it, hr, tr, zh, ja };
export const UI_LANGS = Object.keys(PACKS);
const LOCALES = { de: 'de-DE', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', hr: 'hr-HR', tr: 'tr-TR', zh: 'zh-CN', ja: 'ja-JP' };
// languages whose language names are written in lower case inside a sentence
const LOWER_IN_SENTENCE = new Set(['es', 'fr', 'it', 'hr']);
const LS_UI = 'lingopingo.ui';

let cur = 'de';
const pack = () => PACKS[cur];

export const uiLang = () => cur;
export const locale = () => LOCALES[cur] || cur;

export function setUiLang(l) {
  cur = PACKS[l] ? l : 'de';
  if (typeof document !== 'undefined') document.documentElement.lang = cur;
  try { localStorage.setItem(LS_UI, cur); } catch { /* ignore */ }
  return cur;
}

// Last used UI language, otherwise the device language, otherwise German
export function initialUiLang() {
  let l = null;
  try { l = localStorage.getItem(LS_UI); } catch { /* ignore */ }
  if (!PACKS[l] && typeof navigator !== 'undefined') l = (navigator.language || '').slice(0, 2).toLowerCase();
  return PACKS[l] ? l : 'de';
}

export function t(key, vars = {}) {
  const s = pack().s[key] ?? PACKS.en.s[key] ?? PACKS.de.s[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
}

export const langName = (k) => pack().langs[k] || PACKS.en.langs[k] || k;
// language name for use inside a sentence ("¿Cómo se dice en alemán?")
export const langInText = (k) => (LOWER_IN_SENTENCE.has(cur) ? langName(k).toLocaleLowerCase(locale()) : langName(k));
export const leagueName = (i) => pack().leagues[i] || PACKS.de.leagues[i];
export const achText = (a) => pack().ach[a.id] || PACKS.de.ach[a.id] || [a.id, ''];
export const unitTitle = (u) => pack().units?.[u.id]?.[0] || u.title;
export const unitTip = (u) => pack().units?.[u.id]?.[1] || u.tip;
export const praise = () => { const p = t('praise').split('|'); return p[Math.floor(Math.random() * p.length)]; };
