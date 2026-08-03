#!/usr/bin/env python3
"""Transform /new site bundle: full-bleed sections + centered 1240px content.

Reads /root/gordost/public/new/index.html (a bundler-format file whose real
HTML lives as a JSON-encoded string inside <script type="__bundler/template">),
applies the layout transformation, and writes the result back.

Transformation:
  1. Root container becomes full-width (drop max-width:1240px and margin:0 auto),
     so section backgrounds extend edge-to-edge of the viewport.
  2. Each direct-child section's horizontal padding is replaced with a CSS max()
     expression that keeps 32px on narrow viewports and centers a 1240px content
     column on wide ones:  max(32px, calc((100% - 1240px) / 2))
  3. The marquee ticker (section with width:max-content) and the two-column grid
     sections are left structurally untouched at the container level; grid *cells*
     keep their own padding (they already read well as wide grids).

Bundler-format safety:
  - Template is JSON. We json.loads, edit the decoded HTML, then re-encode with
    ensure_ascii=False (keeps Cyrillic literal, matching the original) and escape
    '</' to '<\\u002F' so the inline <script> tag cannot be closed prematurely.
  - Round-trip is verified: re-parsed new JSON equals the expected edited string,
    the asset manifest is untouched, and file remains a single <script> template.
"""

import json
import re
import sys
from pathlib import Path

SRC = Path("/root/gordost/public/new/index.html")
CENTER = "max(32px,calc((100% - 1240px)/2))"  # centered horizontal padding


def parse_direct_children(tpl, root_open_end):
    """Return list of (open_start, open_tag_end, close_start, close_end) for each
    direct child <div> of the container that opens at root_open_end."""
    children = []
    depth = 1
    i = root_open_end
    pending = None
    open_re = re.compile(r"<div\b[^>]*>")
    close_re = re.compile(r"</div>")
    while i < len(tpl):
        mo = open_re.search(tpl, i)
        mc = close_re.search(tpl, i)
        o = (mo.start(), mo.start() + len(mo.group(0))) if mo else (None, None)
        c = (mc.start(), mc.end()) if mc else (None, None)
        if o[0] is None and c[0] is None:
            break
        if c[0] is not None and (o[0] is None or c[0] < o[0]):
            depth -= 1
            if depth == 0:
                break  # this is the container's own close
            if depth == 1 and pending is not None:
                children.append((pending[0], pending[1], c[0], c[1]))
                pending = None
            i = c[1]
        else:
            if depth == 1 and pending is None:
                pending = o
            depth += 1
            i = o[1]
    return children


def transform_hpad(val):
    """Given a CSS padding shorthand value, replace only the HORIZONTAL components
    with the centering expression. Return new value, or None to leave unchanged."""
    parts = val.split()
    n = len(parts)
    if n == 1:
        return None  # uniform padding; leave (rare, would distort if changed)
    if n == 2:
        return f"{parts[0]} {CENTER}"
    if n == 3:
        return f"{parts[0]} {CENTER} {parts[2]}"
    if n == 4:
        return f"{parts[0]} {CENTER} {parts[2]} {CENTER}"
    return None


def main():
    raw_file = SRC.read_text(encoding="utf-8")
    m = re.search(r'<script type="__bundler/template">(.*?)</script>', raw_file, re.S)
    if not m:
        sys.exit("ERROR: template script tag not found")
    raw_json = m.group(1).strip()
    tpl = json.loads(raw_json)  # decoded HTML string

    # 1) Root container → full width. The exact opening tag is unique.
    root_tag = (
        '<div style="width:100%;max-width:1240px;margin:0 auto;'
        'background:#F1EDE3;font-family:\'Golos Text\',sans-serif;overflow:hidden">'
    )
    new_root_tag = (
        '<div style="width:100%;background:#F1EDE3;'
        'font-family:\'Golos Text\',sans-serif;overflow:hidden">'
    )
    if tpl.count(root_tag) != 1:
        sys.exit(f"ERROR: root container not found exactly once (found {tpl.count(root_tag)})")
    tpl = tpl.replace(root_tag, new_root_tag, 1)

    root_idx = tpl.find(new_root_tag)
    root_open_end = tpl.find(">", root_idx) + 1
    children = parse_direct_children(tpl, root_open_end)

    # 2) Per-section horizontal-padding centering.
    #    Edit from last child to first so character offsets stay valid.
    edits = []  # (open_start, open_tag_end, old_pad_decl, new_pad_decl)
    for (os_, oe, cs, ce) in children:
        tag = tpl[os_:oe]
        pm = re.search(r"padding:([^;\"]+)", tag)
        if not pm:
            continue  # grid sections without container padding — handled below
        old_val = pm.group(1)
        new_val = transform_hpad(old_val)
        if new_val is None or new_val == old_val:
            continue
        # Skip sections that must stay genuinely full-bleed:
        #  - the marquee ticker: container has overflow:hidden + padding:14px 0,
        #    and its inner strip uses width:max-content with an infinite horizontal
        #    animation. Adding side padding here would clip/shift the scrolling text.
        if "overflow:hidden" in tag and old_val == "14px 0":
            continue
        old_decl = f"padding:{old_val}"
        new_decl = f"padding:{new_val}"
        # Ensure the padding decl is unique within THIS tag (it is: first match).
        edits.append((os_, oe, old_decl, new_decl))

    for (os_, oe, old_decl, new_decl) in reversed(edits):
        tag = tpl[os_:oe]
        if tag.count(old_decl) != 1:
            sys.exit(f"ERROR: padding decl not unique in tag: {old_decl!r}\n{tag}")
        new_tag = tag.replace(old_decl, new_decl, 1)
        tpl = tpl[:os_] + new_tag + tpl[oe:]

    # 3) Re-encode the template into the bundler JSON format (safe for <script>).
    new_json = json.dumps(tpl, ensure_ascii=False).replace("</", "<\\u002F")

    # Verify round-trip semantics.
    reparsed = json.loads(new_json)
    if reparsed != tpl:
        sys.exit("ERROR: round-trip failed (reparsed != edited template)")

    new_file = raw_file.replace(m.group(1).strip(), new_json, 1)
    if new_file == raw_file:
        sys.exit("ERROR: file unchanged after transform (replacement failed)")

    SRC.write_text(new_file, encoding="utf-8")

    # Report
    print(f"OK. Transformed {SRC}")
    print(f"  root container → full width")
    print(f"  sections centered: {len(edits)}")
    print(f"  file size: {len(raw_file)} → {len(new_file)} bytes")


if __name__ == "__main__":
    main()
