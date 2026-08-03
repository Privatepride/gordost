#!/usr/bin/env python3
"""Add the «Наши мероприятия» block to /new bundler template (v3).

v3 changes per user feedback:
  - PAST events: unique formats only (no duplicates), NO month label,
    short curated descriptions, photo from Baserow where available (filter A),
    navy/gold placeholder otherwise.
  - FUTURE events: pulled DYNAMICALLY from GET /api/v1/events (no hardcode).
    Open (external=True) events get «Записаться» → /api/v1/events/<id>/register.
    Closed events show «только для резидентов».
  - Block stays AFTER section «06 — СОБЫТИЯ».
  - cookie-consent wired, no inline on* handlers (React-safe).
"""

import json
import re
import sys
from pathlib import Path

SRC = Path("/root/gordost/public/new/index.html")

HPAD = "max(32px,calc((100% - 1240px)/2))"
BEIGE = "#EAE3D4"
GOLD_2 = "#A87F3A"
BORDEAU = "#940907"
PHOTO_FILTER = "grayscale(.35) sepia(.18) contrast(1.05) brightness(1.02)"

# Unique past event formats with curated short descriptions + format letter.
# Image URLs are filled from Baserow at build time (events_with_images.json).
PAST_EVENTS = [
    {"title": "ИнвестБаня", "letter": "Б", "fmt": "offline",
     "desc": "Офлайн-нетворкинг и обсуждение сделок в неформальной обстановке"},
    {"title": "Аналитическое радио с Д. Мохначевым", "letter": "А", "fmt": "online",
     "desc": "Онлайн-разбор ваших запросов сильным аналитическим взглядом"},
    {"title": "ИнвестУжин", "letter": "У", "fmt": "offline",
     "desc": "Честный диалог об инвестициях за ужином со спикером"},
    {"title": "ИнвестЭккурсия ГАБ", "letter": "Э", "fmt": "offline",
     "desc": "Разбор готового арендного бизнеса на реальном объекте"},
    {"title": "Мастермайнд", "letter": "М", "fmt": "online",
     "desc": "Камерный разбор запросов и обмен опытом"},
    {"title": "Поход сильных", "letter": "П", "fmt": "offline",
     "desc": "Семейный выезд на природу с образовательной программой"},
    {"title": "Выезд на Эндуро", "letter": "Э", "fmt": "offline",
     "desc": "День драйва и мужского взаимодействия"},
    {"title": "Мото путешествие", "letter": "М", "fmt": "offline",
     "desc": "Совместный выезд: дорога, атмосфера, общение"},
    {"title": "СерфЗавтрак", "letter": "С", "fmt": "offline",
     "desc": "Спортивное утро на воде и новые знакомства"},
    {"title": "Добрые дела: выезд в приют", "letter": "Д", "fmt": "offline",
     "desc": "День с заботой и смыслом вне делового контекста"},
    {"title": "Общая встреча клуба", "letter": "О", "fmt": "online",
     "desc": "Новости клуба и планы для всех резидентов"},
    {"title": "Секретное мероприятие", "letter": "С", "fmt": "offline",
     "desc": "Закрытый формат клуба"},
]

IMG_MAP_PATH = Path("/tmp/events_with_images.json")


def load_image_map():
    """title → public image URL (from Baserow). Empty if file missing."""
    if IMG_MAP_PATH.exists():
        return json.loads(IMG_MAP_PATH.read_text(encoding="utf-8"))
    return {}


def media_slot(image_url, letter, ar="3/2"):
    """Photo with filter A if URL given, else navy/gold placeholder."""
    if image_url:
        return (
            '<div style="position:relative;width:100%;aspect-ratio:' + ar + ';overflow:hidden;'
            'background:#0D1626">'
            f'<img src="{image_url}" alt="" loading="lazy" '
            f'style="width:100%;height:100%;object-fit:cover;display:block;filter:{PHOTO_FILTER}">'
            '</div>'
        )
    return (
        '<div style="position:relative;width:100%;aspect-ratio:' + ar + ';overflow:hidden;'
        'background:linear-gradient(135deg,#0D1626 0%,#1a2942 55%,#A87F3A 140%)">'
        '<span style="position:absolute;inset:0;display:flex;align-items:center;'
        'justify-content:center;font-family:\'Unbounded\',sans-serif;font-weight:800;'
        f'font-size:52px;color:#C89B4E;opacity:.42">{letter}</span>'
        '</div>'
    )


