// Every SKILL.md frontmatter must load in the hosts that read it: Claude Code parses it with js-yaml (YAML 1.2) and Codex's skill-creator quick_validate.py with PyYAML (YAML 1.1). Both read a plain description holding ": " as a nested mapping and drop the skill, while a "key: value" line pattern still passes it. So each frontmatter is parsed strictly by eemeli/yaml (ISC) under both versions, and a failure names the file, line and column.
const fs = require('node:fs');
const path = require('node:path');
let parseDocument;
try { ({ parseDocument } = require('yaml')); } catch { console.error('::error::the yaml package is missing; run npm ci'); process.exit(1); }

function checkFrontmatter(file, text) {
  const head = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!head) return [file + ':1: no YAML frontmatter between --- lines'];
  for (const version of ['1.1', '1.2']) {
    const doc = parseDocument(head[1], { version, strict: true, uniqueKeys: true, prettyErrors: false });
    const bad = [...doc.errors, ...doc.warnings][0];
    if (bad) {
      const before = head[1].slice(0, bad.pos ? bad.pos[0] : 0);
      const line = before.split('\n').length + 1;
      const column = before.length - before.lastIndexOf('\n');
      return [file + ':' + line + ':' + column + ': frontmatter is not valid YAML ' + version + ': ' + bad.message.split('\n')[0] + '; quote the value'];
    }
    const data = doc.toJS();
    if (!data || typeof data !== 'object' || Array.isArray(data)) return [file + ':2: frontmatter must be a YAML mapping'];
    if (typeof data.description !== 'string') return [file + ': description must be a string'];
  }
  return [];
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name === 'SKILL.md' ? [full] : [];
  });
}

module.exports = { checkFrontmatter };

if (require.main === module) {
  const root = path.join(__dirname, '..');
  const errors = walk(path.join(root, 'skills')).flatMap((file) => checkFrontmatter(path.relative(root, file).split(path.sep).join('/'), fs.readFileSync(file, 'utf8')));
  for (const error of errors) console.error('::error::' + error);
  process.exit(errors.length ? 1 : 0);
}
