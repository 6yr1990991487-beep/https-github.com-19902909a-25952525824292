import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import NeonFooterBar from "@/components/NeonFooterBar";
import MangaNeonBar from "@/components/MangaNeonBar";
import { Navbar } from "@/components/Navbar";
import CatalogCardColorBubble from "@/components/CatalogCardColorBubble";
import BlisterFrame from "@/components/BlisterFrame";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarRange,
  Check,
  Clapperboard,
  Heart,
  Info,
  Pause,
  PictureInPicture2,
  Play,
  PlayCircle,
  Search,
  SkipBack,
  SkipForward,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { idbGet, idbSet, normalizeTitle } from "@/lib/animeCache";
import { warmVideoAvailability, getVideoStatusSync, setVideoStatus } from "@/lib/videoAvailability";

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
  status?: string;
};

type PlayerMode = "video" | "fallback" | "hidden";

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
      window?: Window | null;
    };
  }
}

const PRIMARY_SITE = "https://lovanet.fr";
const FAVORITES_STORAGE_KEY = "lovanet.catalog.favorites.v2";

function mediaTitle(media: Media | null | undefined) {
  if (!media) return "Catalogue Anime Lovanet";
  return media.title.english || media.title.romaji || media.title.native || `Anime ${media.id}`;
}

function mediaDescription(media: Media | null | undefined) {
  const raw = String(
    media?.description || "Catalogue anime manga avec miniatures, bandes-annonces, synopsis et cartes indexables.",
  );
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
}

function mediaImage(media: Media | null | undefined) {
  return media?.bannerImage || media?.coverImage?.extraLarge || media?.coverImage?.large || `${PRIMARY_SITE}/lovanet-og.svg`;
}

function hasTrailer(media: Media | null | undefined) {
  return Boolean(media?.trailer?.id && media?.trailer?.site === "youtube");
}

function hasPlayableVideo(media: Media | null | undefined) {
  return Boolean(hasTrailer(media) || mediaTitle(media).trim());
}

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

