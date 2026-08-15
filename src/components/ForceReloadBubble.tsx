import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

/**
 * Bulle flottante qui force un rechargement complet du site :
 * - désenregistre les service workers
 * - vide les caches de l'application
 * - recharge la page avec un cache-buster
 */
export function ForceReloadBubble() {
  const [spinning, setSpinning] = useState(false);

  const handleReload = () => {
    setSpinning(true);
    toast.info("Rechargement forcé en cours...", { duration: 3000 });

    // Donne le temps au toast de s'afficher avant le hard reload
    setTimeout(() => {
      if (typeof window !== "undefined" && (window as any).forceLovanetReload) {
        (window as any).forceLovanetReload();
      } else {
        // Fallback si la fonction globale n'est pas encore montée
        window.location.reload();
      }
    }, 500);
  };

  return (
    <div data-testid="force-reload-bubble" style={{ width: 40, height: 40, background: "red", borderRadius: "50%" }}>
      TEST
    </div>
  );
}

export default ForceReloadBubble;
