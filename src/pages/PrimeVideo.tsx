import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { videos as fallbackVideos, thumb as ytThumb } from "@/data/videos";
import { Play, Volume2, VolumeX, SkipForward, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverPreview } from "@/components/HoverPreview";
import { supabase } from "@/integrations/supabase/client";
import { AdminRemoveVideo } from "@/components/AdminRemoveVideo";
import { MangaUniverseBanner } from "@/components/MangaUniverseBanner";
import { ManualSyncButton } from "@/components/ManualSyncButton";

type Item = {
  id: string;
  videoId: string;
  title: string;
  series?: string;
  thumbnail: string;
};

type PrimeAnime = {
  id: number;
  title: string;
  cover?: string;
  banner?: string;
  color?: string;
  score?: number;
  year?: number;
  format?: string;
  episodes?: number;
  genres: string[];
  description: string;
  primeUrl?: string;
};

const PRIME_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: $sort, isAdult: false) {
      id
      title { romaji english native }
      coverImage { extraLarge large color }
      bannerImage
      averageScore
      seasonYear
      format
      episodes
      genres
      description(asHtml: false)
      externalLinks { site url }
    }
  }
}`;

const PRIME_CACHE = "lovanet.cache.prime.anime.v1";

const PrimeVideo = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string>("");
  const [muted, setMuted] = useState(true);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [orientation, setOrientation] = useState<"cinema" | "vertical">("cinema");
  const [primeAnime, setPrimeAnime] = useState<PrimeAnime[]>([]);
  const [primeLoading, setPrimeLoading] = useState(true);
  const [primeGenre, setPrimeGenre] = useState<string>("all");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fallback list from static data (Ruri no Houseki + others)
  const fallback: Item[] = fallbackVideos.map((v) => ({
    id: v.id,
    videoId: v.id,
    title: v.title,
    series: v.series,
    thumbnail: ytThumb(v.id),
  }));

  // Load ALL YouTube videos referenced by the channel from the imported library
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("imported_videos")
        .select("id, external_id, title, thumbnail_url, published_at, created_at")
        .eq("source", "youtube")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(500);
      if (!alive) return;
      const rows = (data ?? [])
        .filter((r: any) => r.external_id)
        .map((r: any): Item => ({
          id: r.id,
          videoId: r.external_id,
          title: r.title,
          thumbnail: r.thumbnail_url || ytThumb(r.external_id),
        }));
      const list = rows.length > 0 ? rows : fallback;
      setItems(list);
      setActive((curr) => curr || list[0]?.videoId || "");
    })();
    return () => {
      alive = false;
    };
  }, []);

  const v = items.find((x) => x.videoId === active) ?? items[0];
  const idx = items.findIndex((x) => x.videoId === v?.videoId);
  const next = items[(idx + 1) % Math.max(items.length, 1)];

  const goNext = () => {
    if (next) {
      setActive(next.videoId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // YouTube IFrame postMessage: listen for "ended" -> auto-advance
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        if (data?.event === "onStateChange" && data?.info === 0 && autoplayNext) {
          goNext();
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [autoplayNext, next?.videoId]);

  // Tell the embed to send state events to us
  useEffect(() => {
    const t = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: v?.videoId }),
        "*",
      );
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"] }),
        "*",
      );
    }, 600);
    return () => clearTimeout(t);
  }, [v?.videoId, muted]);

  // ---- Prime Video anime library (via AniList externalLinks) ----
  useEffect(() => {
    // Hydrate cache
    try {
      const raw = localStorage.getItem(PRIME_CACHE);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          setPrimeAnime(arr);
          setPrimeLoading(false);
        }
      }
    } catch {}

    const fetchPrime = async () => {
      const dedup = new Map<number, PrimeAnime>();
      const sorts: string[][] = [
        ["POPULARITY_DESC"],
        ["TRENDING_DESC"],
        ["SCORE_DESC"],
        ["START_DATE_DESC"],
      ];
      try {
        for (const sort of sorts) {
          for (let p = 1; p <= 25; p++) {
            const res = await fetch("https://graphql.anilist.co", {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({ query: PRIME_QUERY, variables: { page: p, perPage: 50, sort } }),
            }).catch(() => null);
            if (!res || !res.ok) break;
            const json = await res.json().catch(() => null);
            const list = json?.data?.Page?.media ?? [];
            if (!list.length) break;
            for (const m of list) {
              if (dedup.has(m.id)) continue;
              const links: any[] = m.externalLinks ?? [];
              const prime = links.find((l) =>
                (l?.site || "").toLowerCase().includes("amazon prime") ||
                (l?.site || "").toLowerCase() === "prime video" ||
                ((l?.url || "").toLowerCase().includes("primevideo.com") ||
                  (l?.url || "").toLowerCase().includes("amazon.") && (l?.url || "").toLowerCase().includes("/prime"))
              );
              if (!prime) continue;
              dedup.set(m.id, {
                id: m.id,
                title: m.title?.english || m.title?.romaji || m.title?.native || "—",
                cover: m.coverImage?.large || m.coverImage?.extraLarge,
                banner: m.bannerImage,
                color: m.coverImage?.color,
                score: m.averageScore ?? undefined,
                year: m.seasonYear ?? undefined,
                format: m.format ?? undefined,
                episodes: m.episodes ?? undefined,
                genres: m.genres ?? [],
                description: (m.description ?? "").replace(/<[^>]+>/g, ""),
                primeUrl: prime.url,
              });
            }
            const snap = Array.from(dedup.values());
            setPrimeAnime(snap);
            setPrimeLoading(false);
            try { localStorage.setItem(PRIME_CACHE, JSON.stringify(snap.slice(0, 2000))); } catch {}
            await new Promise((r) => setTimeout(r, 120));
          }
        }
      } catch (e) {
        console.error("Prime AniList sync error", e);
      } finally {
        setPrimeLoading(false);
      }
    };

    fetchPrime();
    const id = setInterval(fetchPrime, 1000 * 60 * 10); // auto-sync every 10 min
    const onFocus = () => fetchPrime();
    const onVis = () => { if (document.visibilityState === "visible") fetchPrime(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const primeGenres = Array.from(
    new Set(primeAnime.flatMap((a) => a.genres))
  ).sort();
  const filteredPrime = primeGenre === "all"
    ? primeAnime
    : primeAnime.filter((a) => a.genres.includes(primeGenre));

  if (!v) {
    return (
      <PageShell>
        <section className="container mx-auto px-4 py-24 text-center text-muted-foreground">
          Chargement de la bibliothèque Prime…
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ManualSyncButton platform="prime" label="Sync Prime" onDone={() => window.location.reload()} />
      <section className="container mx-auto px-4 lg:px-8 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 mb-2">Streaming partenaire</p>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold">
          <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Prime Vidéo
          </span>
        </h1>
      </section>

      <section className="container mx-auto px-4 lg:px-8 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5">
              ◆ prime
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">&nbsp;</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted((m) => !m)}
              className="px-3 py-2 rounded-full bg-secondary border border-border text-xs font-semibold hover:border-primary/60 transition-colors flex items-center gap-1.5"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {muted ? "Activer son" : "Muet"}
            </button>
            <div className="inline-flex p-1 rounded-full bg-secondary border border-border">
              <button
                onClick={() => setOrientation("cinema")}
                className={cn("px-3 py-1.5 text-xs rounded-full font-semibold", orientation === "cinema" ? "bg-background" : "text-muted-foreground")}
              >
                ▭ Cinéma
              </button>
              <button
                onClick={() => setOrientation("vertical")}
                className={cn("px-3 py-1.5 text-xs rounded-full font-semibold", orientation === "vertical" ? "bg-background" : "text-muted-foreground")}
              >
                ▯ Vertical
              </button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mx-auto rounded-3xl overflow-hidden bg-black border border-sky-500/30 shadow-[0_40px_120px_-40px_hsl(211_100%_50%/0.5)]",
            orientation === "cinema" ? "aspect-video w-full" : "aspect-[9/16] max-w-md"
          )}
        >
          <iframe
            ref={iframeRef}
            key={`${v.videoId}-${muted}`}
            src={`https://www.youtube.com/embed/${v.videoId}?autoplay=1&rel=0&enablejsapi=1&mute=${muted ? 1 : 0}&origin=${typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : ""}`}
            title={v.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setAutoplayNext((a) => !a)}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-colors",
              autoplayNext
                ? "bg-sky-500/15 border-sky-500/60 text-sky-300"
                : "bg-secondary border-border hover:border-sky-500/60",
            )}
          >
            <Play className="w-4 h-4 fill-current" /> Lecture auto {autoplayNext ? "ON" : "OFF"}
          </button>
          <div className="text-xs text-muted-foreground">
            {idx + 1} / {items.length} · AnimemomentsAnimeofficiel
          </div>
          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600"
          >
            Suivant <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 text-center">
          {v.series && (
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{v.series}</p>
          )}
          <h2 className="font-display text-2xl font-bold mt-1">{v.title}</h2>
          <div className="mt-3 flex justify-center">
            <AdminRemoveVideo
              rowId={v.id}
              source="youtube"
              externalId={v.videoId}
              onRemoved={() => {
                setItems((arr) => arr.filter((x) => x.id !== v.id));
                if (next) setActive(next.videoId);
              }}
              label="Retirer cette vidéo"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-xl font-bold">
            Animés disponibles sur Prime Video
            <span className="text-muted-foreground font-normal"> · {filteredPrime.length}/{primeAnime.length} titres</span>
          </h3>
          <div className="flex items-center gap-2 text-xs">
            {primeLoading && <span className="text-muted-foreground">Synchronisation…</span>}
            <select
              value={primeGenre}
              onChange={(e) => setPrimeGenre(e.target.value)}
              className="bg-secondary border border-border rounded-full px-3 py-1.5"
              aria-label="Filtrer par genre"
            >
              <option value="all">Tous les genres</option>
              {primeGenres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
          {filteredPrime.map((a) => (
            <article
              key={`prime-${a.id}`}
              className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-sky-500/60 transition-all flex flex-col"
            >
              <div
                className="relative aspect-[2/3] overflow-hidden"
                style={{ background: a.color || "#0a1428" }}
              >
                {a.cover && (
                  <img
                    src={a.cover}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow">
                  ◆ PRIME
                </span>
                {typeof a.score === "number" && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 text-[10px] font-semibold">
                    {a.score}
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col gap-2 flex-1">
                <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-sky-400 transition-colors">
                  {a.title}
                </h4>
                <div className="text-[10px] text-muted-foreground">
                  {a.format ?? "—"} · {a.year ?? "—"} {a.episodes ? `· ${a.episodes} ép.` : ""}
                </div>
                {a.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {a.genres.slice(0, 3).map((g) => (
                      <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground line-clamp-4 leading-snug flex-1">
                  {a.description || "Aucune description disponible."}
                </p>
                {a.primeUrl && (
                  <a
                    href={a.primeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90"
                  >
                    Voir sur Prime Video <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
          {!primeLoading && filteredPrime.length === 0 && (
            <div className="col-span-full text-center text-sm text-muted-foreground py-8">
              Aucun titre disponible pour ce filtre.
            </div>
          )}
        </div>

        <h3 className="font-display text-xl font-bold mb-4">
          Bibliothèque Prime <span className="text-muted-foreground font-normal">· {items.length} vidéos</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items
            .filter((x) => x.videoId !== v.videoId)
            .map((x) => (
              <button
                key={x.id}
                onClick={() => {
                  setActive(x.videoId);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rgb-card group text-left rounded-2xl overflow-hidden bg-card border border-border transition-all"
              >
                <HoverPreview
                  videoId={x.videoId}
                  title={x.title}
                  thumbnail={x.thumbnail}
                  vertical={orientation === "vertical"}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                  <span className="absolute top-2 left-2 z-20">
                    <AdminRemoveVideo
                      rowId={x.id}
                      source="youtube"
                      externalId={x.videoId}
                      onRemoved={() => setItems((arr) => arr.filter((it) => it.id !== x.id))}
                    />
                  </span>
                  <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                    PRIME
                  </span>
                </HoverPreview>
                <div className="p-3">
                  <div className="text-sm font-semibold line-clamp-2 group-hover:text-sky-400 transition-colors">{x.title}</div>
                </div>
              </button>
            ))}
        </div>
      </section>
      <MangaUniverseBanner />
    </PageShell>
  );
};

export default PrimeVideo;