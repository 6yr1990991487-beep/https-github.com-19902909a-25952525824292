/** Teinte des panneaux de bulles avec les couleurs du thème (activable / désactivable). */
const KEY = "lovanet.panels.tint";

export const isPanelTintOn = () => {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
};

export const applyPanelTint = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
  document.body.dataset.panelTint = on ? "on" : "off";
};

export const initPanelTint = () => {
  if (typeof document === "undefined") return;
  document.body.dataset.panelTint = isPanelTintOn() ? "on" : "off";
};
