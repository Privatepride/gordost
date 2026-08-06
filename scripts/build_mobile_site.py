#!/usr/bin/env python3
"""
Build mobile.html from the mobile design mockup: same functional wiring
as the desktop index.html, but using the mobile markup 1:1.
  - cookie-consent, meta viewport (already present)
  - nav burger menu + "Заявка" CTA trigger
  - section ids for scroll targets (mobile menu links)
  - red CTA buttons → data-apply-open
  - Telegram (none in mobile design — add a TG button in final CTA)
  - past events: .imgph → real Baserow photos
  - upcoming events: static 4 cards → JS-rendered container
  - 2 modals + JS (events renderer, form logic, nav) — shared with desktop
"""
import re, sys

SRC_DESIGN = "/tmp/new_design/export/gordost-mobile.html"
OUT = "/root/gordost/public/mobile.html"

with open(SRC_DESIGN) as f:
    html = f.read()
changes = []

# ═══ HEAD: title + meta desc + cookie-consent + modal CSS ═══
html = html.replace(
    '<title>Гордость — инвестклуб (мобайл)</title>',
    '<title>ГОРДОСТЬ — закрытый инвестиционный клуб</title>\n'
    '<meta name="description" content="Закрытый клуб для инвесторов с капиталом от 50 млн ₽. Сделки, окружение, мероприятия. С 2018 года.">',
    1
)
if 'cookie-consent.js' not in html:
    html = html.replace('</style>', '</style>\n<script src="/cookie-consent.js" defer></script>', 1)

# Modal/menu CSS (same as desktop — appended to existing <style>)
EXTRA_CSS = """
  .mobile-menu{display:none;position:fixed;top:64px;left:0;right:0;background:#0D1626;z-index:200;padding:12px 18px;border-bottom:1px solid rgba(241,235,220,.12)}
  .mobile-menu.open{display:block}
  .mobile-menu a{display:block;color:#F1EBDC;font-size:14px;letter-spacing:.04em;padding:13px 0;border-bottom:1px solid rgba(241,235,220,.1);text-decoration:none}
  .mobile-menu a:last-child{border-bottom:none}
  .gmodal{display:none;position:fixed;inset:0;z-index:9999;background:rgba(13,22,38,.78);align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px 12px}
  .gmodal.open{display:flex}
  .gmodal-box{background:#0D1626;width:100%;max-width:420px;padding:30px 20px 26px;position:relative;border:1px solid rgba(241,235,220,.14)}
  .gmodal h3{font-family:'Unbounded',sans-serif;font-weight:700;font-size:20px;color:#F1EDE3;margin:0 0 6px}
  .gmodal-sub{font-size:12.5px;color:rgba(241,235,220,.6);margin:0 0 18px}
  .gmodal-close{position:absolute;top:10px;right:16px;color:rgba(241,235,220,.6);font-size:26px;line-height:1;cursor:pointer;background:none;border:none}
  .gfield{display:flex;flex-direction:column;gap:5px;font-size:11.5px;color:rgba(241,235,220,.7);margin-bottom:10px;font-family:'Golos Text',sans-serif}
  .gfield input,.gfield textarea,.gfield select{background:#131E33;border:1px solid rgba(241,235,220,.16);color:#F1EDE3;font-size:13.5px;padding:10px 11px;font-family:'Golos Text',sans-serif;border-radius:0}
  .gfield input:focus,.gfield textarea:focus,.gfield select:focus{outline:none;border-color:#C89B4E}
  .gfield textarea{resize:vertical;min-height:56px}
  .gpills{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
  .gpill{font-size:11.5px;color:rgba(241,235,220,.7);border:1px solid rgba(241,235,220,.22);padding:6px 10px;cursor:pointer;user-select:none;border-radius:100px;transition:all .2s}
  .gpill.sel{background:#940907;color:#F7F3EA;border-color:#940907}
  .gbtn{background:#940907;color:#F7F3EA;font-weight:700;font-size:14.5px;padding:14px;border:none;cursor:pointer;width:100%;border-radius:100px;font-family:'Golos Text',sans-serif}
  .gbtn:hover{filter:brightness(1.1)}
  .gbtn:disabled{opacity:.5;cursor:not-allowed}
  .gconsent{display:flex;align-items:flex-start;gap:9px;font-size:11px;color:rgba(241,235,220,.6);line-height:1.5;margin:6px 0 14px}
  .gconsent input{margin-top:3px;accent-color:#940907}
  .gconsent a{color:#C89B4E;text-decoration:underline}
  .gerr{color:#C8201A;font-size:12.5px;margin-top:6px;display:none}
  .gsuccess{display:none;text-align:center;color:#F1EDE3;padding:20px 0}
  .gsuccess h3{font-family:'Unbounded',sans-serif;font-weight:700;font-size:20px;margin:0 0 10px}
  .gsuccess p{font-size:14px;color:rgba(241,235,220,.7);line-height:1.6;margin:0}
  .gsuccess a{color:#C89B4E}
  .ev-empty{padding:28px 16px;text-align:center;color:rgba(13,22,38,.5);font-size:14px}
"""
html = html.replace('</style>', EXTRA_CSS + '</style>', 1)
changes.append("head: title/meta/cookie-consent/modal CSS")

