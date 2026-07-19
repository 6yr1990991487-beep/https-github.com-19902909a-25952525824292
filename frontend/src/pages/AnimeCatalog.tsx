import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import NeonFooterBar from "@/components/NeonFooterBar";
import MangaNeonBar from "@/components/MangaNeonBar";
import { Navbar } from "@/components/Navbar";
import CatalogCardColorBubble from "@/components/CatalogCardColorBubble";
import YoutubeBrandCover from "@/components/YoutubeBrandCover";
import { PlayCircle } from "lucide-react";
import { idbGet, idbSet, normalizeTitle } from "@/lib/animeCache";
import BlisterFrame from "@/components/BlisterFrame";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import {
  warmVideoAvailability,
  getVideoStatusSync,
  setVideoStatus,
} from "@/lib/videoAvailability";

type Media = {
  id: number;
  title: { romaji?: string; english?: string; native?: string };
  coverImage: { extraLarge?: string; large?: string; color?: string };
  bannerImage?: string;
  averageScore?: number;
  episodes?: number;
  genres?: string[];
  format?: string;
  seasonYear?: number;
  description?: string;
  trailer?: { id?: string; site?: string } | null;
  // AniList: FINISHED | RELEASING | NOT_YET_RELEASED | CANCELLED | HIATUS.
  // Normalized to: finished | releasing | upcoming | cancelled | hiatus.
  status?: string;
};

const PRIMARY_SITE = "https://lovanet.fr";

function mediaTitle(media: Media | null | undefined) {
  if (!media) return "Catalogue Anime Lovanet";
  return media.title.english || media.title.romaji || media.title.native || `Anime ${media.id}`;
}

function mediaDescription(media: Media | null | undefined) {
  const raw = String(media?.description || "Catalogue anime manga avec miniatures, bandes-annonces, synopsis et cartes indexables.");
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
}

function mediaImage(media: Media | null | undefined) {
  return media?.bannerImage || media?.coverImage?.extraLarge || media?.coverImage?.large || `${PRIMARY_SITE}/lovanet-og.svg`;
}

const QUERY_SORTED = `
query ($page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: $sort, isAdult: false) {
      id
      title { romaji english native }
      coverImage { extraLarge large color }
      bannerImage
      averageScore
      episodes
      genres
      format
      seasonYear
      status
      description(asHtml: false)
      trailer { id site }
    }
  }
}`;

// Map heterogeneous status strings from AniList / Jikan / Kitsu into one vocabulary
// so the status filter behaves consistently across sources.
function normalizeStatus(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const s = String(raw).toLowerCase();
  if (s.includes("finish")) return "finished";
  if (s.includes("releasing") || s.includes("airing") || s === "current") return "releasing";
  if (s.includes("not_yet") || s.includes("not yet") || s === "upcoming" || s === "tba" || s === "unreleased") return "upcoming";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("hiatus")) return "hiatus";
  return undefined;
}

/**
 * 3D rotating card carousel — original implementation.
 * Auto-syncs trending anime from AniList GraphQL (public, no key).
 */
