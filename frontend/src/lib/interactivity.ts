/**
 * Global site-wide interactivity layer for Lovanet.
 * Import once (see index) and it enhances EVERY page automatically:
 *
 *  1. Cursor spotlight — an intelligent light overlay that follows the pointer
 *     and layers over the whole UI (smart superposition).
 *  2. Auto 3D tilt — card-like elements get the `.tilt-card` 3D perspective.
 *  3. Magnetic buttons — buttons/CTAs gently pull toward the cursor.
 *  4. Scroll reveal — sections & cards fade/slide in as they enter the viewport.
 *  5. Parallax glow — decorative blur orbs drift with the pointer for depth.
 *
 * Everything degrades gracefully with `prefers-reduced-motion` and a safety
 * timeout that force-reveals content so nothing can stay hidden.
 */

let initialized = false;

export function initInteractivity() {
  if (initialized || typeof window === "undefined" || typeof document === "undefined") return;
  initialized = true;

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;

  const start = () => {
    setupSpotlight(reduce || coarse);
    setupParallax(reduce || coarse);
    setupEnhancer(reduce, coarse);
  };

  if (document.body) start();
  else window.addEventListener("DOMContentLoaded", start, { once: true });
}

/* ------------------------------------------------------------------ *
 * 1 & 5) Cursor spotlight + parallax pointer tracking (shared rAF)
 * ------------------------------------------------------------------ */
let pointerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
let pointerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
let smoothX = pointerX;
let smoothY = pointerY;
let ticking = false;

function setupSpotlight(disabled: boolean) {
  const spot = document.createElement("div");
  spot.className = "fx-cursor-spotlight";
  spot.setAttribute("aria-hidden", "true");
  document.body.appendChild(spot);

  if (disabled) {
    spot.style.display = "none";
    return;
  }

  document.body.classList.add("fx-has-cursor");

  const loop = () => {
    smoothX += (pointerX - smoothX) * 0.16;
    smoothY += (pointerY - smoothY) * 0.16;
    spot.style.setProperty("--fx-x", `${smoothX}px`);
    spot.style.setProperty("--fx-y", `${smoothY}px`);
    // drive global parallax vars too
    const nx = (smoothX / window.innerWidth - 0.5) * 2;
    const ny = (smoothY / window.innerHeight - 0.5) * 2;
    document.documentElement.style.setProperty("--fx-parallax-x", nx.toFixed(3));
    document.documentElement.style.setProperty("--fx-parallax-y", ny.toFixed(3));

    if (Math.abs(pointerX - smoothX) > 0.4 || Math.abs(pointerY - smoothY) > 0.4) {
      requestAnimationFrame(loop);
    } else {
      ticking = false;
    }
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      spot.style.opacity = "1";
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(loop);
      }
    },
    { passive: true }
  );

  window.addEventListener("pointerdown", () => spot.classList.add("fx-pulse"), { passive: true });
  window.addEventListener("pointerup", () => spot.classList.remove("fx-pulse"), { passive: true });
  document.addEventListener("mouseleave", () => (spot.style.opacity = "0"));
}

function setupParallax(disabled: boolean) {
  if (disabled) return;
  // Handled via shared vars in the spotlight loop; nothing extra needed here,
  // CSS consumes --fx-parallax-x / --fx-parallax-y on `.fx-parallax` elements.
}

/* ------------------------------------------------------------------ *
 * 2, 3, 4) Auto-enhance cards / buttons / sections (+ new DOM nodes)
 * ------------------------------------------------------------------ */
function setupEnhancer(reduce: boolean, coarse: boolean) {
  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries, obs) => {
            for (const en of entries) {
              if (en.isIntersecting) {
                en.target.classList.add("fx-in");
                obs.unobserve(en.target);
              }
            }
          },
          { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
        )
      : null;

  const CARD_SELECTOR =
    '[data-testid*="card" i], [class*="portal-card"], [class*="product-card"], article';

  const BUTTON_SELECTOR =
    'button, a[data-testid*="cta" i], [data-testid*="button" i], [role="button"]';

  const skipTilt = reduce || coarse;

  const enhance = (root: ParentNode) => {
    // Cards → 3D tilt + reveal
    root.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach((el) => {
      if (el.dataset.fxCard) return;
      el.dataset.fxCard = "1";
      if (!skipTilt) {
        const r = el.getBoundingClientRect();
        // Only genuine "card" sized boxes — avoid tilting huge shells or tiny chips.
        if (r.width >= 130 && r.width <= 640 && r.height >= 90 && r.height <= 620) {
          el.classList.add("tilt-card");
        }
      }
      if (io) {
        el.classList.add("fx-reveal");
        io.observe(el);
      }
    });

    // Buttons / CTAs → magnetic pull
    if (!skipTilt) {
      root.querySelectorAll<HTMLElement>(BUTTON_SELECTOR).forEach((el) => {
        if (el.dataset.fxBtn) return;
        el.dataset.fxBtn = "1";
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.width < 360 && r.height < 120) {
          el.classList.add("btn-magnetic");
        }
      });
    }

    // Top-level sections → soft reveal
    if (io) {
      root.querySelectorAll<HTMLElement>("section").forEach((el) => {
        if (el.dataset.fxSec) return;
        el.dataset.fxSec = "1";
        el.classList.add("fx-reveal-soft");
        io.observe(el);
      });
    }
  };

  enhance(document);

  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType === 1) enhance(n as Element);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // Safety net: if anything blocks the observer, force everything visible.
  window.setTimeout(() => {
    document
      .querySelectorAll(".fx-reveal, .fx-reveal-soft")
      .forEach((el) => el.classList.add("fx-in"));
  }, 1600);
}
