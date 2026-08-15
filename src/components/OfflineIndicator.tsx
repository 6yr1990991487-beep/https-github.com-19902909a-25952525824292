import { useEffect, useState } from "react";
import { CloudOff } from "lucide-react";

export function OfflineIndicator() {
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-3 left-1/2 z-[200] -translate-x-1/2 rounded-full border border-white/25 bg-background/70 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-xl">
      <span className="inline-flex items-center gap-2">
        <CloudOff className="h-3.5 w-3.5" /> Mode hors ligne — contenu enregistré affiché
      </span>
    </div>
  );
}

export default OfflineIndicator;
