#!/usr/bin/env python3
"""
Mobile responsiveness injector — v2.

PROBLEM: the DC framework re-serializes inline styles after rendering,
normalizing whitespace and values:
    source HTML:  style="font-size:76px;...;color:#0D1626"
    live DOM:     style="font-size: 76px; ...; color: rgb(13, 22, 38)"
So CSS attribute selectors like [style*="font-size:76px"] NEVER match the live DOM.
Result: every previous override silently failed.

SOLUTION: replace the dead <style id="responsive-overrides"> block with a
runtime JS pass that:
  1. Matches against COMPUTED styles (values, not attr strings).
  2. Forces overflow-x:hidden on body/html (no horizontal scroll).
  3. Hides the 5-link desktop nav on mobile (uses gap-detection on parent).
  4. Shrinks oversized fonts by computed pixel value.
  5. Collapses multi-column grids / fixed-width cards / big paddings.
  6. Re-runs via MutationObserver when DC re-renders the template.

Idempotent: removes any prior responsive-overrides block/script first.
"""
import json, re, sys

SRC = "/root/gordost/public/new/index.html"

with open(SRC) as f:
    html = f.read()

# ── Decode the bundler template ─────────────────────────────────────────────
mt = re.search(r'<script type="__bundler/template"[^>]*>(.*?)</script>', html, re.S)
if not mt:
    sys.exit("ERROR: no __bundler/template script found")
tpl = json.loads(mt.group(1).strip())

# ── Remove any existing responsive-overrides <style> block ──────────────────
tpl = re.sub(
    r'<style id="responsive-overrides">.*?</style>\s*',
    '',
    tpl,
    flags=re.S
)
# Remove any prior runtime responsive script we injected
tpl = re.sub(
    r'<script>\s*/\* ===\s*MOBILE RESPONSIVE[\s\S]*?__applyResponsive\(\);\s*\}\)\(\);\s*</script>\s*',
    '',
    tpl
)
tpl = re.sub(
    r'<script id="responsive-runtime">[\s\S]*?</script>\s*',
    '',
    tpl
)

# ── The new runtime script ─────────────────────────────────────────────────
# IMPORTANT: this is placed inside <x-dc>? NO — DC swallows plain scripts.
# We inject it AFTER </x-dc> so it runs as a normal script.
# But the style/viewport tweaks must live in <head> as a tiny <style> (CSS that
# doesn't depend on attr-string matching still works).

HEAD_STYLE = '''<style id="responsive-base">
/* viewport + horizontal-scroll kill — these don't depend on attr matching */
html, body { max-width: 100% !important; overflow-x: hidden !important; }
img, svg, video { max-width: 100% !important; height: auto !important; }
/* long words (ГОРДОСТЬ, Unbounded display fonts) — wrap rather than overflow */
body * { overflow-wrap: break-word; word-wrap: break-word; }
</style>'''

# Inject head style right after <meta viewport> (or before <title> if missing)
if 'id="responsive-base"' not in tpl:
    if '<meta name="viewport"' in tpl:
        tpl = re.sub(
            r'(<meta name="viewport"[^>]*>)',
            r'\1\n' + HEAD_STYLE,
            tpl,
            count=1
        )
    else:
        tpl = tpl.replace('<title>', HEAD_STYLE + '\n<title>', 1)

