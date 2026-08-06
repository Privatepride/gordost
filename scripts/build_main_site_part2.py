#!/usr/bin/env python3
"""
Part 2: inject 2 form modals + all JS (events renderer, form logic, nav, mobile menu)
right before </body>, AFTER the existing ECO/accordion <script>.
"""
SRC = "/root/gordost/public/index.html"
with open(SRC) as f:
    html = f.read()

# ═══ FORM MODALS (inject before </body>) ═══
FORMS = '''
<!-- ═══ MODAL: club application ═══ -->
<div class="gmodal" id="apply-modal" onclick="if(event.target===this)window.__closeApply()">
  <div class="gmodal-box">
    <button class="gmodal-close" onclick="window.__closeApply()" aria-label="Закрыть">×</button>
    <form id="apply-form" novalidate>
      <h3>Заявка в клуб</h3>
      <p class="gmodal-sub">Заполните анкету — заявка уходит совету клуба.</p>
      <div class="gfield">ФИО *<input type="text" name="full_name" required></div>
      <div class="gfield">Telegram *<input type="text" name="tg_username" placeholder="@username" required></div>
      <div class="gfield">Город<input type="text" name="city"></div>
      <div class="gfield">Телефон<input type="tel" name="phone"></div>
      <div class="gfield">Email<input type="email" name="email"></div>
      <div class="gfield">Род деятельности<input type="text" name="occupation"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="gfield">Капитал, ₽<input type="text" name="capital" placeholder="50000000"></div>
        <div class="gfield">Доход/мес, ₽<input type="text" name="monthly_income" placeholder="1000000"></div>
      </div>
      <div class="gfield">Опыт в инвестировании<textarea name="invest_experience"></textarea></div>
      <div class="gfield">Куда инвестируете
        <div class="gpills" data-opts="invests_in"></div>
      </div>
      <div class="gfield">Интересующие направления
        <div class="gpills" data-opts="wants_to_invest"></div>
      </div>
      <div class="gfield">Чем полезны клубу<textarea name="useful_for_club"></textarea></div>
      <div class="gfield">Личные просьбы<textarea name="personal_requests"></textarea></div>
      <label class="gconsent"><input type="checkbox" name="consent" required>
        <span>Я согласен с <a href="/privacy" target="_blank">Политикой конфиденциальности</a> и даю согласие на <a href="/personal-data" target="_blank">обработку персональных данных</a> *</span>
      </label>
      <div class="gerr" id="apply-err"></div>
      <button class="gbtn" type="submit" id="apply-submit" disabled>Отправить заявку</button>
    </form>
    <div class="gsuccess" id="apply-success">
      <h3>Заявка отправлена!</h3>
      <p>Мы свяжемся с вами в Telegram для приглашения на интервью.</p>
    </div>
  </div>
</div>

<!-- ═══ MODAL: event registration ═══ -->
<div class="gmodal" id="ev-modal" onclick="if(event.target===this)window.__closeEv()">
  <div class="gmodal-box">
    <button class="gmodal-close" onclick="window.__closeEv()" aria-label="Закрыть">×</button>
    <form id="ev-form" novalidate>
      <h3 id="ev-title">Регистрация на мероприятие</h3>
      <p class="gmodal-sub" id="ev-sub">Оставьте контакты — пришлём подробности в Telegram.</p>
      <input type="hidden" name="event_id" id="ev-id">
      <div class="gfield">ФИО *<input type="text" name="full_name" required></div>
      <div class="gfield">Telegram *<input type="text" name="tg_username" placeholder="@username" required></div>
      <div class="gfield">Email<input type="email" name="email"></div>
      <div class="gfield">Телефон<input type="tel" name="phone"></div>
      <div class="gfield">Опыт в инвестировании<textarea name="invest_experience"></textarea></div>
      <label class="gconsent"><input type="checkbox" name="consent" required>
        <span>Я согласен с <a href="/privacy" target="_blank">Политикой конфиденциальности</a> и даю согласие на <a href="/personal-data" target="_blank">обработку персональных данных</a> *</span>
      </label>
      <div class="gerr" id="ev-err"></div>
      <button class="gbtn" type="submit" id="ev-submit">Отправить заявку</button>
    </form>
    <div class="gsuccess" id="ev-success">
      <h3>Заявка отправлена!</h3>
      <p id="ev-success-bot">Мы свяжемся с вами в Telegram.</p>
    </div>
  </div>
</div>
'''

