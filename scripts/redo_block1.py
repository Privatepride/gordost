#!/usr/bin/env python3
"""Redesign block 1 «Главный вопрос» to a premium high-end version.

Replaces the old block 1 (style + section, the span between the marquee close
and block 2's eyebrow) with a redesigned version using patterns from the
high-end-visual-design skill:
  - Editorial-Luxury vibe (navy/espresso field, cream + gold accents)
  - Z-Axis Cascade layout: questions in Double-Bezel nested cards
  - Massive whisper-weight display heading
  - Gold accent economy (one accent: «с кем»)
  - Hairline borders (rgba cream/8%) instead of shadows
  - Ambient gold radial glow for depth
  - Staggered scroll reveal (blur + translateY, custom cubic-bezier)
  - Macro-whitespace (py ~120px)

Brand palette wins over any reference hex. No images.
"""

import json
import re
import sys
from pathlib import Path

SRC = Path("/root/gordost/public/new/index.html")

HPAD = "max(32px,calc((100% - 1240px)/2))"
NAVY = "#0D1626"
NAVY_2 = "#131E33"
NAVY_3 = "#0a1322"
CREAM = "#F1EDE3"
GOLD = "#C89B4E"
GOLD_2 = "#A87F3A"
HAIR = "rgba(241,235,220,.08)"
HAIR_2 = "rgba(241,235,220,.14)"
# signature easing
EASE = "cubic-bezier(.32,.72,0,1)"
GOLD_IMG = "0add0925-1bcc-4d7d-a266-4cc01f9995a3"


def gold_clip(text):
    return (
        '<span style="background-image:url(&quot;' + GOLD_IMG + '&quot;);'
        'background-size:cover;background-position:center;-webkit-background-clip:text;'
        'background-clip:text;color:transparent">' + text + '</span>'
    )


def build_styles():
    return (
        '<style>'
        # reveal container + staggered lines (blur+translateY, custom easing)
        '.gq{opacity:0}'
        '.gq-reveal .gq-l{opacity:0;transform:translateY(22px);filter:blur(6px);'
        'transition:opacity 1s ' + EASE + ',transform 1s ' + EASE + ',filter 1s ' + EASE + '}'
        '.gq-reveal.is-in .gq-l{opacity:1;transform:none;filter:none}'
        '.gq-reveal.is-in .gq-l:nth-child(1){transition-delay:.05s}'
        '.gq-reveal.is-in .gq-l:nth-child(2){transition-delay:.18s}'
        '.gq-reveal.is-in .gq-l:nth-child(3){transition-delay:.31s}'
        '.gq-reveal.is-in .gq-l:nth-child(4){transition-delay:.44s}'
        '.gq-reveal.is-in .gq-l:nth-child(5){transition-delay:.57s}'
        '.gq-reveal.is-in .gq-l:nth-child(6){transition-delay:.70s}'
        '.gq-reveal.is-in .gq-l:nth-child(7){transition-delay:.83s}'
        '.gq-reveal.is-in .gq-l:nth-child(8){transition-delay:.96s}'
        # gold rule that draws in
        '.gq-rule{height:1.5px;width:0;max-width:120px;background:linear-gradient(90deg,' + GOLD + ',transparent);'
        'transition:width 1.2s ' + EASE + ' .35s}'
        '.gq-reveal.is-in .gq-rule{width:120px}'
        # Double-Bezel question cards: hover lift + inner glow
        '.gq-card{transition:transform .6s ' + EASE + ',border-color .4s ease,background .4s ease}'
        '.gq-card:hover{transform:translateY(-4px);border-color:' + HAIR_2 + '}'
        '.gq-card:hover .gq-qnum{color:' + GOLD + '}'
        '.gq-qnum{transition:color .4s ease}'
        # reduced-motion guard
        '@media(prefers-reduced-motion:reduce){.gq-l,.gq-rule,.gq-card{transition:none;opacity:1;transform:none;filter:none;width:auto}.gq{opacity:1}}'
        '</style>'
    )


