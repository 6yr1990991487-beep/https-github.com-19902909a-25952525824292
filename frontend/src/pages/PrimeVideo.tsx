import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { videos as fallbackVideos, thumb as ytThumb } from "@/data/videos";
import { CalendarRange, Clapperboard, ExternalLink, Heart, Play, Search, SkipForward, Sparkles, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverPreview } from "@/components/HoverPreview";
import { AdminRemoveVideo } from "@/components/AdminRemoveVideo";
import { MangaUniverseBanner } from "@/components/MangaUniverseBanner";
import { ManualSyncButton } from "@/components/ManualSyncButton";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { TranslationToggleButton } from "@/components/TranslationToggleButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFrenchTranslation } from "@/hooks/useFrenchTranslation";

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
  trailerId?: string;
};

const PRIME_CACHE = "lovanet.cache.prime.anime.v2";
const PRIME_WATCH_KEY = "lovanet.prime.watch-tonight.v1";
const PRIME_RECENT_KEY = "lovanet.prime.recent.v1";
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function loadNumberArray(key: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((value) => Number(value)).filter((value) => Number.isFinite(value)) : [];
  } catch {
    return [];
  }
}

function normalizeText(value: string | undefined | null) {
  return String(value || "").toLowerCase();
}

function inferMood(anime: PrimeAnime) {
  const genres = anime.genres.map((genre) => genre.toLowerCase());
  if (genres.some((genre) => ["romance", "slice of life", "comedy"].includes(genre))) return "feelgood";
  if (genres.some((genre) => ["horror", "psychological", "thriller", "mystery"].includes(genre))) return "dark";
  if (genres.some((genre) => ["action", "adventure", "mecha"].includes(genre))) return "action";
  if (genres.some((genre) => ["fantasy", "supernatural", "drama"].includes(genre))) return "epic";
  if (genres.includes("romance")) return "romance";
  return "all";
}

function smartBadges(anime: PrimeAnime) {
  const badges: string[] = [];
  if ((anime.year ?? 0) >= 2024) badges.push("Nouveauté");
  if ((anime.score ?? 0) >= 85) badges.push("Populaire");
  if ((anime.episodes ?? 0) >= 24) badges.push("Long format");
  if ((anime.format || "").toLowerCase().includes("movie")) badges.push("Film");
  const mood = inferMood(anime);
  if (mood === "feelgood") badges.push("Feel good");
  if (mood === "dark") badges.push("Sombre");
  if (mood === "epic") badges.push("Épique");
  if (mood === "romance") badges.push("Romance");
  return badges.slice(0, 4);
}

function shortDescription(value: string) {
  return String(value || "Aucune description disponible.").replace(/\s+/g, " ").trim();
}

