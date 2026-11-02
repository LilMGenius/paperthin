// Plants one defect at a time into ssotize-local's identity.mjs and requires the tests that guard it to go red, so a run
// on each OS proves the platform tests can fail there. A mutant whose tests all skip on this host is reported as not
// applicable; one whose tests run and stay green is a survivor and fails the run. The script is restored after each.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scripts = join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), 'skills', 'breadth', 'ssotize-local', 'scripts');
const target = join(scripts, 'identity.mjs');
const original = readFileSync(target, 'utf8');
const throughLink = "() => { fs.rmSync(fs.realpathSync(alias), { recursive: true, force: true }); ai.mechanism === 'junction' ? fs.rmdirSync(alias) : fs.unlinkSync(alias); }";
const entryOnly = "() => ai.mechanism === 'junction' ? fs.rmdirSync(alias) : fs.unlinkSync(alias)";
const mutants = [
  ['directory hardlink refusal removed', "if (ci.type === 'directory' && mechanism === 'hardlink') fail('Directory hardlinks are impossible: ' + canonical);", '', 'a directory hardlink is refused'],
  ['unlink skips restoring the independent entry', "operation('fs.renameSync restore independent entry', [staged, alias], () => fs.renameSync(staged, alias));", '', 'a directory symlink installs'],
  ['symlink unlink deletes through the link', entryOnly, throughLink, 'a directory symlink installs'],
  ['junction reparse tag misread', '/0xa0000003/i', '/0xdeadbeef/i', 'a junction installs'],
  ['junction unlink deletes through the link', entryOnly, throughLink, 'a junction installs'],
  ['hardlink falls back to a copy', "mechanism === 'hardlink' ? fs.linkSync(canonical, staged)", "mechanism === 'hardlink' ? fs.copyFileSync(canonical, staged)", 'hardlink'],
  ['cross-volume hardlink silently copied', "mechanism === 'hardlink' ? fs.linkSync(canonical, staged)", "mechanism === 'hardlink' ? (fs.statSync(canonical).dev === fs.statSync(path.dirname(staged)).dev ? fs.linkSync(canonical, staged) : fs.copyFileSync(canonical, staged))", 'across volumes'],
];

let survivors = 0;
try {
  for (const [name, from, to, pattern] of mutants) {
    if (!original.includes(from)) throw new Error('mutation site missing for: ' + name);
    writeFileSync(target, original.replace(from, to));
    const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', '--test-name-pattern=' + pattern, join(scripts, 'identity.test.mjs')], { encoding: 'utf8' });
    const results = run.stdout.split('\n').filter((line) => /^(not )?ok \d/.test(line));
    const failed = results.filter((line) => line.startsWith('not ok'));
    const ran = results.filter((line) => !/# SKIP/.test(line));
    const verdict = failed.length ? 'killed' : ran.length ? 'SURVIVED' : 'not applicable';
    if (verdict === 'SURVIVED') survivors++;
    console.log(verdict + ': ' + name + '\n  ' + results.join('\n  '));
  }
} finally {
  writeFileSync(target, original);
}
if (readFileSync(target, 'utf8') !== original) throw new Error('identity.mjs was not restored');
process.exitCode = survivors ? 1 : 0;
