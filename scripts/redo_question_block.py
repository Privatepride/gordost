#!/usr/bin/env python3
"""
Redesign the «Главный вопрос» block to match the site's design language.

The current block breaks consistency:
  - eyebrow has no section number (others: 'NN — TEXT')
  - heading is centered (others: left-aligned)
  - heading size is clamp(44px,7.5vw,92px) (others: 54px Unbounded 800)
  - extra gold rule under heading (nowhere else on the site)
  - eyebrow color #C89B4E (others: #A87F3A)

The fix mirrors the structure of the «Почему Гордость» section, but keeps
the dark navy background (per user choice) so the rhythm
HERO(navvy) → Главный вопрос(navvy) → Почему Гордость(beige) is preserved.

Card style is adapted to the dark background (same border-gradient pattern,
same .mbnum/.mbcard hover behaviour, but cream-on-navy palette).
"""
import json, re, sys

SRC = "/root/gordost/public/new/index.html"
GOLD = '#C89B4E'        # bright gold (for clipped photo text)
EYEBROW = '#A87F3A'     # muted gold (eyebrow color site-wide)
CREAM = '#F1EDE3'
NAVY = '#0D1626'
CARD_NAVY = '#131E33'
HPAD = 'max(32px,calc((100% - 1240px)/2))'

# photo-clip span (golden textured text), reused from site
PHOTO_CLIP_URL = '0add0925-1bcc-4d7d-a266-4cc01f9995a3'
def gold_text(word):
    return ('<span style="background-image:url(&quot;' + PHOTO_CLIP_URL +
            '&quot;);background-size:cover;background-position:center;'
            '-webkit-background-clip:text;background-clip:text;color:transparent">'
            + word + '</span>')

# ── Card builder (dark variant of «Почему Гордость» cards) ──────────────────
def card(num, title, body):
    return (
        '<div class="mbcard" style="position:relative;padding:1.5px;border-radius:22px;'
        'background:linear-gradient(180deg,rgba(241,235,220,.16),rgba(241,235,220,.10))">'
        '<div style="border-radius:20.5px;background:' + CARD_NAVY + ';padding:34px 30px 32px;'
        'box-shadow:inset 0 1px 0 rgba(241,235,220,.06);display:flex;flex-direction:column;height:100%">'
        '<div class="mbnum" style="font-family:\'Unbounded\',sans-serif;font-weight:800;font-size:38px;'
        'line-height:1;color:' + GOLD + ';opacity:.22;letter-spacing:-.02em">' + num + '</div>'
        '<div style="margin-top:22px;font-family:\'Unbounded\',sans-serif;font-weight:700;font-size:19px;'
        'line-height:1.3;color:' + CREAM + '">' + title + '</div>'
        '<div style="margin-top:14px;font-size:15px;color:rgba(241,235,220,.62);line-height:1.6">' + body + '</div>'
        '</div></div>'
    )

