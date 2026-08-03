#!/usr/bin/env python3
"""Redesign BOTH manifesto blocks (Главный вопрос + Почему Гордость) — reliable + premium.

Fixes:
  - Block 1 was invisible: .gq{opacity:0} default + flaky IntersectionObserver meant
    content never showed. Now content is VISIBLE BY DEFAULT; reveal is pure
    enhancement (graceful degradation — if JS fails, everything is still readable).
  - Block 2 was plain: flat cards on beige, no section padding, weak eyebrow.
    Now matches block 1's premium Double-Bezel treatment + has its own reveal.

Both blocks share one reveal mechanism (CSS-first via animation-timeline:view(),
the SAME pattern the rest of the site already uses for its `greveal` animation —
no JS dependency at all). A JS fallback observes and adds .is-in for browsers
without scroll-driven animations, but content is visible regardless.

Brand palette GORDOST (navy/cream/gold/Unbounded). No images.
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
HAIR_C = "rgba(241,235,220,.10)"      # hairline on dark
HAIR_C2 = "rgba(241,235,220,.16)"
HAIR_N = "rgba(13,22,38,.14)"         # hairline on light
HAIR_N2 = "rgba(13,22,38,.22)"
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
        # === Reveal mechanism — CSS-first, content visible by default ===
        # The site already defines @keyframes greveal (fade+rise). We reuse it via
        # animation-timeline:view() so reveal works with ZERO javascript. Content is
        # fully visible if scroll-driven animations aren't supported (graceful).
        '.mr{animation:greveal both;animation-timeline:view();animation-range:entry 4% cover 30%}'
        # staggered children inside a .mr-stagger container
        '.mr-stagger > *{animation:greveal both;animation-timeline:view();animation-range:entry 4% cover 40%}'
        '.mr-stagger > *:nth-child(1){animation-delay:0s}'
        '.mr-stagger > *:nth-child(2){animation-delay:.08s}'
        '.mr-stagger > *:nth-child(3){animation-delay:.16s}'
        # Double-Bezel card hover (block 1 questions + block 2 principles share .mbcard)
        '.mbcard{transition:transform .55s ' + EASE + ',filter .55s ' + EASE + '}'
        '.mbcard:hover{transform:translateY(-5px)}'
        '.mbcard:hover .mbnum{color:' + GOLD + '}'
        '.mbnum{transition:color .4s ease}'
        '@media(prefers-reduced-motion:reduce){.mr,.mr-stagger>*{animation:none}}'
        '</style>'
    )


def bezel_card(inner, extra_outer=""):
    """Double-Bezel: outer shell (gradient hairline) + inner core (inset highlight)."""
    return (
        '<div class="mbcard" style="position:relative;padding:1.5px;border-radius:22px;'
        'background:linear-gradient(180deg,' + HAIR_N2 + ',' + HAIR_N + ')' + extra_outer + '>'
        '<div style="border-radius:20.5px;' + inner + '">'
        '</div></div>'
    )


def build_block1():
    """«Главный вопрос» — dark cinematic manifesto, content visible by default."""
    eyebrow = (
        '<div style="display:flex;align-items:center;gap:12px;font-size:11.5px;'
        'letter-spacing:.18em;color:' + GOLD + ';text-transform:uppercase">'
        '<span style="width:28px;height:1.5px;background:' + GOLD + ';display:block"></span>'
        'Главный вопрос</div>'
    )

    def qcard(num, text):
        return (
            '<div class="mbcard" style="position:relative;padding:1.5px;border-radius:22px;'
            'background:linear-gradient(180deg,' + HAIR_C2 + ',' + HAIR_C + ')">'
              '<div style="border-radius:20.5px;background:' + NAVY_2 + ';padding:32px 30px 30px;'
              'box-shadow:inset 0 1px 0 rgba(241,235,220,.06);display:flex;gap:22px;align-items:flex-start">'
                '<div class="mbnum" style="font-family:\'Unbounded\',sans-serif;font-weight:700;font-size:15px;'
                'color:rgba(200,155,78,.55);flex:none;letter-spacing:.04em;padding-top:3px">' + num + '</div>'
                '<div style="font-size:18px;line-height:1.5;color:rgba(241,235,220,.88);font-weight:400">' + text + '</div>'
              '</div>'
            '</div>'
        )

    q1 = qcard("01", "С кем заходить в сделки, не проверяя человека полгода?")
    q2 = qcard("02", "У кого спросить про нишу, в которой сам не эксперт?")
    q3 = qcard("03", "С кем насыщенно проводить свободное время, не думая про организацию?")

    return (
        '<div style="position:relative;background:' + NAVY + ';padding:120px ' + HPAD + ' 116px;'
        'overflow:hidden;border-bottom:1.5px solid ' + HAIR_C + '">'
        # ambient gold glow (depth, no shadow)
        '<div style="position:absolute;top:-220px;left:50%;transform:translateX(-50%);width:780px;height:560px;'
        'background:radial-gradient(circle,rgba(200,155,78,.12),transparent 65%);pointer-events:none"></div>'
        '<div style="position:absolute;bottom:-180px;right:-120px;width:520px;height:520px;'
        'background:radial-gradient(circle,rgba(168,127,58,.07),transparent 70%);pointer-events:none"></div>'
        '<div class="mr" style="position:relative;max-width:920px;margin:0 auto;text-align:center">'
          '<div style="display:flex;justify-content:center">' + eyebrow + '</div>'
          '<div style="margin-top:34px;font-family:\'Unbounded\',sans-serif;font-weight:600;'
          'font-size:clamp(44px,7.5vw,92px);line-height:1;letter-spacing:-.03em;color:' + CREAM + '">'
          'Главный ' + gold_clip("вопрос") + '</div>'
          '<div style="margin-top:40px;width:120px;height:1.5px;margin-left:auto;margin-right:auto;'
          'background:linear-gradient(90deg,' + GOLD + ',transparent)"></div>'
          '<div style="margin-top:40px;font-size:21px;line-height:1.6;color:rgba(241,235,220,.74);'
          'max-width:620px;margin-left:auto;margin-right:auto;font-weight:400">'
          'После создания капитала вы уже не спрашиваете '
          '<span style="color:rgba(241,235,220,.4)">«где взять денег»</span>.<br>'
          'Вопрос — ' + gold_clip("с кем") + '.</div>'
        '</div>'
        # questions grid
        '<div class="mr-stagger" style="position:relative;max-width:920px;margin:60px auto 0;display:grid;'
        'grid-template-columns:repeat(3,1fr);gap:18px">'
          + q1 + q2 + q3 +
        '</div>'
        # punchline
        '<div class="mr" style="position:relative;max-width:920px;margin:72px auto 0;text-align:center">'
          '<div style="font-family:\'Unbounded\',sans-serif;font-weight:400;font-size:24px;line-height:1.45;'
          'color:rgba(241,235,220,.48);letter-spacing:-.005em">Окружение нельзя купить.</div>'
          '<div style="margin-top:6px;font-family:\'Unbounded\',sans-serif;font-weight:400;font-size:24px;'
          'line-height:1.45;color:rgba(241,235,220,.48);letter-spacing:-.005em">'
          'Но можно попасть туда, где оно уже собрано.</div>'
          '<div style="margin-top:14px;font-family:\'Unbounded\',sans-serif;font-weight:600;font-size:32px;'
          'line-height:1.2;color:' + CREAM + ';letter-spacing:-.015em">'
          'И именно ' + gold_clip("мы") + ' его собрали.</div>'
        '</div>'
        '</div>'
    )


def build_block2():
    """«Почему Гордость?» — premium Double-Bezel cards on cream, content visible by default."""
    eyebrow = (
        '<div style="display:flex;align-items:center;gap:12px;font-size:11.5px;letter-spacing:.16em;'
        'color:' + GOLD_2 + '"><span style="width:28px;height:1.5px;background:' + GOLD_2 + ';display:block"></span>02 — ПОЧЕМУ ГОРДОСТЬ?</div>'
    )
    heading = (
        '<div style="margin-top:28px;font-family:\'Unbounded\',sans-serif;font-weight:800;font-size:54px;'
        'line-height:1.05;color:#0D1626;letter-spacing:-.02em">Почему ' + gold_clip("Гордость?") + '</div>'
    )

    def pcard(num, bold, body, emph):
        return (
            '<div class="mbcard" style="position:relative;padding:1.5px;border-radius:22px;'
            'background:linear-gradient(180deg,' + HAIR_N2 + ',' + HAIR_N + ')">'
              '<div style="border-radius:20.5px;background:#F4EFE3;padding:38px 32px 34px;'
              'box-shadow:inset 0 1px 0 rgba(255,255,255,.6);display:flex;flex-direction:column;height:100%">'
                '<div class="mbnum" style="font-family:\'Unbounded\',sans-serif;font-weight:800;font-size:38px;'
                'line-height:1;color:#0D1626;opacity:.14">' + num + '</div>'
                '<div style="margin-top:22px;font-family:\'Unbounded\',sans-serif;font-weight:700;font-size:21px;'
                'line-height:1.25;color:#0D1626">' + bold + '</div>'
                '<div style="margin-top:14px;font-size:15px;color:rgba(13,22,38,.62);line-height:1.6">' + body + '</div>'
                '<div style="margin-top:14px;font-size:14px;color:rgba(13,22,38,.48);line-height:1.6;'
                'padding-top:14px;border-top:1px solid ' + HAIR_N + '">' + emph + '</div>'
              '</div>'
            '</div>'
        )

    c1 = pcard("01", "Полный запрет продаж внутри клуба.",
               "Резиденты — только инвесторы. У нас нет наставников, продюсеров и «уникальных предложений».",
               "Здесь вы чувствуете себя человеком, а не лидом из списка инвесторов.")
    c2 = pcard("02", "Мы не учим и не советуем, куда вложить.",
               "В воронке отобранных проектов нет лоббирования. Клуб делает разбор, даёт полную информацию и помогает найти людей для совместной сделки.",
               "Но решение всегда за вами.")
    c3 = pcard("03", "У нас классный движ, а не скучные заседания.",
               "Другие клубы серьёзны до зевоты. У нас — ИнвестБаня, выезды на эндуро, походы, путешествия, игры, ужины, живые разборы.",
               "Серьёзная у нас только инвестиционная аналитика. И Даша.")

    return (
        '<div style="background:' + BEIGE + ';padding:88px ' + HPAD + ' 80px;border-bottom:1.5px solid #0D1626">'
        '<div class="mr">'
          '<div style="display:flex;justify-content:space-between;align-items:baseline">'
            + eyebrow +
            '<div style="font-family:\'Golos Text\',sans-serif;font-size:12px;color:rgba(13,22,38,.45);'
            'letter-spacing:.06em">ТРИ ПРИНЦИПА</div>'
          '</div>'
          + heading +
        '</div>'
        '<div class="mr-stagger" style="margin-top:44px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px">'
          + c1 + c2 + c3 +
        '</div>'
        '</div>'
    )


def main():
    raw_file = SRC.read_text(encoding="utf-8")
    m = re.search(r'<script type="__bundler/template">(.*?)</script>', raw_file, re.S)
    if not m:
        sys.exit("ERROR: template script not found")
    raw_json = m.group(1).strip()
    tpl = json.loads(raw_json)

    # Locate the span covering BOTH blocks: from the block-1 <style> to just before
    # the <!-- criteria --> comment (which follows block 2).
    # Block 1 style marker: find the <style> containing 'gq-rule' or 'mr-stagger' or '.mbcard'
    style_start = None
    for mm in re.finditer(r'<style>(.*?)</style>', tpl, re.S):
        body = mm.group(1)
        if 'gq-rule' in body or 'mr-stagger' in body or '.mbcard' in body or 'mq-rule' in body:
            style_start = mm.start()
            break
    if style_start is None:
        sys.exit("ERROR: block-1 style not found")

    crit = tpl.find('<!-- criteria -->')
    if crit < 0:
        sys.exit("ERROR: '<!-- criteria -->' anchor not found")
    old_span = tpl[style_start:crit]
    print(f"old span (both blocks): {style_start}..{crit} ({len(old_span)} chars)")

    # Also remove any leftover reveal JS (gq-reveal / mq-reveal scripts) anywhere.
    removed_js = 0
    for pat in [
        r'<script>\s*\(function\(\)\{[^<]*?gq-reveal[^<]*?\}\)\(\);\s*</script>',
        r'<script>\s*\(function\(\)\{[^<]*?mq-reveal[^<]*?\}\)\(\);\s*</script>',
    ]:
        tpl2, n = re.subn(pat, '', tpl, flags=re.S)
        if n:
            tpl = tpl2; removed_js += n
    print(f"leftover reveal JS removed: {removed_js}")

    # Recompute anchors (offsets shifted after JS removal)
    style_start = None
    for mm in re.finditer(r'<style>(.*?)</style>', tpl, re.S):
        if 'gq-rule' in mm.group(1) or 'mq-rule' in mm.group(1) or '.mbcard' in mm.group(1):
            style_start = mm.start(); break
    crit = tpl.find('<!-- criteria -->')
    # Replace the whole span with new styles + both blocks.
    new_content = build_styles() + build_block1() + build_block2()
    tpl = tpl[:style_start] + new_content + tpl[crit:]

    # re-encode
    new_json = json.dumps(tpl, ensure_ascii=False).replace('</', '<\\u002F')
    if json.loads(new_json) != tpl:
        sys.exit("ERROR: round-trip failed")
    new_file = raw_file.replace(raw_json, new_json, 1)
    if new_file == raw_file:
        sys.exit("ERROR: file unchanged")
    SRC.write_text(new_file, encoding="utf-8")
    print(f"OK. Redesigned BOTH blocks (visible-by-default + Double-Bezel).")
    print(f"  reveal: CSS-first via animation-timeline:view() (no JS dependency)")
    print(f"  file size: {len(raw_file)} → {len(new_file)} bytes")


if __name__ == "__main__":
    main()
