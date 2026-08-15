import { useEffect, useRef } from "react";

/**
 * Défilement horizontal par glisser (souris, toucher, appui long),
 * sans rail de glissement visible.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let active = false;
    let startX = 0;
    let base = 0;

    const down = (e: PointerEvent) => {
      active = true;
      startX = e.clientX;
      base = el.scrollLeft;
      el.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) el.classList.add("is-swiping");
      el.scrollLeft = base - dx;
    };
    const up = (e: PointerEvent) => {
      active = false;
      el.releasePointerCapture?.(e.pointerId);
      window.setTimeout(() => el.classList.remove("is-swiping"), 40);
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  return ref;
}

export default useDragScroll;
