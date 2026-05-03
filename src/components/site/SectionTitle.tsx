export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <span className="h-px w-10 bg-gold/60" />
      <span className="text-xs uppercase tracking-[0.4em] text-gold">{children}</span>
      <span className="h-px w-10 bg-gold/60" />
    </div>
  );
}

export function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`font-display text-4xl md:text-5xl lg:text-6xl text-center leading-[1.05] ${className}`}>
      {children}
    </h2>
  );
}