# ═══ ALL JS (events renderer, form logic, nav, mobile menu, modal openers) ═══
JS = r'''
<script>
(function(){
  "use strict";
  var $ = function(s,c){return (c||document).querySelector(s);};
  var $$ = function(s,c){return [].slice.call((c||document).querySelectorAll(s));};

  // ─── Modal helpers ─────────────────────────────────────────────
  function lockScroll(lock){ document.body.style.overflow = lock ? 'hidden' : ''; }
  function openModal(id){ var m=document.getElementById(id); if(m){m.classList.add('open');lockScroll(true);} }
  function closeModal(id){ var m=document.getElementById(id); if(m){m.classList.remove('open');lockScroll(false);} }

  // ─── Club application modal ────────────────────────────────────
  var applyForm = document.getElementById('apply-form');
  function openApply(){ if(applyForm){applyForm.style.display=''; $('#apply-success').style.display='none'; applyForm.reset(); resetPills(); checkApplyBtn();} openModal('apply-modal'); }
  function closeApply(){ closeModal('apply-modal'); }
  window.__openApply = openApply; window.__closeApply = closeApply;

  // multi-select pills (invests_in, wants_to_invest) from /api/apply-options
  var multi = {invests_in:[], wants_to_invest:[]};
  function resetPills(){ multi.invests_in=[]; multi.wants_to_invest=[]; $$('.gpill').forEach(function(p){p.classList.remove('sel');}); }
  fetch('/api/apply-options').then(function(r){return r.json();}).then(function(d){
    ['invests_in','wants_to_invest'].forEach(function(key){
      var box = $('[data-opts="'+key+'"]');
      if(!box || !d[key]) return;
      d[key].forEach(function(opt){
        var p = document.createElement('div');
        p.className='gpill'; p.textContent=opt;
        p.onclick = function(){
          var i = multi[key].indexOf(opt);
          if(i>=0){multi[key].splice(i,1);p.classList.remove('sel');}
          else{multi[key].push(opt);p.classList.add('sel');}
        };
        box.appendChild(p);
      });
    });
  }).catch(function(){});

  function checkApplyBtn(){
    var fn = applyForm.querySelector('[name=full_name]').value.trim();
    var tg = applyForm.querySelector('[name=tg_username]').value.trim();
    var c = applyForm.querySelector('[name=consent]').checked;
    $('#apply-submit').disabled = !(fn.length>=2 && tg.length>=2 && c);
  }
  $$('#apply-form input').forEach(function(inp){ inp.addEventListener('input', checkApplyBtn); });

  applyForm.addEventListener('submit', function(e){
    e.preventDefault();
    var errEl = $('#apply-err'); errEl.style.display='none';
    var data = {};
    new FormData(applyForm).forEach(function(v,k){ if(k==='consent') return; if(!(k in data)) data[k]=v; });
    data.invests_in = multi.invests_in.slice();
    data.wants_to_invest = multi.wants_to_invest.slice();
    data.consent_given = applyForm.querySelector('[name=consent]').checked;
    data.source = 'gordost';
    var btn = $('#apply-submit'); btn.disabled=true; btn.textContent='Отправка…';
    fetch('/api/apply', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(res){
        if(res.ok){ applyForm.style.display='none'; $('#apply-success').style.display='block'; }
        else { errEl.textContent = (res.j&&res.j.error)||'Ошибка отправки'; errEl.style.display='block'; btn.disabled=false; btn.textContent='Отправить заявку'; }
      })
      .catch(function(){ errEl.textContent='Сеть недоступна. Проверьте подключение.'; errEl.style.display='block'; btn.disabled=false; btn.textContent='Отправить заявку'; });
  });

  // ─── Event registration modal ─────────────────────────────────
  var evForm = document.getElementById('ev-form');
  function openEv(name, id){
    $('#ev-title').textContent = name || 'Регистрация на мероприятие';
    $('#ev-id').value = id;
    evForm.style.display=''; $('#ev-success').style.display='none'; evForm.reset();
    openModal('ev-modal');
  }
  function closeEv(){ closeModal('ev-modal'); }
  window.__closeEv = closeEv;

  evForm.addEventListener('submit', function(e){
    e.preventDefault();
    var errEl = $('#ev-err'); errEl.style.display='none';
    var data = {};
    new FormData(evForm).forEach(function(v,k){ data[k]=v; });
    if(!data.full_name || data.full_name.trim().length<2){ errEl.textContent='Укажите ФИО'; errEl.style.display='block'; return; }
    if(!data.consent){ errEl.textContent='Необходимо согласие на обработку данных'; errEl.style.display='block'; return; }
    var btn = $('#ev-submit'); btn.disabled=true; btn.textContent='Отправка…';
    fetch('/api/v1/events/'+data.event_id+'/register', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(res){
        if(res.ok){
          evForm.style.display='none';
          var s = $('#ev-success'); s.style.display='block';
          if(res.j && res.j.bot_url){
            $('#ev-success-bot').innerHTML = 'Мы свяжемся с вами в Telegram. Перейдите к боту для продолжения: <a href="'+res.j.bot_url+'" target="_blank">открыть бот →</a>';
          }
        } else { errEl.textContent=(res.j&&res.j.error)||'Ошибка отправки'; errEl.style.display='block'; btn.disabled=false; btn.textContent='Отправить заявку'; }
      })
      .catch(function(){ errEl.textContent='Сеть недоступна. Проверьте подключение.'; errEl.style.display='block'; btn.disabled=false; btn.textContent='Отправить заявку'; });
  });

  // ─── Delegated triggers ────────────────────────────────────────
  document.addEventListener('click', function(e){
    var a = e.target.closest('[data-apply-open]'); if(a){ e.preventDefault(); openApply(); document.getElementById('mobileMenu').classList.remove('open'); return; }
    var r = e.target.closest('[data-event-register]'); if(r){ e.preventDefault(); openEv(r.getAttribute('data-event-name'), r.getAttribute('data-event-register')); return; }
    var n = e.target.closest('[data-nav-scroll]'); if(n){
      e.preventDefault();
      var sec = document.getElementById(n.getAttribute('data-nav-scroll'));
      if(sec){ sec.scrollIntoView({behavior:'smooth'}); document.getElementById('mobileMenu').classList.remove('open'); }
      return;
    }
  });
  // ESC to close
  document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeApply(); closeEv(); } });

  // ─── Future events renderer (GET /api/v1/events) ───────────────
  var grid = document.getElementById('ev-future-grid');
  var MONTHS = ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'];
  function el(tag, style, html){
    var e = document.createElement(tag);
    if(style) e.setAttribute('style', style);
    if(html != null) e.innerHTML = html;
    return e;
  }
  function parseDate(s){
    var p = (s||'').split('.');
    if(p.length<3) return null;
    return {d:p[0], m:parseInt(p[1],10)-1, y:p[2]};
  }
  function buildRow(ev){
    var dt = parseDate(ev.date);
    var row = el('div', 'display:grid;grid-template-columns:118px 1fr auto;align-items:center;gap:28px;padding:22px 24px;border:1.5px solid #0D1626;background:#F1EDE3;transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s ease;cursor:default');
    row.className = 'h6';
    // date badge
    var badge = el('div', 'background:#0D1626;padding:16px 10px 14px;text-align:center');
    badge.appendChild(el('div', "font-family:'Unbounded',sans-serif;font-weight:900;font-size:42px;line-height:1;color:#F1EBDC", dt?dt.d:''));
    badge.appendChild(el('div', 'font-size:10.5px;letter-spacing:.14em;color:#C89B4E;margin-top:6px', dt?MONTHS[dt.m]:''));
    badge.appendChild(el('div', 'font-size:10.5px;letter-spacing:.12em;color:rgba(241,235,220,.45);margin-top:3px', dt?dt.y:''));
    row.appendChild(badge);
    // body
    var body = el('div', '');
    var statusLine = el('div', 'display:flex;align-items:center;gap:9px;margin-bottom:11px');
    if(ev.external){
      statusLine.appendChild(el('span', 'width:7px;height:7px;transform:rotate(45deg);background:#A87F3A;display:block'));
      statusLine.appendChild(el('span', 'font-size:10.5px;font-weight:700;letter-spacing:.16em;color:#A87F3A', 'ОТКРЫТАЯ РЕГИСТРАЦИЯ'));
    } else {
      statusLine.appendChild(el('span', 'width:7px;height:7px;border-radius:50%;animation:gpulse 1.9s ease-in-out infinite;background:#940907;display:block'));
      statusLine.appendChild(el('span', 'font-size:10.5px;font-weight:700;letter-spacing:.16em;color:#940907', 'ТОЛЬКО РЕЗИДЕНТЫ'));
    }
    body.appendChild(statusLine);
    body.appendChild(el('div', "font-family:'Unbounded',sans-serif;font-weight:600;font-size:21px;line-height:1.3;color:#0D1626", ev.title));
    var meta = (ev.time ? ev.date + ' · ' + ev.time : ev.date);
    if(ev.description){ meta += ' · ' + ev.description.replace(/\n/g,' ').slice(0,90); }
    body.appendChild(el('div', 'font-size:14px;color:rgba(13,22,38,.6);line-height:1.6;margin-top:7px', meta));
    row.appendChild(body);
    // CTA
    var cta;
    if(ev.external){
      cta = el('div', 'background:#940907;color:#F7F3EA;font-weight:700;font-size:14px;padding:17px 28px;border-radius:100px;white-space:nowrap;transition:transform .3s ease,filter .3s ease;cursor:pointer');
      cta.className = 'h0';
      cta.textContent = 'Принять участие ↗';
      cta.setAttribute('data-event-register', ev.id);
      cta.setAttribute('data-event-name', ev.title);
    } else {
      cta = el('div', 'border:1.5px solid rgba(13,22,38,.32);color:rgba(13,22,38,.55);font-weight:600;font-size:14px;padding:16px 26px;border-radius:100px;white-space:nowrap');
      cta.textContent = 'Только для резидентов';
    }
    row.appendChild(cta);
    return row;
  }
  var rendering = false;
  function paint(events){
    if(!grid || rendering) return;
    rendering = true;
    grid.innerHTML = '';
    if(!events || !events.length){
      grid.appendChild(el('div', 'ev-empty', 'Актуальных открытых событий пока нет. Загляните позже.'));
    } else {
      events.forEach(function(ev){ grid.appendChild(buildRow(ev)); });
    }
    rendering = false;
  }
  var cachedEvents = null;
  function startEvents(){
    fetch('/api/v1/events').then(function(r){return r.json();}).then(function(d){
      cachedEvents = (d && d.events) || [];
      paint(cachedEvents);
    }).catch(function(){
      var ld = document.getElementById('ev-future-loading');
      if(ld){ ld.textContent = 'Не удалось загрузить события. Обновите страницу.'; }
    });
  }
  // safety re-paint if container gets wiped
  if(grid){
    var mo = new MutationObserver(function(){
      if(!rendering && cachedEvents){
        var hasCards = grid.querySelector('[data-event-register], .ev-empty');
        if(!hasCards) paint(cachedEvents);
      }
    });
    mo.observe(grid, {childList:true, subtree:true});
    var tries = 0;
    var si = setInterval(function(){
      var ld = document.getElementById('ev-future-loading');
      if(cachedEvents && ld){ paint(cachedEvents); }
      if(++tries > 20) clearInterval(si);
    }, 250);
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', function(){ setTimeout(startEvents, 80); }); }
  else { setTimeout(startEvents, 80); }
})();
</script>
'''

# Inject forms + JS right before </body>
inject = FORMS + '\n' + JS
html = html.replace('</body>', inject + '\n</body>', 1)

with open(SRC, 'w') as f:
    f.write(html)

print("✓ build_main_site_part2.py — forms + JS injected")
print("   - 2 modals: apply (#apply-modal) + event register (#ev-modal)")
print("   - JS: modal openers, delegated triggers, multi-select pills, apply submit, event submit")
print("   - JS: future-events renderer (createElement + MutationObserver)")
print("   file size:", len(html), "bytes")
