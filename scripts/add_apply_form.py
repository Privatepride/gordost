#!/usr/bin/env python3
"""Add the club-application form to /new (matches the main site's ApplyModal).

Wires a modal form to the existing CTA buttons («Стать резидентом» / «Подать заявку»)
already present in the bundle. The form replicates the main site's fields and submits
to POST /api/apply with source "gordost" — writing a resident row to Baserow table 597
and sending a Telegram notification (same flow as gordost.club main page).

Fields: full_name, tg_username, city, phone, email, capital, monthly_income,
invest_experience, invests_in[], wants_to_invest[], useful_for_club, occupation,
personal_requests, consent. Multi-select options are fetched from /api/apply-options.

How trigger buttons are wired: the bundle's CTA buttons are <div ...>Стать резидентом ↗</div>
and <div ...>Подать заявку ↗</div> with a style-hover attr. We add data-apply-open to each
so the JS picks them up. (No inline on* handlers — React-safe.)
"""

import json
import re
import sys
from pathlib import Path

SRC = Path("/root/gordost/public/new/index.html")


def build_apply_modal() -> str:
    """The club-application modal. Mirrors src/components/site/ApplyModal.tsx."""
    return '''
<!-- club application modal -->
<div id="apply-modal" style="display:none;position:fixed;inset:0;z-index:9999;align-items:center;
justify-content:center;padding:20px;background:rgba(13,22,38,.72);backdrop-filter:blur(6px)"
data-apply-modal>
  <div style="position:relative;width:100%;max-width:560px;max-height:92vh;overflow:auto;
  background:#F1EDE3;border-radius:14px;padding:40px 36px 36px;box-shadow:0 30px 80px rgba(0,0,0,.5)">
    <button type="button" data-apply-close aria-label="закрыть"
      style="position:absolute;top:16px;right:16px;width:34px;height:34px;border-radius:50%;
      border:none;background:rgba(13,22,38,.08);color:#0D1626;cursor:pointer;font-size:18px;
      display:flex;align-items:center;justify-content:center;line-height:1">×</button>
    <div style="font-family:'Unbounded',sans-serif;font-weight:600;font-size:11px;letter-spacing:.16em;
    color:#A87F3A;text-transform:uppercase">заявка в клуб</div>
    <div style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:26px;color:#0D1626;
    line-height:1.2;margin-top:10px">Стать резидентом</div>
    <div style="font-size:13.5px;color:rgba(13,22,38,.6);line-height:1.55;margin-top:8px">
    Оставьте заявку — мы предложим формат интервью и познакомим с клубом.</div>

    <form id="apply-form" style="margin-top:22px;display:flex;flex-direction:column;gap:14px" novalidate>
      <label class="afld"><span>Имя и Фамилия <b style="color:#940907">*</b></span>
        <input name="full_name" required placeholder="Иван Иванов"></label>
      <label class="afld"><span>Telegram <b style="color:#940907">*</b></span>
        <input name="tg_username" required placeholder="@username или ссылка"></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label class="afld"><span>Город</span>
          <input name="city" placeholder="Москва"></label>
        <label class="afld"><span>Телефон</span>
          <input name="phone" placeholder="+7 916 123-45-67"></label>
      </div>
      <label class="afld"><span>Email</span>
        <input name="email" type="email" placeholder="user@example.com"></label>
      <label class="afld"><span>Род занятия</span>
        <input name="occupation" placeholder="CEO, предприниматель…"></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label class="afld"><span>Капитал (₽)</span>
          <input name="capital" placeholder="50000000"></label>
        <label class="afld"><span>Доход / мес (₽)</span>
          <input name="monthly_income" placeholder="1000000"></label>
      </div>
      <label class="afld"><span>Опыт инвестиций</span>
        <textarea name="invest_experience" rows="3" placeholder="Расскажите о вашем опыте…"></textarea></label>

      <div class="afld"><span>Во что инвестируете</span>
        <div data-opts="invests_in" class="opts"></div></div>
      <div class="afld"><span>Во что хотите инвестировать</span>
        <div data-opts="wants_to_invest" class="opts"></div></div>

      <label class="afld"><span>Какими ресурсами и/или экспертизой можете поделиться в клубе</span>
        <textarea name="useful_for_club" rows="2" placeholder="Ваша экспертиза, компетенции, ресурсы…"></textarea></label>
      <label class="afld"><span>Личные запросы / пожелания</span>
        <textarea name="personal_requests" rows="2" placeholder="Чего ожидаете от клуба…"></textarea></label>

      <label style="display:flex;gap:10px;align-items:flex-start;font-size:11.5px;
      color:rgba(13,22,38,.6);line-height:1.5;cursor:pointer">
        <input name="consent" type="checkbox" required style="margin-top:2px;flex:none">
        <span>Я согласен с <a href="/privacy" target="_blank" style="color:#940907">Политикой конфиденциальности</a>
        и обработкой персональных данных</span></label>

      <div id="apply-error" style="display:none;font-size:13px;color:#940907;background:rgba(148,9,7,.08);
      padding:10px 12px;border-radius:6px"></div>
      <button type="submit" id="apply-submit" disabled
        style="font-family:'Unbounded',sans-serif;font-weight:600;font-size:15px;color:#F7F3EA;
        background:#0D1626;border:none;padding:16px;border-radius:100px;cursor:pointer;
        transition:transform .3s ease,filter .3s ease,opacity .3s ease;opacity:.4"
        >Отправить заявку</button>
    </form>

    <div id="apply-success" style="display:none;text-align:center;padding:36px 10px">
      <div style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:24px;color:#0D1626">
      Спасибо!</div>
      <div style="font-size:14px;color:rgba(13,22,38,.62);line-height:1.6;margin-top:12px">
      Заявка отправлена. Мы свяжемся с вами в Telegram<br>для обсуждения формата интервью.<br><br>
      <a href="https://t.me/gordost_meeting_bot" target="_blank" rel="noopener"
      style="color:#940907;font-weight:600;text-decoration:underline">Открыть бот клуба →</a></div>
    </div>
  </div>
</div>
'''


