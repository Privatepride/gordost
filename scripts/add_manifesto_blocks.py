#!/usr/bin/env python3
"""Add two premium manifesto blocks after the marquee on /new.

Block 1 — «Главный вопрос»: dark-navy cinematic section with a centered manifesto.
  Accent animation: the gold accent line + word reveals via existing `greveal`
  scroll pattern; a thin gold rule that draws in, and the punchline "Окружение
  нельзя купить..." set larger with gold-clip on the key word.

Block 2 — «Почему Гордость?»: three principles as large statement cards on cream.
  Each principle has a bold headline + supporting paragraph. Hover lifts.

Visual language borrowed (adapted) from Hyperstudio editorial-tech: whisper-weight
display type, single gold accent per section, generous line-height, depth via
surface-stack + hairline borders rather than shadows. Brand palette wins (navy/
gold/cream/Unbounded), so no hex is copied from the reference.

Insertion: between the marquee section close and the `<!-- criteria -->` comment.
"""

import json
import re
import sys
from pathlib import Path

SRC = Path("/root/gordost/public/new/index.html")

HPAD = "max(32px,calc((100% - 1240px)/2))"
NAVY = "#0D1626"
NAVY_2 = "#131E33"
CREAM = "#F1EDE3"
BEIGE = "#EAE3D4"
GOLD = "#C89B4E"
GOLD_2 = "#A87F3A"

# the gold-gradient text-clip image asset (already in the bundle)
GOLD_IMG = "0add0925-1bcc-4d7d-a266-4cc01f9995a3"


def gold_clip(text):
    """Wrap text in the gold-gradient text-clip span used across the site."""
    return (
        '<span style="background-image:url(&quot;' + GOLD_IMG + '&quot;);'
        'background-size:cover;background-position:center;-webkit-background-clip:text;'
        'background-clip:text;color:transparent">' + text + '</span>'
    )


def build_block1_styles():
    """CSS for the accent animations (pure CSS, React-safe)."""
    return (
        '<style>'
        # gold rule that draws in from left on reveal
        '.mq-rule{height:1.5px;width:0;background:' + GOLD + ';transition:width 1.1s cubic-bezier(.2,.7,.2,1) .25s}'
        '.mq-reveal.is-in .mq-rule{width:120px}'
        # staggered fade-up of lines
        '.mq-line{opacity:0;transform:translateY(18px);transition:opacity .9s ease,transform .9s cubic-bezier(.2,.7,.2,1)}'
        '.mq-reveal.is-in .mq-line{opacity:1;transform:none}'
        '.mq-reveal.is-in .mq-line:nth-child(1){transition-delay:.05s}'
        '.mq-reveal.is-in .mq-line:nth-child(2){transition-delay:.15s}'
        '.mq-reveal.is-in .mq-line:nth-child(3){transition-delay:.25s}'
        '.mq-reveal.is-in .mq-line:nth-child(4){transition-delay:.35s}'
        '.mq-reveal.is-in .mq-line:nth-child(5){transition-delay:.45s}'
        '.mq-reveal.is-in .mq-line:nth-child(6){transition-delay:.55s}'
        '.mq-reveal.is-in .mq-line:nth-child(7){transition-delay:.7s}'
        # principle cards hover (block 2)
        '.pcard{transition:transform .5s cubic-bezier(.2,.7,.2,1),background .4s ease}'
        '.pcard:hover{transform:translateY(-6px)}'
        '@media(prefers-reduced-motion:reduce){.mq-line,.mq-rule{transition:none;opacity:1;transform:none;width:auto}}'
        '</style>'
    )


