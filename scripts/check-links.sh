#!/usr/bin/env bash
# Verify that every relative Markdown link points at a file that exists on disk.
# External links (http://, https://) are out of scope — a broken external is a live
# concern, not a catalog concern. This is the local-shape check.
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
err() { echo "::error::$*"; fail=1; }

# collect Markdown files: docs, top-level, and every SKILL.md
mapfile -t files < <(
  { find skills -name SKILL.md
    find docs -name '*.md' 2>/dev/null
    ls *.md 2>/dev/null
  } | sort -u
)

count=0
for f in "${files[@]}"; do
  d=$(dirname "$f")
  # extract [text](target) pairs — skip external URLs, mailto, in-page anchors, images
  grep -oE '\]\(([^)]+)\)' "$f" 2>/dev/null | sed 's/^](//; s/)$//' \
    | while read -r target; do
        # drop query and fragment before resolving on disk
        raw="${target%%\#*}"
        raw="${raw%%\?*}"
        # skip empty, external, protocol-relative, mailto, tel, in-page-anchor-only
        case "$raw" in
          ""|http://*|https://*|//*|mailto:*|tel:*) continue ;;
        esac
        # resolve relative to the file's directory
        if [[ $raw = /* ]]; then
          # absolute-from-repo-root (rare in Markdown, tolerate it)
          resolved=".${raw}"
        else
          resolved="$d/$raw"
        fi
        # normalize (collapse ./ and ../ syntactically for the error message)
        # but for existence use realpath fallback to the raw path check
        if [ ! -e "$resolved" ]; then
          # try realpath in case of symlinks or dotdot chains
          norm=$(realpath -m --relative-to=. "$resolved" 2>/dev/null || echo "$resolved")
          err "$f: link target '${target}' does not resolve (${norm})"
        fi
        count=$((count+1))
      done
done

if [ "$fail" -eq 0 ]; then
  scanned=$(find "${files[@]}" -type f 2>/dev/null | wc -l | tr -d ' ')
  echo "✓ relative links resolve (scanned ${scanned} files)"
else
  echo "✗ link check failed"; exit 1
fi