# ═══ NAV: wire burger + "Заявка" CTA + add mobile menu ═══
# The burger is a visual div; wire it to toggle the menu
html = html.replace(
    '<div style="display:flex;flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;padding:0 11px;box-sizing:border-box;align-items:flex-start">',
    '<div onclick="document.getElementById(\'mobileMenu\').classList.toggle(\'open\')" style="display:flex;flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;padding:0 11px;box-sizing:border-box;align-items:flex-start;cursor:pointer">',
    1
)
# "Заявка" CTA → data-apply-open
html = html.replace(
    '<div style="background:#940907;color:#F7F3EA;font-weight:700;font-size:13px;padding:15px 20px;border-radius:100px">Заявка ↗</div>',
    '<div data-apply-open="1" style="background:#940907;color:#F7F3EA;font-weight:700;font-size:13px;padding:15px 20px;border-radius:100px;cursor:pointer">Заявка ↗</div>',
    1
)
# Add the mobile menu after the nav bar closes — find end of nav div
# The nav block is: <div style="background:#0D1626;...padding:14px 18px"> ... </div>
# Insert mobile menu right before the first section content after nav
mobile_menu = (
    '        <div class="mobile-menu" id="mobileMenu">\n'
    '          <a href="#" data-apply-open="1" style="color:#C89B4E">Подать заявку ↗</a>\n'
    '        </div>\n\n'
)
# insert after the closing of the nav bar. The nav closes right before the hero/stats section.
# Find '<div style="padding:' that starts the hero content (after nav)
# The structure: ...</div> (nav close) then next section. Insert after the first </div></div> after the burger.
# Simpler: insert right after the nav block's end — find the </div> that closes the padding:14px 18px div
nav_close_idx = html.find('</div>\n        </div>', html.find('padding:14px 18px'))
if nav_close_idx >= 0:
    insert_at = nav_close_idx + len('</div>\n        </div>')
    html = html[:insert_at] + '\n' + mobile_menu + html[insert_at:]
    changes.append("nav: burger toggle + Заявка trigger + mobile menu")
else:
    # fallback: insert before the first <img after nav
    print("  WARN: nav close not found, inserting menu after body open")

