#!/usr/bin/env bash
# Verify that every skill referenced by name in Markdown resolves to a shipped skill,
# and every shipped skill is reachable from README.md. Catches typos and dangling
# names left behind after a rename or removal — the same drift `ssotchk` looks for,
# applied to the catalog's own cross-skill vocabulary.
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
err() { echo "::error::$*"; fail=1; }

# collect shipped skill names (directory basenames under skills/*/*/SKILL.md)
mapfile -t shipped < <(find skills -name SKILL.md -printf '%h\n' 2>/dev/null | xargs -n1 basename | sort -u)
if [ "${#shipped[@]}" -eq 0 ]; then
  err "no shipped SKILL.md found under skills/ — nothing to check against"
  echo "✗ skill reference check failed"; exit 1
fi
declare -A known
for s in "${shipped[@]}"; do known[$s]=1; done

# README.md is the authoritative catalog; without it check-2 would flag every skill.
if [ ! -f README.md ]; then
  err "README.md missing at repo root — cannot verify catalog reachability"
  echo "✗ skill reference check failed"; exit 1
fi

# scope of files to scan: docs, top-level *.md, and every SKILL.md
mapfile -t files < <(
  { find skills -name SKILL.md
    find docs -name '*.md' 2>/dev/null
    ls *.md 2>/dev/null
  } | sort -u
)

# check 1 — a backticked skill-shaped token near a known skill name but not resolving
# is almost certainly a typo (e.g. `re0-git-log` when only `re0-git` is shipped).
# The while-read loop is fed via process substitution so it runs in the current
# shell and `fail=1` set by `err` propagates. A piped `while read` runs in a
# subshell and the failure would be silently swallowed (exit 0 even with hits).
for f in "${files[@]}"; do
  while read -r tok; do
    if [[ ${known[$tok]-} != 1 ]]; then
      if [[ $tok == *-* ]]; then
        for s in "${shipped[@]}"; do
          if [[ $tok == "$s"-* || $tok == *-"$s" ]]; then
            err "$f: backticked '\`$tok\`' looks skill-shaped and near a shipped skill '$s' but does not resolve — rename or remove"
            break
          fi
        done
      fi
    fi
  done < <(grep -oE '`[a-z][a-z0-9-]{1,}`' "$f" 2>/dev/null | tr -d '`' | sort -u)
done

# check 2 — every shipped skill must be reachable from README.md, either by name
# (backticked) or as a link path. Path form is authoritative because the catalog
# lives in a table of paths; a skill on disk that README never links to is orphaned.
for s in "${shipped[@]}"; do
  # accept a backticked mention OR any link whose target contains the skill dir
  if grep -qF "\`$s\`" README.md; then continue; fi
  if grep -qE "\]\([^)]*/${s}/SKILL\.md\)" README.md; then continue; fi
  err "README.md: shipped skill '$s' is neither mentioned by name nor linked — orphan on disk"
done

if [ "$fail" -eq 0 ]; then
  echo "✓ skill references resolve (${#shipped[@]} shipped names, ${#files[@]} scanned files)"
else
  echo "✗ skill reference check failed"; exit 1
fi
