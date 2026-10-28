import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];

function dir(prefix) {
  const root = mkdtempSync(join(tmpdir(), prefix));
  temps.push(root);
  return root;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = dir('re0-decide-link-');
const link = join(linkRoot, 're0-decide');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(cwd, ...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'render.mjs'), ...args], { cwd, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr };
}

test.after(() => {
  for (const root of temps) rmSync(root, { recursive: true, force: true });
});

const item = (over) => ({ source: 'spec.md:3', mark: 'claim', answerer: 'decider', ...over });
const gate = (text, over) => item({ kind: 'gate', text, consequence: 'nothing ships', ...over });
const judgment = (text, over) => item({ kind: 'judgment', text, note: 'is the scope worth it', ...over });
const fork = (text, over) => item({ kind: 'fork', text, options: ['alpha', 'beta'], ...over });
const base = (items) => ({ material: { identity: 'spec.md @ abc123', path: 'spec.md' }, items });

function setup(doc) {
  const root = dir('re0-decide-');
  writeFileSync(join(root, 'decisions.json'), typeof doc === 'string' ? doc : JSON.stringify(doc));
  return root;
}

// Minimal tokenizer for the emitted HTML: tags with their attributes, and the text between them. Script and style bodies are kept raw.
function parse(html) {
  const tags = [];
  const texts = [];
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>|([^<]+)/g;
  let m;
  let last = 0;
  while ((m = re.exec(html))) {
    if (m.index !== last) throw new Error('unparsed markup near: ' + html.slice(last, last + 40));
    last = re.lastIndex;
    if (m[4] !== undefined) {
      texts.push(m[4]);
      continue;
    }
    if (m[2] === undefined) continue;
    const name = m[2].toLowerCase();
    const attrs = {};
    for (const a of m[3].matchAll(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1]] = a[2] ?? a[3] ?? a[4] ?? '';
    tags.push({ name, close: m[1] === '/', attrs });
    if (!m[1] && (name === 'script' || name === 'style')) {
      const end = html.indexOf('</' + name, re.lastIndex);
      re.lastIndex = end;
      last = end;
    }
  }
  return { tags: tags.filter((t) => !t.close), texts, all: tags };
}
const opens = (page, name, where = () => true) => page.tags.filter((t) => t.name === name && where(t.attrs));

function render(doc, ...args) {
  const root = setup(doc);
  const out = join(root, 'out.html');
  const run = cli(root, 'decisions.json', '--out', out, ...args);
  return { root, out, run, page: () => parse(readFileSync(out, 'utf8')), html: () => readFileSync(out, 'utf8') };
}

const valid = () => base([
  gate('Tests pass', { answerer: 'artifact' }),
  gate('Owner signed off', { answerer: 'submitter' }),
  gate('Rollback exists', { answerer: 'delegate' }),
  gate('Budget approved'),
  judgment('Scope is right'),
  fork('Pick a rollout', { fallback: 'alpha' }),
  item({ kind: 'intervention', text: 'Needs a 10 minute call', answerer: 'submitter' }),
  item({ kind: 'exclusion', text: 'Does not authorize hiring' }),
  item({ kind: 'risk', text: 'Vendor lock-in', handling: 'exit clause' }),
  item({ kind: 'missing', text: 'No rollback consequence stated' }),
]);

test('a valid file renders one self-contained surface with the controls each kind is assigned', () => {
  const r = render(valid());
  assert.equal(r.run.status, 0, r.run.stderr);
  const page = r.page();
  const gates = opens(page, 'input', (a) => a['data-kind'] === 'gate');
  const judgments = opens(page, 'input', (a) => a['data-kind'] === 'judgment');
  assert.equal(gates.length, 4);
  assert.equal(judgments.length, 1);
  assert.ok(gates.every((g) => g.attrs.type === 'checkbox' && g.attrs['data-blocking'] === 'true'));
  assert.ok(judgments.every((j) => j.attrs.type === 'checkbox' && j.attrs['data-blocking'] === 'false'));
  const selects = opens(page, 'select');
  assert.equal(selects.length, 1);
  assert.equal(opens(page, 'textarea').length, 0);
  assert.equal(opens(page, 'input', (a) => a.type === 'text').length, 0);
  // Intervention, exclusion, risk and missing items render as tagged text with no control.
  assert.equal(opens(page, 'input').length, 5);
  for (const kind of ['intervention', 'exclusion', 'risk', 'missing']) assert.equal(opens(page, 'div', (a) => a['data-kind'] === kind).length, 1);
  assert.equal(opens(page, 'button').length, 1);
  assert.ok(opens(page, 'span', (a) => a.id === 'verdict-state').length === 1);
});