def past_card(ev, image_url):
    fmt_label = "ОНЛАЙН" if ev["fmt"] == "online" else "ОФФЛАЙН"
    fmt_color = "#A87F3A" if ev["fmt"] == "online" else "#0D1626"
    media = media_slot(image_url, ev["letter"])
    return (
        '<div style="flex:none;width:280px;display:flex;flex-direction:column;'
        'scroll-snap-align:start">'
        f'{media}'
        f'<div style="font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:18px;'
        f'color:#0D1626;line-height:1.3;margin-top:14px">{ev["title"]}</div>'
        f'<div style="font-size:13.5px;color:rgba(13,22,38,.62);line-height:1.55;'
        f'margin-top:8px">{ev["desc"]}</div>'
        f'<div style="margin-top:auto;padding-top:12px;display:inline-flex;align-self:flex-start;'
        f'font-size:10.5px;letter-spacing:.1em;font-weight:600;color:{fmt_color};'
        f'border:1px solid {fmt_color};padding:3px 9px;border-radius:3px">{fmt_label}</div>'
        '</div>'
    )


def build_past_timeline(image_map):
    cards = ""
    for ev in PAST_EVENTS:
        cards += past_card(ev, image_map.get(ev["title"]))
    return (
        '<div style="position:relative;margin-top:40px">'
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


def build_future_block():
    """Container populated by JS from GET /api/v1/events. Includes a loading state
    and renders cards dynamically."""
    return (
        '<div id="ev-future" style="margin-top:20px">'
        '<div data-timeline style="display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;'
        'padding-bottom:12px;scrollbar-width:thin;scrollbar-color:#A87F3A transparent" id="ev-future-track">'
        '<div id="ev-future-loading" style="padding:24px 4px;font-size:14px;color:rgba(13,22,38,.5)">'
        'Загрузка актуальных событий…</div>'
        '</div></div>'
    )


def build_styles():
    return (
        '<style>'
        '.ev-register-btn:hover{transform:translateY(-2px);filter:brightness(1.12)}'
        '#ev-submit:hover{transform:translateY(-2px);filter:brightness(1.2)}'
        '[data-timeline]::-webkit-scrollbar{height:6px}'
        '[data-timeline]::-webkit-scrollbar-thumb{background:#A87F3A;border-radius:3px}'
        '[data-timeline]::-webkit-scrollbar-track{background:transparent}'
        '</style>'
    )


def build_register_modal():
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
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)">ФИО
        <input name="full_name" required placeholder="Иван Иванов"
        style="font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);border-radius:8px;background:#fff;color:#0D1626;font-family:inherit"></label>
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)">Telegram
        <span style="font-size:10.5px;color:rgba(13,22,38,.45)">@username или номер</span>
        <input name="tg_username" required placeholder="@username"
        style="font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);border-radius:8px;background:#fff;color:#0D1626;font-family:inherit"></label>
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)">Email
        <input name="email" type="email" placeholder="mail@example.com"
        style="font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);border-radius:8px;background:#fff;color:#0D1626;font-family:inherit"></label>
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)">Телефон
        <input name="phone" type="tel" placeholder="+7 ..."
        style="font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);border-radius:8px;background:#fff;color:#0D1626;font-family:inherit"></label>
      <label style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)">Опыт в инвестировании
        <textarea name="invest_experience" rows="2" placeholder="коротко о вашем опыте"
        style="font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);border-radius:8px;background:#fff;color:#0D1626;font-family:inherit;resize:vertical"></textarea></label>
      <label style="display:flex;gap:10px;align-items:flex-start;font-size:11.5px;color:rgba(13,22,38,.6);line-height:1.5">
        <input name="consent" type="checkbox" required style="margin-top:2px;flex:none">
        <span>Согласен на обработку персональных данных</span></label>
      <input name="event_id" type="hidden" value="">
      <div id="ev-error" style="display:none;font-size:13px;color:#940907;background:rgba(148,9,7,.08);padding:10px 12px;border-radius:6px"></div>
      <button type="submit" id="ev-submit"
        style="font-family:'Unbounded',sans-serif;font-weight:600;font-size:15px;color:#F7F3EA;background:#0D1626;border:none;padding:16px;border-radius:100px;cursor:pointer;transition:transform .3s ease,filter .3s ease">Отправить заявку</button>
    </form>
    <div id="ev-success" style="display:none;text-align:center;padding:30px 10px">
      <div style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:22px;color:#0D1626">Заявка отправлена!</div>
      <div style="font-size:14px;color:rgba(13,22,38,.62);line-height:1.55;margin-top:10px">
      Мы свяжемся с вами в Telegram и пришлём детали мероприятия.<br><br>
      <a href="https://t.me/gordost_meeting_bot" target="_blank" rel="noopener" style="color:#940907;font-weight:600;text-decoration:underline">Открыть бот клуба →</a></div>
    </div>
  </div>
