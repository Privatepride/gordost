#!/usr/bin/env python3
"""
Replace past-events cards with real Baserow data (rows 3,4,5,9,10,19).
Updates BOTH desktop index.html and mobile.html. Idempotent: rebuilds the
cards section from scratch each run so data stays in sync with Baserow.
"""
import re

# Real data fetched from Baserow table 838
EVENTS = [
    {
        "id": 3,
        "title": "Аналитическое радио с Дмитрием Мохначевым",
        "sub": "Онлайн · разбор рынков и запросов",
        "image": "https://base.gordost.club/media/thumbnails/card_cover/ultOHd5n0bThE5fgks5bLC8soWQjfw2A_a3811e4fa2525f219f08cc4a601ed15b436a88927cc00605b54cb878391c791c.png",
    },
    {
        "id": 4,
        "title": "ИнвестБаня",
        "sub": "Москва · офлайн-встреча клуба",
        "image": "https://base.gordost.club/media/thumbnails/card_cover/jyicqCM6OsmXR6OnYDunT7fpXymsNmXA_e9aec6df39f76808c8dec62b6b8815b28b77beaec7b88d9b343200bb06f19f6e.jpg",
    },
    {
        "id": 5,
        "title": "Добрые дела: выезд в приют к животным",
        "sub": "Москва · благотворительность",
        "image": None,
    },
    {
        "id": 9,
        "title": "Выезд на Эндуро",
        "sub": "Москва · активный выезд",
        "image": None,
    },
    {
        "id": 10,
        "title": "Мастермайнд",
        "sub": "Онлайн · разбор запросов",
        "image": None,
    },
    {
        "id": 19,
        "title": "СерфЗавтрак",
        "sub": "Москва · спортивное утро",
        "image": "https://base.gordost.club/media/thumbnails/card_cover/sIAcKhvIud4NCVXzIhfgNAjO5UIAOazl_2df5219e983f5cf21100bc0202cc93dd16cc92cab9b987af67a6ecc122a3a925.jpg",
    },
]

def media_html(ev, height):
    """Build the media block: real photo if available, else imgph placeholder."""
    if ev["image"]:
        return (f'<img src="{ev["image"]}" loading="lazy" '
                f'style="width:100%;height:{height};object-fit:cover;display:block;'
                f'filter:grayscale(.35) contrast(1.05) brightness(1.02)" '
                f'alt="{ev["title"]}" '
                f'onerror="this.outerHTML=\'<div class=&quot;imgph&quot; '
                f'style=&quot;width:100%;height:{height};display:block&quot;>'
                f'Фото: {ev["title"]}</div>\'">')
    return (f'<div class="imgph" style="width:100%;height:{height};display:block">'
            f'Фото: {ev["title"]}</div>')

# ═══ DESKTOP ═══
DESK_SRC = "/root/gordost/public/index.html"
with open(DESK_SRC) as f:
    html = f.read()

cards = ""
for ev in EVENTS:
    cards += (
        '<div style="display:flex;flex-direction:column;border:1px solid rgba(13,22,38,.25);background:#F6F2E8;transition:transform .5s cubic-bezier(.2,.7,.2,1),border-color .4s ease" class="h5">'
        + media_html(ev, "196px") +
        f'<div style="font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:18px;line-height:1.32;color:#0D1626;padding:20px 22px 0">{ev["title"]}</div>'
        f'<div style="font-size:13.5px;color:rgba(13,22,38,.7);line-height:1.6;padding:8px 22px 22px">{ev["sub"]}</div>'
        '</div>'
    )
new_grid = ('<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px;animation:greveal both;animation-timeline:view();animation-range:entry 2% cover 22%">'
            + cards + '</div>')

# find the past-events grid and replace it
ge_idx = html.find('display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px;animation:greveal')
if ge_idx >= 0:
    start = html.rfind('<div ', 0, ge_idx)
    sub = html[start:]
    depth = 0; end_o = 0
    for mm in re.finditer(r'<div\b[^>]*>|</div>', sub):
        if mm.group(0).startswith('<div'): depth += 1
        else:
            depth -= 1
            if depth == 0: end_o = mm.end(); break
    html = html[:start] + new_grid + html[start+end_o:]
    with open(DESK_SRC, 'w') as f: f.write(html)
    print(f"✓ desktop index.html: past events updated (6 real Baserow rows)")
else:
    print("WARN: desktop past-events grid not found")

# ═══ MOBILE ═══
MOB_SRC = "/root/gordost/public/mobile.html"
with open(MOB_SRC) as f:
    mhtml = f.read()

# Mobile: replace each media element in the past-events range
kak = mhtml.find('Как это')
bli = mhtml.find('Ближайшие')
if kak >= 0 and bli >= 0:
    block = mhtml[kak:bli]
    counter = [0]
    def replace_media(m):
        # Match either an <img ...> with grayscale (our prev injection) OR <div class="imgph"...>...</div>
        i = counter[0]
        counter[0] += 1
        if i >= len(EVENTS):
            return m.group(0)
        return media_html(EVENTS[i], "140px")
    # replace both real-img (our injection) and imgph placeholders
    block_new = re.sub(
        r'<img[^>]*filter:grayscale[^>]*>|<div class="imgph"[^>]*>Фото:[^<]*</div>',
        replace_media, block
    )
    mhtml = mhtml[:kak] + block_new + mhtml[bli:]
    with open(MOB_SRC, 'w') as f: f.write(mhtml)
    print(f"✓ mobile.html: past events updated (6 real Baserow rows)")
else:
    print("WARN: mobile past-events range not found")
