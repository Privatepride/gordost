import { useEffect, useRef } from "react";

const isTouchDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export function useMagnetic(radius = 80, pull = 8) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // На тач-устройствах «магнитный» эффект не нужен и мешает тапам.
    if (isTouchDevice()) return;

    el.style.transition = "transform 0.3s ease-out";

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        const factor = 1 - dist / radius;
        el.style.transform = `translate(${dx * factor * (pull / radius)}px, ${dy * factor * (pull / radius)}px)`;
      } else {
        el.style.transform = "";
      }
    };

    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [radius, pull]);

  return ref;
}
