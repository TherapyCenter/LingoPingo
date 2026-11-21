import { LANGS, UNITS, LESSONS_PER_UNIT, main, itemsOfUnit, flag } from './course.js';
import * as store from './store.js';
import { sfx, speak, listen, setSoundEnabled, setSpeechRate, ttsSupported, recognitionSupported, hasVoice, voiceName, ensureVoices } from './audio.js';
import { buildSession, makeExercise, checkText, similarity, tokens, shuffle, norm, unitLessonLabel, pauseSpeaking, highestUnit } from './lesson.js';
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
const PRAISE = ['Super!', 'Klasse!', 'Genau!', 'Spitze!', 'Perfekt!', 'Stark!', 'Wunderbar!', 'Bravo!', 'Richtig!'];
const lang = () => P.currentCourse;
const L = () => LANGS[lang()];

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
    <div class="bounce-in">${mascot('cheer', 140)}</div>
    <h1 class="logo">Lingo<span>Pingo</span></h1>
    <p class="sub">Sprachen lernen – spielend leicht!</p>
    <div class="card profiles-card"><h3>Wer lernt heute?</h3><div class="profile-list"><div class="loader"></div></div>
      <button class="btn primary wide" data-act="new-profile">＋ Neues Profil</button></div>
  </div>`;
  const list = (await store.listProfiles()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  $('.profile-list').innerHTML = list.length ? list.map((p) => `
    <button class="profile-chip" data-name="${esc(p.name)}"><span class="av">${esc(p.avatar || '🐧')}</span>
    <span class="pn">${esc(p.name)}</span><span class="pl">Lv ${p.level || 1} · 🔥${p.streak || 0}</span></button>`).join('')
    : '<p class="muted">Noch keine Profile – leg los!</p>';
  $$('.profile-chip').forEach((b) => b.onclick = () => login(b.dataset.name));
  if (!store.serverOnline) toast('⚠️ Server nicht erreichbar – Fortschritt wird nur lokal gespeichert.');
}

function newProfileDialog() {
  let av = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const m = modal(`<h2>Neues Profil</h2>
    <input class="input" id="pname" maxlength="24" placeholder="Dein Name" autocomplete="off">
    <p class="muted">Wähle deinen Avatar:</p>
    <div class="avatar-grid">${AVATARS.map((a) => `<button class="av-btn ${a === av ? 'sel' : ''}" data-av="${a}">${a}</button>`).join('')}</div>
    <button class="btn primary wide" id="pcreate">Los geht's!</button>`);
  const inp = $('#pname', m); inp.focus();
  $$('.av-btn', m).forEach((b) => b.onclick = () => { av = b.dataset.av; $$('.av-btn', m).forEach((x) => x.classList.toggle('sel', x === b)); sfx.tap(); });
  const create = async () => {
    const name = inp.value.trim();
    if (!/^[\p{L}\p{N} _.-]{1,24}$/u.test(name)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); return; }
    const existing = await store.loadProfile(name);
    if (existing) { toast('Diesen Namen gibt es schon – du wirst eingeloggt.'); closeModal(); return login(name); }
    P = store.newProfile(name, av);
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
  if (!p) { toast('Profil nicht gefunden'); return renderProfiles(); }
  P = p;
  afterLogin();
}

