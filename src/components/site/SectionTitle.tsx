type Align = "center" | "left";

export function SectionLabel({
  children,
  align = "center",
  className = "",
}: {
  children: React.ReactNode;
  align?: Align;
  className?: string;
}) {
  if (align === "left") {
    return (
      <div className={`flex items-center gap-3 mb-6 ${className}`}>
        <span className="h-px w-10 shrink-0 bg-gold" />
        <span className="text-xs uppercase tracking-[0.35em] text-gold">{children}</span>
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center gap-4 mb-6 ${className}`}>
      <span className="h-px w-10 bg-gold/60" />
      <span className="text-xs uppercase tracking-[0.4em] text-gold">{children}</span>
      <span className="h-px w-10 bg-gold/60" />
    </div>
  );
}

export function SectionTitle({
  children,
  className = "",
  align = "center",
}: {
  children: React.ReactNode;
  className?: string;
  align?: Align;
}) {
  const alignClass = align === "left" ? "text-left" : "text-center";
  return (
    <h2
      className={`font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] ${alignClass} ${className}`}
    >
      {children}
    </h2>
  );
}
