import './style.css';
import { CATEGORIES, MODULES, PROFILE_PRESETS } from './modules.js';

const state = {
  enabled: new Set(),
  selectedId: null,
  category: 'combat',
  query: '',
  settings: Object.fromEntries(
    MODULES.map((m) => [
      m.id,
      Object.fromEntries((m.settings || []).map((s) => [s.key, s.value])),
    ])
  ),
};

const OP_IDS = new Set([
  'killaura', 'autocrystal', 'godmode', 'fly', 'xray', 'packetfly',
  'disabler', 'goditems', 'nuker', 'worldEater', 'nuker2', 'phase', 'console',
]);

const $ = (sel) => document.querySelector(sel);

/* ─── BOOT SEQUENCE ─── */
async function runBoot() {
  const lines = [
    'Mounting NEXUS kernel…',
    'Patching Fabric mappings 1.21.x…',
    'Loading 80+ domination modules…',
    'Calibrating silent rotations…',
    'Injecting render pipeline…',
    'AntiCheat camouflage online…',
    'Protocol Ω ready.',
  ];
  const fill = $('#boot-fill');
  const log = $('#boot-log');
  for (let i = 0; i < lines.length; i++) {
    log.textContent = lines[i];
    fill.style.width = `${((i + 1) / lines.length) * 100}%`;
    await wait(180 + Math.random() * 120);
  }
  await wait(250);
  $('#boot').classList.add('hidden');
  $('#app').classList.remove('hidden');
  applyProfile('RAGE');
  startCanvas();
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ─── BACKGROUND CANVAS ─── */
function startCanvas() {
  const canvas = $('#bg-canvas');
  const ctx = canvas.getContext('2d');
  const particles = [];
  const resize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  };
  resize();
  addEventListener('resize', resize);

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      v: 0.3 + Math.random() * 1.2,
      s: 1 + Math.random() * 2,
      a: 0.15 + Math.random() * 0.45,
    });
  }

  let t = 0;
  const draw = () => {
    t += 0.01;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // grid
    ctx.strokeStyle = 'rgba(46,255,106,0.04)';
    ctx.lineWidth = 1;
    const gap = 48;
    const ox = (t * 12) % gap;
    for (let x = -gap + ox; x < canvas.width; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // vignette sweep
    const g = ctx.createRadialGradient(
      canvas.width * 0.7,
      canvas.height * 0.2,
      40,
      canvas.width * 0.5,
      canvas.height * 0.5,
      canvas.width * 0.7
    );
    g.addColorStop(0, 'rgba(46,255,106,0.07)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.y -= p.v;
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      ctx.fillStyle = `rgba(46,255,106,${p.a})`;
      ctx.fillRect(p.x, p.y, p.s, p.s * 3);
    }
    requestAnimationFrame(draw);
  };
  draw();
}

/* ─── NAV / RENDER ─── */
function buildNav() {
  const nav = $('#cat-nav');
  nav.innerHTML = '';
  for (const cat of CATEGORIES) {
    const count = MODULES.filter((m) => m.cat === cat.id).length;
    const btn = document.createElement('button');
    btn.className = `cat-btn${state.category === cat.id ? ' active' : ''}`;
    btn.dataset.cat = cat.id;
    btn.innerHTML = `<span>${cat.name}</span><em>${count}</em>`;
    btn.addEventListener('click', () => {
      state.category = cat.id;
      state.query = '';
      $('#search').value = '';
      buildNav();
      renderModules();
    });
    nav.appendChild(btn);
  }
}

function filteredModules() {
  const q = state.query.trim().toLowerCase();
  return MODULES.filter((m) => {
    if (q) {
      return (
        m.name.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.cat.includes(q)
      );
    }
    return m.cat === state.category;
  });
}

