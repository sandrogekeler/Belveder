/* Sections from the Belveder plan ("What the app shows"). All rows are sample data. */
const SECTIONS = {
  overview: { name: 'Overview', hue: '#e9e6df' },
  issues:   { name: 'Issues', hue: '#d4a07f' },
  roadmap:  { name: 'Roadmap', hue: '#c9b38a' },
  drift:    { name: 'Template', hue: '#b3a6c9' },
  prs:      { name: 'Pull requests', hue: '#9cc2a0' },
  ci:       { name: 'Main', hue: '#c99a93' },
  health:   { name: 'Health', hue: '#8cc7b8' },
};
const REPOS = ['kompass', 'capsa', 'laterna', 'allesklar', 'belveder', 'sandrogekeler.github.io'];
const DATA = {
  issues: [
    ['p0', 'kompass', 'Pie closes on the second press'],
    ['p1', 'capsa', 'Thumbnails skip multi-part EXRs'],
    ['p1', 'sandrogekeler.github.io', 'Glass stutters on overlapping clicks'],
    ['p2', 'laterna', 'Read husk progress from the log'],
    ['p2', 'belveder', 'Split the nightly backfill into batches'],
    ['p3', 'allesklar', 'Page on Durable Objects'],
    [null, 'capsa', 'Drop folders onto the window'],
  ],
  prs: [
    ['kompass', 'Draw missing tools as disabled', 'pass'],
    ['sandrogekeler.github.io', 'Split glass on page change', 'fail'],
    ['capsa', 'Store image size in the index', 'run'],
  ],
  ci: { kompass: 'pass', capsa: 'pass', laterna: 'pass', allesklar: 'pass', belveder: 'run', 'sandrogekeler.github.io': 'fail' },
  roadmap: {
    Now: [['belveder', 'Webhooks in'], ['capsa', 'First window'], ['laterna', 'Read husk logs']],
    Next: [['belveder', 'App shell'], ['capsa', 'USD previews'], ['kompass', 'Import pies']],
    Later: [['belveder', 'Notifications'], ['sandrogekeler.github.io', 'Deploy to Cloudflare']],
  },
  health: { kompass: 0, capsa: 1, laterna: 0, allesklar: 0, belveder: 2, 'sandrogekeler.github.io': 0 },
  drift: { kompass: '0.6.0', capsa: '0.6.0', laterna: '0.6.0', allesklar: '0.6.0', belveder: '0.5.0', 'sandrogekeler.github.io': '0.6.0' },
  latest: '0.6.0',
};
const STATE = { pass: 'Passing', fail: 'Failing', run: 'Running' };

