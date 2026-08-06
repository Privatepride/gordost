#!/usr/bin/env python3
"""
Build the new gordost.club main page from the design desktop HTML.
Applies head/nav/ids/triggers/telegram/photos/forms/JS/responsive in one pass.
"""
import re, sys

SRC = "/root/gordost/public/index.html"
with open(SRC) as f:
    html = f.read()

orig = html
changes = []

# ═══ 1. HEAD: title + meta desc + cookie-consent + responsive CSS ═══
html = html.replace(
    '<title>Гордость — инвестклуб (десктоп)</title>',
    '<title>ГОРДОСТЬ — закрытый инвестиционный клуб</title>\n'
    '<meta name="description" content="Закрытый клуб для инвесторов с капиталом от 50 млн ₽. Сделки, окружение, мероприятия. С 2018 года.">',
    1
)
if 'cookie-consent.js' not in html:
    html = html.replace('</style>\n</head>', '</style>\n<script src="/cookie-consent.js" defer></script>\n</head>', 1)

RESPONSIVE_CSS = """
  html,body{overflow-x:hidden}
  @media (max-width:1240px){ .page{min-width:100% !important} }
  @media (max-width:768px){
    .page{min-width:100% !important;max-width:100% !important}
    .nav-links{display:none !important}
    .nav-cta-desktop{display:none !important}
    .nav-burger{display:flex !important}
    [style*="font-size:54px"]{font-size:34px !important;line-height:1.06 !important;letter-spacing:-.025em !important}
    [style*="font-size:56px"]{font-size:34px !important;line-height:1.06 !important}
    [style*="font-size:48px"]{font-size:30px !important}
    [style*="font-size:42px"]{font-size:28px !important}
    [style*="font-size:40px"]{font-size:26px !important}
    [style*="font-size:38px"]{font-size:26px !important}
    [style*="font-size:104px"]{font-size:48px !important;line-height:1 !important}
    [style*="font-size:130px"]{font-size:54px !important}
    [style*="grid-template-columns:repeat(3,1fr)"]{grid-template-columns:1fr !important}
    [style*="grid-template-columns:repeat(4,1fr)"]{grid-template-columns:1fr !important}
    [style*="grid-template-columns:repeat(2,1fr)"]{grid-template-columns:1fr !important}
    [style*="grid-template-columns:420px 1fr"]{grid-template-columns:1fr !important}
    [style*="grid-template-columns:1fr 1fr 1.6fr"]{grid-template-columns:1fr !important;gap:24px !important}
    [style*="grid-template-columns:118px 1fr auto"]{grid-template-columns:64px 1fr !important;gap:14px !important}
    [style*="grid-template-columns:118px 1fr auto"] > div:last-child{grid-column:1 / -1;margin-top:8px;text-align:center}
    [style*="grid-template-columns:1.4fr 1fr"]{grid-template-columns:1fr !important}
    [style*="display:grid;grid-template-columns:1fr 1fr"]{grid-template-columns:1fr !important}
    [style*="padding:96px"],[style*="padding:88px"],[style*="padding:78px"],[style*="padding:72px"],[style*="padding:70px"],[style*="padding:64px"]{padding-top:36px !important;padding-bottom:36px !important}
    [style*="display:flex;justify-content:space-between;align-items:flex-end"]{flex-direction:column !important;align-items:flex-start !important;gap:16px !important}
    [style*="display:flex;justify-content:center;gap:14px"]{flex-direction:column !important;align-items:center !important;width:100% !important}
    [style*="display:flex;justify-content:center;gap:14px"] > div,[style*="display:flex;justify-content:center;gap:14px"] > a{width:100% !important;max-width:340px !important;text-align:center !important}
    .h0[style*="padding:18px 34px"],.h0[style*="padding:19px 40px"],.h0[style*="padding:18px 38px"]{padding:16px 24px !important}
    .page div{overflow-wrap:break-word;word-wrap:break-word}
    [data-timeline]{padding-bottom:8px;-webkit-overflow-scrolling:touch}
    [data-timeline]::-webkit-scrollbar{height:4px}
  }
  @media (max-width:430px){
    [style*="font-size:54px"]{font-size:30px !important}
    [style*="font-size:34px"]{font-size:26px !important}
    [style*="font-size:104px"]{font-size:40px !important}
    .imgph{height:160px !important}
  }
  .nav-burger{display:none;width:44px;height:44px;flex-direction:column;justify-content:center;align-items:center;gap:5px;cursor:pointer}
  .nav-burger span{display:block;height:2px;width:24px;background:#F1EBDC}
  .nav-burger span:nth-child(3){width:16px;background:#C8201A}
  .mobile-menu{display:none;position:fixed;top:72px;left:0;right:0;background:#0D1626;z-index:200;padding:16px clamp(20px,5vw,32px);border-bottom:1px solid rgba(241,235,220,.12)}
  .mobile-menu.open{display:block}
  .mobile-menu a{display:block;color:#F1EBDC;font-size:15px;letter-spacing:.06em;padding:14px 0;border-bottom:1px solid rgba(241,235,220,.1);text-decoration:none}
  .mobile-menu a:last-child{border-bottom:none}
  .gmodal{display:none;position:fixed;inset:0;z-index:9999;background:rgba(13,22,38,.78);align-items:flex-start;justify-content:center;overflow-y:auto;padding:24px 12px}
  .gmodal.open{display:flex}
  .gmodal-box{background:#0D1626;width:100%;max-width:520px;padding:36px 28px 32px;position:relative;border:1px solid rgba(241,235,220,.14)}
  .gmodal h3{font-family:'Unbounded',sans-serif;font-weight:700;font-size:22px;color:#F1EDE3;margin:0 0 6px}
  .gmodal-sub{font-size:13px;color:rgba(241,235,220,.6);margin:0 0 20px}
  .gmodal-close{position:absolute;top:14px;right:18px;color:rgba(241,235,220,.6);font-size:28px;line-height:1;cursor:pointer;background:none;border:none}
  .gfield{display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(241,235,220,.7);margin-bottom:12px;font-family:'Golos Text',sans-serif}
  .gfield input,.gfield textarea,.gfield select{background:#131E33;border:1px solid rgba(241,235,220,.16);color:#F1EDE3;font-size:14px;padding:11px 12px;font-family:'Golos Text',sans-serif;border-radius:0}
  .gfield input:focus,.gfield textarea:focus,.gfield select:focus{outline:none;border-color:#C89B4E}
  .gfield textarea{resize:vertical;min-height:64px}
  .gpills{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
  .gpill{font-size:12px;color:rgba(241,235,220,.7);border:1px solid rgba(241,235,220,.22);padding:6px 11px;cursor:pointer;user-select:none;border-radius:100px;transition:all .2s}
  .gpill.sel{background:#940907;color:#F7F3EA;border-color:#940907}
  .gbtn{background:#940907;color:#F7F3EA;font-weight:700;font-size:15px;padding:15px;border:none;cursor:pointer;width:100%;border-radius:100px;font-family:'Golos Text',sans-serif;transition:filter .2s}
  .gbtn:hover{filter:brightness(1.1)}
  .gbtn:disabled{opacity:.5;cursor:not-allowed}
  .gconsent{display:flex;align-items:flex-start;gap:10px;font-size:11.5px;color:rgba(241,235,220,.6);line-height:1.5;margin:8px 0 16px}
  .gconsent input{margin-top:3px;accent-color:#940907}
  .gconsent a{color:#C89B4E;text-decoration:underline}
  .gerr{color:#C8201A;font-size:13px;margin-top:8px;display:none}
  .gsuccess{display:none;text-align:center;color:#F1EDE3;padding:24px 0}
  .gsuccess h3{font-family:'Unbounded',sans-serif;font-weight:700;font-size:22px;margin:0 0 12px}
  .gsuccess p{font-size:15px;color:rgba(241,235,220,.7);line-height:1.6;margin:0}
  .gsuccess a{color:#C89B4E}
  .ev-empty{padding:32px;text-align:center;color:rgba(13,22,38,.5);font-size:15px}
"""
html = html.replace('</style>', RESPONSIVE_CSS + '</style>', 1)
changes.append("head: title/meta/cookie-consent/responsive CSS")

