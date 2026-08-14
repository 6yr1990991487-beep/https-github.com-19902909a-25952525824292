import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { initTilt3D } from "./lib/tilt3d";
import { initInteractivity } from "./lib/interactivity";

initTilt3D();
initInteractivity();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);

// Ensure old service workers and caches are unregistered once to avoid stale preview assets.
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    if (!sessionStorage.getItem("lovanet_sw_unregistered")) {
      const refresh = () => {
        const url = new URL(window.location.href);
        if (!url.searchParams.has("lovanet_reload")) {
          url.searchParams.set("lovanet_reload", "1");
          window.location.replace(url.toString());
        } else {
          window.location.reload();
        }
      };

      navigator.serviceWorker.getRegistrations().then((regs) => {
        return Promise.all(regs.map((r) => r.unregister()));
      }).then(() => {
        return caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
      }).then(() => {
        sessionStorage.setItem("lovanet_sw_unregistered", "1");
        refresh();
      }).catch(() => {
        // ignore errors
      });
    }
  } catch (e) {
    // ignore
  }
}
