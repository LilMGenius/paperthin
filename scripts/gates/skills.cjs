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
// skill-creator's agents/openai.yaml rules: hosts list a skill by its display name and a 25 to 64 character blurb, and its default prompt names $<skill> so the picker inserts a call that resolves.
const BLURB = [25, 64];

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
      const blurb = meta.interface?.short_description;
      if (typeof blurb === 'string' && (blurb.length < BLURB[0] || blurb.length > BLURB[1])) problems.push(problem(yamlFile, 0, 'interface.short_description is ' + blurb.length + ' characters; hosts show ' + BLURB[0] + ' to ' + BLURB[1]));
      if (typeof meta.interface?.display_name === 'string' && meta.interface.display_name !== name) problems.push(problem(yamlFile, 0, 'interface.display_name ' + JSON.stringify(meta.interface.display_name) + ' is not the skill name ' + name + ', so the picker lists it under another name than the one it is called by'));
      const prompt = meta.interface?.default_prompt;
      if (typeof prompt !== 'string' || !new RegExp('\\$' + name + '(?![a-z0-9-])').test(prompt)) problems.push(problem(yamlFile, 0, 'interface.default_prompt must name $' + name + ', the call the picker inserts'));
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

// A Skill tool call, however a sentence phrases it ("Call the Skill tool", "calling the Skill tool", "one Skill tool call each"), runs to the end of its sentence.
const CALL = /(?:\bcall(?:s|ing|ed)? the Skill tool|\bSkill tool calls?)\b[^.]*/gi;

// A user-invoked skill is out of every skill's reach, so no Skill tool call may name one. Each call that may stand becomes an edge for the cycle check,
// and so does a sibling named in backticks or quotes in a Workflow step, since that step needs the sibling's result even without a call; a name under
// Goal, Rules or Verification is a reference and adds no edge.
function checkCalls(skill, file, invocation, problems, edges) {
  let section = '';
  skill.lines.forEach((line, i) => {
    if (line.startsWith('## ')) section = line.slice(3).trim();
    const called = new Set();
    for (const call of line.matchAll(CALL)) {
      for (const [, target] of call[0].matchAll(/"([a-z0-9-]+)"/g)) {
        called.add(target);
        if (!invocation.has(target)) problems.push(problem(file, i + 1, 'calls the Skill tool with "' + target + '", which is not a shipped skill'));
        else if (invocation.get(target)) problems.push(problem(file, i + 1, 'calls the Skill tool with "' + target + '", which is user-invoked; tell the human to run /' + target + ' instead'));
        else edges.push({ from: skill.name, to: target, file, line: i + 1, prose: false });
      }
    }
    if (section !== 'Workflow') return;
    for (const [, target] of line.matchAll(/[\x60"]([a-z0-9-]+)[\x60"]/g)) {
      if (target === skill.name || called.has(target) || !invocation.has(target)) continue;
      called.add(target);
      edges.push({ from: skill.name, to: target, file, line: i + 1, prose: true });
    }
  });
}

// A skill whose procedure calls another, directly or through others, must never be called back by it: walk the calls depth-first in file order and fail each call that closes a cycle, once.
function checkCycles(skills, edges, problems) {
  const calls = new Map();
  for (const edge of edges) calls.set(edge.from, [...(calls.get(edge.from) || []), edge]);
  const done = new Set();
  const path = [];
  const visit = (name) => {
    path.push(name);
    for (const edge of calls.get(name) || []) {
      const open = path.indexOf(edge.to);
      if (open >= 0) {
        const cycle = [...path.slice(open), edge.to].join(' -> ');
        const what = edge.prose ? 'names "' + edge.to + '" in a Workflow step' : 'calls the Skill tool with "' + edge.to + '"';
        problems.push(problem(edge.file, edge.line, what + ', which closes the cycle ' + cycle + '; a skill never depends on one that depends on it (move a boundary mention under ## Rules)'));
      }
      else if (!done.has(edge.to)) visit(edge.to);
    }
    path.pop();
    done.add(name);
  };
  for (const skill of skills) if (!done.has(skill.name)) visit(skill.name);
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
  const edges = [];
  for (const [file, skill] of skills) checkCalls(skill, file, invocation, problems, edges);
  checkCycles(skills.values(), edges, problems);

  for (const script of listFiles(root, 'skills').filter((file) => /\/scripts\/.+\.(c|m)?js$/.test(file))) {
    const run = spawnSync(process.execPath, ['--check', script], { cwd: root, encoding: 'utf8' });
    if (run.status !== 0) problems.push(problem(script, 0, 'does not parse: ' + (run.stderr.split('\n').find((line) => /Error/.test(line)) || 'node --check failed')));
    // A skill runs through a link (.agents/skills, a junction), where argv keeps the link path while import.meta.url names the real file.
    const lines = read(root, script).split('\n');
    const entry = lines.findIndex((line) => line.includes('process.argv[1]') && line.includes('import.meta.url'));
    if (entry >= 0 && !lines[entry].includes('realpathSync(process.argv[1])')) problems.push(problem(script, entry + 1, 'its entry check compares process.argv[1] with import.meta.url as typed; compare realpathSync of both, or the script does nothing when run through a link'));
  }
  return problems;
}

module.exports = { check, frontmatter };
