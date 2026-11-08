import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { audit, detectKind, auditHost, readHost, InputError } from './audit.mjs';

const here = dirname(fileURLToPath(import.meta.url));

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'audit-'));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

const ids = (side) => side.hits.map((hit) => hit.id + ':' + hit.line);

test('detects the kind from files, never from prose', () => {
  assert.equal(detectKind(repo({ 'skills/a/one/SKILL.md': 'x', 'skills/a/two/SKILL.md': 'x', 'README.md': 'a cli tool' })), 'skills');
  assert.equal(detectKind(repo({ 'package.json': JSON.stringify({ bin: { tool: 'cli.js' } }) })), 'cli');
  assert.equal(detectKind(repo({ 'package.json': JSON.stringify({ main: 'index.js' }) })), 'library');
  assert.equal(detectKind(repo({ 'package.json': '{}', 'index.html': '<html></html>' })), 'app');
});

test('a check command in an app README fails, in a skills README it is a note until --strict', () => {
  const files = { 'README.md': 'Run it.\n\nThen npm run check before committing.\n', 'AGENTS.md': '# Agents\n' };
  const app = audit(repo(files), { kind: 'app' });
  assert.deepEqual(ids(app.readme), ['R1:3', 'R8:3']);
  assert.equal(app.ok, false);
  const skills = audit(repo(files), { kind: 'skills' });
  assert.equal(skills.ok, true);
  assert.equal(skills.notes, 2);
  assert.equal(audit(repo(files), { kind: 'skills', strict: true }).ok, false);
});

test('a missing AGENTS.md is a failure, a missing README.md is only reported', () => {
  const result = audit(repo({ 'README.md': 'A tool for people.\n' }), { kind: 'library' });
  assert.equal(result.agents.missing, true);
  assert.equal(result.fails, 1);
  const noReadme = audit(repo({ 'AGENTS.md': '# Agents\n' }), { kind: 'library' });
  assert.equal(noReadme.readme.missing, true);
  assert.equal(noReadme.ok, true);
});

test('a local-only path is one the repository ignores, so a tracked dot folder is not flagged', () => {
  const root = repo({
    '.gitignore': '/.state/\n*.local*\n!.keep\n',
    'README.md': 'See .agents/contract.md for the contract.\nProgress lives in .state/run.json.\nDraft in notes.local.md.\n',
    'AGENTS.md': '# Agents\n',
  });
  const result = audit(root, { kind: 'app' });
  assert.deepEqual(result.localDirs, ['.state']);
  assert.deepEqual(ids(result.readme), ['R5:2', 'R5:3']);
  assert.deepEqual(ids(audit(root, { kind: 'app', loopDirs: ['.agents'] }).readme), ['R5:1', 'R5:2', 'R5:3']);
});

test('a fence whose first command is a check is reported once at the fence', () => {
  const root = repo({ 'README.md': 'Setup:\n\n\x60\x60\x60bash\npnpm test\nmore\n\x60\x60\x60\n', 'AGENTS.md': '# Agents\n' });
  assert.deepEqual(ids(audit(root, { kind: 'cli' }).readme), ['R9:3']);
});

test('AGENTS.md carrying an image, a badge or a pitch fails in every kind', () => {
  const root = repo({ 'README.md': 'A tool.\n', 'AGENTS.md': '![shot](docs/a.png)\n[![ci](https://img.shields.io/x)](y)\nThe best way to work.\n' });
  for (const kind of ['app', 'cli', 'library', 'skills']) assert.deepEqual(ids(audit(root, { kind }).agents), ['A1:1', 'A2:2', 'A3:3']);
});