# ═══ 2. NAV ═══
old_nav = '<div style="display:flex;gap:28px;font-family:\'Golos Text\',sans-serif;font-size:12px;letter-spacing:.06em;color:rgba(241,235,220,.75)">\n            <span>О КЛУБЕ</span><span>ЭКОСИСТЕМА</span><span>СОБЫТИЯ</span><span>ОСНОВАТЕЛЬ</span><span>ВСТУПЛЕНИЕ</span>\n          </div>'
new_nav = (
    '<div class="nav-links" style="display:flex;gap:28px;font-family:\'Golos Text\',sans-serif;font-size:12px;letter-spacing:.06em;color:rgba(241,235,220,.75)">\n'
    '            <a href="#sec-club" data-nav-scroll="sec-club" style="color:inherit;text-decoration:none;cursor:pointer">О КЛУБЕ</a>'
    '<a href="#sec-ecosystem" data-nav-scroll="sec-ecosystem" style="color:inherit;text-decoration:none;cursor:pointer">ЭКОСИСТЕМА</a>'
    '<a href="#sec-events" data-nav-scroll="sec-events" style="color:inherit;text-decoration:none;cursor:pointer">СОБЫТИЯ</a>'
    '<a href="#sec-founder" data-nav-scroll="sec-founder" style="color:inherit;text-decoration:none;cursor:pointer">ОСНОВАТЕЛЬ</a>'
    '<a href="#sec-join" data-nav-scroll="sec-join" style="color:inherit;text-decoration:none;cursor:pointer">ВСТУПЛЕНИЕ</a>\n'
    '          </div>\n'
    '          <div class="nav-burger" onclick="var m=document.getElementById(\'mobileMenu\');m.classList.toggle(\'open\')">'
    '<span></span><span></span><span></span></div>'
)
html = html.replace(old_nav, new_nav, 1)

