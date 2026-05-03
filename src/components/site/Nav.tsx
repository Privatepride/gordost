import { useEffect, useState } from "react";

const links = [
  { href: "#about", label: "О клубе" },
  { href: "#forum", label: "Форум-группы" },
  { href: "#ecosystem", label: "Экосистема" },
  { href: "#focus", label: "Инвестиции" },
  { href: "#digital", label: "OpenClaw" },
  { href: "#join", label: "Вступить" },
];

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
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-prose flex items-center justify-between h-20">
        <a href="#top" className="flex items-center gap-3">
          <span className="font-display text-2xl tracking-[0.3em] text-gold">ГОРДОСТЬ</span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-gold transition-colors uppercase tracking-wider"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#join"
          className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 border border-gold text-gold text-sm uppercase tracking-widest hover:bg-gold hover:text-primary-foreground transition-colors"
        >
          Стать резидентом
        </a>

        <button
          aria-label="Меню"
          className="lg:hidden text-gold"
          onClick={() => setOpen((s) => !s)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="container-prose py-6 flex flex-col gap-5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base text-foreground/90 hover:text-gold uppercase tracking-wider"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#join"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center items-center px-5 py-3 border border-gold text-gold uppercase tracking-widest text-sm"
            >
              Стать резидентом
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
