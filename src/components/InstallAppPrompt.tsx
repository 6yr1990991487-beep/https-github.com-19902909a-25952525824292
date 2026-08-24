import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, Share, MoreVertical, Monitor, Smartphone, Check } from "lucide-react";
import { LaunchFormat, getLaunchFormat, setLaunchFormat } from "@/components/LaunchFormatPicker";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_UNTIL_KEY = "lovanet.install.dismissedUntil.v4";
const DISMISS_COOLDOWN_MS = 12 * 60 * 60 * 1000;
const AUTO_OPEN_DELAY_MS = 2400;

type Browser = "ios-safari" | "ios-other" | "firefox" | "safari" | "samsung" | "opera" | "edge" | "chromium" | "unknown";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.matchMedia("(display-mode: minimal-ui)").matches ||
  (window.navigator as unknown as { standalone?: boolean }).standalone === true;

const canShowPrompt = () => {
  try {
    const raw = localStorage.getItem(DISMISS_UNTIL_KEY);
    if (!raw) return true;
    const until = Number(raw);
    return !Number.isFinite(until) || Date.now() >= until;
  } catch {
    return true;
  }
};

const detectBrowser = (): Browser => {
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
  if (isIos) return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? "ios-other" : "ios-safari";
  if (/SamsungBrowser/i.test(ua)) return "samsung";
  if (/Firefox|FxiOS/i.test(ua)) return "firefox";
  if (/OPR|Opera/i.test(ua)) return "opera";
  if (/Edg\//i.test(ua)) return "edge";
  if (/Chrome|Chromium|CriOS/i.test(ua)) return "chromium";
  if (/Safari/i.test(ua)) return "safari";
  return "unknown";
};

const INSTRUCTIONS: Record<Browser, string> = {
  "ios-safari": "Appuyez sur Partager, puis « Sur l'écran d'accueil ».",
  "ios-other": "Sur iPhone/iPad, ouvrez cette page dans Safari, puis Partager → « Sur l'écran d'accueil ».",
  firefox: "Firefox : menu ⋮ → « Installer » ou « Ajouter à l'écran d'accueil ».",
  safari: "Safari (Mac) : menu Fichier → « Ajouter au Dock ».",
  samsung: "Samsung Internet : menu ☰ → « Ajouter la page à » → « Écran d'accueil ».",
  opera: "Opera : menu → « Ajouter à » → « Écran d'accueil ».",
  edge: "Edge : menu ⋯ → « Applications » → « Installer ce site en tant qu'application ».",
  chromium: "Chrome : menu ⋮ → « Installer l'application » / « Ajouter à l'écran d'accueil ».",
  unknown: "Utilisez le menu de votre navigateur puis « Installer » ou « Ajouter à l'écran d'accueil ».",
};

export const InstallAppPrompt = () => {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [browser, setBrowser] = useState<Browser>("unknown");
  const [launchFormat, setLaunchFormatChoice] = useState<LaunchFormat>(() => getLaunchFormat());
  const [notifState, setNotifState] = useState<NotificationPermission | "unsupported">("default");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.self !== window.top) return; // jamais dans l'iframe de preview
    if (isStandalone()) return;
    if (!canShowPrompt()) return;

    setBrowser(detectBrowser());
    setNotifState("Notification" in window ? Notification.permission : "unsupported");

    // Evenement capture avant le montage de React (script dans index.html)
    const early = (window as any).__lovanetInstallEvent as BIPEvent | null;
    if (early) setDeferred(early);

    const onReady = () => {
      const evt = (window as any).__lovanetInstallEvent as BIPEvent | null;
      if (evt) setDeferred(evt);
      setOpen(true);
    };
    window.addEventListener("lovanet:installready", onReady);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__lovanetInstallEvent = e;
      setDeferred(e as BIPEvent);
      setOpen(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const autoTimer = window.setTimeout(() => setOpen(true), AUTO_OPEN_DELAY_MS);

    const onInstalled = () => {
      setOpen(false);
      setDeferred(null);
      try {
        localStorage.setItem(DISMISS_UNTIL_KEY, String(Date.now() + 90 * 24 * 60 * 60 * 1000));
      } catch { /* ignore */ }
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("lovanet:installready", onReady);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(autoTimer);
    };
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_UNTIL_KEY, String(Date.now() + DISMISS_COOLDOWN_MS));
    } catch { /* ignore */ }
  }, []);

  const chooseLaunchFormat = (format: LaunchFormat) => {
    setLaunchFormatChoice(format);
    setLaunchFormat(format);
  };

  const install = async () => {
    const evt = deferred || ((window as any).__lovanetInstallEvent as BIPEvent | null);
    if (!evt) {
      setNotice(INSTRUCTIONS[browser]);
      return;
    }
    try {
      await evt.prompt();
      const choice = await evt.userChoice;
      (window as any).__lovanetInstallEvent = null;
      setDeferred(null);
      if (choice.outcome === "accepted") setOpen(false);
      else dismiss();
    } catch {
      setNotice(INSTRUCTIONS[browser]);
    }
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      setNotice("Les alertes ne sont pas supportées par ce navigateur.");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifState(perm);
      if (perm === "granted") {
        const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
        const options = {
          body: "Vous recevrez les alertes Lovanet : nouveautés, sorties et actualités.",
          icon: "/lovanet-icon-192.png?v=18",
          badge: "/lovanet-icon-192.png?v=18",
          tag: "lovanet-welcome",
        };
        if (reg) await reg.showNotification("Alertes Lovanet activées", options);
        else new Notification("Alertes Lovanet activées", options);
      } else if (perm === "denied") {
        setNotice("Alertes bloquées : réactivez-les dans les réglages du navigateur (icône cadenas).");
      }
    } catch {
      setNotice("Impossible d'activer les alertes sur ce navigateur.");
    }
  };

  if (!open || typeof document === "undefined") return null;

  const iosLike = browser === "ios-safari" || browser === "ios-other";
  const canDirectInstall = Boolean(deferred);

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={dismiss}
    >
      <div
        className="glass3d-panel relative w-full max-w-sm px-5 pb-6 pt-6 text-center animate-in fade-in zoom-in-95 duration-300 sm:max-w-md"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="glass3d-btn absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full p-0 text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/25 bg-white/[0.07] shadow-[0_10px_40px_-10px_rgba(255,255,255,0.35)] backdrop-blur-xl sm:h-36 sm:w-36">
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.28),transparent_65%)]" />
          <img
            src="/lovanet-icon-round-512.png?v=18"
            alt="Logo Lovanet"
            width={192}
            height={192}
            className="relative h-24 w-24 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)] sm:h-32 sm:w-32"
          />
        </div>

          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/65">Choix du format</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white drop-shadow">Ouvrir Lovanet comme…</h2>
          <p className="mt-2 text-sm text-white/75">Choisis le format de départ à chaque ouverture installée.</p>

        <div className="mt-5 rounded-2xl border border-white/15 bg-white/[0.05] p-3 text-left">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/65">Format au lancement</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => chooseLaunchFormat("browser")}
              className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                launchFormat === "browser"
                  ? "border-cyan-300/70 bg-cyan-400/15 text-white shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                  : "border-white/15 bg-white/[0.04] text-white/78 hover:border-white/30"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <Monitor className="h-4 w-4" />
                Navigateur
              </div>
              <div className="mt-1 text-[11px] leading-snug text-white/70">Interface web classique sur PC.</div>
            </button>
            <button
              type="button"
              onClick={() => chooseLaunchFormat("app")}
              className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                launchFormat === "app"
                  ? "border-emerald-300/70 bg-emerald-400/15 text-white shadow-[0_0_18px_rgba(16,185,129,0.18)]"
                  : "border-white/15 bg-white/[0.04] text-white/78 hover:border-white/30"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <Smartphone className="h-4 w-4" />
                Application
              </div>
              <div className="mt-1 text-[11px] leading-snug text-white/70">Expérience compacte, mobile et immersive.</div>
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-white/70">
            <Check className="h-3.5 w-3.5 text-emerald-300" />
            Le choix sera mémorisé pour l’ouverture installée.
          </div>
        </div>

        {canDirectInstall && !iosLike ? (
          <button
            onClick={install}
            className="glass3d-btn mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white"
          >
            <Download className="h-4 w-4" />
            Téléchargement direct
          </button>
        ) : (
          <p className="glass3d-group mt-5 flex items-start gap-2 rounded-2xl px-4 py-3 text-left text-sm text-white/95">
            {iosLike ? <Share className="mt-0.5 h-4 w-4 shrink-0 text-white" /> : <MoreVertical className="mt-0.5 h-4 w-4 shrink-0 text-white" />}
            <span>{INSTRUCTIONS[browser]}</span>
          </p>
        )}

        {notifState !== "unsupported" && (
          <button
            onClick={enableNotifications}
            disabled={notifState === "granted"}
            className="glass3d-btn mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {notifState === "granted" ? "Alertes activées" : "Activer les alertes"}
          </button>
        )}

        {notice && (
          <p className="mt-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[12px] text-white/95 backdrop-blur-sm">
            {notice}
          </p>
        )}

        <button onClick={dismiss} className="mt-3 w-full text-xs font-medium text-white/70 hover:text-white">
          Plus tard
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default InstallAppPrompt;
