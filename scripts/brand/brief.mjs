// Writes the text metrics of the golden-grid brief from the font files, so the brief never carries a typed guess:
//   node scripts/brand/brief.mjs [--check]
// Input: scripts/brand/brief.json and the fonts type.mjs sets. Each item with a "measure" key gets its numbers:
// {"wordmark": true} the wordmark's aspect (ink width over cap height) and text block, and {"copy": key, "fill": id}
// that copy's untracked ink and letter gaps in em and its width set to the filled item's, so golden-grid solves the
// tracking that justifies the line to it. A group with {"measure": {"span": expr}} gets the size S that makes its
// wordmark exactly that wide, for a stacked lockup whose wordmark, its widest item, runs margin to margin.
// Output: brief.json rewritten in place; --check writes nothing and exits 1 when a number differs from the fonts.
// Then plan it: node <golden-grid>/scripts/grid.mjs plan scripts/brand/brief.json --out scripts/brand/layout.json
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFonts, run, wordmark, capRatio } from './type.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const BRIEF = join(here, 'brief.json');
const em = (v) => +v.toFixed(4);

export function measured(brief, fonts = loadFonts()) {
  const U = 1000, cap = em(capRatio(fonts.paper));
  const w = wordmark(fonts, U);
  const aspect = em((w.right - w.left) / U / cap);
  const items = (list) => list.flatMap((it) => [it, ...(it.items ? items(it.items) : [])]);
  const groups = [...(brief.groups ?? []), ...Object.values(brief.canvases ?? {}).flatMap((c) => c.groups ?? [])];
  const widths = {};
  for (const it of items(groups)) {
    const m = it.measure;
    if (!m?.wordmark) continue;
    Object.assign(it, { aspect, text: { capRatio: cap, inkLeft: em(w.left / U), tracking: 0 } });
    widths[it.id] = it.h + '*' + aspect;
  }
  for (const it of items(groups)) {
    const m = it.measure;
    if (m?.copy === undefined) continue;
    const ink = run(fonts[m.copy], brief.copy[m.copy], U);
    Object.assign(it, { w: widths[m.fill], text: { capRatio: em(capRatio(fonts[m.copy])), inkLeft: em(ink.left / U), ink: em((ink.right - ink.left) / U), gaps: ink.gaps } });
  }
  for (const g of groups) {
    if (!g.measure?.span) continue;
    const word = items(g.items).find((it) => it.measure?.wordmark);
    g.size = '(' + g.measure.span + ')/((' + word.h.replace(/S/g, '1') + ')*' + aspect + ')';
  }
  return brief;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const before = readFileSync(BRIEF, 'utf8');
  const after = JSON.stringify(measured(JSON.parse(before)), null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (after !== before) { console.error('brief: text metrics differ from the fonts; run node scripts/brand/brief.mjs and plan again'); process.exit(1); }
  } else writeFileSync(BRIEF, after);
}
