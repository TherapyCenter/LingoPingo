import { LANGS, UNITS, LESSONS_PER_UNIT, main, itemsOfUnit, flag, disp, reading } from './course.js';
import * as store from './store.js';
import { sfx, speak, listen, setSoundEnabled, setSpeechRate, ttsSupported, recognitionSupported, hasVoice, voiceName, ensureVoices, stopSpeaking, isAndroidApp } from './audio.js';
import { buildSession, makeExercise, checkText, similarity, tokens, shuffle, norm, pauseSpeaking, highestUnit } from './lesson.js';
import { t, langName, langInText, leagueName, achText, unitTitle, unitTip, praise, setUiLang, initialUiLang, uiLang, locale, UI_LANGS } from './i18n.js';
import { mascot } from './mascot.js';
import { confetti } from './fx.js';

const $app = document.getElementById('app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let P = null;          // aktuelles Profil
let tab = 'learn';
let S = null;          // laufende Session
let ctrl = null;       // Controller der aktuellen Aufgabe
let timers = [];

const AVATARS = ['🐧', '🦊', '🐼', '🐸', '🦁', '🐨', '🐯', '🐵', '🦄', '🐙', '🐢', '🦉', '🐰', '🐻', '🐳', '🦖'];
const lang = () => P.currentCourse;            // language being learned
const nat = () => P?.native || 'de';          // learner's own language (UI + source language)
const natText = (item) => disp(item[nat()]);   // source text of an item
const lessonLabel = (li) => (li === LESSONS_PER_UNIT - 1 ? t('exam') : t('lessonN', { n: li + 1 }));
// own-language switcher as <select>
const uiSelect = (id, val) => `<select class="ui-sel" id="${id}" aria-label="Language">${UI_LANGS.map((k) => `<option value="${k}" ${k === val ? 'selected' : ''}>${LANGS[k].native}</option>`).join('')}</select>`;

// ---------- kleine UI-Helfer ----------
export function toast(html, ms = 2600) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

function modal(html, { onClose, cls = '' } = {}) {
  closeModal();
  const m = document.createElement('div');
  m.className = 'modal-wrap';
  m.innerHTML = `<div class="modal ${cls}" role="dialog">${html}</div>`;
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) { closeModal(); onClose && onClose(); } });
  document.body.appendChild(m);
  requestAnimationFrame(() => m.classList.add('show'));
  return m;
}
function closeModal() { $$('.modal-wrap').forEach((m) => m.remove()); }

function clearTimers() { timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); timers = []; }

function applySettings() {
  setSoundEnabled(P.settings.sound);
  setSpeechRate(P.settings.rate);
}
const say = (text, opts) => { if (P?.settings.tts) return speak(text, lang(), opts); return Promise.resolve(); };

// ========== Profil-Auswahl ==========
async function renderProfiles() {
  clearTimers();
  $app.innerHTML = `<div class="screen center welcome">
    <div class="ui-lang">🌍 ${uiSelect('uisel', uiLang())}</div>
    <div class="bounce-in">${mascot('cheer', 140)}</div>
    <h1 class="logo">Lingo<span>Pingo</span></h1>
    <p class="sub">${t('tagline')}</p>
    <div class="card profiles-card"><h3>${t('whoLearns')}</h3><div class="profile-list"><div class="loader"></div></div>
      <button class="btn primary wide" data-act="new-profile">${t('newProfile')}</button></div>
  </div>`;
  $('#uisel').onchange = (e) => { setUiLang(e.target.value); renderProfiles(); };
  const list = (await store.listProfiles()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  $('.profile-list').innerHTML = list.length ? list.map((p) => `
    <button class="profile-chip" data-name="${esc(p.name)}"><span class="av">${esc(p.avatar || '🐧')}</span>
    <span class="pn">${esc(p.name)}</span><span class="pl">Lv ${p.level || 1} · 🔥${p.streak || 0}</span></button>`).join('')
    : `<p class="muted">${t('noProfiles')}</p>`;
  $$('.profile-chip').forEach((b) => b.onclick = () => login(b.dataset.name));
  if (!store.serverOnline) toast(t('serverOffline'));
}

function newProfileDialog(state = {}) {
  let av = state.av || AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const m = modal(`<h2>${t('newProfileTitle')}</h2>
    <input class="input" id="pname" maxlength="24" placeholder="${esc(t('yourName'))}" autocomplete="off" value="${esc(state.name || '')}">
    <p class="muted">${t('yourLanguage')}</p>
    <div class="lang-pick">${UI_LANGS.map((k) => `<button class="lp-btn ${k === uiLang() ? 'sel' : ''}" data-ui="${k}">${flag(k, 26)}<small>${LANGS[k].native}</small></button>`).join('')}</div>
    <p class="muted">${t('chooseAvatar')}</p>
    <div class="avatar-grid">${AVATARS.map((a) => `<button class="av-btn ${a === av ? 'sel' : ''}" data-av="${a}">${a}</button>`).join('')}</div>
    <button class="btn primary wide" id="pcreate">${t('letsGo')}</button>`);
  const inp = $('#pname', m); inp.focus();
  // switching the own language re-renders the dialog in that language
  $$('[data-ui]', m).forEach((b) => b.onclick = () => { sfx.tap(); setUiLang(b.dataset.ui); renderProfiles(); newProfileDialog({ name: inp.value, av }); });
  $$('.av-btn', m).forEach((b) => b.onclick = () => { av = b.dataset.av; $$('.av-btn', m).forEach((x) => x.classList.toggle('sel', x === b)); sfx.tap(); });
  const create = async () => {
    const name = inp.value.trim();
    if (!/^[\p{L}\p{N} _.-]{1,24}$/u.test(name)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); return; }
    const existing = await store.loadProfile(name);
    if (existing) { toast(t('nameExists')); closeModal(); return login(name); }
    P = store.newProfile(name, av, uiLang());
    store.save(P, true);
    closeModal();
    sfx.fanfare();
    afterLogin();
  };
  $('#pcreate', m).onclick = create;
  inp.onkeydown = (e) => { if (e.key === 'Enter') create(); };
}

async function login(name) {
  sfx.tap();
  const p = await store.loadProfile(name);
  if (!p) { toast(t('profileNotFound')); return renderProfiles(); }
  P = p;
  afterLogin();
}

function afterLogin() {
  setUiLang(nat());
  if (P.currentCourse === nat()) P.currentCourse = null;
  applySettings();
  store.refreshHearts(P);
  store.checkStreak(P);
  store.save(P);
  if (!P.currentCourse) renderCourseSelect(true); else { tab = 'learn'; renderHome(); }
}

// ========== Kurs-Auswahl ==========
function renderCourseSelect(first = false) {
  clearTimers();
  $app.innerHTML = `<div class="screen center">
    ${first ? `<div class="bubble-row">${mascot('happy', 90)}<div class="bubble">${t('helloWhich', { name: esc(P.name) })}</div></div>` : `<h2>${t('chooseLanguage')}</h2>`}
    <div class="course-grid">${Object.entries(LANGS).filter(([k]) => k !== nat()).map(([k, l]) => {
      const c = P.courses[k];
      return `<button class="course-card ${P.currentCourse === k ? 'sel' : ''}" data-c="${k}">
        <span class="flag">${flag(k, 84)}</span><b>${langName(k)}</b><span class="muted">${l.native}</span>
        ${c && c.xp ? `<span class="pill">${c.xp} XP</span>` : `<span class="pill new">${t('new')}</span>`}</button>`;
    }).join('')}</div>
    ${!first ? `<button class="btn ghost" data-act="home">${t('back')}</button>` : ''}
  </div>`;
  $$('.course-card').forEach((b) => b.onclick = () => {
    P.currentCourse = b.dataset.c; store.course(P); store.save(P);
    sfx.pop(); say(LANGS[lang()].native);
    tab = 'learn'; renderHome();
    if (ttsSupported() && !hasVoice(lang())) setTimeout(() => toast(t('noVoiceCourse', { lang: langName(lang()) }), 6000), 800);
  });
}

