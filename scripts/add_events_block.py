#!/usr/bin/env python3
"""Add the «Наши мероприятия» block to /new bundler template.

Inserts a new section before the existing «06 — СОБЫТИЯ» section, containing:
  - header: «Наши мероприятия» + lead about event formats adding brightness
  - horizontal scroll timeline of PAST events (by month, series collapsed)
    each card has a navy/gold photo placeholder (until Baserow photos are wired)
  - a divider
  - «ЧТО ДАЛЬШЕ — АКТУАЛЬНЫЕ» block of FUTURE events with exact dates
    open events get a «Записаться» button → opens registration modal
  - a registration modal form (ФИО, Telegram, Email, Телефон, Опыт, consent)
    that POSTs to /api/v1/events/<event_id>/register

The block uses the existing site visual language (Unbounded, palette
#0D1626/#940907/#A87F3A/#EAE3D4/#F1EDE3) and the full-bleed centered padding
convention max(32px,calc((100% - 1240px)/2)).

Photo normalization (filter A, approved): grayscale(.35) sepia(.18) contrast(1.05) brightness(1.02)
— applied to <img> inside media slots. Placeholders are used until Baserow photos arrive.
"""

import json
import re
import sys
from pathlib import Path

SRC = Path("/root/gordost/public/new/index.html")
DATA = Path("/tmp/events_data.json")

# The chosen photo filter (approved approach A)
PHOTO_FILTER = "grayscale(.35) sepia(.18) contrast(1.05) brightness(1.02)"
# centered horizontal padding (matches the rest of the page after full-bleed transform)
HPAD = "max(32px,calc((100% - 1240px)/2))"

# Palette
NAVY = "#0D1626"
CREAM = "#F1EDE3"
BEIGE = "#EAE3D4"
GOLD = "#C89B4E"
GOLD_2 = "#A87F3A"
BORDEAU = "#940907"


def media_placeholder(letter: str) -> str:
    """Navy→gold gradient placeholder with a big format letter."""
    return (
        '<div style="position:relative;width:100%;aspect-ratio:3/2;overflow:hidden;'
        'background:linear-gradient(135deg,#0D1626 0%,#1a2942 55%,#A87F3A 140%)">'
        '<span style="position:absolute;inset:0;display:flex;align-items:center;'
        'justify-content:center;font-family:\'Unbounded\',sans-serif;font-weight:800;'
        f'font-size:52px;color:#C89B4E;opacity:.42">{letter}</span>'
        '</div>'
    )


def past_card(month: str, ev: dict) -> str:
    """One past-event card in the scroll timeline."""
    count = f' · ×{ev["count"]}' if ev["count"] > 1 else ""
    fmt_label = "ОНЛАЙН" if ev["fmt"] == "online" else "ОФФЛАЙН"
    fmt_color = "#A87F3A" if ev["fmt"] == "online" else "#0D1626"
    media = media_placeholder(ev["letter"])
    return (
        '<div style="flex:none;width:280px;display:flex;flex-direction:column;'
        'scroll-snap-align:start">'
        f'{media}'
        f'<div style="font-size:11px;letter-spacing:.16em;color:#A87F3A;'
        f'text-transform:uppercase;margin-top:14px;font-weight:600">{month}</div>'
        f'<div style="font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:18px;'
        f'color:#0D1626;line-height:1.3;margin-top:6px">{ev["name"]}<span style="color:#A87F3A;'
        f'font-weight:500">{count}</span></div>'
        f'<div style="font-size:13.5px;color:rgba(13,22,38,.62);line-height:1.55;'
        f'margin-top:8px">{ev["desc"]}</div>'
        f'<div style="margin-top:12px;display:inline-flex;align-self:flex-start;font-size:10.5px;'
        f'letter-spacing:.1em;font-weight:600;color:{fmt_color};border:1px solid {fmt_color};'
        f'padding:3px 9px;border-radius:3px">{fmt_label}</div>'
        '</div>'
    )