html = html.replace(
    '<div style="background:#940907;color:#F7F3EA;font-weight:700;font-size:13px;padding:12px 24px;border-radius:100px;transition:transform .3s ease,filter .3s ease" class="h0">Подать заявку ↗</div>',
    '<div data-apply-open="1" class="h0 nav-cta-desktop" style="background:#940907;color:#F7F3EA;font-weight:700;font-size:13px;padding:12px 24px;border-radius:100px;transition:transform .3s ease,filter .3s ease;cursor:pointer">Подать заявку ↗</div>',
    1
)
mobile_menu = (
    '        <div class="mobile-menu" id="mobileMenu">\n'
    '          <a href="#sec-club" data-nav-scroll="sec-club">О КЛУБЕ</a>\n'
    '          <a href="#sec-ecosystem" data-nav-scroll="sec-ecosystem">ЭКОСИСТЕМА</a>\n'
    '          <a href="#sec-events" data-nav-scroll="sec-events">СОБЫТИЯ</a>\n'
    '          <a href="#sec-founder" data-nav-scroll="sec-founder">ОСНОВАТЕЛЬ</a>\n'
    '          <a href="#sec-join" data-nav-scroll="sec-join">ВСТУПЛЕНИЕ</a>\n'
    '          <a href="#" data-apply-open="1" style="color:#C89B4E">Подать заявку ↗</a>\n'
    '        </div>\n\n'
)
html = html.replace('        <!-- hero -->', mobile_menu + '        <!-- hero -->', 1)
changes.append("nav: anchors + burger + mobile menu + CTA trigger")

