// Enregistrement unique et protege du service worker hors ligne (/sw.js).
const SW_URL = "/sw.js";

const isRefusedContext = () => {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;
  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host.includes("preview") ||
    host.endsWith(".preview.emergentcf.cloud") ||
    host.endsWith(".emergentcf.cloud") ||
    host.endsWith(".emergent.host") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev") ||
    host === "localhost"
  ) {
    return true;
  }
  return new URLSearchParams(window.location.search).get("sw") === "off";
};

const unregisterAppWorkers = async () => {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => {
        const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
        return url.endsWith(SW_URL) || url.endsWith("/service-worker.js");
      })
      .map((r) => r.unregister()),
  );
};

// Purge unique par version : si un navigateur (ou une PWA installee) garde un
// ancien cache Workbox, on supprime workers + caches puis on recharge une fois.
const PURGE_KEY = "lovanet_prod_cache_purge";
const PURGE_VERSION = "2026-08-23-preview-v4";

const purgeStaleCachesOnce = async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("lovanet_reload") === "1") {
      localStorage.setItem(PURGE_KEY, PURGE_VERSION);
      sessionStorage.setItem(PURGE_KEY, PURGE_VERSION);
      return false;
    }

    if (localStorage.getItem(PURGE_KEY) === PURGE_VERSION) return false;
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
    }
    localStorage.setItem(PURGE_KEY, PURGE_VERSION);
    sessionStorage.setItem(PURGE_KEY, PURGE_VERSION);
    return true;
  } catch {
    return false;
  }
};

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (isRefusedContext()) {
    void unregisterAppWorkers().catch(() => {});
    return;
  }
  void purgeStaleCachesOnce().then((purged) => {
    if (purged) {
      window.location.reload();
      return;
    }
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(SW_URL, { scope: "/" })
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch(() => {});
    });
  });
}
