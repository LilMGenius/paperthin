#!/usr/bin/env bash
# Validate the skill catalog against the conventions in CLAUDE.md + docs/invocation.md.
# The single source of truth for "is the catalog shippable" — called by release.yml
# (pre-publish), ci.yml (every push/PR), and runnable locally (e.g. from sip).
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
err() { echo "::error::$*"; fail=1; }   # GitHub annotation on CI; prints plainly off-CI

node_bin=${NODE:-}
if [ -n "$node_bin" ]; then
  case "$node_bin" in
    */*|*\\*) [ -x "$node_bin" ] || err "node runtime not found at NODE=$node_bin" ;;
    *) command -v "$node_bin" >/dev/null 2>&1 || err "node runtime not found at NODE=$node_bin" ;;
  esac
elif [ -z "$node_bin" ]; then
  if command -v node >/dev/null 2>&1; then
    node_bin=$(command -v node)
  elif command -v node.exe >/dev/null 2>&1; then
    node_bin=$(command -v node.exe)
  elif [ -x "/c/Program Files/nodejs/node.exe" ]; then
    node_bin="/c/Program Files/nodejs/node.exe"
  elif [ -x "/mnt/c/Program Files/nodejs/node.exe" ]; then
    node_bin="/mnt/c/Program Files/nodejs/node.exe"
  else
    err "node runtime not found — install Node.js or set NODE=/path/to/node"
  fi
fi

# plugin.json must be valid JSON
if [ -n "$node_bin" ] && [ "$fail" -eq 0 ]; then
  "$node_bin" -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8'))" 2>/dev/null \
    || err "plugin.json is not valid JSON"
fi

# the brand one-liner is single-sourced: package.json and plugin.json must agree
if [ -n "$node_bin" ] && [ "$fail" -eq 0 ]; then
  pkg_desc=$("$node_bin" -p "require('./package.json').description" 2>/dev/null)
  plg_desc=$("$node_bin" -p "require('./.claude-plugin/plugin.json').description" 2>/dev/null)
  [ "$pkg_desc" = "$plg_desc" ] || err "package.json and plugin.json 'description' differ — keep the brand one-liner in sync"
fi

# structural section names required in every SKILL.md (empirically shared across the catalog)
required_sections=("Goal" "Workflow" "Rules" "Verification")
# soft cap on the frontmatter description; a longer one signals a paragraph, not a description
desc_max=800

while IFS= read -r f; do
  d=$(dirname "$f"); name=$(awk -F': *' '/^name:/{gsub(/\r$/, "", $2); print $2; exit}' "$f")
  grep -q '^description:' "$f"                       || err "$f: missing 'description'"
  [ -n "$name" ]                                     || err "$f: missing 'name'"
  [ "$name" = "$(basename "$d")" ]                   || err "$f: name '$name' != directory '$(basename "$d")'"
  grep -qF "\"./$d\"" .claude-plugin/plugin.json     || err "$d: not registered in plugin.json"
  grep -qF "$d/SKILL.md" README.md                   || err "$d: not listed in README.md"
  grep -q '\.\./' "$f"                               && err "$f: deep cross-file ref ('../') — compose by naming, not relative links"

  # frontmatter is parseable YAML (extract lines between the two --- delimiters)
  awk '/^---$/{c++; next} c==1' "$f" \
    | node -e "const y=require('fs').readFileSync(0,'utf8'); if(!/^[a-z_-]+:\s/mi.test(y)) process.exit(1)" 2>/dev/null \
    || err "$f: frontmatter block missing or malformed (expected 'key: value' lines between '---' delimiters)"

  # frontmatter description length cap — keeps it a description, not a paragraph
  desc_len=$(awk '/^description:/{sub(/^description: */,""); gsub(/^"|"$/,""); print length; exit}' "$f")
  [ -n "$desc_len" ] && [ "$desc_len" -le "$desc_max" ] \
    || err "$f: description length ${desc_len:-0} > $desc_max chars (tighten to a description, not a paragraph)"

  # required structural sections — verify every SKILL.md carries the shared skeleton
  for sec in "${required_sections[@]}"; do
    grep -qE "^## +${sec}\$" "$f" \
      || err "$f: missing required section '## ${sec}'"
  done
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
