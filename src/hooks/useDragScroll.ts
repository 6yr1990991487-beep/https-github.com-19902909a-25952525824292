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
    let moved = false;

    const down = (e: PointerEvent) => {
      active = true;
      moved = false;
      startX = e.clientX;
      base = el.scrollLeft;
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6 && !moved) {
        moved = true;
        el.classList.add("is-swiping");
        // On ne capture le pointeur qu'une fois le glissement réel démarré,
        // sinon les clics sur les liens ne se déclenchent jamais.
        el.setPointerCapture?.(e.pointerId);
      }
      if (!moved) return;
      el.scrollLeft = base - dx;
    };
    const up = (e: PointerEvent) => {
      active = false;
      try {
        if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      window.setTimeout(() => el.classList.remove("is-swiping"), 40);
    };
    const click = (e: MouseEvent) => {
      if (el.classList.contains("is-swiping")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
    };
  }, []);

  return ref;
}

export default useDragScroll;
