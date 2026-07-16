import type { ReactNode } from "react";
import { useTilt } from "@/hooks/useTilt";

interface Props {
  children: ReactNode;
  className?: string;
}

export function TiltCard({ children, className = "" }: Props) {
  const ref = useTilt(3);
  return (
    <div ref={ref} data-tilt className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
