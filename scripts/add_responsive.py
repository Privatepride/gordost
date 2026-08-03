#!/usr/bin/env python3
"""Make /new fully responsive on mobile via a single comprehensive <style> block.

The bundle uses inline styles everywhere, so per-element rewrites are impractical.
Instead we inject ONE responsive <style> block into <head> that uses @media queries
with !important to cascade-override the problem inline styles at <=768px and <=480px.

Targets the audit findings:
  - 33 big fixed font-sizes (54-92px) → shrink to readable mobile sizes
  - 9 multi-column grids (repeat(3/4,1fr)) → collapse to 1-2 columns
  - 46 fixed widths (280/340px cards, 560/920px containers) → 100%/auto
  - 20 big paddings (88-120px) → reduce to 40-56px
  - header nav (logo + 5 links in a row) → hide links, they don't fit
  - modal forms (max-width 480-560px) → full width with padding
  - flex rows that need stacking
"""

import json
import re
import sys
from pathlib import Path

SRC = Path("/root/gordost/public/new/index.html")


RESPONSIVE_CSS = """
<style id="responsive-overrides">
/* ═══ МОБИЛЬНАЯ АДАПТАЦИЯ ═══ */

/* ── Header / Nav: на мобилке пункты не помещаются — показываем только логотип ── */
@media (max-width: 768px) {
  /* скрываем ряд nav-пунктов (5 ссылок в строку не влезают) */
  body > * header div[style*="gap:28px"],
  div[style*="background:#0D1626;display:flex;align-items:center;justify-content:space-between"] > div:nth-child(2) {
    display: none !important;
  }
}

/* ── Tablet (<=768px): основные правки ── */
@media (max-width: 768px) {

  /* Большие заголовки секций: 54px → 34px */
  [style*="font-size:54px"] {
    font-size: 34px !important;
    line-height: 1.1 !important;
  }

  /* Hero-заголовок 76px → 40px */
  [style*="font-size:76px"] {
    font-size: 40px !important;
    line-height: 1.06 !important;
  }

  /* «Главный вопрос» clamp заголовок — ограничиваем сверху */
  [style*="clamp(44px"] {
    font-size: 38px !important;
  }

  /* Manifesto punchline 32px → 26px */
  [style*="font-size:32px"][style*="font-weight:600"][style*="letter-spacing:-.015em"] {
    font-size: 26px !important;
  }

  /* sub-headlines 24px → 20px */
  [style*="font-size:24px"][style*="font-weight:500"] {
    font-size: 20px !important;
  }
  [style*="font-size:24px"][style*="font-weight:400"] {
    font-size: 20px !important;
  }

  /* lead текст 21px → 17px */
  [style*="font-size:21px"][style*="font-weight:500"] {
    font-size: 17px !important;
  }

  /* ── Сеточные блоки: 3-4 колонки → 1 колонка ── */
  [style*="grid-template-columns:repeat(3,1fr)"] {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
  [style*="grid-template-columns:repeat(4,1fr)"] {
    grid-template-columns: repeat(2,1fr) !important;
    gap: 12px !important;
  }
  /* двухколоночные grids (1fr 1fr, 420px 1fr, 1.4fr 1fr) → 1 колонка */
  [style*="grid-template-columns:1fr 1fr"] {
    grid-template-columns: 1fr !important;
  }
  [style*="grid-template-columns:420px 1fr"] {
    grid-template-columns: 1fr !important;
  }
  [style*="grid-template-columns:1.4fr 1fr"] {
    grid-template-columns: 1fr !important;
  }

  /* ── Карточки с фиксированной шириной → растягиваем ── */
  /* карточки прошедших событий 280px */
  [style*="width:280px"] {
    width: 100% !important;
    flex: none !important;
  }
  /* карточки будущих событий 340px */
  [style*="width:340px"] {
    width: 100% !important;
    flex: none !important;
  }

  /* ── Секция padding: уменьшаем большие отступы ── */
  /* padding 120px top/bottom → 48px */
  [style*="padding:120px"] {
    padding-top: 56px !important;
    padding-bottom: 52px !important;
  }
  [style*="padding:96px"] {
    padding-top: 52px !important;
    padding-bottom: 48px !important;
  }
  [style*="padding:88px"] {
    padding-top: 48px !important;
    padding-bottom: 44px !important;
  }
  [style*="padding:78px"] {
    padding-top: 44px !important;
    padding-bottom: 40px !important;
  }
  [style*="padding:72px"] {
    padding-top: 40px !important;
    padding-bottom: 36px !important;
  }
  [style*="padding:64px"] {
    padding-top: 40px !important;
    padding-bottom: 36px !important;
  }

  /* ── flex-row布局 которые нужно выстроить вертикально ── */
  /* секции с justify-content:space-between (eyebrow + правая метка) → просто выровнять */
  [style*="display:flex;justify-content:space-between;align-items:baseline"] {
    flex-wrap: wrap !important;
    gap: 8px !important;
  }
  [style*="display:flex;justify-content:space-between;align-items:flex-end"] {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 16px !important;
  }
  [style*="display:flex;justify-content:space-between;align-items:center;gap:40px"] {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 20px !important;
  }

  /* ── max-width контейнеры внутри секций → 100% ── */
  [style*="max-width:760px"] { max-width: 100% !important; }
  [style*="max-width:790px"] { max-width: 100% !important; }
  [style*="max-width:860px"] { max-width: 100% !important; }
  [style*="max-width:920px"] { max-width: 100% !important; }
  [style*="max-width:680px"] { max-width: 100% !important; }
  [style*="max-width:620px"] { max-width: 100% !important; }

  /* horizontal padding full-bleed уменьшаем */
  [style*="padding:20px max(32px"] {
    padding-left: 18px !important;
    padding-right: 18px !important;
  }

  /* большие цифры/номера в карточках 130px → 80px */
  [style*="font-size:130px"] { font-size: 72px !important; }
  [style*="font-size:120px"] { font-size: 64px !important; }
}

/* ── Маленькие экраны (<=480px): телефоны ── */
@media (max-width: 480px) {
  /* заголовки ещё меньше */
  [style*="font-size:54px"] {
    font-size: 28px !important;
  }
  [style*="font-size:76px"] {
    font-size: 34px !important;
  }
  [style*="font-size:34px"] {
    font-size: 26px !important;
  }
  [style*="font-weight:900;font-size:34px"],
  [style*="font-weight:800;font-size:34px"] {
    font-size: 26px !important;
  }

  /* повтор 4-col grids → 1 колонка на совсем узких */
  [style*="grid-template-columns:repeat(2,1fr)"] {
    grid-template-columns: 1fr !important;
  }
  [style*="grid-template-columns:repeat(4,1fr)"] {
    grid-template-columns: 1fr !important;
  }

  /* padding ещё компактнее */
  [style*="padding:120px"] {
    padding-top: 40px !important;
    padding-bottom: 36px !important;
  }

  /* header logo меньше */
  img[style*="height:56px"] {
    height: 40px !important;
  }
}

/* ── Модальные формы: адаптивность ── */
@media (max-width: 560px) {
  /* сама форма-контейнер */
  [style*="max-width:480px"], [style*="max-width:560px"] {
    max-width: 100% !important;
    margin: 0 12px !important;
    padding: 32px 22px 28px !important;
  }
  /* двухколоночные grid внутри форм → 1 колонка */
  [style*="grid-template-columns:1fr 1fr"][style*="gap:12px"] {
    grid-template-columns: 1fr !important;
  }
}

/* ── Footer (нижняя секция с реквизитами) ── */
@media (max-width: 768px) {
  [style*="grid-template-columns:1fr 1fr 1.6fr"] {
    grid-template-columns: 1fr !important;
    gap: 24px !important;
  }
  [style*="display:flex;justify-content:space-between;align-items:center;margin-top:40px"] {
    flex-direction: column !important;
    gap: 12px !important;
    align-items: flex-start !important;
  }
}
</style>
"""


