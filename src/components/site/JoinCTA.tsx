type Variant = "solid" | "outline" | "minimal" | "banner" | "split";

interface Props {
  variant?: Variant;
  eyebrow?: string;
  title?: string;
  text?: string;
  cta?: string;
}

export function JoinCTA({
  variant = "solid",
  eyebrow,
  title,
  text,
  cta = "Стать резидентом",
}: Props) {
  if (variant === "minimal") {
    return (
      <div className="container-prose py-16 text-center">
        <a
          href="#join"
          className="inline-flex items-center gap-3 text-gold uppercase tracking-[0.3em] text-sm border-b border-gold/40 pb-2 hover:border-gold transition-colors"
        >
          {cta} <span className="text-lg">→</span>
        </a>
      </div>
    );
  }

  if (variant === "outline") {
    return (
      <div className="container-prose py-20">
        <div className="border border-gold/40 p-10 md:p-14 text-center">
          {eyebrow && (
            <div className="text-xs uppercase tracking-[0.4em] text-gold mb-4">
              {eyebrow}
            </div>
          )}
          {title && (
            <h3 className="font-display text-3xl md:text-4xl mb-6">{title}</h3>
          )}
          {text && (
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">{text}</p>
          )}
          <a
            href="#join"
            className="inline-flex items-center gap-3 px-8 py-4 border border-gold text-gold uppercase tracking-[0.2em] text-sm hover:bg-gold hover:text-primary-foreground transition-colors"
          >
            {cta} <span>→</span>
          </a>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="container-prose py-20">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/15 via-gold/5 to-transparent" />
          <div className="absolute inset-0 border border-gold/30" />
          <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              {eyebrow && (
                <div className="text-xs uppercase tracking-[0.4em] text-gold mb-3">
                  {eyebrow}
                </div>
              )}
              {title && (
                <h3 className="font-display text-3xl md:text-4xl leading-tight">
                  {title}
                </h3>
              )}
              {text && (
                <p className="text-muted-foreground mt-3">{text}</p>
              )}
            </div>
            <a
              href="#join"
              className="shrink-0 inline-flex items-center gap-3 px-8 py-4 bg-gold text-primary-foreground uppercase tracking-[0.2em] text-sm font-medium hover:gap-5 transition-all"
            >
              {cta} <span>→</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "split") {
    return (
      <div className="container-prose py-24">
        <div className="grid md:grid-cols-2 gap-px bg-border">
          <div className="bg-background p-10 md:p-12">
            {eyebrow && (
              <div className="text-xs uppercase tracking-[0.4em] text-gold mb-4">
                {eyebrow}
              </div>
            )}
            <h3 className="font-display text-3xl md:text-4xl leading-tight">
              {title}
            </h3>
          </div>
          <div className="bg-card p-10 md:p-12 flex flex-col justify-between gap-6">
            {text && <p className="text-muted-foreground">{text}</p>}
            <a
              href="#join"
              className="self-start inline-flex items-center gap-3 text-gold uppercase tracking-[0.2em] text-sm border-b border-gold pb-2 hover:gap-5 transition-all"
            >
              {cta} <span>→</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // solid (default)
  return (
    <div className="container-prose py-24 text-center">
      {eyebrow && (
        <div className="text-xs uppercase tracking-[0.4em] text-gold mb-5">
          {eyebrow}
        </div>
      )}
      {title && (
        <h3 className="font-display text-3xl md:text-5xl mb-6 max-w-2xl mx-auto leading-tight">
          {title}
        </h3>
      )}
      {text && (
        <p className="text-muted-foreground max-w-xl mx-auto mb-10">{text}</p>
      )}
      <a
        href="#join"
        className="inline-flex items-center gap-3 px-10 py-5 bg-gold text-primary-foreground uppercase tracking-[0.2em] text-sm font-medium hover:gap-5 transition-all"
      >
        {cta} <span>→</span>
      </a>
    </div>
  );
}
