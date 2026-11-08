// Sets the wordmark and the tagline as outlined SVG paths from the Geist files in fonts/, so every brand image carries
// its own ink and no render depends on a font installed on the machine that draws it.
// Fonts: Geist v1.9.2 from the vercel/geist-font release (geist-font-v1.9.2.zip, sha256
// 15f066d58dcb99fb10014a49913009fdaf41e464cfb8851a44b44e593c95d3d8), SIL Open Font License 1.1 in fonts/OFL.txt:
// Geist-Medium.ttf (sha256 e9099e006d4934cae4a8c7d14a1ca2ea724ee2f69f9bdd5b2ffe715baf5524fc) sets "Paper", the weight
// the July wordmark asked for (500), and Geist-Regular.ttf (sha256
// 2c460a7a71063e53491f343d44b382267bc0cf496e31db64865f962af3152e68) sets the hairline "thin" and the tagline.
// fontkit shapes each run with the font's own kerning; opentype.js 2.0.0 read no kerning from these files.
import { openSync } from 'fontkit';
import { dirname, join, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const FONT_FILES = { paper: 'Geist-Medium.ttf', thin: 'Geist-Regular.ttf', tagline: 'Geist-Regular.ttf' };
export const loadFonts = (files = FONT_FILES) => Object.fromEntries(Object.entries(files).map(([k, f]) => [k, openSync(isAbsolute(f) ? f : join(here, 'fonts', f))]));
// "thin" is drawn as a hairline outline of the glyphs, as the July banner drew it, this many em wide.
export const HAIRLINE = 0.016;

const tidy = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(+(+n).toFixed(2)));

// One run of text at size px from origin x on baseline y, with tracking px between glyphs: its path and ink box.
export function run(font, text, size, x = 0, y = 0, tracking = 0) {
  const s = size / font.unitsPerEm, { glyphs, positions } = font.layout(text);
  const ink = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
  const parts = [];
  let pen = x;
  glyphs.forEach((g, i) => {
    const b = g.bbox, gx = pen + positions[i].xOffset * s, gy = y - positions[i].yOffset * s;
    if (b.maxX > b.minX) {
      parts.push(g.path.scale(s, -s).translate(gx, gy).toSVG());
      ink.left = Math.min(ink.left, gx + b.minX * s); ink.right = Math.max(ink.right, gx + b.maxX * s);
      ink.top = Math.min(ink.top, gy - b.maxY * s); ink.bottom = Math.max(ink.bottom, gy - b.minY * s);
    }
    pen += positions[i].xAdvance * s + (i < glyphs.length - 1 ? tracking : 0);
  });
  return { d: tidy(parts.join('')), ...ink, end: pen, gaps: glyphs.length - 1 };
}

// "Paper" solid and "thin" as a hairline outline, the wordmark the July banner set; its ink counts half the stroke.
export function wordmark(fonts, size, x = 0, y = 0, tracking = 0) {
  const paper = run(fonts.paper, 'Paper', size, x, y, tracking);
  const thin = run(fonts.thin, 'thin', size, paper.end + tracking, y, tracking);
  const stroke = +(size * HAIRLINE).toFixed(2), h = stroke / 2;
  return { paper, thin, stroke, left: Math.min(paper.left, thin.left - h), right: Math.max(paper.right, thin.right + h), top: Math.min(paper.top, thin.top - h), bottom: Math.max(paper.bottom, thin.bottom + h) };
}

export const capRatio = (font) => font.capHeight / font.unitsPerEm;
