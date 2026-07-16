type Variant = "solid" | "outline" | "minimal" | "banner" | "split";

interface Props {
  variant?: Variant;
  eyebrow?: string;
  title?: string;
  text?: string;
  cta?: string;
  onOpenJoin?: () => void;
}

// Общие классы для «приподнятых» CTA — крупный тач-таргет, hover-glow, active-press.
const solidBtn =
  "group inline-flex items-center gap-3 rounded-full bg-gold px-10 py-4 md:py-5 text-primary-foreground " +
  "uppercase tracking-[0.2em] text-sm font-medium transition-all duration-300 " +
  "hover:shadow-[0_0_40px_rgba(221,201,169,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

export function JoinCTA({
  variant = "solid",
  eyebrow,
  title,
  text,
  cta = "Стать резидентом",
  onOpenJoin,
}: Props) {
  if (variant === "minimal") {
    return (
      <div className="container-prose py-16 text-center">
        <button
          type="button"
          onClick={onOpenJoin}
          className="group inline-flex items-center gap-3 rounded-full text-gold uppercase tracking-[0.3em] text-sm border border-gold/40 px-6 py-4 hover:bg-gold/10 hover:border-gold transition-all active:scale-[0.98] bg-transparent"
        >
          {cta} <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    );
  }

  if (variant === "outline") {
    return (
      <div className="container-prose py-20">
        <div className="border border-gold/40 p-10 md:p-14 text-center">
          {eyebrow && (
            <div className="text-xs uppercase tracking-[0.4em] text-gold mb-4">{eyebrow}</div>
          )}
          {title && <h3 className="font-display text-3xl md:text-4xl mb-6">{title}</h3>}
          {text && <p className="text-muted-foreground max-w-xl mx-auto mb-8">{text}</p>}
          <button
            type="button"
            onClick={onOpenJoin}
            className="group inline-flex items-center gap-3 rounded-full px-8 py-4 border border-gold text-gold uppercase tracking-[0.2em] text-sm transition-all hover:bg-gold hover:text-primary-foreground active:scale-[0.98] bg-transparent"
          >
            {cta} <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="container-prose py-20">
        <div className="relative overflow-hidden rounded-[2rem]">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/15 via-gold/5 to-transparent" />
          <div className="absolute inset-0 border border-gold/30 rounded-[2rem]" />
          <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              {eyebrow && (
                <div className="text-xs uppercase tracking-[0.4em] text-gold mb-3">{eyebrow}</div>
              )}
              {title && (
                <h3 className="font-display text-3xl md:text-4xl leading-tight">{title}</h3>
              )}
              {text && <p className="text-muted-foreground mt-3">{text}</p>}
            </div>
            <button
              type="button"
              onClick={onOpenJoin}
              className="group shrink-0 inline-flex items-center gap-3 rounded-full px-8 py-4 bg-gold text-primary-foreground uppercase tracking-[0.2em] text-sm font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(221,201,169,0.35)] hover:gap-5 active:scale-[0.98]"
            >
              {cta} <span>→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "split") {
    return (
      <div className="container-prose py-24">
        <div className="grid md:grid-cols-2 gap-px bg-border rounded-[2rem] overflow-hidden">
          <div className="bg-background p-10 md:p-12">
            {eyebrow && (
              <div className="text-xs uppercase tracking-[0.4em] text-gold mb-4">{eyebrow}</div>
            )}
            <h3 className="font-display text-3xl md:text-4xl leading-tight">{title}</h3>
          </div>
          <div className="bg-card p-10 md:p-12 flex flex-col justify-between gap-6">
            {text && <p className="text-muted-foreground">{text}</p>}
            <button
              type="button"
              onClick={onOpenJoin}
              className="group self-start inline-flex items-center gap-3 rounded-full text-gold uppercase tracking-[0.2em] text-sm border border-gold/40 px-6 py-3.5 hover:bg-gold/10 hover:border-gold transition-all active:scale-[0.98] bg-transparent"
            >
              {cta} <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // solid (default)
  return (
    <div className="container-prose py-24 text-center">
      {eyebrow && (
        <div className="text-xs uppercase tracking-[0.4em] text-gold mb-5">{eyebrow}</div>
      )}
      {title && (
        <h3 className="font-display text-3xl md:text-5xl mb-6 max-w-2xl mx-auto leading-tight">
          {title}
        </h3>
      )}
      {text && <p className="text-muted-foreground max-w-xl mx-auto mb-10">{text}</p>}
      <button type="button" onClick={onOpenJoin} className={solidBtn}>
        {cta} <span className="transition-transform group-hover:translate-x-1">→</span>
      </button>
    </div>
  );
}