def build_block1():
    """«Главный вопрос» — dark cinematic manifesto."""
    eyebrow = (
        '<div style="display:flex;align-items:center;gap:12px;font-size:11.5px;'
        'letter-spacing:.16em;color:' + GOLD + '"><span style="width:28px;height:1.5px;'
        'background:' + GOLD + ';display:block"></span>01 — ГЛАВНЫЙ ВОПРОС</div>'
    )
    # the three rhetorical questions
    q1 = "С кем заходить в сделки, не проверяя человека полгода?"
    q2 = "У кого спросить про нишу, в которой сам не эксперт?"
    q3 = ("С кем насыщенно проводить свободное время,<br>не думая про организацию?")

    return (
        '<div class="mq-reveal" style="position:relative;background:' + NAVY + ';padding:96px ' + HPAD + ' 92px;'
        'overflow:hidden;border-bottom:1.5px solid rgba(241,235,220,.08);'
        'animation:greveal both;animation-timeline:view();animation-range:entry 2% cover 22%">'
        # ambient gold glow (depth without shadow)
        '<div style="position:absolute;top:-180px;left:50%;transform:translateX(-50%);width:680px;height:520px;'
        'background:radial-gradient(circle,rgba(200,155,78,.13),transparent 65%);pointer-events:none"></div>'
        # content column
        '<div style="position:relative;max-width:820px;margin:0 auto;text-align:center">'
        f'{eyebrow}'
        # headline
        '<div class="mq-line" style="margin-top:32px;font-family:\'Unbounded\',sans-serif;font-weight:600;'
        'font-size:clamp(40px,6vw,76px);line-height:1.02;color:' + CREAM + ';letter-spacing:-.025em">'
        'Главный ' + gold_clip("вопрос") + '</div>'
        # gold rule
        '<div class="mq-rule" style="margin:36px auto 0"></div>'
        # subhead — the shift
        '<div class="mq-line" style="margin-top:36px;font-size:21px;line-height:1.55;color:rgba(241,235,220,.74);'
        'max-width:600px;margin-left:auto;margin-right:auto">'
        'После создания капитала вы уже не спрашиваете <span style="color:rgba(241,235,220,.4)">«где взять денег»</span>.<br>'
        'Вопрос — ' + gold_clip("с кем") + '.</div>'
        # the three questions
        '<div style="margin-top:48px;display:flex;flex-direction:column;gap:14px;text-align:left;max-width:620px;margin-left:auto;margin-right:auto">'
          '<div class="mq-line" style="display:flex;gap:18px;align-items:baseline;font-size:18px;line-height:1.5;color:rgba(241,235,220,.82)"><span style="color:' + GOLD + ';font-family:\'Unbounded\',sans-serif;font-weight:700;flex:none">01</span><span>' + q1 + '</span></div>'
          '<div class="mq-line" style="display:flex;gap:18px;align-items:baseline;font-size:18px;line-height:1.5;color:rgba(241,235,220,.82)"><span style="color:' + GOLD + ';font-family:\'Unbounded\',sans-serif;font-weight:700;flex:none">02</span><span>' + q2 + '</span></div>'
          '<div class="mq-line" style="display:flex;gap:18px;align-items:baseline;font-size:18px;line-height:1.5;color:rgba(241,235,220,.82)"><span style="color:' + GOLD + ';font-family:\'Unbounded\',sans-serif;font-weight:700;flex:none">03</span><span>' + q3 + '</span></div>'
        '</div>'
        # punchline
        '<div style="margin-top:60px">'
          '<div class="mq-line" style="font-family:\'Unbounded\',sans-serif;font-weight:500;font-size:26px;'
          'line-height:1.4;color:rgba(241,235,220,.5);letter-spacing:-.01em">Окружение нельзя купить.</div>'
          '<div class="mq-line" style="margin-top:8px;font-family:\'Unbounded\',sans-serif;font-weight:500;'
          'font-size:26px;line-height:1.4;color:rgba(241,235,220,.5);letter-spacing:-.01em">'
          'Но можно попасть туда, где оно уже собрано.</div>'
          '<div class="mq-line" style="margin-top:8px;font-family:\'Unbounded\',sans-serif;font-weight:700;'
          'font-size:34px;line-height:1.25;color:' + CREAM + ';letter-spacing:-.015em">'
          'И именно ' + gold_clip("мы") + ' его собрали.</div>'
        '</div>'
        '</div>'
        '</div>'
    )


