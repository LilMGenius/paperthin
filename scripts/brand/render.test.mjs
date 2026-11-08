import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { inflateSync } from 'node:zlib';
import { render, shoot, ghostSvg, readGhostMark, CHROME, LAYOUT, GROUND, TAGLINE } from './render.mjs';
import { measured, BRIEF } from './brief.mjs';
import { loadFonts, run, wordmark } from './type.mjs';

// Width, height and RGB of an 8-bit, non-interlaced RGB or RGBA PNG, the form Chrome's screenshots take (W3C PNG spec).
function decode(file) {
  const buf = readFileSync(file);
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20), ch = { 2: 3, 6: 4 }[buf[25]];
  assert.ok(buf[24] === 8 && ch && !buf[28], file + ' is not an 8-bit RGB(A) PNG');
  const idat = [];
  for (let off = 8; off < buf.length; off += 12 + buf.readUInt32BE(off)) if (buf.toString('latin1', off + 4, off + 8) === 'IDAT') idat.push(buf.subarray(off + 8, off + 8 + buf.readUInt32BE(off)));
  const raw = inflateSync(Buffer.concat(idat)), stride = w * ch, px = new Uint8Array(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? px[y * stride + i - ch] : 0, b = y ? px[(y - 1) * stride + i] : 0, c = y && i >= ch ? px[(y - 1) * stride + i - ch] : 0;
      const p = a + b - c, pr = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c;
      px[y * stride + i] = raw[y * (stride + 1) + 1 + i] + [0, a, b, (a + b) >> 1, pr][f];
    }
  }
  return { w, h, at: (x, y) => [0, 1, 2].map((k) => px[(y * w + x) * ch + k]) };
}

// The ink bounding box inside a region: pixels farther than threshold from the ground, in rows and columns holding at
// least minCount of them, so the ceramic speed streaks and specks do not count as the mark.
function ink(img, ground, region, threshold, minCount = 1) {
  const g = [1, 3, 5].map((i) => parseInt(ground.slice(i, i + 2), 16));
  const x0 = Math.floor(region.x), y0 = Math.floor(region.y), x1 = Math.ceil(region.x + region.w), y1 = Math.ceil(region.y + region.h);
  const cols = new Array(x1 - x0).fill(0), rows = new Array(y1 - y0).fill(0);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (img.at(x, y).some((v, k) => Math.abs(v - g[k]) > threshold)) { cols[x - x0]++; rows[y - y0]++; }
  const xs = cols.flatMap((n, i) => n >= minCount ? [i] : []), ys = rows.flatMap((n, i) => n >= minCount ? [i] : []);
  return { left: x0 + xs[0], top: y0 + ys[0], right: x0 + xs.at(-1) + 1, bottom: y0 + ys.at(-1) + 1 };
}

const grow = (b, pad) => ({ x: b.x - pad, y: b.y - pad, w: b.w + 2 * pad, h: b.h + 2 * pad });
const edges = (b) => ({ left: b.x, top: b.y, right: b.x + b.w, bottom: b.y + b.h });
const near = (a, b, tolerance, what, keys = ['left', 'top', 'right', 'bottom']) => { for (const k of keys) assert.ok(Math.abs(a[k] - b[k]) <= tolerance, what + ' ' + k + ' is ' + a[k] + ', expected ' + b[k] + ' within ' + tolerance + ' px'); };
const noChrome = !existsSync(CHROME) && 'no Chrome at ' + CHROME;
const FONTS = loadFonts();

// The exact ink of the wordmark and the tagline as the renderer draws them from the spec, read from the paths.
function textInk(spec) {
  const t = spec.text.wordmark, l = spec.text.tagline;
  return { wordmark: wordmark(FONTS, t.fontSize, t.x, t.baseline, t.tracking), tagline: run(FONTS.tagline, TAGLINE, l.fontSize, l.x, l.baseline, l.tracking) };
}

test('on every canvas the wordmark and the tagline fill the planned boxes from side to side', () => {
  for (const [canvas, spec] of Object.entries(LAYOUT)) {
    if (!spec.text.wordmark) continue;
    for (const [id, ink] of Object.entries(textInk(spec))) {
      const b = spec.boxes[id];
      // Rounding allowance: the brief keeps metrics to 0.0001 em (side bearing, ink width, cap ratio, so 0.0003 em of
      // the size), and the plan keeps origin, size, tracking and the hairline to 0.01 px (0.005 px each, per em of ink
      // and per letter gap). A misplaced line is off by whole pixels.
      const t = spec.text[id], slack = 0.0003 * t.fontSize + 0.01 + 0.005 * (b.w / t.fontSize) + 0.005 * (ink.gaps ?? 0);
      near(ink, edges(b), slack, canvas + ' ' + id + ' path ink', ['left', 'right']);
      // Round capitals overshoot the cap height and the baseline by design, by a few hundredths of the size at most.
      near(ink, edges(b), b.h * 0.04, canvas + ' ' + id + ' path ink', id === 'wordmark' ? [] : ['top', 'bottom']);
    }
  }
});

test('the brief carries the text metrics the fonts measure, and the layout is planned from that brief', () => {
  const brief = JSON.parse(readFileSync(BRIEF, 'utf8'));
  assert.deepEqual(measured(structuredClone(brief)), brief, 'run node scripts/brand/brief.mjs and plan again');
  const { canvases, ...rules } = brief;
  assert.deepEqual(JSON.parse(readFileSync(new URL('./layout.json', import.meta.url), 'utf8')).rules, rules, 'layout.json was not planned from brief.json');
  assert.deepEqual(Object.keys(LAYOUT).sort(), Object.keys(canvases).sort());
});