function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function panelHTML(id, repo) {
  const on = (r) => !repo || r === repo;
  const repoCell = (r) => (repo ? '' : `<span class="repo">${esc(r)}</span>`);
  const empty = '<p class="empty">Nothing here.</p>';
  const row = (lead, title, r) => `<li><span class="lead">${lead}</span><span class="t">${esc(title)}</span>${repoCell(r)}</li>`;
  const state = (s) => `<span class="st ${s}">${STATE[s]}</span>`;
  if (id === 'overview') {
    const iss = DATA.issues.filter((i) => on(i[1]));
    const tiles = [
      ['issues', iss.filter((i) => i[0] === 'p0').length, 'p0 open'],
      ['prs', DATA.prs.filter((p) => on(p[0])).length, 'PRs waiting'],
      ['ci', Object.entries(DATA.ci).filter(([r, s]) => on(r) && s === 'fail').length, 'Red main'],
      ['health', Object.entries(DATA.health).filter(([r]) => on(r)).reduce((a, [, n]) => a + n, 0), 'Health issues'],
      ['drift', Object.entries(DATA.drift).filter(([r, v]) => on(r) && v !== DATA.latest).length, 'Behind template'],
      ['roadmap', DATA.roadmap.Now.filter((i) => on(i[0])).length, 'Roadmap now'],
    ];
    return `<div class="tiles">${tiles.map(([go, n, l]) => `<button class="tile${n && (go === 'issues' || go === 'ci') ? ' hot' : ''}" data-go="${go}"><b>${n}</b><span>${l}</span></button>`).join('')}</div>`;
  }
  if (id === 'issues') {
    const l = DATA.issues.filter((i) => on(i[1]));
    return l.length ? `<ul class="rows">${l.map((i) => row(`<span class="pri ${i[0] || 'none'}">${i[0] || 'none'}</span>`, i[2], i[1])).join('')}</ul>` : empty;
  }
  if (id === 'prs') {
    const l = DATA.prs.filter((p) => on(p[0]));
    return l.length ? `<ul class="rows">${l.map((p) => row(state(p[2]), p[1], p[0])).join('')}</ul>` : empty;
  }
  if (id === 'ci') {
    return `<ul class="rows">${Object.entries(DATA.ci).filter(([r]) => on(r)).map(([r, s]) => `<li><span class="lead">${state(s)}</span><span class="t">${esc(r)}</span></li>`).join('')}</ul>`;
  }
  if (id === 'roadmap') {
    return `<div class="cols">${Object.entries(DATA.roadmap).map(([k, l]) => { const f = l.filter((i) => on(i[0])); return `<div><h3>${k}</h3>${f.length ? `<ul>${f.map((i) => `<li>${esc(i[1])}${repoCell(i[0])}</li>`).join('')}</ul>` : empty}</div>`; }).join('')}</div>`;
  }
  if (id === 'health') {
    return `<ul class="rows">${Object.entries(DATA.health).filter(([r]) => on(r)).map(([r, n]) => `<li><span class="lead"><span class="st ${n ? 'fail' : 'pass'}">${n ? n + ' open' : 'Clear'}</span></span><span class="t">${esc(r)}</span><span class="repo">Mon 10:00</span></li>`).join('')}</ul>`;
  }
  if (id === 'drift') {
    return `<ul class="rows">${Object.entries(DATA.drift).filter(([r]) => on(r)).map(([r, v]) => `<li><span class="lead"><span class="st ${v === DATA.latest ? 'pass' : 'run'}">v${v}</span></span><span class="t">${esc(r)}</span><span class="repo">${v === DATA.latest ? 'Current' : 'Latest v' + DATA.latest}</span></li>`).join('')}</ul>`;
  }
  return '';
}

const PANEL_CSS = `
.tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line)}
.tile{all:unset;cursor:pointer;background:var(--bg);padding:14px 16px;display:grid;gap:2px}
.tile b{font:600 32px/1 var(--display);font-variant-numeric:tabular-nums}
.tile span{color:var(--muted);font-size:13px}
.tile.hot b{color:#e38a7a}
.tile:hover{background:var(--panel)}
.tile:focus-visible{outline:2px solid var(--fg);outline-offset:-2px}
.rows{list-style:none;margin:0;padding:0}
.rows li{display:grid;grid-template-columns:5.4em minmax(0,1fr);gap:2px 12px;padding:10px 0;border-bottom:1px solid var(--line);align-items:baseline}
.rows .lead{justify-self:start}
.rows .repo{grid-column:2;color:var(--dim);font-size:13px;overflow-wrap:anywhere}
.rows .t{min-width:0;overflow-wrap:anywhere}
.pri,.st{display:inline-block;font-size:12px;border:1px solid var(--line);border-radius:4px;padding:0 6px;font-variant-numeric:tabular-nums;white-space:nowrap}
.pri.p0,.st.fail{color:#e38a7a;border-color:#e38a7a66}
.pri.p1,.st.run{color:#e3a35f;border-color:#e3a35f66}
.pri.p2{color:var(--fg)}
.pri.p3,.pri.none{color:var(--dim)}
.st.pass{color:#8cc79a;border-color:#8cc79a66}
.cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.cols h3{font:600 14px var(--display);margin:0 0 8px;color:var(--muted)}
.cols ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.cols li{display:grid;font-size:14px;min-width:0;overflow-wrap:anywhere}
.cols .repo{color:var(--dim);font-size:12px}
.empty{color:var(--dim);margin:0}
`;

/* Local projects (plan section "Local projects"): the folders in D:\Private\Projects are the types.
   Röntgen uses these; project names, machines and times are sample data. */