test('manifests answer to the repository name, its own addresses, and the skill folders they ship', () => {
  const root = repo({
    'AGENTS.md': '# Agents\n',
    'package.json': JSON.stringify({ name: 'tool-checks' }),
    '.claude-plugin/plugin.json': JSON.stringify({ name: 'Tool', skills: ['./alpha', './gone'] }),
    'alpha/SKILL.md': 'x', 'alpha/agents/openai.yaml': 'default_prompt: "Use $alpha."\n',
    'beta/SKILL.md': 'x',
  });
  const named = (dir) => dir.split(/[\\/]/).at(-1);
  const result = audit(root, { kind: 'skills' });
  assert.equal(result.manifests.repository, named(root));
  assert.deepEqual(result.manifests.hits.map((h) => h.id + ' ' + h.file), [
    'M1 .claude-plugin/plugin.json', 'M3 .claude-plugin/plugin.json', 'M3 .claude-plugin/plugin.json', 'M1 package.json', 'M4 beta/agents/openai.yaml',
  ].sort((a, b) => a.split(' ')[1].localeCompare(b.split(' ')[1]) || a.localeCompare(b)));
  assert.equal(result.ok, false);
  const clean = repo({
    'AGENTS.md': '# Agents\n',
    'alpha/SKILL.md': 'x', 'alpha/agents/openai.yaml': 'default_prompt: "Use $alpha."\n',
  });
  const name = named(clean);
  writeFileSync(join(clean, 'package.json'), JSON.stringify({ name: '@owner/' + name.toUpperCase() }));
  mkdirSync(join(clean, '.claude-plugin'));
  writeFileSync(join(clean, '.claude-plugin', 'plugin.json'), JSON.stringify({ name, skills: ['./alpha'] }));
  assert.deepEqual(audit(clean, { kind: 'skills' }).manifests.hits, []);
});

test('an address naming another repository of the origin owner fails', () => {
  const root = repo({ 'AGENTS.md': '# Agents\n', 'package.json': JSON.stringify({ name: 'kit', repository: 'https://github.com/Me/old-kit', homepage: 'https://github.com/Other/x' }) });
  spawnSync('git', ['init', '-q', root]);
  spawnSync('git', ['-C', root, 'remote', 'add', 'origin', 'https://github.com/Me/kit.git']);
  assert.deepEqual(audit(root, { kind: 'library' }).manifests.hits.map((h) => h.id + ' ' + h.text), ['M2 github.com/Me/old-kit']);
});

test('the CLI runs through a linked skill folder and keeps its exit codes', () => {
  const linkRoot = mkdtempSync(join(tmpdir(), 'audit-link-'));
  const link = join(linkRoot, 'scripts');
  symlinkSync(here, link, process.platform === 'win32' ? 'junction' : 'dir');
  try {
    const red = repo({ 'README.md': 'Run npm test first.\n', 'AGENTS.md': '# Agents\n' });
    const cli = (...args) => spawnSync(process.execPath, [join(link, 'audit.mjs'), ...args], { encoding: 'utf8' });
    const fail = cli(red, '--kind', 'app');
    assert.equal(fail.status, 1);
    assert.match(fail.stdout, /AUDIENCE RED 1/);
    const json = cli(red, '--kind', 'skills', '--json');
    assert.equal(json.status, 0);
    assert.equal(JSON.parse(json.stdout).notes, 1);
    assert.equal(cli(red, '--kind', 'web').status, 2);
    assert.equal(cli(join(red, 'absent')).status, 2);
    assert.match(cli('--rules').stdout, /^R1 /m);
  } finally {
    rmSync(linkRoot, { recursive: true, force: true });
  }
});

test('existing README grouping and status columns surface before the redesign and disappear afterward', () => {
  const read = (name) => readFileSync(join(here, 'fixtures', `vibeghost-${name}.txt`), 'utf8');
  const findings = (name) => audit(repo({ 'README.md': read(name), 'AGENTS.md': '# Agents\n' }), { kind: 'app' }).readme.hits.map((hit) => hit.id);
  assert.ok(findings('before').includes('R10'));
  assert.ok(findings('before').includes('R11'));
  assert.ok(!findings('after').includes('R10'));
  assert.ok(!findings('after').includes('R11'));
});