# ═══ SECTION IDs ═══
# Mobile has: "Почему" (why), "Шесть направлений", "Как это было" (past events), "Ближайшие даты" (upcoming), final CTA
# Map: Почему → sec-club, Шесть → sec-ecosystem, Как это было → sec-events (combine past+upcoming), final CTA → sec-join
# Find section opens by their background/heading. Mobile sections open with <div style="background:#EAE3D4... or #0D1626...
# Add ids to the 34px heading containers' parent sections
# "Почему" section
pyt_idx = html.find('font-size:34px;line-height:1.06;letter-spacing:-.025em;color:#0D1626">Почему')
if pyt_idx >= 0:
    # back up to the section wrapper (the div with padding or background before it)
    # find the nearest preceding <div style=" that opens a section
    # The "Почему" block is inside <div style="background:#EAE3D4;...">
    sec_start = html.rfind('<div style="background:#EAE3D4', 0, pyt_idx)
    if sec_start >= 0:
        html = html[:sec_start+5] + 'id="sec-club" ' + html[sec_start+5:]

# "Шесть направлений" → sec-ecosystem
six_idx = html.find('>Шесть')
if six_idx >= 0:
    sec_start = html.rfind('<div style="', 0, six_idx)
    # go further back to find the section wrapper (could be a couple levels up)
    # find the nearest <div style="padding or background
    for back in range(six_idx, max(0, six_idx-1500), -1):
        if html[back:back+13] == '<div style="':
            cand = html[back:back+80]
            if 'background:' in cand or 'padding:' in cand:
                sec_start = back; break
    html = html[:sec_start+5] + 'id="sec-ecosystem" ' + html[sec_start+5:]

# "Как это было" + "Ближайшие даты" → sec-events (add to the past-events section)
kak_idx = html.find('>Как это')
if kak_idx >= 0:
    sec_start = html.rfind('<div style="', 0, kak_idx)
    for back in range(kak_idx, max(0, kak_idx-1500), -1):
        if html[back:back+13] == '<div style="':
            cand = html[back:back+80]
            if 'background:' in cand or ('padding:' in cand and 'border-bottom' in cand):
                sec_start = back; break
    html = html[:sec_start+5] + 'id="sec-events" ' + html[sec_start+5:]

# final CTA → sec-join
final_idx = html.find('Займите своё место')
if final_idx >= 0:
    sec_start = html.rfind('<div style="background:#0D1626', 0, final_idx)
    if sec_start >= 0:
        html = html[:sec_start+5] + 'id="sec-join" ' + html[sec_start+5:]
changes.append("section ids: sec-club/ecosystem/events/join")

# ═══ TRIGGER BUTTONS: red CTAs → data-apply-open ═══
# Hero "Стать резидентом"
html = html.replace(
    '<div style="background:#940907;color:#F7F3EA;font-weight:700;font-size:15px;padding:17px 24px;border-radius:100px;text-align:center">Стать резидентом ↗</div>',
    '<div data-apply-open="1" style="background:#940907;color:#F7F3EA;font-weight:700;font-size:15px;padding:17px 24px;border-radius:100px;text-align:center;cursor:pointer">Стать резидентом ↗</div>',
    1
)
# Final CTA "Подать заявку"
html = html.replace(
    '<div style="background:#940907;color:#F7F3EA;font-weight:700;font-size:15px;padding:17px 24px;border-radius:100px;margin-top:24px">Подать заявку ↗</div>',
    '<div data-apply-open="1" style="background:#940907;color:#F7F3EA;font-weight:700;font-size:15px;padding:17px 24px;border-radius:100px;margin-top:24px;cursor:pointer">Подать заявку ↗</div>',
    1
)
changes.append("trigger buttons: data-apply-open (Стать резидентом, Подать заявку, Заявка)")

