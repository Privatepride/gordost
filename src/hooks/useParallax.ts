import { useEffect, useRef } from "react";

export function useParallax(speed = 0.35) {
  const ref = useRef<HTMLImageElement>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const el = ref.current;
        if (el) {
          const y = window.scrollY * speed;
          el.style.transform = `translateY(${y}px)`;
        }
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return ref;
}