def future_card(ev: dict, idx: int) -> str:
    """One future-event card. Open events get a «Записаться» button."""
    d_parts = ev["date"].split("/")
    date_label = f'{d_parts[0]} АВГ · {ev["time"]}'
    fmt_label = "Москва, офлайн"
    media = (
        '<div style="position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;'
        'background:linear-gradient(135deg,#0D1626 0%,#1a2942 55%,#A87F3A 140%)">'
        '<span style="position:absolute;inset:0;display:flex;align-items:center;'
        'justify-content:center;font-family:\'Unbounded\',sans-serif;font-weight:800;'
        f'font-size:64px;color:#C89B4E;opacity:.42">{ev["letter"]}</span>'
        '</div>'
    )
    if ev["open"]:
        btn = (
            '<button type="button" data-event-register="'
            f'{ev["slug"]}" data-event-name="{ev["name"]}" '
            'style="margin-top:18px;width:100%;font-family:\'Unbounded\',sans-serif;'
            'font-weight:600;font-size:14px;color:#F7F3EA;background:#940907;border:none;'
            'padding:15px 20px;border-radius:100px;cursor:pointer;transition:transform .3s ease,'
            'filter .3s ease" onmouseover="this.style.transform=\'translateY(-2px)\';'
            'this.style.filter=\'brightness(1.12)\'" '
            'onmouseout="this.style.transform=\'\';this.style.filter=\'\'">'
            'Записаться →</button>'
        )
    else:
        btn = (
            '<div style="margin-top:18px;width:100%;text-align:center;font-size:12px;'
            'color:rgba(13,22,38,.5);letter-spacing:.04em;border:1px solid rgba(13,22,38,.18);'
            'padding:13px 20px;border-radius:100px">по статусу резидента</div>'
        )
    return (
        '<div style="flex:none;width:340px;display:flex;flex-direction:column;'
        f'scroll-snap-align:start;background:#F4EFE3;border:1px solid rgba(13,22,38,.1)">'
        f'{media}'
        f'<div style="padding:24px 24px 26px">'
        f'<div style="font-size:12px;letter-spacing:.1em;color:#940907;font-weight:700;'
        f'text-transform:uppercase">{date_label}</div>'
        f'<div style="font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:22px;'
        f'color:#0D1626;line-height:1.25;margin-top:10px">{ev["name"]}</div>'
        f'<div style="font-size:12px;color:rgba(13,22,38,.5);margin-top:6px;'
        f'letter-spacing:.02em">{fmt_label}</div>'
        f'<div style="font-size:14px;color:rgba(13,22,38,.62);line-height:1.55;'
        f'margin-top:12px">{ev["desc"]}</div>'
        f'{btn}'
        '</div></div>'
    )


def build_past_timeline(past: dict) -> str:
    cards = ""
    for month, evs in past.items():
        for ev in evs:
            cards += past_card(month, ev)
    return (
        # scroll container
        '<div style="position:relative;margin-top:40px">'
        # left/right scroll buttons (desktop)
        '<button type="button" aria-label="назад" data-tl-prev '
        'style="position:absolute;left:-8px;top:38%;z-index:3;width:38px;height:38px;'
        'border-radius:50%;border:1px solid rgba(13,22,38,.2);background:#F1EDE3;color:#0D1626;'
        'cursor:pointer;font-size:16px;display:none">‹</button>'
        '<button type="button" aria-label="вперёд" data-tl-next '
        'style="position:absolute;right:-8px;top:38%;z-index:3;width:38px;height:38px;'
        'border-radius:50%;border:1px solid rgba(13,22,38,.2);background:#F1EDE3;color:#0D1626;'
        'cursor:pointer;font-size:16px;display:none">›</button>'
        '<div data-timeline style="display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;'
        'padding-bottom:12px;scrollbar-width:thin;scrollbar-color:#A87F3A transparent">'
        f'{cards}'
        '</div></div>'
    )


def build_future_block(future: list) -> str:
    # assign slug for each open event
    slug_map = {
        "ИнвестУжин с А. Андрусовым": "investuzhin-andrusov-1108",
        "ИнвестБаня": "investbanya-2508",
    }
    for ev in future:
        ev["slug"] = slug_map.get(ev["name"], ev["name"].lower().replace(" ", "-"))
    cards = ""
    for i, ev in enumerate(future):
        cards += future_card(ev, i)
    return (
        '<div style="margin-top:20px">'
        '<div style="display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;'
        'padding-bottom:12px;scrollbar-width:thin;scrollbar-color:#A87F3A transparent">'
        f'{cards}'
        '</div></div>'
    )


