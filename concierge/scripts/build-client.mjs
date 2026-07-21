#!/usr/bin/env node
/**
 * Сборка клиента одним IIFE без type="module" — Telegram Desktop WebView
 * часто не отрисовывает Vite/React как ES module, при этом mini-bare и tg-web-app работают.
 */
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const entry = path.join(root, "src", "main.tsx");
const publicDir = path.join(root, "public");
const buildStamp = Date.now().toString();

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  outfile: path.join(dist, "concierge.js"),
  format: "iife",
  platform: "browser",
  target: ["es2018"],
  jsx: "automatic",
  minify: true,
  loader: {
    ".ts": "tsx",
    ".tsx": "tsx",
    ".woff2": "file",
    ".woff": "file",
  },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});

const indexHtml = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#121721" />
    <title>Гордость — консьерж</title>
    <link rel="stylesheet" href="/design.css" />
    <script src="/tg-web-app.js"></script>
    <script>
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.ready();
        }
      } catch (e) {}
    </script>
    <link rel="stylesheet" href="/concierge.css" />
  </head>
  <body>
    <div id="root">
      <p style="margin:0;padding:24px 16px;font:300 16px/1.45 Manrope,system-ui,sans-serif;color:#CBD1DD;text-align:center">Загрузка…</p>
    </div>
    <script src="/concierge.js"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(dist, "index.html"), indexHtml, "utf8");

for (const name of ["tg-web-app.js", "mini-bare.html", "design.css"]) {
  const src = path.join(publicDir, name);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dist, name));
  }
}

for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const name = entry.name;
  if (name === "tg-web-app.js" || name === "mini-bare.html" || name === "design.css") continue;
  fs.copyFileSync(path.join(publicDir, name), path.join(dist, name));
}

const fontsDir = path.join(publicDir, "fonts");
if (fs.existsSync(fontsDir)) {
  fs.cpSync(fontsDir, path.join(dist, "fonts"), { recursive: true });
}

const usefulDir = path.join(publicDir, "useful");
if (fs.existsSync(usefulDir)) {
  fs.cpSync(usefulDir, path.join(dist, "useful"), { recursive: true });
}

console.log("client build → dist/ (concierge.js + concierge.css + index.html)");