// ========== Startseite ==========
function topbar() {
  store.refreshHearts(P);
  return `<header class="topbar">
    <button class="chip" data-act="courses" title="${esc(t('switchLanguage'))}">${flag(lang(), 30)}</button>
    <button class="chip streak ${P.lastDay === store.today() ? 'lit' : ''}" data-act="streak">🔥 <b>${P.streak}</b></button>
    <button class="chip gems" data-act="shop">💎 <b>${P.gems}</b></button>
    <button class="chip hearts" data-act="hearts">❤️ <b>${P.hearts}</b></button>
  </header>`;
}
function bottomNav() {
  const items = [['learn', '🏠', t('tabLearn')], ['practice', '🏋️', t('tabPractice')], ['ranks', '🏆', t('tabRanks')], ['profile', P.avatar, t('tabProfile')]];
  return `<nav class="bottomnav">${items.map(([k, i, t]) => `<button class="${tab === k ? 'active' : ''}" data-tab="${k}"><span>${i}</span><small>${t}</small></button>`).join('')}</nav>`;
}

function renderHome() {
  clearTimers();
  S = null;
  const body = { learn: learnTab, practice: practiceTab, ranks: ranksTab, profile: profileTab }[tab]();
  $app.innerHTML = `<div class="home">${topbar()}<main class="content" id="content">${body}</main>${bottomNav()}</div>`;
  $$('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; sfx.tap(); renderHome(); window.scrollTo(0, 0); });
  if (tab === 'learn') bindLearn();
  if (tab === 'practice') bindPractice();
  if (tab === 'ranks') loadRanks();
  if (tab === 'profile') bindProfile();
}

function dailyGoalCard() {
  const xpToday = P.history[store.today()] || 0;
  const pct = Math.min(100, Math.round((xpToday / P.dailyGoal) * 100));
  return `<div class="card goal-card">
    <div class="ring" style="--p:${pct}"><span>${pct >= 100 ? '✅' : '🎯'}</span></div>
    <div class="goal-txt"><b>${t('dailyGoal')}</b><div class="muted">${xpToday} / ${P.dailyGoal} XP</div>
      <div class="bar small"><div class="fill" style="width:${pct}%"></div></div></div>
    <div class="lv-badge" title="Level">Lv<br><b>${P.level}</b></div>
  </div>`;
}

function learnTab() {
  let current = null;
  const units = UNITS.map((u, ui) => {
    const prog = store.unitProgress(P, ui);
    const unlocked = store.isUnitUnlocked(P, ui);
    const nodes = Array.from({ length: LESSONS_PER_UNIT }, (_, li) => {
      const exam = li === LESSONS_PER_UNIT - 1;
      const state = !unlocked ? 'locked' : li < prog ? 'done' : li === prog ? 'current' : 'locked';
      if (state === 'current' && !current) current = `${ui}-${li}`;
      const off = Math.round(Math.sin((li + ui * 2) * 1.1) * 70);
      const icon = exam ? '👑' : state === 'done' ? '✓' : state === 'locked' ? '🔒' : '★';
      return `<div class="node-row" style="--off:${off}px">
        ${state === 'current' ? `<div class="start-tip">START</div>` : ''}
        <button class="node ${state} ${exam ? 'exam' : ''}" data-u="${ui}" data-l="${li}" style="--c:${u.color}">${icon}</button>
        ${state === 'current' && li % 2 === 0 ? `<div class="node-mascot" style="--side:${off > 0 ? -1 : 1}">${mascot('happy', 70)}</div>` : ''}
      </div>`;
    }).join('');
    const done = prog >= LESSONS_PER_UNIT;
    return `<section class="unit ${unlocked ? '' : 'locked'}" id="unit-${ui}">
      <div class="unit-head" style="--c:${u.color}">
        <div><small>${t('unitN', { n: ui + 1 })}${done ? ' · ' + t('mastered') : ''}</small><h3>${u.icon} ${esc(unitTitle(u))}</h3></div>
        <button class="guide-btn" data-guide="${ui}" title="${esc(t('guide'))}">📖</button>
      </div>
      <div class="path">${nodes}</div>
    </section>`;
  }).join('');
  return `${dailyGoalCard()}${units}<div class="path-end">${mascot('sleep', 80)}<p class="muted">${t('moreUnitsSoon')}</p></div>`;
}

function bindLearn() {
  $$('.node').forEach((n) => n.onclick = () => nodeClick(+n.dataset.u, +n.dataset.l, n));
  $$('[data-guide]').forEach((b) => b.onclick = () => guidebook(+b.dataset.guide));
  const cur = $('.node.current');
  if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120);
}

function nodeClick(ui, li, el) {
  sfx.tap();
  const prog = store.unitProgress(P, ui);
  const unlocked = store.isUnitUnlocked(P, ui);
  if (!unlocked || li > prog) {
    el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500);
    return toast(li === LESSONS_PER_UNIT - 1 ? t('lockedExam') : t('lockedLesson'));
  }
  const exam = li === LESSONS_PER_UNIT - 1;
  const replay = li < prog;
  const u = UNITS[ui];
  modal(`<div class="lesson-pop" style="--c:${u.color}">
      <div class="pop-icon">${exam ? '👑' : u.icon}</div>
      <h2>${lessonLabel(li)}</h2>
      <p>${esc(unitTitle(u))} · ${exam ? t('examInfo') : replay ? t('replayInfo') : t('nOfM', { n: li + 1, m: LESSONS_PER_UNIT })}</p>
      <button class="btn primary wide" id="go">${replay ? t('replay') : t('start')} ${exam ? '(XP ×2)' : ''}</button>
    </div>`);
  $('#go').onclick = () => { closeModal(); startSession({ mode: 'lesson', unit: ui, lesson: li }); };
}

function guidebook(ui) {
  const u = UNITS[ui];
  const items = itemsOfUnit(ui);
  modal(`<h2>${u.icon} ${esc(unitTitle(u))}</h2>
    <div class="tip-box">${mascot('think', 56)}<p>${esc(unitTip(u))}</p></div>
    <div class="vocab">${items.map((it) => `<button class="vocab-row" data-say="${esc(main(it[lang()]))}">
      <span class="ve">${it.kind === 'word' ? it.e : '💬'}</span><span class="vt"><b>${tgt(it[lang()], lang())}</b><small>${esc(natText(it))}</small></span><span class="vs">🔊</span></button>`).join('')}</div>
    <button class="btn wide" data-close>${t('close')}</button>`, { cls: 'tall' });
  $$('.vocab-row').forEach((b) => b.onclick = () => speak(b.dataset.say, lang()));
}

