#!/usr/bin/env bash
# Verify that every relative Markdown link points at a file that exists on disk.
# External links (http://, https://) are out of scope — a broken external is a live
# concern, not a catalog concern. This is the local-shape check.
#
# Covers the two link forms the catalog actually uses, and ignores images:
#   inline    [text](target)
#   reference [text][ref]  paired with  [ref]: target   (or [ref]: target "title")
#   image     ![alt](target)   ← well-formed images are stripped before scanning
#
# Documented limitations (fine for this repo; extend when a case appears):
#   - collapsed references `[foo]` and implicit `[foo][]` are not checked
#   - inline targets containing an unescaped `)` are not supported
#   - reference definitions with quoted or angle-bracketed targets that contain
#     whitespace are truncated at the first space
#   - image stripping is best-effort on well-formed `![alt](path)` and does not
#     defend against nested parens in the URL or `]` inside alt text
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
err() { echo "::error::$*"; fail=1; }

# collect Markdown files: docs, top-level, and every SKILL.md
mapfile -t files < <(
  { find skills -name SKILL.md 2>/dev/null
    find docs -name '*.md' 2>/dev/null
    ls *.md 2>/dev/null
  } | sort -u
)

if [ "${#files[@]}" -eq 0 ]; then
  err "no Markdown files found under skills/, docs/, or repo root"
  echo "✗ link check failed"; exit 1
fi

# Resolve a single link target relative to the file's directory and complain
# if it does not exist on disk.
check_target() {
  local f="$1" d="$2" target="$3"
  # drop query and fragment before resolving on disk
  local raw="${target%%\#*}"
  raw="${raw%%\?*}"
  # skip empty, external, protocol-relative, mailto, tel, in-page-anchor-only
  case "$raw" in
    ""|http://*|https://*|//*|mailto:*|tel:*) return 0 ;;
  esac
  local resolved
  if [[ $raw = /* ]]; then
    # absolute-from-repo-root (rare in Markdown, tolerate it)
    resolved=".${raw}"
  else
    resolved="$d/$raw"
  fi
  if [ ! -e "$resolved" ]; then
    local norm
    norm=$(realpath -m --relative-to=. "$resolved" 2>/dev/null || echo "$resolved")
    err "$f: link target '${target}' does not resolve (${norm})"
  fi
}

count=0
for f in "${files[@]}"; do
  d=$(dirname "$f")

  # Strip image links so they never appear as inline-link candidates.
  # A raw ![alt](path) would otherwise match the `](target)` pattern below and
  # get flagged if the image is missing — image assets are catalog-orthogonal.
  content=$(sed -E 's/!\[[^]]*\]\([^)]*\)//g' "$f")

  # 1. inline links: [text](target)
  #    Loop runs in the current shell via process substitution so `fail` from
  #    `err` propagates. A piped `while read` would silently swallow failures.
  while read -r target; do
    check_target "$f" "$d" "$target"
    count=$((count+1))
  done < <(
    printf '%s\n' "$content" \
      | grep -oE '\]\([^)]+\)' \
      | sed 's/^](//; s/)$//'
  )

  # 2. reference links: [text][ref] paired with `[ref]: target` definitions.
  #    Build a per-file ref → target map, then resolve each `[text][ref]` usage.
  declare -A refs=()
  while IFS= read -r line; do
    if [[ $line =~ ^[[:space:]]*\[([^]]+)\]:[[:space:]]+([^[:space:]]+) ]]; then
      # store the raw target; check_target handles fragment/query/absolute
      refs["${BASH_REMATCH[1]}"]="${BASH_REMATCH[2]}"
    fi
  done < <(printf '%s\n' "$content")

  while read -r ref; do
    ref_target="${refs[$ref]-}"
    if [ -z "$ref_target" ]; then
      err "$f: reference '[$ref]' has no matching '[$ref]: …' definition"
      count=$((count+1))
      continue
    fi
    check_target "$f" "$d" "$ref_target"
    count=$((count+1))
  done < <(
    printf '%s\n' "$content" \
      | grep -oE '\]\[[^]]+\]' \
      | sed 's/^\]\[//; s/\]$//'
  )

  unset refs
done

if [ "$fail" -eq 0 ]; then
  echo "✓ relative links resolve (${count} link occurrences across ${#files[@]} files)"
else
  echo "✗ link check failed"; exit 1
fi