def build_apply_styles() -> str:
    return '''
<style>
.afld{display:flex;flex-direction:column;gap:5px;font-size:12px;color:rgba(13,22,38,.6)}
.afld input,.afld textarea{font-size:15px;padding:12px 14px;border:1px solid rgba(13,22,38,.18);
  border-radius:8px;background:#fff;color:#0D1626;font-family:inherit;resize:vertical}
.afld input:focus,.afld textarea:focus{outline:none;border-color:#A87F3A}
.opts{display:flex;flex-wrap:wrap;gap:7px;margin-top:4px}
.opt-pill{font-size:12px;padding:7px 12px;border:1px solid rgba(13,22,38,.22);border-radius:100px;
  cursor:pointer;background:#fff;color:rgba(13,22,38,.7);transition:all .2s ease;user-select:none}
.opt-pill:hover{border-color:#A87F3A}
.opt-pill.sel{background:#0D1626;color:#F1EDE3;border-color:#0D1626}
#apply-submit:not(:disabled):hover{transform:translateY(-2px);filter:brightness(1.2)}
#apply-submit:not(:disabled){opacity:1;cursor:pointer}
@media(max-width:560px){#apply-modal > div{padding:32px 22px 28px}
  #apply-modal .grid-2{grid-template-columns:1fr!important}}
</style>
'''


