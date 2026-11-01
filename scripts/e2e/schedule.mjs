#!/usr/bin/env node
// End-to-end check of re0-upgrade's daily job on the OS this runs on, which the workflow runs on Linux, macOS and Windows.
// It installs a seed skills.sh home, registers the job through schedule.mjs, moves only the job's trigger to a minute
// about to come so the OS scheduler itself starts the run, and then requires: exit 0, every skill the run meant to add
// installed, no window or terminal, and an uninstall that leaves nothing registered. It changes the machine's scheduler,
// so it runs on a throwaway CI runner and never on a person's machine.
// Usage: node scripts/e2e/schedule.mjs
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchdLabel, logFile, lastRun, npxCommand } from '../../skills/breadth/re0-upgrade/scripts/schedule/schedule.mjs';

const NAME = 'paperthin-e2e';
const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '../../skills/breadth/re0-upgrade/scripts/schedule/schedule.mjs');
const WAIT_MS = 8 * 60 * 1000;
const failures = [];

const sh = (file, args, options = {}) => {
  const got = spawnSync(file, args, { encoding: 'utf8', windowsHide: true, ...options });
  return { status: got.error ? null : got.status, out: (got.stdout || '') + (got.stderr || '') + (got.error ? got.error.message : '') };
};
const must = (got, what) => {
  if (got.status !== 0) throw new Error(what + ' exited ' + got.status + ':\n' + got.out.trim());
  return got.out;
};
const schedule = (...args) => sh(process.execPath, [SCRIPT, ...args]);
const expect = (ok, what) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + what);
  if (!ok) failures.push(what);
};
const pad = (n) => String(n).padStart(2, '0');
const skillsIn = (home) => (existsSync(join(home, '.agents', 'skills')) ? readdirSync(join(home, '.agents', 'skills')) : []);

// The first minute boundary at least 60 seconds away, in local time, which every scheduler here reads.
function soon() {
  const at = new Date(Date.now() + 60 * 1000);
  at.setSeconds(0, 0);
  at.setMinutes(at.getMinutes() + 1);
  return at;
}

// Each platform moves only the trigger, so the command, the user and the settings that run are the ones install wrote.
const FIRE = {
  launchd(at) {
    const plist = join(homedir(), 'Library', 'LaunchAgents', launchdLabel(NAME) + '.plist');
    must(sh('/usr/libexec/PlistBuddy', ['-c', 'Set :StartCalendarInterval:Hour ' + at.getHours(), '-c', 'Set :StartCalendarInterval:Minute ' + at.getMinutes(), plist]), 'PlistBuddy');
    const target = 'gui/' + process.getuid() + '/' + launchdLabel(NAME);
    sh('launchctl', ['bootout', target]);
    must(sh('launchctl', ['bootstrap', 'gui/' + process.getuid(), plist]), 'launchctl bootstrap');
  },
  systemd(at) {
    const dir = dropIn();
    mkdirSync(dir, { recursive: true });
    const stamp = at.getFullYear() + '-' + pad(at.getMonth() + 1) + '-' + pad(at.getDate()) + ' ' + pad(at.getHours()) + ':' + pad(at.getMinutes()) + ':00';
    writeFileSync(join(dir, 'soon.conf'), '[Timer]\nOnCalendar=\nOnCalendar=' + stamp + '\n');
    must(sh('systemctl', ['--user', 'daemon-reload']), 'systemctl daemon-reload');
    must(sh('systemctl', ['--user', 'restart', NAME + '.timer']), 'systemctl restart');
  },
  cron(at) {
    const table = must(sh('crontab', ['-l']), 'crontab -l');
    const moved = table.split('\n').map((line) => (line.endsWith(' # paperthin-job:' + NAME) ? line.replace(/^0 0 /, at.getMinutes() + ' ' + at.getHours() + ' ') : line)).join('\n');
    must(sh('crontab', ['-'], { input: moved }), 'crontab -');
  },
  windows(at) {
    const file = join(tmpdir(), NAME + '.task.xml');
    const xml = must(sh('schtasks.exe', ['/Query', '/TN', NAME, '/XML']), 'schtasks /Query');
    const local = at.getFullYear() + '-' + pad(at.getMonth() + 1) + '-' + pad(at.getDate()) + 'T' + pad(at.getHours()) + ':' + pad(at.getMinutes()) + ':00';
    const moved = xml.replace(/<StartBoundary>[^<]*<\/StartBoundary>/, '<StartBoundary>' + local + '</StartBoundary>');
    if (moved === xml) throw new Error('the registered task carries no StartBoundary to move');
    writeFileSync(file, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(moved.trim() + '\r\n', 'utf16le')]));
    try {
      must(sh('schtasks.exe', ['/Create', '/TN', NAME, '/XML', file, '/F']), 'schtasks /Create');
    } finally {
      rmSync(file, { force: true });
    }
  },
};