// ---------- Üben ----------
function practiceTab() {
  const canSpeak = recognitionSupported();
  const seenWords = UNITS.flatMap((_, ui) => itemsOfUnit(ui)).filter((it) => store.itemState(P, it.key).n > 0);
  const strong = seenWords.filter((it) => store.itemState(P, it.key).s >= 4).length;
  return `<h2 class="tab-title">${t('tabPractice')}</h2>
    <div class="practice-grid">
      <button class="pcard" data-mode="practice" style="--c:#ff9600"><span>💪</span><b>${t('practiceWeak')}</b><small>+1 ❤️ & XP</small></button>
      <button class="pcard" data-mode="listen" style="--c:#1cb0f6" ${ttsSupported() ? '' : 'disabled'}><span>🎧</span><b>${t('listenTraining')}</b><small>${t('listenOnly')}</small></button>
      <button class="pcard" data-mode="speak" style="--c:#ce82ff" ${canSpeak ? '' : 'disabled'}><span>🎤</span><b>${t('speakTraining')}</b><small>${canSpeak ? t('speakAfter') : t('needsHttps')}</small></button>
      <button class="pcard" data-mode="turbo" style="--c:#ff4b4b"><span>⏱️</span><b>${t('turbo')}</b><small>${t('turboSub', { n: P.stats.bestTurbo })}</small></button>
    </div>
    <div class="card">
      <h3>${t('vocab')} <span class="muted">· ${t('vocabStats', { n: seenWords.length, m: strong })}</span></h3>
      ${seenWords.length ? `<div class="vocab">${seenWords.sort((a, b) => store.itemState(P, a.key).s - store.itemState(P, b.key).s).map((it) => {
        const s = store.itemState(P, it.key).s;
        return `<button class="vocab-row" data-say="${esc(main(it[lang()]))}"><span class="ve">${it.kind === 'word' ? it.e : '💬'}</span>
        <span class="vt"><b>${tgt(it[lang()], lang())}</b><small>${esc(natText(it))}</small></span>
        <span class="strength s${s}" title="${esc(t('strength', { n: s }))}">${'▮'.repeat(s)}${'▯'.repeat(5 - s)}</span></button>`;
      }).join('')}</div>` : `<p class="muted">${t('noVocab')}</p>`}
    </div>`;
}
function bindPractice() {
  $$('[data-mode]').forEach((b) => b.onclick = () => { sfx.tap(); startSession({ mode: b.dataset.mode }); });
  $$('.vocab-row').forEach((b) => b.onclick = () => speak(b.dataset.say, lang()));
}

// ---------- Rangliste ----------
let rankMode = 'week';
const lgName = (lg) => leagueName(store.LEAGUES.indexOf(lg));
function ranksTab() {
  const lg = store.leagueOf(P.xp);
  return `<div class="league-head">${lg.icon}<div><h2>${t('league', { name: lgName(lg) })}</h2><p class="muted">${nextLeagueText()}</p></div></div>
    <div class="seg"><button data-rm="week" class="${rankMode === 'week' ? 'on' : ''}">${t('thisWeek')}</button><button data-rm="all" class="${rankMode === 'all' ? 'on' : ''}">${t('total')}</button></div>
    <div class="card rank-list"><div class="loader"></div></div>`;
}
function nextLeagueText() {
  const next = store.LEAGUES.find((l) => l.min > P.xp);
  return next ? t('toNextLeague', { n: next.min - P.xp, league: `${next.icon} ${lgName(next)}` }) : t('topLeague');
}
async function loadRanks() {
  $$('[data-rm]').forEach((b) => b.onclick = () => { rankMode = b.dataset.rm; renderHome(); });
  const wk = store.weekId();
  let list = await store.listProfiles();
  list = list.map((x) => ({ ...x, score: rankMode === 'week' ? (x.weekId === wk ? x.weekXp : 0) : x.xp }))
    .sort((a, b) => b.score - a.score);
  const el = $('.rank-list');
  if (!el) return;
  el.innerHTML = list.map((x, i) => `<div class="rank-row ${x.name.toLowerCase() === P.name.toLowerCase() ? 'me' : ''}">
    <span class="rk">${['🥇', '🥈', '🥉'][i] || i + 1}</span><span class="av">${esc(x.avatar || '🐧')}</span>
    <span class="rn">${esc(x.name)}<small>${store.leagueOf(x.xp || 0).icon} Lv ${x.level || 1} · 🔥 ${x.streak || 0}</small></span>
    <b>${x.score} XP</b></div>`).join('') + (list.length < 2 ? `<p class="muted center-txt">${t('invite')}</p>` : '');
}

// ---------- Profil ----------
function profileTab() {
  const lv = P.level, cur = store.xpForLevel(lv), nxt = store.xpForLevel(lv + 1);
  const pct = Math.round(((P.xp - cur) / (nxt - cur)) * 100);
  const acc = P.stats.correct + P.stats.wrong ? Math.round((P.stats.correct / (P.stats.correct + P.stats.wrong)) * 100) : 0;
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.now() - (6 - i) * 86400000); return [d, P.history[d.toLocaleDateString('sv')] || 0]; });
  const maxD = Math.max(P.dailyGoal, ...days.map((d) => d[1]));
  const s = P.settings;
  const toggle = (k, label, dis = false) => `<label class="toggle ${dis ? 'dis' : ''}"><span>${label}</span><input type="checkbox" data-set="${k}" ${s[k] ? 'checked' : ''} ${dis ? 'disabled' : ''}><i></i></label>`;
  return `<div class="profile-head"><div class="big-av">${esc(P.avatar)}</div><div><h2>${esc(P.name)}</h2>
      <p class="muted">${store.leagueOf(P.xp).icon} ${t('league', { name: lgName(store.leagueOf(P.xp)) })} · ${t('since', { date: new Date(P.createdAt).toLocaleDateString(locale()) })}</p></div></div>
    <div class="card"><div class="lvl-row"><b>${t('level', { n: lv })}</b><span class="muted">${P.xp - cur} / ${nxt - cur} XP</span></div><div class="bar"><div class="fill gold" style="width:${pct}%"></div></div></div>
    <div class="stats-grid">
      <div class="stat"><span>⚡</span><b>${P.xp}</b><small>${t('totalXp')}</small></div>
      <div class="stat"><span>🔥</span><b>${P.streak}</b><small>${t('streakMax', { n: P.bestStreak })}</small></div>
      <div class="stat"><span>📚</span><b>${P.stats.lessons}</b><small>${t('lessons')}</small></div>
      <div class="stat"><span>🎯</span><b>${acc}%</b><small>${t('accuracy')}</small></div>
    </div>
    <div class="card"><h3>${t('last7')}</h3><div class="week-chart">${days.map(([d, v]) => `<div class="wc-col"><div class="wc-bar ${v >= P.dailyGoal ? 'hit' : ''}" style="height:${Math.max(4, (v / maxD) * 100)}%"><em>${v || ''}</em></div><small>${d.toLocaleDateString(locale(), { weekday: 'short' })}</small></div>`).join('')}</div></div>
    <div class="card"><h3>${t('achievements')} <span class="muted">${P.achievements.length}/${store.ACHIEVEMENTS.length}</span></h3><div class="ach-grid">
      ${store.ACHIEVEMENTS.map((a) => { const [an, ad] = achText(a); return `<div class="ach ${P.achievements.includes(a.id) ? 'got' : ''}" title="${esc(ad)}"><span>${a.icon}</span><b>${esc(an)}</b><small>${esc(ad)}</small></div>`; }).join('')}
    </div></div>
    <div class="card settings"><h3>${t('settings')}</h3>
      <label class="range"><span>${t('myLanguage')}</span>${uiSelect('natsel', nat())}</label>
      ${toggle('sound', t('setSound'))}
      ${toggle('tts', t('setTts'), !ttsSupported())}
      ${toggle('listenEx', t('setListen'), !ttsSupported())}
      ${toggle('speakEx', t('setSpeak') + (recognitionSupported() ? '' : ' ' + t('unavailable')), !recognitionSupported())}
      <label class="range"><span>${t('rate')}</span><input type="range" min="0.6" max="1.2" step="0.05" value="${s.rate}" data-rate></label>
      <label class="range"><span>${t('goal')}</span><select data-goal>${[10, 20, 30, 50, 80].map((g, i) => `<option value="${g}" ${P.dailyGoal === g ? 'selected' : ''}>${g} XP (${t('goal' + i)})</option>`).join('')}</select></label>
      ${!recognitionSupported() ? `<p class="muted small">${t('speakNeeds')}</p>` : ''}
    </div>
    ${isAndroidApp || store.serverUrl() ? `<div class="card"><h3>${t('serverTitle')}</h3>
      <p class="muted small">${t('serverInfo')}</p>
      <div class="server-row"><input class="input" id="srv" placeholder="${esc(t('serverPh'))}" value="${esc(store.serverUrl())}" autocapitalize="off" spellcheck="false"><button class="btn small" id="srvsave">${t('save')}</button></div></div>` : ''}
    <div class="card voices"><h3>${t('testVoices')}</h3>
      ${!ttsSupported() ? `<p class="muted">${t('noTts')}</p>` : Object.keys(LANGS).map((k) => {
        const vn = voiceName(k);
        return `<div class="voice-row">${flag(k, 28)}<div><b>${langName(k)}</b><small class="${vn ? 'muted' : 'warn'}">${vn ? esc(vn) : t('noVoice')}</small></div>
          <button class="btn small" data-vtest="${k}">${t('test')}</button></div>`;
      }).join('')}
      <p class="muted small">${t('voiceHelp')}</p>
    </div>
    <div class="btn-col">
      <button class="btn" data-act="courses">${flag(lang(), 26)} ${t('switchLanguage')}</button>
      <button class="btn" data-act="switch">${t('switchProfile')}</button>
      <button class="btn danger-ghost" data-act="delete">${t('deleteProfile')}</button>
    </div>`;
}
function bindProfile() {
  $$('[data-set]').forEach((i) => i.onchange = () => { P.settings[i.dataset.set] = i.checked; applySettings(); store.save(P); sfx.tap(); });
  const r = $('[data-rate]'); if (r) r.onchange = () => { P.settings.rate = +r.value; applySettings(); store.save(P); say(main(UNITS[0].sentences[0][lang()])); };
  $$('[data-vtest]').forEach((b) => b.onclick = () => speak(main(UNITS[0].sentences[0][b.dataset.vtest]), b.dataset.vtest));
  const ns = $('#natsel');
  if (ns) ns.onchange = () => {
    P.native = setUiLang(ns.value);
    if (P.currentCourse === P.native) P.currentCourse = null;
    store.save(P);
    sfx.pop();
    if (!P.currentCourse) renderCourseSelect(true); else renderHome();
  };
  const sv = $('#srvsave');
  if (sv) sv.onclick = async () => {
    const u = store.setServerUrl($('#srv').value);
    $('#srv').value = u;
    if (!u) return toast(t('serverLocal'));
    try {
      const r = await fetch(u + '/api/profiles');
      if (!r.ok) throw new Error();
      store.save(P, true);
      toast(t('serverOk'));
    } catch { toast(t('serverFail'), 5000); }
  };
  const g = $('[data-goal]'); if (g) g.onchange = () => { P.dailyGoal = +g.value; store.save(P); toast('🎯 ✓'); };
}

