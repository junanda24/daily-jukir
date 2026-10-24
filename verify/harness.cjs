// Headless verification harness for JUKIR! (src/jukir.html)
// Stubs DOM/canvas, captures pointerdown, drives the full game loop with a
// fake clock. Appends a READ-ONLY probe to the extracted script (shipped file
// is never modified).
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'jukir.html'), 'utf8');
const scripts = html.split('<script>').slice(1).map(s => s.split('</script>')[0]);
if (scripts.length !== 1) throw new Error('expected 1 script tag, got ' + scripts.length);

const PROBE = `;window.__probe = function () {
  return {
    screen: screen, rupiah: rupiah, strikes: strikes, served: served,
    level: level, selected: !!selectedCar, moving: !!movingCar,
    cars: cars.map(function (c) { return { state: c.state, x: Math.round(c.x), y: Math.round(c.y) }; }),
    freeSlots: slots.filter(function (s) { return !s.car; }).length
  };
};`;

function makeCtx() {
  const grad = { addColorStop() {} };
  return new Proxy({}, {
    get(t, p) {
      if (p === 'measureText') return () => ({ width: 10 });
      if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => grad;
      if (p === 'getImageData') return () => ({ data: [] });
      return typeof p === 'string' ? function () {} : undefined;
    },
    set() { return true; }
  });
}

const listeners = {};
const canvasListeners = {};
const canvas = {
  width: 480, height: 800, style: {},
  getContext: () => makeCtx(),
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 480, height: 800 }),
  addEventListener: (t, fn) => { (canvasListeners[t] = canvasListeners[t] || []).push(fn); },
  removeEventListener() {}
};
const store = {};
const localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};

let rafCb = null;
const errors = [];
const sandbox = {
  console,
  window: null, document: null,
  requestAnimationFrame: cb => { rafCb = cb; },
  cancelAnimationFrame: () => {},
  setTimeout, clearTimeout, setInterval, clearInterval,
  Math, JSON, Object, Array, String, Number, Boolean, Date, RegExp, Error,
  parseInt, parseFloat, isNaN, Infinity, NaN, undefined
};
sandbox.window = {
  innerWidth: 500, innerHeight: 900, devicePixelRatio: 1,
  addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
  removeEventListener() {},
  localStorage, matchMedia: () => ({ matches: false }),
  AudioContext: undefined, webkitAudioContext: undefined
};
sandbox.document = {
  getElementById: id => (id === 'game' ? canvas : null),
  createElement: () => ({ style: {}, getContext: () => makeCtx() }),
  body: { appendChild() {}, style: {} },
  addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
  fonts: { ready: Promise.resolve() }
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

try {
  vm.runInContext(scripts[0] + PROBE, sandbox, { filename: 'jukir.html' });
} catch (e) {
  console.error('LOAD ERROR:', e);
  process.exit(1);
}
if (!rafCb) { console.error('FAIL: rAF never scheduled'); process.exit(1); }

let now = 0;
function step(ms) {
  const end = now + ms;
  while (now < end) {
    now += 16.667;
    const cb = rafCb; rafCb = null;
    try { cb(now); } catch (e) { console.error('FRAME ERROR at', Math.round(now), e); process.exit(1); }
    if (!rafCb) { console.error('FAIL: rAF chain broken'); process.exit(1); }
  }
}
function tap(x, y) {
  const fns = canvasListeners['pointerdown'] || [];
  if (!fns.length) { console.error('FAIL: no pointerdown listener'); process.exit(1); }
  fns.forEach(fn => { try { fn({ clientX: x, clientY: y, preventDefault() {} }); } catch (e) { console.error('TAP ERROR', e); process.exit(1); } });
}
const P = () => vm.runInContext('window.__probe()', sandbox);

let pass = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('ok -', name); }
  else { console.error('FAIL -', name, extra === undefined ? '' : JSON.stringify(extra)); process.exit(1); }
}
function waitFor(fn, timeoutMs, label) {
  const t0 = now;
  while (now - t0 < timeoutMs) { step(250); const v = fn(); if (v) return v; }
  console.error('TIMEOUT -', label); process.exit(1);
}

console.log('--- JUKIR headless verification ---');
check('starts at menu', P().screen === 'menu', P());

tap(240, 577); // MULAI JAGA
check('tap MULAI JAGA -> playing', P().screen === 'playing', P());

// guidance: tap empty slot with nothing selected
tap(66, 159);
step(100);
check('guidance bubble path does not crash', P().screen === 'playing');

const waiting = waitFor(() => P().cars.find(c => c.state === 'waiting'), 8000, 'car spawn');
check('car spawns and waits', !!waiting, P());

tap(waiting.x, waiting.y);
check('tap waiting car selects it', P().selected === true, P());

tap(66, 159); // slot 0
check('direct to slot -> car moving', P().moving === true, P());

// tapping another action while moving -> TUNGGU bubble, no crash
tap(66, 159); step(100);

const parked = waitFor(() => P().cars.find(c => c.state === 'parked'), 15000, 'car parks');
check('car reaches slot and parks', !!parked, P());

const collecting = waitFor(() => P().cars.find(c => c.state === 'collect'), 45000, 'owner returns');
check('owner returns -> collect window', !!collecting, P());

tap(collecting.x, collecting.y);
step(300);
const p1 = P();
check('tap collects fee (rupiah>0, served=1)', p1.rupiah > 0 && p1.served === 1, p1);

// angry path x3 -> game over
for (let i = 0; i < 3; i++) {
  const w = waitFor(() => P().cars.find(c => c.state === 'waiting'), 12000, 'spawn #' + i);
  tap(w.x, w.y);
  const freeSlotIdx = [0, 1, 2, 3].find(() => true);
  // find a free slot tap point: slot i+1 (66 + (i+1)*116, 159)
  const sx = 66 + ((i + 1) % 4) * 116;
  tap(sx, 159);
  waitFor(() => P().cars.some(c => c.state === 'parked'), 15000, 'park #' + i);
  waitFor(() => P().cars.some(c => c.state === 'collect'), 45000, 'owner #' + i);
  // let the collect window expire (max 8s + margin)
  const s0 = P().strikes;
  waitFor(() => P().strikes > s0 || P().screen === 'gameover', 15000, 'angry leave #' + i);
  step(500);
}
const p2 = P();
check('3 angry -> game over', p2.screen === 'gameover' && p2.strikes === 3, p2);
check('high score persisted', store['jukir_high'] !== undefined && parseInt(store['jukir_high'], 10) >= p2.rupiah, store);

tap(240, 589); // JAGA LAGI
step(200);
const p3 = P();
check('restart resets to clean playing', p3.screen === 'playing' && p3.rupiah === 0 && p3.strikes === 0 && p3.cars.length === 0, p3);

// mute toggle persists
tap(454, 32);
check('mute persists', store['jukir_mute'] === '1', store);
tap(454, 32);
check('unmute persists', store['jukir_mute'] === '0', store);

// run a while longer for stability (no frame errors across spawns)
step(20000);
check('stable after 20s idle play', P().screen === 'playing');

console.log(`\nALL ${pass} CHECKS PASSED`);
