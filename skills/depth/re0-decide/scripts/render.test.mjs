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
const base = (items, material) => ({ material: { identity: 'spec.md @ abc123', path: 'spec.md', ...material }, items });
// Six decider controls, past the five a numbered list in chat carries comfortably, so the file earns a surface on count alone.
const many = () => [judgment('j1'), judgment('j2'), fork('f1'), fork('f2'), fork('f3'), gate('g1')];

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
], { handoff: 'the release owner who runs the rollout' });

test('a valid file renders one self-contained surface with the controls each kind is assigned', () => {
  const r = render(valid());
  assert.equal(r.run.status, 0, r.run.stderr);
  const page = r.page();
  const radios = (kind) => opens(page, 'input', (a) => a['data-kind'] === kind);
  // A gate or judgment is a met / not met pair, so an unanswered item reads apart from one answered not met.
  assert.equal(radios('gate').length, 8);
  assert.equal(radios('judgment').length, 2);
  assert.ok(radios('gate').concat(radios('judgment')).every((i) => i.attrs.type === 'radio'));
  assert.deepEqual([...new Set(radios('gate').map((i) => i.attrs.value))].sort(), ['met', 'unmet']);
  // A fork is one card per named option, never a dropdown.
  assert.equal(radios('fork').length, 2);
  assert.equal(opens(page, 'select').length, 0);
  assert.equal(opens(page, 'textarea').length, 0);
  assert.equal(opens(page, 'input', (a) => a.type === 'text').length, 0);
  // Intervention, exclusion, risk and missing items render as tagged text with no control.
  assert.equal(opens(page, 'input').length, 12);
  for (const kind of ['intervention', 'exclusion', 'risk', 'missing']) assert.equal(opens(page, 'div', (a) => a['data-kind'] === kind).length, 1);
  assert.ok(opens(page, 'button', (a) => a.id === 'copy').length === 1);
  assert.ok(opens(page, 'span', (a) => a.id === 'verdict-state').length === 1);
});

test('no control begins checked or preselected', () => {
  const page = render(valid()).page();
  assert.ok(opens(page, 'input').length > 0);
  assert.ok(opens(page, 'input').every((i) => !('checked' in i.attrs)));
  assert.equal(opens(page, 'option').length, 0);
});

test('the decider path comes first, one screen per control, and every other item folds into a counted section', () => {
  const page = render(valid()).page();
  // Steps: the decider's forks first, since they are the decisions, then judgments, then the gates the decider checks, then the record.
  const steps = opens(page, 'section', (a) => 'data-step' in a);
  assert.deepEqual(steps.map((s) => s.attrs['data-kind']), ['fork', 'judgment', 'gate', 'record']);
  // The rail lists every step once, in the same order, so the decider can jump.
  const rail = opens(page, 'button', (a) => 'data-goto' in a).map((b) => b.attrs['data-goto']);
  assert.deepEqual(rail, steps.map((s) => s.attrs['data-step']));
  // Everything a non-decider answers sits in one folded block, grouped and counted, after the path.
  const folded = opens(page, 'details', (a) => a.id === 'others');
  assert.equal(folded.length, 1);
  assert.ok(!('open' in folded[0].attrs));
  const groups = opens(page, 'section', (a) => 'data-answerer' in a).map((s) => s.attrs['data-answerer']);
  assert.deepEqual(groups, ['artifact', 'submitter', 'delegate']);
  const order = page.all.filter((t) => !t.close && ((t.name === 'section' && 'data-step' in t.attrs) || (t.name === 'details' && t.attrs.id === 'others'))).map((t) => t.attrs.id === 'others' ? 'others' : 'step');
  assert.equal(order.at(-1), 'others');
  assert.ok(page.texts.some((t) => /4 items/.test(t)), 'the folded block states how many items it holds');
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
  const verdictOf = new Function(script.match(/function verdictOf[^\n]*/)[0] + '; return verdictOf;')();
  assert.equal(verdictOf(1, 1, 1), 'blocked');
  assert.equal(verdictOf(0, 1, 0), 'conditional');
  assert.equal(verdictOf(0, 0, 1), 'conditional', 'an unchosen fork keeps the verdict from clear');
  assert.equal(verdictOf(0, 0, 0), 'clear');
  assert.match(script, /data-defer/, 'a deferring choice is read from the page, so it keeps the verdict open');
});

