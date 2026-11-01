#!/usr/bin/env node
// Keep a skills.sh install of paperthin current with one per-user OS job, so nobody runs a follow-up step after the
// first install. Claude Code and Codex plugin installs need none of this: each host updates its own marketplace plugins.
// The job runs daily at the user's local 00:00, the day boundary on a round clock mark, so it runs once per calendar day,
// and each adapter catches a missed midnight up at the next login or wake (StartWhenAvailable, Persistent=true, launchd's
// own coalescing). Each run updates every global skill, then adds the latest release's catalog skills that are not
// installed yet, since skills update never adds a skill shipped after the install. No dependencies; per-OS adapters below.
// Usage: node schedule.mjs install [--name <job>] [--home <dir>]
//        node schedule.mjs status [--name <job>]
//        node schedule.mjs run [--name <job>] [--home <dir>]
//        node schedule.mjs uninstall [--name <job>]
// --home points the skills CLI at another home directory (a throwaway one in a test); it is written into the job.
// Exit codes: 0 done (status: the job is registered); 1 a run, a scheduler command or a status lookup failed; 2 usage.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, userInfo } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { readInstalled, readRules } from '../upgrade.mjs';

const USAGE = 'usage: node schedule.mjs install|status|run|uninstall [--name <job>] [--home <dir>]  (--home: install and run only)';
const DEFAULT_NAME = 'paperthin-update';
const JOB_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const KEEP = 10;
const OUTPUT_CAP = 4000;
const STEP_TIMEOUT = 30 * 60 * 1000;
const UPSTREAM = 'LilMGenius/paperthin';
const LATEST = 'https://api.github.com/repos/' + UPSTREAM + '/releases/latest';
const CATALOG_AT = (tag) => 'https://raw.githubusercontent.com/' + UPSTREAM + '/' + encodeURIComponent(tag) + '/skills/breadth/re0-upgrade/SKILL.md';
const CRON_MARK = ' # paperthin-job:';

class Usage extends Error {}

export const jobArgs = ({ node, script, name, home }) => [node, script, 'run', '--name', name, ...(home ? ['--home', home] : [])];

// Element text only, so quotes stay literal.
const xml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The quoting CommandLineToArgvW reads: a run of backslashes is doubled only before a quote.
function winQuote(arg) {
  if (arg && !/[\s"]/.test(arg)) return arg;
  return '"' + arg.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, '$1$1') + '"';
}

// Task Scheduler: a calendar trigger with no offset is local time. InteractiveToken runs only while the user is signed in
// and needs no stored password or elevation; conhost --headless keeps node's console window from opening.
export function windowsTask({ user, conhost, ...job }) {
  return [
    '<?xml version="1.0" encoding="UTF-16"?>',
    '<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">',
    '  <RegistrationInfo>',
    '    <Description>' + xml('Keeps paperthin installed through skills.sh current: daily at local 00:00 it updates global skills and adds new catalog skills. Remove with: node ' + job.script + ' uninstall --name ' + job.name) + '</Description>',
    '  </RegistrationInfo>',
    '  <Triggers>',
    '    <CalendarTrigger>',
    '      <StartBoundary>2026-01-01T00:00:00</StartBoundary>',
    '      <Enabled>true</Enabled>',
    '      <ScheduleByDay>',
    '        <DaysInterval>1</DaysInterval>',
    '      </ScheduleByDay>',
    '    </CalendarTrigger>',
    '  </Triggers>',
    '  <Principals>',
    '    <Principal id="Author">',
    '      <UserId>' + xml(user) + '</UserId>',
    '      <LogonType>InteractiveToken</LogonType>',
    '      <RunLevel>LeastPrivilege</RunLevel>',
    '    </Principal>',
    '  </Principals>',
    '  <Settings>',
    '    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>',
    '    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>',
    '    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>',
    '    <StartWhenAvailable>true</StartWhenAvailable>',
    '    <Hidden>true</Hidden>',
    '    <ExecutionTimeLimit>PT1H</ExecutionTimeLimit>',
    '    <Enabled>true</Enabled>',
    '  </Settings>',
    '  <Actions Context="Author">',
    '    <Exec>',
    '      <Command>' + xml(conhost) + '</Command>',
      '      <Arguments>' + xml(['--headless', ...jobArgs(job).map(winQuote)].join(' ')) + '</Arguments>',
    '    </Exec>',
    '  </Actions>',
    '</Task>',
    '',
  ].join('\r\n');
}

export const launchdLabel = (name) => 'com.lilmgenius.' + name;

export function launchdPlist(job) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<dict>',
    '  <key>Label</key>',
    '  <string>' + xml(launchdLabel(job.name)) + '</string>',
    '  <key>ProgramArguments</key>',
    '  <array>',
    ...jobArgs(job).map((arg) => '    <string>' + xml(arg) + '</string>'),
    '  </array>',
    '  <key>StartCalendarInterval</key>',
    '  <dict>',
    '    <key>Hour</key>',
    '    <integer>0</integer>',
    '    <key>Minute</key>',
    '    <integer>0</integer>',
    '  </dict>',
    '  <key>ProcessType</key>',
    '  <string>Background</string>',
    '</dict>',
    '</plist>',
    '',
  ].join('\n');
}