// ---------- Globale Aktionen ----------
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]');
  if (!a) return;
  const act = a.dataset.act;
  if (act === 'new-profile') newProfileDialog();
  else if (act === 'courses') { sfx.tap(); renderCourseSelect(); }
  else if (act === 'home') renderHome();
  else if (act === 'hearts') heartsDialog();
  else if (act === 'shop') shopDialog();
  else if (act === 'streak') streakDialog();
  else if (act === 'switch') { store.save(P, true); store.forgetCurrent(); P = null; renderProfiles(); }
  else if (act === 'delete') {
    modal(`<h2>${t('deleteQ')}</h2><p>${t('deleteInfo', { name: `<b>${esc(P.name)}</b>` })}</p>
      <div class="btn-row"><button class="btn" data-close>${t('cancel')}</button><button class="btn danger" id="del">${t('del')}</button></div>`);
    $('#del').onclick = async () => { await store.deleteProfile(P.name); P = null; closeModal(); renderProfiles(); };
  }
});

function fmtMs(ms) { const m = Math.ceil(ms / 60000); return m >= 60 ? t('hm', { h: Math.floor(m / 60), m: m % 60 }) : t('m', { m }); }

function heartsDialog(fromLesson = false) {
  store.refreshHearts(P);
  const full = P.hearts >= store.MAX_HEARTS;
  modal(`<div class="center-txt"><div class="hearts-big">${'❤️'.repeat(P.hearts)}${'🤍'.repeat(store.MAX_HEARTS - P.hearts)}</div>
    <h2>${full ? t('heartsFull') : P.hearts ? t('heartsLeft', { n: P.hearts }) : t('heartsNone')}</h2>
    <p class="muted">${full ? t('heartsInfo') : t('nextHeart', { t: fmtMs(store.nextHeartIn(P)) })}</p>
    ${!full ? `<button class="btn primary wide" id="refill" ${P.gems < store.HEART_REFILL_COST ? 'disabled' : ''}>${t('refill', { n: store.HEART_REFILL_COST })}</button>
    <button class="btn wide" id="earn">${t('earnHeart')}</button>` : ''}
    <button class="btn ghost wide" data-close>${fromLesson ? t('back') : t('ok')}</button></div>`);
  const rf = $('#refill');
  if (rf) rf.onclick = () => { P.gems -= store.HEART_REFILL_COST; P.hearts = store.MAX_HEARTS; store.save(P); sfx.levelUp(); closeModal(); renderHome(); toast(t('refilled')); };
  const ea = $('#earn');
  if (ea) ea.onclick = () => { closeModal(); startSession({ mode: 'practice' }); };
}

function shopDialog() {
  modal(`<h2>💎 Shop</h2><p class="muted">${t('shopInfo', { n: `<b>${P.gems}</b>` })}</p>
    <div class="shop-item"><span>❤️</span><div><b>${t('shopHearts')}</b><small>${t('shopHeartsSub', { n: store.MAX_HEARTS })}</small></div><button class="btn small" data-buy="hearts" ${P.gems < store.HEART_REFILL_COST || P.hearts >= store.MAX_HEARTS ? 'disabled' : ''}>💎 ${store.HEART_REFILL_COST}</button></div>
    <div class="shop-item"><span>🧊</span><div><b>${t('shopFreeze')}</b><small>${t('shopFreezeSub', { n: P.freezes })}</small></div><button class="btn small" data-buy="freeze" ${P.gems < 100 || P.freezes >= 2 ? 'disabled' : ''}>💎 100</button></div>
    <div class="shop-item"><span>🎭</span><div><b>${t('shopAvatar')}</b><small>${t('shopAvatarSub')}</small></div><button class="btn small" data-buy="avatar" ${P.gems < 30 ? 'disabled' : ''}>💎 30</button></div>
    <button class="btn ghost wide" data-close>${t('close')}</button>`);
  $$('[data-buy]').forEach((b) => b.onclick = () => {
    const k = b.dataset.buy;
    if (k === 'hearts') { P.gems -= store.HEART_REFILL_COST; P.hearts = store.MAX_HEARTS; }
    if (k === 'freeze') { P.gems -= 100; P.freezes++; }
    if (k === 'avatar') { P.gems -= 30; let a; do { a = AVATARS[Math.floor(Math.random() * AVATARS.length)]; } while (a === P.avatar); P.avatar = a; }
    sfx.levelUp(); store.save(P); closeModal(); renderHome(); toast(t('bought'));
  });
}

function streakDialog() {
  const lit = P.lastDay === store.today();
  modal(`<div class="center-txt"><div class="flame ${lit ? 'lit' : ''}">🔥</div><h2>${P.streak === 1 ? t('streakDay') : t('streakDays', { n: P.streak })}</h2>
    <p class="muted">${lit ? t('streakLit') : t('streakTodo')}</p>
    <p>${t('freezeLine', { n: `<b>${P.freezes}</b>`, m: `<b>${P.bestStreak}</b>` })}</p>
    <p class="muted small">${t('freezeFree')}</p>
    <button class="btn primary wide" data-close>${t('continue')}</button></div>`);
}

