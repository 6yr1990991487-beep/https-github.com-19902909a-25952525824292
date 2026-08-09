import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Link } from "react-router-dom";
import { EyeOff, Eye, Play, RefreshCw, ArrowLeft, X, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { normalizeVideo } from "@/lib/normalizeVideo";
import { createImageFallbackHandler, siteFallbackImage } from "@/lib/mediaFallback";
import { ResilientVideoFrame } from "@/components/ResilientVideoFrame";
import { hydrateYouTubeAvailability } from "@/lib/youtubeAvailability";

type Video = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  durationSec: number;
  viewCount: number;
};

const CACHE_KEY = "lovanet.cache.yt.manga.v1";
const BANNER_KEY = "lovanet.yt.manga.banner.hidden";
const HIDDEN_IDS_KEY = "lovanet.yt.manga.hidden.ids";

function fmtDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}
function fmtViews(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export default function ChaineYoutubeManga() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [active, setActive] = useState<string>("");
  const [bannerHidden, setBannerHidden] = useState<boolean>(() => {
    try { return localStorage.getItem(BANNER_KEY) === "1"; } catch { return false; }
  });
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(HIDDEN_IDS_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch { return new Set(); }
  });

  const hideVideo = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev); next.add(id);
      try { localStorage.setItem(HIDDEN_IDS_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
    // Persist to the shared blacklist so future auto-syncs skip this video.
    supabase.functions
      .invoke("youtube-anime-sync", {
        body: { blacklist: { videoIds: [id], reason: "user-hidden" } },
      })
      .catch((e) => console.warn("Blacklist persist failed", e));
    // Also drop the row locally.
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };
  const resetHidden = () => {
    setHiddenIds(new Set());
    try { localStorage.removeItem(HIDDEN_IDS_KEY); } catch {}
  };

  const toggleBanner = () => {
    setBannerHidden((v) => {
      const next = !v;
      try { localStorage.setItem(BANNER_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const sync = async () => {
    setSyncing(true);
    try {
      // Boucle d'exploration automatique : on relance la sync tant que le backend
      // insère de nouvelles vidéos (nouvelle fenêtre historique / nouveaux résultats).
      // Sécurité : maximum 8 passes par clic pour rester sous le quota YouTube.
      let list: Video[] = [];
      let lastInserted = 0;
      for (let pass = 0; pass < 8; pass++) {
        const { data, error } = await supabase.functions.invoke("youtube-anime-sync", {
          body: null,
        });
        if (error) throw error;
        list = data?.videos ?? list;
        lastInserted = Number(data?.inserted ?? 0);
        if (lastInserted === 0) break; // plus rien de neuf, on s'arrête
      }
      if (list.length) {
        // Normalise titles, descriptions and thumbnails so every card carries
        // the brand keywords (anime · AnimeMoments · Animer officiel · manga).
        const normalized = list.map((v) => normalizeVideo(v));
        const availability = await hydrateYouTubeAvailability(normalized.map((video) => video.id)).catch((error) => {
          console.warn("YouTube availability hydration failed", error);
          return [];
        });
        const unavailable = new Set(
          availability.filter((item) => !item.available).map((item) => item.video_id),
        );
        const filteredNormalized = normalized.filter((video) => !unavailable.has(video.id));
        // Merge with local cache — the catalogue must only grow, never shrink,
        // even if the backend returns a smaller list on a given run.
        setVideos((prev) => {
          const byId = new Map<string, Video>();
          for (const v of prev) byId.set(v.id, v);
          for (const v of filteredNormalized) byId.set(v.id, v); // fresh data wins on overlap
          const merged = Array.from(byId.values()).sort((a, b) =>
            a.publishedAt < b.publishedAt ? -1 : 1,
          );
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch {}
          return merged;
        });
        setActive((a) => a || filteredNormalized[0]?.id || "");
      }
    } catch (e) {
      console.error("YouTube anime sync failed", e);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Hydrate cache
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const arr: Video[] = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          setVideos(arr.map((v) => normalizeVideo(v)));
          setActive(arr[0]?.id ?? "");
          setLoading(false);
        }
      }
    } catch {}
    sync();
    const id = setInterval(sync, 1000 * 60 * 15); // auto-sync every 15 min
    const onFocus = () => sync();
    const onVis = () => { if (document.visibilityState === "visible") sync(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Ingestion order is oldest → newest (see edge function sweep from 2007).
  // Display order is newest → oldest.
  const visibleVideos = videos
    .filter((v) => !hiddenIds.has(v.id))
    .slice()
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const activeVideo =
    visibleVideos.find((v) => v.id === active) ?? visibleVideos[0];

  return (
    <PageShell>
      <section className="container mx-auto px-4 lg:px-8 pt-8 pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            to="/chaine-youtube"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à la chaîne
          </Link>
          <div className="flex items-center gap-2">
            {hiddenIds.size > 0 && (
              <button
                onClick={resetHidden}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs hover:border-primary/60"
                title="Réafficher toutes les vidéos masquées"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurer ({hiddenIds.size})
              </button>
            )}
            <button
              onClick={toggleBanner}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs hover:border-primary/60"
              aria-label={bannerHidden ? "Afficher la bannière" : "Masquer la bannière"}
            >
              {bannerHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {bannerHidden ? "Afficher bannière" : "Masquer bannière"}
            </button>
            <button
              onClick={sync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white bg-gradient-to-r from-red-500 to-rose-600 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Synchronisation…" : "Actualiser"}
            </button>
          </div>
        </div>
      </section>

      {/* Banner section — hideable */}
      {!bannerHidden && (
        <section className="container mx-auto px-4 lg:px-8 pb-6">
          <div className="relative rounded-3xl overflow-hidden border border-red-500/30 shadow-[0_40px_120px_-40px_hsl(0_85%_55%/0.5)] aspect-[21/9] bg-black">
            {activeVideo ? (
              <>
                <ResilientVideoFrame
                  videoId={activeVideo.id}
                  title={activeVideo.title}
                  seed={`yt-manga-banner-${activeVideo.id}`}
                  searchQuery={`${activeVideo.title} anime officiel`}
                  poster={siteFallbackImage(activeVideo.id, activeVideo.thumbnail)}
                  className="absolute inset-0 h-full w-full"
                  fallbackBadge="Vidéo de secours du site"
                  fallbackDescription="La vidéo YouTube d’origine n’est plus accessible. Une vidéo de rechange du site prend le relais."
                  dataTestId="youtube-manga-banner-resilient-frame"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-red-300 mb-1">
                    Chaîne YouTube · Univers Manga
                  </p>
                  <h1 className="font-display text-2xl md:text-4xl font-extrabold text-white line-clamp-2">
                    {activeVideo.title}
                  </h1>
                  <p className="text-xs md:text-sm text-white/70 mt-1">
                    {activeVideo.channelTitle} · {fmtDuration(activeVideo.durationSec)} · {fmtViews(activeVideo.viewCount)} vues
                  </p>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 grid place-items-center text-white/60 text-sm">
                {loading ? "Chargement de la bannière…" : "Aucune vidéo disponible."}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Player (always visible) */}
      {bannerHidden && activeVideo && (
        <section className="container mx-auto px-4 lg:px-8 pb-6">
          <div className="rounded-3xl overflow-hidden aspect-video bg-black border border-red-500/30">
            <ResilientVideoFrame
              videoId={activeVideo.id}
              title={activeVideo.title}
              seed={`yt-manga-player-${activeVideo.id}`}
              searchQuery={`${activeVideo.title} anime officiel`}
              poster={siteFallbackImage(activeVideo.id, activeVideo.thumbnail)}
              className="relative h-full w-full"
              fallbackBadge="Lecture de secours"
              fallbackDescription="La vidéo YouTube n’est plus publique. Le site affiche un média de remplacement."
              dataTestId="youtube-manga-player-resilient-frame"
            />
          </div>
          <h2 className="font-display text-xl font-bold mt-3">{activeVideo.title}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {activeVideo.channelTitle} · {fmtDuration(activeVideo.durationSec)} · {fmtViews(activeVideo.viewCount)} vues
          </p>
        </section>
      )}

      {/* Grid */}
      <section className="container mx-auto px-4 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold">
            Vidéos manga & anime
            <span className="text-muted-foreground font-normal">
              {" "}· {visibleVideos.length} titres
            </span>
          </h3>
          {loading && <span className="text-xs text-muted-foreground">Chargement…</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visibleVideos.map((v) => (
            <div
              key={v.id}
              className="group relative text-left rounded-2xl overflow-hidden bg-card border border-border hover:border-red-500/60 transition-all"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  hideVideo(v.id);
                }}
                className="absolute top-1.5 right-1.5 z-10 w-7 h-7 grid place-items-center rounded-full bg-black/70 text-white/90 hover:bg-red-600 hover:text-white transition-colors"
                title="Retirer cette vidéo"
                aria-label="Retirer cette vidéo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setActive(v.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="block w-full text-left"
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                <img
                  src={v.thumbnail || siteFallbackImage(v.id, null)}
                  alt={v.title}
                  loading="lazy"
                  onError={createImageFallbackHandler(v.id, null)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded bg-black/80 text-white font-mono">
                  {fmtDuration(v.durationSec)}
                </span>
                <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Play className="w-10 h-10 text-white fill-white" />
                </span>
                </div>
                <div className="p-3">
                <div className="text-sm font-semibold line-clamp-2 group-hover:text-red-400 transition-colors">
                  {v.title}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                  {v.channelTitle} · {fmtViews(v.viewCount)} vues
                </div>
                </div>
              </button>
            </div>
          ))}
          {!loading && visibleVideos.length === 0 && (
            <div className="col-span-full text-center text-sm text-muted-foreground py-8">
              Aucune vidéo trouvée pour le moment.
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}