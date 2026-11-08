// Renders every Paperthin brand image from two masters on one golden-grid layout, so the monochrome (ghost) and the
// ceramic look put the same mark box, wordmark, two-line tagline, baselines and margins on every canvas, and a change to
// a master, the fonts or the layout re-renders every derived image in one command:
//   node scripts/brand/render.mjs [--out <dir>]
// Input: assets/icon.svg (the hand-kept vector master of the mark, placed on the 512 icon canvas), assets/icon-ceramic.png
// (the ceramic render), the Geist fonts type.mjs sets as outlined paths, and scripts/brand/layout.json, the spec
// golden-grid planned from scripts/brand/brief.json (brief.mjs writes its measured text metrics; the tagline lives in
// rules.copy.tagline: one line at cap height S/r^6, S/r^3 under the wordmark, tracked so its ink spans the wordmark's).
// Output in <dir> (default assets/): banner.svg (vector) and banner-ceramic.png at 1650x550, the 3:1 slot the README
// shows at width 820; social.png and social-ceramic.png at the 1280x640 GitHub asks for, under 1 MB; icon.png, the
// mark on the 512 icon canvas that .claude-plugin/plugin.json names; thumbnail.svg, the 1080 square post image.
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadFonts, run, wordmark } from './type.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..');
const PLAN = JSON.parse(readFileSync(join(here, 'layout.json'), 'utf8'));
export const LAYOUT = PLAN.canvases;
export const TAGLINE = PLAN.rules.copy.tagline;
// The accessible name every image carries: the product and its tagline in sentence case.
const LABEL = 'Paperthin: ' + TAGLINE.toLowerCase();
const FONTS = loadFonts();

export const CHROME = process.env.CHROME_PATH || ({
  win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
}[process.platform] ?? '/usr/bin/google-chrome');

// The mark's source box inside icon.svg: the four bands span exactly this box.
const GHOST_BOX = { x: 284, y: 395, w: 683, h: 464 };
// The drawn sheet stack inside the 1254x1254 ceramic render, measured as ink over its #080908 ground (threshold 60,
// rows and columns holding at least 30 ink pixels, which leaves out the speed streaks and specks).
const CERAMIC_SIDE = 1254;
export const CERAMIC_SHEET = { x: 338, y: 397, w: 694, h: 476 };
export const GROUND = { ghost: '#F8F8F8', ceramic: '#080908' };
const INK = { ghost: ['#161615', '#161615'], ceramic: ['#F2ECE2', '#E9E1D2'] };
// The tagline sits a step back from the wordmark: the mark's third band on the light ground, a dimmed ceramic tone on
// the dark one.
const TAGLINE_INK = { ghost: '#4D4C4C', ceramic: '#A39C91' };

function words(spec, look) {
  const t = spec.text.wordmark, [fill, stroke] = INK[look];
  const w = wordmark(FONTS, t.fontSize, t.x, t.baseline, t.tracking);
  const l = spec.text.tagline;
  return '<path fill="' + fill + '" d="' + w.paper.d + '"/><path fill="none" stroke="' + stroke + '" stroke-width="' + w.stroke + '" stroke-linejoin="round" d="' + w.thin.d + '"/>'
    + '<path fill="' + TAGLINE_INK[look] + '" d="' + run(FONTS.tagline, TAGLINE, l.fontSize, l.x, l.baseline, l.tracking).d + '"/>';
}

// A null ground leaves the canvas transparent.
function frame(spec, ground, body) {
  const { w, h } = spec.canvas;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + LABEL + '">'
    + (ground ? '<rect width="' + w + '" height="' + h + '" fill="' + ground + '"/>' : '') + body + '</svg>';
}

const placeMark = (spec, ghostMark) => {
  const b = spec.boxes.icon, s = b.h / GHOST_BOX.h;
  return '<g transform="translate(' + b.x + ' ' + b.y + ') scale(' + +s.toFixed(6) + ') translate(' + -GHOST_BOX.x + ' ' + -GHOST_BOX.y + ')">' + ghostMark + '</g>';
};