function afterLogin() {
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
    ${first ? `<div class="bubble-row">${mascot('happy', 90)}<div class="bubble">Hallo ${esc(P.name)}! Welche Sprache möchtest du lernen?</div></div>` : '<h2>Sprache wählen</h2>'}
    <div class="course-grid">${Object.entries(LANGS).map(([k, l]) => {
      const c = P.courses[k];
      return `<button class="course-card ${P.currentCourse === k ? 'sel' : ''}" data-c="${k}">
        <span class="flag">${flag(k, 84)}</span><b>${l.name}</b><span class="muted">${l.native}</span>
        ${c && c.xp ? `<span class="pill">${c.xp} XP</span>` : '<span class="pill new">Neu</span>'}</button>`;
    }).join('')}</div>
    <p class="muted small">Weitere Sprachen folgen bald!</p>
    ${!first ? '<button class="btn ghost" data-act="home">Zurück</button>' : ''}
  </div>`;
  $$('.course-card').forEach((b) => b.onclick = () => {
    P.currentCourse = b.dataset.c; store.course(P); store.save(P);
    sfx.pop(); say(L().native);
    tab = 'learn'; renderHome();
    if (ttsSupported() && !hasVoice(lang())) setTimeout(() => toast(`🔈 Für ${L().name} wurde keine Sprachausgabe-Stimme gefunden. Installiere eine ${L().name}-Stimme im System für besseren Klang.`, 6000), 800);
  });
}

// ========== Startseite ==========
function topbar() {
  store.refreshHearts(P);
  return `<header class="topbar">
    <button class="chip" data-act="courses" title="Sprache wechseln">${flag(lang(), 30)}</button>
    <button class="chip streak ${P.lastDay === store.today() ? 'lit' : ''}" data-act="streak">🔥 <b>${P.streak}</b></button>
    <button class="chip gems" data-act="shop">💎 <b>${P.gems}</b></button>
    <button class="chip hearts" data-act="hearts">❤️ <b>${P.hearts}</b></button>
  </header>`;
}
function bottomNav() {
  const items = [['learn', '🏠', 'Lernen'], ['practice', '🏋️', 'Üben'], ['ranks', '🏆', 'Rangliste'], ['profile', P.avatar, 'Profil']];
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
    <div class="goal-txt"><b>Tagesziel</b><div class="muted">${xpToday} / ${P.dailyGoal} XP</div>
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
        <div><small>EINHEIT ${ui + 1}${done ? ' · 👑 gemeistert' : ''}</small><h3>${u.icon} ${esc(u.title)}</h3></div>
        <button class="guide-btn" data-guide="${ui}" title="Wortliste & Tipps">📖</button>
      </div>
      <div class="path">${nodes}</div>
    </section>`;
  }).join('');
  return `${dailyGoalCard()}${units}<div class="path-end">${mascot('sleep', 80)}<p class="muted">Bald gibt es mehr Einheiten!</p></div>`;
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
    return toast(li === LESSONS_PER_UNIT - 1 ? '🔒 Schließe zuerst alle Lektionen ab.' : '🔒 Noch gesperrt – mach die vorherige Lektion.');
  }
  const exam = li === LESSONS_PER_UNIT - 1;
  const replay = li < prog;
  const u = UNITS[ui];
  modal(`<div class="lesson-pop" style="--c:${u.color}">
      <div class="pop-icon">${exam ? '👑' : u.icon}</div>
      <h2>${unitLessonLabel(ui, li)}</h2>
      <p>${esc(u.title)} · ${exam ? 'Mit Zeitlimit & doppelten XP!' : replay ? 'Wiederholen festigt dein Wissen.' : `${li + 1} von ${LESSONS_PER_UNIT}`}</p>
      <button class="btn primary wide" id="go">${replay ? 'Wiederholen' : 'Start'} ${exam ? '(+XP ×2)' : ''}</button>
    </div>`);
  $('#go').onclick = () => { closeModal(); startSession({ mode: 'lesson', unit: ui, lesson: li }); };
}

function guidebook(ui) {
  const u = UNITS[ui];
  const items = itemsOfUnit(ui);
  modal(`<h2>${u.icon} ${esc(u.title)}</h2>
    <div class="tip-box">${mascot('think', 56)}<p>${esc(u.tip)}</p></div>
    <div class="vocab">${items.map((it) => `<button class="vocab-row" data-say="${esc(main(it[lang()]))}">
      <span class="ve">${it.kind === 'word' ? it.e : '💬'}</span><span class="vt"><b>${esc(main(it[lang()]))}</b><small>${esc(it.de)}</small></span><span class="vs">🔊</span></button>`).join('')}</div>
    <button class="btn wide" data-close>Schließen</button>`, { cls: 'tall' });
  $$('.vocab-row').forEach((b) => b.onclick = () => speak(b.dataset.say, lang()));
}

// ---------- Üben ----------
function practiceTab() {
  const canSpeak = recognitionSupported();
  const seenWords = UNITS.flatMap((_, ui) => itemsOfUnit(ui)).filter((it) => store.itemState(P, it.key).n > 0);
  const strong = seenWords.filter((it) => store.itemState(P, it.key).s >= 4).length;
  return `<h2 class="tab-title">Üben</h2>
    <div class="practice-grid">
      <button class="pcard" data-mode="practice" style="--c:#ff9600"><span>💪</span><b>Schwächen trainieren</b><small>+1 ❤️ & XP</small></button>
      <button class="pcard" data-mode="listen" style="--c:#1cb0f6" ${ttsSupported() ? '' : 'disabled'}><span>🎧</span><b>Hörtraining</b><small>Nur Hören</small></button>
      <button class="pcard" data-mode="speak" style="--c:#ce82ff" ${canSpeak ? '' : 'disabled'}><span>🎤</span><b>Sprechtraining</b><small>${canSpeak ? 'Sprich nach' : 'Browser/HTTPS nötig'}</small></button>
      <button class="pcard" data-mode="turbo" style="--c:#ff4b4b"><span>⏱️</span><b>Turbo-Runde</b><small>60 Sek. · Rekord ${P.stats.bestTurbo}</small></button>
    </div>
    <div class="card">
      <h3>Dein Wortschatz <span class="muted">· ${seenWords.length} gelernt · ${strong} sicher</span></h3>
      ${seenWords.length ? `<div class="vocab">${seenWords.sort((a, b) => store.itemState(P, a.key).s - store.itemState(P, b.key).s).map((it) => {
        const s = store.itemState(P, it.key).s;
        return `<button class="vocab-row" data-say="${esc(main(it[lang()]))}"><span class="ve">${it.kind === 'word' ? it.e : '💬'}</span>
        <span class="vt"><b>${esc(main(it[lang()]))}</b><small>${esc(it.de)}</small></span>
        <span class="strength s${s}" title="Stärke ${s}/5">${'▮'.repeat(s)}${'▯'.repeat(5 - s)}</span></button>`;
      }).join('')}</div>` : '<p class="muted">Mach deine erste Lektion, dann erscheinen hier deine Wörter.</p>'}
    </div>`;
}
function bindPractice() {
  $$('[data-mode]').forEach((b) => b.onclick = () => { sfx.tap(); startSession({ mode: b.dataset.mode }); });
  $$('.vocab-row').forEach((b) => b.onclick = () => speak(b.dataset.say, lang()));
}

