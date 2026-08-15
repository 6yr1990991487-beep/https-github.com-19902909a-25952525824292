/**
 * Déplacement universel des panneaux de bulles (dock) au toucher ou à l'appui long.
 * - Glisser depuis l'en-tête du panneau : immédiat.
 * - Appui long (380 ms) n'importe où dans le panneau : démarre le déplacement.
 * La position est mémorisée par panneau (localStorage) et réappliquée sur
 * toutes les pages, sur mobile comme sur PC.
 */

const SELECTOR = ".detached-bubble-panel, .theme-dock-panel, .dock-popup";
const STORE = "lovanet.panelpos.v1";
const LONG_PRESS_MS = 380;

type Pos = { x: number; y: number };

const readStore = (): Record<string, Pos> => {
  try {
    return JSON.parse(localStorage.getItem(STORE) || "{}");
  } catch {
    return {};
  }
};

const writeStore = (store: Record<string, Pos>) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(store));
  } catch {
    /* ignore */
  }
};

const keyOf = (el: HTMLElement) =>
  el.dataset.panelKey ||
  el.getAttribute("aria-label") ||
  Array.from(el.classList)
    .filter((c) => c.includes("panel") || c.includes("popup"))
    .join("-") ||
  "panel";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const applyPos = (el: HTMLElement, pos: Pos) => {
  const rect = el.getBoundingClientRect();
  const x = clamp(pos.x, 4, Math.max(4, window.innerWidth - rect.width - 4));
  const y = clamp(pos.y, 4, Math.max(4, window.innerHeight - rect.height - 4));
  el.style.position = "fixed";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.right = "auto";
  el.style.bottom = "auto";
  el.style.transform = "none";
  el.style.animation = "none";
  el.dataset.dragged = "true";
};

const restore = (el: HTMLElement) => {
  const pos = readStore()[keyOf(el)];
  if (pos) requestAnimationFrame(() => applyPos(el, pos));
};

export const initPanelDrag = () => {
  if (typeof window === "undefined" || (window as any).__lovanetPanelDrag) return;
  (window as any).__lovanetPanelDrag = true;

  // Réapplique les positions mémorisées dès qu'un panneau est monté.
  const observer = new MutationObserver((records) => {
    records.forEach((r) =>
      r.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        if (n.matches?.(SELECTOR)) restore(n);
        n.querySelectorAll?.(SELECTOR).forEach((c) => restore(c as HTMLElement));
      }),
    );
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll(SELECTOR).forEach((el) => restore(el as HTMLElement));

  let panel: HTMLElement | null = null;
  let timer: number | null = null;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;

  const stopTimer = () => {
    if (timer) window.clearTimeout(timer);
    timer = null;
  };

  const begin = () => {
    if (!panel) return;
    dragging = true;
    panel.dataset.dragging = "true";
    document.body.style.userSelect = "none";
  };

  const onDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    const found = target?.closest?.(SELECTOR) as HTMLElement | null;
    if (!found) return;
    panel = found;
    const rect = found.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    baseX = rect.left;
    baseY = rect.top;
    const onHeader = !!target?.closest("[data-panel-drag-handle]");
    const interactive = !!target?.closest("button, a, input, select, textarea, [role='button']");
    if (onHeader && !interactive) {
      begin();
      e.preventDefault();
    } else {
      stopTimer();
      timer = window.setTimeout(begin, LONG_PRESS_MS);
    }
  };

  const onMove = (e: PointerEvent) => {
    if (!panel) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!dragging) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) stopTimer();
      return;
    }
    e.preventDefault();
    applyPos(panel, { x: baseX + dx, y: baseY + dy });
  };

  const onUp = () => {
    stopTimer();
    if (panel && dragging) {
      const rect = panel.getBoundingClientRect();
      const store = readStore();
      store[keyOf(panel)] = { x: rect.left, y: rect.top };
      writeStore(store);
      delete panel.dataset.dragging;
      document.body.style.userSelect = "";
    }
    panel = null;
    dragging = false;
  };

  document.addEventListener("pointerdown", onDown, true);
  document.addEventListener("pointermove", onMove, { passive: false });
  document.addEventListener("pointerup", onUp, true);
  document.addEventListener("pointercancel", onUp, true);
};

export const resetPanelPositions = () => {
  writeStore({});
  document.querySelectorAll(SELECTOR).forEach((el) => {
    const p = el as HTMLElement;
    p.style.cssText = "";
    delete p.dataset.dragged;
  });
};