def main():
    raw_file = SRC.read_text(encoding="utf-8")
    m = re.search(r'<script type="__bundler/template">(.*?)</script>', raw_file, re.S)
    if not m:
        sys.exit("ERROR: template script not found")
    raw_json = m.group(1).strip()
    tpl = json.loads(raw_json)

    if 'id="responsive-overrides"' in tpl:
        sys.exit("ERROR: responsive CSS already inserted (idempotency guard)")

    # inject into <head> (after existing styles, before </head>)
    head_close = tpl.find('</head>')
    if head_close < 0:
        sys.exit("ERROR: </head> not found")
    tpl = tpl[:head_close] + RESPONSIVE_CSS + tpl[head_close:]

    # re-encode
    new_json = json.dumps(tpl, ensure_ascii=False).replace('</', '<\\u002F')
    if json.loads(new_json) != tpl:
        sys.exit("ERROR: round-trip failed")
    new_file = raw_file.replace(raw_json, new_json, 1)
    if new_file == raw_file:
        sys.exit("ERROR: file unchanged")
    SRC.write_text(new_file, encoding="utf-8")
    print(f"OK. Injected responsive CSS (breakpoints 768/560/480px).")
    print(f"  file size: {len(raw_file)} → {len(new_file)} bytes")


if __name__ == "__main__":
    main()
