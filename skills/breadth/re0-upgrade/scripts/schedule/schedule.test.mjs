import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cronInstall, cronRemove, jobArgs, lastRun, launchdPlist, logFile, namesToAdd, npxCommand, rotate, systemdUnits, tagFromRedirect, windowsTask } from './schedule.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), 're0-schedule-'));
// Every CLI call goes through a junction to this folder, the way an installed skill links its source.
symlinkSync(here, join(scratch, 'schedule'), process.platform === 'win32' ? 'junction' : 'dir');
const cli = join(scratch, 'schedule', 'schedule.mjs');
process.on('exit', () => rmSync(scratch, { recursive: true, force: true }));
const run = (args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

const job = { name: 'paperthin-update', node: '/opt/node 26/bin/node', script: '/home/u/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs' };
const argv = jobArgs(job);

test('the job runs the script verb run under its own name, carrying --home only when one is given', () => {
  assert.deepEqual(argv, [job.node, job.script, 'run', '--name', 'paperthin-update']);
  assert.deepEqual(jobArgs({ ...job, home: '/tmp/h' }).slice(-2), ['--home', '/tmp/h']);
});

test('the latest tag is read from the redirect github.com answers, and a page with no release names none', () => {
  assert.equal(tagFromRedirect('https://github.com/LilMGenius/paperthin/releases/tag/v0.17.7'), 'v0.17.7');
  assert.equal(tagFromRedirect('https://github.com/o/r/releases/tag/release%2F1.0'), 'release/1.0');
  assert.equal(tagFromRedirect('https://github.com/LilMGenius/paperthin/releases'), null, 'a repository with no release redirects to the list');
  assert.equal(tagFromRedirect(null), null);
});

test('the Windows task fires daily at local 00:00, hidden, unelevated, through a headless console', () => {
  const xml = windowsTask({ ...job, node: 'C:\\Program Files\\nodejs\\node.exe', script: 'C:\\Users\\a b\\x & y\\schedule.mjs', user: 'PC\\u', conhost: 'C:\\Windows\\System32\\conhost.exe' });
  assert.match(xml, /<StartBoundary>\d{4}-\d\d-\d\dT00:00:00<\/StartBoundary>/, 'a local time carries no Z or offset');
  assert.match(xml, /<ScheduleByDay>\s*<DaysInterval>1<\/DaysInterval>\s*<\/ScheduleByDay>/);
  assert.match(xml, /<LogonType>InteractiveToken<\/LogonType>/);
  assert.match(xml, /<RunLevel>LeastPrivilege<\/RunLevel>/);
  assert.match(xml, /<UserId>PC\\u<\/UserId>/);
  assert.match(xml, /<Hidden>true<\/Hidden>/);
  assert.match(xml, /<StartWhenAvailable>true<\/StartWhenAvailable>/, 'a machine asleep at midnight runs at wake');
  assert.match(xml, /<Command>C:\\Windows\\System32\\conhost\.exe<\/Command>/);
  assert.match(xml, /<Arguments>--headless "C:\\Program Files\\nodejs\\node\.exe" "C:\\Users\\a b\\x &amp; y\\schedule\.mjs" run --name paperthin-update<\/Arguments>/);
});

test('the launchd agent fires at Hour 0 Minute 0 with each argument as its own string', () => {
  const plist = launchdPlist({ ...job, script: '/a/<b>.mjs' });
  assert.match(plist, /<key>Label<\/key>\s*<string>com\.lilmgenius\.paperthin-update<\/string>/);
  assert.match(plist, /<key>StartCalendarInterval<\/key>\s*<dict>\s*<key>Hour<\/key>\s*<integer>0<\/integer>\s*<key>Minute<\/key>\s*<integer>0<\/integer>\s*<\/dict>/);
  assert.match(plist, /<string>\/opt\/node 26\/bin\/node<\/string>\s*<string>\/a\/&lt;b&gt;\.mjs<\/string>\s*<string>run<\/string>/);
  assert.doesNotMatch(plist, /RunAtLoad/);
});

test('the systemd timer fires on calendar 00:00 local, catches up after downtime and starts a oneshot service', () => {
  const { service, timer } = systemdUnits({ ...job, script: '/a/100%/$x.mjs' });
  assert.match(timer, /^OnCalendar=\*-\*-\* 00:00:00$/m);
  assert.match(timer, /^Persistent=true$/m);
  assert.match(timer, /^Unit=paperthin-update\.service$/m);
  assert.match(timer, /^WantedBy=timers\.target$/m);
  assert.match(service, /^Type=oneshot$/m);
  assert.match(service, /^ExecStart="\/opt\/node 26\/bin\/node" "\/a\/100%%\/\$\$x\.mjs" "run" "--name" "paperthin-update"$/m);
});

test('the cron line runs at minute 0 hour 0, replaces only its own marked line and removes only that line', () => {
  const others = '# mine\n5 4 * * * backup\n';
  const once = cronInstall(others, job);
  assert.equal(once, others + "0 0 * * * '/opt/node 26/bin/node' '" + job.script + "' 'run' '--name' 'paperthin-update' # paperthin-job:paperthin-update\n");
  assert.equal(cronInstall(once, job), once, 'a second install leaves one line');
  assert.ok(cronInstall('', { ...job, script: "/it's.mjs" }).includes(" '/it'\\''s.mjs' "), 'a quote in a path is closed, escaped and reopened');
  assert.equal(cronRemove(once + '1 1 * * * x # paperthin-job:other\n', 'paperthin-update'), others + '1 1 * * * x # paperthin-job:other\n');
});

test('the catalog diff adds every latest catalog name not installed, and nothing where paperthin is not installed at all', () => {
  const catalog = ['re0', 'sip', 'new-one', 're0-upgrade'];
  assert.deepEqual(namesToAdd(catalog, ['re0', 'sip', 're0-upgrade', 'someone-else']), ['new-one']);
  assert.deepEqual(namesToAdd(catalog, ['re0', 'sip', 'new-one', 're0-upgrade']), []);
  assert.deepEqual(namesToAdd(catalog, ['someone-else']), [], 'the job never installs paperthin from nothing');
});

const block = (n, exit) => '=== run 2026-11-0' + n + 'T00:00:00.000Z\nout ' + n + '\n' + (exit === undefined ? '' : '=== exit ' + exit + ' 2026-11-0' + n + 'T00:01:00.000Z\n');

test('the log keeps the last N runs and reports the newest, a crashed run without an exit line included', () => {
  let log = '';
  for (let n = 1; n <= 5; n += 1) log = rotate(log, block(n, n === 4 ? 1 : 0), 3);
  assert.equal(log, block(3, 0) + block(4, 1) + block(5, 0));
  assert.deepEqual(lastRun(log), { started: '2026-11-05T00:00:00.000Z', ended: '2026-11-05T00:01:00.000Z', exit: 0 });
  assert.deepEqual(lastRun(rotate(log, block(6), 3)), { started: '2026-11-06T00:00:00.000Z', ended: null, exit: null });
  assert.equal(lastRun(''), null);
});

test('one known log path per OS', () => {
  assert.equal(logFile('win32', { LOCALAPPDATA: 'C:\\L' }, 'C:\\U', 'n'), join('C:\\L', 'paperthin', 'logs', 'n.log'));
  assert.equal(logFile('darwin', {}, '/Users/u', 'n'), join('/Users/u', 'Library', 'Logs', 'paperthin', 'n.log'));
  assert.equal(logFile('linux', {}, '/home/u', 'n'), join('/home/u', '.local', 'state', 'paperthin', 'n.log'));
  assert.equal(logFile('linux', { XDG_STATE_HOME: '/s' }, '/home/u', 'n'), join('/s', 'paperthin', 'n.log'));
});

test('npx runs as node plus npm npx-cli.js beside the node binary, never a bare npx.cmd without a shell', () => {
  const win = 'C:\\Program Files\\nodejs\\node.exe';
  const winCli = join(dirname(win), 'node_modules', 'npm', 'bin', 'npx-cli.js');
  assert.deepEqual(npxCommand(win, 'win32', (p) => p === winCli), { file: win, args: [winCli], shell: false });
  const posixCli = join(dirname('/usr/local/bin/node'), '..', 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js');
  assert.deepEqual(npxCommand('/usr/local/bin/node', 'linux', (p) => p === posixCli), { file: '/usr/local/bin/node', args: [posixCli], shell: false });
  assert.deepEqual(npxCommand(win, 'win32', () => false), { file: 'npx.cmd', args: [], shell: true });
  assert.deepEqual(npxCommand(process.execPath, process.platform).file, process.execPath, 'this machine resolves npx-cli.js');
});

test('usage errors exit 2 and help exits 0 through the junction', () => {
  assert.equal(run(['--help']).status, 0);
  for (const args of [[], ['frobnicate'], ['status', '--name', '../x'], ['status', '--home', scratch], ['uninstall', '--home', scratch], ['install', '--bogus']]) {
    const out = run(args);
    assert.equal(out.status, 2, args.join(' ') + ': ' + out.stdout + out.stderr);
    assert.match(out.stderr, /^re0-upgrade schedule: /);
  }
  assert.equal(run(['run', '--home', join(scratch, 'missing')]).status, 2, 'a --home that does not exist');
});

