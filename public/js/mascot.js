// Pingo, der Pinguin – als SVG mit Stimmungen: happy, sad, think, cheer, sleep
// In 18+ mode he turns into "Bad Pingo": sunglasses, devil horns, smirk, no blush.
let bad = false;
export function setMascotStyle(style) { bad = style === 'bad'; }

const SHADES = '<path d="M38 46 h44 v4 h-2 q-1 10 -11 10 q-8 0 -9 -8 h-2 q-1 8 -9 8 q-10 0 -11 -10 h-2z" fill="#111"/><path d="M43 50 l6 -2 M65 50 l6 -2" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>';

function badMascot(mood, size) {
  const eyes = mood === 'sleep'
    ? '<path d="M44 53 q6 4 12 0" class="pg-eyel"/><path d="M64 53 q6 4 12 0" class="pg-eyel"/>'
    : mood === 'sad'
      ? '<circle cx="50" cy="53" r="4.5" fill="#1b1b1b"/><circle cx="70" cy="53" r="4.5" fill="#1b1b1b"/><path d="M42 42 l14 7 M78 42 l-14 7" stroke="#1b1b1b" stroke-width="3.5" stroke-linecap="round"/>'
      : SHADES;
  const mouth = mood === 'sad'
    ? '<path d="M53 69 q7 -6 14 0" fill="none" stroke="#e07a00" stroke-width="3" stroke-linecap="round"/>'
    : '<path d="M52 64 q10 7 18 -3 q-8 1 -18 3z" fill="#ff9f1c" stroke="#e07a00" stroke-width="2"/>';
  const arms = mood === 'cheer'
    ? '<path d="M24 76 q-14 -18 -8 -34 q10 10 14 28z" fill="#1c1c24"/><path d="M96 76 q14 -18 8 -34 q-10 10 -14 28z" fill="#1c1c24"/>'
    : '<path d="M24 74 q-12 10 -8 30 q10 -8 12 -22z" fill="#1c1c24"/><path d="M96 74 q12 10 8 30 q-10 -8 -12 -22z" fill="#1c1c24"/>';
  const extra = mood === 'sleep' ? '<text x="88" y="26" font-size="16" font-weight="900" fill="#ff2d6f">z</text><text x="98" y="14" font-size="11" font-weight="900" fill="#ff2d6f">z</text>' : '';
  return `<svg class="mascot bad mood-${mood}" width="${size}" height="${size}" viewBox="0 0 120 130" aria-hidden="true">
    <ellipse cx="60" cy="124" rx="34" ry="5" fill="rgba(0,0,0,.25)"/>
    <g class="pg-body">
      ${arms}
      <path d="M34 34 q-8 -14 -4 -30 q8 12 16 20z" fill="#e0115f" stroke="#9e0040" stroke-width="2"/>
      <path d="M86 34 q8 -14 4 -30 q-8 12 -16 20z" fill="#e0115f" stroke="#9e0040" stroke-width="2"/>
      <ellipse cx="60" cy="74" rx="38" ry="46" fill="#1c1c24"/>
      <ellipse cx="60" cy="84" rx="27" ry="34" fill="#f2f2f2"/>
      <ellipse cx="60" cy="52" rx="28" ry="22" fill="#f2f2f2"/>
      ${eyes}${mouth}
      <path d="M48 96 l5 -6 l5 6 l5 -6 l5 6" fill="none" stroke="#e0115f" stroke-width="2.5" stroke-linejoin="round" opacity=".8"/>
      <path d="M104 98 q12 2 10 14 q-2 -6 -8 -6z" fill="#e0115f"/>
      <ellipse cx="46" cy="120" rx="11" ry="5" fill="#ff9f1c"/>
      <ellipse cx="74" cy="120" rx="11" ry="5" fill="#ff9f1c"/>
    </g>${extra}
  </svg>`;
}

export function mascot(mood = 'happy', size = 120) {
  if (bad) return badMascot(mood, size);
  const eyes = {
    happy: '<path d="M44 52 q6 -7 12 0" class="pg-eyel"/><path d="M64 52 q6 -7 12 0" class="pg-eyel"/>',
    cheer: '<path d="M44 52 q6 -8 12 0" class="pg-eyel"/><path d="M64 52 q6 -8 12 0" class="pg-eyel"/>',
    sad: '<circle cx="50" cy="52" r="4.5" fill="#1b1b1b"/><circle cx="70" cy="52" r="4.5" fill="#1b1b1b"/><path d="M43 44 l12 4 M77 44 l-12 4" stroke="#1b1b1b" stroke-width="3" stroke-linecap="round"/><path d="M76 60 q2 8 0 10 q-3 -2 0 -10z" fill="#7cc7ff"/>',
    think: '<circle cx="50" cy="51" r="5" fill="#1b1b1b"/><circle cx="70" cy="51" r="5" fill="#1b1b1b"/><circle cx="52" cy="49" r="1.6" fill="#fff"/><circle cx="72" cy="49" r="1.6" fill="#fff"/>',
    sleep: '<path d="M44 53 q6 4 12 0" class="pg-eyel"/><path d="M64 53 q6 4 12 0" class="pg-eyel"/>',
  }[mood] || '';
  const mouth = mood === 'sad'
    ? '<path d="M54 68 q6 -5 12 0" fill="#ff9f1c" stroke="#e07a00" stroke-width="2"/>'
    : '<path d="M52 62 q8 12 16 0 q-8 -4 -16 0z" fill="#ff9f1c" stroke="#e07a00" stroke-width="2"/>';
  const arms = mood === 'cheer'
    ? '<path d="M24 76 q-14 -18 -8 -34 q10 10 14 28z" fill="#2d3a4a"/><path d="M96 76 q14 -18 8 -34 q-10 10 -14 28z" fill="#2d3a4a"/>'
    : '<path d="M24 74 q-12 10 -8 30 q10 -8 12 -22z" fill="#2d3a4a"/><path d="M96 74 q12 10 8 30 q-10 -8 -12 -22z" fill="#2d3a4a"/>';
  const extra = mood === 'sleep' ? '<text x="88" y="26" font-size="16" font-weight="900" fill="#7a8ca5">z</text><text x="98" y="14" font-size="11" font-weight="900" fill="#7a8ca5">z</text>' : '';
  return `<svg class="mascot mood-${mood}" width="${size}" height="${size}" viewBox="0 0 120 130" aria-hidden="true">
    <ellipse cx="60" cy="124" rx="34" ry="5" fill="rgba(0,0,0,.12)"/>
    <g class="pg-body">
      ${arms}
      <ellipse cx="60" cy="74" rx="38" ry="46" fill="#2d3a4a"/>
      <ellipse cx="60" cy="84" rx="27" ry="34" fill="#fff"/>
      <ellipse cx="60" cy="52" rx="28" ry="22" fill="#fff"/>
      <circle cx="40" cy="64" r="6" fill="#ffb3c7" opacity=".7"/>
      <circle cx="80" cy="64" r="6" fill="#ffb3c7" opacity=".7"/>
      ${eyes}${mouth}
      <path d="M30 22 q30 -26 60 0 q-30 -8 -60 0z" fill="#58cc02"/>
      <circle cx="60" cy="8" r="6" fill="#ffc800"/>
      <ellipse cx="46" cy="120" rx="11" ry="5" fill="#ff9f1c"/>
      <ellipse cx="74" cy="120" rx="11" ry="5" fill="#ff9f1c"/>
    </g>${extra}
  </svg>`;
}
