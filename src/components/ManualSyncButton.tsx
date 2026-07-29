import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Platform = "youtube" | "tiktok" | "prime" | "all";

type Props = {
  /** Which sync edge functions to trigger. */
  platform?: Platform;
  /** Optional label override. */
  label?: string;
  /** Called after the sync attempt completes (success or error) so the page can refresh. */
  onDone?: () => void;
  /** Fixed floating position (default) or inline. */
  variant?: "floating" | "inline";
  className?: string;
};

// Client-side cache keys wiped on a "full sync". We keep the mapping narrow
// per platform so a full-sync on /tiktok does NOT nuke the Prime or catalog
// caches (that used to force every page to refetch heavy data pointlessly).
//
// Each entry is either an exact localStorage key or a prefix ending in ".".
const CACHE_MAP: Record<Platform, readonly string[]> = {
  youtube: [
    "lovanet.cache.yt.",       // yt.manga.v1, yt.anime.*, etc.
    "lovanet.cache.ytIds",
  ],
  tiktok: [
    "lovanet.cache.tiktok.",   // reserved for future TikTok client cache
  ],
  prime: [
    "lovanet.cache.prime.",
  ],
  all: [
    "lovanet.cache.",          // wipe everything under the app prefix
  ],
};

function matchesAny(key: string, patterns: readonly string[]): boolean {
  return patterns.some((p) => (p.endsWith(".") ? key.startsWith(p) : key === p));
}

/** Purge only the localStorage caches belonging to a given platform. */
export function clearClientCaches(platform: Platform = "all") {
  const patterns = CACHE_MAP[platform] ?? CACHE_MAP.all;
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && matchesAny(key, patterns)) localStorage.removeItem(key);
    }
  } catch { /* ignore quota / privacy-mode errors */ }
}

/**
 * Bouton universel de synchronisation manuelle. Deux modes :
 *  - Sync incrémental (bouton principal) : rafraîchit les dernières vidéos.
 *  - Full sync (⚡) : force un rescan complet, purge les caches localStorage
 *    et supprime les vidéos disparues côté plateforme (garbage collection).
 */
export const ManualSyncButton = ({
  platform = "all",
  label = "Sync manuel",
  onDone,
  variant = "floating",
  className,
}: Props) => {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string>("");
  const [mode, setMode] = useState<"incremental" | "full">("incremental");

  const run = async (full = false) => {
    if (state === "loading") return;
    setState("loading");
    setMode(full ? "full" : "incremental");
    setMsg("");
    try {
      const jobs: Promise<any>[] = [];
      if (platform === "youtube" || platform === "all") {
        // Full mode → also reset the rotation cursor via ?reset=1&pages=5 so
        // youtube-anime-sync re-crawls the entire catalogue from scratch.
        const path = full ? "youtube-anime-sync?reset=1&pages=5" : "youtube-anime-sync";
        jobs.push(supabase.functions.invoke(path, { body: { source: "manual-page", mode: full ? "full" : "incremental" } }));
      }
      if (platform === "tiktok" || platform === "prime" || platform === "all" || platform === "youtube") {
        // sync-videos aggregates TikTok / Prime / cross-platform imports
        jobs.push(supabase.functions.invoke("sync-videos", {
          body: { source: "manual-page", platform, mode: full ? "full" : "incremental" },
        }));
      }
      const results = await Promise.allSettled(jobs);
      const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && (r.value as any)?.error));
      if (failed.length && failed.length === results.length) {
        setState("error");
        setMsg("Sync échouée");
      } else {
        setState("done");
        setMsg(failed.length ? "Sync partielle" : full ? "Full sync OK" : "Sync OK");
      }
      if (full) {
        clearClientCaches(platform);
      }
      onDone?.();
    } catch (e) {
      console.error("ManualSyncButton failed", e);
      setState("error");
      setMsg("Erreur réseau");
    } finally {
      setTimeout(() => setState((s) => (s === "loading" ? s : "idle")), 3200);
    }
  };

  const Icon =
    state === "done" ? CheckCircle2 : state === "error" ? AlertTriangle : RefreshCw;
  const tone =
    state === "done"
      ? "bg-emerald-500/90 hover:bg-emerald-500 text-white"
      : state === "error"
      ? "bg-red-500/90 hover:bg-red-500 text-white"
      : "bg-black/80 hover:bg-black text-white dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/15";

  return (
    <div
      className={cn(
        "inline-flex items-stretch gap-1 rounded-full shadow-lg",
        variant === "floating" && "fixed bottom-5 right-5 z-[70]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => run(false)}
        disabled={state === "loading"}
        aria-label="Lancer une synchronisation incrémentale"
        title="Rafraîchit les dernières vidéos publiées"
        className={cn(
          "inline-flex items-center gap-2 rounded-l-full px-4 py-2 text-sm font-medium transition-all",
          tone,
          state === "loading" && "opacity-90",
        )}
      >
        <Icon className={cn("w-4 h-4", state === "loading" && mode === "incremental" && "animate-spin")} />
        <span>
          {state === "loading" && mode === "incremental"
            ? "Sync en cours…"
            : msg && mode === "incremental"
            ? msg
            : label}
        </span>
      </button>
      <button
        type="button"
        onClick={() => run(true)}
        disabled={state === "loading"}
        aria-label="Lancer un full sync : purge le cache et régénère toutes les miniatures"
        title="Full sync : purge le cache local, régénère miniatures/titres et nettoie les vidéos supprimées"
        className={cn(
          "inline-flex items-center gap-1 rounded-r-full px-3 py-2 text-sm font-semibold transition-all border-l border-white/20",
          state === "loading" && mode === "full"
            ? "bg-amber-500 text-white"
            : "bg-amber-500/90 hover:bg-amber-500 text-white",
          state === "loading" && "opacity-90",
        )}
      >
        <Zap className={cn("w-4 h-4", state === "loading" && mode === "full" && "animate-pulse")} />
        <span className="hidden sm:inline">Full</span>
      </button>
    </div>
  );
};

export default ManualSyncButton;