// systemd unit quoting: double quotes with backslash and quote escaped, % and $ doubled so no specifier or variable expands.
const unitQuote = (arg) => '"' + arg.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/%/g, '%%').replace(/\$/g, '$$$$') + '"';

export function systemdUnits(job) {
  return {
    service: ['[Unit]', 'Description=Update paperthin skills installed through skills.sh', '', '[Service]', 'Type=oneshot', 'ExecStart=' + jobArgs(job).map(unitQuote).join(' '), ''].join('\n'),
    timer: ['[Unit]', 'Description=Run ' + job.name + ' daily at local 00:00', '', '[Timer]', 'OnCalendar=*-*-* 00:00:00', 'Persistent=true', 'Unit=' + job.name + '.service', '', '[Install]', 'WantedBy=timers.target', ''].join('\n'),
  };
}

const shQuote = (arg) => "'" + arg.replace(/'/g, "'\\''") + "'";
const marked = (name) => (line) => line.endsWith(CRON_MARK + name);

export function cronRemove(table, name) {
  return table.split('\n').filter((line) => !marked(name)(line)).join('\n');
}

export function cronInstall(table, job) {
  const kept = cronRemove(table, job.name).replace(/\n*$/, '');
  return (kept ? kept + '\n' : '') + '0 0 * * * ' + jobArgs(job).map(shQuote).join(' ') + CRON_MARK + job.name + '\n';
}

// The job only keeps an existing install current: where no catalog skill is installed it adds nothing.
export function namesToAdd(catalog, installed) {
  const have = new Set(installed);
  return catalog.some((name) => have.has(name)) ? catalog.filter((name) => !have.has(name)) : [];
}

const RUN_LINE = /^=== run (\S+)$/;
const EXIT_LINE = /^=== exit (-?\d+) (\S+)$/;

function blocks(log) {
  const out = [];
  for (const line of log.split('\n')) {
    if (RUN_LINE.test(line)) out.push([]);
    if (out.length) out[out.length - 1].push(line);
  }
  return out.map((lines) => lines.join('\n').replace(/\n*$/, '\n'));
}

export const rotate = (log, block, keep = KEEP) => [...blocks(log), block.replace(/\n*$/, '\n')].slice(-keep).join('');

export function lastRun(log) {
  const last = blocks(log).at(-1);
  if (!last) return null;
  const lines = last.trimEnd().split('\n');
  const exit = EXIT_LINE.exec(lines.at(-1));
  return { started: RUN_LINE.exec(lines[0])[1], ended: exit ? exit[2] : null, exit: exit ? Number(exit[1]) : null };
}

export function logFile(platform, env, home, name) {
  if (platform === 'win32') return join(env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'paperthin', 'logs', name + '.log');
  if (platform === 'darwin') return join(home, 'Library', 'Logs', 'paperthin', name + '.log');
  return join(env.XDG_STATE_HOME || join(home, '.local', 'state'), 'paperthin', name + '.log');
}

// Node's spawn refuses a .cmd file without a shell, so npx runs as node plus npm's npx-cli.js wherever npm sits beside node;
// only a node with no npm beside it falls back to npx through a shell.
export function npxCommand(execPath, platform, exists = existsSync) {
  const candidates = [join(dirname(execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js'), join(dirname(execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js')];
  const cli = candidates.find((path) => exists(path));
  if (cli) return { file: execPath, args: [cli], shell: false };
  return platform === 'win32' ? { file: 'npx.cmd', args: [], shell: true } : { file: 'npx', args: [], shell: false };
}

const ANSI = /\x1b\[[0-9;?]*[A-Za-z]/g;
const tail = (text) => (text.length > OUTPUT_CAP ? '[... ' + (text.length - OUTPUT_CAP) + ' characters cut]\n' + text.slice(-OUTPUT_CAP) : text);

function exec(file, args, options = {}) {
  const result = spawnSync(file, args, { encoding: 'utf8', windowsHide: true, ...options });
  return { status: result.error ? null : result.status, error: result.error?.message, out: ((result.stdout || '') + (result.stderr || '')).replace(ANSI, '') };
}

// One step through npx: the child's PATH starts with node's own folder, since a scheduler's PATH may not hold it and the
// skills bin is a node script.
function npx(args, home) {
  const command = npxCommand(process.execPath, process.platform);
  const env = { ...process.env, PATH: dirname(process.execPath) + delimiter + (process.env.PATH || process.env.Path || '') };
  if (home) Object.assign(env, { HOME: home, USERPROFILE: home });
  delete env.Path;
  return exec(command.file, [...command.args, ...args], { cwd: home || homedir(), env, shell: command.shell, timeout: STEP_TIMEOUT, maxBuffer: 64 * 1024 * 1024 });
}

async function latestCatalog() {
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 're0-upgrade-schedule' };
  const release = await fetch(LATEST, { headers, signal: AbortSignal.timeout(30000) });
  if (release.status !== 200) throw new Error('GET ' + LATEST + ' answered ' + release.status);
  const tag = (await release.json()).tag_name;
  if (typeof tag !== 'string' || !tag) throw new Error('the latest release names no tag');
  const raw = await fetch(CATALOG_AT(tag), { headers: { 'user-agent': headers['user-agent'] }, signal: AbortSignal.timeout(30000) });
  if (raw.status !== 200) throw new Error('GET ' + CATALOG_AT(tag) + ' answered ' + raw.status);
  return { tag, catalog: readRules(await raw.text()).catalog };
}

async function runOnce({ name, home }) {
  const file = logFile(process.platform, process.env, homedir(), name);
  const lines = ['=== run ' + new Date().toISOString()];
  const note = (text) => lines.push(text.replace(/\n*$/, ''));
  let code = 0;
  try {
    note('$ npx -y skills@latest update -g -y' + (home ? '   (home ' + home + ')' : ''));
    const update = npx(['-y', 'skills@latest', 'update', '-g', '-y'], home);
    note(tail(update.out) + (update.error ? '\n' + update.error : ''));
    if (update.status !== 0) throw new Error('skills update exited ' + update.status);
    const { tag, catalog } = await latestCatalog();
    const skillsDir = join(home || homedir(), '.agents', 'skills');
    const installed = existsSync(skillsDir) ? readInstalled(skillsDir) : [];
    const add = namesToAdd(catalog, installed);
    note('catalog of ' + tag + ': ' + catalog.length + ' skills; installed in ' + skillsDir + ': ' + installed.length + '; to add: ' + (add.length ? add.join(', ') : 'none'));
    if (add.length) {
      const args = ['-y', 'skills@latest', 'add', UPSTREAM, '-g', '-y', ...add.flatMap((skill) => ['-s', skill])];
      note('$ npx ' + args.join(' '));
      const added = npx(args, home);
      note(tail(added.out) + (added.error ? '\n' + added.error : ''));
      if (added.status !== 0) throw new Error('skills add exited ' + added.status);
    }
  } catch (error) {
    note('failed: ' + error.message);
    code = 1;
  }
  lines.push('=== exit ' + code + ' ' + new Date().toISOString());
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, rotate(existsSync(file) ? readFileSync(file, 'utf8') : '', lines.join('\n') + '\n'));
  console.log(JSON.stringify({ name, exit: code, log: file }, null, 2));
  return code;
}

// A file is rewritten only when its content changed.
function writeIfChanged(file, content) {
  if (existsSync(file) && readFileSync(file, 'utf8') === content) return false;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  return true;
}

function must(result, what) {
  if (result.status !== 0) throw new Error(what + ' exited ' + result.status + ': ' + (result.error || result.out.trim()));
  return result;
}

const ps = (script) => exec('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script]);
const hasSystemd = () => exec('systemctl', ['--user', 'show-environment']).status === 0;
const unitDir = () => join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'systemd', 'user');
const plistPath = (name) => join(homedir(), 'Library', 'LaunchAgents', launchdLabel(name) + '.plist');
const gui = () => 'gui/' + userInfo().uid;

function nextMidnight() {
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  return next.toISOString();
}

// Each adapter: install writes and registers the job, remove unregisters it and deletes only its own files, and query
// reports whether the scheduler holds it and its next run.
const ADAPTERS = {
  windows: {
    install(job) {
      const file = join(dirname(logFile('win32', process.env, homedir(), job.name)), job.name + '.task.xml');
      const user = (process.env.USERDOMAIN ? process.env.USERDOMAIN + '\\' : '') + (process.env.USERNAME || userInfo().username);
      const conhost = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'conhost.exe');
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(windowsTask({ ...job, user, conhost }), 'utf16le')]));
      try {
        must(exec('schtasks.exe', ['/Create', '/TN', job.name, '/XML', file, '/F']), 'schtasks /Create');
      } finally {
        rmSync(file, { force: true });
      }
    },
    remove: (name) => must(exec('schtasks.exe', ['/Delete', '/TN', name, '/F']), 'schtasks /Delete'),
    query(name) {
      const got = ps("$t = Get-ScheduledTask -TaskName '" + name + "' -ErrorAction Stop; $i = $t | Get-ScheduledTaskInfo; [pscustomobject]@{ state = [string]$t.State; last = if ($i.LastRunTime -and $i.LastRunTime.Year -gt 2000) { $i.LastRunTime.ToString('o') } else { $null }; result = $i.LastTaskResult; next = if ($i.NextRunTime) { $i.NextRunTime.ToString('o') } else { $null } } | ConvertTo-Json -Compress");
      if (got.status !== 0) return { registered: false };
      const info = JSON.parse(got.out.trim());
      // 267011 (0x41303) is Task Scheduler's "has not yet run".
      return { registered: true, next: info.next, nextFrom: 'scheduler', scheduler: { state: info.state, lastRun: info.last, lastResult: info.result === 267011 ? 'not run yet' : info.result } };
    },
  },
  launchd: {
    install(job) {
      writeIfChanged(plistPath(job.name), launchdPlist(job));
      exec('launchctl', ['bootout', gui() + '/' + launchdLabel(job.name)]);
      must(exec('launchctl', ['bootstrap', gui(), plistPath(job.name)]), 'launchctl bootstrap');
    },
    remove(name) {
      exec('launchctl', ['bootout', gui() + '/' + launchdLabel(name)]);
      rmSync(plistPath(name), { force: true });
    },
    query(name) {
      const got = exec('launchctl', ['print', gui() + '/' + launchdLabel(name)]);
      if (got.status !== 0) return { registered: false };
      const exit = /last exit code = (\S+)/.exec(got.out);
      return { registered: true, next: nextMidnight(), nextFrom: 'computed', scheduler: { lastExit: exit ? exit[1] : 'not run yet' } };
    },
  },
  systemd: {
    install(job) {
      const { service, timer } = systemdUnits(job);
      writeIfChanged(join(unitDir(), job.name + '.service'), service);
      writeIfChanged(join(unitDir(), job.name + '.timer'), timer);
      must(exec('systemctl', ['--user', 'daemon-reload']), 'systemctl --user daemon-reload');
      must(exec('systemctl', ['--user', 'enable', '--now', job.name + '.timer']), 'systemctl --user enable');
    },
    remove(name) {
      exec('systemctl', ['--user', 'disable', '--now', name + '.timer']);
      rmSync(join(unitDir(), name + '.service'), { force: true });
      rmSync(join(unitDir(), name + '.timer'), { force: true });
      must(exec('systemctl', ['--user', 'daemon-reload']), 'systemctl --user daemon-reload');
    },
    query(name) {
      if (!existsSync(join(unitDir(), name + '.timer'))) return { registered: false };
      const got = exec('systemctl', ['--user', 'show', name + '.timer', '-p', 'ActiveState', '-p', 'NextElapseUSecRealtime']);
      const field = (key) => new RegExp('^' + key + '=(.*)$', 'm').exec(got.out)?.[1] || null;
      return { registered: field('ActiveState') === 'active', next: field('NextElapseUSecRealtime'), nextFrom: 'scheduler', scheduler: { timer: field('ActiveState') } };
    },
  },
  cron: {
    install(job) {
      const now = exec('crontab', ['-l']);
      must(exec('crontab', ['-'], { input: cronInstall(now.status === 0 ? now.out : '', job) }), 'crontab -');
    },
    remove(name) {
      const now = exec('crontab', ['-l']);
      if (now.status === 0) must(exec('crontab', ['-'], { input: cronRemove(now.out, name) }), 'crontab -');
    },
    query(name) {
      const now = exec('crontab', ['-l']);
      return now.status === 0 && now.out.split('\n').some(marked(name)) ? { registered: true, next: nextMidnight(), nextFrom: 'computed', scheduler: {} } : { registered: false };
    },
  },
};