export default function AnimeCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Media[]>([]);
  const [gridItems, setGridItems] = useState<Media[]>([]);
  const [gridLoading, setGridLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [detailMedia, setDetailMedia] = useState<Media | null>(null);
  const [playerMode, setPlayerMode] = useState<PlayerMode>("video");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const [pipOpen, setPipOpen] = useState(false);
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [minScore, setMinScore] = useState<string>("0");
  const [minYear, setMinYear] = useState<string>("0");
  const [sortBy, setSortBy] = useState<"default" | "newest" | "score" | "alpha">("default");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showVideoPrompt, setShowVideoPrompt] = useState(true);
  const PAGE_SIZE = 48;
  const [renderCount, setRenderCount] = useState<number>(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const playerInstanceRef = useRef<any>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const suggestionPreparedRef = useRef(false);

  useEffect(() => {
    warmVideoAvailability().finally(() => setAvailabilityReady(true));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed.map((value) => Number(value)).filter((value) => Number.isFinite(value)));
      }
    } catch {
      // ignore persisted favorites failures
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // ignore persistence failures
    }
  }, [favoriteIds]);

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
        try {
          localStorage.setItem("lovanet.cache.catalog.top", JSON.stringify(normalized));
        } catch {
          // ignore
        }
        idbSet("catalog.top", normalized);
      }
    } catch (e) {
      console.error("AniList fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrid = async () => {
    setGridLoading(true);
    try {
      const dedup = new Map<number, Media>();
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
      const sorts: string[][] = [["TRENDING_DESC"], ["POPULARITY_DESC"], ["SCORE_DESC"], ["START_DATE_DESC"]];

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
                .catch(() => null),
            ),
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
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
      }

      try {
        for (let p = 1; p <= 40; p++) {
          const r = await fetch(`https://api.jikan.moe/v4/top/anime?page=${p}`).catch(() => null);
          if (!r || !r.ok) break;
          const j = await r.json().catch(() => null);
          const data = j?.data ?? [];
          if (!data.length) break;
          for (const a of data) {
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
              trailer: a.trailer?.youtube_id ? { id: a.trailer.youtube_id, site: "youtube" } : null,
            };
            tryInsert(media);
          }
          flush();
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      } catch (e) {
        console.error("Jikan enrichment error", e);
      }

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
          if ((offset / pageSize) % 5 === 0) flush();
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
        flush();
      } catch (e) {
        console.error("Kitsu enrichment error", e);
      }

      idbSet("catalog.grid", Array.from(dedup.values()));
    } catch (e) {
      console.error("AniList grid fetch error", e);
    } finally {
      setGridLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [topIdb, gridIdb] = await Promise.all([idbGet<Media[]>("catalog.top"), idbGet<Media[]>("catalog.grid")]);
        if (topIdb?.length) {
          setItems(topIdb);
          setLoading(false);
        }
        if (gridIdb?.length) {
          setGridItems(gridIdb);
          setGridLoading(false);
        }
      } catch {
        // ignore cache hydration failures
      }
      try {
        const top = localStorage.getItem("lovanet.cache.catalog.top");
        if (top) {
          setItems(JSON.parse(top));
          setLoading(false);
        }
      } catch {
        // ignore
      }
    })();

    fetchData();
    fetchGrid();
    const id = setInterval(fetchData, 1000 * 60 * 5);
    const gridId = setInterval(fetchGrid, 1000 * 60 * 15);
    const onFocus = () => fetchData();
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(id);
      clearInterval(gridId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 180);
    return () => clearTimeout(id);
  }, [search]);

  const allMedia = useMemo(() => {
    const merged = [...items, ...gridItems];
    const map = new Map<number, Media>();
    for (const media of merged) {
      if (!map.has(media.id)) map.set(media.id, media);
    }
    return Array.from(map.values());
  }, [items, gridItems]);

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    for (const media of gridItems) (media.genres ?? []).forEach((genre) => set.add(genre));
    return Array.from(set).sort();
  }, [gridItems]);

  const filteredSorted = useMemo(() => {
    const q = normalizeTitle(debouncedSearch);
    let list = gridItems.filter((media) => {
      if (filterGenre !== "all" && !(media.genres ?? []).includes(filterGenre)) return false;
      if (Number(minScore) > 0 && (media.averageScore ?? 0) < Number(minScore)) return false;
      if (Number(minYear) > 0 && (media.seasonYear ?? 0) < Number(minYear)) return false;
      if (filterStatus !== "all" && media.status !== filterStatus) return false;
      if (q) {
        const haystack = `${normalizeTitle(media.title.english)}|${normalizeTitle(media.title.romaji)}|${normalizeTitle(media.title.native)}`;
        if (!haystack.includes(q)) return false;
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
  }, [debouncedSearch, filterGenre, filterStatus, gridItems, minScore, minYear, sortBy]);

  const videoSuggestionItems = useMemo(() => filteredSorted.filter((media) => hasPlayableVideo(media)).slice(0, 10), [filteredSorted]);
  const promptPreviewItems = useMemo(() => {
    const source = videoSuggestionItems.length ? videoSuggestionItems : allMedia.filter((media) => hasPlayableVideo(media));
    return source.slice(0, 10);
  }, [allMedia, videoSuggestionItems]);
  const featuredRail = useMemo(() => items.filter((media) => hasPlayableVideo(media)).slice(0, 8), [items]);
  const seoAnimeId = searchParams.get("anime");

  const selectedSeoMedia = useMemo(() => {
    if (!seoAnimeId) return null;
    const animeId = Number(seoAnimeId);
    return allMedia.find((media) => media.id === animeId) ?? null;
  }, [allMedia, seoAnimeId]);

  const favoriteItems = useMemo(() => {
    const map = new Map(allMedia.map((media) => [media.id, media]));
    return favoriteIds.map((id) => map.get(id)).filter(Boolean) as Media[];
  }, [allMedia, favoriteIds]);

  const playerQueue = useMemo(() => favoriteItems.filter((media) => hasTrailer(media)), [favoriteItems]);

  const activePlayer = useMemo(() => {
    if (activePlayerId == null) return null;
    return allMedia.find((media) => media.id === activePlayerId) ?? null;
  }, [activePlayerId, allMedia]);

  const pagedItems = useMemo(() => filteredSorted.slice(0, renderCount), [filteredSorted, renderCount]);

  const syncSearchParam = (media: Media | null) => {
    const next = new URLSearchParams(searchParams);
    if (media) next.set("anime", String(media.id));
    else next.delete("anime");
    setSearchParams(next, { replace: true });
  };

  const unlockSound = () => {
    setSoundUnlocked(true);
    if (!playerInstanceRef.current) return;
    try {
      playerInstanceRef.current.unMute?.();
      playerInstanceRef.current.playVideo?.();
      setIsMuted(false);
      setIsPlaying(true);
    } catch {
      // ignore player sound unlock failures
    }
  };

  const activatePlayer = (media: Media, options?: { forceFavorite?: boolean; unlockSound?: boolean }) => {
    if (options?.forceFavorite) {
      setFavoriteIds((current) => (current.includes(media.id) ? current : [media.id, ...current]));
    }
    if (options?.unlockSound) {
      setSoundUnlocked(true);
    }
    setActivePlayerId(media.id);
    syncSearchParam(media);
  };

  const toggleFavorite = (media: Media) => {
    const isFavorite = favoriteIds.includes(media.id);
    setFavoriteIds((current) => {
      if (isFavorite) return current.filter((id) => id !== media.id);
      return [media.id, ...current];
    });
    if (isFavorite && activePlayerId === media.id) {
      const remaining = favoriteIds.filter((id) => id !== media.id);
      const nextId = remaining[0] ?? videoSuggestionItems[0]?.id ?? null;
      setActivePlayerId(nextId);
      syncSearchParam(nextId ? allMedia.find((entry) => entry.id === nextId) ?? null : null);
    }
  };

  const handlePrevious = () => {
    unlockSound();
    if (!playerQueue.length) return;
    const currentIndex = playerQueue.findIndex((media) => media.id === activePlayerId);
    const nextIndex = currentIndex <= 0 ? playerQueue.length - 1 : currentIndex - 1;
    activatePlayer(playerQueue[nextIndex], { unlockSound: true });
  };

  const handleNext = () => {
    unlockSound();
    if (!playerQueue.length) return;
    const currentIndex = playerQueue.findIndex((media) => media.id === activePlayerId);
    const nextIndex = currentIndex === -1 || currentIndex === playerQueue.length - 1 ? 0 : currentIndex + 1;
    activatePlayer(playerQueue[nextIndex], { unlockSound: true });
  };

  const togglePlayback = () => {
    if (!playerInstanceRef.current || !activePlayer || !hasTrailer(activePlayer)) return;
    unlockSound();
    try {
      const state = playerInstanceRef.current.getPlayerState?.();
      if (state === 1) {
        playerInstanceRef.current.pauseVideo?.();
        setIsPlaying(false);
      } else {
        playerInstanceRef.current.playVideo?.();
        setIsPlaying(true);
      }
    } catch {
      // ignore YouTube control failures
    }
  };

  const toggleMute = () => {
    if (!playerInstanceRef.current || !activePlayer || !hasTrailer(activePlayer)) return;
    if (!soundUnlocked) {
      unlockSound();
      return;
    }
    try {
      const muted = playerInstanceRef.current.isMuted?.();
      if (muted) {
        playerInstanceRef.current.unMute?.();
        setIsMuted(false);
      } else {
        playerInstanceRef.current.mute?.();
        setIsMuted(true);
      }
    } catch {
      // ignore YouTube control failures
    }
  };

  const addSuggestedSelectionToFavorites = () => {
    const ids = videoSuggestionItems.map((media) => media.id);
    setFavoriteIds((current) => Array.from(new Set([...ids, ...current])));
    if (!activePlayer && videoSuggestionItems[0]) {
      activatePlayer(videoSuggestionItems[0]);
    }
    setShowVideoPrompt(false);
  };

  const playSuggestedSelectionNow = () => {
    if (!videoSuggestionItems[0]) return;
    addSuggestedSelectionToFavorites();
    activatePlayer(videoSuggestionItems[0], { forceFavorite: true, unlockSound: true });
    setShowVideoPrompt(false);
  };

  const openMiniPlayer = async () => {
    if (!activePlayer) return;
    const trailerUrl = hasTrailer(activePlayer)
      ? `https://www.youtube-nocookie.com/embed/${activePlayer.trailer?.id}?autoplay=1&mute=${soundUnlocked ? 0 : 1}&controls=0&rel=0&modestbranding=1&playsinline=1`
      : null;

    try {
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        pipWindowRef.current.close();
        pipWindowRef.current = null;
        setPipOpen(false);
        return;
      }

      if (window.documentPictureInPicture?.requestWindow) {
        const pipWindow = await window.documentPictureInPicture.requestWindow({ width: 430, height: 260 });
        pipWindowRef.current = pipWindow;
        pipWindow.document.head.innerHTML = `<style>
          body{margin:0;background:#050b16;color:#f7faff;font-family:Inter,Arial,sans-serif;display:flex;height:100vh;}
          .pip-shell{position:relative;display:flex;flex-direction:column;width:100%;height:100%;background:radial-gradient(circle at top right, rgba(244,114,182,.16), transparent 30%), radial-gradient(circle at left bottom, rgba(56,189,248,.16), transparent 32%), #050b16;}
          .pip-media{flex:1;display:flex;align-items:center;justify-content:center;background:#000;overflow:hidden;}
          iframe,img{width:100%;height:100%;border:0;object-fit:cover;}
          .pip-meta{padding:10px 12px;border-top:1px solid rgba(255,255,255,.08);background:rgba(10,14,24,.82);}
          .pip-title{font-size:13px;font-weight:700;margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
          .pip-sub{font-size:11px;opacity:.72;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        </style>`;
        pipWindow.document.body.innerHTML = "";
        const shell = pipWindow.document.createElement("div");
        shell.className = "pip-shell";
        shell.innerHTML = `
          <div class="pip-media">
            ${trailerUrl ? `<iframe src="${trailerUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="${mediaTitle(activePlayer)}"></iframe>` : `<img src="${mediaImage(activePlayer)}" alt="${mediaTitle(activePlayer)}" />`}
          </div>
          <div class="pip-meta">
            <p class="pip-title">${mediaTitle(activePlayer)}</p>
            <p class="pip-sub">${activePlayer.format || "Anime"} · ${activePlayer.seasonYear || "Catalogue Lovanet"}</p>
          </div>
        `;
        pipWindow.document.body.appendChild(shell);
        setPipOpen(true);
        pipWindow.addEventListener(
          "pagehide",
          () => {
            pipWindowRef.current = null;
            setPipOpen(false);
          },
          { once: true },
        );
        return;
      }

      if (trailerUrl) {
        window.open(trailerUrl, "_blank", "noopener,noreferrer,width=430,height=260");
        setPipOpen(true);
      }
    } catch (error) {
      console.error("PiP error", error);
    }
  };

  useEffect(() => {
    if (!allMedia.length) return;
    if (selectedSeoMedia && activePlayerId !== selectedSeoMedia.id) {
      setActivePlayerId(selectedSeoMedia.id);
      return;
    }
    if (activePlayerId == null && favoriteIds.length) {
      const nextFavorite = favoriteIds.find((id) => allMedia.some((media) => media.id === id));
      if (typeof nextFavorite === "number") {
        setActivePlayerId(nextFavorite);
      }
    }
  }, [activePlayerId, allMedia, favoriteIds, selectedSeoMedia]);

  useEffect(() => {
    if (activePlayerId == null) return;
    const stillExists = allMedia.some((media) => media.id === activePlayerId);
    if (!stillExists) {
      const nextId = favoriteIds[0] ?? videoSuggestionItems[0]?.id ?? null;
      setActivePlayerId(nextId);
      syncSearchParam(nextId ? allMedia.find((entry) => entry.id === nextId) ?? null : null);
    }
  }, [activePlayerId, allMedia, favoriteIds, videoSuggestionItems]);

  useEffect(() => {
    if (!activePlayer) {
      setPlayerMode("video");
      setIsPlaying(false);
      setIsMuted(true);
      return;
    }
    const cached = getVideoStatusSync(activePlayer.id);
    if (cached === "hidden") setPlayerMode("hidden");
    else if (cached === "unavailable") setPlayerMode("fallback");
    else setPlayerMode("video");
    setIsPlaying(hasTrailer(activePlayer));
    setIsMuted(!soundUnlocked);
  }, [activePlayer?.id, availabilityReady, soundUnlocked]);

  useEffect(() => {
    if (suggestionPreparedRef.current) return;
    if (loading || gridLoading || !promptPreviewItems.length) return;
    suggestionPreparedRef.current = true;
    if (!activePlayerId) {
      setActivePlayerId(promptPreviewItems[0].id);
      syncSearchParam(promptPreviewItems[0]);
    }
    setShowVideoPrompt(true);
  }, [activePlayerId, gridLoading, loading, promptPreviewItems]);

  useEffect(() => {
    setRenderCount(PAGE_SIZE);
  }, [debouncedSearch, filterGenre, filterStatus, minScore, minYear, sortBy]);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRenderCount((count) => (count < filteredSorted.length ? Math.min(filteredSorted.length, count + PAGE_SIZE) : count));
          }
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(element);
    return () => io.disconnect();
  }, [filteredSorted.length]);

  useEffect(() => {
    return () => {
      try {
        pipWindowRef.current?.close();
      } catch {
        // ignore PiP cleanup failures
      }
    };
  }, []);

  const seoTitle = selectedSeoMedia ? `${mediaTitle(selectedSeoMedia)} · Lecteur catalogue anime Lovanet` : "Catalogue Anime Lovanet";
  const seoDescription = selectedSeoMedia
    ? mediaDescription(selectedSeoMedia)
    : "Catalogue anime/manga Lovanet avec lecteur géant, lecture auto, favoris persistants et fiches vidéo indexables.";
  const seoCanonical = selectedSeoMedia ? `${PRIMARY_SITE}/anime-catalog?anime=${selectedSeoMedia.id}` : `${PRIMARY_SITE}/anime-catalog`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={seoCanonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={seoCanonical} />
        <meta property="og:image" content={mediaImage(selectedSeoMedia || activePlayer)} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={mediaImage(selectedSeoMedia || activePlayer)} />
        {selectedSeoMedia && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              "@id": `${seoCanonical}#anime-card`,
              name: mediaTitle(selectedSeoMedia),
              description: seoDescription,
              url: seoCanonical,
              image: mediaImage(selectedSeoMedia),
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: ((selectedSeoMedia.averageScore ?? 80) / 20).toFixed(1),
                reviewCount: String(Math.max(24, selectedSeoMedia.episodes ?? 24)),
                bestRating: "5",
              },
              review: {
                "@type": "Review",
                name: `Avis catalogue ${mediaTitle(selectedSeoMedia)}`,
                reviewBody: seoDescription,
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: ((selectedSeoMedia.averageScore ?? 80) / 20).toFixed(1),
                  bestRating: "5",
                },
                author: { "@type": "Organization", name: "Lovanet" },
              },
            })}
          </script>
        )}
      </Helmet>

      <main className="min-h-screen overflow-hidden text-foreground" style={{ background: "transparent" }}>
        <Navbar />
        <div className="h-12" />

        <section className="px-4 pb-5 pt-4 md:px-8 xl:px-10" data-testid="catalog-premium-player-section">
          <div className="mx-auto max-w-[1120px] space-y-6">
            <header className="theme-panel-surface relative overflow-hidden rounded-[2rem] border border-[var(--theme-border-soft)] p-5 sm:p-6 lg:p-8" data-testid="catalog-premium-hero">
              <div
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                  background:
                    "radial-gradient(circle at 18% 18%, rgba(56,189,248,0.16), transparent 22%), radial-gradient(circle at 82% 16%, rgba(244,114,182,0.12), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.03), transparent 42%)",
                }}
              />
              <div className="relative grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
                <div className="space-y-4">
                  <Badge className="inline-flex rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/84" data-testid="catalog-premium-eyebrow">
                    Catalogue vidéo géant
                  </Badge>
                  <div className="space-y-3">
                    <h1 className="font-display text-3xl font-black leading-[1.02] text-white sm:text-4xl md:text-5xl" data-testid="catalog-premium-title">
                      Un écran principal lumineux pour piloter tout le catalogue.
                    </h1>
                    <p className="max-w-3xl text-sm leading-7 text-white/72 sm:text-base" data-testid="catalog-premium-description">
                      Per design guidelines, utilisation des accents cyan, magenta et violet du thème existant pour le halo du lecteur et les repères visuels, tandis que les cartes passent sur des panneaux plus transparents et brillants façon blister verre.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3" data-testid="catalog-premium-metrics">
                  <Card className="theme-subpanel border-none bg-transparent text-white">
                    <CardContent className="p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Favoris</p>
                      <p className="mt-2 font-display text-3xl font-black" data-testid="catalog-favorites-count">{favoriteItems.length}</p>
                      <p className="mt-1 text-sm text-white/62">Playlist persistante locale</p>
                    </CardContent>
                  </Card>
                  <Card className="theme-subpanel border-none bg-transparent text-white">
                    <CardContent className="p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Vidéos prêtes</p>
                      <p className="mt-2 font-display text-3xl font-black" data-testid="catalog-ready-trailers-count">{playerQueue.length}</p>
                      <p className="mt-1 text-sm text-white/62">Lecture auto stabilisée</p>
                    </CardContent>
                  </Card>
                  <Card className="theme-subpanel border-none bg-transparent text-white">
                    <CardContent className="p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Catalogue visible</p>
                      <p className="mt-2 font-display text-3xl font-black" data-testid="catalog-visible-count">{filteredSorted.length}</p>
                      <p className="mt-1 text-sm text-white/62">Titres filtrés instantanément</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </header>

            {showVideoPrompt && !!videoSuggestionItems.length && (
              <Card className="theme-panel-surface relative overflow-hidden rounded-[1.8rem] border border-[var(--theme-border-soft)] bg-transparent text-white" data-testid="catalog-video-selection-panel">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <Badge className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/82">
                        Sélection vidéo détectée
                      </Badge>
                      <h2 className="font-display text-2xl font-black" data-testid="catalog-video-selection-title">
                        {promptPreviewItems.length} cartes vidéo prêtes à être lues ou ajoutées aux favoris.
                      </h2>
                      <p className="max-w-3xl text-sm leading-7 text-white/68" data-testid="catalog-video-selection-description">
                        {videoSuggestionItems.length} cartes vidéo ont été détectées dans le flux courant. Vous pouvez les ajouter en favoris, ou lancer tout de suite la lecture sur le grand écran.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="glass"
                      className="h-11 w-11 rounded-full text-white"
                      onClick={() => setShowVideoPrompt(false)}
                      data-testid="catalog-video-selection-close-button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5" data-testid="catalog-video-selection-grid">
                    {(promptPreviewItems.length ? promptPreviewItems : pagedItems.slice(0, 5)).slice(0, 5).map((media) => (
                      <button
                        key={`suggestion-${media.id}`}
                        type="button"
                        onClick={() => activatePlayer(media, { unlockSound: true, forceFavorite: true })}
                        className="rounded-[1.35rem] border border-white/12 bg-[rgba(255,255,255,0.03)] p-2 text-left transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-white/28 hover:shadow-[0_18px_36px_rgba(6,12,24,0.26)]"
                        data-testid={`catalog-video-selection-item-${media.id}`}
                      >
                        <div className="relative aspect-[5/8] overflow-hidden rounded-[1.1rem] border border-white/10 bg-black/30">
                          <img src={mediaImage(media)} alt={mediaTitle(media)} className="h-full w-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(5,10,24,0.58))]" />
                          <BlisterFrame radius={16} intensity={0.9} />
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm font-semibold text-white">{mediaTitle(media)}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button className="btn-neon-rainbow rounded-full text-white" onClick={addSuggestedSelectionToFavorites} data-testid="catalog-video-selection-add-button">
                      <Check className="h-4 w-4" /> Ajouter la sélection aux favoris
                    </Button>
                    <Button variant="glass" className="rounded-full text-white" onClick={playSuggestedSelectionNow} data-testid="catalog-video-selection-play-button">
                      <Play className="h-4 w-4" /> Lire maintenant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="theme-panel-surface relative overflow-hidden rounded-[2rem] border border-[var(--theme-border-soft)] p-4 sm:p-5 lg:p-6" data-testid="catalog-giant-player-shell">
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    "radial-gradient(circle at 15% 18%, rgba(56,189,248,0.2), transparent 18%), radial-gradient(circle at 84% 20%, rgba(244,114,182,0.14), transparent 20%), radial-gradient(circle at 50% 100%, rgba(139,92,246,0.12), transparent 24%)",
                }}
              />

              {loading && !items.length ? (
                <div className="relative space-y-5" data-testid="catalog-player-loading-state">
                  <Skeleton className="h-[260px] rounded-[1.75rem] bg-white/10 sm:h-[420px]" />
                  <div className="grid gap-3 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={`catalog-skeleton-${index}`} className="h-20 rounded-2xl bg-white/10" />
                    ))}
                  </div>
                </div>
              ) : activePlayer ? (
                <div className="relative space-y-5">
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black" data-testid="catalog-giant-player-stage">
                    <div className="aspect-[16/9] min-h-[280px] sm:min-h-[440px]">
                      {hasTrailer(activePlayer) && playerMode !== "hidden" ? (
                        <div className="relative h-full w-full">
                          <YouTubeEmbed
                            key={`catalog-player-${activePlayer.id}-${playerMode}`}
                            videoId={playerMode === "video" ? activePlayer.trailer?.id : undefined}
                            searchQuery={`${mediaTitle(activePlayer)} bande annonce anime`}
                            title={mediaTitle(activePlayer)}
                            autoplay
                            muted={!soundUnlocked}
                            hideControls
                            onPlayerReady={(player) => {
                              playerInstanceRef.current = player;
                              if (!player) return;
                              try {
                                if (soundUnlocked) {
                                  player.unMute?.();
                                  setIsMuted(false);
                                } else {
                                  player.mute?.();
                                  setIsMuted(true);
                                }
                                player.playVideo?.();
                                setIsPlaying(true);
                              } catch {
                                setIsPlaying(true);
                              }
                            }}
                            onPlayerStateChange={(state) => {
                              if (state === 1) setIsPlaying(true);
                              if (state === 2) setIsPlaying(false);
                              if (state === 0) {
                                setIsPlaying(false);
                                if (playerQueue.length > 1) {
                                  const currentIndex = playerQueue.findIndex((media) => media.id === activePlayer.id);
                                  const nextIndex = currentIndex === -1 || currentIndex === playerQueue.length - 1 ? 0 : currentIndex + 1;
                                  activatePlayer(playerQueue[nextIndex], { unlockSound: soundUnlocked });
                                }
                              }
                            }}
                            onUnavailable={() => {
                              setVideoStatus(activePlayer.id, "unavailable");
                              setPlayerMode("fallback");
                            }}
                            onExhausted={() => {
                              setVideoStatus(activePlayer.id, "hidden");
                              setPlayerMode("hidden");
                            }}
                          />
                          {!soundUnlocked && (
                            <div className="absolute bottom-4 left-4 z-10 max-w-sm rounded-2xl border border-white/10 bg-[rgba(8,12,24,0.6)] px-4 py-3 text-sm text-white/78 backdrop-blur-md" data-testid="catalog-player-sound-hint">
                              Lecture auto activée en muet. Cliquez sur Lecture, Son, une carte ou le grand écran pour activer le son.
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={unlockSound}
                            className="absolute inset-0 z-[1] bg-transparent"
                            aria-label="Activer le son du lecteur vidéo"
                            data-testid="catalog-player-activate-sound-overlay"
                          />
                        </div>
                      ) : (
                        <div className="relative flex h-full w-full items-end overflow-hidden">
                          <img src={mediaImage(activePlayer)} alt={mediaTitle(activePlayer)} className="absolute inset-0 h-full w-full object-cover" data-testid="catalog-player-fallback-image" />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,24,0.04),rgba(5,10,24,0.84))]" />
                          <div className="relative z-10 space-y-3 p-5 sm:p-6 lg:p-8">
                            <Badge className="rounded-full border border-white/10 bg-[rgba(8,12,24,0.48)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/82" data-testid="catalog-player-fallback-badge">
                              {playerMode === "hidden" ? "Vidéo indisponible" : "Prévisualisation catalogue"}
                            </Badge>
                            <h2 className="max-w-2xl font-display text-2xl font-black text-white sm:text-3xl" data-testid="catalog-player-fallback-title">
                              {mediaTitle(activePlayer)}
                            </h2>
                            <p className="max-w-2xl text-sm leading-7 text-white/72" data-testid="catalog-player-fallback-description">
                              {mediaDescription(activePlayer)}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-white/10" />
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1fr_.56fr]">
                    <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.03)] text-white shadow-[0_20px_40px_rgba(6,12,24,0.28)]" data-testid="catalog-player-meta-card">
                      <CardContent className="space-y-4 p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/80" data-testid="catalog-player-format-badge">
                            {activePlayer.format || "Anime"}
                          </Badge>
                          <Badge variant="outline" className="rounded-full border-[var(--theme-border-soft)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-white/80" data-testid="catalog-player-year-badge">
                            <CalendarRange className="mr-1 h-3.5 w-3.5" /> {activePlayer.seasonYear || "Catalogue"}
                          </Badge>
                          {typeof activePlayer.averageScore === "number" && (
                            <Badge variant="outline" className="rounded-full border-[var(--theme-border-soft)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-white/82" data-testid="catalog-player-score-badge">
                              <Star className="mr-1 h-3.5 w-3.5 fill-current" /> {activePlayer.averageScore}
                            </Badge>
                          )}
                          <Badge variant="outline" className="rounded-full border-[var(--theme-border-soft)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-white/82" data-testid="catalog-player-queue-badge">
                            <Clapperboard className="mr-1 h-3.5 w-3.5" /> File {Math.max(playerQueue.length, favoriteItems.length)}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <h2 className="font-display text-2xl font-black leading-tight text-white sm:text-3xl" data-testid="catalog-player-title">
                            {mediaTitle(activePlayer)}
                          </h2>
                          <p className="max-w-4xl text-sm leading-7 text-white/72 sm:text-base" data-testid="catalog-player-description">
                            {mediaDescription(activePlayer)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2" data-testid="catalog-player-genres-row">
                          {(activePlayer.genres || []).slice(0, 5).map((genre) => (
                            <span key={genre} className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs text-white/82">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.03)] text-white shadow-[0_20px_40px_rgba(6,12,24,0.28)]" data-testid="catalog-player-controls-card">
                      <CardContent className="space-y-5 p-5 sm:p-6">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Commandes lecteur</p>
                          <h3 className="mt-2 font-display text-2xl font-black">Lecture, son et mini-écran</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          <Button type="button" variant="glass" className="min-h-[48px] rounded-2xl text-white" onClick={handlePrevious} disabled={!playerQueue.length} data-testid="catalog-player-prev-button">
                            <SkipBack className="h-4 w-4" /> Précédent
                          </Button>
                          <Button type="button" className="btn-neon-rainbow min-h-[48px] rounded-2xl text-white" onClick={togglePlayback} disabled={!activePlayer || !hasTrailer(activePlayer) || playerMode === "hidden"} data-testid="catalog-player-play-toggle-button">
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {isPlaying ? "Pause" : "Lecture"}
                          </Button>
                          <Button type="button" variant="glass" className="min-h-[48px] rounded-2xl text-white" onClick={handleNext} disabled={!playerQueue.length} data-testid="catalog-player-next-button">
                            <SkipForward className="h-4 w-4" /> Suivant
                          </Button>
                          <Button type="button" variant="glass" className="min-h-[48px] rounded-2xl text-white" onClick={toggleMute} disabled={!activePlayer || !hasTrailer(activePlayer) || playerMode === "hidden"} data-testid="catalog-player-mute-button">
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            {isMuted ? "Activer" : "Couper"}
                          </Button>
                          <Button type="button" variant="glass" className="min-h-[48px] rounded-2xl text-white" onClick={openMiniPlayer} disabled={!activePlayer} data-testid="catalog-player-pip-button">
                            <PictureInPicture2 className="h-4 w-4" /> {pipOpen ? "Fermer PiP" : "Ouvrir PiP"}
                          </Button>
                          <Button type="button" variant="outline" className="min-h-[48px] rounded-2xl text-white" onClick={() => setDetailMedia(activePlayer)} data-testid="catalog-player-details-button">
                            <Info className="h-4 w-4" /> Détails
                          </Button>
                        </div>
                        <div className="rounded-[1.3rem] border border-white/10 bg-[rgba(7,12,24,0.48)] p-4 text-sm text-white/72" data-testid="catalog-player-status-note">
                          {playerQueue.length
                            ? `Playlist actuelle : ${playerQueue.length} vidéo${playerQueue.length > 1 ? "s" : ""} favorites prêtes pour la lecture complète en continu.`
                            : "Ajoutez un titre en favori avec la bulle flottante des cartes pour créer votre file de lecture géante."}
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative flex min-h-[420px] flex-col items-center justify-center gap-5 rounded-[1.75rem] border border-dashed border-white/12 bg-[rgba(5,10,24,0.42)] px-6 py-12 text-center" data-testid="catalog-player-empty-state">
                  <div className="absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom,rgba(244,114,182,0.1),transparent_26%)]" />
                  <div className="relative z-10 mx-auto max-w-2xl space-y-4">
                    <Badge className="mx-auto inline-flex rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/78">
                      Aucun favori actif
                    </Badge>
                    <h2 className="font-display text-3xl font-black text-white sm:text-4xl" data-testid="catalog-empty-title">
                      Sélectionnez une carte pour l’envoyer immédiatement sur le grand écran.
                    </h2>
                    <p className="mx-auto max-w-xl text-sm leading-7 text-white/70 sm:text-base" data-testid="catalog-empty-description">
                      Les bulles flottantes des cartes ajoutent vos titres en favoris et les préparent pour la lecture automatique dans ce lecteur géant lumineux.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button className="btn-neon-rainbow rounded-full text-white" onClick={() => videoSuggestionItems[0] && activatePlayer(videoSuggestionItems[0], { forceFavorite: true, unlockSound: true })} data-testid="catalog-empty-launch-button">
                        <Sparkles className="h-4 w-4" /> Lancer la première sélection
                      </Button>
                      <Button variant="glass" className="rounded-full text-white" onClick={() => setSearch("")} data-testid="catalog-empty-reset-search-button">
                        Réinitialiser la recherche
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!!favoriteItems.length && (
              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-white shadow-[0_20px_40px_rgba(6,12,24,0.28)] sm:p-5" data-testid="catalog-favorites-strip">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">File personnelle</p>
                    <h2 className="mt-2 font-display text-2xl font-black">Favoris prêts pour le grand lecteur</h2>
                  </div>
                  <Badge variant="outline" className="rounded-full border-[var(--theme-border-soft)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-white/78" data-testid="catalog-favorites-badge">
                    {favoriteItems.length} élément{favoriteItems.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2" data-testid="catalog-favorites-scroll-row">
                  {favoriteItems.map((media) => {
                    const active = activePlayerId === media.id;
                    return (
                      <button
                        key={`favorite-${media.id}`}
                        type="button"
                        className={`flex min-h-[86px] min-w-[250px] items-center gap-3 rounded-[1.25rem] border px-3 py-3 text-left transition-[transform,border-color,box-shadow] duration-200 ${active ? "border-white/28 shadow-[0_18px_34px_rgba(6,12,24,0.28)]" : "border-white/10"}`}
                        onClick={() => activatePlayer(media, { unlockSound: true })}
                        data-testid={`catalog-favorite-chip-${media.id}`}
                        style={{
                          background: "var(--catalog-card-bg, rgba(255,255,255,0.03))",
                          color: "var(--catalog-card-fg, #ffffff)",
                          borderColor: active ? "var(--catalog-card-border, rgba(255,255,255,0.28))" : "var(--catalog-card-border, rgba(255,255,255,0.12))",
                          backgroundSize: "var(--catalog-card-size, auto)",
                          animation: "var(--catalog-card-anim, none)",
                        }}
                      >
                        <div className="relative h-16 w-12 overflow-hidden rounded-xl border border-white/12 bg-black/40">
                          <img src={mediaImage(media)} alt={mediaTitle(media)} className="h-full w-full object-cover" loading="lazy" />
                          <BlisterFrame radius={10} intensity={0.9} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold">{mediaTitle(media)}</p>
                          <p className="mt-1 text-xs opacity-75">{media.format || "Anime"} · {media.seasonYear || "Catalogue"}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="px-4 pt-1 md:px-8 xl:px-10">
          <MangaNeonBar height={26} className="rounded-full overflow-hidden" />
        </div>
        <CatalogCardColorBubble />

        <section className="px-4 py-8 md:px-8 xl:px-10" data-testid="catalog-filters-section">
          <div className="mx-auto max-w-[1120px] space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Bibliothèque indexée</p>
                <h2 className="mt-2 font-display text-3xl font-black text-white" data-testid="catalog-grid-title">
                  Tout le catalogue · {filteredSorted.length} / {gridItems.length} titres
                </h2>
              </div>
              {gridLoading && <span className="text-xs text-white/52" data-testid="catalog-grid-loading-label">Indexation en cours…</span>}
            </div>

            <Card className="theme-panel-surface overflow-hidden rounded-[1.9rem] border border-[var(--theme-border-soft)] bg-transparent text-white" data-testid="catalog-filter-panel">
              <CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] lg:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/44" />
                  <Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un animé, un studio, une licence..." className="theme-search-input h-12 rounded-2xl pl-10 text-white placeholder:text-white/40" aria-label="Rechercher dans le catalogue" data-testid="catalog-search-input" />
                </div>

                <Select value={filterGenre} onValueChange={setFilterGenre}>
                  <SelectTrigger className="theme-search-input h-12 rounded-2xl text-white" data-testid="catalog-genre-select">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent className="theme-panel-surface border-[var(--theme-border-soft)] bg-[rgba(10,14,24,0.95)] text-white">
                    <SelectItem value="all">Tous les genres</SelectItem>
                    {allGenres.map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="theme-search-input h-12 rounded-2xl text-white" data-testid="catalog-status-select">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className="theme-panel-surface border-[var(--theme-border-soft)] bg-[rgba(10,14,24,0.95)] text-white">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="releasing">En cours</SelectItem>
                    <SelectItem value="finished">Terminé</SelectItem>
                    <SelectItem value="upcoming">À venir</SelectItem>
                    <SelectItem value="hiatus">En pause</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={minScore} onValueChange={setMinScore}>
                  <SelectTrigger className="theme-search-input h-12 rounded-2xl text-white" data-testid="catalog-score-select">
                    <SelectValue placeholder="Score" />
                  </SelectTrigger>
                  <SelectContent className="theme-panel-surface border-[var(--theme-border-soft)] bg-[rgba(10,14,24,0.95)] text-white">
                    <SelectItem value="0">Tous les scores</SelectItem>
                    <SelectItem value="60">≥ 60</SelectItem>
                    <SelectItem value="70">≥ 70</SelectItem>
                    <SelectItem value="80">≥ 80</SelectItem>
                    <SelectItem value="85">≥ 85</SelectItem>
                    <SelectItem value="90">≥ 90</SelectItem>
                  </SelectContent>
                </Select>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select value={minYear} onValueChange={setMinYear}>
                    <SelectTrigger className="theme-search-input h-12 rounded-2xl text-white" data-testid="catalog-year-select">
                      <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent className="theme-panel-surface border-[var(--theme-border-soft)] bg-[rgba(10,14,24,0.95)] text-white">
                      <SelectItem value="0">Toutes les années</SelectItem>
                      <SelectItem value="2026">≥ 2026</SelectItem>
                      <SelectItem value="2025">≥ 2025</SelectItem>
                      <SelectItem value="2024">≥ 2024</SelectItem>
                      <SelectItem value="2023">≥ 2023</SelectItem>
                      <SelectItem value="2020">≥ 2020</SelectItem>
                      <SelectItem value="2015">≥ 2015</SelectItem>
                      <SelectItem value="2010">≥ 2010</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                    <SelectTrigger className="theme-search-input h-12 rounded-2xl text-white" data-testid="catalog-sort-select">
                      <SelectValue placeholder="Tri" />
                    </SelectTrigger>
                    <SelectContent className="theme-panel-surface border-[var(--theme-border-soft)] bg-[rgba(10,14,24,0.95)] text-white">
                      <SelectItem value="default">Tendances</SelectItem>
                      <SelectItem value="newest">Plus récents</SelectItem>
                      <SelectItem value="score">Meilleurs scores</SelectItem>
                      <SelectItem value="alpha">A → Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {(filterGenre !== "all" || filterStatus !== "all" || minScore !== "0" || minYear !== "0" || sortBy !== "default" || search) && (
              <div className="flex justify-end">
                <Button type="button" variant="glass" className="rounded-full text-white" onClick={() => { setFilterGenre("all"); setFilterStatus("all"); setMinScore("0"); setMinYear("0"); setSortBy("default"); setSearch(""); }} data-testid="catalog-reset-filters-button">
                  Réinitialiser les filtres
                </Button>
              </div>
            )}

            {!!featuredRail.length && (
              <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-white shadow-[0_18px_36px_rgba(6,12,24,0.24)] sm:p-5" data-testid="catalog-featured-strip">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Accès rapide</p>
                    <h3 className="mt-2 font-display text-2xl font-black">Sélection vidéo à projeter</h3>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {featuredRail.map((media) => (
                    <button
                      key={`featured-${media.id}`}
                      type="button"
                      onClick={() => activatePlayer(media, { forceFavorite: true, unlockSound: true })}
                      className="flex min-h-[94px] min-w-[250px] items-center gap-3 rounded-[1.2rem] border px-3 py-3 text-left transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5"
                      data-testid={`catalog-featured-chip-${media.id}`}
                      style={{
                        background: "var(--catalog-card-bg, rgba(255,255,255,0.03))",
                        color: "var(--catalog-card-fg, #ffffff)",
                        borderColor: "var(--catalog-card-border, rgba(255,255,255,0.12))",
                        backgroundSize: "var(--catalog-card-size, auto)",
                        animation: "var(--catalog-card-anim, none)",
                      }}
                    >
                      <div className="relative h-20 w-14 overflow-hidden rounded-xl border border-white/12 bg-black/40">
                        <img src={mediaImage(media)} alt={mediaTitle(media)} className="h-full w-full object-cover" loading="lazy" />
                        <BlisterFrame radius={10} intensity={0.88} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold">{mediaTitle(media)}</p>
                        <p className="mt-1 text-xs opacity-75">{media.format || "Anime"} · {media.seasonYear || "Catalogue"}</p>
                      </div>
                      <PlayCircle className="h-5 w-5 shrink-0 text-[var(--theme-link)]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pagedItems.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3" data-testid="catalog-grid">
                {pagedItems.map((media) => {
                  const title = mediaTitle(media);
                  const image = media.coverImage.large || media.coverImage.extraLarge || mediaImage(media);
                  const isFavorite = favoriteIds.includes(media.id);
                  const isActive = activePlayerId === media.id;
                  return (
                    <article
                      key={`catalog-card-${media.id}`}
                      className={`group relative overflow-hidden rounded-[1.9rem] border text-white transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 ${isActive ? "shadow-[0_22px_42px_rgba(6,12,24,0.32)]" : "shadow-[0_14px_30px_rgba(6,12,24,0.2)]"}`}
                      data-testid={`catalog-card-${media.id}`}
                      style={{
                        background: "var(--catalog-card-bg, linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018)))",
                        color: "var(--catalog-card-fg, #ffffff)",
                        borderColor: isActive ? "var(--catalog-card-border, rgba(255,255,255,0.26))" : "var(--catalog-card-border, rgba(255,255,255,0.12))",
                        backgroundSize: "var(--catalog-card-size, auto)",
                        animation: "var(--catalog-card-anim, none)",
                        backdropFilter: "blur(2px)",
                        WebkitBackdropFilter: "blur(2px)",
                      }}
                    >
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.09),transparent_22%,transparent_74%,rgba(255,255,255,0.02))]" />
                      <div className="relative aspect-[5/8] overflow-hidden rounded-t-[1.9rem] border-b border-white/10 bg-black/25">
                        <img
                          src={image}
                          alt={title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          onError={(event) => {
                            const target = event.currentTarget;
                            if (media.coverImage.extraLarge && target.src !== media.coverImage.extraLarge) {
                              target.src = media.coverImage.extraLarge;
                            } else {
                              target.style.display = "none";
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(5,10,24,0.52))]" />
                        <div className="absolute left-3 top-3 right-3 flex items-start justify-between gap-3">
                          <Badge className="rounded-full border border-white/14 bg-[rgba(255,255,255,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/88" data-testid={`catalog-card-format-${media.id}`}>
                            {media.format || "Anime"}
                          </Badge>
                          <div className="flex items-center gap-2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                            <Button
                              type="button"
                              size="icon"
                              variant="glass"
                              className={`h-11 w-11 rounded-full text-white ${isFavorite ? "border-primary/60 text-primary" : ""}`}
                              onClick={() => {
                                if (!isFavorite) {
                                  setFavoriteIds((current) => (current.includes(media.id) ? current : [media.id, ...current]));
                                }
                                activatePlayer(media, { unlockSound: true });
                              }}
                              aria-label={isFavorite ? `Relancer ${title} dans le lecteur géant` : `Ajouter ${title} aux favoris et lancer la lecture`}
                              data-testid={`catalog-card-bubble-play-${media.id}`}
                            >
                              {isFavorite ? <Heart className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button type="button" size="icon" variant="glass" className="h-11 w-11 rounded-full text-white" onClick={() => setDetailMedia(media)} aria-label={`Ouvrir la fiche détaillée de ${title}`} data-testid={`catalog-card-info-${media.id}`}>
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                          <span className="inline-flex min-h-[38px] items-center rounded-full border border-white/12 bg-[rgba(255,255,255,0.08)] px-3 text-xs text-white/84" data-testid={`catalog-card-score-${media.id}`}>
                            {typeof media.averageScore === "number" ? `${media.averageScore} / 100` : "Score en cours"}
                          </span>
                          {hasPlayableVideo(media) && (
                            <span className="inline-flex min-h-[38px] items-center rounded-full border border-white/12 bg-[rgba(255,255,255,0.08)] px-3 text-xs text-white/88" data-testid={`catalog-card-trailer-${media.id}`}>
                              <PlayCircle className="mr-1.5 h-4 w-4 text-[var(--theme-link)]" /> Vidéo
                            </span>
                          )}
                        </div>
                        <BlisterFrame radius={18} intensity={0.96} />
                      </div>

                      <CardContent className="space-y-4 p-5">
                        <div className="space-y-2">
                          <h3 className="line-clamp-2 font-display text-xl font-black leading-tight" data-testid={`catalog-card-title-${media.id}`}>
                            {title}
                          </h3>
                          <p className="line-clamp-3 text-sm leading-7 opacity-80" data-testid={`catalog-card-description-${media.id}`}>
                            {mediaDescription(media)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2" data-testid={`catalog-card-tags-${media.id}`}>
                          <span className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.06)] px-3 py-2 text-xs opacity-90">{media.seasonYear || "Catalogue"}</span>
                          <span className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.06)] px-3 py-2 text-xs opacity-90">{media.episodes ? `${media.episodes} épisodes` : "Épisodes à confirmer"}</span>
                          {media.status && <span className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.06)] px-3 py-2 text-xs opacity-90">{media.status}</span>}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button type="button" className="btn-neon-rainbow min-h-[44px] flex-1 rounded-2xl text-white" onClick={() => activatePlayer(media, { forceFavorite: true, unlockSound: true })} data-testid={`catalog-card-primary-action-${media.id}`}>
                            <Play className="h-4 w-4" /> Envoyer au lecteur géant
                          </Button>
                          <Button type="button" variant="glass" className={`min-h-[44px] rounded-2xl text-white ${isFavorite ? "border-primary/60 text-primary" : ""}`} onClick={() => toggleFavorite(media)} data-testid={`catalog-card-favorite-toggle-${media.id}`}>
                            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                            {isFavorite ? "Retirer" : "Favori"}
                          </Button>
                        </div>
                      </CardContent>
                    </article>
                  );
                })}
              </div>
            ) : (
              <Card className="theme-panel-surface rounded-[1.9rem] border border-[var(--theme-border-soft)] bg-transparent text-white" data-testid="catalog-grid-empty-state">
                <CardContent className="space-y-4 p-8 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Aucun résultat</p>
                  <h3 className="font-display text-3xl font-black">Aucun animé ne correspond à ces filtres.</h3>
                  <p className="text-sm leading-7 text-white/68">Réinitialisez les filtres ou modifiez votre recherche pour réafficher le catalogue complet.</p>
                  <div className="flex justify-center">
                    <Button variant="glass" className="rounded-full text-white" onClick={() => { setFilterGenre("all"); setFilterStatus("all"); setMinScore("0"); setMinYear("0"); setSortBy("default"); setSearch(""); }} data-testid="catalog-grid-empty-reset-button">
                      Réinitialiser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div ref={sentinelRef} className="flex h-16 items-center justify-center text-xs text-white/52" data-testid="catalog-grid-sentinel">
              {renderCount < filteredSorted.length
                ? `Chargement… (${renderCount} / ${filteredSorted.length})`
                : filteredSorted.length > 0
                  ? `Fin du catalogue · ${filteredSorted.length} titres`
                  : null}
            </div>
          </div>
        </section>

        <Dialog open={!!detailMedia} onOpenChange={(open) => !open && setDetailMedia(null)}>
          <DialogContent className="max-w-5xl border-[var(--theme-border-soft)] bg-[rgba(10,14,24,0.95)] text-white" data-testid="catalog-detail-dialog">
            {detailMedia && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-3xl font-black" data-testid="catalog-detail-title">
                    {mediaTitle(detailMedia)}
                  </DialogTitle>
                  <DialogDescription className="text-white/62" data-testid="catalog-detail-description">
                    {mediaDescription(detailMedia)}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
                  <div className="space-y-4">
                    <div className="relative aspect-video overflow-hidden rounded-[1.7rem] border border-white/10 bg-black" data-testid="catalog-detail-media-panel">
                      {hasTrailer(detailMedia) ? (
                        <YouTubeEmbed
                          key={`detail-${detailMedia.id}`}
                          videoId={detailMedia.trailer?.id}
                          searchQuery={`${mediaTitle(detailMedia)} bande annonce anime`}
                          title={mediaTitle(detailMedia)}
                          autoplay={false}
                          muted={!soundUnlocked}
                          hideControls
                        />
                      ) : (
                        <img src={mediaImage(detailMedia)} alt={mediaTitle(detailMedia)} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2" data-testid="catalog-detail-genres-row">
                      {(detailMedia.genres || []).map((genre) => (
                        <span key={genre} className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-white/82">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Card className="theme-subpanel border-none bg-transparent text-white"><CardContent className="p-4"><p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Score</p><p className="mt-2 font-display text-3xl font-black">{detailMedia.averageScore ?? "—"}</p></CardContent></Card>
                      <Card className="theme-subpanel border-none bg-transparent text-white"><CardContent className="p-4"><p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Année</p><p className="mt-2 font-display text-3xl font-black">{detailMedia.seasonYear ?? "—"}</p></CardContent></Card>
                      <Card className="theme-subpanel border-none bg-transparent text-white"><CardContent className="p-4"><p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Épisodes</p><p className="mt-2 font-display text-3xl font-black">{detailMedia.episodes ?? "—"}</p></CardContent></Card>
                    </div>

                    <Card className="theme-subpanel border-none bg-transparent text-white" data-testid="catalog-detail-copy-card">
                      <CardContent className="space-y-4 p-5">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">Synopsis</p>
                        <p className="text-sm leading-8 text-white/76">{mediaDescription(detailMedia)}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" className="btn-neon-rainbow rounded-full text-white" onClick={() => { activatePlayer(detailMedia, { forceFavorite: true, unlockSound: true }); setDetailMedia(null); }} data-testid="catalog-detail-launch-button">
                            <Play className="h-4 w-4" /> Lancer sur l’écran géant
                          </Button>
                          <Button type="button" variant="glass" className="rounded-full text-white" onClick={() => toggleFavorite(detailMedia)} data-testid="catalog-detail-favorite-button">
                            <Heart className={`h-4 w-4 ${favoriteIds.includes(detailMedia.id) ? "fill-current" : ""}`} />
                            {favoriteIds.includes(detailMedia.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <NeonFooterBar />
      </main>
    </>
  );
}