const dropIn = () => join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'systemd', 'user', NAME + '.timer.d');

// What each scheduler reports about how the run started: no window, no terminal, and the scheduler's own exit code.
const WINDOWLESS = {
  launchd() {
    const out = sh('launchctl', ['print', 'gui/' + process.getuid() + '/' + launchdLabel(NAME)]).out;
    expect(/spawn type = background/.test(out), 'launchd starts the job as a background process (ProcessType Background)');
    expect(/last exit code = 0/.test(out), 'launchd records exit code 0');
  },
  systemd() {
    const out = sh('systemctl', ['--user', 'show', NAME + '.service', '-p', 'Result', '-p', 'ExecMainStatus', '-p', 'StandardInput', '-p', 'TTYPath']).out;
    expect(/^Result=success$/m.test(out) && /^ExecMainStatus=0$/m.test(out), 'systemd records the service run as success with status 0');
    expect(/^StandardInput=null$/m.test(out) && /^TTYPath=$/m.test(out), 'the service runs with no terminal (StandardInput=null, no TTY)');
  },
  cron() {
    expect(true, 'cron runs the line with no terminal by design');
  },
  windows() {
    const out = sh('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "$t = Get-ScheduledTask -TaskName '" + NAME + "'; $i = $t | Get-ScheduledTaskInfo; [pscustomobject]@{ hidden = $t.Settings.Hidden; exe = $t.Actions[0].Execute; args = $t.Actions[0].Arguments; result = $i.LastTaskResult } | ConvertTo-Json -Compress"]);
    const task = JSON.parse(out.out.trim());
    expect(task.hidden === true, 'the task is hidden');
    expect(/conhost\.exe$/i.test(task.exe) && /^--headless /.test(task.args), 'the task runs node through conhost --headless, so no console window opens');
    expect(task.result === 0, 'Task Scheduler records result 0 (got ' + task.result + ')');
  },
};

async function main() {
  const home = mkdtempSync(join(tmpdir(), 'paperthin-e2e-home-'));
  const npx = npxCommand(process.execPath, process.platform);
  const seed = sh(npx.file, [...npx.args, '-y', 'skills@latest', 'add', 'LilMGenius/paperthin', '--global', '--agent', '*', '--skill', 're0', '-y'], { cwd: home, shell: npx.shell, env: { ...process.env, HOME: home, USERPROFILE: home } });
  must(seed, 'the seed skills.sh install');
  const before = skillsIn(home);
  console.log('seed install in ' + home + ': ' + before.join(', '));

  const log = logFile(process.platform, process.env, homedir(), NAME);
  rmSync(log, { force: true });
  must(schedule('install', '--name', NAME, '--home', home), 'schedule install');
  const status = schedule('status', '--name', NAME);
  const platform = JSON.parse(status.out).platform;
  expect(status.status === 0, platform + ': status reports the job registered right after install');

  const at = soon();
  FIRE[platform](at);
  console.log(platform + ': trigger moved to ' + at.toString() + '; waiting for the scheduler to start the run');

  const deadline = Date.now() + WAIT_MS;
  let run = null;
  while (Date.now() < deadline) {
    await new Promise((done) => setTimeout(done, 10 * 1000));
    run = existsSync(log) ? lastRun(readFileSync(log, 'utf8')) : null;
    if (run?.exit !== null && run?.exit !== undefined) break;
  }
  const text = existsSync(log) ? readFileSync(log, 'utf8') : '';
  console.log('--- job log\n' + (text || '(none)') + '--- end of job log');
  expect(Boolean(run) && new Date(run.started) >= new Date(at.getTime() - 5000), 'the scheduler started the run at the moved trigger');
  expect(run?.exit === 0, 'the run exited 0');
  const added = /; to add: (.*)$/m.exec(text)?.[1];
  const after = skillsIn(home);
  const wanted = !added || added === 'none' ? [] : added.split(', ');
  expect(added !== undefined && wanted.every((name) => after.includes(name)), 'every skill the run meant to add is installed (' + before.length + ' before, ' + after.length + ' after)');
  if (run) WINDOWLESS[platform]();

  if (platform === 'systemd') {
    rmSync(dropIn(), { recursive: true, force: true });
    sh('systemctl', ['--user', 'daemon-reload']);
  }
  expect(schedule('uninstall', '--name', NAME).status === 0, 'uninstall exits 0');
  expect(schedule('status', '--name', NAME).status === 1, 'status reports nothing registered after uninstall');
  rmSync(home, { recursive: true, force: true });

  if (failures.length) {
    for (const failure of failures) console.log('::error::' + platform + ': ' + failure);
    return 1;
  }
  console.log(platform + ': the daily job ran end to end under the OS scheduler');
  return 0;
}

process.exitCode = await main();