// ========== Lektionen ==========
function startSession(opts) {
  store.refreshHearts(P);
  const usesHearts = opts.mode === 'lesson';
  if (usesHearts && P.hearts <= 0) return heartsDialog(true);
  const sess = buildSession(P, lang(), opts);
  if (!sess || !sess.queue.length) return toast(t('nothingToPractice'));
  if (opts.mode === 'speak' && !sess.queue.some((e) => e.type === 'speak')) return toast(t('speakUnavailable'));
  S = sess;
  warnMissingVoice();
  S.usesHearts = usesHearts;
  renderLessonShell();
  if (S.timeLimit) startTurboClock();
  nextExercise();
}

function renderLessonShell() {
  clearTimers();
  $app.innerHTML = `<div class="lesson">
    <div class="lesson-top">
      <button class="x" id="quit" aria-label="${esc(t('quit'))}">✕</button>
      <div class="bar big"><div class="fill" id="prog" style="width:0%"></div></div>
      ${S.usesHearts ? `<div class="lh">❤️ <b id="hearts">${P.hearts}</b></div>` : S.timeLimit ? `<div class="lh">⏱️ <b id="clock">${S.timeLimit}</b></div>` : `<div class="lh">⚡ <b id="xpnow">0</b></div>`}
    </div>
    ${S.perQuestion ? '<div class="qtimer"><div id="qfill"></div></div>' : ''}
    <div id="combo" class="combo"></div>
    <main class="ex" id="ex"></main>
    <footer class="checkbar" id="checkbar">
      <div class="fb" id="fb"></div>
      <div class="cb-btns"><button class="btn ghost" id="skip">${t('skip')}</button><button class="btn primary" id="check" disabled>${t('check')}</button></div>
    </footer>
  </div>`;
  $('#quit').onclick = quitLesson;
  $('#check').onclick = onCheck;
  $('#skip').onclick = () => { if (ctrl && !ctrl.answered) submit({ ok: false, skipped: true }); };
}

function quitLesson() {
  if (S.timeLimit) return finishSession();
  modal(`<div class="center-txt">${mascot('sad', 100)}<h2>${t('quitQ')}</h2><p class="muted">${t('quitInfo')}</p>
    <button class="btn primary wide" data-close>${t('keepLearning')}</button><button class="btn ghost wide" id="really">${t('quit')}</button></div>`);
  $('#really').onclick = () => { closeModal(); stopSpeaking(); store.save(P); renderHome(); };
}

function startTurboClock() {
  const end = Date.now() + S.timeLimit * 1000;
  const tm = setInterval(() => {
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    const c = $('#clock'); if (c) c.textContent = left;
    if (left <= 5 && left > 0) sfx.tick();
    if (left <= 0) { clearInterval(tm); finishSession(); }
  }, 250);
  timers.push(tm);
}

function updateProgress() {
  const pct = S.timeLimit ? Math.min(100, S.correct * 5) : Math.round((S.done / (S.done + S.queue.length)) * 100);
  $('#prog').style.width = pct + '%';
}

function nextExercise() {
  if (!S) return;
  if (!S.queue.length) return finishSession();
  updateProgress();
  const ex = S.queue[0];
  const box = $('#ex');
  box.className = 'ex enter';
  const fb = $('#checkbar'); fb.className = 'checkbar'; $('#fb').innerHTML = '';
  const btn = $('#check'); btn.textContent = t('check'); btn.disabled = true; btn.className = 'btn primary';
  $('#skip').style.visibility = ex.type === 'match' ? 'hidden' : 'visible';
  ctrl = { answered: false, ready: false, check: null };
  RENDER[ex.type](ex, box);
  requestAnimationFrame(() => box.classList.remove('enter'));
  if (S.perQuestion && ex.type !== 'match') startQuestionTimer();
}

function startQuestionTimer() {
  const q = $('#qfill'); if (!q) return;
  const total = S.perQuestion * 1000 * (S.queue[0].kind === 'sentence' ? 1.6 : 1);
  const start = Date.now();
  const tm = setInterval(() => {
    const left = Math.max(0, 1 - (Date.now() - start) / total);
    q.style.width = left * 100 + '%';
    q.classList.toggle('low', left < 0.25);
    if (ctrl.answered) { clearInterval(tm); return; }
    if (left <= 0) { clearInterval(tm); submit({ ok: false, timeout: true }); }
  }, 100);
  timers.push(tm);
}

function setReady(v) { ctrl.ready = v; $('#check').disabled = !v; }

function onCheck() {
  if (!ctrl) return;
  if (ctrl.answered) return advance();
  if (!ctrl.ready || !ctrl.check) return;
  submit(ctrl.check());
}

function correctAnswerText(ex) {
  const it = ex.item;
  if (!it) return '';
  if (['toNative', 'buildNative'].includes(ex.type)) return natText(it);
  return disp(it[ex.lang]);
}

function submit(res) {
  if (ctrl.answered) return;
  ctrl.answered = true;
  const ex = S.queue[0];
  const box = $('#ex');
  box.classList.add('locked');
  const btn = $('#check');
  const bar = $('#checkbar');
  const fb = $('#fb');
  $('#skip').style.visibility = 'hidden';
  if (ex.key) store.recordItem(P, ex.key, res.ok);

  if (res.ok) {
    S.correct++; S.combo++; S.bestCombo = Math.max(S.bestCombo, S.combo);
    P.stats.correct++;
    if (ex.type === 'speak') P.stats.spoken++;
    const base = ex.kind === 'sentence' || ['typeTarget', 'listenType', 'speak'].includes(ex.type) ? 3 : 2;
    const mult = S.combo >= 10 ? 2 : S.combo >= 5 ? 1.5 : 1;
    const gain = Math.round(base * mult);
    S.xp += gain;
    floatXp(gain);
    sfx.correct();
    if ([3, 5, 10, 15, 20, 30, 50].includes(S.combo)) showCombo();
    bar.classList.add('ok');
    const note = res.note === 'accents' ? t('noteAccents') : res.note === 'typo' ? t('noteTypo') : res.note;
    fb.innerHTML = `<div class="fb-title">✅ ${esc(praise())}</div>${note ? `<div class="fb-sub">${esc(note)}: <b>${esc(res.best)}</b></div>` : ''}${res.heard ? `<div class="fb-sub">${esc(t('heard', { t: res.heard }))}</div>` : ''}`;
    if (['pickImage', 'toTarget', 'typeTarget', 'buildTarget', 'typeSentence'].includes(ex.type)) say(main(ex.item[ex.lang]));
  } else {
    S.wrong++; S.combo = 0;
    if (!res.skipped) P.stats.wrong++;
    sfx.wrong();
    if (navigator.vibrate) navigator.vibrate(120);
    bar.classList.add('bad');
    const answer = res.best || correctAnswerText(ex);
    const isTarget = ex.item && !['toNative', 'buildNative'].includes(ex.type);
    const ansHtml = isTarget && answer === disp(ex.item[ex.lang]) ? tgt(ex.item[ex.lang], ex.lang) : esc(answer);
    fb.innerHTML = `<div class="fb-title">${res.timeout ? t('timeUp') : res.skipped ? t('skipped') : t('wrong')}</div>
      <div class="fb-sub">${t('correctAnswer')} <b>${ansHtml}</b> <button class="mini-say" id="fbsay">🔊</button></div>${res.heard ? `<div class="fb-sub">${esc(t('heard', { t: res.heard }))}</div>` : ''}`;
    const fs = $('#fbsay'); if (fs) fs.onclick = () => speak(main(ex.item[ex.lang]), lang());
    if (S.usesHearts && !res.skipped) {
      P.hearts = Math.max(0, P.hearts - 1);
      if (P.hearts < store.MAX_HEARTS && P.hearts === store.MAX_HEARTS - 1) P.heartsAt = Date.now();
      const h = $('#hearts'); if (h) { h.textContent = P.hearts; h.parentElement.classList.add('pulse'); }
    }
    box.classList.add('shake');
    // Aufgabe später noch einmal (neu gemischt) – außer im Turbo-Modus
    if (!S.timeLimit && ex.item) S.queue.push(makeExercise(P, ex.lang, ex.item, ex.type === 'speak' ? 'buildTarget' : ex.type, S.d, S.pool));
  }
  const x = $('#xpnow'); if (x) x.textContent = S.xp;
  btn.disabled = false;
  btn.textContent = t('continue');
  btn.className = 'btn ' + (res.ok ? 'primary' : 'danger');
  store.save(P);
  if (S.timeLimit) { const tm = setTimeout(advance, res.ok ? 450 : 1400); timers.push(tm); }
  else btn.focus({ preventScroll: true });
}