// ---------- Rangliste ----------
let rankMode = 'week';
function ranksTab() {
  const lg = store.leagueOf(P.xp);
  return `<div class="league-head">${lg.icon}<div><h2>${lg.name}-Liga</h2><p class="muted">${nextLeagueText()}</p></div></div>
    <div class="seg"><button data-rm="week" class="${rankMode === 'week' ? 'on' : ''}">Diese Woche</button><button data-rm="all" class="${rankMode === 'all' ? 'on' : ''}">Gesamt</button></div>
    <div class="card rank-list"><div class="loader"></div></div>`;
}
function nextLeagueText() {
  const next = store.LEAGUES.find((l) => l.min > P.xp);
  return next ? `Noch ${next.min - P.xp} XP bis ${next.icon} ${next.name}` : 'Höchste Liga erreicht!';
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
    <b>${x.score} XP</b></div>`).join('') + (list.length < 2 ? '<p class="muted center-txt">Lade Freunde & Familie ein, gegeneinander anzutreten! Jedes Profil auf diesem Server erscheint hier.</p>' : '');
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
      <p class="muted">${store.leagueOf(P.xp).icon} ${store.leagueOf(P.xp).name}-Liga · seit ${new Date(P.createdAt).toLocaleDateString('de')}</p></div></div>
    <div class="card"><div class="lvl-row"><b>Level ${lv}</b><span class="muted">${P.xp - cur} / ${nxt - cur} XP</span></div><div class="bar"><div class="fill gold" style="width:${pct}%"></div></div></div>
    <div class="stats-grid">
      <div class="stat"><span>⚡</span><b>${P.xp}</b><small>Gesamt-XP</small></div>
      <div class="stat"><span>🔥</span><b>${P.streak}</b><small>Streak (max ${P.bestStreak})</small></div>
      <div class="stat"><span>📚</span><b>${P.stats.lessons}</b><small>Lektionen</small></div>
      <div class="stat"><span>🎯</span><b>${acc}%</b><small>Treffsicherheit</small></div>
    </div>
    <div class="card"><h3>Letzte 7 Tage</h3><div class="week-chart">${days.map(([d, v]) => `<div class="wc-col"><div class="wc-bar ${v >= P.dailyGoal ? 'hit' : ''}" style="height:${Math.max(4, (v / maxD) * 100)}%"><em>${v || ''}</em></div><small>${d.toLocaleDateString('de', { weekday: 'short' })}</small></div>`).join('')}</div></div>
    <div class="card"><h3>Erfolge <span class="muted">${P.achievements.length}/${store.ACHIEVEMENTS.length}</span></h3><div class="ach-grid">
      ${store.ACHIEVEMENTS.map((a) => `<div class="ach ${P.achievements.includes(a.id) ? 'got' : ''}" title="${esc(a.desc)}"><span>${a.icon}</span><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></div>`).join('')}
    </div></div>
    <div class="card settings"><h3>Einstellungen</h3>
      ${toggle('sound', '🔊 Soundeffekte')}
      ${toggle('tts', '🗣️ Vorlesen', !ttsSupported())}
      ${toggle('listenEx', '🎧 Höraufgaben', !ttsSupported())}
      ${toggle('speakEx', '🎤 Sprechaufgaben' + (recognitionSupported() ? '' : ' (nicht verfügbar)'), !recognitionSupported())}
      <label class="range"><span>🐢 Sprechtempo</span><input type="range" min="0.6" max="1.2" step="0.05" value="${s.rate}" data-rate></label>
      <label class="range"><span>🎯 Tagesziel</span><select data-goal>${[10, 20, 30, 50, 80].map((g) => `<option value="${g}" ${P.dailyGoal === g ? 'selected' : ''}>${g} XP ${['(Locker)', '(Normal)', '(Ernsthaft)', '(Intensiv)', '(Wahnsinn)'][[10, 20, 30, 50, 80].indexOf(g)]}</option>`).join('')}</select></label>
      ${!recognitionSupported() ? `<p class="muted small">Sprechaufgaben brauchen Chrome, Edge oder Safari und eine sichere Verbindung (https oder localhost).</p>` : ''}
    </div>
    <div class="card voices"><h3>🔊 Aussprache testen</h3>
      ${!ttsSupported() ? '<p class="muted">Dieser Browser unterstützt keine Sprachausgabe.</p>' : Object.entries(LANGS).map(([k, l]) => {
        const vn = voiceName(k);
        return `<div class="voice-row">${flag(k, 28)}<div><b>${l.name}</b><small class="${vn ? 'muted' : 'warn'}">${vn ? esc(vn) : 'Keine passende Stimme gefunden – Systemstimme wird versucht'}</small></div>
          <button class="btn small" data-vtest="${k}">▶ Test</button></div>`;
      }).join('')}
      <p class="muted small">Nichts zu hören? Lautstärke prüfen (beim iPhone auch den Stumm-Schalter). Fehlende Stimmen installierst du in den Geräte-Einstellungen unter Sprache/Text-in-Sprache.</p>
    </div>
    <div class="btn-col">
      <button class="btn" data-act="courses">${flag(lang(), 26)} Sprache wechseln</button>
      <button class="btn" data-act="switch">👥 Profil wechseln</button>
      <button class="btn danger-ghost" data-act="delete">🗑️ Profil löschen</button>
    </div>`;
}
function bindProfile() {
  $$('[data-set]').forEach((i) => i.onchange = () => { P.settings[i.dataset.set] = i.checked; applySettings(); store.save(P); sfx.tap(); });
  const r = $('[data-rate]'); if (r) r.onchange = () => { P.settings.rate = +r.value; applySettings(); store.save(P); say(main(UNITS[0].sentences[0][lang()])); };
  $$('[data-vtest]').forEach((b) => b.onclick = () => speak(main(UNITS[0].sentences[0][b.dataset.vtest]), b.dataset.vtest));
  const g = $('[data-goal]'); if (g) g.onchange = () => { P.dailyGoal = +g.value; store.save(P); toast('🎯 Tagesziel gespeichert'); };
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
    modal(`<h2>Profil löschen?</h2><p>Alle Fortschritte von <b>${esc(P.name)}</b> gehen verloren.</p>
      <div class="btn-row"><button class="btn" data-close>Abbrechen</button><button class="btn danger" id="del">Löschen</button></div>`);
    $('#del').onclick = async () => { await store.deleteProfile(P.name); P = null; closeModal(); renderProfiles(); };
  }
});