def build_block():
    eyebrow = (
        '<div style="display:flex;align-items:center;gap:12px;font-size:11.5px;'
        'letter-spacing:.18em;color:' + GOLD + ';text-transform:uppercase">'
        '<span style="width:28px;height:1.5px;background:' + GOLD + ';display:block"></span>'
        'Главный вопрос</div>'
    )

    # The three questions — each in a Double-Bezel nested card
    def qcard(num, text):
        # outer shell (bezel) + inner core
        return (
            '<div class="gq-l">'
            '<div class="gq-card" style="position:relative;padding:1.5px;border-radius:20px;'
            'background:linear-gradient(180deg,' + HAIR_2 + ',' + HAIR + ')">'
              '<div style="border-radius:18.5px;background:' + NAVY_2 + ';padding:30px 30px 28px;'
              'box-shadow:inset 0 1px 0 rgba(241,235,220,.05);display:flex;gap:22px;align-items:flex-start">'
                '<div class="gq-qnum" style="font-family:\'Unbounded\',sans-serif;font-weight:700;font-size:15px;'
                'color:rgba(200,155,78,.55);flex:none;letter-spacing:.04em;padding-top:3px">' + num + '</div>'
                '<div style="font-size:18px;line-height:1.5;color:rgba(241,235,220,.86);font-weight:400">' + text + '</div>'
              '</div>'
            '</div></div>'
        )

    q1 = qcard("01", "С кем заходить в сделки, не проверяя человека полгода?")
    q2 = qcard("02", "У кого спросить про нишу, в которой сам не эксперт?")
    q3 = qcard("03", "С кем насыщенно проводить свободное время, не думая про организацию?")

    return (
        # ── main section: deep navy, macro-whitespace ──
        '<div class="gq gq-reveal" style="position:relative;background:' + NAVY + ';'
        'padding:120px ' + HPAD + ' 116px;overflow:hidden;border-bottom:1.5px solid ' + HAIR + '">'
        # ambient gold glow (depth, no shadow) — two soft orbs
        '<div style="position:absolute;top:-220px;left:50%;transform:translateX(-50%);width:780px;height:560px;'
        'background:radial-gradient(circle,rgba(200,155,78,.12),transparent 65%);pointer-events:none"></div>'
        '<div style="position:absolute;bottom:-180px;right:-120px;width:520px;height:520px;'
        'background:radial-gradient(circle,rgba(168,127,58,.07),transparent 70%);pointer-events:none"></div>'
        # ── content column ──
        '<div style="position:relative;max-width:920px;margin:0 auto">'
          # eyebrow + headline
          '<div class="gq-l" style="display:flex;justify-content:center">' + eyebrow + '</div>'
          '<div class="gq-l" style="margin-top:34px;text-align:center;font-family:\'Unbounded\',sans-serif;'
          'font-weight:600;font-size:clamp(44px,7.5vw,92px);line-height:1;letter-spacing:-.03em;color:' + CREAM + '">'
          'Главный ' + gold_clip("вопрос") + '</div>'
          # gold rule
          '<div class="gq-l" style="display:flex;justify-content:center"><div class="gq-rule" style="margin-top:40px"></div></div>'
          # the shift (manifesto subhead)
          '<div class="gq-l" style="margin-top:40px;text-align:center;font-size:21px;line-height:1.6;'
          'color:rgba(241,235,220,.72);max-width:620px;margin-left:auto;margin-right:auto;font-weight:400">'
          'После создания капитала вы уже не спрашиваете '
          '<span style="color:rgba(241,235,220,.38)">«где взять денег»</span>.<br>'
          'Вопрос — ' + gold_clip("с кем") + '.</div>'
          # ── questions grid (Double-Bezel cards) ──
          '<div style="margin-top:60px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px">'
            + q1 + q2 + q3 +
          '</div>'
          # ── punchline ──
          '<div class="gq-l" style="margin-top:72px;text-align:center">'
            '<div style="font-family:\'Unbounded\',sans-serif;font-weight:400;font-size:24px;'
            'line-height:1.45;color:rgba(241,235,220,.46);letter-spacing:-.005em">'
            'Окружение нельзя купить.</div>'
            '<div style="margin-top:6px;font-family:\'Unbounded\',sans-serif;font-weight:400;font-size:24px;'
            'line-height:1.45;color:rgba(241,235,220,.46);letter-spacing:-.005em">'
            'Но можно попасть туда, где оно уже собрано.</div>'
            '<div style="margin-top:14px;font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:32px;'
            'line-height:1.2;color:' + CREAM + ';letter-spacing:-.015em">'
            'И именно ' + gold_clip("мы") + ' его собрали.</div>'
          '</div>'
        '</div>'
        '</div>'
    )