function advance() {
  if (!S || !ctrl?.answered) return;
  const wasOk = $('#checkbar').classList.contains('ok');
  S.queue.shift();
  if (wasOk) S.done++;
  if (S.usesHearts && P.hearts <= 0) return outOfHearts();
  nextExercise();
}

function floatXp(n) {
  const f = document.createElement('div');
  f.className = 'float-xp'; f.textContent = `+${n} XP`;
  $('.lesson').appendChild(f);
  setTimeout(() => f.remove(), 1100);
}
function showCombo() {
  const c = $('#combo');
  c.innerHTML = t('combo', { n: S.combo });
  c.classList.remove('show'); void c.offsetWidth; c.classList.add('show');
  sfx.combo(S.combo);
}

function outOfHearts() {
  clearTimers();
  sfx.fail();
  $app.innerHTML = `<div class="screen center result">${mascot('sad', 140)}<h1>${t('outOfHearts')}</h1>
    <p class="muted">${t('outInfo')}</p>
    <button class="btn primary wide" id="refill" ${P.gems < store.HEART_REFILL_COST ? 'disabled' : ''}>${t('refillContinue', { n: store.HEART_REFILL_COST })}</button>
    <button class="btn wide" id="practice">${t('earnHeart')}</button>
    <button class="btn ghost wide" id="home">${t('toHome')}</button></div>`;
  $('#refill').onclick = () => {
    P.gems -= store.HEART_REFILL_COST; P.hearts = store.MAX_HEARTS; store.save(P); sfx.levelUp();
    renderLessonShell(); nextExercise();
  };
  $('#practice').onclick = () => startSession({ mode: 'practice' });
  $('#home').onclick = () => { store.save(P); renderHome(); };
}

function finishSession() {
  if (!S) return;
  clearTimers();
  stopSpeaking();
  const s = S; S = null;
  const secs = Math.round((Date.now() - s.startedAt) / 1000);
  const perfect = s.wrong === 0 && s.mode !== 'turbo';
  let xp = s.xp;
  let gems = 0;
  const extras = [];
  if (s.mode === 'lesson') {
    const prog = store.unitProgress(P, s.unit);
    const firstTime = s.lesson === prog;
    xp += firstTime ? 10 : 5;
    if (perfect) xp += 5;
    if (s.exam) xp *= 2;
    gems += firstTime ? 5 : 2;
    if (perfect) gems += 5;
    if (firstTime) {
      store.course(P).progress[UNITS[s.unit].id] = prog + 1;
      if (prog + 1 >= LESSONS_PER_UNIT) { gems += 20; P.stats.exams++; extras.push(t('unitMastered', { unit: unitTitle(UNITS[s.unit]) })); }
    }
    P.stats.lessons++;
  } else if (s.mode === 'turbo') {
    P.stats.bestTurbo = Math.max(P.stats.bestTurbo, s.correct);
    gems += Math.floor(s.correct / 5);
  } else {
    xp += 5;
    gems += 2;
    if (P.hearts < store.MAX_HEARTS) { P.hearts++; extras.push(t('heartEarned')); }
    P.stats.lessons++;
  }
  if (perfect) P.stats.perfect++;
  P.stats.bestCombo = Math.max(P.stats.bestCombo, s.bestCombo);
  P.stats.seconds += secs;
  P.gems += gems;
  const r = store.addXp(P, xp);
  const ach = store.checkAchievements(P);
  store.save(P, true);

  const total = s.correct + s.wrong;
  const acc = total ? Math.round((s.correct / total) * 100) : 0;
  const title = s.mode === 'turbo' ? t('turboResult', { n: s.correct }) : s.exam ? t('examPassed') : perfect ? t('perfectTitle') : t('lessonDone');
  $app.innerHTML = `<div class="screen center result">
    <div class="bounce-in">${mascot('cheer', 150)}</div>
    <h1 class="pop-in">${title}</h1>
    <div class="result-cards">
      <div class="rcard xp"><small>XP</small><b id="xpcount">0</b></div>
      <div class="rcard acc"><small>${s.mode === 'turbo' ? t('resCombo') : t('resAcc')}</small><b>${s.mode === 'turbo' ? s.bestCombo : acc + '%'}</b></div>
      <div class="rcard time"><small>${t('resTime')}</small><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div>
    </div>
    <div class="extras">
      ${gems ? `<div class="extra">${t('gemsPlus', { n: gems })}</div>` : ''}
      ${extras.map((e) => `<div class="extra">${esc(e)}</div>`).join('')}
      ${r.streakUp ? `<div class="extra streak-x">🔥 ${P.streak === 1 ? t('streakDay') : t('streakDays', { n: P.streak })}!</div>` : ''}
      ${r.goalReached ? `<div class="extra">${t('goalReached')}</div>` : ''}
      ${r.levelUp ? `<div class="extra lvl">${t('levelReached', { n: P.level })}</div>` : ''}
      ${ach.map((a) => `<div class="extra ach-x">${a.icon} ${t('achGot')} <b>${esc(achText(a)[0])}</b> +15 💎</div>`).join('')}
    </div>
    <button class="btn primary wide" id="cont">${t('continue')}</button>
  </div>`;
  sfx.fanfare();
  confetti(perfect || s.exam ? 220 : 120);
  if (r.levelUp) setTimeout(() => sfx.levelUp(), 1200);
  // XP hochzählen
  let n = 0; const el = $('#xpcount');
  const step = Math.max(1, Math.round(xp / 30));
  const tm = setInterval(() => { n = Math.min(xp, n + step); el.textContent = n; if (n >= xp) clearInterval(tm); }, 30);
  timers.push(tm);
  $('#cont').onclick = () => { tab = s.mode === 'lesson' ? 'learn' : 'practice'; renderHome(); };
}

// ========== Aufgaben-Renderer ==========
const T = (ex) => LANGS[ex.lang];
// Target-language text as HTML (Chinese: without word gaps, with pinyin below)
const tgt = (s, l) => { const r = reading(s, l); return `${esc(disp(s))}${r ? `<small class="py">${esc(r)}</small>` : ''}`; };
const speakerBtn = (text, l, big = false) => `<div class="speakers ${big ? 'big' : ''}"><button class="spk" data-spk="${esc(text)}" data-l="${l}">🔊</button><button class="spk slow" data-spk="${esc(text)}" data-l="${l}" data-slow="1">🐢</button></div>`;
function bindSpeakers(root) {
  $$('[data-spk]', root).forEach((b) => b.onclick = (e) => { e.stopPropagation(); b.classList.add('playing'); speak(b.dataset.spk, b.dataset.l, { slow: !!b.dataset.slow }).then(() => b.classList.remove('playing')); });
}
const header = (title, badge = '') => `<h2 class="ex-title">${badge}${title}</h2>`;
const newBadge = (ex) => (ex.item && store.itemState(P, ex.item.key).n === 0 ? `<span class="new-badge">${t('newWord')}</span>` : '');

