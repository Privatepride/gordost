import { useEffect, useState } from "react";
import logo from "@/assets/logo.jpg";

const links = [
  { href: "#about", label: "О клубе" },
  { href: "#forum", label: "Форум" },
  { href: "#ecosystem", label: "Экосистема" },
  { href: "#focus", label: "Инвестиции" },
  { href: "#digital", label: "Консьерж" },
  { href: "#join", label: "Вступить" },
];

const pillClass =
  "rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-background/40 backdrop-blur-sm"
      }`}
    >
      <div className="container-prose">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <a href="#top" className="flex min-w-0 items-center gap-3 shrink-0">
            <img src={logo} alt="ГОРДОСТЬ" className="h-9 w-9 rounded-full object-cover ring-1 ring-gold/20" />
            <span className="font-display text-xl sm:text-2xl tracking-[0.28em] gold-gradient truncate">
              ГОРДОСТЬ
            </span>
          </a>

          <nav className="hidden lg:flex flex-1 justify-center items-center gap-2 max-w-3xl mx-4 flex-wrap">
            {links.map((l) => (
              <a key={l.href} href={l.href} className={pillClass}>
                {l.label}
              </a>
            ))}
          </nav>

          <a
            href="#join"
            className="hidden lg:inline-flex shrink-0 items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-primary-foreground text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
          >
            Заявка
          </a>

          <button
            aria-label="Меню"
            className="lg:hidden rounded-full border border-border p-2.5 text-gold"
            onClick={() => setOpen((s) => !s)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M4 7h16" strokeLinecap="round" />
                  <path d="M4 17h16" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="container-prose py-5 flex flex-col gap-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`${pillClass} text-center justify-center`}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#join"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center items-center rounded-full bg-gold px-6 py-3 text-primary-foreground text-[11px] uppercase tracking-[0.2em]"
            >
              Заявка
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