def build_modal() -> str:
    """Registration modal — hidden by default, shown on «Записаться»."""
    return '''
<!-- events registration modal -->
<div id="ev-modal" style="display:none;position:fixed;inset:0;z-index:9999;align-items:center;
justify-content:center;padding:20px;background:rgba(13,22,38,.72);backdrop-filter:blur(6px)"
data-ev-modal>
  <div style="position:relative;width:100%;max-width:480px;max-height:92vh;overflow:auto;
  background:#F1EDE3;border-radius:14px;padding:40px 36px 36px;box-shadow:0 30px 80px rgba(0,0,0,.5)">
    <button type="button" data-ev-close aria-label="закрыть"
      style="position:absolute;top:16px;right:16px;width:34px;height:34px;border-radius:50%;
      border:none;background:rgba(13,22,38,.08);color:#0D1626;cursor:pointer;font-size:18px;
      display:flex;align-items:center;justify-content:center;line-height:1">×</button>
    <div style="font-family:'Unbounded',sans-serif;font-weight:600;font-size:11px;letter-spacing:.16em;
    color:#A87F3A;text-transform:uppercase">регистрация</div>
    <div id="ev-modal-title" style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:24px;
    color:#0D1626;line-height:1.25;margin-top:10px">—</div>
    <div style="font-size:13.5px;color:rgba(13,22,38,.6);line-height:1.55;margin-top:8px">
    Оставьте контакты — мы свяжемся с вами в Telegram и пришлём детали.</div>
    <form id="ev-form" style="margin-top:22px;display:flex;flex-direction:column;gap:14px" novalidate>
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)">
        ФИО <input name="full_name" required placeholder="Иван Иванов"
        style="font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);border-radius:8px;
        background:#fff;color:#0D1626;font-family:inherit"></label>
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)">
        Telegram <span style="font-size:10.5px;color:rgba(13,22,38,.45)">@username или номер</span>
        <input name="tg_username" required placeholder="@username"
        style="font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);border-radius:8px;
        background:#fff;color:#0D1626;font-family:inherit"></label>
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)">
        Email <input name="email" type="email" placeholder="mail@example.com"
        style="font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);border-radius:8px;
        background:#fff;color:#0D1626;font-family:inherit"></label>
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)">
        Телефон <input name="phone" type="tel" placeholder="+7 ..."
        style="font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);border-radius:8px;
        background:#fff;color:#0D1626;font-family:inherit"></label>
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)">
        Опыт в инвестировании
        <textarea name="invest_experience" rows="2" placeholder="коротко о вашем опыте"
        style="font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);border-radius:8px;
        background:#fff;color:#0D1626;font-family:inherit;resize:vertical"></textarea></label>
      <label style="display:flex;gap:10px;align-items:flex-start;font-size:11.5px;
      color:rgba(13,22,38,.6);line-height:1.5">
        <input name="consent" type="checkbox" required style="margin-top:2px;flex:none">
        <span>Согласен на обработку персональных данных</span></label>
      <input name="source" type="hidden" value="">
      <div id="ev-error" style="display:none;font-size:13px;color:#940907;background:rgba(148,9,7,.08);
      padding:10px 12px;border-radius:6px"></div>
      <button type="submit" id="ev-submit"
        style="font-family:'Unbounded',sans-serif;font-weight:600;font-size:15px;color:#F7F3EA;
        background:#0D1626;border:none;padding:16px;border-radius:100px;cursor:pointer;
        transition:transform .3s ease,filter .3s ease"
        onmouseover="this.style.transform='translateY(-2px)';this.style.filter='brightness(1.2)'"
        onmouseout="this.style.transform='';this.style.filter=''">Отправить заявку</button>
    </form>
    <div id="ev-success" style="display:none;text-align:center;padding:30px 10px">
      <div style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:22px;color:#0D1626">
      Заявка отправлена!</div>
      <div style="font-size:14px;color:rgba(13,22,38,.62);line-height:1.55;margin-top:10px">
      Мы свяжемся с вами в Telegram и пришлём детали мероприятия.<br><br>
      <a href="https://t.me/gordost_meeting_bot" target="_blank" rel="noopener"
      style="color:#940907;font-weight:600;text-decoration:underline">Открыть бот клуба →</a></div>
    </div>
  </div>
</div>
'''


