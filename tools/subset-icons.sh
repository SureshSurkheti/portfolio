#!/usr/bin/env bash
# Rebuilds assets/fonts/boxicons-subset.woff2 + assets/css/boxicons-subset.css
# from the icons actually used in the HTML.
#
# RUN THIS AFTER ADDING A NEW <i class="bx bx-something"> — otherwise the glyph
# isn't in the subset and renders as an empty box.
#
#   ./tools/subset-icons.sh
#
# Needs: python3. It creates its own venv under tools/.venv on first run.

set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$PWD
VER=2.1.4

[ -d tools/.venv ] || python3 -m venv tools/.venv
tools/.venv/bin/pip install -q fonttools brotli

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
curl -sf --max-time 60 -o "$TMP/bx.css"   "https://unpkg.com/boxicons@$VER/css/boxicons.min.css"
curl -sf --max-time 60 -o "$TMP/bx.woff2" "https://unpkg.com/boxicons@$VER/fonts/boxicons.woff2"

# HTML markup AND icons injected at runtime by JS (the form spinner, the copy
# confirmation) — miss the JS and those glyphs render as empty boxes.
{ grep -ohE 'class="bx bxl?-[a-z0-9-]+"' ./*.html
  grep -ohE "['\"]bx bxl?-[a-z0-9-]+['\"]" assets/js/*.js
} | grep -oE 'bxl?-[a-z0-9-]+' | sort -u > "$TMP/used.txt"
echo "icons in use: $(wc -l < "$TMP/used.txt" | tr -d ' ')"

tools/.venv/bin/python - "$TMP" <<'PY'
import re, sys, json, pathlib
tmp = pathlib.Path(sys.argv[1])
css = (tmp/"bx.css").read_text(encoding="utf-8")
used = [l.strip() for l in (tmp/"used.txt").read_text().splitlines() if l.strip()]
mapping = dict(re.findall(r'\.(bx[a-z]?-[a-z0-9-]+):before\{content:"\\([0-9a-fA-F]+)"\}', css))
found, missing = {}, [n for n in used if n not in mapping]
for n in used:
    if n in mapping: found[n] = mapping[n]
if missing:
    sys.exit(f"ERROR: not in boxicons: {', '.join(missing)}")
(tmp/"cps.txt").write_text(",".join("U+"+c for c in sorted(set(found.values()))))
(tmp/"found.json").write_text(json.dumps(found))
print(f"matched {len(found)} icons")
PY

tools/.venv/bin/pyftsubset "$TMP/bx.woff2" \
  --unicodes-file="$TMP/cps.txt" --flavor=woff2 --layout-features='' \
  --no-hinting --desubroutinize \
  --output-file="$ROOT/assets/fonts/boxicons-subset.woff2"

tools/.venv/bin/python - "$TMP" "$ROOT" <<'PY'
import json, sys, pathlib
tmp, root = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
found = json.loads((tmp/"found.json").read_text())
rules = "".join(f'.{n}:before{{content:"\\{c}"}}' for n, c in sorted(found.items()))
(root/"assets/css/boxicons-subset.css").write_text(
 f"/* Boxicons 2.1.4, subset to the {len(found)} icons this site uses.\n"
 "   Regenerate with tools/subset-icons.sh after adding an icon. */\n"
 "@font-face{font-family:boxicons;font-weight:400;font-style:normal;font-display:block;"
 "src:url(../fonts/boxicons-subset.woff2) format('woff2')}"
 ".bx{font-family:boxicons!important;font-weight:400;font-style:normal;font-variant:normal;"
 "line-height:1;text-rendering:auto;display:inline-block;text-transform:none;speak:none;"
 "-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}" + rules + "\n",
 encoding="utf-8")
PY

# verify every glyph survived
tools/.venv/bin/python - "$TMP" "$ROOT" <<'PY'
import json, sys, pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
tmp, root = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
found = json.loads((tmp/"found.json").read_text())
f = TTFont(root/"assets/fonts/boxicons-subset.woff2"); cm = f.getBestCmap(); gs = f.getGlyphSet()
bad = []
for n, h in found.items():
    cp = int(h, 16)
    if cp not in cm: bad.append(n); continue
    bp = BoundsPen(gs); gs[cm[cp]].draw(bp)
    if bp.bounds is None: bad.append(n)
if bad: sys.exit(f"ERROR: glyphs missing or empty: {bad}")
print(f"verified {len(found)}/{len(found)} glyphs have outlines")
PY

echo "font: $(wc -c < assets/fonts/boxicons-subset.woff2 | tr -d ' ') B    css: $(wc -c < assets/css/boxicons-subset.css | tr -d ' ') B"
