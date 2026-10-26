'use strict';
// Each skill as its hosts load it: a SKILL.md whose frontmatter Claude Code (js-yaml, YAML 1.2) and Codex (PyYAML, YAML 1.1) both parse, an agents/openai.yaml beside it, one invocation lane in both, the shared section skeleton, and bundled scripts that parse.
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseDocument } = require('yaml');
const { listFiles, isFile, read, problem } = require('./repo.cjs');

const PERSPECTIVES = ['breadth', 'coil', 'depth', 'mesh'];
const SECTIONS = ['Goal', 'Workflow', 'Rules', 'Verification'];
const DESCRIPTION_MAX = 800;
// Codex's skill-creator quick_validate.py rules, ported because the script needs PyYAML and reads cp949 on Windows; skills.test.cjs pins the sha256 of the copy they came from. disable-model-invocation is the one key it rejects that Claude Code reads.
const KEYS = ['name', 'description', 'license', 'allowed-tools', 'metadata', 'disable-model-invocation'];
const NAME_MAX = 64;

// A failure names the line and column, since a plain value holding ": " parses as a nested mapping and the host drops the skill.
function parseYaml(file, source, version, firstLine) {
  const doc = parseDocument(source, { version, strict: true, uniqueKeys: true, prettyErrors: false });
  const bad = [...doc.errors, ...doc.warnings][0];
  if (!bad) return { data: doc.toJS() };
  const before = source.slice(0, bad.pos ? bad.pos[0] : 0);
  const line = before.split('\n').length + firstLine - 1;
  const column = before.length - before.lastIndexOf('\n');
  return { error: problem(file, line, 'column ' + column + ': not valid YAML ' + version + ': ' + bad.message.split('\n')[0] + '; quote the value') };
}

function frontmatter(file, text) {
  const head = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!head) return { error: problem(file, 1, 'no YAML frontmatter between --- lines') };
  let data;
  for (const version of ['1.1', '1.2']) {
    const parsed = parseYaml(file, head[1], version, 2);
    if (parsed.error) return parsed;
    data = parsed.data;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { error: problem(file, 2, 'frontmatter must be a YAML mapping') };
  return { data };
}

// quick_validate.py's fences: a run of three or more backticks or tildes, list markers allowed, closed by the same character at least as long with no info string.
function outsideFences(text) {
  let open = null;
  return text.split('\n').map((line) => {
    const fence = line.match(/^[ \t]*(?:(?:[-+*]|\d+[.)])[ \t]+)?(\x60{3,}|~{3,})(.*)$/);
    if (!fence) return open ? '' : line;
    if (!open) open = fence[1];
    else if (fence[1][0] === open[0] && fence[1].length >= open.length && !fence[2].trim()) open = null;
    return '';
  });
}