export function ghostSvg(spec, ghostMark) {
  return frame(spec, GROUND.ghost, placeMark(spec, ghostMark) + words(spec, 'ghost'));
}

// The mark alone on a square canvas, on the ghost ground: icon.png.
export const markSvg = (spec, ghostMark) => frame(spec, GROUND.ghost, placeMark(spec, ghostMark));

export function ceramicSvg(spec, ceramicUri) {
  // The sheet is fitted to the mark box by height and centred across it, the box the ghost bands fill exactly.
  const b = spec.boxes.icon, s = b.h / CERAMIC_SHEET.h;
  const side = +(CERAMIC_SIDE * s).toFixed(2);
  const x = +(b.x + (b.w - CERAMIC_SHEET.w * s) / 2 - CERAMIC_SHEET.x * s).toFixed(2);
  const y = +(b.y - CERAMIC_SHEET.y * s).toFixed(2);
  // The render's vignette is not perfectly flat, so its square edge is feathered into the ground; the sheet and its
  // streaks sit well inside the feather.
  return frame(spec, GROUND.ceramic, '<defs><radialGradient id="feather"><stop offset="0.8" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>'
    + '<mask id="m" maskUnits="userSpaceOnUse" x="' + x + '" y="' + y + '" width="' + side + '" height="' + side + '"><rect x="' + x + '" y="' + y + '" width="' + side + '" height="' + side + '" fill="url(#feather)"/></mask></defs>'
    + '<image href="' + ceramicUri + '" x="' + x + '" y="' + y + '" width="' + side + '" height="' + side + '" mask="url(#m)"/>'
    + words(spec, 'ceramic'));
}

export function shoot(svg, spec, png, scratch) {
  const page = join(scratch, 'page.svg');
  writeFileSync(page, svg);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--user-data-dir=' + join(scratch, 'profile'),
    '--screenshot=' + resolve(png), '--window-size=' + spec.canvas.w + ',' + spec.canvas.h, pathToFileURL(page).href], { stdio: 'ignore', windowsHide: true, timeout: 60000 });
}

export const readGhostMark = (root = repo) => readFileSync(join(root, 'assets', 'icon.svg'), 'utf8').match(/<g id="paperthin-mark">[\s\S]*?<\/g>/)[0];

export function render({ root = repo, outDir = join(repo, 'assets') } = {}) {
  const ghostMark = readGhostMark(root);
  const ceramicUri = 'data:image/png;base64,' + readFileSync(join(root, 'assets', 'icon-ceramic.png')).toString('base64');
  const scratch = mkdtempSync(join(tmpdir(), 'paperthin-brand-'));
  try {
    writeFileSync(join(outDir, 'banner.svg'), ghostSvg(LAYOUT.banner, ghostMark) + '\n');
    writeFileSync(join(outDir, 'thumbnail.svg'), ghostSvg(LAYOUT.thumbnail, ghostMark) + '\n');
    shoot(markSvg(LAYOUT.icon, ghostMark), LAYOUT.icon, join(outDir, 'icon.png'), scratch);
    shoot(ghostSvg(LAYOUT.social, ghostMark), LAYOUT.social, join(outDir, 'social.png'), scratch);
    shoot(ceramicSvg(LAYOUT.banner, ceramicUri), LAYOUT.banner, join(outDir, 'banner-ceramic.png'), scratch);
    shoot(ceramicSvg(LAYOUT.social, ceramicUri), LAYOUT.social, join(outDir, 'social-ceramic.png'), scratch);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  return ['banner.svg', 'thumbnail.svg', 'icon.png', 'social.png', 'banner-ceramic.png', 'social-ceramic.png'].map((f) => join(outDir, f));
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--out');
  const outDir = i > 0 ? resolve(process.argv[i + 1]) : join(repo, 'assets');
  if (!existsSync(CHROME)) {
    console.error('render: no Chrome at ' + CHROME + '; set CHROME_PATH');
    process.exit(2);
  }
  for (const f of render({ outDir })) console.log(f);
}
