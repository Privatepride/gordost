#!/usr/bin/env python3
"""
Sharpen cards in «Главный вопрос» and «Почему Гордость» to match the site.

The site uses SHARP-CORNER cards with a solid border — NOT rounded gradient
cards. Original content card spec (from «Наши мероприятия»):
    border:1.5px solid #0D1626; padding:28px 24px 32px; border-radius:0
    number: photo-clip (golden texture), font-weight:900, font-size:34px
    hover: background:#F4EFE3; transform:translateY(-6px)

Previously I built both manifesto blocks with rounded gradient cards
(border-radius:22px, border-gradient). This rewrites those cards to use the
site's real sharp-border language, with two variants:
  - Главный вопрос (navy bg): border 1.5px solid rgba(241,235,220,.18),
    hover background rgba(241,235,220,.04)
  - Почему Гордость (beige bg): border 1.5px solid #0D1626,
    hover background #F4EFE3 (exact original)
"""
import json, re, sys

SRC = "/root/gordost/public/new/index.html"
PHOTO_CLIP_URL = '0add0925-1bcc-4d7d-a266-4cc01f9995a3'

def photo_clip(word, fs='34px', weight='900'):
    """golden-textured number/word, exactly like original cards"""
    return ('<span style="font-family:\'Unbounded\',sans-serif;font-weight:' + weight +
            ';font-size:' + fs + ';line-height:1;background-image:url(&quot;' + PHOTO_CLIP_URL +
            '&quot;);background-size:cover;background-position:center;'
            '-webkit-background-clip:text;background-clip:text;color:transparent">' + word + '</span>')

# ── Variant A: dark (navy section) — for «Главный вопрос» ───────────────────
def dark_card(num, title, body):
    return (
        '<div class="mbcard" style="border:1.5px solid rgba(241,235,220,.18);padding:30px 26px 32px;'
        'display:flex;flex-direction:column;min-height:230px;transition:background .4s ease,transform .5s cubic-bezier(.2,.7,.2,1);'
        'style-hover:background:rgba(241,235,220,.04);transform:translateY(-6px)">'
        + photo_clip(num) +
        '<div style="margin-top:22px;font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:20px;'
        'line-height:1.3;color:#F1EDE3">' + title + '</div>'
        '<div style="margin-top:10px;font-size:14px;color:rgba(241,235,220,.62);line-height:1.6">' + body + '</div>'
        '</div>'
    )

# ── Variant B: light (beige section) — for «Почему Гордость» (exact original) ─
def light_card(num, title, body, footnote=None):
    s = (
        '<div class="mbcard" style="border:1.5px solid #0D1626;padding:30px 26px 32px;'
        'display:flex;flex-direction:column;min-height:230px;transition:background .4s ease,transform .5s cubic-bezier(.2,.7,.2,1);'
        'style-hover:background:#F4EFE3;transform:translateY(-6px)">'
        + photo_clip(num) +
        '<div style="margin-top:22px;font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:20px;'
        'line-height:1.3;color:#0D1626">' + title + '</div>'
        '<div style="margin-top:10px;font-size:14px;color:rgba(13,22,38,.62);line-height:1.6">' + body + '</div>'
    )
    if footnote:
        s += ('<div style="margin-top:14px;font-size:13px;color:rgba(13,22,38,.48);line-height:1.6;'
              'padding-top:14px;border-top:1px solid rgba(13,22,38,.14)">' + footnote + '</div>')
    s += '</div>'
    return s

# ── Load + decode ───────────────────────────────────────────────────────────
with open(SRC) as f:
    html = f.read()
mt = re.search(r'<script type="__bundler/template"[^>]*>(.*?)</script>', html, re.S)
tpl = json.loads(mt.group(1).strip())

changes = 0

# ════════════════════════════════════════════════════════════════════════════
# 1) «Главный вопрос» — replace the 3 dark cards (mbcard with #131E33)
# ════════════════════════════════════════════════════════════════════════════
# Find the dark-card grid container (class="mr-stagger" near "01 — ГЛАВНЫЙ ВОПРОС")
gq_idx = tpl.find('01 — ГЛАВНЫЙ ВОПРОС')
if gq_idx < 0:
    sys.exit("ERROR: '01 — ГЛАВНЫЙ ВОПРОС' not found")

# find the mr-stagger grid after it
grid_re = re.compile(r'<div class="mr-stagger"([^>]*)>(.*?)</div>\s*(?:<div class="mr")', re.S)
# locate the grid start after gq_idx
grid_start = tpl.find('<div class="mr-stagger"', gq_idx)
if grid_start < 0:
    sys.exit("ERROR: mr-stagger grid not found after ГЛАВНЫЙ ВОПРОС")
