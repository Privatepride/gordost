import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
/* Self-hosted: мобильный WebView Telegram часто не грузит fonts.googleapis.com */
import "@fontsource/manrope/cyrillic-300.css";
import "@fontsource/manrope/latin-300.css";
import "@fontsource/manrope/cyrillic-400.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/cyrillic-500.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/cyrillic-600.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/cinzel/latin-400.css";
import "@fontsource/cinzel/latin-600.css";
import "@fontsource/noto-serif/cyrillic-400.css";
import "@fontsource/noto-serif/latin-400.css";
import "@fontsource/noto-serif/cyrillic-600.css";
import "@fontsource/noto-serif/latin-600.css";
import "./ui.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root missing");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