</div>
'''


def build_future_js():
    """Fetch future events from API and render cards dynamically."""
    return '''
<script>
(function(){
  var track = document.getElementById('ev-future-track');
  var loading = document.getElementById('ev-future-loading');
  if(!track) return;
  fetch('/api/v1/events').then(function(r){return r.json()}).then(function(d){
    var events = (d&&d.events)||[];
    if(loading) loading.remove();
    if(!events.length){
      track.innerHTML = '<div style="padding:24px 4px;font-size:14px;color:rgba(13,22,38,.5)">Актуальных событий пока нет.</div>';
      return;
    }
    track.innerHTML = events.map(function(ev){
      var media = ev.image
        ? '<div style="position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;background:#0D1626"><img src="'+ev.image+'" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;filter:grayscale(.35) sepia(.18) contrast(1.05) brightness(1.02)"></div>'
        : '<div style="position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;background:linear-gradient(135deg,#0D1626 0%,#1a2942 55%,#A87F3A 140%)"><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:\\'Unbounded\\',sans-serif;font-weight:800;font-size:64px;color:#C89B4E;opacity:.42">●</span></div>';
      var btn = ev.external
        ? '<button type="button" class="ev-register-btn" data-event-register="'+ev.id+'" data-event-name="'+ev.title+'" style="margin-top:auto;width:100%;font-family:\\'Unbounded\\',sans-serif;font-weight:600;font-size:14px;color:#F7F3EA;background:#940907;border:none;padding:15px 20px;border-radius:100px;cursor:pointer;transition:transform .3s ease,filter .3s ease">Записаться →</button>'
        : '<div style="margin-top:auto;width:100%;text-align:center;font-size:12px;color:rgba(13,22,38,.5);letter-spacing:.04em;border:1px solid rgba(13,22,38,.18);padding:13px 20px;border-radius:100px">только для резидентов</div>';
      var desc = (ev.description||'').split('\\n').filter(function(l){return l.trim()&&l.indexOf('Адрес')!==0&&l.indexOf('МОСКВА')!==0&&l.indexOf('Москва')!==0;}).pop()||'';
      if(desc.length>90) desc = desc.slice(0,87)+'…';
      return '<div style="flex:none;width:340px;display:flex;flex-direction:column;scroll-snap-align:start;background:#F4EFE3;border:1px solid rgba(13,22,38,.1)">'+media+
        '<div style="padding:24px 24px 26px;display:flex;flex-direction:column;flex:1">'+
        '<div style="font-size:12px;letter-spacing:.1em;color:#940907;font-weight:700;text-transform:uppercase">'+ev.date+' · '+ev.time+'</div>'+
        '<div style="font-family:\\'Unbounded\\',sans-serif;font-weight:600;font-size:22px;color:#0D1626;line-height:1.25;margin-top:10px">'+ev.title+'</div>'+
        '<div style="font-size:12px;color:rgba(13,22,38,.5);margin-top:6px;letter-spacing:.02em">Москва, офлайн</div>'+
        (desc?'<div style="font-size:14px;color:rgba(13,22,38,.62);line-height:1.55;margin-top:12px">'+desc+'</div>':'')+
        btn+'</div></div>';
    }).join('');
    bindTimelineScroll(track);
  }).catch(function(){
    if(loading) loading.innerHTML = 'Не удалось загрузить события. Обновите страницу.';
  });

  function bindTimelineScroll(tl){
    var wrap = tl.parentElement;
    var prev = wrap.querySelector('[data-tl-prev]');
    var next = wrap.querySelector('[data-tl-next]');
    if(!prev||!next) return;
    function upd(){ var s = tl.scrollWidth>tl.clientWidth+20; prev.style.display=s?'flex':'none'; next.style.display=s?'flex':'none';
      prev.style.opacity=tl.scrollLeft<=4?'.35':'1'; next.style.opacity=tl.scrollLeft>=tl.scrollWidth-tl.clientWidth-4?'.35':'1'; }
    prev.addEventListener('click',function(){tl.scrollBy({left:-340,behavior:'smooth'})});
    next.addEventListener('click',function(){tl.scrollBy({left:340,behavior:'smooth'})});
    tl.addEventListener('scroll',upd); upd(); window.addEventListener('resize',upd);
  }
})();
</script>
'''


def build_register_modal_js():
    return '''