const MACHINES = { pc: 'PC', imac: 'iMac', rocky: 'Rocky' };
const OFFLINE = ['rocky'];
const TYPES = [
  { id: 'Recording', name: 'Recording', hue: '#c99a93' },
  { id: 'DJ', name: 'DJ', hue: '#b3a6c9' },
  { id: 'MusicProduction', name: 'Music production', hue: '#d4a07f' },
  { id: 'SoftwareDevelopment', name: 'Software', hue: '#e9e6df' },
  { id: '3D', name: '3D', hue: '#9cc2a0' },
  { id: 'GameDevelopment', name: 'Game development', hue: '#c9b38a' },
  { id: 'Videogames', name: 'Videogames', hue: '#8cc7b8' },
];
const PROGRAMS = { hip: 'Houdini', blend: 'Blender', tracktionedit: 'Waveform', uproject: 'Unreal', rpp: 'Reaper' };
// [type, name, machine, main file type, hours since change, own GitHub repo]
const PROJECTS = [
  ['SoftwareDevelopment', 'belveder', 'pc', null, 2, 'belveder'],
  ['SoftwareDevelopment', 'sandrogekeler.github.io', 'pc', null, 3, 'sandrogekeler.github.io'],
  ['SoftwareDevelopment', 'kompass', 'pc', null, 5, 'kompass'],
  ['SoftwareDevelopment', 'capsa', 'pc', null, 26, 'capsa'],
  ['SoftwareDevelopment', 'allesklar', 'pc', null, 30, 'allesklar'],
  ['SoftwareDevelopment', 'laterna', 'imac', null, 50, 'laterna'],
  ['SoftwareDevelopment', 'llama.cpp', 'rocky', null, 400, null],
  ['SoftwareDevelopment', 'armorpaint', 'pc', null, 700, null],
  ['SoftwareDevelopment', 'mcgen', 'pc', null, 900, null],
  ['3D', 'Hybris', 'pc', 'hip', 120, null],
  ['3D', 'Vialo', 'pc', 'hip', 300, null],
  ['3D', 'Stellar', 'imac', 'blend', 800, null],
  ['3D', "Q'Essenz", 'pc', 'hip', 1500, null],
  ['GameDevelopment', 'Glass hall', 'pc', 'uproject', 200, null],
  ['GameDevelopment', 'Lantern maze', 'rocky', 'uproject', 1100, null],
  ['MusicProduction', 'Night drive', 'pc', 'tracktionedit', 10, null],
  ['MusicProduction', 'Sketch 14', 'imac', 'tracktionedit', 72, null],
  ['MusicProduction', 'Remix pack', 'pc', 'tracktionedit', 600, null],
  ['DJ', 'Set November', 'pc', null, 40, null],
  ['DJ', 'Warm-up edits', 'pc', null, 500, null],
  ['Recording', 'Podcast pilot', 'pc', 'rpp', 300, null],
  ['Recording', 'Room tones', 'imac', null, 1000, null],
  ['Videogames', 'Mods', 'pc', null, 90, null],
  ['Videogames', 'Saves', 'rocky', null, 2000, null],
].map(([type, name, machine, ext, hours, repo]) => ({ type, name, machine, ext, hours, repo }));
const ago = (h) => (h < 24 ? `${h} h` : h < 24 * 14 ? `${Math.round(h / 24)} d` : `${Math.round(h / 168)} wk`);
// Sample filler: a long Software folder, to show the archive cabinet a busy room gets.
['shader-notes', 'usd-scratch', 'pbr-tests', 'karma-presets', 'hda-library', 'vex-snippets', 'render-farm', 'obs-scenes', 'dotfiles', 'home-server', 'mc-mods', 'tiny-raytracer', 'gltf-viewer', 'ocio-configs', 'exr-tools', 'ffmpeg-scripts', 'cv-site', 'invoice-gen', 'photo-sorter', 'midi-bridge', 'osc-tools', 'lut-builder', 'turntable-rig', 'cache-cleaner', 'scene-linter', 'asset-tags', 'wedge-runner', 'flipbook', 'deadline-tests', 'noise-lab', 'mesh-utils', 'hotkeys'].forEach((name, i) =>
  PROJECTS.push({ type: 'SoftwareDevelopment', name, machine: i % 6 === 2 ? 'imac' : i % 9 === 4 ? 'rocky' : 'pc', ext: null, hours: 1100 + i * 190, repo: null }));