def build_reveal_js():
    """Reveal JS — placed here but the transformer moves it after </x-dc>."""
    return (
        '<script>'
        '(function(){'
        'function rv(){document.querySelectorAll(".gq-reveal").forEach(function(e){'
        'var r=e.getBoundingClientRect();'
        'if(r.top<(window.innerHeight||document.documentElement.clientHeight)*0.88&&r.bottom>0){e.classList.add("is-in");}'
        '});}'
        'if("IntersectionObserver" in window){'
        'var io=new IntersectionObserver(function(en){en.forEach(function(x){'
        'if(x.isIntersecting){x.target.classList.add("is-in");io.unobserve(x.target);}'
        '});},{threshold:0.12,rootMargin:"0px 0px -8% 0px"});'
        'document.querySelectorAll(".gq-reveal").forEach(function(e){io.observe(e);});'
        '} else { document.querySelectorAll(".gq-reveal").forEach(function(e){e.classList.add("is-in");}); }'
        'setTimeout(rv,350);window.addEventListener("scroll",rv,{passive:true});'
        '})();'
        '</script>'
    )


def main():
    raw_file = SRC.read_text(encoding="utf-8")
    m = re.search(r'<script type="__bundler/template">(.*?)</script>', raw_file, re.S)
    if not m:
        sys.exit("ERROR: template script not found")
    raw_json = m.group(1).strip()
    tpl = json.loads(raw_json)

    # locate the OLD block 1 span: from '<style>.mq-rule' (or '.gq' if already redone)
    # up to block 2's eyebrow div.
    style_marker = '<style>.gq-rule' if '<style>.gq-rule' in tpl else '<style>.mq-rule'
    style_start = tpl.find(style_marker)
    if style_start < 0:
        sys.exit("ERROR: block 1 style marker not found")
    b2 = tpl.find('02 — ПОЧЕМУ ГОРДОСТЬ?')
    if b2 < 0:
        sys.exit("ERROR: block 2 anchor not found")
    b2_start = tpl.rfind('<div', 0, b2)
    old_span = tpl[style_start:b2_start]
    print(f"old block 1 span: {style_start}..{b2_start} ({len(old_span)} chars)")

    # also remove the OLD reveal JS (mq-reveal IntersectionObserver) wherever it is
    # (it was moved after </x-dc> previously). Match either mq or gq variant.
    old_js_patterns = [
        r'<script>\s*\(function\(\)\{[^<]*?mq-reveal[^<]*?\}\)\(\);\s*</script>',
    ]
    js_removed = 0
    for pat in old_js_patterns:
        new_tpl, n = re.subn(pat, '', tpl, flags=re.S)
        if n:
            tpl = new_tpl
            js_removed += n
    print(f"old reveal JS blocks removed: {js_removed}")

    # build new block 1
    new_block = build_styles() + build_block()

    # replace the old span (note: tpl may have shifted after JS removal; recompute anchors)
    style_start = tpl.find(style_marker)
    b2 = tpl.find('02 — ПОЧЕМУ ГОРДОСТЬ?')
    b2_start = tpl.rfind('<div', 0, b2)
    tpl = tpl[:style_start] + new_block + tpl[b2_start:]

    # insert the reveal JS after </x-dc> (where scripts execute)
    xd_end = tpl.find('</x-dc>')
    if xd_end < 0:
        sys.exit("ERROR: </x-dc> not found")
    insert_at = xd_end + len('</x-dc>')
    tpl = tpl[:insert_at] + '\n' + build_reveal_js() + '\n' + tpl[insert_at:]

    # re-encode
    new_json = json.dumps(tpl, ensure_ascii=False).replace('</', '<\\u002F')
    if json.loads(new_json) != tpl:
        sys.exit("ERROR: round-trip failed")
    new_file = raw_file.replace(raw_json, new_json, 1)
    if new_file == raw_file:
        sys.exit("ERROR: file unchanged")
    SRC.write_text(new_file, encoding="utf-8")
    print(f"OK. Redesigned block 1 «Главный вопрос» (premium Double-Bezel + reveal).")
    print(f"  file size: {len(raw_file)} → {len(new_file)} bytes")


if __name__ == "__main__":
    main()