function renderModules() {
  const cat = CATEGORIES.find((c) => c.id === state.category);
  const mods = filteredModules();

  if (state.query) {
    $('#cat-title').textContent = `Search`;
    $('#cat-desc').textContent = `${mods.length} modules matched “${state.query}”`;
  } else {
    $('#cat-title').textContent = cat.name;
    $('#cat-desc').textContent = cat.desc;
  }

  const grid = $('#module-grid');
  grid.innerHTML = '';
  mods.forEach((m, i) => {
    const on = state.enabled.has(m.id);
    const card = document.createElement('article');
    card.className = `mod-card${on ? ' on' : ''}${state.selectedId === m.id ? ' selected' : ''}${OP_IDS.has(m.id) ? ' rare' : ''}`;
    card.style.animationDelay = `${Math.min(i, 20) * 0.03}s`;
    card.innerHTML = `
      <div class="mod-top">
        <div class="mod-name">${m.name}</div>
        <div class="mod-bind">${m.bind}</div>
      </div>
      <p class="mod-desc">${m.desc}</p>
      <div class="mod-foot">
        <span class="mod-cat">${m.cat}</span>
        <button class="toggle" aria-pressed="${on}" data-toggle="${m.id}"><i></i></button>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-toggle]')) return;
      state.selectedId = m.id;
      renderModules();
      renderInspector();
    });
    card.querySelector('[data-toggle]').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleModule(m.id);
    });
    grid.appendChild(card);
  });

  updateStats();
}

function toggleModule(id, force) {
  const on = force !== undefined ? force : !state.enabled.has(id);
  if (on) state.enabled.add(id);
  else state.enabled.delete(id);
  if (state.selectedId === id) renderInspector();
  renderModules();
  flashStatus(on ? 'MODULE ONLINE' : 'MODULE OFFLINE');
}

function updateStats() {
  $('#stat-enabled').textContent = state.enabled.size;
  $('#stat-total').textContent = MODULES.length;
  $('#stat-profile').textContent = $('#profile-select').value;
}

function flashStatus(text) {
  const el = $('#stat-status');
  el.textContent = text;
  clearTimeout(flashStatus._t);
  flashStatus._t = setTimeout(() => {
    el.textContent = state.enabled.size ? 'ARMED' : 'IDLE';
  }, 900);
}

/* ─── INSPECTOR ─── */
function renderInspector() {
  const empty = $('#inspector-empty');
  const body = $('#inspector-body');
  const mod = MODULES.find((m) => m.id === state.selectedId);
  if (!mod) {
    empty.classList.remove('hidden');
    body.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  body.classList.remove('hidden');

  const on = state.enabled.has(mod.id);
  $('#insp-name').textContent = mod.name;
  $('#insp-desc').textContent = mod.desc;
  $('#insp-bind').textContent = mod.bind;
  $('#insp-cat').textContent = mod.cat;
  const tog = $('#insp-toggle');
  tog.setAttribute('aria-pressed', String(on));
  tog.onclick = () => toggleModule(mod.id);

  const wrap = $('#insp-settings');
  wrap.innerHTML = '';
  if (!mod.settings?.length) {
    wrap.innerHTML = `<p style="color:var(--muted);font-size:0.9rem">No tunables — pure chaos mode.</p>`;
    return;
  }

  for (const s of mod.settings) {
    const val = state.settings[mod.id][s.key];
    const row = document.createElement('div');
    row.className = 'setting';

    if (s.type === 'slider') {
      row.innerHTML = `
        <div class="setting-row"><span>${s.label}</span><span class="setting-val">${val}${s.unit || ''}</span></div>
        <input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${val}" />
      `;
      const input = row.querySelector('input');
      const label = row.querySelector('.setting-val');
      input.addEventListener('input', () => {
        state.settings[mod.id][s.key] = Number(input.value);
        label.textContent = `${input.value}${s.unit || ''}`;
      });
    } else if (s.type === 'select') {
      row.innerHTML = `
        <div class="setting-row"><span>${s.label}</span></div>
        <select>${s.options.map((o) => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('')}</select>
      `;
      row.querySelector('select').addEventListener('change', (e) => {
        state.settings[mod.id][s.key] = e.target.value;
      });
    } else if (s.type === 'toggle') {
      row.innerHTML = `
        <div class="mini-toggle">
          <span>${s.label}</span>
          <button class="toggle" aria-pressed="${val}"><i></i></button>
        </div>
      `;
      const btn = row.querySelector('.toggle');
      btn.addEventListener('click', () => {
        const next = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', String(next));
        state.settings[mod.id][s.key] = next;
      });
    }
    wrap.appendChild(row);
  }
}

/* ─── PROFILES ─── */
function applyProfile(name) {
  const preset = PROFILE_PRESETS[name];
  state.enabled.clear();
  if (preset.enable === 'ALL') {
    MODULES.forEach((m) => state.enabled.add(m.id));
  } else {
    preset.enable.forEach((id) => state.enabled.add(id));
  }
  $('#profile-select').value = name;
  renderModules();
  renderInspector();
  flashStatus(`PROFILE ${name}`);
}

/* ─── LAUNCH SEQUENCE ─── */
async function runLaunch() {
  const overlay = $('#launch-overlay');
  const log = $('#launch-log');
  const title = $('#launch-title');
  const close = $('#launch-close');
  overlay.classList.remove('hidden');
  close.classList.add('hidden');
  log.innerHTML = '';
  title.textContent = 'INJECTING NEXUS CORE';

  const enabled = [...state.enabled];
  const steps = [
    { t: 'Locating Minecraft JVM…', c: 'ok' },
    { t: 'Attaching instrumentation agent…', c: 'ok' },
    { t: 'Bypassing classloader sandbox…', c: 'ok' },
    { t: `Mapping ${MODULES.length} module hooks…`, c: 'ok' },
    { t: `Enabling ${enabled.length} active modules…`, c: 'ok' },
    ...enabled.slice(0, 12).map((id) => {
      const m = MODULES.find((x) => x.id === id);
      return { t: `  → ${m.name} ONLINE`, c: 'ok' };
    }),
    enabled.length > 12
      ? { t: `  → +${enabled.length - 12} more modules hot-loaded`, c: 'warn' }
      : null,
    { t: 'Silent rotation solver: LOCKED', c: 'ok' },
    { t: 'Render ESP pipeline: LIVE', c: 'ok' },
    { t: 'WARNING: This is a UI showcase / fantasy launcher.', c: 'warn' },
    { t: 'No real game process was modified.', c: 'warn' },
    { t: 'NEXUS CLIENT — READY FOR DOMINATION', c: 'ok' },
  ].filter(Boolean);

  for (const step of steps) {
    const line = document.createElement('div');
    line.className = step.c;
    line.textContent = `> ${step.t}`;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    await wait(90 + Math.random() * 80);
  }

  title.textContent = 'NEXUS ONLINE';
  close.classList.remove('hidden');
  flashStatus('INJECTED');
}

/* ─── TICKER ─── */
function buildTicker() {
  const items = [
    'NEXUS Ω PROTOCOL',
    `${MODULES.length} MODULES LOADED`,
    'KILL AURA · AUTO CRYSTAL · PACKET FLY · XRAY · GODMODE',
    'PROFILE SYSTEM ARMED',
    'FABRIC 1.21+ COMPAT LAYER',
    'DOMINATION MODE AVAILABLE',
    'PANIC KEY READY',
    'NOT A REAL INJECTOR — SHOWCASE LAUNCHER',
    ...MODULES.filter((m) => OP_IDS.has(m.id)).map((m) => m.name.toUpperCase()),
  ];
  $('#ticker-track').textContent = items.join('   ◆   ') + '   ◆   ';
}

/* ─── WIRE UP ─── */
function init() {
  buildNav();
  buildTicker();
  renderModules();
  renderInspector();

  $('#search').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderModules();
  });
  $('#search').addEventListener('keyup', (e) => {
    state.query = e.target.value;
    renderModules();
  });

  $('#profile-select').addEventListener('change', (e) => {
    applyProfile(e.target.value);
  });

  const panic = () => {
    state.enabled.clear();
    renderModules();
    renderInspector();
    flashStatus('PANIC CLEAR');
  };

  $('#btn-panic').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    panic();
  });

  $('#btn-launch').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!state.enabled.size) {
      // auto-arm rage kit so launch always does something flashy
      applyProfile('RAGE');
    }
    runLaunch();
  });

  $('#launch-close').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    $('#launch-overlay').classList.add('hidden');
  });

  // click anywhere on overlay chrome (not the log) to dismiss when done
  $('#launch-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'launch-overlay' && !$('#launch-close').classList.contains('hidden')) {
      $('#launch-overlay').classList.add('hidden');
    }
  });

  // keyboard: quick toggle selected / panic
  addEventListener('keydown', (e) => {
    if (e.target.matches('input, select, textarea')) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (e.key === 'Escape') panic();
    if (e.key === 'Enter' && state.selectedId) toggleModule(state.selectedId);
    if (e.key.toLowerCase() === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      $('#btn-launch').click();
    }
  });

  runBoot();
}

init();
