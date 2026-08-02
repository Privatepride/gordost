(function () {
  "use strict";

  if (window.__gordostCookieConsentLoaded) return;
  window.__gordostCookieConsentLoaded = true;

  var COOKIE_NAME = "gordost_cookie_consent";
  var COOKIE_VERSION = "v1";
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
  var host;
  var shadow;
  var banner;
  var launcher;
  var title;
  var acceptButton;

  function getConsent() {
    var prefix = COOKIE_NAME + "=";
    var parts = document.cookie ? document.cookie.split(";") : [];

    for (var i = 0; i < parts.length; i += 1) {
      var part = parts[i].trim();
      if (part.indexOf(prefix) !== 0) continue;

      var value = decodeURIComponent(part.slice(prefix.length));
      if (value === COOKIE_VERSION + ".all") return "all";
      if (value === COOKIE_VERSION + ".necessary") return "necessary";
    }

    return null;
  }

  function saveConsent(level) {
    document.cookie =
      COOKIE_NAME +
      "=" +
      encodeURIComponent(COOKIE_VERSION + "." + level) +
      "; Path=/; Max-Age=" +
      COOKIE_MAX_AGE +
      "; SameSite=Lax; Secure";
  }

  function activateDeferredScripts(category) {
    var selector =
      'script[type="text/plain"][data-cookie-category="' +
      category +
      '"]:not([data-cookie-activated])';

    document.querySelectorAll(selector).forEach(function (blockedScript) {
      var activeScript = document.createElement("script");

      Array.from(blockedScript.attributes).forEach(function (attribute) {
        if (
          attribute.name !== "type" &&
          attribute.name !== "data-cookie-category" &&
          attribute.name !== "data-cookie-activated"
        ) {
          activeScript.setAttribute(attribute.name, attribute.value);
        }
      });

      activeScript.setAttribute("data-cookie-activated", "true");
      activeScript.text = blockedScript.text;
      blockedScript.parentNode.insertBefore(activeScript, blockedScript.nextSibling);
      blockedScript.setAttribute("data-cookie-activated", "true");
    });
  }

  function applyConsent(level) {
    document.documentElement.setAttribute("data-cookie-consent", level);

    if (level === "all") {
      activateDeferredScripts("analytics");
    }

    window.dispatchEvent(
      new CustomEvent("gordost:cookie-consent", {
        detail: {
          analytics: level === "all",
          necessary: true,
          level: level,
          version: COOKIE_VERSION,
        },
      }),
    );
  }

  function showBanner(isSettings) {
    if (!banner || !launcher) return;
    title.textContent = isSettings ? "Настройки cookie" : "Мы используем cookie";
    banner.hidden = false;
    launcher.hidden = true;

    if (isSettings) {
      window.setTimeout(function () {
        acceptButton.focus();
      }, 0);
    }
  }

  function hideBanner() {
    if (!banner || !launcher) return;
    banner.hidden = true;
    launcher.hidden = false;
  }

  function choose(level) {
    saveConsent(level);
    applyConsent(level);
    hideBanner();
  }

  function mount() {
    if (document.getElementById("gordost-cookie-consent")) return;

    host = document.createElement("div");
    host.id = "gordost-cookie-consent";
    document.body.appendChild(host);
    shadow = host.attachShadow({ mode: "open" });

    shadow.innerHTML =
      '<style>' +
      ":host{--gcc-bg:#111720;--gcc-panel:#171e28;--gcc-text:#f4efe7;--gcc-muted:#c7c1b8;--gcc-gold:#d9b08c;--gcc-gold-dark:#241b15;position:relative;z-index:2147483000;font-family:Manrope,Inter,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif}" +
      "*,*::before,*::after{box-sizing:border-box}" +
      "[hidden]{display:none!important}" +
      ".gcc-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;margin:0 auto;max-width:1120px;padding:18px 20px;border:1px solid rgba(217,176,140,.32);border-radius:18px;background:linear-gradient(145deg,rgba(25,33,44,.98),rgba(14,19,27,.99));box-shadow:0 18px 60px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.04);color:var(--gcc-text);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}" +
      ".gcc-inner{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:center}" +
      ".gcc-copy{min-width:0}" +
      ".gcc-kicker{display:flex;align-items:center;gap:10px;margin:0 0 7px;font-family:Georgia,\"Times New Roman\",serif;font-size:18px;font-weight:600;line-height:1.2;letter-spacing:.01em;color:var(--gcc-text)}" +
      ".gcc-mark{display:inline-block;width:22px;height:1px;background:var(--gcc-gold);box-shadow:0 0 12px rgba(217,176,140,.48)}" +
      ".gcc-text{max-width:720px;margin:0;color:var(--gcc-muted);font-size:13px;line-height:1.55}" +
      ".gcc-text a{color:var(--gcc-gold);text-decoration:underline;text-decoration-color:rgba(217,176,140,.5);text-underline-offset:3px}" +
      ".gcc-text a:hover{color:#f0cfaf;text-decoration-color:currentColor}" +
      ".gcc-actions{display:flex;gap:10px;align-items:center;justify-content:flex-end}" +
      ".gcc-button{min-height:44px;padding:11px 18px;border-radius:999px;border:1px solid rgba(217,176,140,.55);font:600 11px/1.2 Manrope,Inter,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;cursor:pointer;transition:transform .18s ease,background-color .18s ease,border-color .18s ease,color .18s ease,box-shadow .18s ease}" +
      ".gcc-button:focus-visible,.gcc-launcher:focus-visible,.gcc-text a:focus-visible{outline:2px solid #fff;outline-offset:3px}" +
      ".gcc-button:active{transform:scale(.98)}" +
      ".gcc-primary{background:var(--gcc-gold);border-color:var(--gcc-gold);color:var(--gcc-gold-dark);box-shadow:0 8px 26px rgba(217,176,140,.14)}" +
      ".gcc-primary:hover{background:#e6c19f;border-color:#e6c19f;box-shadow:0 10px 30px rgba(217,176,140,.25)}" +
      ".gcc-secondary{background:transparent;color:var(--gcc-text)}" +
      ".gcc-secondary:hover{background:rgba(217,176,140,.09);border-color:var(--gcc-gold)}" +
      ".gcc-launcher{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:8px 12px;border:1px solid rgba(217,176,140,.42);border-radius:999px;background:rgba(17,23,32,.94);box-shadow:0 8px 28px rgba(0,0,0,.3);color:#eee8df;font:600 10px/1 Manrope,Inter,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:border-color .18s ease,background-color .18s ease,transform .18s ease}" +
      ".gcc-launcher:hover{border-color:var(--gcc-gold);background:var(--gcc-panel)}" +
      ".gcc-launcher:active{transform:scale(.98)}" +
      ".gcc-dot{width:7px;height:7px;border-radius:50%;background:var(--gcc-gold);box-shadow:0 0 10px rgba(217,176,140,.55)}" +
      "@media(max-width:760px){.gcc-banner{left:10px;right:10px;bottom:10px;padding:18px 16px;border-radius:16px}.gcc-inner{grid-template-columns:1fr;gap:16px}.gcc-kicker{font-size:17px}.gcc-text{font-size:12.5px}.gcc-actions{display:grid;grid-template-columns:1fr;gap:8px}.gcc-button{width:100%;min-height:46px}.gcc-launcher{left:10px;bottom:10px}}" +
      "@media(prefers-reduced-motion:no-preference){.gcc-banner{animation:gcc-in .35s cubic-bezier(.22,1,.36,1)}@keyframes gcc-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}}" +
      "@media(prefers-reduced-motion:reduce){.gcc-button,.gcc-launcher{transition:none}}" +
      "</style>" +
      '<section class="gcc-banner" role="dialog" aria-live="polite" aria-labelledby="gcc-title">' +
      '<div class="gcc-inner">' +
      '<div class="gcc-copy">' +
      '<h2 class="gcc-kicker" id="gcc-title"><span class="gcc-mark" aria-hidden="true"></span><span>Мы используем cookie</span></h2>' +
      '<p class="gcc-text">Необходимые cookie обеспечивают работу сайта. Аналитические cookie помогают нам улучшать сервис и включаются только с вашего согласия. <a href="/privacy">Подробнее в политике конфиденциальности</a>.</p>' +
      "</div>" +
      '<div class="gcc-actions">' +
      '<button class="gcc-button gcc-primary" type="button" data-gcc-action="all">Принять все</button>' +
      '<button class="gcc-button gcc-secondary" type="button" data-gcc-action="necessary">Только необходимые</button>' +
      "</div>" +
      "</div>" +
      "</section>" +
      '<button class="gcc-launcher" type="button" aria-label="Открыть настройки cookie" title="Настройки cookie" hidden>' +
      '<span class="gcc-dot" aria-hidden="true"></span><span>Cookie</span>' +
      "</button>";

    banner = shadow.querySelector(".gcc-banner");
    launcher = shadow.querySelector(".gcc-launcher");
    title = shadow.querySelector("#gcc-title span:last-child");
    acceptButton = shadow.querySelector('[data-gcc-action="all"]');

    acceptButton.addEventListener("click", function () {
      choose("all");
    });

    shadow
      .querySelector('[data-gcc-action="necessary"]')
      .addEventListener("click", function () {
        choose("necessary");
      });

    launcher.addEventListener("click", function () {
      showBanner(true);
    });

    var consent = getConsent();
    if (consent) {
      applyConsent(consent);
      hideBanner();
    } else {
      showBanner(false);
    }
  }

  window.GordostCookieConsent = {
    get: getConsent,
    open: function () {
      if (!host) mount();
      showBanner(true);
    },
    reset: function () {
      document.cookie =
        COOKIE_NAME +
        "=; Path=/; Max-Age=0; SameSite=Lax; Secure";
      document.documentElement.removeAttribute("data-cookie-consent");
      showBanner(false);
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
