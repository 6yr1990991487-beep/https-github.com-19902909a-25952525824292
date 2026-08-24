import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Monitor, Smartphone, X } from "lucide-react";

const LAUNCH_FORMAT_KEY = "lovanet.launch.format.v1";

export type LaunchFormat = "browser" | "app";

function getStoredFormat(): LaunchFormat | null {
  try {
    const value = localStorage.getItem(LAUNCH_FORMAT_KEY);
    return value === "browser" || value === "app" ? value : null;
  } catch {
    return null;
  }
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function getLaunchFormat() {
  return getStoredFormat() ?? (isStandalone() ? "app" : "browser");
}

export function setLaunchFormat(format: LaunchFormat) {
  try {
    localStorage.setItem(LAUNCH_FORMAT_KEY, format);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("lovanet:launch-format", { detail: { format } }));
}

export function clearLaunchFormat() {
  try {
    localStorage.removeItem(LAUNCH_FORMAT_KEY);
  } catch {
    /* ignore */
  }
}

export function LaunchFormatPicker() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) {
      try {
        if (!getStoredFormat()) setOpen(true);
      } catch {
        setOpen(true);
      }
    }
  }, []);

  const choose = (format: LaunchFormat) => {
    try {
      localStorage.setItem(LAUNCH_FORMAT_KEY, format);
    } catch {
      /* ignore */
    }
    setOpen(false);
    window.dispatchEvent(new CustomEvent("lovanet:launch-format", { detail: { format } }));
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[10060] flex items-end justify-center bg-black/65 backdrop-blur-md p-3 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="glass3d-panel w-full max-w-md rounded-[1.8rem] border border-white/15 p-5 text-white shadow-2xl sm:rounded-[2rem]">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="glass3d-btn absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/65">Choix du format</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Ouvrir Lovanet comme…</h2>
        <p className="mt-2 text-sm text-white/75">Choisis le format de départ à chaque ouverture installée.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button onClick={() => choose("browser")} className="glass3d-btn rounded-[1.4rem] border border-white/15 p-4 text-left transition-transform hover:scale-[1.01]">
            <Monitor className="h-7 w-7" />
            <div className="mt-3 text-base font-bold">Format navigateur</div>
          </button>
          <button onClick={() => choose("app")} className="glass3d-btn rounded-[1.4rem] border border-white/15 p-4 text-left transition-transform hover:scale-[1.01]">
            <Smartphone className="h-7 w-7" />
            <div className="mt-3 text-base font-bold">Format application</div>
          </button>
        </div>

        <button onClick={() => setOpen(false)} className="mt-4 w-full text-xs font-medium text-white/65 hover:text-white">
          Plus tard
        </button>
      </div>
    </div>,
    document.body,
  );
}