test('submitted text reaches the page as text and never as markup, attribute, script or handler', () => {
  const evil = '<img src=x onerror=alert(1)> "q" \'s\' & </script><script>alert(2)</script>';
  const doc = base([
    gate(evil, { consequence: evil, source: evil, answerer: 'decider' }),
    gate('b'), gate('c'), gate('d'),
    judgment(evil, { note: evil }),
    fork(evil, { options: [{ label: evil, detail: evil, consequence: evil }, 'ok'], fallback: evil, title: evil, quote: [evil, evil + '2'] }),
    gate('e'), gate('f'),
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

test('text-only forks a chat list carries get no surface and exit 3', () => {
  const r = render(base([gate('a'), judgment('b'), fork('c'), item({ kind: 'exclusion', text: 'x' })]));
  assert.equal(r.run.status, 3);
  assert.equal(existsSync(r.out), false);
  assert.match(r.run.stderr, /numbered list/);
  // Gates others answer do not count toward the decider's load.
  assert.equal(render(base([gate('a', { answerer: 'artifact' }), gate('b', { answerer: 'artifact' }), gate('c', { answerer: 'artifact' }), gate('d', { answerer: 'artifact' }), judgment('j')])).run.status, 3);
});

test('a surface is built for more than five decider answers, an option image, or a named hand-off reader', () => {
  assert.equal(render(base(many().slice(0, 5))).run.status, 3);
  assert.equal(render(base(many())).run.status, 0);
  assert.equal(render(base([judgment('j')], { handoff: 'the engineer who ships it' })).run.status, 0);
  const root = setup(base([fork('pick a photo', { options: [{ label: 'one', image: 'a.png' }, 'two'] })]));
  writeFileSync(join(root, 'a.png'), PNG);
  assert.equal(cli(root, 'decisions.json', '--out', join(root, 'o.html')).status, 0);
});

test('when every item is left to the decider the page reports that as a finding', () => {
  const all = render(base([judgment('a'), gate('b')], { handoff: 'h' }));
  assert.equal(opens(all.page(), 'p', (a) => a['data-finding'] === 'all-decider').length, 1);
  const some = render(base([judgment('a'), gate('b', { answerer: 'artifact' })], { handoff: 'h' }));
  assert.equal(opens(some.page(), 'p', (a) => a['data-finding']).length, 0);
});

test('with no --out the surface lands beside the material, named for it', () => {
  const root = setup(base(many()));
  const run = cli(root, 'decisions.json', '--json');
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.equal(result.out, join(root, 'spec.decision.html'));
  assert.equal(existsSync(join(root, 'spec.decision.html')), true);
});

test('a second render of the same file writes nothing', () => {
  const root = setup(base(many()));
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
    [base([judgment('a'), fork('f', { options: [{ label: 'x', colour: 'red' }, 'y'] })]), 'decisions.items[1].options[0].colour'],
    [base([judgment('a'), fork('f', { options: [{ detail: 'no label' }, 'y'] })]), 'decisions.items[1].options[0].label'],
    [base([judgment('a'), fork('f', { options: [{ label: 'x' }, 'x'] })]), 'decisions.items[1].options'],
    [base([judgment('a'), fork('f', { options: [{ label: 'x', defer: 'yes' }, 'y'] })]), 'decisions.items[1].options[0].defer'],
    [base([judgment('a'), fork('f', { options: [{ label: 'x', image: 'missing.png' }, 'y'] })]), 'decisions.items[1].options[0].image'],
    [base([judgment('a'), fork('f', { options: [{ label: 'x', image: 'notes.txt' }, 'y'] })]), 'decisions.items[1].options[0].image'],
    [base([judgment('a', { quote: 3 })]), 'decisions.items[0].quote'],
    [base([judgment('a', { quote: ['ok', ''] })]), 'decisions.items[0].quote[1]'],
    [base([judgment('a', { title: ' ' })]), 'decisions.items[0].title'],
    [base([judgment('a')], { handoff: '' }), 'decisions.material.handoff'],
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
  const root = setup(base(many()));
  assert.equal(cli(root, 'absent.json').status, 2);
  assert.equal(cli(root).status, 2);
  assert.equal(cli(root, 'decisions.json', '--bogus').status, 2);
  const noPath = setup({ material: { identity: 'pasted text' }, items: many() });
  const run = cli(noPath, 'decisions.json');
  assert.equal(run.status, 2);
  assert.match(run.stderr, /decisions\.material\.path/);
  assert.equal(cli(noPath, 'decisions.json', '--out', join(noPath, 'x', 'o.html')).status, 0);
});

// A 1x1 transparent PNG, the smallest real image a test can embed.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

test('an option naming an image shows it in its card, embedded so the page stays one file', () => {
  const doc = base([fork('Pick the photo', { options: [{ label: 'stage', image: 'img/stage.png', detail: 'both on stage', consequence: 'hero image' }, 'none'] }), ...many()]);
  const root = setup(doc);
  mkdirSync(join(root, 'img'));
  writeFileSync(join(root, 'img', 'stage.png'), PNG);
  const out = join(root, 'o.html');
  const run = cli(root, 'decisions.json', '--out', out);
  assert.equal(run.status, 0, run.stderr);
  const html = readFileSync(out, 'utf8');
  const page = parse(html);
  const imgs = opens(page, 'img');
  assert.equal(imgs.length, 1);
  assert.equal(imgs[0].attrs.src, 'data:image/png;base64,' + PNG.toString('base64'));
  assert.ok(imgs[0].attrs.alt.includes('stage'));
  assert.ok(page.texts.includes('both on stage'));
  assert.ok(page.texts.includes('hero image'));
  assert.doesNotMatch(html, /img\/stage\.png/);
});

test('an image over the size an embedded page can carry exits 2 naming the option', () => {
  const root = setup(base([fork('f', { options: [{ label: 'big', image: 'big.jpg' }, 'small'] }), ...many()]));
  writeFileSync(join(root, 'big.jpg'), Buffer.alloc(1024 * 1024 + 1));
  const run = cli(root, 'decisions.json', '--out', join(root, 'o.html'));
  assert.equal(run.status, 2);
  assert.match(run.stderr, /decisions\.items\[0\]\.options\[0\]\.image: .*downscale/);
});

test('the cited source text sits on the item itself, so deciding needs no outside read', () => {
  const page = render(base([judgment('j', { quote: ['line 29 says the score moved', 'line 55 places it'] }), ...many()])).page();
  const quotes = opens(page, 'blockquote');
  assert.ok(quotes.length >= 1);
  assert.ok(page.texts.includes('line 29 says the score moved'));
  assert.ok(page.texts.includes('line 55 places it'));
});

test('a short title names the step in the rail and the record while the full text stays on its screen', () => {
  const page = render(base([fork('A long context sentence the material gives about the first screen', { title: 'Hero direction' }), ...many()])).page();
  const rail = opens(page, 'button', (a) => a['data-goto'] === '0');
  assert.equal(rail.length, 1);
  assert.ok(page.texts.includes('Hero direction'));
  assert.ok(page.texts.includes('A long context sentence the material gives about the first screen'));
});

test('an option that defers the decision is marked so choosing it keeps the verdict open', () => {
  const page = render(base([fork('f', { options: ['go', { label: 'wait for more candidates', defer: true }] }), ...many()])).page();
  const deferred = opens(page, 'input', (a) => a['data-defer'] === 'true');
  assert.equal(deferred.length, 1);
});

test('answers are saved per material version, so a reload keeps them and a changed file starts empty', () => {
  const key = (doc) => opens(render(doc).page(), 'body')[0].attrs['data-store'];
  const a = key(base(many()));
  assert.match(a, /^re0-decide:[0-9a-f]{16}$/);
  assert.equal(key(base(many())), a);
  const changed = base(many());
  changed.items[0].text = 'j1 reworded';
  assert.notEqual(key(changed), a);
});

test('page wording follows the material language, Korean verdict words included, with English as the default', () => {
  const en = render(valid());
  assert.match(en.html(), /<html lang="en">/);
  assert.ok(en.page().texts.includes('Not met'));
  const doc = valid();
  doc.material.lang = 'ko';
  const ko = render(doc);
  assert.equal(ko.run.status, 0, ko.run.stderr);
  const page = ko.page();
  assert.match(ko.html(), /<html lang="ko">/);
  assert.ok(page.texts.includes('미충족'));
  assert.ok(!page.texts.includes('Not met'));
  const script = ko.html().match(/<script>([\s\S]*)<\/script>/)[1];
  // The page script shows the verdict through the wording table the renderer writes on the page body.
  const words = JSON.parse(opens(page, 'body')[0].attrs['data-words'].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'));
  assert.deepEqual(words.state, { blocked: '막힘', conditional: '조건부', clear: '통과' });
  assert.match(script, /data-words/);
  // The verdict state the page computes stays one of the three rule words whatever language it is shown in.
  const verdictOf = new Function(script.match(/function verdictOf[^\n]*/)[0] + '; return verdictOf;')();
  assert.equal(verdictOf(1, 0, 0), 'blocked');
  const bad = valid();
  bad.material.lang = 'fr';
  const r = render(bad);
  assert.equal(r.run.status, 2);
  assert.match(r.run.stderr, /decisions\.material\.lang/);
});