NEW_BLOCK = (
    # ── Section open: navy, full-bleed, same HPAD as everywhere ──────────────
    '<div style="position:relative;background:' + NAVY + ';padding:96px ' + HPAD + ' 92px;'
    'overflow:hidden;border-bottom:1.5px solid rgba(241,235,220,.10)">'
    # ambient glow (depth, matches other dark sections)
    '<div style="position:absolute;top:-180px;left:50%;transform:translateX(-50%);width:720px;height:480px;'
    'background:radial-gradient(circle,rgba(200,155,78,.10),transparent 65%);pointer-events:none"></div>'
    # ── Content column (1240 max, like the rest of the site) ────────────────
    '<div class="mr" style="position:relative;max-width:1240px;margin:0 auto">'
    # eyebrow row: [01 — ГЛАВНЫЙ ВОПРОС] ......... [ПОСЛЕ КАПИТАЛА]
    '<div style="display:flex;justify-content:space-between;align-items:baseline">'
    '<div style="display:flex;align-items:center;gap:12px;font-size:11.5px;letter-spacing:.16em;color:' + EYEBROW + '">'
    '<span style="width:28px;height:1.5px;background:' + EYEBROW + ';display:block"></span>01 — ГЛАВНЫЙ ВОПРОС</div>'
    '<div style="font-family:\'Golos Text\',sans-serif;font-size:12px;color:rgba(241,235,220,.45);letter-spacing:.06em">ПОСЛЕ КАПИТАЛА</div>'
    '</div>'
    # heading: 54px Unbounded 800, left-aligned (same as «Почему Гордость»)
    '<div style="margin-top:28px;font-family:\'Unbounded\',sans-serif;font-weight:800;font-size:54px;'
    'line-height:1.05;color:' + CREAM + ';letter-spacing:-.02em">Главный ' + gold_text('вопрос') + '</div>'
    # lead, left-aligned, max-width 680 (matches site lead style)
    '<div style="margin-top:24px;font-size:21px;line-height:1.6;color:rgba(241,235,220,.74);'
    'max-width:680px;font-weight:400">После создания капитала вы уже не спрашиваете '
    '<span style="color:rgba(241,235,220,.4)">«где взять денег»</span>.<br>'
    'Вопрос — ' + gold_text('с кем') + '.</div>'
    '</div>'
    # ── Three cards (grid 3 cols, same as «Почему Гордость») ─────────────────
    '<div class="mr-stagger" style="position:relative;max-width:1240px;margin:48px auto 0;'
    'display:grid;grid-template-columns:repeat(3,1fr);gap:20px">'
    + card('01', 'С кем заходить в сделки, не проверяя человека полгода?',
           'Сделки требуют доверия, а доверие — время. В клубе проверка уже сделана за вас.')
    + card('02', 'У кого спросить про нишу, в которой сам не эксперт?',
           'Резиденты — инвесторы из разных отраслей. Нужный опыт всегда рядом, в одном чате.')
    + card('03', 'С кем проводить свободное время насыщенно?',
           'Инвестиции, спорт, путешествия, ужины. Окружение, в которое не нужно «вписываться».')
    + '</div>'
    # ── Punchline (left-aligned, like the rest of the site) ─────────────────
    '<div class="mr" style="position:relative;max-width:1240px;margin:56px auto 0">'
    '<div style="font-family:\'Unbounded\',sans-serif;font-weight:400;font-size:24px;line-height:1.45;'
    'color:rgba(241,235,220,.48);letter-spacing:-.005em">Окружение нельзя купить.</div>'
    '<div style="margin-top:6px;font-family:\'Unbounded\',sans-serif;font-weight:400;font-size:24px;line-height:1.45;'
    'color:rgba(241,235,220,.48);letter-spacing:-.005em">Но можно попасть туда, где оно уже собрано.</div>'
    '<div style="margin-top:14px;font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:32px;line-height:1.2;'
    'color:' + CREAM + ';letter-spacing:-.015em">И именно ' + gold_text('мы') + ' его собрали.</div>'
    '</div>'
    '</div>'
)

# ── Load + decode template ──────────────────────────────────────────────────
with open(SRC) as f:
    html = f.read()
mt = re.search(r'<script type="__bundler/template"[^>]*>(.*?)</script>', html, re.S)
tpl = json.loads(mt.group(1).strip())

# ── Find the old block boundaries ───────────────────────────────────────────
start_marker = '<div style="position:relative;background:#0D1626;padding:120px'
start = tpl.find(start_marker)
if start < 0:
    sys.exit("ERROR: old block start marker not found")

end_marker = '<div style="background:#EAE3D4;padding:88px'
end = tpl.find(end_marker, start)
if end < 0:
    sys.exit("ERROR: next-section boundary not found")

old_block = tpl[start:end]
opens = len(re.findall(r'<div\b', old_block))
closes = len(re.findall(r'</div>', old_block))
if opens != closes:
    sys.exit(f"ERROR: old block unbalanced ({opens} <div> / {closes} </div>) — boundaries wrong")

print(f"replacing block chars {start}..{end} (len {end-start})")

# ── Replace ─────────────────────────────────────────────────────────────────
tpl_new = tpl[:start] + NEW_BLOCK + tpl[end:]
assert tpl_new != tpl, "no change?"

# round-trip sanity
new_json = json.dumps(tpl_new, ensure_ascii=False).replace('</', '<\\u002F')
assert json.loads(new_json) == tpl_new, "round-trip failed"

new_block_html = '<script type="__bundler/template">' + new_json + '</script>'
html_new = re.sub(
    r'<script type="__bundler/template"[^>]*>.*?</script>',
    lambda m: new_block_html,
    html, count=1, flags=re.S
)

with open(SRC, 'w') as f:
    f.write(html_new)

print(f"✓ «Главный вопрос» redesigned to match site design language (navy kept)")
print(f"  - eyebrow: '01 — ГЛАВНЫЙ ВОПРОС' + 'ПОСЛЕ КАПИТАЛА' label (was: unnumbered)")
print(f"  - heading: 54px Unbounded 800, left-aligned (was: centered, clamp 44-92px)")
print(f"  - lead: 21px left-aligned max-width 680 (was: centered)")
print(f"  - 3 cards: dark variant of «Почему Гордость» card style")
print(f"  - punchline: left-aligned (was: centered)")
print(f"  - removed: extra gold rule under heading")
print(f"  file size:", len(html_new), "bytes")