def build_modal_js() -> str:
    """JS for modal open/close + form submit. Endpoint will be wired in step 3."""
    return '''
<script>
(function(){
  var modal = document.querySelector('[data-ev-modal]');
  if(!modal) return;
  var form = document.getElementById('ev-form');
  var titleEl = document.getElementById('ev-modal-title');
  var sourceInput = form && form.querySelector('[name=source]');
  var errEl = document.getElementById('ev-error');
  var successEl = document.getElementById('ev-success');

  function open(name, slug){
    if(titleEl) titleEl.textContent = name;
    if(sourceInput) sourceInput.value = 'event-new-' + slug;
    if(errEl) errEl.style.display='none';
    if(successEl) successEl.style.display='none';
    if(form) form.style.display='';
    modal.style.display='flex';
    document.body.style.overflow='hidden';
  }
  function close(){
    modal.style.display='none';
    document.body.style.overflow='';
  }
  document.querySelectorAll('[data-event-register]').forEach(function(btn){
    btn.addEventListener('click', function(){
      open(btn.getAttribute('data-event-name'), btn.getAttribute('data-event-register'));
    });
  });
  modal.addEventListener('click', function(e){ if(e.target===modal) close(); });
  document.querySelectorAll('[data-ev-close]').forEach(function(b){ b.addEventListener('click', close); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });

  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(errEl) errEl.style.display='none';
      var data = {};
      new FormData(form).forEach(function(v,k){ data[k]=v; });
      if(!data.full_name || data.full_name.trim().length<2){ showErr('Укажите ФИО'); return; }
      if(!data.consent){ showErr('Необходимо согласие на обработку данных'); return; }
      var btn = document.getElementById('ev-submit');
      btn.disabled = true; btn.textContent='Отправка…';
      // POST to /api/v1/events/<slug>/register  (endpoint added in step 3)
      fetch('/api/v1/events/' + (data.source||'').replace('event-new-','') + '/register', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(data)
      }).then(function(r){ return r.json().then(function(j){ return {ok:r.ok, j:j}; }); })
        .then(function(res){
          if(res.ok){ if(form) form.style.display='none'; if(successEl) successEl.style.display='block'; }
          else { showErr((res.j && res.j.error) || 'Ошибка отправки. Попробуйте ещё раз.'); btn.disabled=false; btn.textContent='Отправить заявку'; }
        }).catch(function(){ showErr('Сеть недоступна. Проверьте подключение.'); btn.disabled=false; btn.textContent='Отправить заявку'; });
    });
  }
  function showErr(msg){ if(errEl){ errEl.textContent=msg; errEl.style.display='block'; } }

  // timeline scroll buttons
  document.querySelectorAll('[data-timeline]').forEach(function(tl){
    var wrap = tl.parentElement;
    var prev = wrap.querySelector('[data-tl-prev]');
    var next = wrap.querySelector('[data-tl-next]');
    function update(){ if(!prev||!next) return;
      var show = tl.scrollWidth > tl.clientWidth + 20;
      prev.style.display = show ? 'flex':'none'; next.style.display = show ? 'flex':'none';
      prev.style.opacity = tl.scrollLeft<=4 ? '.35':'1';
      next.style.opacity = tl.scrollLeft >= tl.scrollWidth-tl.clientWidth-4 ? '.35':'1';
    }
    if(prev) prev.addEventListener('click', function(){ tl.scrollBy({left:-300,behavior:'smooth'}); });
    if(next) next.addEventListener('click', function(){ tl.scrollBy({left:300,behavior:'smooth'}); });
    tl.addEventListener('scroll', update); update();
    window.addEventListener('resize', update);
  });
})();
</script>
'''