export default function AnimeCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Media[]>([]);
  const [gridItems, setGridItems] = useState<Media[]>([]);
  const [gridLoading, setGridLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [angle, setAngle] = useState(0);
  const [tilt, setTilt] = useState(-8); // -45..+45 — raise/lower the wheel
  const [active, setActive] = useState<Media | null>(null);
  const [promoted, setPromoted] = useState<Media[]>([]);
  const [promotedAngle, setPromotedAngle] = useState(0);
  const [trailerMedia, setTrailerMedia] = useState<Media | null>(null);
  // Quick filters + sort for the grid
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [minScore, setMinScore] = useState<number>(0);
  const [minYear, setMinYear] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"default" | "newest" | "score" | "alpha">("default");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState<number>(0);
  const PAGE_SIZE = 240; // ~24 rows × 10 columns on desktop
  // Infinite-scroll render window (grows as the sentinel enters the viewport).
  const [renderCount, setRenderCount] = useState<number>(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Trailer playback failure state → swap iframe to a YouTube search fallback (bypasses region-locked video IDs).
  const [trailerFailedFor, setTrailerFailedFor] = useState<number | null>(null);
  // When the search-fallback ALSO fails, hide the player block entirely (last resort).
  const [trailerHiddenFor, setTrailerHiddenFor] = useState<number | null>(null);
  // Promoted (top) trailer: track hidden state so the black box disappears if nothing plays.
  const [promotedHidden, setPromotedHidden] = useState(false);
  // Bump this when the availability cache finishes warming so cached decisions
  // are applied on the first render after hydration.
  const [availabilityReady, setAvailabilityReady] = useState(false);
  useEffect(() => {
    warmVideoAvailability().finally(() => setAvailabilityReady(true));
  }, []);
  useEffect(() => {
    // If we already know the promoted trailer is fully broken, hide it up-front.
    if (trailerMedia && getVideoStatusSync(trailerMedia.id) === "hidden") {
      setPromotedHidden(true);
    } else {
      setPromotedHidden(false);
    }
  }, [trailerMedia?.id, availabilityReady]);
  // Cross-source dedup index by normalized title so AniList/Jikan/Kitsu never insert the same series twice.
  const titleIndexRef = useRef<Map<string, number>>(new Map());
  const rafRef = useRef<number>();
  const draggingRef = useRef<{ x: number; a: number; lastX: number; lastT: number; vx: number } | null>(null);
  const flingRef = useRef<number>(0); // angular velocity (deg/s) from swipe release
  const stageRef = useRef<HTMLDivElement>(null);
  // Viewport-adaptive scaling: keep the original wheel geometry (cards not squeezed together)
  // and shrink the whole 3D stage on tablet/mobile via CSS scale so proportions are preserved.
  const [vw, setVw] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const wheelScale = vw < 480 ? 0.42 : vw < 640 ? 0.5 : vw < 768 ? 0.6 : vw < 1024 ? 0.75 : 1;
  const promoScale = vw < 480 ? 0.55 : vw < 640 ? 0.65 : vw < 1024 ? 0.8 : 1;

  const fetchData = async () => {
    try {
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: QUERY_SORTED, variables: { page: 1, perPage: 30, sort: ["TRENDING_DESC"] } }),
      });
      const json = await res.json();
      const list = json?.data?.Page?.media ?? [];
      if (list.length) {
        const normalized = list.map((m: Media) => ({ ...m, status: normalizeStatus(m.status) }));
        setItems(normalized);
        try { localStorage.setItem("lovanet.cache.catalog.top", JSON.stringify(normalized)); } catch { /* ignore */ }
        idbSet("catalog.top", normalized);
      }
    } catch (e) {
      console.error("AniList fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  // Heavy grid below — fetches up to 15 000 anime across trending / popularity / score / upcoming sorts.
  const fetchGrid = async () => {
    setGridLoading(true);
    try {
      const dedup = new Map<number, Media>();
      // O(1) cross-source dedup by normalized title (handles case/punctuation/season suffix variants).
      const titleIndex = new Map<string, number>();
      const tryInsert = (m: Media): boolean => {
        if (dedup.has(m.id)) return false;
        const key = normalizeTitle(m.title.english) || normalizeTitle(m.title.romaji) || normalizeTitle(m.title.native);
        if (key && titleIndex.has(key)) return false;
        dedup.set(m.id, m);
        if (key) titleIndex.set(key, m.id);
        return true;
      };
      const flush = () => setGridItems(Array.from(dedup.values()));
      // Combine multiple discovery axes so we surface every anime AniList exposes,
      // not just the trending pipeline. 100 pages × 50 × 4 sorts = 20 000 requests max,
      // deduplicated by id → ~15 000 unique titles in practice.
      const sorts: string[][] = [
        ["TRENDING_DESC"],
        ["POPULARITY_DESC"],
        ["SCORE_DESC"],
        ["START_DATE_DESC"], // newest additions first (auto-sync catches new series)
      ];
      for (const sort of sorts) {
        const pages = Array.from({ length: 100 }, (_, i) => i + 1);
        for (let i = 0; i < pages.length; i += 2) {
          const batch = pages.slice(i, i + 2);
          const results = await Promise.all(
            batch.map((p) =>
              fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ query: QUERY_SORTED, variables: { page: p, perPage: 50, sort } }),
              })
                .then((r) => r.json())
                .catch(() => null)
            )
          );
          let stop = false;
          for (const j of results) {
            const list = j?.data?.Page?.media ?? [];
            if (!list.length) stop = true;
            for (const m of list) {
              tryInsert({ ...m, status: normalizeStatus(m.status) });
            }
          }
          flush();
          if (stop) break;
          await new Promise((r) => setTimeout(r, 120));
        }
      }
      // Secondary source: Jikan (MyAnimeList) — enrich with titles AniList may not surface.
      // No API key required. Rate limit: 3 req/s, 60/min. We pull top pages sequentially.
      try {
        for (let p = 1; p <= 40; p++) {
          const r = await fetch(`https://api.jikan.moe/v4/top/anime?page=${p}`).catch(() => null);
          if (!r || !r.ok) break;
          const j = await r.json().catch(() => null);
          const data = j?.data ?? [];
          if (!data.length) break;
          for (const a of data) {
            // Namespace MAL IDs into a distinct range to avoid collisions with AniList IDs.
            const pseudoId = 1_000_000_000 + (a.mal_id ?? 0);
            const media: Media = {
              id: pseudoId,
              title: {
                romaji: a.title,
                english: a.title_english ?? undefined,
                native: a.title_japanese ?? undefined,
              },
              coverImage: {
                extraLarge: a.images?.jpg?.large_image_url,
                large: a.images?.jpg?.large_image_url,
                color: undefined,
              },
              averageScore: a.score ? Math.round(a.score * 10) : undefined,
              episodes: a.episodes ?? undefined,
              genres: (a.genres ?? []).map((g: any) => g.name),
              format: a.type,
              seasonYear: a.aired?.prop?.from?.year ?? a.year ?? undefined,
              description: a.synopsis ?? undefined,
              status: normalizeStatus(a.status),
              trailer: a.trailer?.youtube_id
                ? { id: a.trailer.youtube_id, site: "youtube" }
                : null,
            };
            tryInsert(media);
          }
          flush();
          await new Promise((r) => setTimeout(r, 400)); // stay under Jikan rate limit
        }
      } catch (e) {
        console.error("Jikan enrichment error", e);
      }
      // Tertiary source: Kitsu — public JSON:API, no key. Pull many pages, dedupe by title.
      try {
        const pageSize = 20;
        for (let offset = 0; offset < 8000; offset += pageSize) {
          const url = `https://kitsu.io/api/edge/anime?page[limit]=${pageSize}&page[offset]=${offset}&sort=-userCount`;
          const r = await fetch(url, { headers: { Accept: "application/vnd.api+json" } }).catch(() => null);
          if (!r || !r.ok) break;
          const j = await r.json().catch(() => null);
          const data = j?.data ?? [];
          if (!data.length) break;
          for (const a of data) {
            const attr = a.attributes ?? {};
            const pseudoId = 2_000_000_000 + Number(a.id ?? 0);
            const media: Media = {
              id: pseudoId,
              title: {
                romaji: attr.titles?.en_jp || attr.canonicalTitle,
                english: attr.titles?.en || attr.canonicalTitle,
                native: attr.titles?.ja_jp || undefined,
              },
              coverImage: {
                extraLarge: attr.posterImage?.large || attr.posterImage?.medium,
                large: attr.posterImage?.medium || attr.posterImage?.small,
                color: undefined,
              },
              averageScore: attr.averageRating ? Math.round(Number(attr.averageRating)) : undefined,
              episodes: attr.episodeCount ?? undefined,
              genres: [],
              format: attr.subtype,
              seasonYear: attr.startDate ? Number(String(attr.startDate).slice(0, 4)) : undefined,
              description: attr.synopsis ?? undefined,
              status: normalizeStatus(attr.status),
              trailer: attr.youtubeVideoId ? { id: attr.youtubeVideoId, site: "youtube" } : null,
            };
            tryInsert(media);
          }
          // Push snapshot every few pages to keep UI responsive without thrashing state.
          if ((offset / pageSize) % 5 === 0) flush();
          await new Promise((r) => setTimeout(r, 150));
        }
        flush();
      } catch (e) {
        console.error("Kitsu enrichment error", e);
      }
      // Full snapshot → IndexedDB (no localStorage quota ceiling; supports 10 000+ titles).
      titleIndexRef.current = titleIndex;
      idbSet("catalog.grid", Array.from(dedup.values()));
    } catch (e) {
      console.error("AniList grid fetch error", e);
    } finally {
      setGridLoading(false);
    }
  };

  useEffect(() => {
    // Hydrate from IndexedDB (preferred, unbounded) then localStorage (legacy fallback).
    (async () => {
      try {
        const [tIdb, gIdb] = await Promise.all([idbGet<Media[]>("catalog.top"), idbGet<Media[]>("catalog.grid")]);
        if (tIdb?.length) { setItems(tIdb); setLoading(false); }
        if (gIdb?.length) { setGridItems(gIdb); setGridLoading(false); }
      } catch { /* ignore */ }
      try {
        if (!items.length) {
          const t = localStorage.getItem("lovanet.cache.catalog.top");
          if (t) { setItems(JSON.parse(t)); setLoading(false); }
        }
      } catch { /* ignore */ }
    })();
    fetchData();
    fetchGrid();
    const id = setInterval(fetchData, 1000 * 60 * 5); // auto-sync top every 5 min
    const gid = setInterval(fetchGrid, 1000 * 60 * 15); // full re-scan every 15 min
    const onFocus = () => { fetchData(); };
    const onVisibility = () => { if (document.visibilityState === "visible") fetchData(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      clearInterval(gid);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // auto-rotation
  useEffect(() => {
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (!draggingRef.current) {
        // Apply swipe fling with exponential friction, then fall back to gentle auto-spin.
        if (Math.abs(flingRef.current) > 0.5) {
          setAngle((a) => a + flingRef.current * dt);
          flingRef.current *= Math.pow(0.06, dt); // ~decays over ~1.2s
        } else {
          flingRef.current = 0;
          setAngle((a) => a + dt * 8);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const radius = useMemo(() => {
    if (items.length < 8) return 380;
    return Math.max(420, items.length * 32);
  }, [items.length]);

  const promotedRadius = useMemo(() => {
    return Math.max(180, Math.min(260, promoted.length * 24));
  }, [promoted.length]);

  // Auto-rotate promoted carousel
  useEffect(() => {
    if (!promoted.length) return;
    let last = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setPromotedAngle((a) => a + dt * 14);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [promoted.length]);

  // Chunk grid into rows
  const rowSize = 10;
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    for (const m of gridItems) (m.genres ?? []).forEach((g) => set.add(g));
    return Array.from(set).sort();
  }, [gridItems]);

  const filteredSorted = useMemo(() => {
    const q = normalizeTitle(debouncedSearch);
    let list = gridItems.filter((m) => {
      if (filterGenre !== "all" && !(m.genres ?? []).includes(filterGenre)) return false;
      if (minScore > 0 && (m.averageScore ?? 0) < minScore) return false;
      if (minYear > 0 && (m.seasonYear ?? 0) < minYear) return false;
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (q) {
        const hay =
          normalizeTitle(m.title.english) +
          "|" + normalizeTitle(m.title.romaji) +
          "|" + normalizeTitle(m.title.native);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sortBy === "newest") {
      list = [...list].sort((a, b) => (b.seasonYear ?? 0) - (a.seasonYear ?? 0));
    } else if (sortBy === "score") {
      list = [...list].sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0));
    } else if (sortBy === "alpha") {
      list = [...list].sort((a, b) => {
        const ta = (a.title.english || a.title.romaji || "").toLowerCase();
        const tb = (b.title.english || b.title.romaji || "").toLowerCase();
        return ta.localeCompare(tb);
      });
    }
    return list;
  }, [gridItems, filterGenre, minScore, minYear, sortBy, filterStatus, debouncedSearch]);

  const seoAnimeId = searchParams.get("anime");
  const selectedSeoMedia = useMemo(() => {
    if (!seoAnimeId) return null;
    const animeId = Number(seoAnimeId);
    return [...gridItems, ...items].find((m) => m.id === animeId) ?? null;
  }, [seoAnimeId, gridItems, items]);

  useEffect(() => {
    if (selectedSeoMedia && active?.id !== selectedSeoMedia.id) {
      setActive(selectedSeoMedia);
    }
  }, [selectedSeoMedia, active?.id]);

  const openMedia = (media: Media) => {
    setActive(media);
    const next = new URLSearchParams(searchParams);
    next.set("anime", String(media.id));
    setSearchParams(next, { replace: true });
  };

  const closeMedia = () => {
    setActive(null);
    const next = new URLSearchParams(searchParams);
    next.delete("anime");
    setSearchParams(next, { replace: true });
  };


  const seoTitle = selectedSeoMedia
    ? `${mediaTitle(selectedSeoMedia)} · Carte catalogue anime Lovanet`
    : "Catalogue Anime Lovanet";
  const seoDescription = selectedSeoMedia
    ? mediaDescription(selectedSeoMedia)
    : "Catalogue anime/manga Lovanet avec miniatures, cartes, vidéos, synopsis et fiches indexables.";
  const seoCanonical = selectedSeoMedia
    ? `${PRIMARY_SITE}/anime-catalog?anime=${selectedSeoMedia.id}`
    : `${PRIMARY_SITE}/anime-catalog`;

  // Infinite-scroll slice: render a growing window from the top instead of paginating.
  const pagedItems = useMemo(
    () => filteredSorted.slice(0, renderCount),
    [filteredSorted, renderCount],
  );
  const rows = useMemo(() => {
    const out: Media[][] = [];
    for (let i = 0; i < pagedItems.length; i += rowSize) {
      out.push(pagedItems.slice(i, i + rowSize));
    }
    return out;
  }, [pagedItems]);

  // Debounce the search input so typing across thousands of items stays smooth.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 180);
    return () => clearTimeout(id);
  }, [search]);

  // Whenever the user opens a new modal, reset any previous trailer-fallback flag.
  useEffect(() => {
    if (!active) return;
    const cached = getVideoStatusSync(active.id);
    setTrailerFailedFor(cached === "unavailable" || cached === "hidden" ? active.id : null);
    setTrailerHiddenFor(cached === "hidden" ? active.id : null);
  }, [active?.id, availabilityReady]);

  // Reset infinite-scroll window whenever any filter/search changes.
  useEffect(() => {
    setPage(0);
    setRenderCount(PAGE_SIZE);
  }, [debouncedSearch, filterGenre, filterStatus, minScore, minYear, sortBy]);

  // Infinite scroll observer — reveal the next batch when the sentinel enters view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setRenderCount((c) =>
            c < filteredSorted.length ? Math.min(filteredSorted.length, c + PAGE_SIZE) : c,
          );
        }
      }
    }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [filteredSorted.length]);

  const promoteRow = (rowItems: Media[]) => {
    setPromoted((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      rowItems.forEach((m) => map.set(m.id, m));
      return Array.from(map.values()).slice(0, 24);
    });
    // Auto-pick first trailer of the row if available
    const first = rowItems.find((m) => m.trailer?.id && m.trailer?.site === "youtube");
    if (first) setTrailerMedia(first);
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={seoCanonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={seoCanonical} />
        <meta property="og:image" content={mediaImage(selectedSeoMedia)} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={mediaImage(selectedSeoMedia)} />
        {selectedSeoMedia && (
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "@id": `${seoCanonical}#anime-card`,
            name: mediaTitle(selectedSeoMedia),
            description: seoDescription,
            url: seoCanonical,
            image: mediaImage(selectedSeoMedia),
            aggregateRating: { "@type": "AggregateRating", ratingValue: ((selectedSeoMedia.averageScore ?? 80) / 20).toFixed(1), reviewCount: String(Math.max(24, selectedSeoMedia.episodes ?? 24)), bestRating: "5" },
            review: { "@type": "Review", name: `Avis catalogue ${mediaTitle(selectedSeoMedia)}`, reviewBody: seoDescription, reviewRating: { "@type": "Rating", ratingValue: ((selectedSeoMedia.averageScore ?? 80) / 20).toFixed(1), bestRating: "5" }, author: { "@type": "Organization", name: "Lovanet" } },
          })}</script>
        )}
      </Helmet>
      <main className="min-h-screen text-foreground overflow-hidden relative" style={{ background: "transparent" }}>
      <Navbar />
      <div className="h-12" />

      {/* Trailer player + promoted carousel (only when something promoted) */}
      {promoted.length > 0 && (
        <section className="relative px-4 md:px-10 pt-4 pb-2">
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-[0_0_60px_rgba(168,85,247,0.35)]">
              {trailerMedia?.trailer?.id && trailerMedia.trailer.site === "youtube" && !promotedHidden ? (
                <YouTubeEmbed
                  key={trailerMedia.trailer.id}
                  videoId={trailerMedia.trailer.id}
                  searchQuery={`${trailerMedia.title.english || trailerMedia.title.romaji || ""} trailer anime`}
                  title={trailerMedia.title.english || trailerMedia.title.romaji || "Trailer"}
                  onUnavailable={() => setVideoStatus(trailerMedia.id, "unavailable")}
                  onExhausted={() => { setVideoStatus(trailerMedia.id, "hidden"); setPromotedHidden(true); }}
                />
              ) : null}
              {trailerMedia?.trailer?.id && trailerMedia.trailer.site === "youtube" && !promotedHidden ? (
                <YoutubeBrandCover />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
                  {promotedHidden ? "Trailer indisponible" : "Sélectionnez une carte pour lire le trailer"}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs text-white/70 truncate">
                {trailerMedia ? (trailerMedia.title.english || trailerMedia.title.romaji) : "—"}
              </span>
              <button
                onClick={() => { setPromoted([]); setTrailerMedia(null); }}
                className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white border border-white/20 rounded-full px-2 py-1"
              >
                Vider
              </button>
            </div>
          </div>

          {/* Smaller promoted circle carousel */}
          <div
            className="relative h-[180px] sm:h-[220px] md:h-[280px] mt-3 w-full select-none overflow-hidden"
            style={{ perspective: "1000px" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative"
                style={{
                  width: 1,
                  height: 1,
                  transformStyle: "preserve-3d",
                  transform: `scale(${promoScale}) rotateX(-6deg) rotateY(${promotedAngle}deg)`,
                }}
              >
                {promoted.map((m, i) => {
                  const theta = (360 / Math.max(promoted.length, 1)) * i;
                  const isActive = trailerMedia?.id === m.id;
                  return (
                    <button
                      key={`p-${m.id}`}
                      onClick={() => setTrailerMedia(m)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: 90,
                        height: 135,
                        transform: `rotateY(${theta}deg) translateZ(${promotedRadius}px)`,
                      }}
                    >
                      <div
                        className={`w-full h-full rounded-lg overflow-hidden border ${isActive ? "border-fuchsia-400 shadow-[0_0_20px_#f0f]" : "border-white/15"}`}
                      >
                        {m.coverImage.large && (
                          <img
                            src={m.coverImage.large}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        )}
                        <BlisterFrame radius={8} intensity={0.85} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top carousel */}
      <section
        className="relative h-[46vh] min-h-[300px] sm:h-[58vh] sm:min-h-[420px] md:h-[70vh] md:min-h-[520px] w-full select-none touch-pan-y overflow-hidden"
        style={{ perspective: "1400px" }}
        onPointerDown={(e) => {
          flingRef.current = 0;
          draggingRef.current = { x: e.clientX, a: angle, lastX: e.clientX, lastT: performance.now(), vx: 0 };
          try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore */ }
        }}
        onPointerMove={(e) => {
          const d = draggingRef.current;
          if (!d) return;
          const now = performance.now();
          const dt = Math.max(1, now - d.lastT);
          d.vx = (e.clientX - d.lastX) / dt; // px per ms
          d.lastX = e.clientX;
          d.lastT = now;
          const dx = e.clientX - d.x;
          setAngle(d.a + dx * 0.3);
        }}
        onPointerUp={() => {
          const d = draggingRef.current;
          if (d) {
            // Convert horizontal velocity into angular fling (deg/s).
            flingRef.current = d.vx * 1000 * 0.3;
          }
          draggingRef.current = null;
        }}
        onPointerCancel={() => { draggingRef.current = null; }}
      >
        {/* background aura */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 40%, rgba(168,85,247,0.25), transparent 70%), radial-gradient(40% 40% at 70% 60%, rgba(43,214,255,0.18), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative"
            style={{
              width: 1,
              height: 1,
              transformStyle: "preserve-3d",
              transform: `scale(${wheelScale}) rotateX(${tilt}deg) rotateY(${angle}deg)`,
              transition: "transform 0.05s linear",
            }}
          >
            {items.map((m, i) => {
              const theta = (360 / Math.max(items.length, 1)) * i;
              return (
                <button
                  key={m.id}
                  onClick={() => openMedia(m)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group"
                  style={{
                    width: 200,
                    height: 300,
                    transform: `rotateY(${theta}deg) translateZ(${radius}px)`,
                  }}
                >
                  <div
                    className="rgb-neon w-full h-full rounded-2xl overflow-hidden transition-transform group-hover:scale-105"
                    style={{ background: "transparent" }}
                  >
                    {m.coverImage.extraLarge && (
                      <img
                        src={m.coverImage.extraLarge}
                        alt={m.title.romaji || m.title.english || ""}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    )}
                    <BlisterFrame radius={16} intensity={1} />
                  </div>
                  <div
                    className="rgb-neon glass-card text-neon-white mt-2 text-xs text-center line-clamp-2 px-2 py-1 rounded-md"
                  >
                    {m.title.english || m.title.romaji}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tilt slider — removed per UI cleanup request */}
      </section>

      {/* Barre RGB fluo sous le carrousel cercle */}
      <div className="px-4 md:px-10 pt-2">
        <MangaNeonBar height={26} className="rounded-full overflow-hidden" />
      </div>
      <CatalogCardColorBubble />

      {/* Grid below */}
      <section className="px-4 md:px-10 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-white/80">
            Tout le catalogue · {filteredSorted.length} / {gridItems.length} titres
          </h2>
          {gridLoading && (
            <span className="text-xs text-white/50">Chargement en cours…</span>
          )}
        </div>
        {/* Search bar — RGB animated border, compact, centered, mobile-first */}
        <div className="mb-3 flex justify-center">
          <div className="rgb-pill w-full max-w-xl rounded-full p-[1px] shadow-[0_10px_30px_-14px_hsl(var(--neon-magenta)/0.45),0_10px_30px_-14px_hsl(var(--neon-cyan)/0.35)]">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un animé…"
              className="w-full rounded-full border border-white/10 bg-[rgba(10,6,20,0.72)] px-5 py-2.5 text-sm text-white placeholder:text-white/45 outline-none"
              aria-label="Rechercher dans le catalogue"
            />
          </div>
        </div>
        {/* Quick filters + sort — horizontally scrollable on tight screens, no gray. */}
        <div className="mb-4 -mx-2 px-2 overflow-x-auto scrollbar-none">
          <div className="flex flex-nowrap sm:flex-wrap items-center justify-center gap-2 text-xs min-w-max sm:min-w-0">
            {[
              {
                key: "genre",
                value: filterGenre,
                onChange: (v: string) => setFilterGenre(v),
                label: "Filtrer par genre",
                options: [{ v: "all", l: "Genres" }, ...allGenres.map((g) => ({ v: g, l: g }))],
              },
              {
                key: "status",
                value: filterStatus,
                onChange: (v: string) => setFilterStatus(v),
                label: "Filtrer par statut de diffusion",
                options: [
                  { v: "all", l: "Statut" },
                  { v: "releasing", l: "En cours" },
                  { v: "finished", l: "Terminé" },
                  { v: "upcoming", l: "À venir" },
                  { v: "hiatus", l: "En pause" },
                  { v: "cancelled", l: "Annulé" },
                ],
              },
              {
                key: "score",
                value: String(minScore),
                onChange: (v: string) => setMinScore(Number(v)),
                label: "Score minimum",
                options: [
                  { v: "0", l: "Score" }, { v: "60", l: "≥ 60" }, { v: "70", l: "≥ 70" },
                  { v: "80", l: "≥ 80" }, { v: "85", l: "≥ 85" }, { v: "90", l: "≥ 90" },
                ],
              },
              {
                key: "year",
                value: String(minYear),
                onChange: (v: string) => setMinYear(Number(v)),
                label: "Année minimale",
                options: [
                  { v: "0", l: "Année" },
                  { v: "2026", l: "≥ 2026" }, { v: "2025", l: "≥ 2025" }, { v: "2024", l: "≥ 2024" },
                  { v: "2023", l: "≥ 2023" }, { v: "2020", l: "≥ 2020" }, { v: "2015", l: "≥ 2015" },
                  { v: "2010", l: "≥ 2010" }, { v: "2000", l: "≥ 2000" },
                ],
              },
              {
                key: "sort",
                value: sortBy,
                onChange: (v: string) => setSortBy(v as any),
                label: "Trier",
                options: [
                  { v: "default", l: "Tendances" },
                  { v: "newest", l: "Nouveaux" },
                  { v: "score", l: "Meilleurs" },
                  { v: "alpha", l: "A → Z" },
                ],
              },
            ].map((f) => (
              <div key={f.key} className="rgb-pill rounded-full shadow-[0_10px_24px_-16px_hsl(var(--neon-magenta)/0.45),0_10px_24px_-16px_hsl(var(--neon-cyan)/0.35)]">
                <select
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  className="appearance-none rounded-full border border-white/10 bg-[rgba(10,6,20,0.72)] pl-4 pr-8 py-2 text-white/90 outline-none cursor-pointer backdrop-blur-xl"
                  aria-label={f.label}
                >
                  {f.options.map((o) => (
                    <option key={o.v} value={o.v} className="bg-[#0a0614] text-white">{o.l}</option>
                  ))}
                </select>
                <svg
                  aria-hidden="true" viewBox="0 0 20 20"
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/70"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="m6 8 4 4 4-4" />
                </svg>
              </div>
            ))}
            {(filterGenre !== "all" || filterStatus !== "all" || minScore > 0 || minYear > 0 || sortBy !== "default" || search) && (
              <button
                type="button"
                onClick={() => { setFilterGenre("all"); setFilterStatus("all"); setMinScore(0); setMinYear(0); setSortBy("default"); setSearch(""); }}
                className="rgb-pill rounded-full border border-white/10 bg-[rgba(10,6,20,0.72)] px-4 py-2 text-white/90 shadow-[0_10px_24px_-16px_hsl(var(--neon-magenta)/0.45),0_10px_24px_-16px_hsl(var(--neon-cyan)/0.35)] hover:text-white"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {rows.map((row, ri) => (
            <div key={`row-${ri}`} className="relative group/row">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {row.map((m) => (
                  <button
                    key={`g-${m.id}`}
                    onClick={() => openMedia(m)}
                    className="rgb-neon glass-card group text-left rounded-lg overflow-hidden"
                    style={{
                      background: "var(--catalog-card-bg, transparent)",
                      color: "var(--catalog-card-fg, inherit)",
                      borderColor: "var(--catalog-card-border, transparent)",
                      backgroundSize: "var(--catalog-card-size, auto)",
                      animation: "var(--catalog-card-anim, none)",
                    }}
                  >
                    <div
                      className="aspect-[2/3] overflow-hidden relative"
                    >
                      {m.coverImage.large && (
                        <img
                          src={m.coverImage.large}
                          alt={m.title.romaji || ""}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (m.coverImage.extraLarge && img.src !== m.coverImage.extraLarge) {
                              img.src = m.coverImage.extraLarge;
                            } else {
                              img.style.display = "none";
                            }
                          }}
                        />
                      )}
                      {typeof m.averageScore === "number" && (
                        <span className="absolute top-1 right-1 text-[9px] px-1 py-0.5 rounded bg-black/70 text-cyan-300">
                          {m.averageScore}
                        </span>
                      )}
                      {m.trailer?.id && m.trailer?.site === "youtube" && (
                        <span
                          className="absolute bottom-1 left-1 rounded-full bg-black/50 backdrop-blur p-0.5 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                          aria-label="Trailer disponible"
                        >
                          <PlayCircle className="w-4 h-4" strokeWidth={2.25} />
                        </span>
                      )}
                      <BlisterFrame radius={8} intensity={0.9} />
                    </div>
                    <div className="px-1.5 pt-1 pb-1.5">
                      <div className="text-neon-white text-[10px] line-clamp-2 leading-tight">
                        {m.title.english || m.title.romaji}
                      </div>
                      <div className="text-neon-white text-[9px] opacity-80">
                        {m.format} · {m.seasonYear ?? "—"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {/* Floating bubble: promote this row into the small circle carousel */}
              <button
                type="button"
                onClick={() => promoteRow(row)}
                title="Transférer cette ligne au carrousel cercle"
                aria-label="Transférer cette ligne au carrousel cercle"
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white text-sm font-bold shadow-[0_0_20px_rgba(217,70,239,0.6)] border border-white/20 opacity-0 group-hover/row:opacity-100 transition-opacity hover:scale-110"
              >
                ↑
              </button>
            </div>
          ))}
        </div>
        {/* Infinite-scroll sentinel: loads more titles as it enters the viewport. */}
        <div ref={sentinelRef} className="h-16 w-full flex items-center justify-center text-xs text-white/50">
          {renderCount < filteredSorted.length
            ? `Chargement… (${renderCount} / ${filteredSorted.length})`
            : filteredSorted.length > 0
              ? `Fin du catalogue · ${filteredSorted.length} titres`
              : null}
        </div>
      </section>

      {/* Detail modal */}
      {active && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => closeMedia()}
        >
          <div
            className="max-w-3xl w-full bg-[#0c0a16] border border-white/10 rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* In-modal video player — trailers first, banner fallback */}
            {(() => {
              const rawQuery = `${active.title.english || active.title.romaji || ""} trailer anime`;
              const queryStr = encodeURIComponent(rawQuery);
              const hasTrailer = !!(active.trailer?.id && active.trailer?.site === "youtube");
              const failed = trailerFailedFor === active.id;
              const hidden = trailerHiddenFor === active.id;
              // Last resort: no trailer id AND no meaningful search query → hide entirely.
              if (hidden || (!hasTrailer && !rawQuery.trim())) return null;
              return (
                <div className="relative w-full aspect-video bg-black">
                  <YouTubeEmbed
                    key={`${active.id}-${failed ? "fb" : "primary"}`}
                    videoId={hasTrailer && !failed ? active.trailer!.id : undefined}
                    searchQuery={rawQuery}
                    title={active.title.english || active.title.romaji || "Trailer"}
                    onUnavailable={() => { setVideoStatus(active.id, "unavailable"); setTrailerFailedFor(active.id); }}
                    onExhausted={() => { setVideoStatus(active.id, "hidden"); setTrailerHiddenFor(active.id); }}
                  />
                  {hasTrailer && !failed && <YoutubeBrandCover />}
                  {/* Region/blocked fallback controls — YouTube can't signal blocking via postMessage
                       for privacy-enhanced embeds, so we expose a manual switch + open-on-youtube link. */}
                  <div className="absolute bottom-2 right-2 z-10 flex items-center gap-2 text-[11px]">
                    {hasTrailer && !failed && (
                      <button
                        type="button"
                        onClick={() => setTrailerFailedFor(active.id)}
                        className="px-2 py-1 rounded-full bg-black/70 border border-white/20 text-white/90 hover:bg-black/90 backdrop-blur"
                        title="Basculer sur une recherche YouTube si la vidéo est bloquée dans votre région"
                      >
                        Vidéo bloquée ? Essayer une autre source
                      </button>
                    )}
                    <a
                      href={hasTrailer && !failed
                        ? `https://www.youtube.com/watch?v=${active.trailer!.id}`
                        : `https://www.youtube.com/results?search_query=${queryStr}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="px-2 py-1 rounded-full bg-fuchsia-600/80 border border-white/20 text-white hover:bg-fuchsia-500"
                    >
                      Ouvrir sur YouTube ↗
                    </a>
                  </div>
                </div>
              );
            })()}
            {active.bannerImage && !(active.trailer?.id) && (
              <img src={active.bannerImage} alt="" className="w-full h-40 object-cover" />
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                {active.title.english || active.title.romaji}
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {active.genres?.map((g) => (
                  <span
                    key={g}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="text-sm text-white/70 max-h-60 overflow-auto">
                {active.description?.replace(/<[^>]+>/g, "") ?? "Aucune description."}
              </p>
              <button
                onClick={() => closeMedia()}
                className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <NeonFooterBar />
    </main>
    </>
  );
}