const png = (w, h, size = 24) => { const b = Buffer.alloc(size); Buffer.from('89504e470d0a1a0a', 'hex').copy(b); b.write('IHDR', 12); b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20); return b; };
const jpeg = (w, h) => Buffer.from([0xff,0xd8,0xff,0xc0,0,11,8,h>>8,h&255,w>>8,w&255,1,1,0x11,0,0xff,0xd9]);
const gif = (w, h) => { const b = Buffer.alloc(10); b.write('GIF89a'); b.writeUInt16LE(w,6); b.writeUInt16LE(h,8); return b; };
const goodHost = () => ({ description: 'A useful tool.', readme: 'A useful tool.\n', topics: ['tool'], homepage: 'https://example.com', customPreview: true, previewUrl: 'https://example.com/image', image: png(1280,640), community: Object.fromEntries(['readme','code_of_conduct','contributing','license','security','issue_template','pull_request_template'].map(k => [k, true])) });
test('host findings identify each planted violation', () => {
  assert.deepEqual(auditHost(goodHost()).findings, []);
  const changes = { H1: s => s.description = 'Different.', H2: s => s.topics = ['Bad Topic'], H3: s => s.topics = Array(21).fill('ok'), H4: s => s.homepage = '', H6: s => s.community.security = null, H7: s => s.readme = 'A useful tool.\n' + 'x'.repeat(500*1024), H8: s => s.image = png(639,320) };
  for (const [id, change] of Object.entries(changes)) { const s = goodHost(); change(s); assert.ok(auditHost(s).findings.some(f => f.id === id), id); }
});
test('a trade-off is offered as an option and never fails, even under strict', () => {
  const s = goodHost(); s.customPreview = false;
  const result = auditHost(s, { strict: true });
  assert.deepEqual(result.findings, []);
  assert.ok(result.options.some(o => o.id === 'H5'));
  assert.equal(result.ok, true);
});
test('preview dimensions and byte limits apply to PNG JPEG and GIF', () => {
  for (const image of [png(1280,640),jpeg(1280,640),gif(1280,640)]) { const s=goodHost(); s.image=image; assert.ok(!auditHost(s).findings.some(f=>f.id==='H8')); }
  for (const image of [png(639,320),jpeg(640,319),gif(1,1),png(1280,640,1000000),Buffer.from('bad')]) { const s=goodHost(); s.image=image; assert.ok(auditHost(s).findings.some(f=>f.id==='H8')); }
});
test('host reader uses four injected calls and rejects failures', () => {
  const calls=[]; const responses=[{description:'A useful tool.',topics:['tool'],homepage:'https://example.com'},{content:Buffer.from('A useful tool.').toString('base64'),encoding:'base64'}, {files:goodHost().community}, {data:{repository:{usesCustomOpenGraphImage:true,openGraphImageUrl:'https://example.com/image'}}}];
  const run=(cmd,args)=> { calls.push([cmd,args]); return {status:0,stdout:JSON.stringify(responses[calls.length-1])}; };
  const surface=readHost('owner/repo',run,()=>png(1280,640)); assert.equal(calls.length,4); assert.equal(calls[3][1][1],'graphql'); assert.equal(surface.description,'A useful tool.');
  assert.throws(()=>readHost('owner/repo',()=>({status:1,stderr:'failed'})),InputError);
});


test('mobile apps need a phone image in the README', () => {
  const files = { 'AGENTS.md': '# Agents\n', 'public/manifest.webmanifest': '{}', 'README.md': '![Desktop](desktop.png)\n' };
  const missing = audit(repo(files), { kind: 'app' });
  assert.equal(missing.ok, false);
  assert.ok(missing.readme.hits.some(hit => hit.id === 'R12'));
  const present = audit(repo({ ...files, 'README.md': '![Desktop](desktop.png)\n![Phone screenshot](phone.png)\n' }), { kind: 'app' });
  assert.equal(present.ok, true);
});


test('viewport, width sweep and store configuration each signal mobile support', () => {
  for (const [path, content] of [
    ['index.html', '<meta name="viewport" content="width=device-width">'],
    ['scripts/sweep.mjs', 'const viewportWidth = 320;'],
    ['capacitor.config.ts', 'export default {};'],
  ]) {
    const files = { 'AGENTS.md': '# Agents\n', 'README.md': '![Desktop](desktop.png)\n', [path]: content };
    const result = audit(repo(files), { kind: 'app' });
    assert.equal(result.ok, false, path);
    assert.ok(result.readme.hits.some(hit => hit.id === 'R12'), path);
    assert.equal(audit(repo({ ...files, 'README.md': '![Phone](phone.png)\n' }), { kind: 'app' }).ok, true, path);
  }
});