def build_block2():
    """«Почему Гордость?» — three principle cards on cream."""
    eyebrow = (
        '<div style="display:flex;align-items:center;gap:12px;font-size:11.5px;letter-spacing:.16em;'
        'color:' + GOLD_2 + '"><span style="width:28px;height:1.5px;background:' + GOLD_2 + ';display:block"></span>02 — ПОЧЕМУ ГОРДОСТЬ?</div>'
    )
    heading = (
        '<div style="margin-top:28px;font-family:\'Unbounded\',sans-serif;font-weight:800;font-size:54px;'
        'line-height:1.05;color:#0D1626;letter-spacing:-.02em">Почему ' + gold_clip("Гордость?") + '</div>'
    )

    def card(num, bold, body, last_emph=None):
        emph = (f'<div style="margin-top:14px;font-size:15px;color:rgba(13,22,38,.5);'
                f'line-height:1.6">{last_emph}</div>') if last_emph else ''
        return (
            '<div class="pcard" style="padding:40px 32px 36px;border:1.5px solid rgba(13,22,38,.14);'
            'background:#F4EFE3;display:flex;flex-direction:column">'
            f'<div style="font-family:\'Unbounded\',sans-serif;font-weight:800;font-size:40px;line-height:1;'
            f'color:#0D1626;opacity:.12">{num}</div>'
            f'<div style="margin-top:24px;font-family:\'Unbounded\',sans-serif;font-weight:700;font-size:22px;'
            f'line-height:1.25;color:#0D1626">{bold}</div>'
            f'<div style="margin-top:14px;font-size:15px;color:rgba(13,22,38,.62);line-height:1.6">{body}</div>'
            f'{emph}'
            '</div>'
        )

    c1 = card("01", "Полный запрет продаж внутри клуба.",
              "Резиденты — только инвесторы. У нас нет наставников, продюсеров и «уникальных предложений».",
              "Здесь вы чувствуете себя человеком, а не лидом из списка инвесторов.")
    c2 = card("02", "Мы не учим и не советуем, куда вложить.",
              "В воронке отобранных проектов нет лоббирования. Клуб делает разбор, даёт полную информацию и помогает найти людей для совместной сделки.",
              "Но решение всегда за вами.")
    c3 = card("03", "У нас классный движ, а не скучные заседания.",
              "Другие клубы серьёзны до зевоты. У нас — ИнвестБаня, выезды на эндуро, походы, путешествия, игры, ужины, живые разборы.",
              "Серьёзная у нас только инвестиционная аналитика. И Даша.")

    return (
        '<div style="padding:72px ' + HPAD + ' 64px;background:' + BEIGE + ';'
        'border-bottom:1.5px solid #0D1626">'
        f'{eyebrow}'
        f'{heading}'
        '<div style="margin-top:44px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;'
        'animation:greveal both;animation-timeline:view();animation-range:entry 2% cover 22%">'
        f'{c1}{c2}{c3}'
        '</div>'
        '</div>'
    )


def build_reveal_js():
    """IntersectionObserver to add .is-in when block 1 scrolls into view."""
    return '''
<script>
(function(){
  if(!('IntersectionObserver' in window)){ document.querySelectorAll('.mq-reveal').forEach(function(e){e.classList.add('is-in');}); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, {threshold:0.18});
  document.querySelectorAll('.mq-reveal').forEach(function(e){ io.observe(e); });
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

    if "01 — ГЛАВНЫЙ ВОПРОС" in tpl:
        sys.exit("ERROR: manifesto blocks already inserted (idempotency guard)")

    # locate insertion: right after marquee section closes, before <!-- criteria -->
    idx_criteria = tpl.find('<!-- criteria -->')
    if idx_criteria < 0:
        sys.exit("ERROR: '<!-- criteria -->' anchor not found")
    # find marquee section close = last </div> before criteria comment at the
    # section level. We insert right at idx_criteria (before the comment).
    insert_at = idx_criteria

    # build the two blocks + styles + js
    blocks = build_block1_styles() + build_block1() + build_block2() + build_reveal_js()
    tpl = tpl[:insert_at] + blocks + tpl[insert_at:]

    # re-encode
    new_json = json.dumps(tpl, ensure_ascii=False).replace('</', '<\\u002F')
    if json.loads(new_json) != tpl:
        sys.exit("ERROR: round-trip failed")
    new_file = raw_file.replace(raw_json, new_json, 1)
    if new_file == raw_file:
        sys.exit("ERROR: file unchanged")
    SRC.write_text(new_file, encoding="utf-8")
    print("OK. Inserted two manifesto blocks after marquee (before criteria).")
    print(f"  block 1: «Главный вопрос» — dark cinematic + scroll reveal")
    print(f"  block 2: «Почему Гордость?» — 3 principle cards")
    print(f"  file size: {len(raw_file)} → {len(new_file)} bytes")


if __name__ == "__main__":
    main()