# ═══ 3. SECTION IDs ═══
html = html.replace('<div style="padding:70px clamp(32px,3.2vw,76px) 72px;border-bottom:1.5px solid #0D1626;background:#EAE3D4">',
    '<div id="sec-club" style="padding:70px clamp(32px,3.2vw,76px) 72px;border-bottom:1.5px solid #0D1626;background:#EAE3D4;scroll-margin-top:80px">', 1)
html = html.replace('<div style="padding:64px clamp(32px,3.2vw,76px) 60px;border-bottom:1.5px solid #0D1626">',
    '<div id="sec-ecosystem" style="padding:64px clamp(32px,3.2vw,76px) 60px;border-bottom:1.5px solid #0D1626;scroll-margin-top:80px">', 1)
html = html.replace('<div style="padding:64px clamp(32px,3.2vw,76px);border-bottom:1.5px solid #0D1626;background:#EAE3D4">',
    '<div id="sec-events" style="padding:64px clamp(32px,3.2vw,76px);border-bottom:1.5px solid #0D1626;background:#EAE3D4;scroll-margin-top:80px">', 1)
html = html.replace('<div style="display:grid;grid-template-columns:420px 1fr;border-bottom:1.5px solid #0D1626">',
    '<div id="sec-founder" style="display:grid;grid-template-columns:420px 1fr;border-bottom:1.5px solid #0D1626;scroll-margin-top:80px">', 1)
html = html.replace('        <!-- four steps -->\n        <div style="',
    '        <!-- four steps -->\n        <div id="sec-join" style="scroll-margin-top:80px; ', 1)
changes.append("section ids: sec-club/ecosystem/events/founder/join")

# ═══ 4. TRIGGER BUTTONS ═══
def add_apply_open(html, search_substr, label):
    idx = html.find(search_substr)
    if idx < 0:
        print(f"  WARN: trigger not found: {label} ({search_substr[:40]})")
        return html
    start = html.rfind('<div ', 0, idx)
    if start < 0: return html
    return html[:start+5] + 'data-apply-open="1" ' + html[start+5:]

html = add_apply_open(html, 'font-size:15px;padding:18px 34px;border-radius:100px', 'hero Стать резидентом')
html = add_apply_open(html, 'font-size:15px;padding:19px 40px;border-radius:100px', 'final Стать резидентом')
html = add_apply_open(html, 'font-size:15px;padding:18px 38px;border-radius:100px', 'footer Подать заявку')
changes.append("trigger buttons: data-apply-open on CTAs")

# ═══ 5. TELEGRAM BUTTONS ═══
TG = "https://t.me/gordost_meeting_bot"
html = html.replace(
    '<div style="color:#F1EDE3;font-weight:600;font-size:15px;padding:19px clamp(32px,3.2vw,76px);border-radius:100px;border:1.5px solid rgba(241,235,220,.3);transition:border-color .3s ease" class="h7">Задать вопрос в Telegram</div>',
    f'<a href="{TG}" target="_blank" rel="noopener" style="color:#F1EDE3;font-weight:600;font-size:15px;padding:19px clamp(32px,3.2vw,76px);border-radius:100px;border:1.5px solid rgba(241,235,220,.3);transition:border-color .3s ease;text-decoration:none" class="h7">Задать вопрос в Telegram</a>', 1)
html = html.replace(
    '<div style="color:#F1EDE3;font-weight:600;font-size:15px;padding:18px 30px;border-radius:100px;border:1.5px solid rgba(241,235,220,.3)">Telegram-бот</div>',
    f'<a href="{TG}" target="_blank" rel="noopener" style="color:#F1EDE3;font-weight:600;font-size:15px;padding:18px 30px;border-radius:100px;border:1.5px solid rgba(241,235,220,.3);text-decoration:none">Telegram-бот</a>', 1)
html = html.replace('<span>TELEGRAM</span>',
    f'<a href="{TG}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">TELEGRAM</a>', 1)