test('assets/icon.svg, the master of the mark, sits on the icon box the layout plans', () => {
  const svg = readFileSync(new URL('../../assets/icon.svg', import.meta.url), 'utf8');
  const [, x, y, s] = svg.match(/translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\)/).map(Number);
  const b = LAYOUT.icon.boxes.icon;
  assert.deepEqual([x, y, +(s * 464).toFixed(2)], [b.x, b.y, b.h]);
  assert.equal((readGhostMark().match(/<polygon /g) || []).length, 4, 'the master carries the four bands');
});

let out;
before(() => { if (!noChrome) { out = mkdtempSync(join(tmpdir(), 'brand-test-')); render({ outDir: out }); } });
after(() => out && rmSync(out, { recursive: true, force: true }));

test('every image renders at the size its consumer takes, with outlined text and the tagline as its name', { skip: noChrome }, () => {
  for (const [f, canvas] of [['social.png', 'social'], ['social-ceramic.png', 'social'], ['banner-ceramic.png', 'banner'], ['icon.png', 'icon']]) {
    const img = decode(join(out, f));
    assert.deepEqual([img.w, img.h], [LAYOUT[canvas].canvas.w, LAYOUT[canvas].canvas.h], f);
  }
  for (const f of ['social.png', 'social-ceramic.png']) assert.ok(statSync(join(out, f)).size < 1024 * 1024, f + ' is over GitHub\'s 1 MB limit');
  for (const [f, box] of [['banner.svg', '0 0 1650 550'], ['thumbnail.svg', '0 0 1080 1080']]) {
    const svg = readFileSync(join(out, f), 'utf8');
    assert.match(svg, new RegExp('viewBox="' + box + '"'), f);
    assert.equal((svg.match(/<polygon /g) || []).length, 4, f + ' carries the four bands of the mark');
    assert.doesNotMatch(svg, /<text|font-family/, f + ' draws its text as paths, so no system font is read');
    const line = TAGLINE.toLowerCase();
    assert.ok(svg.includes('aria-label="Paperthin: ' + line + '"'), f + ' is named by the current tagline');
  }
  // The icon's mark sits on the layout's icon box, the W/r^4 margins of the square; every inked column counts, since
  // the slanted bands reach the left margin only at their bottom corner.
  near(ink(decode(join(out, 'icon.png')), GROUND.ghost, grow(LAYOUT.icon.boxes.icon, 12), 16), edges(LAYOUT.icon.boxes.icon), 1.5, 'icon mark');
});

test('every canvas and look puts the mark, the wordmark and the tagline on the layout boxes', { skip: noChrome }, () => {
  shoot(ghostSvg(LAYOUT.banner, readGhostMark()), LAYOUT.banner, join(out, 'banner.png'), out);
  shoot(readFileSync(join(out, 'thumbnail.svg'), 'utf8'), LAYOUT.thumbnail, join(out, 'thumbnail.png'), out);
  const renders = [['banner', 'ghost', 'banner.png'], ['banner', 'ceramic', 'banner-ceramic.png'], ['social', 'ghost', 'social.png'], ['social', 'ceramic', 'social-ceramic.png'], ['thumbnail', 'ghost', 'thumbnail.png']];
  for (const [canvas, look, file] of renders) {
    const spec = LAYOUT[canvas], img = decode(join(out, file)), what = canvas + ' ' + look;
    // The ghost's lightest band is #DFDEDF on #F8F8F8, so its threshold sits below their 25-level gap. The ceramic
    // sheet is a render with its own drawing, so it is held to the ghost mark of the same canvas, both read by rows and
    // columns of 12 ink pixels, which leaves out its speed streaks and the slanted corners.
    const region = grow(spec.boxes.icon, 12);
    if (look === 'ghost') near(ink(img, GROUND.ghost, region, 16), edges(spec.boxes.icon), 1.5, what + ' mark');
    else near(ink(img, GROUND.ceramic, region, 100, 12), ink(decode(join(out, canvas === 'banner' ? 'banner.png' : 'social.png')), GROUND.ghost, region, 16, 12), 2, what + ' sheet against the ghost mark');
    // The text drawn on screen is the ink its paths hold, within a pixel of antialiasing, on every platform.
    for (const [id, want] of Object.entries(textInk(spec))) near(ink(img, GROUND[look], grow({ x: want.left, y: want.top, w: want.right - want.left, h: want.bottom - want.top }, 6), 60), want, 1, what + ' ' + id);
    // Nothing is cut off at the canvas edge: every edge pixel is still the ground.
    const g = [1, 3, 5].map((i) => parseInt(GROUND[look].slice(i, i + 2), 16)), clear = (x, y) => img.at(x, y).every((v, k) => Math.abs(v - g[k]) <= 6);
    for (let x = 0; x < img.w; x++) for (const y of [0, img.h - 1]) assert.ok(clear(x, y), what + ' ink reaches the edge at ' + x + ',' + y);
    for (let y = 0; y < img.h; y++) for (const x of [0, img.w - 1]) assert.ok(clear(x, y), what + ' ink reaches the edge at ' + x + ',' + y);
  }
});
