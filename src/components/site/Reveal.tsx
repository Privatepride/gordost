import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface Props {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export function Reveal({ children, className = "", stagger = false }: Props) {
  const { ref, isVisible } = useReveal(0.15);
  return (
    <div
      ref={ref}
      className={`reveal-section ${isVisible ? "is-visible" : ""} ${stagger ? "reveal-stagger" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