# find matching close by counting divs
sub = tpl[grid_start:]
depth = 0; grid_end = 0
for mm in re.finditer(r'<div\b[^>]*>|</div>', sub):
    if mm.group(0).startswith('<div'): depth += 1
    else:
        depth -= 1
        if depth == 0:
            grid_end = grid_start + mm.end(); break

old_grid = tpl[grid_start:grid_end]
new_grid = (
    '<div class="mr-stagger" style="position:relative;max-width:1240px;margin:48px auto 0;'
    'display:grid;grid-template-columns:repeat(3,1fr);gap:20px">'
    + dark_card('01', 'С кем заходить в сделки, не проверяя человека полгода?',
                'Сделки требуют доверия, а доверие — время. В клубе проверка уже сделана за вас.')
    + dark_card('02', 'У кого спросить про нишу, в которой сам не эксперт?',
                'Резиденты — инвесторы из разных отраслей. Нужный опыт всегда рядом, в одном чате.')
    + dark_card('03', 'С кем проводить свободное время насыщенно?',
                'Инвестиции, спорт, путешествия, ужины. Окружение, в которое не нужно «вписываться».')
    + '</div>'
)
tpl = tpl[:grid_start] + new_grid + tpl[grid_end:]
changes += 1
print(f"✓ Главный вопрос: cards → sharp border (dark variant)")

# ════════════════════════════════════════════════════════════════════════════
# 2) «Почему Гордость» — replace the 3 light cards (#F4EFE3 rounded)
# ════════════════════════════════════════════════════════════════════════════
pg_idx = tpl.find('02 — ПОЧЕМУ ГОРДОСТЬ')
if pg_idx < 0:
    sys.exit("ERROR: '02 — ПОЧЕМУ ГОРДОСТЬ' not found")
grid_start = tpl.find('<div class="mr-stagger"', pg_idx)
if grid_start < 0:
    sys.exit("ERROR: mr-stagger grid not found after ПОЧЕМУ ГОРДОСТЬ")
sub = tpl[grid_start:]
depth = 0; grid_end = 0
for mm in re.finditer(r'<div\b[^>]*>|</div>', sub):
    if mm.group(0).startswith('<div'): depth += 1
    else:
        depth -= 1
        if depth == 0:
            grid_end = grid_start + mm.end(); break

new_grid = (
    '<div class="mr-stagger" style="margin-top:44px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px">'
    + light_card('01', 'Полный запрет продаж внутри клуба.',
                 'Резиденты — только инвесторы. У нас нет наставников, продюсеров и «уникальных предложений».',
                 'Здесь вы чувствуете себя человеком, а не лидом из списка инвесторов.')
    + light_card('02', 'Мы не учим и не советуем, куда вложить капитал.',
                 'Каждый сам принимает решения. Мы даём окружение, в котором решения принимаются увереннее.',
                 'Опыт резидентов ценнее любой рекомендации эксперта.')
    + light_card('03', 'У нас классный движ, а не скучные конференции.',
                 'Инвестиции, спорт, путешествия и ужины. Сила клуба — в живом общении между равными.',
                 'Резиденты приходят за людьми, а не за программой.')
    + '</div>'
)
tpl = tpl[:grid_start] + new_grid + tpl[grid_end:]
changes += 1
print(f"✓ Почему Гордость: cards → sharp border (light variant, exact original)")

# ── Re-encode ───────────────────────────────────────────────────────────────
new_json = json.dumps(tpl, ensure_ascii=False).replace('</', '<\\u002F')
assert json.loads(new_json) == tpl, "round-trip failed"

new_block_html = '<script type="__bundler/template">' + new_json + '</script>'
html_new = re.sub(
    r'<script type="__bundler/template"[^>]*>.*?</script>',
    lambda m: new_block_html, html, count=1, flags=re.S
)

with open(SRC, 'w') as f:
    f.write(html_new)

print(f"\n✓ {changes} card grids sharpened")
print("  - removed: border-radius:22px/20.5px, gradient borders, #131E33/#F4EFE3 fills")
print("  - added: border:1.5px solid, border-radius:0 (sharp), photo-clip numbers")
print("  - dark cards: border rgba(241,235,220,.18), hover bg rgba(241,235,220,.04)")
print("  - light cards: border #0D1626, hover bg #F4EFE3 (exact original spec)")
print("  file size:", len(html_new), "bytes")
