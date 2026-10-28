#!/usr/bin/env node
// Render the re0-decide decision surface from a decisions JSON file: one self-contained HTML file, no network, no build step.
// The agent decides what the instrument contains (which items, tags, citations, consequences) and writes it to the JSON file;
// everything fixed lives here: markup, control types, grouping, verdict arithmetic, copy-out, escaping and the output path.
// Usage: node render.mjs <decisions.json> [--out <file.html>] [--json]
// Exit codes: 0 rendered (or already identical); 2 usage, unreadable input or a schema violation naming the field;
// 3 the material is too small for a surface (3 gates or fewer and no judgment): emit prose instead.
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node render.mjs <decisions.json> [--out <file.html>] [--json]';

export class InputError extends Error {}

export const ANSWERERS = ['artifact', 'submitter', 'delegate', 'decider'];
export const KINDS = ['gate', 'judgment', 'fork', 'intervention', 'exclusion', 'risk', 'missing'];
const MARKS = ['evidenced', 'claim'];
const KIND_LABEL = {
  gate: 'Gate',
  judgment: 'Judgment',
  fork: 'Fork',
  intervention: 'Human intervention point',
  exclusion: 'Exclusion',
  risk: 'Admitted risk',
  missing: 'Missing criterion',
};
// Keys each item kind may carry beyond the common ones; anything else is a typo and fails at the boundary.
const COMMON = ['kind', 'text', 'source', 'mark', 'answerer'];
const EXTRA = {
  gate: ['consequence'],
  judgment: ['note'],
  fork: ['options', 'fallback'],
  intervention: [],
  exclusion: [],
  risk: ['handling'],
  missing: [],
};

const isText = (v) => typeof v === 'string' && v.trim() !== '';
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function reject(field, message) {
  throw new InputError('decisions.' + field + ': ' + message);
}

function onlyKeys(object, allowed, field) {
  for (const key of Object.keys(object)) if (!allowed.includes(key)) reject(field + '.' + key, 'unknown field (allowed: ' + allowed.join(', ') + ')');
}

function requireText(object, key, field) {
  if (!isText(object[key])) reject(field + '.' + key, 'required non-empty string');
}

function optionalText(object, key, field) {
  if (object[key] !== undefined && !isText(object[key])) reject(field + '.' + key, 'must be a non-empty string when present');
}