function choiceList(ex, box, options, labelOf, speakOf) {
  const grid = $('.choices', box);
  grid.innerHTML = options.map((o, i) => `<button class="choice" data-i="${i}"><span class="kbd">${i + 1}</span>${labelOf(o)}</button>`).join('');
  let sel = null;
  $$('.choice', grid).forEach((b) => b.onclick = () => {
    if (ctrl.answered) return;
    $$('.choice', grid).forEach((x) => x.classList.remove('sel'));
    b.classList.add('sel'); sel = options[+b.dataset.i]; sfx.tap();
    if (speakOf) say(speakOf(sel));
    setReady(true);
  });
  ctrl.check = () => {
    const ok = sel.key === ex.item.key;
    $$('.choice', grid).forEach((b) => { const o = options[+b.dataset.i]; if (o.key === ex.item.key) b.classList.add('right'); else if (o === sel) b.classList.add('wrong'); });
    return { ok };
  };
  ctrl.selectIndex = (i) => $$('.choice', grid)[i]?.click();
}

function textInput(ex, box, answerStr, placeholder) {
  const accents = T(ex).accents;
  const isNativeAnswer = false;
  $('.answer-area', box).innerHTML = `<textarea class="input type-in" rows="${ex.kind === 'sentence' ? 3 : 1}" placeholder="${esc(T(ex).cjk ? t('pinyinPh') : placeholder)}" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>
    ${accents && !isNativeAnswer ? `<div class="accents">${[...accents].map((c) => `<button class="acc" data-c="${c}">${c}</button>`).join('')}</div>` : ''}`;
  const inp = $('.type-in', box);
  setTimeout(() => inp.focus({ preventScroll: true }), 250);
  inp.oninput = () => setReady(inp.value.trim().length > 0);
  inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); onCheck(); } };
  $$('.acc', box).forEach((b) => b.onmousedown = (e) => {
    e.preventDefault();
    const s = inp.selectionStart, en = inp.selectionEnd;
    inp.value = inp.value.slice(0, s) + b.dataset.c + inp.value.slice(en);
    inp.selectionStart = inp.selectionEnd = s + 1; inp.dispatchEvent(new Event('input'));
  });
  ctrl.check = () => { inp.readOnly = true; return checkText(inp.value, answerStr, ex.lang); };
}

function tileBuilder(ex, box, answerStr) {
  const area = $('.answer-area', box);
  area.innerHTML = `<div class="tile-line" id="line"></div><div class="tile-bank" id="bank">${ex.tiles.map((t, i) => `<span class="slot"><button class="tile" data-i="${i}">${esc(t)}</button></span>`).join('')}</div>`;
  const line = $('#line', area);
  const chosen = [];
  const refresh = () => setReady(chosen.length > 0);
  $$('#bank .tile', area).forEach((t) => t.onclick = () => {
    if (ctrl.answered || t.classList.contains('used')) return;
    sfx.pop();
    t.classList.add('used');
    const c = document.createElement('button');
    c.className = 'tile placed'; c.textContent = t.textContent; c.dataset.i = t.dataset.i;
    c.onclick = () => { if (ctrl.answered) return; sfx.tap(); c.remove(); t.classList.remove('used'); chosen.splice(chosen.indexOf(+c.dataset.i), 1); refresh(); };
    line.appendChild(c);
    chosen.push(+t.dataset.i);
    if (ex.lang && answerStr !== ex.item[nat()]) say(t.textContent);
    refresh();
  });
  ctrl.check = () => {
    const built = $$('.tile', line).map((x) => x.textContent).join(' ');
    return checkText(built, answerStr, answerStr === ex.item[nat()] ? nat() : ex.lang).ok ? { ok: true } : { ok: false, best: disp(answerStr) };
  };
}

