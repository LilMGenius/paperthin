#!/usr/bin/env bash
# Validate the skill catalog against the conventions in CLAUDE.md + docs/invocation.md.
# The single source of truth for "is the catalog shippable" — called by release.yml
# (pre-publish), ci.yml (every push/PR), and runnable locally (e.g. from sip).
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
err() { echo "::error::$*"; fail=1; }   # GitHub annotation on CI; prints plainly off-CI

# plugin.json must be valid JSON
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8'))" 2>/dev/null \
  || err "plugin.json is not valid JSON"

# the brand one-liner is single-sourced: package.json and plugin.json must agree
pkg_desc=$(node -p "require('./package.json').description" 2>/dev/null)
plg_desc=$(node -p "require('./.claude-plugin/plugin.json').description" 2>/dev/null)
[ "$pkg_desc" = "$plg_desc" ] || err "package.json and plugin.json 'description' differ — keep the brand one-liner in sync"

while IFS= read -r f; do
  d=$(dirname "$f"); name=$(awk -F': *' '/^name:/{print $2; exit}' "$f")
  grep -q '^description:' "$f"                       || err "$f: missing 'description'"
  [ -n "$name" ]                                     || err "$f: missing 'name'"
  [ "$name" = "$(basename "$d")" ]                   || err "$f: name '$name' != directory '$(basename "$d")'"
  grep -qF "\"./$d\"" .claude-plugin/plugin.json     || err "$d: not registered in plugin.json"
  grep -qF "$d/SKILL.md" README.md                   || err "$d: not listed in README.md"
  grep -q '\.\./' "$f"                               && err "$f: deep cross-file ref ('../') — compose by naming, not relative links"
done < <(find skills -name SKILL.md)

# every plugin.json skill path resolves to a SKILL.md
while IFS= read -r p; do
  [ -f "$p/SKILL.md" ] || err "plugin.json: '$p' has no SKILL.md"
done < <(grep -oE '\./skills/[A-Za-z0-9/_-]+' .claude-plugin/plugin.json)

if [ "$fail" -eq 0 ]; then
  echo "✓ skill catalog valid ($(find skills -name SKILL.md | wc -l | tr -d ' ') skills)"
else
  echo "✗ catalog validation failed"; exit 1
fi