def build_apply_js() -> str:
    return '''
<script>
(function(){
  var modal = document.querySelector('[data-apply-modal]');
  if(!modal) return;
  var form = document.getElementById('apply-form');
  var errEl = document.getElementById('apply-error');
  var successEl = document.getElementById('apply-success');
  var submitBtn = document.getElementById('apply-submit');
  var multi = {invests_in:[], wants_to_invest:[]};

  function open(){ errEl.style.display='none'; successEl.style.display='none'; form.style.display='';
    modal.style.display='flex'; document.body.style.overflow='hidden'; }
  function close(){ modal.style.display='none'; document.body.style.overflow=''; }
  modal.addEventListener('click', function(e){ if(e.target===modal) close(); });
  document.querySelectorAll('[data-apply-close]').forEach(function(b){ b.addEventListener('click', close); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });

  // fetch option lists once
  fetch('/api/apply-options').then(function(r){return r.json()}).then(function(d){
    ['invests_in','wants_to_invest'].forEach(function(k){
      var box = form.querySelector('[data-opts="'+k+'"]');
      if(!box) return;
      (d[k]||[]).forEach(function(opt){
        var pill = document.createElement('div');
        pill.className='opt-pill'; pill.textContent=opt; pill.dataset.val=opt;
        pill.addEventListener('click', function(){
          var i = multi[k].indexOf(opt);
          if(i>=0){ multi[k].splice(i,1); pill.classList.remove('sel'); }
          else { multi[k].push(opt); pill.classList.add('sel'); }
        });
        box.appendChild(pill);
      });
    });
  }).catch(function(){});

  // enable submit only when required fields filled
  function validate(){
    var fn = form.querySelector('[name=full_name]').value.trim();
    var tg = form.querySelector('[name=tg_username]').value.trim();
    var consent = form.querySelector('[name=consent]').checked;
    submitBtn.disabled = !(fn && tg && consent);
  }
  form.addEventListener('input', validate);
  form.addEventListener('change', validate);
  validate();

  form.addEventListener('submit', function(e){
    e.preventDefault();
    errEl.style.display='none';
    var data = {};
    new FormData(form).forEach(function(v,k){
      if(k==='consent') return;
      if(!(k in data)) data[k]=v;
    });
    data.invests_in = multi.invests_in.slice();
    data.wants_to_invest = multi.wants_to_invest.slice();
    data.consent_given = form.querySelector('[name=consent]').checked;
    data.source = 'gordost';
    submitBtn.disabled=true; submitBtn.textContent='Отправка…';
    fetch('/api/apply', {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)})
      .then(function(r){ return r.json().then(function(j){return {ok:r.ok,j:j};}); })
      .then(function(res){
        if(res.ok){ form.style.display='none'; successEl.style.display='block'; }
        else { showErr((res.j&&res.j.error)||'Ошибка отправки'); submitBtn.disabled=false; submitBtn.textContent='Отправить заявку'; }
      }).catch(function(){ showErr('Сеть недоступна. Проверьте подключение.'); submitBtn.disabled=false; submitBtn.textContent='Отправить заявку'; });
  });
  function showErr(m){ errEl.textContent=m; errEl.style.display='block'; }

  // expose opener for trigger buttons
  window.__openApply = open;
})();
</script>
'''


def main():
    raw_file = SRC.read_text(encoding="utf-8")
    m = re.search(r'<script type="__bundler/template">(.*?)</script>', raw_file, re.S)
    if not m:
        sys.exit("ERROR: template script not found")
    raw_json = m.group(1).strip()
    tpl = json.loads(raw_json)

    if 'data-apply-modal' in tpl:
        sys.exit("ERROR: apply form already inserted (idempotency guard)")

    # 1) Wire trigger buttons: add data-apply-open + onclick delegation.
    #    Targets: <div ...>Стать резидентом ↗</div> and <div ...>Подать заявку ↗</div>
    #    These are <div> elements with style-hover attr. We add the data attr + a class.
    triggers = 0
    for label in ['Стать резидентом ↗', 'Подать заявку ↗']:
        # match the <div ...>label</div> pattern
        pat = re.compile(r'(<div\b[^>]*style-hover="[^"]*"[^>]*>)(' + re.escape(label) + r')</div>')
        def repl(mm):
            nonlocal triggers
            opening = mm.group(1)
            if 'data-apply-open' in opening:
                return mm.group(0)
            triggers += 1
            return opening + ' data-apply-open="1">' + mm.group(2) + '</div>'
        tpl = pat.sub(repl, tpl)
    if triggers == 0:
        sys.exit("ERROR: no trigger buttons found")

    # 2) Add a small script to bind triggers (delegation, React-safe — no inline onclick)
    trigger_bindings = '''
<script>
(function(){
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-apply-open]');
    if(t && window.__openApply){ e.preventDefault(); window.__openApply(); }
  });
})();
</script>
'''

    # 3) Inject styles into <head>
    head_open = re.search(r'<head[^>]*>', tpl)
    if not head_open:
        sys.exit("ERROR: <head> not found")
    i = head_open.end()
    tpl = tpl[:i] + build_apply_styles() + tpl[i:]

    # 4) Inject modal + JS before </body>
    body_close = tpl.rfind('</body>')
    if body_close < 0:
        sys.exit("ERROR: </body> not found")
    payload = build_apply_modal() + build_apply_js() + trigger_bindings
    tpl = tpl[:body_close] + payload + tpl[body_close:]

    # 5) Re-encode into bundler JSON
    new_json = json.dumps(tpl, ensure_ascii=False).replace('</', '<\\u002F')
    if json.loads(new_json) != tpl:
        sys.exit("ERROR: round-trip failed")
    new_file = raw_file.replace(raw_json, new_json, 1)
    if new_file == raw_file:
        sys.exit("ERROR: file unchanged")
    SRC.write_text(new_file, encoding="utf-8")
    print(f"OK. Inserted club-application form, wired {triggers} trigger button(s).")
    print(f"  file size: {len(raw_file)} → {len(new_file)} bytes")


if __name__ == "__main__":
    main()
