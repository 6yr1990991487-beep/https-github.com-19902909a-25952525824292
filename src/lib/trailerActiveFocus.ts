/**
 * Selection exclusive des lecteurs de trailers.
 * Quand un visiteur selectionne une carte (survol, clic ou tap), tous les
 * autres lecteurs sont mis en pause : plus de lectures superposees.
 */
let currentOwner: string | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());

export function subscribeActivePreview(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getActivePreviewOwner() {
  return currentOwner;
}

export function claimActivePreview(id: string) {
  if (currentOwner === id) return;
  currentOwner = id;
  emit();
}

export function releaseActivePreview(id: string) {
  if (currentOwner !== id) return;
  currentOwner = null;
  emit();
}