// Boundary parser: returns the document unchanged when it is well formed, otherwise throws InputError naming the first bad field.
export function validate(doc) {
  if (!isObject(doc)) reject('(root)', 'must be an object');
  onlyKeys(doc, ['material', 'items'], '(root)');
  if (!isObject(doc.material)) reject('material', 'required object');
  onlyKeys(doc.material, ['identity', 'path'], 'material');
  requireText(doc.material, 'identity', 'material');
  optionalText(doc.material, 'path', 'material');
  if (!Array.isArray(doc.items) || doc.items.length === 0) reject('items', 'required non-empty array');
  doc.items.forEach((item, i) => {
    const at = 'items[' + i + ']';
    if (!isObject(item)) reject(at, 'must be an object');
    if (!KINDS.includes(item.kind)) reject(at + '.kind', 'must be one of ' + KINDS.join(', '));
    onlyKeys(item, COMMON.concat(EXTRA[item.kind]), at);
    requireText(item, 'text', at);
    requireText(item, 'source', at);
    if (!MARKS.includes(item.mark)) reject(at + '.mark', 'must be one of ' + MARKS.join(', '));
    if (!ANSWERERS.includes(item.answerer)) reject(at + '.answerer', 'must be one of ' + ANSWERERS.join(', '));
    if (item.kind === 'gate') requireText(item, 'consequence', at);
    if (item.kind === 'judgment') requireText(item, 'note', at);
    if (item.kind === 'risk') optionalText(item, 'handling', at);
    if (item.kind === 'fork') {
      optionalText(item, 'fallback', at);
      if (!Array.isArray(item.options) || item.options.length < 2) reject(at + '.options', 'required array of at least 2 named alternatives');
      item.options.forEach((option, j) => {
        if (!isText(option)) reject(at + '.options[' + j + ']', 'must be a non-empty string');
      });
      if (new Set(item.options).size !== item.options.length) reject(at + '.options', 'alternatives must be distinct');
    }
  });
  return doc;
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

export function stats(doc) {
  const count = (kind) => doc.items.filter((item) => item.kind === kind).length;
  const gates = count('gate');
  const judgments = count('judgment');
  const decider = doc.items.filter((item) => item.answerer === 'decider').length;
  return {
    items: doc.items.length,
    gates,
    judgments,
    forks: count('fork'),
    decider,
    surface: gates > 3 || judgments >= 1,
    everyItemToDecider: decider === doc.items.length,
  };
}

// Beside the material unless the decider names a path; a material path in the JSON is relative to the JSON file.
export function defaultOut(doc, jsonPath) {
  if (!doc.material.path) return null;
  const material = resolve(dirname(resolve(jsonPath)), doc.material.path);
  return join(dirname(material), basename(material, extname(material)) + '.decision.html');
}

const STYLE = [
  'body{font:16px/1.5 system-ui,sans-serif;margin:0 auto;max-width:48rem;padding:1.5rem;color:#1b1b1f;background:#fff}',
  'h1{font-size:1.4rem;margin:0 0 .25rem}h2{font-size:1.05rem;margin:0}',
  '.identity{margin:0 0 1rem;color:#444;overflow-wrap:anywhere}',
  '.verdict{border:2px solid #555;border-radius:.5rem;padding:.75rem 1rem;margin:1rem 0;position:sticky;top:0;background:#fff}',
  '.verdict[data-state=blocked]{border-color:#b00020}.verdict[data-state=conditional]{border-color:#a15c00}.verdict[data-state=clear]{border-color:#1b6e2d}',
  '.verdict .state{font-weight:700;text-transform:uppercase}',
  '.group{border:1px solid #bbb;border-radius:.5rem;padding:.75rem 1rem;margin:1rem 0}',
  '.group.decider{border:3px solid #1f3a93;background:#eef2ff}',
  '.count{font-weight:400;color:#555;margin-left:.5rem}',
  '.item{padding:.5rem 0;border-top:1px solid #e3e3e3}.item:first-of-type{border-top:0}',
  '.kind{font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;color:#555;margin-right:.5rem}',
  '.sub,.meta{margin:.2rem 0 0 1.6rem;font-size:.9rem;color:#333;overflow-wrap:anywhere}',
  '.mark{font-size:.75rem;border:1px solid #888;border-radius:.25rem;padding:0 .3rem;margin-right:.4rem}',
  '.finding{border:2px dashed #a15c00;padding:.5rem 1rem;margin:1rem 0}',
  'pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f5f5f7;padding:.75rem;border-radius:.4rem}',
  'button{font:inherit;padding:.4rem .9rem}',
].join('\n');

// Static behaviour, never interpolated with submitted text. It reads labels from the DOM with textContent and recomputes the verdict on every change.
const SCRIPT = String.raw`
(function () {
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var all = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var textOf = function (box, sel) { var el = $(sel, box); return el ? el.textContent : ''; };
  var fill = function (list, rows) {
    list.textContent = '';
    rows.forEach(function (row) { var li = document.createElement('li'); li.textContent = row; list.appendChild(li); });
  };
  function compute() {
    var gates = all('input[data-kind="gate"]').map(function (box) {
      var item = box.closest('.item');
      return { met: box.checked, text: textOf(item, '.text'), detail: textOf(item, '.consequence') };
    });
    var judgments = all('input[data-kind="judgment"]').map(function (box) {
      var item = box.closest('.item');
      return { met: box.checked, text: textOf(item, '.text'), detail: textOf(item, '.note') };
    });
    var forks = all('select[data-kind="fork"]').map(function (select) {
      var item = select.closest('.item');
      return { text: textOf(item, '.text'), choice: select.value === '' ? '' : select.options[select.selectedIndex].textContent };
    });
    var unmetGates = gates.filter(function (g) { return !g.met; });
    var unmetJudgments = judgments.filter(function (j) { return !j.met; });
    var state = unmetGates.length ? 'blocked' : unmetJudgments.length ? 'conditional' : 'clear';
    return { gates: gates, judgments: judgments, forks: forks, unmetGates: unmetGates, unmetJudgments: unmetJudgments, state: state };
  }
  function summary(r) {
    var lines = ['Verdict: ' + r.state, 'Material: ' + $('#identity').textContent];
    if (r.unmetGates.length) {
      lines.push('Unmet gates:');
      r.unmetGates.forEach(function (g) { lines.push('- ' + g.text + ' (blocks: ' + g.detail + ')'); });
    }
    if (r.unmetJudgments.length) {
      lines.push('Unmet judgments (conditions):');
      r.unmetJudgments.forEach(function (j) { lines.push('- ' + j.text + ' (weigh: ' + j.detail + ')'); });
    }
    lines.push('Fork selections:');
    if (!r.forks.length) lines.push('- none');
    r.forks.forEach(function (f) { lines.push('- ' + f.text + ': ' + (f.choice || '(not chosen)')); });
    lines.push('Controls:');
    r.gates.forEach(function (g) { lines.push('- gate [' + (g.met ? 'met' : 'unmet') + '] ' + g.text); });
    r.judgments.forEach(function (j) { lines.push('- judgment [' + (j.met ? 'met' : 'unmet') + '] ' + j.text); });
    return lines.join('\n');
  }
  function update() {
    var r = compute();
    var box = $('#verdict');
    box.setAttribute('data-state', r.state);
    $('#verdict-state').textContent = r.state;
    fill($('#unmet-gates'), r.unmetGates.map(function (g) { return g.text + ' (blocks: ' + g.detail + ')'; }));
    fill($('#unmet-judgments'), r.unmetJudgments.map(function (j) { return j.text + ' (weigh: ' + j.detail + ')'; }));
    $('#summary').textContent = summary(r);
  }
  function copy() {
    var text = $('#summary').textContent;
    var done = function () { $('#copy-status').textContent = 'Copied'; };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () { $('#copy-status').textContent = 'Copy failed: select the summary and copy it'; }); return; }
    var area = document.createElement('textarea');
    area.value = text; document.body.appendChild(area); area.select();
    try { document.execCommand('copy'); done(); } catch (e) { $('#copy-status').textContent = 'Copy failed: select the summary and copy it'; }
    document.body.removeChild(area);
  }
  all('input[data-kind], select[data-kind]').forEach(function (el) { el.addEventListener('change', update); });
  $('#copy').addEventListener('click', copy);
  update();
})();
`;

function renderItem(item, id) {
  const meta =
    '<p class="meta"><span class="mark" data-mark="' + item.mark + '">' + item.mark + '</span>' +
    '<span class="source">' + esc(item.source) + '</span></p>';
  const kindTag = '<span class="kind">' + KIND_LABEL[item.kind] + '</span>';
  const open = '<div class="item" data-kind="' + item.kind + '" data-answerer="' + item.answerer + '">';
  if (item.kind === 'gate' || item.kind === 'judgment') {
    const blocking = item.kind === 'gate';
    return (
      open +
      '<label for="' + id + '"><input type="checkbox" id="' + id + '" data-kind="' + item.kind + '" data-blocking="' + blocking + '">' +
      kindTag + '<span class="text">' + esc(item.text) + '</span></label>' +
      (blocking
        ? '<p class="sub">Blocks when unmet: <span class="consequence">' + esc(item.consequence) + '</span></p>'
        : '<p class="sub">To weigh: <span class="note">' + esc(item.note) + '</span></p>') +
      meta + '</div>'
    );
  }
  if (item.kind === 'fork') {
    const options = item.options.map((label, j) => '<option value="' + j + '">' + esc(label) + '</option>').join('');
    return (
      open +
      '<label for="' + id + '">' + kindTag + '<span class="text">' + esc(item.text) + '</span></label>' +
      '<p class="sub"><select id="' + id + '" data-kind="fork"><option value="" selected disabled>(not chosen)</option>' + options + '</select></p>' +
      (item.fallback ? '<p class="sub">Fallback the material gives: <span class="fallback">' + esc(item.fallback) + '</span></p>' : '') +
      meta + '</div>'
    );
  }
  return (
    open + kindTag + '<span class="text">' + esc(item.text) + '</span>' +
    (item.kind === 'risk' && item.handling ? '<p class="sub">Stated handling: <span class="handling">' + esc(item.handling) + '</span></p>' : '') +
    meta + '</div>'
  );
}

export function render(doc) {
  const total = doc.items.length;
  const info = stats(doc);
  const groups = ANSWERERS.map((answerer) => {
    const entries = doc.items.map((item, i) => ({ item, id: 'item-' + i })).filter((e) => e.item.answerer === answerer);
    return { answerer, entries };
  });
  const shown = groups.filter((g) => g.entries.length > 0 || g.answerer === 'decider');
  const body = shown
    .map(
      (g) =>
        '<section class="group' + (g.answerer === 'decider' ? ' decider' : '') + '" data-answerer="' + g.answerer + '">' +
        '<h2>' + g.answerer + '<span class="count">' + g.entries.length + ' of ' + total + ' items</span></h2>' +
        g.entries.map((e) => renderItem(e.item, e.id)).join('') + '</section>',
    )
    .join('\n');
  const finding = info.everyItemToDecider
    ? '<p class="finding" data-finding="all-decider">Finding: the material leaves every item to the decider; no item could be answered by the artifact, the submitter or a delegate.</p>'
    : '';
  return [
    '<!doctype html>',
    '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Decision: ' + esc(doc.material.identity) + '</title>',
    '<style>' + STYLE + '</style></head><body>',
    '<header><h1>Decision instrument</h1><p class="identity">Material: <span id="identity">' + esc(doc.material.identity) + '</span></p></header>',
    '<section class="verdict" id="verdict" aria-live="polite"><h2>Verdict: <span class="state" id="verdict-state"></span></h2>',
    '<p>Unmet gates</p><ul id="unmet-gates"></ul><p>Unmet judgments, attached as conditions</p><ul id="unmet-judgments"></ul></section>',
    finding,
    '<main>' + body + '</main>',
    '<section><h2>Copy-out</h2><p><button type="button" id="copy">Copy summary</button> <span id="copy-status" role="status"></span></p><pre id="summary"></pre></section>',
    '<noscript><p>This surface computes its verdict in the page; enable scripts to use it.</p></noscript>',
    '<script>' + SCRIPT + '</script>',
    '</body></html>',
    '',
  ].join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: { out: { type: 'string' }, json: { type: 'boolean' }, help: { type: 'boolean' } },
    }));
  } catch (error) {
    if (typeof error.code === 'string' && error.code.startsWith('ERR_PARSE_ARGS')) {
      console.error(error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  if (values.help) {
    console.log(USAGE);
    return 0;
  }
  if (positionals.length !== 1) {
    console.error('name exactly one decisions file\n' + USAGE);
    return 2;
  }
  const jsonPath = positionals[0];
  try {
    if (!existsSync(jsonPath)) throw new InputError('no such file: ' + jsonPath);
    let doc;
    try {
      doc = JSON.parse(readFileSync(jsonPath, 'utf8'));
    } catch (error) {
      throw new InputError('not valid JSON: ' + error.message);
    }
    validate(doc);
    const info = stats(doc);
    if (!info.surface) {
      console.error('render: ' + info.gates + ' gate(s) and no judgment: emit the prose form with the same eight elements instead of a surface');
      return 3;
    }
    const out = values.out ? resolve(values.out) : defaultOut(doc, jsonPath);
    if (!out) throw new InputError('decisions.material.path: required when --out is not given, to place the surface beside the material');
    const html = render(doc);
    const same = existsSync(out) && readFileSync(out, 'utf8') === html;
    if (!same) {
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, html);
    }
    const result = { out, written: !same, ...info };
    console.log(values.json ? JSON.stringify(result) : (same ? 'unchanged ' : 'wrote ') + out);
    return 0;
  } catch (error) {
    if (error instanceof InputError) {
      console.error('render: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