# ═══ PAST EVENTS: .imgph → real Baserow photos ═══
# Mobile past-events: find the grid after "Как это было"
PAST_EVENTS_M = [
    ("ИнвестБаня", "Москва · фирменный формат", "https://base.gordost.club/media/thumbnails/card_cover/njzEAtcf5gd01QBOvuhfmmtBwUeF5xZc_f67015128027875b451806e40c02e0fc8069e832a02faf75f0443c1e5fc17fc4.png"),
    ("Аналитическое радио", "Онлайн · разбор рынков", "https://base.gordost.club/media/thumbnails/card_cover/past2 radio.png"),
    ("Поход сильных", "Природа · выезд клуба", "https://base.gordost.club/media/thumbnails/card_cover/past3 hike.png"),
    ("ИнвестУжин", "Москва · закрытый ужин", "https://base.gordost.club/media/thumbnails/card_cover/past4 dinner.png"),
    ("ИнвестЭкскурсия ГАБ", "Москва · гос. облигации", "https://base.gordost.club/media/thumbnails/card_cover/past5 gab.png"),
    ("Добрые дела: приют", "Москва · благотворительность", "https://base.gordost.club/media/thumbnails/card_cover/past6 charity.png"),
]
# mobile uses .imgph divs — replace each
# find all .imgph in past events area (between "Как это было" and "Ближайшие")
kak = html.find('Как это')
bli = html.find('Ближайшие')
if kak >= 0 and bli >= 0:
    # replace each .imgph block in [kak, bli] with a real img
    block = html[kak:bli]
    # find all imgph divs
    def replace_imgph(m):
        # m.group: the full <div class="imgph" ...>...</div>
        # pick next event
        i = replace_imgph.counter
        replace_imgph.counter += 1
        if i >= len(PAST_EVENTS_M):
            return m.group(0)
        title, sub, img = PAST_EVENTS_M[i]
        return (f'<img src="{img}" loading="lazy" style="width:100%;height:140px;object-fit:cover;display:block;filter:grayscale(.35) contrast(1.05) brightness(1.02)" alt="{title}" '
                f'onerror="this.outerHTML=\'<div class=&quot;imgph&quot; style=&quot;width:100%;height:140px;display:block&quot;>Фото: {title}</div>\'">')
    replace_imgph.counter = 0
    block_new = re.sub(r'<div class="imgph"[^>]*>Фото:[^<]*</div>', replace_imgph, block)
    html = html[:kak] + block_new + html[bli:]
    changes.append("past events: real Baserow photos (mobile)")
else:
    print("  WARN: mobile past-events range not found")

# ═══ UPCOMING EVENTS: static 4 cards → JS container ═══
# Mobile: the 4 cards are in <div style="display:grid;gap:14px;margin-top:24px"> after "Ближайшие даты"
up_marker = 'display:grid;gap:14px;margin-top:24px'
ug_idx = html.find(up_marker, bli if bli >= 0 else 0)
if ug_idx >= 0:
    start = html.rfind('<div ', 0, ug_idx)
    sub = html[start:]
    depth = 0; end_o = 0
    for mm in re.finditer(r'<div\b[^>]*>|</div>', sub):
        if mm.group(0).startswith('<div'): depth += 1
        else:
            depth -= 1
            if depth == 0: end_o = mm.end(); break
    new_up = ('<div id="ev-future-grid" style="display:grid;gap:14px;margin-top:24px">'
              '<div class="ev-empty" id="ev-future-loading">Загрузка актуальных событий…</div></div>')
    html = html[:start] + new_up + html[start+end_o:]
    changes.append("upcoming events: dynamic JS container (mobile)")
else:
    print("  WARN: mobile upcoming-events grid not found")

# ═══ FORMS + JS (shared with desktop — read from a JS file) ═══
# Load the JS/forms from a shared snippet file built alongside
JS_FILE = "/root/gordost/scripts/_shared_forms_js.py"
try:
    exec(open(JS_FILE).read())
    inject = FORMS_MOBILE + '\n' + JS
    html = html.replace('</body>', inject + '\n</body>', 1)
    changes.append("forms + JS injected (mobile)")
except FileNotFoundError:
    print("  WARN: shared JS file not found — run build_shared_js.py first")

with open(OUT, 'w') as f:
    f.write(html)
print("✓ mobile.html built")
for c in changes: print("   -", c)
print("   file size:", len(html))