function adapter() {
  if (process.platform === 'win32') return ['windows', ADAPTERS.windows];
  if (process.platform === 'darwin') return ['launchd', ADAPTERS.launchd];
  if (hasSystemd()) return ['systemd', ADAPTERS.systemd];
  if (exec('crontab', ['-l']).error) throw new Error('neither systemd --user nor crontab is available, so no job can be scheduled');
  return ['cron', ADAPTERS.cron];
}

function status(name) {
  const [platform, os] = adapter();
  const log = logFile(process.platform, process.env, homedir(), name);
  const job = os.query(name);
  const report = { name, platform, ...job, log, lastRun: existsSync(log) ? lastRun(readFileSync(log, 'utf8')) : null };
  console.log(JSON.stringify(report, null, 2));
  return job.registered ? 0 : 1;
}

export async function main(argv) {
  let values;
  let verb;
  try {
    ({ values, positionals: [verb] } = parseArgs({ args: argv, allowPositionals: true, options: { name: { type: 'string' }, home: { type: 'string' }, help: { type: 'boolean' } } }));
    if (values.help) {
      console.log(USAGE);
      return 0;
    }
    if (!['install', 'status', 'run', 'uninstall'].includes(verb)) throw new Usage('name install, status, run or uninstall');
    if (values.name !== undefined && !JOB_NAME.test(values.name)) throw new Usage('--name ' + values.name + ' is not a plain job name (letters, digits, dot, dash, underscore)');
    if (values.home !== undefined && !['install', 'run'].includes(verb)) throw new Usage('--home is for install and run only');
    if (values.home !== undefined && !statSync(values.home, { throwIfNoEntry: false })?.isDirectory()) throw new Usage('--home ' + values.home + ' is not a directory');
  } catch (error) {
    if (error instanceof TypeError || error instanceof Usage) {
      console.error('re0-upgrade schedule: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  const name = values.name || DEFAULT_NAME;
  const home = values.home && resolve(values.home);
  try {
    if (verb === 'run') return await runOnce({ name, home });
    if (verb === 'status') return status(name);
    const [platform, os] = adapter();
    // The job keeps the path it was installed from: an installed skill's link path survives every skills update.
    if (verb === 'install') os.install({ name, home, node: process.execPath, script: resolve(process.argv[1]) });
    else if (os.query(name).registered) os.remove(name);
    console.log(JSON.stringify({ name, platform, [verb === 'install' ? 'installed' : 'uninstalled']: true }, null, 2));
    return 0;
  } catch (error) {
    console.error('re0-upgrade schedule: ' + error.message);
    return 1;
  }
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = await main(process.argv.slice(2));