function fmtMs(ms) { const m = Math.ceil(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)} Std ${m % 60} Min` : `${m} Min`; }

function heartsDialog(fromLesson = false) {
  store.refreshHearts(P);
  const full = P.hearts >= store.MAX_HEARTS;
  modal(`<div class="center-txt"><div class="hearts-big">${'❤️'.repeat(P.hearts)}${'🤍'.repeat(store.MAX_HEARTS - P.hearts)}</div>
    <h2>${full ? 'Alle Herzen voll!' : P.hearts ? `Noch ${P.hearts} Herzen` : 'Keine Herzen mehr'}</h2>
    <p class="muted">${full ? 'Jeder Fehler in einer Lektion kostet ein Herz.' : `Nächstes Herz in ${fmtMs(store.nextHeartIn(P))}`}</p>
    ${!full ? `<button class="btn primary wide" id="refill" ${P.gems < store.HEART_REFILL_COST ? 'disabled' : ''}>Auffüllen für 💎 ${store.HEART_REFILL_COST}</button>
    <button class="btn wide" id="earn">💪 Üben & Herz verdienen</button>` : ''}
    <button class="btn ghost wide" data-close>${fromLesson ? 'Zurück' : 'OK'}</button></div>`);
  const rf = $('#refill');
  if (rf) rf.onclick = () => { P.gems -= store.HEART_REFILL_COST; P.hearts = store.MAX_HEARTS; store.save(P); sfx.levelUp(); closeModal(); renderHome(); toast('❤️ Herzen aufgefüllt!'); };
  const ea = $('#earn');
  if (ea) ea.onclick = () => { closeModal(); startSession({ mode: 'practice' }); };
}

function shopDialog() {
  modal(`<h2>💎 Shop</h2><p class="muted">Du hast <b>${P.gems}</b> Perlen. Verdiene mehr durch Lektionen, Tagesziele & Erfolge.</p>
    <div class="shop-item"><span>❤️</span><div><b>Herzen auffüllen</b><small>Alle ${store.MAX_HEARTS} Herzen zurück</small></div><button class="btn small" data-buy="hearts" ${P.gems < store.HEART_REFILL_COST || P.hearts >= store.MAX_HEARTS ? 'disabled' : ''}>💎 ${store.HEART_REFILL_COST}</button></div>
    <div class="shop-item"><span>🧊</span><div><b>Streak-Schutz</b><small>Rettet deinen Streak einen verpassten Tag lang (${P.freezes}/2)</small></div><button class="btn small" data-buy="freeze" ${P.gems < 100 || P.freezes >= 2 ? 'disabled' : ''}>💎 100</button></div>
    <div class="shop-item"><span>🎭</span><div><b>Neuer Avatar</b><small>Zufälliger neuer Look</small></div><button class="btn small" data-buy="avatar" ${P.gems < 30 ? 'disabled' : ''}>💎 30</button></div>
    <button class="btn ghost wide" data-close>Schließen</button>`);
  $$('[data-buy]').forEach((b) => b.onclick = () => {
    const k = b.dataset.buy;
    if (k === 'hearts') { P.gems -= store.HEART_REFILL_COST; P.hearts = store.MAX_HEARTS; }
    if (k === 'freeze') { P.gems -= 100; P.freezes++; }
    if (k === 'avatar') { P.gems -= 30; let a; do { a = AVATARS[Math.floor(Math.random() * AVATARS.length)]; } while (a === P.avatar); P.avatar = a; }
    sfx.levelUp(); store.save(P); closeModal(); renderHome(); toast('✅ Gekauft!');
  });
}

function streakDialog() {
  const lit = P.lastDay === store.today();
  modal(`<div class="center-txt"><div class="flame ${lit ? 'lit' : ''}">🔥</div><h2>${P.streak} ${P.streak === 1 ? 'Tag' : 'Tage'} Streak</h2>
    <p class="muted">${lit ? 'Heute schon gelernt – stark!' : 'Mach heute eine Lektion, damit dein Streak nicht erlischt!'}</p>
    <p>🧊 Streak-Schutz: <b>${P.freezes}</b> · Rekord: <b>${P.bestStreak}</b></p>
    <p class="muted small">Alle 7 Tage gibt es einen Streak-Schutz gratis.</p>
    <button class="btn primary wide" data-close>Weiter</button></div>`);
}

// ========== Lektionen ==========
function startSession(opts) {
  store.refreshHearts(P);
  const usesHearts = opts.mode === 'lesson';
  if (usesHearts && P.hearts <= 0) return heartsDialog(true);
  const sess = buildSession(P, lang(), opts);
  if (!sess || !sess.queue.length) return toast('Hierfür gibt es noch nichts zu üben – mach zuerst eine Lektion!');
  if (opts.mode === 'speak' && !sess.queue.some((e) => e.type === 'speak')) return toast('Sprechübungen sind gerade nicht verfügbar.');
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
      <button class="x" id="quit" aria-label="Beenden">✕</button>
      <div class="bar big"><div class="fill" id="prog" style="width:0%"></div></div>
      ${S.usesHearts ? `<div class="lh">❤️ <b id="hearts">${P.hearts}</b></div>` : S.timeLimit ? `<div class="lh">⏱️ <b id="clock">${S.timeLimit}</b></div>` : `<div class="lh">⚡ <b id="xpnow">0</b></div>`}
    </div>
    ${S.perQuestion ? '<div class="qtimer"><div id="qfill"></div></div>' : ''}
    <div id="combo" class="combo"></div>
    <main class="ex" id="ex"></main>
    <footer class="checkbar" id="checkbar">
      <div class="fb" id="fb"></div>
      <div class="cb-btns"><button class="btn ghost" id="skip">Überspringen</button><button class="btn primary" id="check" disabled>Prüfen</button></div>
    </footer>
  </div>`;
  $('#quit').onclick = quitLesson;
  $('#check').onclick = onCheck;
  $('#skip').onclick = () => { if (ctrl && !ctrl.answered) submit({ ok: false, skipped: true }); };
}

