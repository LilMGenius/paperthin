// The frontmatter gate against the failure it exists for: a plain description holding ": " fails, the quoted one passes.
const assert = require('node:assert/strict');
const test = require('node:test');
const { checkFrontmatter } = require('./check-frontmatter.cjs');

const skill = (description) => '---\nname: demo\ndescription: ' + description + '\n---\n\n# demo\n';

test('a plain description holding ": " fails at its line', () => {
  assert.match(checkFrontmatter('demo/SKILL.md', skill('Write a guide: builds and tips.')).join(), /^demo\/SKILL\.md:3:\d+: frontmatter is not valid YAML/);
});

test('the quoted description passes and a duplicate key fails', () => {
  assert.deepEqual(checkFrontmatter('demo/SKILL.md', skill('"Write a guide: builds and tips."')), []);
  assert.equal(checkFrontmatter('demo/SKILL.md', '---\nname: a\nname: a\ndescription: x\n---\n').length, 1);
});