# ── The runtime JS — appended AFTER </x-dc> so DC doesn't swallow it ───────
RUNTIME_JS = r'''<script id="responsive-runtime">
(function(){
  "use strict";
  // Wait until DOM is built. We re-run on DC re-render via MutationObserver.
  var MOBILE_MAX = 768;
  var PHONE_MAX  = 480;

  function px(s){ return parseFloat(s) || 0; }
  function isMobile(){ return window.innerWidth <= MOBILE_MAX; }
  function isPhone(){  return window.innerWidth <= PHONE_MAX; }

  // Font-size remap table. Keys are computed px in source; values are mobile px.
  // Phone overrides take precedence when isPhone().
  var TABLET_FS = {
    '92px':'40px','88px':'40px','84px':'40px','80px':'38px','76px':'40px',
    '72px':'38px','68px':'36px','64px':'34px','60px':'32px','56px':'30px',
    '54px':'30px','52px':'30px','48px':'28px','44px':'27px','42px':'27px',
    '40px':'26px','38px':'26px','36px':'24px','34px':'24px','32px':'22px',
    '30px':'21px','28px':'20px','26px':'19px','24px':'19px'
  };
  var PHONE_FS = {
    '76px':'32px','72px':'32px','68px':'32px','64px':'30px','60px':'28px',
    '56px':'28px','54px':'27px','52px':'27px','48px':'26px','44px':'25px',
    '42px':'24px','40px':'23px','38px':'23px','36px':'22px','34px':'21px'
  };
  // Giant stat numbers (130/120/110/100px) — much smaller on mobile
  var TABLET_BIG = {'150px':'64px','140px':'60px','130px':'60px','120px':'56px','110px':'52px','100px':'48px'};
  var PHONE_BIG  = {'150px':'52px','140px':'48px','130px':'48px','120px':'44px','110px':'42px','100px':'40px'};

  function remapFont(el, cs){
    var fs = cs.fontSize;
    var target = null;
    if (isPhone()){
      target = PHONE_BIG[fs] || PHONE_FS[fs] || TABLET_BIG[fs] || TABLET_FS[fs];
    } else {
      target = TABLET_BIG[fs] || TABLET_FS[fs];
    }
    if (target && target !== fs){
      el.style.fontSize = target;
    }
  }

  // Collapse multi-column grids → 1 col
  function collapseGrid(el, cs){
    var gtc = cs.gridTemplateColumns;
    if (!gtc || gtc === 'none') return;
    // count tracks (1fr 1fr 1fr → 3, repeat(4,1fr) etc)
    var tracks = gtc.split(/\s+/).filter(Boolean);
    var isRepeat = gtc.indexOf('repeat(') === 0;
    var cols = isRepeat ? (parseInt(gtc.match(/repeat\((\d+)/)[1])||0) : tracks.length;
    if (cols >= 2){
      el.style.gridTemplateColumns = '1fr';
      if (px(cs.rowGap) < 16) el.style.rowGap = '16px';
    }
  }

  // Fixed-width cards → 100%
  function unfixWidth(el, cs){
    var w = cs.width;
    if (w && w.indexOf('px') > -1 && px(w) > window.innerWidth){
      el.style.width = '100%';
      el.style.maxWidth = '100%';
      if (cs.flex === 'none' || el.style.flex === '0 0 auto'){
        el.style.flex = '0 0 auto';
      }
    }
    var mw = cs.maxWidth;
    if (mw && mw.indexOf('px') > -1 && px(mw) > window.innerWidth){
      el.style.maxWidth = '100%';
    }
  }

  // Big paddings → compact
  function compactPadding(el, cs){
    var pT = px(cs.paddingTop), pB = px(cs.paddingBottom);
    var shrink = function(v){
      if (v >= 110) return isPhone() ? '40px' : '52px';
      if (v >= 90)  return isPhone() ? '38px' : '48px';
      if (v >= 72)  return isPhone() ? '34px' : '42px';
      if (v >= 60)  return isPhone() ? '30px' : '36px';
      return null;
    };
    var nt = shrink(pT), nb = shrink(pB);
    if (nt) el.style.paddingTop = nt;
    if (nb) el.style.paddingBottom = nb;
  }

  // Hide desktop nav on mobile
  function hideNav(){
    var links = document.querySelectorAll('a.navlink, a[data-nav-scroll]');
    links.forEach(function(a){
      // hide the parent flex container (the row of 5 links)
      var parent = a.parentElement;
      if (parent && isMobile()){
        var pcs = window.getComputedStyle(parent);
        if (pcs.display === 'flex'){
          parent.style.display = 'none';
        }
      }
    });
  }

  // Flex rows with space-between + multiple children → stack vertically
  function stackFlexRow(el, cs){
    if (cs.display !== 'flex') return;
    var justify = cs.justifyContent;
    if (justify !== 'space-between' && justify !== 'space-around') return;
    var kids = el.children;
    if (kids.length < 2) return;
    // measure: if it overflows, stack
    var r = el.getBoundingClientRect();
    if (r.right > window.innerWidth + 2){
      el.style.flexDirection = 'column';
      el.style.alignItems = 'flex-start';
      el.style.gap = (isPhone() ? '14px' : '18px');
    }
  }

  var RAN = new WeakSet();
  function processAll(){
    if (!isMobile()) return;
    hideNav();
    var all = document.querySelectorAll('body *');
    for (var i = 0; i < all.length; i++){
      var el = all[i];
      if (RAN.has(el)) continue;
      var cs = window.getComputedStyle(el);
      // only touch block/flex/grid elements (skip inline text bits unless they're oversized)
      remapFont(el, cs);
      if (cs.display === 'grid') collapseGrid(el, cs);
      unfixWidth(el, cs);
      if (cs.display === 'block' || cs.display === 'flex' || cs.display === 'grid'){
        compactPadding(el, cs);
      }
      if (cs.display === 'flex') stackFlexRow(el, cs);
      RAN.add(el);
    }
  }

  // Throttle
  var t = null;
  function schedule(){
    if (t) return;
    t = setTimeout(function(){ t = null; processAll(); }, 80);
  }

  function start(){
    processAll();
    // re-run when ANY node is added/changed (DC re-renders template)
    var mo = new MutationObserver(function(muts){
      for (var i = 0; i < muts.length; i++){
        if (muts[i].addedNodes.length || muts[i].type === 'attributes'){
          schedule(); break;
        }
      }
    });
    mo.observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['style','data-dc-tpl']});
    // re-run on resize/orientation
    var rt = null;
    window.addEventListener('resize', function(){
      clearTimeout(rt);
      rt = setTimeout(function(){
        RAN = new WeakSet(); // reset so elements get re-evaluated
        processAll();
      }, 150);
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      requestAnimationFrame(function(){ setTimeout(start, 60); });
    });
  } else {
    requestAnimationFrame(function(){ setTimeout(start, 60); });
  }
})();
</script>'''

# Inject runtime JS after </x-dc> (so DC doesn't swallow it)
if 'responsive-runtime' not in tpl:
    if '</x-dc>' in tpl:
        tpl = tpl.replace('</x-dc>', '</x-dc>\n' + RUNTIME_JS, 1)
    else:
        # fallback: append before </body>
        tpl = tpl.replace('</body>', RUNTIME_JS + '\n</body>', 1)

# ── Re-encode the template (bundler-safe) ──────────────────────────────────
new_json = json.dumps(tpl, ensure_ascii=False).replace('</', '<\\u002F')

new_block = '<script type="__bundler/template">' + new_json + '</script>'

html_new = re.sub(
    r'<script type="__bundler/template"[^>]*>.*?</script>',
    lambda m: new_block,
    html,
    count=1,
    flags=re.S
)

if html_new == html:
    sys.exit("ERROR: no change applied to HTML")

with open(SRC, 'w') as f:
    f.write(html_new)

print("✓ responsive-runtime injected (v2: computed-style based, DC-safe)")
print("  - <style id=responsive-base> in <head>: overflow-x kill + word-wrap")
print("  - <script id=responsive-runtime> after </x-dc>: runtime remap")
print("  - removed old dead <style id=responsive-overrides> block")
print("  - file size:", len(html_new), "bytes")
