'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');
const { test } = require('node:test');
const { checkMessage } = require('./check-commit-messages.cjs');

const script = path.join(__dirname, 'check-commit-messages.cjs');

test('messages in the documented form pass', () => {
  const valid = [
    'feat(elon): add the requirement-questioning reflex\n\n- walks not-yet-built requirements through question, remove, simplify, speed the cycle, automate in that order\n- registered after modelchk; AGENTS.md admits an eponym when the method is already known by that name\n',
    'chore(git): keep every tracked file at LF in the working tree\n\n- \x60* -text\x60 turns off end-of-line conversion, so a checkout reads the bytes the index holds\n',
    'docs(readme): fix the map link',
  ];
  for (const message of valid) assert.deepEqual(checkMessage(message), [], message);
});

test('each broken rule is reported', () => {
  const cases = [
    ['refactor: condense the upgrade workflow\n\n- Fold repeated rules into their workflow steps.', ['subject is not type(scope): description', 'bullet ends with a period']],
    ['feat(re0-work): add the restart procedure\n\n- archives the old tip\n\nRelease kind: minor.\nPlan: .omo/plans/x.md', ['body line is not a bullet']],
    ['feat(re0-style): add the style reflex\n\nThe reflex keeps code consistent only where meaning permits it.', ['body line is not a bullet']],
    ['feat(x): Add a thing.', ['description does not start lowercase', 'subject ends with a period']],
    ['fix(dedot): ' + 'a'.repeat(70), ['over 72']],
    ['fix(dedot): propose spacing\n- no blank line before the body', ['no blank line after the subject']],
    ['test(x): cover the parser', ['subject is not type(scope): description']],
  ];
  for (const [message, expected] of cases) {
    const problems = checkMessage(message).join(' | ');
    for (const fragment of expected) assert.ok(problems.includes(fragment), message + ' => ' + problems);
  }
});

test('the command fails a range holding a bad message and passes a clean one', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'commit-messages-'));
  try {
    const git = (...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], { cwd: repo, encoding: 'utf8' });
    git('init', '-q');
    git('commit', '-q', '--allow-empty', '-m', 'chore(repo): start');
    git('commit', '-q', '--allow-empty', '-m', 'fix(a): keep the good one\n\n- one bullet');
    const good = git('rev-parse', 'HEAD').trim();
    git('commit', '-q', '--allow-empty', '-m', 'Update stuff.');
    const pass = spawnSync(process.execPath, [script, 'HEAD~2..' + good], { cwd: repo, encoding: 'utf8' });
    assert.equal(pass.status, 0, pass.stderr);
    const fail = spawnSync(process.execPath, [script, 'HEAD~2..HEAD'], { cwd: repo, encoding: 'utf8' });
    assert.equal(fail.status, 1);
    assert.match(fail.stderr, /Update stuff\./);
    assert.doesNotMatch(fail.stderr, /keep the good one/);
    const missing = spawnSync(process.execPath, [script, '0000000000000000000000000000000000000001..HEAD'], { cwd: repo, encoding: 'utf8' });
    assert.equal(missing.status, 2);
    assert.match(missing.stderr, /^::error::cannot read commit range/m);
    assert.doesNotMatch(missing.stderr, /at .*\.cjs:\d+/);
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test('a closing block of human co-author trailers passes', () => {
  const valid = [
    'fix(minimax): move to the released model id\n\n- saved selections of the preview id are renamed at startup\n\nCo-authored-by: Jane Doe <jane@example.com>',
    'fix(usage): keep prompt estimates on hosted tool paths\n\nCo-authored-by: handle <12345+handle@users.noreply.github.com>\nCo-authored-by: Jane Doe <jane@example.com>\n',
  ];
  for (const message of valid) assert.deepEqual(checkMessage(message), [], message);
});

test('a co-author trailer is refused out of place, malformed or naming no human', () => {
  const cases = [
    ['fix(a): b\n\nCo-authored-by: Jane Doe <jane@example.com>\n\n- a bullet after the trailer', 'body line is not a bullet'],
    ['fix(a): b\n\n- a bullet\nCo-authored-by: Jane Doe <jane@example.com>', 'body line is not a bullet'],
    ['fix(a): b\n\nCo-authored-by: Jane Doe', 'body line is not a bullet'],
    ['fix(a): b\n\n- a bullet\n\nCo-authored-by: Claude <noreply@anthropic.com>', 'co-author is not a human contributor'],
    ['fix(a): b\n\nCo-authored-by: Codex <codex@openai.com>', 'co-author is not a human contributor'],
    ['fix(a): b\n\nCo-authored-by: Copilot <198982749+Copilot@users.noreply.github.com>', 'co-author is not a human contributor'],
    ['fix(a): b\n\nCo-authored-by: helper[bot] <1+helper[bot]@users.noreply.github.com>', 'co-author is not a human contributor'],
    ['fix(a): b\n\nCo-authored-by: Jane Doe <jane@example.com>\nCo-authored-by: GitHub <noreply@github.com>', 'co-author is not a human contributor'],
  ];
  for (const [message, fragment] of cases) {
    const problems = checkMessage(message).join(' | ');
    assert.ok(problems.includes(fragment), message + ' => ' + problems);
  }
});