<script>
(function(){
  var modal = document.querySelector('[data-ev-modal]');
  if(!modal) return;
  var form = document.getElementById('ev-form');
  var titleEl = document.getElementById('ev-modal-title');
  var idInput = form && form.querySelector('[name=event_id]');
  var errEl = document.getElementById('ev-error');
  var successEl = document.getElementById('ev-success');

  function open(name, id){
    if(titleEl) titleEl.textContent = name;
    if(idInput) idInput.value = id;
    if(errEl) errEl.style.display='none';
    if(successEl) successEl.style.display='none';
    if(form) form.style.display='';
    modal.style.display='flex'; document.body.style.overflow='hidden';
  }
  function close(){ modal.style.display='none'; document.body.style.overflow=''; }
  // delegate clicks for dynamically-rendered register buttons
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-event-register]');
    if(b){ e.preventDefault(); open(b.getAttribute('data-event-name'), b.getAttribute('data-event-register')); }
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
      if(!data.full_name||data.full_name.trim().length<2){ showErr('Укажите ФИО'); return; }
      if(!data.consent){ showErr('Необходимо согласие на обработку данных'); return; }
      var btn = document.getElementById('ev-submit');
      btn.disabled=true; btn.textContent='Отправка…';
      fetch('/api/v1/events/'+data.event_id+'/register', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});})
        .then(function(res){
          if(res.ok){ form.style.display='none'; successEl.style.display='block'; }
          else { showErr((res.j&&res.j.error)||'Ошибка отправки'); btn.disabled=false; btn.textContent='Отправить заявку'; }
        }).catch(function(){ showErr('Сеть недоступна. Проверьте подключение.'); btn.disabled=false; btn.textContent='Отправить заявку'; });
    });
  }
  function showErr(m){ if(errEl){ errEl.textContent=m; errEl.style.display='block'; } }

  // past timeline scroll buttons (static cards)
  document.querySelectorAll('[data-timeline]').forEach(function(tl){
    if(tl.id==='ev-future-track') return; // future handled by its own JS
    var wrap = tl.parentElement;
    var prev = wrap.querySelector('[data-tl-prev]');
    var next = wrap.querySelector('[data-tl-next]');
    if(!prev||!next) return;
    function upd(){ var s=tl.scrollWidth>tl.clientWidth+20; prev.style.display=s?'flex':'none'; next.style.display=s?'flex':'none';
      prev.style.opacity=tl.scrollLeft<=4?'.35':'1'; next.style.opacity=tl.scrollLeft>=tl.scrollWidth-tl.clientWidth-4?'.35':'1'; }
    prev.addEventListener('click',function(){tl.scrollBy({left:-300,behavior:'smooth'})});
    next.addEventListener('click',function(){tl.scrollBy({left:300,behavior:'smooth'})});
    tl.addEventListener('scroll',upd); upd(); window.addEventListener('resize',upd);
  });
})();
</script>
'''


def build_section(image_map):
    lead = ("Отраслевые инвестиционные разборы и развлекательные форматы, спорт, встречи "
            "в малых группах, семейные выезды и путешествия — наши мероприятия добавляют "
            "яркость жизни резидентов.")
    past_tl = build_past_timeline(image_map)
    future_bl = build_future_block()
    return (
        '<div style="padding:64px ' + HPAD + ' 56px;border-bottom:1.5px solid #0D1626;background:' + BEIGE + '">'
        '<div style="display:flex;justify-content:space-between;align-items:baseline">'
          '<div style="display:flex;align-items:center;gap:12px;font-size:11.5px;letter-spacing:.16em;color:' + GOLD_2 + '"><span style="width:28px;height:1.5px;background:' + GOLD_2 + ';display:block"></span>07 — НАШИ МЕРОПРИЯТИЯ</div>'
          '<div style="font-size:12px;color:rgba(13,22,38,.45);letter-spacing:.06em">ХРОНИКА КЛУБА</div>'
        '</div>'
        '<div style="margin-top:28px;font-family:\'Unbounded\',sans-serif;font-weight:800;font-size:54px;line-height:1.05;color:#0D1626;letter-spacing:-.02em">Наши <span style="background-image:url(&quot;0add0925-1bcc-4d7d-a266-4cc01f9995a3&quot;);background-size:cover;background-position:center;-webkit-background-clip:text;background-clip:text;color:transparent">мероприятия</span></div>'
        '<div style="margin-top:16px;font-size:17px;color:rgba(13,22,38,.62);line-height:1.6;max-width:680px">' + lead + '</div>'
        + past_tl +
        '<div style="height:1px;background:rgba(13,22,38,.18);margin:52px 0 0"></div>'
        '<div style="margin-top:40px;display:flex;align-items:center;gap:12px;font-size:11.5px;letter-spacing:.16em;color:' + BORDEAU + '"><span style="width:28px;height:1.5px;background:' + BORDEAU + ';display:block"></span>ЧТО ДАЛЬШЕ — АКТУАЛЬНЫЕ</div>'
        '<div style="margin-top:14px;font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:30px;line-height:1.15;color:#0D1626;letter-spacing:-.01em">Записывайтесь на ближайшие</div>'
        + future_bl +
        '</div>'
    )


def main():
    raw_file = SRC.read_text(encoding="utf-8")
    m = re.search(r'<script type="__bundler/template">(.*?)</script>', raw_file, re.S)
    if not m:
        sys.exit("ERROR: template script not found")
    raw_json = m.group(1).strip()
    tpl = json.loads(raw_json)

    if '07 — НАШИ МЕРОПРИЯТИЯ' in tpl:
        sys.exit("ERROR: block already inserted (idempotency guard)")

    # 1) cookie-consent into <head>
    cc = '<script src="/cookie-consent.js" defer></script>'
    if cc not in tpl:
        ho = re.search(r'<head[^>]*>', tpl)
        if not ho:
            sys.exit("ERROR: <head> not found")
        tpl = tpl[:ho.end()] + cc + tpl[ho.end():]

    # 2) styles into <head>
    ho = re.search(r'<head[^>]*>', tpl)
    tpl = tpl[:ho.end()] + build_styles() + tpl[ho.end():]

    # 3) section after 06 СОБЫТИЯ, before 07 КОНСЬЕРЖ
    idx_c = tpl.find('07 — ЦИФРОВОЙ КОНСЬЕРЖ')
    if idx_c < 0:
        sys.exit("ERROR: concierge anchor not found")
    back = tpl.rfind('background:#0D1626', 0, idx_c)
    insert_at = tpl.rfind('<div', 0, back)
    image_map = load_image_map()
    tpl = tpl[:insert_at] + build_section(image_map) + tpl[insert_at:]

    # 4) modal + JS before </body>
    bc = tpl.rfind('</body>')
    if bc < 0:
        sys.exit("ERROR: </body> not found")
    payload = build_register_modal() + build_future_js() + build_register_modal_js()
    tpl = tpl[:bc] + payload + tpl[bc:]

    # 5) re-encode
    new_json = json.dumps(tpl, ensure_ascii=False).replace('</', '<\\u002F')
    if json.loads(new_json) != tpl:
        sys.exit("ERROR: round-trip failed")
    new_file = raw_file.replace(raw_json, new_json, 1)
    if new_file == raw_file:
        sys.exit("ERROR: file unchanged")
    SRC.write_text(new_file, encoding="utf-8")
    img_count = sum(1 for ev in PAST_EVENTS if image_map.get(ev["title"]))
    print(f"OK. Inserted «Наши мероприятия» (v3).")
    print(f"  {len(PAST_EVENTS)} unique past events ({img_count} with photos)")
    print(f"  future events: dynamic via /api/v1/events")
    print(f"  file size: {len(raw_file)} → {len(new_file)} bytes")


if __name__ == "__main__":
    main()
