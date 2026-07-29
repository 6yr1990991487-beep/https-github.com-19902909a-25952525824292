/**
 * Global, delegated pointer tracking for `.tilt-card` and `.btn-magnetic`.
 * No per-component listeners — just import once and forget.
 *
 * - `.tilt-card`  → sets --tilt-rx/--tilt-ry/--tilt-mx/--tilt-my from cursor
 * - `.btn-magnetic` → sets --mag-x/--mag-y to gently pull toward cursor
 */

const MAX_TILT = 12; // degrees
const LIFT = -8;     // px
const MAG_STRENGTH = 0.25; // 0..1 — share of distance the button follows
const MAG_MAX = 14;        // px clamp

let initialized = false;

export function initTilt3D() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Respect reduced motion
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  document.addEventListener(
    "pointermove",
    (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tilt = target.closest<HTMLElement>(".tilt-card");
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;  // 0..1
        const py = (e.clientY - r.top) / r.height;  // 0..1
        const ry = (px - 0.5) * 2 * MAX_TILT;       // left/right
        const rx = -(py - 0.5) * 2 * MAX_TILT;      // up/down
        tilt.classList.add("tilting");
        tilt.style.setProperty("--tilt-rx", `${rx.toFixed(2)}deg`);
        tilt.style.setProperty("--tilt-ry", `${ry.toFixed(2)}deg`);
        tilt.style.setProperty("--tilt-mx", `${(px * 100).toFixed(1)}%`);
        tilt.style.setProperty("--tilt-my", `${(py * 100).toFixed(1)}%`);
        tilt.style.setProperty("--tilt-lift", `${LIFT}px`);
      }

      const mag = target.closest<HTMLElement>(".btn-magnetic");
      if (mag) {
        const r = mag.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) * MAG_STRENGTH;
        const dy = (e.clientY - cy) * MAG_STRENGTH;
        const clamp = (v: number) => Math.max(-MAG_MAX, Math.min(MAG_MAX, v));
        mag.style.setProperty("--mag-x", `${clamp(dx).toFixed(2)}px`);
        mag.style.setProperty("--mag-y", `${clamp(dy).toFixed(2)}px`);
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerout",
    (e) => {
      const tilt = (e.target as HTMLElement | null)?.closest<HTMLElement>(".tilt-card");
      if (tilt && !tilt.contains(e.relatedTarget as Node)) {
        tilt.classList.remove("tilting");
        tilt.style.removeProperty("--tilt-rx");
        tilt.style.removeProperty("--tilt-ry");
        tilt.style.removeProperty("--tilt-lift");
      }
      const mag = (e.target as HTMLElement | null)?.closest<HTMLElement>(".btn-magnetic");
      if (mag && !mag.contains(e.relatedTarget as Node)) {
        mag.style.setProperty("--mag-x", "0px");
        mag.style.setProperty("--mag-y", "0px");
      }
    },
    { passive: true }
  );
}