test('no control begins checked or preselected, and fork options are not preselected', () => {
  const page = render(valid()).page();
  assert.ok(opens(page, 'input').every((i) => !('checked' in i.attrs)));
  assert.ok(opens(page, 'option').every((o) => !('selected' in o.attrs) || 'disabled' in o.attrs));
  const placeholder = opens(page, 'option', (a) => a.value === '');
  assert.equal(placeholder.length, 1);
  assert.ok('disabled' in placeholder[0].attrs);
});

test('items are grouped by answerer and the decider group comes last and is marked', () => {
  const page = render(valid()).page();
  const groups = opens(page, 'section', (a) => 'data-answerer' in a).map((s) => s.attrs['data-answerer']);
  assert.deepEqual(groups, ['artifact', 'submitter', 'delegate', 'decider']);
  const decider = opens(page, 'section', (a) => a['data-answerer'] === 'decider')[0];
  assert.match(decider.attrs.class, /\bdecider\b/);
  const items = opens(page, 'div', (a) => a['data-answerer']).map((d) => d.attrs['data-answerer']);
  assert.deepEqual(items, [...items].sort((a, b) => ['artifact', 'submitter', 'delegate', 'decider'].indexOf(a) - ['artifact', 'submitter', 'delegate', 'decider'].indexOf(b)));
});

test('every item carries its citation and an evidenced or claim mark', () => {
  const doc = valid();
  doc.items[0].mark = 'evidenced';
  doc.items[0].source = 'ci.log:12';
  const r = render(doc);
  const page = r.page();
  assert.equal(opens(page, 'span', (a) => a['data-mark']).length, doc.items.length);
  assert.equal(opens(page, 'span', (a) => a['data-mark'] === 'evidenced').length, 1);
  assert.match(r.html(), /ci\.log:12/);
});