changes.append("telegram buttons → <a href>")

# ═══ 6. PAST EVENTS: real Baserow photos ═══
PAST_EVENTS = [
    ("ИнвестБаня", "Москва · фирменный формат клуба", "https://base.gordost.club/media/thumbnails/card_cover/njzEAtcf5gd01QBOvuhfmmtBwUeF5xZc_f67015128027875b451806e40c02e0fc8069e832a02faf75f0443c1e5fc17fc4.png"),
    ("Аналитическое радио с Д. Мохначевым", "Онлайн · разбор рынков", "https://base.gordost.club/media/thumbnails/card_cover/past2 radio.png"),
    ("Поход сильных", "Природа · выезд клуба", "https://base.gordost.club/media/thumbnails/card_cover/past3 hike.png"),
    ("ИнвестУжин с А. Плахотнюком", "Москва · закрытый ужин", "https://base.gordost.club/media/thumbnails/card_cover/past4 dinner.png"),
    ("ИнвестЭкскурсия ГАБ", "Москва · гос. облигации", "https://base.gordost.club/media/thumbnails/card_cover/past5 gab.png"),
    ("Добрые дела: приют", "Москва · благотворительность", "https://base.gordost.club/media/thumbnails/card_cover/past6 charity.png"),
]
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
    cards = ""
    for title, sub_txt, img in PAST_EVENTS:
        cards += (
            '<div style="display:flex;flex-direction:column;border:1px solid rgba(13,22,38,.25);background:#F6F2E8;transition:transform .5s cubic-bezier(.2,.7,.2,1),border-color .4s ease" class="h5">'
            f'<img src="{img}" loading="lazy" style="width:100%;height:196px;object-fit:cover;display:block;filter:grayscale(.35) contrast(1.05) brightness(1.02)" alt="{title}" '
            f'onerror="this.outerHTML=\'<div class=&quot;imgph&quot; style=&quot;width:100%;height:196px;display:block&quot;>Фото: {title}</div>\'">'
            f'<div style="font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:18px;line-height:1.32;color:#0D1626;padding:20px 22px 0">{title}</div>'
            f'<div style="font-size:13.5px;color:rgba(13,22,38,.7);line-height:1.6;padding:8px 22px 22px">{sub_txt}</div>'
            '</div>'
        )
    new_grid = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px;animation:greveal both;animation-timeline:view();animation-range:entry 2% cover 22%">' + cards + '</div>'
    html = html[:start] + new_grid + html[start+end_o:]
    changes.append("past events: real Baserow photos (6 formats)")
else:
    print("  WARN: past-events grid not found")

# ═══ 7. UPCOMING EVENTS: dynamic container ═══
ug_idx = html.find('display:grid;gap:14px;margin-top:42px;animation:greveal')
if ug_idx >= 0:
    start = html.rfind('<div ', 0, ug_idx)
    sub = html[start:]
    depth = 0; end_o = 0
    for mm in re.finditer(r'<div\b[^>]*>|</div>', sub):
        if mm.group(0).startswith('<div'): depth += 1
        else:
            depth -= 1
            if depth == 0: end_o = mm.end(); break
    new_up = ('<div id="ev-future-grid" style="display:grid;gap:14px;margin-top:42px">'
              '<div class="ev-empty" id="ev-future-loading">Загрузка актуальных событий…</div></div>')
    html = html[:start] + new_up + html[start+end_o:]
    changes.append("upcoming events: dynamic JS container")
else:
    print("  WARN: upcoming-events grid not found")

# Write intermediate (forms+JS injected by a second script to keep this manageable)
with open(SRC, 'w') as f:
    f.write(html)

print("✓ build_main_site.py (part 1) — structural changes applied:")
for c in changes: print("   -", c)
print("   file size:", len(html), "bytes")
print("   (forms + JS injected by build_main_site_part2.py)")
