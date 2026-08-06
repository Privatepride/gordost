#!/usr/bin/env python3
"""
Rebuild the ENTIRE mobile past-events block from scratch with real Baserow
data (rows 3,4,5,9,10,19). The previous regex injection left corrupt markup
(img + leftover placeholder text + stale titles). This replaces the whole
block cleanly.
"""
import re

SRC = "/root/gordost/public/mobile.html"
with open(SRC) as f:
    h = f.read()

EVENTS = [
    ("Аналитическое радио с Дмитрием Мохначевым", "Онлайн · разбор рынков и запросов",
     "https://base.gordost.club/media/thumbnails/card_cover/ultOHd5n0bThE5fgks5bLC8soWQjfw2A_a3811e4fa2525f219f08cc4a601ed15b436a88927cc00605b54cb878391c791c.png"),
    ("ИнвестБаня", "Москва · офлайн-встреча клуба",
     "https://base.gordost.club/media/thumbnails/card_cover/jyicqCM6OsmXR6OnYDunT7fpXymsNmXA_e9aec6df39f76808c8dec62b6b8815b28b77beaec7b88d9b343200bb06f19f6e.jpg"),
    ("Добрые дела: выезд в приют к животным", "Москва · благотворительность", None),
    ("Выезд на Эндуро", "Москва · активный выезд", None),
    ("Мастермайнд", "Онлайн · разбор запросов", None),
    ("СерфЗавтрак", "Москва · спортивное утро",
     "https://base.gordost.club/media/thumbnails/card_cover/sIAcKhvIud4NCVXzIhfgNAjO5UIAOazl_2df5219e983f5cf21100bc0202cc93dd16cc92cab9b987af67a6ecc122a3a925.jpg"),
]

def media(title, img):
    if img:
        return (f'<img src="{img}" loading="lazy" '
                f'style="width:100%;height:140px;object-fit:cover;display:block;'
                f'filter:grayscale(.35) contrast(1.05) brightness(1.02)" '
                f'alt="{title}">')
    return (f'<div class="imgph" style="width:100%;height:140px;display:block">'
            f'Фото: {title}</div>')

cards = ""
for title, sub, img in EVENTS:
    cards += (
        '<div style="border:1px solid rgba(13,22,38,.25);background:#F6F2E8;display:flex;flex-direction:column">'
        + media(title, img) +
        f'<div style="font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:17px;line-height:1.32;color:#0D1626;padding:16px 16px 0">{title}</div>'
        f'<div style="font-size:13.5px;color:rgba(13,22,38,.7);line-height:1.6;padding:7px 16px 18px">{sub}</div>'
        '</div>'
    )

new_block = '<div style="display:grid;gap:16px;margin-top:24px">' + cards + '</div>'

# Find the old grid: starts after "было</span></div>" and the heading close
# Pattern: <div style="display:grid;gap:16px;margin-top:24px"> ... </div>
# It's the first such grid after "Как это"
kak = h.find('Как это')
bli = h.find('Ближайшие')
if kak < 0 or bli < 0:
    raise SystemExit("markers not found")

# find the grid opening in [kak, bli]
grid_marker = 'display:grid;gap:16px;margin-top:24px'
gstart_rel = h.find(grid_marker, kak)
if gstart_rel < 0 or gstart_rel > bli:
    raise SystemExit("grid marker not found between Как это and Ближайшие")
gstart = h.rfind('<div ', 0, gstart_rel)

# find matching close
sub = h[gstart:bli]
depth = 0; end_o = 0
for mm in re.finditer(r'<div\b[^>]*>|</div>', sub):
    if mm.group(0).startswith('<div'): depth += 1
    else:
        depth -= 1
        if depth == 0: end_o = mm.end(); break

h = h[:gstart] + new_block + h[gstart+end_o:]

with open(SRC, 'w') as f:
    f.write(h)
print("✓ mobile past-events block fully rebuilt with 6 real Baserow events")