test('the surface is one file with no network reference and no stored verdict', () => {
  const r = render(valid());
  const page = r.page();
  assert.equal(opens(page, 'link').length, 0);
  assert.equal(opens(page, 'script', (a) => 'src' in a).length, 0);
  assert.equal(opens(page, 'img').length + opens(page, 'iframe').length, 0);
  assert.equal(opens(page, 'style').length, 1);
  assert.doesNotMatch(r.html(), /https?:\/\//);
  assert.doesNotMatch(r.html(), /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|import\()/);
  // The verdict element is filled by the page script on load; the file stores no verdict string.
  const state = r.html().match(/id="verdict-state">([^<]*)</);
  assert.equal(state[1], '');
});

test('the page script derives blocked, conditional and clear from the controls', () => {
  const r = render(valid());
  const script = r.html().match(/<script>([\s\S]*)<\/script>/)[1];
  for (const word of ['blocked', 'conditional', 'clear']) assert.match(script, new RegExp(word));
  assert.doesNotThrow(() => new Function(script));
  const compute = script.match(/var state = ([^;]*);/)[1];
  assert.equal(compute, "unmetGates.length ? 'blocked' : unmetJudgments.length ? 'conditional' : 'clear'");
});

test('submitted text reaches the page as text and never as markup, attribute, script or handler', () => {
  const evil = '<img src=x onerror=alert(1)> "q" \'s\' & </script><script>alert(2)</script>';
  const doc = base([
    gate(evil, { consequence: evil, source: evil, answerer: 'decider' }),
    gate('b'), gate('c'), gate('d'),
    judgment(evil, { note: evil }),
    fork(evil, { options: [evil, 'ok'], fallback: evil }),
    item({ kind: 'risk', text: evil, handling: evil }),
  ]);
  doc.material.identity = evil;
  const r = render(doc);
  assert.equal(r.run.status, 0, r.run.stderr);
  const page = r.page();
  assert.equal(opens(page, 'img').length, 0);
  assert.equal(opens(page, 'script').length, 1);
  assert.ok(page.tags.every((t) => !Object.keys(t.attrs).some((k) => k.startsWith('on'))));
  assert.ok(page.tags.every((t) => !Object.values(t.attrs).some((v) => /<|javascript:|data:/i.test(v))));
  assert.match(r.html(), /&lt;img src=x onerror=alert\(1\)&gt; &quot;q&quot; &#39;s&#39; &amp; &lt;\/script&gt;/);
  assert.ok(!r.html().includes(evil));
});

test('a thin file with 3 gates or fewer and no judgment gets no surface and exits 3', () => {
  const r = render(base([gate('Only gate'), item({ kind: 'exclusion', text: 'x' })]));
  assert.equal(r.run.status, 3);
  assert.equal(existsSync(r.out), false);
  assert.match(r.run.stderr, /prose/);
});

test('one judgment is enough for a surface, and a fourth gate crosses the threshold', () => {
  assert.equal(render(base([judgment('j')])).run.status, 0);
  assert.equal(render(base([gate('a'), gate('b'), gate('c')])).run.status, 3);
  assert.equal(render(base([gate('a'), gate('b'), gate('c'), gate('d')])).run.status, 0);
});

test('when every item is left to the decider the page reports that as a finding', () => {
  const all = render(base([judgment('a'), gate('b')]));
  assert.equal(opens(all.page(), 'p', (a) => a['data-finding'] === 'all-decider').length, 1);
  const some = render(base([judgment('a'), gate('b', { answerer: 'artifact' })]));
  assert.equal(opens(some.page(), 'p', (a) => a['data-finding']).length, 0);
});

test('with no --out the surface lands beside the material, named for it', () => {
  const root = setup(base([judgment('j')]));
  const run = cli(root, 'decisions.json', '--json');
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.equal(result.out, join(root, 'spec.decision.html'));
  assert.equal(existsSync(join(root, 'spec.decision.html')), true);
});

test('a second render of the same file writes nothing', () => {
  const root = setup(base([judgment('j')]));
  assert.equal(JSON.parse(cli(root, 'decisions.json', '--json').stdout).written, true);
  assert.equal(JSON.parse(cli(root, 'decisions.json', '--json').stdout).written, false);
});

test('schema violations exit 2 and name the field', () => {
  const cases = [
    [{ ...valid(), extra: 1 }, 'decisions.(root).extra'],
    [{ items: valid().items }, 'decisions.material'],
    [base([]), 'decisions.items'],
    [base([{ ...gate('a'), kind: 'bogus' }]), 'decisions.items[0].kind'],
    [base([gate('a'), { ...gate('b'), consequence: undefined }]), 'decisions.items[1].consequence'],
    [base([judgment('a', { note: ' ' })]), 'decisions.items[0].note'],
    [base([judgment('a', { source: undefined })]), 'decisions.items[0].source'],
    [base([judgment('a', { mark: 'proven' })]), 'decisions.items[0].mark'],
    [base([judgment('a', { answerer: 'boss' })]), 'decisions.items[0].answerer'],
    [base([judgment('a'), fork('f', { options: ['only'] })]), 'decisions.items[1].options'],
    [base([judgment('a'), fork('f', { options: ['x', 'x'] })]), 'decisions.items[1].options'],
    [base([judgment('a'), fork('f', { options: ['x', 3] })]), 'decisions.items[1].options[1]'],
    [base([judgment('a', { options: ['x', 'y'] })]), 'decisions.items[0].options'],
    [base([judgment('a', { checked: true })]), 'decisions.items[0].checked'],
  ];
  for (const [doc, field] of cases) {
    const r = render(doc);
    assert.equal(r.run.status, 2, field + ': ' + r.run.stderr);
    assert.ok(r.run.stderr.includes(field + ':'), field + ' not named in: ' + r.run.stderr);
    assert.equal(existsSync(r.out), false);
  }
});

test('invalid JSON, a missing file, no path to place the surface and bad usage all exit 2', () => {
  assert.equal(render('{not json').run.status, 2);
  const root = setup(base([judgment('j')]));
  assert.equal(cli(root, 'absent.json').status, 2);
  assert.equal(cli(root).status, 2);
  assert.equal(cli(root, 'decisions.json', '--bogus').status, 2);
  const noPath = setup({ material: { identity: 'pasted text' }, items: [judgment('j')] });
  const run = cli(noPath, 'decisions.json');
  assert.equal(run.status, 2);
  assert.match(run.stderr, /decisions\.material\.path/);
  assert.equal(cli(noPath, 'decisions.json', '--out', join(noPath, 'x', 'o.html')).status, 0);
});