function quitLesson() {
  if (S.timeLimit) return finishSession();
  modal(`<div class="center-txt">${mascot('sad', 100)}<h2>Wirklich aufhören?</h2><p class="muted">Dein Fortschritt in dieser Lektion geht verloren.</p>
    <button class="btn primary wide" data-close>Weiterlernen</button><button class="btn ghost wide" id="really">Beenden</button></div>`);
  $('#really').onclick = () => { closeModal(); window.speechSynthesis?.cancel(); store.save(P); renderHome(); };
}

function startTurboClock() {
  const end = Date.now() + S.timeLimit * 1000;
  const t = setInterval(() => {
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    const c = $('#clock'); if (c) c.textContent = left;
    if (left <= 5 && left > 0) sfx.tick();
    if (left <= 0) { clearInterval(t); finishSession(); }
  }, 250);
  timers.push(t);
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
  const btn = $('#check'); btn.textContent = 'Prüfen'; btn.disabled = true; btn.className = 'btn primary';
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
  const t = setInterval(() => {
    const left = Math.max(0, 1 - (Date.now() - start) / total);
    q.style.width = left * 100 + '%';
    q.classList.toggle('low', left < 0.25);
    if (ctrl.answered) { clearInterval(t); return; }
    if (left <= 0) { clearInterval(t); submit({ ok: false, timeout: true }); }
  }, 100);
  timers.push(t);
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
  if (['toNative', 'buildNative'].includes(ex.type)) return main(it.de);
  return main(it[ex.lang]);
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
    fb.innerHTML = `<div class="fb-title">✅ ${PRAISE[Math.floor(Math.random() * PRAISE.length)]}</div>${res.note ? `<div class="fb-sub">${esc(res.note)}: <b>${esc(res.best)}</b></div>` : ''}${res.heard ? `<div class="fb-sub">Gehört: „${esc(res.heard)}“</div>` : ''}`;
    if (['pickImage', 'toTarget', 'typeTarget', 'buildTarget', 'typeSentence'].includes(ex.type)) say(main(ex.item[ex.lang]));
  } else {
    S.wrong++; S.combo = 0;
    if (!res.skipped) P.stats.wrong++;
    sfx.wrong();
    if (navigator.vibrate) navigator.vibrate(120);
    bar.classList.add('bad');
    const answer = res.best || correctAnswerText(ex);
    fb.innerHTML = `<div class="fb-title">${res.timeout ? '⏰ Zeit abgelaufen!' : res.skipped ? '⏭️ Übersprungen' : '❌ Leider falsch'}</div>
      <div class="fb-sub">Richtige Antwort: <b>${esc(answer)}</b> <button class="mini-say" id="fbsay">🔊</button></div>${res.heard ? `<div class="fb-sub">Gehört: „${esc(res.heard)}“</div>` : ''}`;
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
  btn.textContent = 'Weiter';
  btn.className = 'btn ' + (res.ok ? 'primary' : 'danger');
  store.save(P);
  if (S.timeLimit) { const t = setTimeout(advance, res.ok ? 450 : 1400); timers.push(t); }
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
  c.innerHTML = `🔥 ${S.combo}er-Combo!`;
  c.classList.remove('show'); void c.offsetWidth; c.classList.add('show');
  sfx.combo(S.combo);
}