function checkSkill(root, file, problems) {
  const [, perspective, name] = file.split('/');
  const dir = path.posix.dirname(file);
  if (!PERSPECTIVES.includes(perspective) || file.split('/').length !== 4) problems.push(problem(file, 0, 'a skill lives at skills/<' + PERSPECTIVES.join('|') + '>/<name>/SKILL.md'));
  const text = read(root, file);
  const { data, error } = frontmatter(file, text);
  if (error) {
    problems.push(error);
    return null;
  }
  for (const key of Object.keys(data).filter((key) => !KEYS.includes(key))) problems.push(problem(file, 2, 'frontmatter key ' + key + ' is not one Codex accepts (' + KEYS.join(', ') + ')'));
  if (data.name !== name) problems.push(problem(file, 2, 'name ' + JSON.stringify(data.name) + ' does not match its directory ' + name));
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > NAME_MAX) problems.push(problem(file, 2, 'name ' + name + ' must be hyphen-case, at most ' + NAME_MAX + ' characters, with no leading, trailing or doubled hyphen'));
  if (typeof data.description !== 'string' || !data.description.trim()) problems.push(problem(file, 3, 'description must be a non-empty string'));
  else if (data.description.trim().startsWith('[TODO:')) problems.push(problem(file, 3, 'description is an unfinished [TODO: placeholder'));
  else if (/[<>]/.test(data.description)) problems.push(problem(file, 3, 'description holds an angle bracket (< or >), which Codex rejects'));
  else if (data.description.length > DESCRIPTION_MAX) problems.push(problem(file, 3, 'description is ' + data.description.length + ' characters, over ' + DESCRIPTION_MAX + '; write a description, not a paragraph'));
  const userInvoked = data['disable-model-invocation'] === true;
  if (userInvoked && /\bUse when\b/.test(data.description)) problems.push(problem(file, 3, 'a user-invoked description is read by a person browsing commands; drop its "Use when" triggers'));

  const yamlFile = dir + '/agents/openai.yaml';
  if (!isFile(root, yamlFile)) problems.push(problem(yamlFile, 0, 'missing; every skill carries its Codex metadata'));
  else {
    const parsed = parseYaml(yamlFile, read(root, yamlFile), '1.2', 1);
    if (parsed.error) problems.push(parsed.error);
    else {
      const meta = parsed.data || {};
      for (const key of ['display_name', 'short_description']) {
        if (typeof meta.interface?.[key] !== 'string') problems.push(problem(yamlFile, 0, 'interface.' + key + ' must be a string'));
      }
      if ((meta.policy?.allow_implicit_invocation === false) !== userInvoked) problems.push(problem(yamlFile, 0, 'policy.allow_implicit_invocation: false must pair with disable-model-invocation: true in SKILL.md; a skill is user-invoked in both hosts or neither'));
    }
  }

  const lines = outsideFences(text);
  for (const section of SECTIONS) {
    if (!lines.some((line) => line === '## ' + section)) problems.push(problem(file, 0, 'missing the ## ' + section + ' section'));
  }
  lines.forEach((line, i) => {
    if (/^ {0,3}\[TODO:.*\][ \t]*$/.test(line)) problems.push(problem(file, i + 1, 'unfinished [TODO: placeholder, which Codex rejects'));
    if (line.includes('../')) problems.push(problem(file, i + 1, 'deep cross-file reference (../); name the skill instead of linking into another folder'));
  });
  return { name, userInvoked, lines };
}

// A user-invoked skill is out of every skill's reach, so no Skill tool call may name one.
function checkCalls(skill, file, invocation, problems) {
  skill.lines.forEach((line, i) => {
    for (const call of line.matchAll(/Call the Skill tool\b[^.]*/g)) {
      for (const [, target] of call[0].matchAll(/"([a-z0-9-]+)"/g)) {
        if (!invocation.has(target)) problems.push(problem(file, i + 1, 'calls the Skill tool with "' + target + '", which is not a shipped skill'));
        else if (invocation.get(target)) problems.push(problem(file, i + 1, 'calls the Skill tool with "' + target + '", which is user-invoked; tell the human to run /' + target + ' instead'));
      }
    }
  });
}

function check(root) {
  const problems = [];
  const files = listFiles(root, 'skills').filter((file) => file.endsWith('/SKILL.md'));
  const skills = new Map();
  for (const file of files) {
    const skill = checkSkill(root, file, problems);
    if (skill) skills.set(file, skill);
  }
  const invocation = new Map([...skills.values()].map((skill) => [skill.name, skill.userInvoked]));
  for (const [file, skill] of skills) checkCalls(skill, file, invocation, problems);

  for (const script of listFiles(root, 'skills').filter((file) => /\/scripts\/.+\.(c|m)?js$/.test(file))) {
    const run = spawnSync(process.execPath, ['--check', script], { cwd: root, encoding: 'utf8' });
    if (run.status !== 0) problems.push(problem(script, 0, 'does not parse: ' + (run.stderr.split('\n').find((line) => /Error/.test(line)) || 'node --check failed')));
  }
  return problems;
}

module.exports = { check, frontmatter };