const PrimeVideo = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string>("");
  const [muted, setMuted] = useState(true);
  const [mainVideoUnavailable, setMainVideoUnavailable] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [orientation, setOrientation] = useState<"cinema" | "vertical">("cinema");
  const [primeAnime, setPrimeAnime] = useState<PrimeAnime[]>([]);
  const [primeLoading, setPrimeLoading] = useState(true);
  const [primeGenre, setPrimeGenre] = useState<string>("all");
  const [primeMood, setPrimeMood] = useState<string>("all");
  const [primeQuery, setPrimeQuery] = useState("");
  const [selectedPrimeId, setSelectedPrimeId] = useState<number | null>(null);
  const [watchTonightIds, setWatchTonightIds] = useState<number[]>(() => loadNumberArray(PRIME_WATCH_KEY));
  const [recentPrimeIds, setRecentPrimeIds] = useState<number[]>(() => loadNumberArray(PRIME_RECENT_KEY));

  const fallback: Item[] = fallbackVideos.map((video) => ({
    id: video.id,
    videoId: video.id,
    title: video.title,
    series: video.series,
    thumbnail: ytThumb(video.id),
  }));

  useEffect(() => {
    try {
      localStorage.setItem(PRIME_WATCH_KEY, JSON.stringify(watchTonightIds));
    } catch {
      // ignore localStorage sync failures
    }
  }, [watchTonightIds]);

  useEffect(() => {
    try {
      localStorage.setItem(PRIME_RECENT_KEY, JSON.stringify(recentPrimeIds));
    } catch {
      // ignore localStorage sync failures
    }
  }, [recentPrimeIds]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await fetch(`${API}/videos?platform=youtube&limit=80`);
        const json = await response.json();
        if (!alive) return;
        const rows = (json.videos ?? [])
          .filter((row: any) => row.external_id || row.id)
          .map((row: any): Item => ({
            id: row.id ?? row.external_id,
            videoId: row.external_id ?? row.id,
            title: row.title ?? "Anime.Moments.officiel",
            thumbnail: row.thumbnail_url || row.thumbnail || ytThumb(row.external_id ?? row.id),
          }));
        const list = rows.length > 0 ? rows : fallback;
        setItems(list);
        setActive((current) => current || list[0]?.videoId || "");
      } catch {
        if (!alive) return;
        setItems(fallback);
        setActive((current) => current || fallback[0]?.videoId || "");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const v = items.find((entry) => entry.videoId === active) ?? items[0];
  const idx = items.findIndex((entry) => entry.videoId === v?.videoId);
  const next = items[(idx + 1) % Math.max(items.length, 1)];

  const goNext = () => {
    if (!next) return;
    setMainVideoUnavailable(false);
    setActive(next.videoId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      try {
        const data = JSON.parse(event.data);
        if (data?.event === "onStateChange" && data?.info === 0 && autoplayNext) {
          goNext();
        }
      } catch {
        // ignore invalid messages
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [autoplayNext, next?.videoId]);

  useEffect(() => {
    setMainVideoUnavailable(false);
  }, [v?.videoId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRIME_CACHE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setPrimeAnime(parsed);
          setPrimeLoading(false);
        }
      }
    } catch {
      // ignore cache hydration failures
    }

    const fetchPrime = async () => {
      try {
        const response = await fetch(`${API}/prime/catalog?limit=240`).catch(() => null);
        if (!response || !response.ok) {
          throw new Error(`prime-catalog-http-${response?.status || "offline"}`);
        }
        const json = await response.json().catch(() => null);
        const snapshot = Array.isArray(json?.items) ? json.items : [];
        if (snapshot.length) {
          setPrimeAnime(snapshot);
          try {
            localStorage.setItem(PRIME_CACHE, JSON.stringify(snapshot.slice(0, 2000)));
          } catch {
            // ignore cache persistence failures
          }
        }
      } catch (error) {
        console.error("Prime catalog sync error", error);
      } finally {
        setPrimeLoading(false);
      }
    };

    fetchPrime();
    const intervalId = setInterval(fetchPrime, 1000 * 60 * 10);
    const onFocus = () => fetchPrime();
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchPrime();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const primeGenres = useMemo(() => Array.from(new Set(primeAnime.flatMap((anime) => anime.genres))).sort(), [primeAnime]);

  const filteredPrime = useMemo(() => {
    const query = normalizeText(primeQuery);
    return primeAnime.filter((anime) => {
      if (primeGenre !== "all" && !anime.genres.includes(primeGenre)) return false;
      if (primeMood !== "all" && inferMood(anime) !== primeMood) return false;
      if (query) {
        const haystack = `${normalizeText(anime.title)}|${normalizeText(anime.description)}|${normalizeText(anime.genres.join(" "))}`;
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [primeAnime, primeGenre, primeMood, primeQuery]);

  useEffect(() => {
    if (!filteredPrime.length) return;
    if (!selectedPrimeId || !filteredPrime.some((anime) => anime.id === selectedPrimeId)) {
      setSelectedPrimeId(filteredPrime[0].id);
    }
  }, [filteredPrime, selectedPrimeId]);

  const selectedPrime = filteredPrime.find((anime) => anime.id === selectedPrimeId) || primeAnime.find((anime) => anime.id === selectedPrimeId) || filteredPrime[0] || primeAnime[0] || null;
  const mapPrimeById = useMemo(() => new Map(primeAnime.map((anime) => [anime.id, anime])), [primeAnime]);
  const watchTonight = useMemo(() => watchTonightIds.map((id) => mapPrimeById.get(id)).filter(Boolean) as PrimeAnime[], [mapPrimeById, watchTonightIds]);
  const resumeLater = useMemo(() => recentPrimeIds.map((id) => mapPrimeById.get(id)).filter(Boolean) as PrimeAnime[], [mapPrimeById, recentPrimeIds]);

  const similarPrime = useMemo(() => {
    if (!selectedPrime) return [] as PrimeAnime[];
    const baseGenres = new Set(selectedPrime.genres);
    return primeAnime
      .filter((anime) => anime.id !== selectedPrime.id)
      .map((anime) => ({
        anime,
        score: anime.genres.reduce((acc, genre) => acc + (baseGenres.has(genre) ? 2 : 0), 0) + ((anime.score ?? 0) / 100),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry) => entry.anime);
  }, [primeAnime, selectedPrime]);

  const primeTranslationTexts = useMemo(() => {
    const base = [
      selectedPrime,
      ...filteredPrime.slice(0, 12),
      ...watchTonight.slice(0, 6),
      ...resumeLater.slice(0, 6),
      ...similarPrime.slice(0, 4),
    ].filter(Boolean) as PrimeAnime[];
    return [...base.flatMap((anime) => [anime.title, shortDescription(anime.description)]), ...items.slice(0, 8).map((entry) => entry.title)];
  }, [filteredPrime, items, resumeLater, selectedPrime, similarPrime, watchTonight]);

  const {
    enabled: showFrenchCopy,
    setEnabled: setShowFrenchCopy,
    loading: translationLoading,
    getText: getTranslatedPrimeText,
    translateNow: translatePrimeNow,
  } = useFrenchTranslation(primeTranslationTexts, {
    auto: true,
    storageKey: "lovanet.prime.translation.auto.v1",
  });

  const mapPrimeTitle = (anime?: PrimeAnime | null) => getTranslatedPrimeText(anime?.title || "");
  const mapPrimeDescription = (anime?: PrimeAnime | null) => getTranslatedPrimeText(shortDescription(anime?.description || ""));

  const selectPrimeAnime = (anime: PrimeAnime) => {
    setSelectedPrimeId(anime.id);
    setRecentPrimeIds((current) => [anime.id, ...current.filter((id) => id !== anime.id)].slice(0, 10));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentPrimeForVideo = selectedPrime && selectedPrime.trailerId === v?.videoId ? selectedPrime : null;
  const mainVideoBackdrop = currentPrimeForVideo?.banner || currentPrimeForVideo?.cover || v?.thumbnail;

  const toggleWatchTonight = (animeId: number) => {
    setWatchTonightIds((current) => (current.includes(animeId) ? current.filter((id) => id !== animeId) : [animeId, ...current].slice(0, 12)));
  };

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

      <section className="container mx-auto px-4 lg:px-8 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 mb-2">Streaming partenaire</p>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold">
          <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Prime Vidéo</span>
        </h1>
      </section>

      <section className="container mx-auto px-4 lg:px-8 pb-6" data-testid="prime-main-player-section">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5">◆ prime</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">lecteur premium</div>
          </div>

          <div className="flex items-center gap-2">
            <TranslationToggleButton
              active={showFrenchCopy}
              loading={translationLoading}
              onTranslate={translatePrimeNow}
              onToggle={() => setShowFrenchCopy((value) => !value)}
              dataTestId="prime-translate-toggle-button"
            />
            <Button type="button" variant="glass" className="rounded-full text-xs" onClick={() => setMuted((value) => !value)} data-testid="prime-mute-toggle-button">
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {muted ? "Activer son" : "Muet"}
            </Button>
            <div className="inline-flex p-1 rounded-full bg-secondary border border-border">
              <button onClick={() => setOrientation("cinema")} className={cn("px-3 py-1.5 text-xs rounded-full font-semibold", orientation === "cinema" ? "bg-background" : "text-muted-foreground")} data-testid="prime-orientation-cinema-button">
                ▭ Cinéma
              </button>
              <button onClick={() => setOrientation("vertical")} className={cn("px-3 py-1.5 text-xs rounded-full font-semibold", orientation === "vertical" ? "bg-background" : "text-muted-foreground")} data-testid="prime-orientation-vertical-button">
                ▯ Vertical
              </button>
            </div>
          </div>
        </div>

        <div className={cn("mx-auto rounded-3xl overflow-hidden bg-black border border-sky-500/30 shadow-[0_40px_120px_-40px_hsl(211_100%_50%/0.5)]", orientation === "cinema" ? "aspect-video w-full" : "aspect-[9/16] max-w-md")}>
          <div className="relative h-full w-full bg-black">
            {!mainVideoUnavailable ? (
              <YouTubeEmbed
                key={`prime-main-${v.videoId}-${muted}`}
                searchQuery={`${v.title} anime official trailer`}
                title={v.title}
                autoplay
                muted={muted}
                hideControls
                onExhausted={() => setMainVideoUnavailable(true)}
                onPlayerStateChange={(state) => {
                  if (state === 0 && autoplayNext) {
                    goNext();
                  }
                }}
              />
            ) : (
              <div className="relative flex h-full w-full items-end overflow-hidden" data-testid="prime-main-player-fallback">
                {mainVideoBackdrop ? <img src={mainVideoBackdrop} alt={v.title} className="absolute inset-0 h-full w-full object-cover" loading="eager" /> : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,24,0.06),rgba(5,10,24,0.84))]" />
                <div className="relative z-10 space-y-3 p-4 sm:p-6">
                  <Badge className="rounded-full border border-white/10 bg-[rgba(8,12,24,0.5)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/84">Lecture de secours</Badge>
                  <h2 className="max-w-2xl font-display text-2xl font-black text-white">{showFrenchCopy ? getTranslatedPrimeText(v.title) : v.title}</h2>
                  <p className="max-w-2xl text-sm leading-7 text-white/72">Le trailer YouTube n’est pas disponible pour cette vidéo. Vous pouvez passer à la suivante ou ouvrir un autre contenu Prime.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="glass" className={cn("rounded-full text-sm", autoplayNext ? "border-sky-500/60 text-sky-300" : "")} onClick={() => setAutoplayNext((value) => !value)} data-testid="prime-autoplay-toggle-button">
            <Play className="w-4 h-4 fill-current" /> Lecture auto {autoplayNext ? "ON" : "OFF"}
          </Button>
          <div className="text-xs text-muted-foreground">{idx + 1} / {items.length} · AnimemomentsAnimeofficiel</div>
          <Button type="button" className="rounded-full text-white" onClick={goNext} data-testid="prime-next-button">
            Suivant <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-6 text-center">
          {v.series && <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{showFrenchCopy ? getTranslatedPrimeText(v.series) : v.series}</p>}
          <h2 className="font-display text-2xl font-bold mt-1" data-testid="prime-main-player-title">{showFrenchCopy ? getTranslatedPrimeText(v.title) : v.title}</h2>
          <div className="mt-3 flex justify-center">
            <AdminRemoveVideo
              rowId={v.id}
              source="youtube"
              externalId={v.videoId}
              onRemoved={() => {
                setItems((current) => current.filter((entry) => entry.id !== v.id));
                if (next) setActive(next.videoId);
              }}
              label="Retirer cette vidéo"
            />
          </div>
        </div>
      </section>

      {selectedPrime && (
        <section className="container mx-auto px-4 lg:px-8 pb-8" data-testid="prime-hero-anime-section">
          <Card className="relative overflow-hidden rounded-[2rem] border border-sky-400/20 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_left_bottom,rgba(37,99,235,0.16),transparent_28%),rgba(7,13,24,0.94)] text-white shadow-[0_34px_90px_-40px_rgba(14,165,233,0.55)]">
            <CardContent className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1.15fr_.85fr] lg:p-6">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black" data-testid="prime-hero-anime-player-shell">
                <div className="relative aspect-video">
                  {selectedPrime.trailerId ? (
                    <YouTubeEmbed
                      videoId={selectedPrime.trailerId}
                      searchQuery={`${selectedPrime.title} trailer anime prime video`}
                      title={selectedPrime.title}
                      autoplay
                      muted
                      hideControls
                    />
                  ) : selectedPrime.cover || selectedPrime.banner ? (
                    <img src={selectedPrime.banner || selectedPrime.cover} alt={selectedPrime.title} className="h-full w-full object-cover" loading="eager" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_45%),#040814]">
                      <Clapperboard className="h-12 w-12 text-sky-300/80" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2" data-testid="prime-hero-badges-row">
                  <Badge className="rounded-full border border-sky-300/20 bg-sky-400/10 text-sky-200">Prime sélection</Badge>
                  <Badge variant="outline" className="rounded-full border-white/15 bg-white/5 text-white/80">{selectedPrime.format || "Anime"}</Badge>
                  {selectedPrime.year && <Badge variant="outline" className="rounded-full border-white/15 bg-white/5 text-white/80"><CalendarRange className="mr-1 h-3.5 w-3.5" />{selectedPrime.year}</Badge>}
                  {typeof selectedPrime.score === "number" && <Badge variant="outline" className="rounded-full border-white/15 bg-white/5 text-white/80">{selectedPrime.score}/100</Badge>}
                </div>

                <div>
                  <h3 className="font-display text-2xl font-black sm:text-3xl" data-testid="prime-hero-anime-title">{showFrenchCopy ? mapPrimeTitle(selectedPrime) : selectedPrime.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/72" data-testid="prime-hero-anime-description">{showFrenchCopy ? mapPrimeDescription(selectedPrime) : shortDescription(selectedPrime.description)}</p>
                </div>

                <div className="flex flex-wrap gap-2" data-testid="prime-smart-badges-row">
                  {smartBadges(selectedPrime).map((badge) => (
                    <span key={`${selectedPrime.id}-${badge}`} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] text-white/84">
                      {badge}
                    </span>
                  ))}
                  {(selectedPrime.genres || []).slice(0, 3).map((genre) => (
                    <span key={`${selectedPrime.id}-${genre}`} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/72">
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" className="rounded-full text-white" onClick={() => toggleWatchTonight(selectedPrime.id)} data-testid="prime-watch-tonight-toggle-button">
                    <Heart className={`h-4 w-4 ${watchTonightIds.includes(selectedPrime.id) ? "fill-current" : ""}`} />
                    {watchTonightIds.includes(selectedPrime.id) ? "Retirer de ce soir" : "À regarder ce soir"}
                  </Button>
                  {selectedPrime.primeUrl && (
                    <Button asChild variant="glass" className="rounded-full text-white" data-testid="prime-hero-open-external-button">
                      <a href={selectedPrime.primeUrl} target="_blank" rel="noopener noreferrer">
                        Ouvrir Prime <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>

                {!!similarPrime.length && (
                  <div className="space-y-2" data-testid="prime-similar-strip">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/48">Similaire à ce titre</p>
                    <div className="flex flex-wrap gap-2">
                      {similarPrime.map((anime) => (
                        <button
                          key={`similar-${anime.id}`}
                          type="button"
                          onClick={() => selectPrimeAnime(anime)}
                          className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/82 transition-colors hover:border-sky-400/40 hover:text-sky-200"
                          data-testid={`prime-similar-chip-${anime.id}`}
                        >
                          {showFrenchCopy ? mapPrimeTitle(anime) : anime.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {!!watchTonight.length && (
        <section className="container mx-auto px-4 lg:px-8 pb-6" data-testid="prime-watch-tonight-section">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold text-white">À regarder ce soir</h3>
            <span className="text-xs text-muted-foreground">{watchTonight.length} sélection{watchTonight.length > 1 ? "s" : ""}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {watchTonight.map((anime) => (
              <button
                key={`watch-tonight-${anime.id}`}
                type="button"
                onClick={() => selectPrimeAnime(anime)}
                className="flex min-w-[220px] items-center gap-3 rounded-[1.2rem] border border-white/10 bg-card/60 px-3 py-3 text-left transition-colors hover:border-sky-400/40"
                data-testid={`prime-watch-tonight-chip-${anime.id}`}
              >
                <div className="h-14 w-11 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                  {anime.cover ? <img src={anime.cover} alt={anime.title} className="h-full w-full object-cover" loading="lazy" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-white">{showFrenchCopy ? mapPrimeTitle(anime) : anime.title}</p>
                  <p className="mt-1 text-xs text-white/60">{anime.format || "Anime"} · {anime.year || "—"}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {!!resumeLater.length && (
        <section className="container mx-auto px-4 lg:px-8 pb-6" data-testid="prime-resume-later-section">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-white">Reprendre plus tard</h3>
            <span className="text-xs text-muted-foreground">Historique local</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {resumeLater.slice(0, 8).map((anime) => (
              <button
                key={`resume-${anime.id}`}
                type="button"
                onClick={() => selectPrimeAnime(anime)}
                className="rounded-full border border-white/10 bg-card/60 px-3 py-2 text-xs text-white/82 transition-colors hover:border-sky-400/40"
                data-testid={`prime-resume-chip-${anime.id}`}
              >
                {showFrenchCopy ? mapPrimeTitle(anime) : anime.title}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 lg:px-8 pb-16" data-testid="prime-anime-library-section">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-xl font-bold text-white">
            Animés disponibles sur Prime Video
            <span className="text-muted-foreground font-normal"> · {filteredPrime.length}/{primeAnime.length} titres</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {primeLoading && <span className="text-muted-foreground">Synchronisation…</span>}
            <div className="relative min-w-[190px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={primeQuery} onChange={(event) => setPrimeQuery(event.target.value)} placeholder="Recherche rapide…" className="h-10 rounded-full pl-9 text-sm" data-testid="prime-search-input" />
            </div>
            <select value={primeGenre} onChange={(event) => setPrimeGenre(event.target.value)} className="bg-secondary border border-border rounded-full px-3 py-2" aria-label="Filtrer par genre" data-testid="prime-genre-select">
              <option value="all">Tous les genres</option>
              {primeGenres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <select value={primeMood} onChange={(event) => setPrimeMood(event.target.value)} className="bg-secondary border border-border rounded-full px-3 py-2" aria-label="Filtrer par ambiance" data-testid="prime-mood-select">
              <option value="all">Toutes les ambiances</option>
              <option value="action">Action</option>
              <option value="feelgood">Feel good</option>
              <option value="dark">Sombre</option>
              <option value="epic">Épique</option>
              <option value="romance">Romance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3 xl:gap-4 mb-12" data-testid="prime-anime-grid">
          {filteredPrime.map((anime, index) => {
            const poster = anime.cover || anime.banner || "";
            const activeCard = selectedPrimeId === anime.id;
            const isSaved = watchTonightIds.includes(anime.id);
            return (
              <article
                key={`prime-${anime.id}`}
                className={cn(
                  "group rounded-[1.2rem] overflow-hidden border bg-card/80 transition-[transform,border-color,box-shadow] duration-200",
                  activeCard ? "border-sky-400/50 shadow-[0_18px_40px_-28px_rgba(14,165,233,0.7)]" : "border-border/70 hover:border-sky-400/40"
                )}
                data-testid={`prime-card-${anime.id}`}
              >
                <button type="button" onClick={() => selectPrimeAnime(anime)} className="block w-full text-left" data-testid={`prime-card-select-${anime.id}`}>
                  {anime.trailerId ? (
                    <HoverPreview
                      videoId={anime.trailerId}
                      title={anime.title}
                      thumbnail={poster}
                      aspectClass="aspect-[3/4]"
                      delay={120}
                      muted
                      className="w-full"
                    >
                      <div className="pointer-events-none absolute inset-0 rounded-t-[1.2rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_0_20px_rgba(56,189,248,0.12)]" />
                      <span className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow">PRIME</span>
                      {typeof anime.score === "number" && <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 text-[8px] font-semibold">{anime.score}</span>}
                    </HoverPreview>
                  ) : (
                    <div className="relative aspect-[3/4] overflow-hidden bg-[rgba(255,255,255,0.04)]" style={{ background: anime.color || "#0a1428" }}>
                      {poster ? (
                        <img
                          src={poster}
                          alt={anime.title}
                          loading={index < 8 ? "eager" : "lazy"}
                          decoding="async"
                          fetchPriority={index < 4 ? "high" : "auto"}
                          className="h-full w-full object-cover object-center saturate-[1.12] contrast-[1.03]"
                        />
                      ) : null}
                      <div className="pointer-events-none absolute inset-0 rounded-t-[1.2rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_0_20px_rgba(56,189,248,0.12)]" />
                      <span className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow">PRIME</span>
                      {typeof anime.score === "number" && <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 text-[8px] font-semibold">{anime.score}</span>}
                    </div>
                  )}
                </button>

                <div className="space-y-2 p-2.5">
                  <h4 className="line-clamp-2 text-[12px] font-semibold leading-tight text-white group-hover:text-sky-300 transition-colors" data-testid={`prime-card-title-${anime.id}`}>
                    {showFrenchCopy ? mapPrimeTitle(anime) : anime.title}
                  </h4>
                  <div className="text-[9px] text-muted-foreground">
                    {anime.format ?? "—"} · {anime.year ?? "—"}{anime.episodes ? ` · ${anime.episodes} ép.` : ""}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {smartBadges(anime).slice(0, 2).map((badge) => (
                      <span key={`${anime.id}-${badge}`} className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[8px] text-white/72">{badge}</span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <Button type="button" className="h-7 flex-1 rounded-lg px-2 text-[9px] text-white" onClick={() => selectPrimeAnime(anime)} data-testid={`prime-card-hero-button-${anime.id}`}>
                      <Sparkles className="h-3 w-3" /> Hero
                    </Button>
                    <Button type="button" variant="glass" className={cn("h-7 rounded-lg px-2 text-[9px] text-white", isSaved ? "border-sky-400/50 text-sky-200" : "")} onClick={() => toggleWatchTonight(anime.id)} data-testid={`prime-card-watch-button-${anime.id}`}>
                      <Heart className={cn("h-3 w-3", isSaved ? "fill-current" : "")} />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}

          {!primeLoading && filteredPrime.length === 0 && (
            <div className="col-span-full text-center text-sm text-muted-foreground py-8">Aucun titre disponible pour ce filtre.</div>
          )}
        </div>

        <h3 className="font-display text-xl font-bold mb-4 text-white" data-testid="prime-videos-library-title">
          Bibliothèque Prime <span className="text-muted-foreground font-normal">· {items.length} vidéos</span>
        </h3>
        <div className="grid grid-cols-4 gap-2 sm:gap-3 xl:gap-4" data-testid="prime-videos-grid">
          {items
            .filter((entry) => entry.videoId !== v.videoId)
            .map((entry) => (
              <button
                key={entry.id}
                onClick={() => {
                  setMainVideoUnavailable(false);
                  setActive(entry.videoId);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rgb-card group text-left rounded-[1.2rem] overflow-hidden bg-card border border-border/70 transition-[transform,border-color,box-shadow] duration-200 hover:border-sky-400/40"
                data-testid={`prime-video-card-${entry.id}`}
              >
                <HoverPreview
                  videoId={entry.videoId}
                  title={entry.title}
                  thumbnail={entry.thumbnail}
                  vertical={orientation === "vertical"}
                  className="w-full"
                  aspectClass={orientation === "vertical" ? "aspect-[3/4]" : "aspect-[3/4]"}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-t-[1.2rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_0_20px_rgba(56,189,248,0.12)]" />
                  <span className="absolute top-2 left-2 z-20">
                    <AdminRemoveVideo rowId={entry.id} source="youtube" externalId={entry.videoId} onRemoved={() => setItems((current) => current.filter((it) => it.id !== entry.id))} />
                  </span>
                  <span className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white">PRIME</span>
                </HoverPreview>
                <div className="p-2.5">
                  <div className="line-clamp-2 text-[12px] font-semibold text-white group-hover:text-sky-300 transition-colors">{showFrenchCopy ? getTranslatedPrimeText(entry.title) : entry.title}</div>
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