function outOfHearts() {
  clearTimers();
  sfx.fail();
  $app.innerHTML = `<div class="screen center result">${mascot('sad', 140)}<h1>Keine Herzen mehr!</h1>
    <p class="muted">Keine Sorge – Fehler gehören zum Lernen dazu.</p>
    <button class="btn primary wide" id="refill" ${P.gems < store.HEART_REFILL_COST ? 'disabled' : ''}>❤️ Auffüllen & weitermachen (💎 ${store.HEART_REFILL_COST})</button>
    <button class="btn wide" id="practice">💪 Üben & Herz verdienen</button>
    <button class="btn ghost wide" id="home">Zur Startseite</button></div>`;
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
  window.speechSynthesis?.cancel();
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
      if (prog + 1 >= LESSONS_PER_UNIT) { gems += 20; P.stats.exams++; extras.push(`👑 Einheit „${UNITS[s.unit].title}“ gemeistert! +20 💎`); }
    }
    P.stats.lessons++;
  } else if (s.mode === 'turbo') {
    P.stats.bestTurbo = Math.max(P.stats.bestTurbo, s.correct);
    gems += Math.floor(s.correct / 5);
  } else {
    xp += 5;
    gems += 2;
    if (P.hearts < store.MAX_HEARTS) { P.hearts++; extras.push('❤️ +1 Herz verdient'); }
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
  const title = s.mode === 'turbo' ? `${s.correct} richtige in 60 s!` : s.exam ? 'Meisterprüfung bestanden!' : perfect ? 'Fehlerfrei!' : 'Lektion geschafft!';
  $app.innerHTML = `<div class="screen center result">
    <div class="bounce-in">${mascot('cheer', 150)}</div>
    <h1 class="pop-in">${title}</h1>
    <div class="result-cards">
      <div class="rcard xp"><small>XP</small><b id="xpcount">0</b></div>
      <div class="rcard acc"><small>${s.mode === 'turbo' ? 'Combo' : 'Genauigkeit'}</small><b>${s.mode === 'turbo' ? s.bestCombo : acc + '%'}</b></div>
      <div class="rcard time"><small>Zeit</small><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div>
    </div>
    <div class="extras">
      ${gems ? `<div class="extra">💎 +${gems} Perlen</div>` : ''}
      ${extras.map((e) => `<div class="extra">${esc(e)}</div>`).join('')}
      ${r.streakUp ? `<div class="extra streak-x">🔥 ${P.streak} ${P.streak === 1 ? 'Tag' : 'Tage'} Streak!</div>` : ''}
      ${r.goalReached ? '<div class="extra">🎯 Tagesziel erreicht! +10 💎</div>' : ''}
      ${r.levelUp ? `<div class="extra lvl">⬆️ Level ${P.level} erreicht!</div>` : ''}
      ${ach.map((a) => `<div class="extra ach-x">${a.icon} Erfolg: <b>${esc(a.name)}</b> +15 💎</div>`).join('')}
    </div>
    <button class="btn primary wide" id="cont">Weiter</button>
  </div>`;
  sfx.fanfare();
  confetti(perfect || s.exam ? 220 : 120);
  if (r.levelUp) setTimeout(() => sfx.levelUp(), 1200);
  // XP hochzählen
  let n = 0; const el = $('#xpcount');
  const step = Math.max(1, Math.round(xp / 30));
  const t = setInterval(() => { n = Math.min(xp, n + step); el.textContent = n; if (n >= xp) clearInterval(t); }, 30);
  timers.push(t);
  $('#cont').onclick = () => { tab = s.mode === 'lesson' ? 'learn' : 'practice'; renderHome(); };
}