const RENDER = {
  pickImage(ex, box) {
    box.innerHTML = `${header(t('exPickImage', { w: esc(natText(ex.item)) }), newBadge(ex))}<div class="img-grid"></div>`;
    const grid = $('.img-grid', box);
    let sel = null;
    grid.innerHTML = ex.options.map((o, i) => `<button class="img-card" data-i="${i}"><span class="kbd">${i + 1}</span><span class="emo">${o.e}</span><b>${tgt(o[ex.lang], ex.lang)}</b></button>`).join('');
    $$('.img-card', grid).forEach((b) => b.onclick = () => {
      if (ctrl.answered) return;
      $$('.img-card', grid).forEach((x) => x.classList.remove('sel'));
      b.classList.add('sel'); sel = ex.options[+b.dataset.i]; sfx.tap();
      say(main(sel[ex.lang])); setReady(true);
    });
    ctrl.check = () => {
      $$('.img-card', grid).forEach((b) => { const o = ex.options[+b.dataset.i]; if (o.key === ex.item.key) b.classList.add('right'); else if (o === sel) b.classList.add('wrong'); });
      return { ok: sel.key === ex.item.key };
    };
    ctrl.selectIndex = (i) => $$('.img-card', grid)[i]?.click();
  },

  toTarget(ex, box) {
    box.innerHTML = `${header(t('exToTarget', { lang: langInText(ex.lang) }), newBadge(ex))}
      <div class="prompt-card">${S.d < 4 ? `<span class="emo-s">${ex.item.e}</span>` : ''}<span class="prompt-word">${esc(natText(ex.item))}</span></div><div class="choices"></div>`;
    choiceList(ex, box, ex.options, (o) => tgt(o[ex.lang], ex.lang), (o) => main(o[ex.lang]));
  },

  toNative(ex, box) {
    const w = main(ex.item[ex.lang]);
    box.innerHTML = `${header(t('exToNative'), newBadge(ex))}
      <div class="bubble-row">${mascot('think', 80)}<div class="bubble">${speakerBtn(w, ex.lang)}<span class="prompt-word">${tgt(ex.item[ex.lang], ex.lang)}</span></div></div><div class="choices"></div>`;
    bindSpeakers(box);
    choiceList(ex, box, ex.options, (o) => esc(natText(o)));
    setTimeout(() => say(w), 300);
  },

  listenPick(ex, box) {
    const w = main(ex.item[ex.lang]);
    box.innerHTML = `${header(t('exListenPick'))}${speakerBtn(w, ex.lang, true)}<div class="choices"></div>`;
    bindSpeakers(box);
    choiceList(ex, box, ex.options, (o) => tgt(o[ex.lang], ex.lang));
    setTimeout(() => say(w), 300);
  },

  typeTarget(ex, box) {
    box.innerHTML = `${header(t('exWrite', { lang: langInText(ex.lang) }))}
      <div class="prompt-card">${S.d < 6 ? `<span class="emo-s">${ex.item.e}</span>` : ''}<span class="prompt-word">${esc(natText(ex.item))}</span></div><div class="answer-area"></div>`;
    textInput(ex, box, ex.item[ex.lang], t('inLang', { lang: langInText(ex.lang) }));
  },

  listenType(ex, box) {
    const w = main(ex.item[ex.lang]);
    box.innerHTML = `${header(t('exListenType'))}${speakerBtn(w, ex.lang, true)}<div class="answer-area"></div>`;
    bindSpeakers(box);
    textInput(ex, box, ex.item[ex.lang], t('inLang', { lang: langInText(ex.lang) }));
    setTimeout(() => say(w), 300);
  },

  buildTarget(ex, box) {
    box.innerHTML = `${header(t('exTranslate'))}
      <div class="bubble-row">${mascot('happy', 80)}<div class="bubble"><span class="prompt-sent">${esc(natText(ex.item))}</span></div></div><div class="answer-area"></div>`;
    tileBuilder(ex, box, ex.item[ex.lang]);
  },

  buildNative(ex, box) {
    const s = main(ex.item[ex.lang]);
    box.innerHTML = `${header(t('exTranslateNative', { lang: langInText(nat()) }))}
      <div class="bubble-row">${mascot('think', 80)}<div class="bubble">${speakerBtn(s, ex.lang)}<span class="prompt-sent">${tgt(ex.item[ex.lang], ex.lang)}</span></div></div><div class="answer-area"></div>`;
    bindSpeakers(box);
    tileBuilder(ex, box, ex.item[nat()]);
    setTimeout(() => say(s), 300);
  },

  listenBuild(ex, box) {
    const s = main(ex.item[ex.lang]);
    box.innerHTML = `${header(t('exListenBuild'))}${speakerBtn(s, ex.lang, true)}<div class="answer-area"></div>`;
    bindSpeakers(box);
    tileBuilder(ex, box, ex.item[ex.lang]);
    setTimeout(() => say(s), 300);
  },

  typeSentence(ex, box) {
    box.innerHTML = `${header(t('exWrite', { lang: langInText(ex.lang) }))}
      <div class="bubble-row">${mascot('happy', 80)}<div class="bubble"><span class="prompt-sent">${esc(natText(ex.item))}</span></div></div><div class="answer-area"></div>`;
    textInput(ex, box, ex.item[ex.lang], t('translationIn', { lang: langInText(ex.lang) }));
  },

  speak(ex, box) {
    const s = main(ex.item[ex.lang]);
    box.innerHTML = `${header(t('exSpeak'))}
      <div class="bubble-row">${mascot('happy', 80)}<div class="bubble">${speakerBtn(s, ex.lang)}<span class="prompt-sent">${tgt(ex.item[ex.lang], ex.lang)}</span><small class="muted">${esc(natText(ex.item))}</small></div></div>
      <button class="mic" id="mic"><span>🎤</span><b>${t('tapToSpeak')}</b></button>
      <div class="heard muted" id="heard"></div>
      <button class="link" id="nospeak">${t('cantSpeak')}</button>`;
    bindSpeakers(box);
    const mic = $('#mic', box);
    let busy = false;
    mic.onclick = async () => {
      if (busy || ctrl.answered) return;
      busy = true;
      stopSpeaking();
      mic.classList.add('rec'); $('b', mic).textContent = t('listening');
      try {
        const res = await listen(ex.lang);
        mic.classList.remove('rec'); $('b', mic).textContent = t('tryAgain');
        busy = false;
        if (!res.length) { $('#heard', box).textContent = t('heardNothing'); return; }
        const scored = res.map((h) => [h, similarity(h, ex.item[ex.lang])]).sort((a, b) => b[1] - a[1]);
        const [heard, sc] = scored[0];
        $('#heard', box).textContent = t('heard', { t: heard });
        const need = ex.kind === 'word' ? 0.7 : 0.72;
        if (sc >= need) submit({ ok: true, heard });
        else {
          ctrl.tries = (ctrl.tries || 0) + 1;
          if (ctrl.tries >= 2) submit({ ok: false, heard, best: disp(ex.item[ex.lang]) });
          else { mic.classList.add('shake'); sfx.wrong(); setTimeout(() => mic.classList.remove('shake'), 500); toast(t('almost')); }
        }
      } catch (e) {
        busy = false;
        mic.classList.remove('rec'); $('b', mic).textContent = t('tapToSpeak');
        toast(e.message === 'not-allowed' ? t('micDenied') : t('sttUnavailable'));
        if (e.message === 'not-allowed') { pauseSpeaking(60); skipSpeak(ex); }
      }
    };
    $('#nospeak', box).onclick = () => { pauseSpeaking(15); toast(t('noSpeak15')); skipSpeak(ex); };
  },

  match(ex, box) {
    box.innerHTML = `${header(t('exMatch'))}<div class="match-grid"><div class="col" id="left"></div><div class="col" id="right"></div></div>`;
    $('#left', box).innerHTML = ex.left.map((o) => `<button class="mt" data-k="${o.key}" data-side="l">${esc(natText(o))}</button>`).join('');
    $('#right', box).innerHTML = ex.right.map((o) => `<button class="mt" data-k="${o.key}" data-side="r" data-say="${esc(main(o[ex.lang]))}">${tgt(o[ex.lang], ex.lang)}</button>`).join('');
    let sel = null; let matched = 0; let mistakes = 0;
    $$('.mt', box).forEach((b) => b.onclick = () => {
      if (b.classList.contains('done')) return;
      if (b.dataset.side === 'r') say(b.dataset.say);
      if (!sel || sel.dataset.side === b.dataset.side) {
        if (sel) sel.classList.remove('sel');
        sel = b; b.classList.add('sel'); sfx.tap(); return;
      }
      if (sel.dataset.k === b.dataset.k) {
        sel.classList.add('done'); b.classList.add('done'); sel.classList.remove('sel');
        sfx.match(); matched++;
        store.recordItem(P, b.dataset.k, true);
        sel = null;
        if (matched === ex.items.length) setTimeout(() => submit({ ok: true, note: mistakes ? undefined : undefined }), 350);
      } else {
        mistakes++;
        const a = sel; a.classList.add('bad'); b.classList.add('bad'); sfx.wrong();
        setTimeout(() => { a.classList.remove('bad', 'sel'); b.classList.remove('bad'); }, 450);
        sel = null;
      }
    });
  },
};

function skipSpeak(ex) {
  // Sprechaufgabe durch Satzbau ersetzen, ohne Strafe
  S.queue[0] = makeExercise(P, ex.lang, ex.item, ex.kind === 'word' ? 'toTarget' : 'buildTarget', S.d, S.pool);
  S.queue = S.queue.map((q) => (q.type === 'speak' ? makeExercise(P, q.lang, q.item, q.kind === 'word' ? 'toTarget' : 'buildTarget', S.d, S.pool) : q));
  clearTimers(); if (S.timeLimit) startTurboClock();
  nextExercise();
}

// ---------- Tastatur ----------
document.addEventListener('keydown', (e) => {
  if (!S || !ctrl || $('.modal-wrap')) return;
  const typing = e.target.matches('textarea, input');
  if (e.key === 'Enter' && !typing) { e.preventDefault(); onCheck(); }
  else if (!typing && /^[1-9]$/.test(e.key) && ctrl.selectIndex && !ctrl.answered) ctrl.selectIndex(+e.key - 1);
});

// Herzen-Anzeige regelmäßig aktualisieren
setInterval(() => { if (P && !S) { const before = P.hearts; store.refreshHearts(P); if (P.hearts !== before) { store.save(P); const h = $('.chip.hearts b'); if (h) h.textContent = P.hearts; } } }, 30000);

// ---------- Start ----------
(async function boot() {
  setUiLang(initialUiLang());
  const last = store.lastProfileName();
  if (last) {
    const p = await store.loadProfile(last);
    if (p) { P = p; return afterLogin(); }
  }
  renderProfiles();
})();

// Android back button (called by the app): true = handled here
window.__lpBack = () => {
  if ($('.modal-wrap')) { closeModal(); return true; }
  if (S && $('#quit')) { quitLesson(); return true; }
  if (P && $('.bottomnav') && tab !== 'learn') { tab = 'learn'; renderHome(); return true; }
  return false;
};

// Für Debugging in der Konsole
window.lingopingo = { get profile() { return P; }, get session() { return S; }, norm, tokens, shuffle, highestUnit };

// Einmal pro Sitzung warnen, wenn das Gerät keine Stimme für die Lernsprache hat
let voiceWarned = false;
function warnMissingVoice() {
  if (voiceWarned || !ttsSupported() || !P.settings.tts) return;
  ensureVoices().then(() => {
    if (voiceWarned || hasVoice(lang())) return;
    voiceWarned = true;
    toast(t('missingVoice', { lang: langName(lang()) }), 9000);
  });
}
