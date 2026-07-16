import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function MagneticButton({ children, className = "", ...props }: Props) {
  const ref = useMagnetic(80, 8);
  return (
    <button
      ref={ref}
      data-magnetic
      className={className}
      style={{ willChange: "transform" }}
      {...props}
    >
      {children}
    </button>
  );
}