// ========== Aufgaben-Renderer ==========
const T = (ex) => LANGS[ex.lang];
const speakerBtn = (text, l, big = false) => `<div class="speakers ${big ? 'big' : ''}"><button class="spk" data-spk="${esc(text)}" data-l="${l}">🔊</button><button class="spk slow" data-spk="${esc(text)}" data-l="${l}" data-slow="1">🐢</button></div>`;
function bindSpeakers(root) {
  $$('[data-spk]', root).forEach((b) => b.onclick = (e) => { e.stopPropagation(); b.classList.add('playing'); speak(b.dataset.spk, b.dataset.l, { slow: !!b.dataset.slow }).then(() => b.classList.remove('playing')); });
}
const header = (title, badge = '') => `<h2 class="ex-title">${badge}${title}</h2>`;
const newBadge = (ex) => (ex.item && store.itemState(P, ex.item.key).n === 0 ? '<span class="new-badge">NEUES WORT</span>' : '');

function choiceList(ex, box, options, labelOf, speakOf) {
  const grid = $('.choices', box);
  grid.innerHTML = options.map((o, i) => `<button class="choice" data-i="${i}"><span class="kbd">${i + 1}</span>${esc(labelOf(o))}</button>`).join('');
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
  $('.answer-area', box).innerHTML = `<textarea class="input type-in" rows="${ex.kind === 'sentence' ? 3 : 1}" placeholder="${placeholder}" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>
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
  ctrl.check = () => { inp.readOnly = true; return checkText(inp.value, answerStr); };
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
    if (ex.lang && answerStr !== ex.item.de) say(t.textContent);
    refresh();
  });
  ctrl.check = () => {
    const built = $$('.tile', line).map((x) => x.textContent).join(' ');
    return checkText(built, answerStr).ok ? { ok: true } : { ok: false, best: answerStr.split('|')[0] };
  };
}

const RENDER = {
  pickImage(ex, box) {
    box.innerHTML = `${header(`Welches davon ist „${esc(ex.item.de)}“?`, newBadge(ex))}<div class="img-grid"></div>`;
    const grid = $('.img-grid', box);
    let sel = null;
    grid.innerHTML = ex.options.map((o, i) => `<button class="img-card" data-i="${i}"><span class="kbd">${i + 1}</span><span class="emo">${o.e}</span><b>${esc(main(o[ex.lang]))}</b></button>`).join('');
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
    box.innerHTML = `${header(`Wie sagt man das auf ${T(ex).name}?`, newBadge(ex))}
      <div class="prompt-card">${S.d < 4 ? `<span class="emo-s">${ex.item.e}</span>` : ''}<span class="prompt-word">${esc(ex.item.de)}</span></div><div class="choices"></div>`;
    choiceList(ex, box, ex.options, (o) => main(o[ex.lang]), (o) => main(o[ex.lang]));
  },

  toNative(ex, box) {
    const w = main(ex.item[ex.lang]);
    box.innerHTML = `${header('Was bedeutet das?', newBadge(ex))}
      <div class="bubble-row">${mascot('think', 80)}<div class="bubble">${speakerBtn(w, ex.lang)}<span class="prompt-word">${esc(w)}</span></div></div><div class="choices"></div>`;
    bindSpeakers(box);
    choiceList(ex, box, ex.options, (o) => main(o.de));
    setTimeout(() => say(w), 300);
  },

  listenPick(ex, box) {
    const w = main(ex.item[ex.lang]);
    box.innerHTML = `${header('Was hörst du?')}${speakerBtn(w, ex.lang, true)}<div class="choices"></div>`;
    bindSpeakers(box);
    choiceList(ex, box, ex.options, (o) => main(o[ex.lang]));
    setTimeout(() => say(w), 300);
  },

  typeTarget(ex, box) {
    box.innerHTML = `${header(`Schreibe auf ${T(ex).name}`)}
      <div class="prompt-card">${S.d < 6 ? `<span class="emo-s">${ex.item.e}</span>` : ''}<span class="prompt-word">${esc(ex.item.de)}</span></div><div class="answer-area"></div>`;
    textInput(ex, box, ex.item[ex.lang], `Auf ${T(ex).name} …`);
  },

  listenType(ex, box) {
    const w = main(ex.item[ex.lang]);
    box.innerHTML = `${header('Schreibe, was du hörst')}${speakerBtn(w, ex.lang, true)}<div class="answer-area"></div>`;
    bindSpeakers(box);
    textInput(ex, box, ex.item[ex.lang], `Auf ${T(ex).name} …`);
    setTimeout(() => say(w), 300);
  },

  buildTarget(ex, box) {
    box.innerHTML = `${header('Übersetze diesen Satz')}
      <div class="bubble-row">${mascot('happy', 80)}<div class="bubble"><span class="prompt-sent">${esc(ex.item.de)}</span></div></div><div class="answer-area"></div>`;
    tileBuilder(ex, box, ex.item[ex.lang]);
  },

  buildNative(ex, box) {
    const s = main(ex.item[ex.lang]);
    box.innerHTML = `${header('Übersetze ins Deutsche')}
      <div class="bubble-row">${mascot('think', 80)}<div class="bubble">${speakerBtn(s, ex.lang)}<span class="prompt-sent">${esc(s)}</span></div></div><div class="answer-area"></div>`;
    bindSpeakers(box);
    tileBuilder(ex, box, ex.item.de);
    setTimeout(() => say(s), 300);
  },

  listenBuild(ex, box) {
    const s = main(ex.item[ex.lang]);
    box.innerHTML = `${header('Tippe, was du hörst')}${speakerBtn(s, ex.lang, true)}<div class="answer-area"></div>`;
    bindSpeakers(box);
    tileBuilder(ex, box, ex.item[ex.lang]);
    setTimeout(() => say(s), 300);
  },

  typeSentence(ex, box) {
    box.innerHTML = `${header(`Schreibe auf ${T(ex).name}`)}
      <div class="bubble-row">${mascot('happy', 80)}<div class="bubble"><span class="prompt-sent">${esc(ex.item.de)}</span></div></div><div class="answer-area"></div>`;
    textInput(ex, box, ex.item[ex.lang], `Übersetzung auf ${T(ex).name} …`);
  },

  speak(ex, box) {
    const s = main(ex.item[ex.lang]);
    box.innerHTML = `${header('Sprich diesen Satz')}
      <div class="bubble-row">${mascot('happy', 80)}<div class="bubble">${speakerBtn(s, ex.lang)}<span class="prompt-sent">${esc(s)}</span><small class="muted">${esc(ex.item.de)}</small></div></div>
      <button class="mic" id="mic"><span>🎤</span><b>Zum Sprechen tippen</b></button>
      <div class="heard muted" id="heard"></div>
      <button class="link" id="nospeak">Ich kann gerade nicht sprechen</button>`;
    bindSpeakers(box);
    const mic = $('#mic', box);
    let busy = false;
    mic.onclick = async () => {
      if (busy || ctrl.answered) return;
      busy = true;
      window.speechSynthesis?.cancel();
      mic.classList.add('rec'); $('b', mic).textContent = 'Ich höre zu …';
      try {
        const res = await listen(ex.lang);
        mic.classList.remove('rec'); $('b', mic).textContent = 'Nochmal versuchen';
        busy = false;
        if (!res.length) { $('#heard', box).textContent = 'Ich habe nichts gehört – versuch es nochmal.'; return; }
        const scored = res.map((h) => [h, similarity(h, ex.item[ex.lang])]).sort((a, b) => b[1] - a[1]);
        const [heard, sc] = scored[0];
        $('#heard', box).textContent = `Gehört: „${heard}“`;
        const need = ex.kind === 'word' ? 0.7 : 0.72;
        if (sc >= need) submit({ ok: true, heard });
        else {
          ctrl.tries = (ctrl.tries || 0) + 1;
          if (ctrl.tries >= 2) submit({ ok: false, heard, best: s });
          else { mic.classList.add('shake'); sfx.wrong(); setTimeout(() => mic.classList.remove('shake'), 500); toast('Fast! Versuch es noch einmal 🙂'); }
        }
      } catch (e) {
        busy = false;
        mic.classList.remove('rec'); $('b', mic).textContent = 'Zum Sprechen tippen';
        toast(e.message === 'not-allowed' ? '🎤 Mikrofon-Zugriff wurde verweigert.' : '🎤 Spracherkennung nicht verfügbar.');
        if (e.message === 'not-allowed') { pauseSpeaking(60); skipSpeak(ex); }
      }
    };
    $('#nospeak', box).onclick = () => { pauseSpeaking(15); toast('Okay – 15 Minuten keine Sprechaufgaben.'); skipSpeak(ex); };
  },

  match(ex, box) {
    box.innerHTML = `${header('Finde die Paare')}<div class="match-grid"><div class="col" id="left"></div><div class="col" id="right"></div></div>`;
    $('#left', box).innerHTML = ex.left.map((o) => `<button class="mt" data-k="${o.key}" data-side="l">${esc(o.de)}</button>`).join('');
    $('#right', box).innerHTML = ex.right.map((o) => `<button class="mt" data-k="${o.key}" data-side="r">${esc(main(o[ex.lang]))}</button>`).join('');
    let sel = null; let matched = 0; let mistakes = 0;
    $$('.mt', box).forEach((b) => b.onclick = () => {
      if (b.classList.contains('done')) return;
      if (b.dataset.side === 'r') say(b.textContent);
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
  const last = store.lastProfileName();
  if (last) {
    const p = await store.loadProfile(last);
    if (p) { P = p; return afterLogin(); }
  }
  renderProfiles();
})();

// Für Debugging in der Konsole
window.lingopingo = { get profile() { return P; }, get session() { return S; }, norm, tokens, shuffle, highestUnit };

// Einmal pro Sitzung warnen, wenn das Gerät keine Stimme für die Lernsprache hat
let voiceWarned = false;
function warnMissingVoice() {
  if (voiceWarned || !ttsSupported() || !P.settings.tts) return;
  ensureVoices().then(() => {
    if (voiceWarned || hasVoice(lang())) return;
    voiceWarned = true;
    toast(`🔈 Auf diesem Gerät ist keine ${L().name}-Stimme installiert – die Aussprache klingt deshalb falsch.<br><small>Android: Einstellungen → Text-in-Sprache → Sprachdaten installieren → ${L().name}. iPhone: Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen.</small>`, 9000);
  });
}
