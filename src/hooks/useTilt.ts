import { useEffect, useRef, useCallback } from "react";

export function useTilt(maxDeg = 3) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateX(${-y * maxDeg}deg) rotateY(${x * maxDeg}deg)`;
    },
    [maxDeg],
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 3D-наклон не имеет смысла и мешает на тач-устройствах.
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    el.style.transition = "transform 0.2s ease-out";
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [handleMove, handleLeave]);

  return ref;
}
