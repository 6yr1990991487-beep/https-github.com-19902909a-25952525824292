/**
 * Securite audio des lecteurs de trailers.
 * Un seul lecteur peut emettre du son a la fois : tous les autres restent
 * muets tant que l'utilisateur ne les a pas explicitement selectionnes.
 */
let currentOwner: string | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());

export function subscribeAudioFocus(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getAudioFocusOwner() {
  return currentOwner;
}

export function claimAudioFocus(id: string) {
  if (currentOwner === id) return;
  currentOwner = id;
  emit();
}

export function releaseAudioFocus(id: string) {
  if (currentOwner !== id) return;
  currentOwner = null;
  emit();
}