def build_section(data: dict) -> str:
    """Build the complete new section HTML."""
    lead = ("Отраслевые инвестиционные разборы и развлекательные форматы, спорт, встречи "
            "в малых группах, семейные выезды и путешествия — наши мероприятия добавляют "
            "яркость жизни резидентов.")

    past_tl = build_past_timeline(data["past"])
    future_bl = build_future_block(data["future"])

    section = (
        # ── main section: beige bg, full-bleed centered ──
        '<div style="padding:64px ' + HPAD + ' 56px;border-bottom:1.5px solid #0D1626;'
        'background:' + BEIGE + '">'
        # eyebrow row
        '<div style="display:flex;justify-content:space-between;align-items:baseline">'
          '<div style="display:flex;align-items:center;gap:12px;font-size:11.5px;letter-spacing:.16em;'
          'color:' + GOLD_2 + '"><span style="width:28px;height:1.5px;background:' + GOLD_2 +
          ';display:block"></span>06 — ИСТОРИЯ СОБЫТИЙ</div>'
          '<div style="font-size:12px;color:rgba(13,22,38,.45);letter-spacing:.06em">ХРОНИКА КЛУБА</div>'
        '</div>'
        # heading
        '<div style="margin-top:28px;font-family:\'Unbounded\',sans-serif;font-weight:800;'
        'font-size:54px;line-height:1.05;color:#0D1626;letter-spacing:-.02em">Наши '
        '<span style="background-image:url(&quot;0add0925-1bcc-4d7d-a266-4cc01f9995a3&quot;);'
        'background-size:cover;background-position:center;-webkit-background-clip:text;'
        'background-clip:text;color:transparent">мероприятия</span></div>'
        # lead
        '<div style="margin-top:16px;font-size:17px;color:rgba(13,22,38,.62);line-height:1.6;'
        'max-width:680px">' + lead + '</div>'
        # past timeline
        + past_tl +
        # divider
        '<div style="height:1px;background:rgba(13,22,38,.18);margin:52px 0 0"></div>'
        # future heading
        '<div style="margin-top:40px;display:flex;align-items:center;gap:12px;font-size:11.5px;'
        'letter-spacing:.16em;color:' + BORDEAU + '"><span style="width:28px;height:1.5px;'
        'background:' + BORDEAU + ';display:block"></span>ЧТО ДАЛЬШЕ — АКТУАЛЬНЫЕ</div>'
        '<div style="margin-top:14px;font-family:\'Unbounded\',sans-serif;font-weight:600;'
        'font-size:30px;line-height:1.15;color:#0D1626;letter-spacing:-.01em">'
        'Записывайтесь на ближайшие</div>'
        + future_bl +
        '</div>'
    )
    return section


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    raw_file = SRC.read_text(encoding="utf-8")
    m = re.search(r'<script type="__bundler/template">(.*?)</script>', raw_file, re.S)
    if not m:
        sys.exit("ERROR: template script not found")
    raw_json = m.group(1).strip()
    tpl = json.loads(raw_json)

    # Locate insertion point: right before the existing «06 — СОБЫТИЯ» section div.
    idx_eyebrow = tpl.find('06 — СОБЫТИЯ')
    if idx_eyebrow < 0:
        sys.exit("ERROR: '06 — СОБЫТИЯ' eyebrow not found — anchor missing")
    back = tpl.rfind('background:' + BEIGE, 0, idx_eyebrow)
    if back < 0:
        sys.exit("ERROR: section-06 opening div not found")
    sec06_start = tpl.rfind('<div', 0, back)

    # Idempotency guard: if our block marker already exists, abort.
    if '06 — ИСТОРИЯ СОБЫТИЙ' in tpl:
        sys.exit("ERROR: block already inserted (idempotency guard)")

    section_html = build_section(data)

    # Insert the section + the modal + modal JS.
    # Modal + JS go right after </body>? No — must be inside the document. Place modal+JS
    # right before the closing of root container's last section, OR simpler: append modal+JS
    # just before </body>. Since the template ends with </body></html>, insert there.
    body_close = tpl.rfind('</body>')
    if body_close < 0:
        sys.exit("ERROR: </body> not found")
    modal_html = build_modal() + build_modal_js()
    new_tpl = tpl[:body_close] + modal_html + tpl[body_close:]

    # Now insert the section block at sec06_start (before section 06).
    # (offsets in new_tpl are shifted by modal insertion only AFTER body_close, so sec06_start
    #  which is < body_close is unaffected.)
    new_tpl = new_tpl[:sec06_start] + section_html + new_tpl[sec06_start:]

    # Re-encode into bundler JSON (safe for <script>: escape </ ).
    new_json = json.dumps(new_tpl, ensure_ascii=False).replace('</', '<\\u002F')
    # round-trip check
    if json.loads(new_json) != new_tpl:
        sys.exit("ERROR: round-trip failed")

    new_file = raw_file.replace(raw_json, new_json, 1)
    if new_file == raw_file:
        sys.exit("ERROR: file unchanged")
    SRC.write_text(new_file, encoding="utf-8")
    print(f"OK. Inserted «Наши мероприятия» block before section 06 (offset {sec06_start}).")
    print(f"  file size: {len(raw_file)} → {len(new_file)} bytes")


if __name__ == "__main__":
    main()
