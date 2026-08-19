import { useEffect, useState, useMemo, useCallback } from "react";
import { buildYouTubeEmbedUrl } from "@/lib/youtubeEmbed";
import { API_BASE as API } from "@/lib/apiBase";
import { Palette, ChevronDown, Sparkles, Award, Zap, Heart, Play, Loader2, X, Languages } from "lucide-react";
import { motion } from "framer-motion";
import NeonFooterBar from "@/components/NeonFooterBar";
import { Navbar } from "@/components/Navbar";
import YoutubeBrandCover from "@/components/YoutubeBrandCover";
import TopVideoBanner from "@/components/TopVideoBanner";

type Media = {
  id: number;
  title: { romaji?: string; english?: string };
  coverImage: { extraLarge?: string; large?: string; color?: string };
  bannerImage?: string;
  nextAiringEpisode?: { airingAt: number; episode: number; timeUntilAiring: number };
  genres?: string[];
  format?: string;
  episodes?: number;
  averageScore?: number;
  description?: string;
  studios?: { nodes?: { name?: string }[] };
  duration?: number;
  season?: string;
  seasonYear?: number;
  trailer?: { id?: string; site?: string } | null;
};

const QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC, isAdult: false) {
      id
      title { romaji english }
      coverImage { extraLarge large color }
      bannerImage
      nextAiringEpisode { airingAt episode timeUntilAiring }
      genres
      format
      episodes
      duration
      season
      seasonYear
      averageScore
      description(asHtml: false)
      studios(isMain: true) { nodes { name } }
      trailer { id site }
    }
  }
}`;

const TRAILER_VERSION_LABEL = {
  vostfr: "VOSTFR",
  vf: "VF (Doublage)",
  vo: "VO (Japonais)",
  ensub: "English (Sub)",
  endub: "English Dub",
};
const VERSION_ORDER = ["vostfr", "vf", "vo", "ensub", "endub"];

function formatCountdown(seconds: number) {
  if (seconds <= 0) return "En diffusion";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}j ${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
}

/**
 * Premium Upcoming Anime Page — with AI interactions, reward system, and futuristic banner
 */
export default function AnimeCountdown() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  
  const themes = [
    { key: "light", label: "Clair", bg: "#f5f3ee", surface: "rgba(0,0,0,0.04)", text: "#1a1a1a", muted: "rgba(0,0,0,0.55)", border: "rgba(0,0,0,0.08)", titleColor: "#7c3aed", accentColor: "#06b6d4" },
    { key: "cream", label: "Crème", bg: "#faf6ef", surface: "rgba(0,0,0,0.03)", text: "#2d2416", muted: "rgba(45,36,22,0.6)", border: "rgba(45,36,22,0.1)", titleColor: "#8b5cf6", accentColor: "#f59e0b" },
    { key: "sky", label: "Ciel", bg: "#eaf4fb", surface: "rgba(0,0,0,0.03)", text: "#0c2340", muted: "rgba(12,35,64,0.6)", border: "rgba(12,35,64,0.1)", titleColor: "#06b6d4", accentColor: "#2563eb" },
    { key: "sakura", label: "Sakura", bg: "#fdeef2", surface: "rgba(0,0,0,0.03)", text: "#4a1d2b", muted: "rgba(74,29,43,0.6)", border: "rgba(74,29,43,0.1)", titleColor: "#db2777", accentColor: "#f97316" },
    { key: "dark", label: "Nuit", bg: "#05040b", surface: "rgba(255,255,255,0.04)", text: "#ffffff", muted: "rgba(255,255,255,0.6)", border: "rgba(255,255,255,0.1)", titleColor: "#a78bfa", accentColor: "#22d3ee" },
  ] as const;
  
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = themes[themeIdx];
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [rewards, setRewards] = useState(0);
  const [aiPresenterShown, setAiPresenterShown] = useState(false);
  const [interactedItems, setInteractedItems] = useState<Set<number>>(new Set());
  const [selectedAnime, setSelectedAnime] = useState<Media | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<number | null>(null);
  const [expandedPlayback, setExpandedPlayback] = useState<Record<number, boolean>>({});
  const [translationLang, setTranslationLang] = useState<string>("fr");
  const [translatedDescriptions, setTranslatedDescriptions] = useState<Record<number, string>>({});
  const TRANSLATION_OPTIONS = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "es", label: "Español" },
    { code: "de", label: "Deutsch" },
  ];
  const [versionPanelState, setVersionPanelState] = useState({
    loading: false,
    availableVersions: {} as Record<string, string[]>,
    selectedVersion: "vo",
    error: "",
  });

  const stripHtml = (s?: string) =>
    (s || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();

  // AI Presenter messages
  const aiMessages = [
    "✨ Découvre les animés de la semaine !",
    "🚀 Les meilleures premières en avant-première",
    "💫 Gagne des récompenses en explorant !",
    "🎬 Prêt pour une nouvelle aventure ?",
    "⭐ Top animés à ne pas manquer",
  ];

  const smartBadges = (m: Media): string[] => {
    const badges: string[] = [];
    if (m.nextAiringEpisode!.episode === 1) badges.push("🆕 Nouvelle série");
    if ((m.averageScore ?? 0) >= 85) badges.push("⭐ Top-rated");
    if ((m.episodes ?? 0) >= 24) badges.push("📺 Longue série");
    if ((m.format || "").toLowerCase().includes("movie")) badges.push("🎞️ Film");
    const hasPopularGenre = m.genres?.some(g => 
      ["action", "adventure", "romance"].includes(g.toLowerCase())
    );
    if (hasPopularGenre) badges.push("🔥 Tendance");
    return badges.slice(0, 3);
  };

  const handleInteraction = (mediaId: number) => {
    if (!interactedItems.has(mediaId)) {
      setInteractedItems(new Set([...interactedItems, mediaId]));
      setRewards(rewards + 10);
      setAiPresenterShown(true);
    }
  };

  const favoriteItems = useMemo(() => items.filter((item) => favoriteIds.includes(item.id)), [items, favoriteIds]);

  const saveFavoriteIds = useCallback((updater: (prev: number[]) => number[]) => {
    setFavoriteIds((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem("lovanet.countdown.favorites", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    saveFavoriteIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  }, [saveFavoriteIds]);

  const getVersionLabel = useCallback((code: string) => TRAILER_VERSION_LABEL[code] || code.toUpperCase(), []);

  const fetchFavoriteVersions = useCallback(async (item: Media) => {
    setVersionPanelState({ loading: true, availableVersions: {}, selectedVersion: "vo", error: "" });
    try {
      const response = await fetch(`${API}/prime/multilingual-trailers?q=${encodeURIComponent(item.title.english || item.title.romaji || "")}`);
      const data = await response.json();
      const versions = Object.entries(data?.results || {}).reduce((acc, [code, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          acc[code] = values.map((value) => (typeof value === "string" ? value : value?.id)).filter(Boolean) as string[];
        }
        return acc;
      }, {} as Record<string, string[]>);
      const firstAvailable = VERSION_ORDER.find((code) => versions[code]) || Object.keys(versions)[0] || "vo";
      setVersionPanelState({ loading: false, availableVersions: versions, selectedVersion: firstAvailable, error: Object.keys(versions).length ? "" : "Aucune version disponible." });
    } catch (error) {
      setVersionPanelState({ loading: false, availableVersions: {}, selectedVersion: "vo", error: "Impossible de charger les versions." });
    }
  }, []);

  const translateText = useCallback(async (text: string, targetLanguage: string) => {
    if (targetLanguage === "fr" || !text) return text;
    try {
      const response = await fetch(`${API}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: [text], target_lang: targetLanguage }),
      });
      if (!response.ok) throw new Error(`Translate error: ${response.status}`);
      const data = await response.json();
      const translations = data.translations || [];
      return translations[0]?.translated_text || text;
    } catch (err) {
      console.error("Translation failed:", err);
      return text;
    }
  }, []);

  const handleTranslateDescription = useCallback(async (item: Media, lang: string) => {
    const original = item.description || "";
    if (!original) return;
    if (lang === "fr") {
      setTranslationLang("fr");
      return;
    }
    setTranslationLang(lang);
    const translated = await translateText(original, lang);
    setTranslatedDescriptions((prev) => ({ ...prev, [item.id]: translated }));
  }, [translateText]);

  const selectPanelVersion = useCallback((versionCode: string) => {
    setVersionPanelState((prev) => ({ ...prev, selectedVersion: versionCode }));
  }, []);

  const buildTrailerUrl = useCallback((versionCode: string, item: Media) => {
    const id = versionPanelState.availableVersions[versionCode]?.[0] || item.trailer?.id;
    return id ? `https://youtu.be/${id}` : "#";
  }, [versionPanelState.availableVersions]);

  const selectFavorite = useCallback((id: number) => {
    setSelectedFavoriteId(id);
    const item = items.find((m) => m.id === id);
    if (item) fetchFavoriteVersions(item);
  }, [items, fetchFavoriteVersions]);

  const selectedFavorite = useMemo(
    () => items.find((item) => item.id === selectedFavoriteId) || (favoriteItems.length ? favoriteItems[0] : null),
    [items, selectedFavoriteId, favoriteItems],
  );

  const isFavorite = useCallback((id: number) => favoriteIds.includes(id), [favoriteIds]);

  const fetchData = async () => {
    try {
      const pageNums = Array.from({ length: 20 }, (_, i) => i + 1);
      const dedup = new Map<number, Media>();
      for (let i = 0; i < pageNums.length; i += 4) {
        const batch = pageNums.slice(i, i + 4);
        const results = await Promise.all(
          batch.map((p) =>
            fetch("https://graphql.anilist.co", {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({ query: QUERY, variables: { page: p, perPage: 50 } }),
            }).then((r) => r.json()).catch(() => null)
          )
        );
        let stop = false;
        for (const j of results) {
          const list = j?.data?.Page?.media ?? [];
          if (!list.length) stop = true;
          for (const m of list) {
            if (m.nextAiringEpisode?.airingAt && !dedup.has(m.id)) dedup.set(m.id, m);
          }
        }
        const snapshot = Array.from(dedup.values()).sort(
          (a, b) => (a.nextAiringEpisode?.airingAt ?? 0) - (b.nextAiringEpisode?.airingAt ?? 0)
        );
        setItems(snapshot);
        setLoading(false);
        if (stop) break;
        await new Promise((r) => setTimeout(r, 120));
      }
      const list = Array.from(dedup.values());
      list.sort(
        (a, b) =>
          (a.nextAiringEpisode?.airingAt ?? 0) - (b.nextAiringEpisode?.airingAt ?? 0)
      );
      if (list.length) {
        setItems(list);
        try {
          localStorage.setItem("lovanet.cache.countdown.v2", JSON.stringify(list));
          localStorage.removeItem("lovanet.cache.countdown");
        } catch {
          // ignore cache write failure
        }
      }
    } catch (e) {
      console.error("AniList fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const c = localStorage.getItem("lovanet.cache.countdown.v2");
      if (c) { setItems(JSON.parse(c)); setLoading(false); }
    } catch {
      // ignore cache read failure
    }
    try {
      const storedFavorites = localStorage.getItem("lovanet.countdown.favorites");
      if (storedFavorites) {
        setFavoriteIds(JSON.parse(storedFavorites));
      }
    } catch {
      // ignore
    }
    try {
      const e = localStorage.getItem("lovanet.cache.countdown.expanded");
      if (e) setExpanded(JSON.parse(e));
      const t = localStorage.getItem("lovanet.cache.countdown.theme");
      if (t) setThemeIdx(Number(t) || 0);
      const r = localStorage.getItem("lovanet.cache.countdown.rewards");
      if (r) setRewards(Number(r) || 0);
    } catch {
      // ignore cache read failure
    }
    fetchData();
    const sync = setInterval(fetchData, 1000 * 60 * 3);
    const tick = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    const onFocus = () => fetchData();
    const onVisibility = () => { if (document.visibilityState === "visible") fetchData(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(sync);
      clearInterval(tick);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lovanet.cache.countdown.expanded", JSON.stringify(expanded));
    } catch {}
  }, [expanded]);
  
  useEffect(() => {
    try {
      localStorage.setItem("lovanet.cache.countdown.theme", String(themeIdx));
    } catch {}
  }, [themeIdx]);

  useEffect(() => {
    try {
      localStorage.setItem("lovanet.cache.countdown.rewards", String(rewards));
    } catch {}
  }, [rewards]);

  return (
    <main
      className="min-h-screen pb-20 relative overflow-hidden transition-colors nav-theme-shell"
      style={{ color: theme.text }}
    >
      <span className="nav-cloud nav-cloud-1" aria-hidden="true" />
      <span className="nav-cloud nav-cloud-2" aria-hidden="true" />
      <span className="nav-cloud nav-cloud-3" aria-hidden="true" />
      <Navbar />
      <div className="h-12" />

      {/* Premium Animated Banner with Videos & Decorations */}
      <div 
        className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.35)] nav-bar-shell glass3d-panel"
        style={{
          background: `linear-gradient(135deg, ${theme.accentColor}15 0%, ${theme.titleColor}15 100%)`,
          borderBottom: `2px solid ${theme.accentColor}40`,
        }}
      >
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            background: `radial-gradient(circle, ${theme.titleColor}40 0%, transparent 70%)`
          }}
        />
        <div className="relative px-4 md:px-10 py-8">
          <TopVideoBanner
            videos={items
              .filter((m) => m.trailer?.id && m.trailer?.site === "youtube")
              .slice(0, 12)
              .map((m) => ({ id: m.trailer!.id!, title: m.title.english || m.title.romaji }))
            }
          />
          
          {/* AI Presenter Card */}
          <motion.div 
            className="mt-6 rounded-2xl p-5 flex items-center gap-4"
            style={{ 
              backgroundColor: theme.surface,
              border: `1.5px solid ${theme.accentColor}60`,
              boxShadow: `0 8px 32px ${theme.titleColor}20`
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 flex-shrink-0" style={{ color: theme.accentColor }} />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: theme.titleColor }}>
                {aiMessages[Math.floor(Math.random() * aiMessages.length)]}
              </p>
              <p className="text-xs mt-1" style={{ color: theme.muted }}>
                Récompenses gagnées: <span style={{ color: theme.accentColor, fontWeight: "bold" }}>{rewards} pts</span>
              </p>
            </div>
            <Award className="w-6 h-6" style={{ color: theme.accentColor }} />
          </motion.div>
        </div>
      </div>

      <section className="relative px-4 md:px-10 mt-6">
        <div className="glass3d-panel nav-bar-shell nav-theme-shell rounded-[2rem] border border-white/10 p-6 overflow-hidden">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">Favoris suivis</p>
              <h2 className="text-3xl font-black text-white">Suivi des séries</h2>
              <p className="max-w-2xl text-sm text-white/70">Retrouvez vos animés favoris, leur prochain épisode, et choisissez la version du trailer avant lecture.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {favoriteItems.length > 0 ? (
                <button
                  type="button"
                  className="nav-theme-chip inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
                  onClick={() => selectFavorite(favoriteItems[0].id)}
                >
                  Voir dernier favori
                </button>
              ) : (
                <div className="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70">Aucun favori suivi</div>
              )}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.95fr]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {favoriteItems.length ? favoriteItems.map((item) => {
                  const airingAt = item.nextAiringEpisode?.airingAt ?? 0;
                  const remaining = airingAt ? formatCountdown(Math.max(0, airingAt - now)) : "Date inconnue";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectFavorite(item.id)}
                      className={`group rounded-[1.5rem] border border-white/15 bg-white/10 p-4 text-left transition-all duration-300 hover:border-white/30 hover:shadow-[0_26px_60px_-32px_rgba(255,255,255,0.95)] ${selectedFavoriteId === item.id ? "ring-2 ring-fuchsia-400/50" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/50">Suivi</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                          className="rounded-full border border-white/15 bg-black/30 p-2 text-white/80 hover:text-white"
                          aria-label={isFavorite(item.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          {isFavorite(item.id) ? "❤️" : "🤍"}
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-white line-clamp-2">{item.title.english || item.title.romaji}</p>
                      <p className="mt-2 text-[11px] text-white/60">Épisode {item.nextAiringEpisode?.episode ?? "?"} • {remaining}</p>
                    </button>
                  );
                }) : (
                  <div className="rounded-[1.5rem] border border-white/15 bg-white/5 p-4 text-sm text-white/70">
                    Ajoutez des animés à vos favoris depuis les cartes pour les suivre ici.
                  </div>
                )}
              </div>

              {selectedFavorite ? (
                <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.75)]">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                    <div className="space-y-3 xl:flex-1">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-white/60">
                        <span>Favori sélectionné</span>
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
                      </div>
                      <h3 className="text-2xl font-black text-white">{selectedFavorite.title.english || selectedFavorite.title.romaji}</h3>
                      <p className="text-sm text-white/70">Prochain épisode dans <span className="font-semibold text-white">{selectedFavorite.nextAiringEpisode ? formatCountdown(Math.max(0, selectedFavorite.nextAiringEpisode.airingAt - now)) : "N/A"}</span></p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <span className="rounded-2xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/80">Genre: {(selectedFavorite.genres || []).slice(0, 2).join(" • ") || "N/A"}</span>
                        <span className="rounded-2xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/80">Studio: {selectedFavorite.studios?.nodes?.[0]?.name || "N/A"}</span>
                      </div>
                    </div>
                    <div className="relative w-full max-w-[240px] overflow-hidden rounded-[2rem] border border-white/15 bg-black/50 shadow-[0_24px_80px_-34px_rgba(0,0,0,0.75)]">
                      {selectedFavorite.trailer?.id ? (
                        <iframe
                          src={buildYouTubeEmbedUrl(selectedFavorite.trailer.id, { autoplay: false, muted: false, controls: true, playsInline: true })}
                          title={`Trailer ${selectedFavorite.title.english || selectedFavorite.title.romaji || ""}`}
                          className="h-[420px] w-full object-cover"
                          loading="lazy"
                          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        />
                      ) : (
                        <img
                          src={selectedFavorite.coverImage.extraLarge}
                          alt={selectedFavorite.title.english || selectedFavorite.title.romaji}
                          className="h-[420px] w-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[1.75rem] border border-white/15 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.32em] text-white/60">Versions disponibles</p>
                      <div className="mt-3 grid gap-2">
                        {versionPanelState.loading ? (
                          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70">
                            <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
                          </div>
                        ) : versionPanelState.error ? (
                          <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{versionPanelState.error}</p>
                        ) : VERSION_ORDER.filter((code) => versionPanelState.availableVersions[code]).map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => selectPanelVersion(code)}
                            className={`w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold transition ${versionPanelState.selectedVersion === code ? "bg-fuchsia-500 text-white shadow-[0_0_24px_rgba(255,255,255,0.14)]" : "bg-white/10 text-white/80 hover:bg-white/15"}`}
                          >
                            {getVersionLabel(code)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.75rem] border border-white/15 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.32em] text-white/60">Lecture</p>
                      <a
                        href={buildTrailerUrl(versionPanelState.selectedVersion, selectedFavorite)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-16px_rgba(217,70,239,0.45)] hover:bg-fuchsia-400"
                      >
                        Lire la version {getVersionLabel(versionPanelState.selectedVersion)}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-white/15 bg-black/20 p-5 text-white/70">
                  Sélectionnez un favori pour afficher sa fiche, sa miniature verticale et les versions disponibles.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <header className="relative px-4 md:px-10 pt-10 pb-6 nav-bar-shell nav-theme-shell glass3d-panel">
        <div className="text-center">
          <motion.h1
            className="text-3xl md:text-5xl font-black tracking-wide"
            style={{ color: "#ffffff" }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            Animés à venir
          </motion.h1>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.85)" }}>
            Explorez les prochains épisodes et gagnez des récompenses 🎁
          </p>
        </div>

        {/* Theme picker */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full p-1.5 ml-4"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
          <Palette className="w-4 h-4 mx-2" style={{ color: theme.muted }} />
          {themes.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setThemeIdx(i)}
              aria-label={`Thème ${t.label}`}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                i === themeIdx ? "scale-105" : "opacity-70 hover:opacity-100"
              }`}
              style={{
                backgroundColor: i === themeIdx ? t.titleColor : "transparent",
                color: i === themeIdx ? (t.key === "dark" ? "#000" : "#fff") : theme.text,
                border: `1px solid ${i === themeIdx ? t.titleColor : theme.border}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <section className="relative px-4 md:px-10 nav-bar-shell nav-theme-shell glass3d-panel p-6">
        {loading && <p className="text-center" style={{ color: "rgba(255,255,255,0.85)" }}>Chargement…</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((m) => {
            const airingAt = m.nextAiringEpisode!.airingAt;
            const remaining = airingAt - now;
            const color = m.coverImage.color || "#a855f7";
            const badges = smartBadges(m);
            const isInteracted = interactedItems.has(m.id);
            
            return (
              <motion.article
                key={m.id}
                className="relative rounded-[1.75rem] overflow-hidden transition-all cursor-pointer group nav-theme-shell"
                style={{
                  backgroundColor: theme.surface,
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: `0 10px 40px ${color}33`,
                }}
                whileHover={{ y: -8, boxShadow: `0 20px 60px ${color}55` }}
                onClick={() => {
                  setSelectedAnime(m);
                  handleInteraction(m.id);
                }}
              >
                {/* Gradient overlay indicator */}
                {isInteracted && (
                  <motion.div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${theme.accentColor}20 0%, transparent 100%)`
                    }}
                    animate={{ opacity: [0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Premium poster section */}
                <div
                  className="relative flex items-center justify-center p-3 overflow-hidden"
                  style={{ backgroundColor: `${color}22` }}
                >
                  <motion.img
                    src={m.coverImage.extraLarge}
                    alt={m.title.romaji || ""}
                    loading="lazy"
                    className="w-full h-auto max-h-[360px] object-contain rounded-xl group-hover:scale-105 transition-transform"
                  />
                  
                  {/* Smart badges overlay */}
                  <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5">
                    {badges.map((badge, idx) => (
                      <motion.span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full font-bold"
                        style={{
                          backgroundColor: `${theme.accentColor}80`,
                          color: "#fff",
                          backdropFilter: "blur(10px)"
                        }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {badge}
                      </motion.span>
                    ))}
                  </div>

                  {/* Play indicator on hover */}
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                  >
                    <Play className="w-12 h-12" style={{ color: theme.accentColor }} />
                  </motion.div>
                </div>

                {/* Premium content section */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                      Épisode {m.nextAiringEpisode!.episode}
                      {m.episodes ? ` / ${m.episodes}` : ""}
                    </div>
                    {isInteracted && <Sparkles className="w-4 h-4" style={{ color: theme.accentColor }} />}
                  </div>
                  
                  <h2 className="text-base font-bold line-clamp-2 mb-3" style={{ color: "#ffffff" }}>
                    {m.title.english || m.title.romaji}
                  </h2>
                  
                  {/* Countdown timer with animation */}
                  <motion.div
                    className="text-center font-mono text-lg tracking-wider font-bold p-2 rounded-lg mb-2"
                    style={{ 
                      color: theme.accentColor,
                      backgroundColor: `${theme.accentColor}15`,
                      border: `1px solid ${theme.accentColor}40`
                    }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {formatCountdown(remaining)}
                  </motion.div>
                  
                  <div className="text-center text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.72)" }}>
                    {new Date(airingAt * 1000).toLocaleString("fr-FR")}
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                    {m.genres?.slice(0, 3).map((g) => (
                      <motion.span
                        key={g}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: theme.surface, 
                          color: theme.titleColor, 
                          border: `1px solid ${theme.border}`,
                          fontWeight: "600"
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {g}
                      </motion.span>
                    ))}
                  </div>

                  {/* Metadata grid */}
                  {m.averageScore && (
                    <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
                      <div 
                        style={{ 
                          backgroundColor: theme.surface,
                          border: `1px solid ${theme.border}`,
                          padding: "8px",
                          borderRadius: "6px"
                        }}
                      >
                        <div style={{ color: theme.muted }}>Score</div>
                        <div className="font-bold" style={{ color: theme.accentColor }}>{m.averageScore}/100</div>
                      </div>
                      <div 
                        style={{ 
                          backgroundColor: theme.surface,
                          border: `1px solid ${theme.border}`,
                          padding: "8px",
                          borderRadius: "6px"
                        }}
                      >
                        <div style={{ color: theme.muted }}>Studio</div>
                        <div className="font-bold truncate" style={{ color: theme.text }}>
                          {m.studios?.nodes?.[0]?.name || "N/A"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interaction buttons */}
                  <div className="flex gap-2 mb-3">
                    <motion.button
                      className="flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1 nav-theme-chip"
                      style={{
                        backgroundColor: isInteracted ? theme.accentColor : `${theme.accentColor}40`,
                        color: isInteracted ? "#fff" : theme.accentColor,
                        border: `1px solid ${theme.accentColor}60`
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isInteracted ? "👍 Exploré" : "Découvrir"} <Zap className="w-3 h-3" />
                    </motion.button>
                    <motion.button
                      className="py-2 px-3 rounded-lg font-bold text-xs"
                      style={{
                        backgroundColor: theme.surface,
                        border: `1.5px solid ${theme.titleColor}60`
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Heart className="w-4 h-4" style={{ color: theme.titleColor }} />
                    </motion.button>
                  </div>

                  {/* Hidden description / full sheet — expandable */}
                  <div>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((s) => ({ ...s, [m.id]: !s[m.id] }));
                      }}
                      className="w-full inline-flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-widest py-1.5 rounded-lg transition-colors"
                      style={{
                        backgroundColor: theme.surface,
                        color: "#ffffff",
                        border: `1px solid ${theme.border}`,
                      }}
                      aria-expanded={!!expanded[m.id]}
                      whileHover={{ scale: 1.05 }}
                    >
                      {expanded[m.id] ? "Masquer" : "Fiche complète"}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${expanded[m.id] ? "rotate-180" : ""}`}
                      />
                    </motion.button>

                    {expanded[m.id] && (
                      <motion.div
                      className="mt-3 space-y-3 text-[12px] leading-relaxed rounded-lg p-3 text-white"
                      style={{
                        backgroundColor: theme.surface,
                        border: `1px solid ${theme.border}`,
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {m.trailer?.id && m.trailer?.site === "youtube" ? (
                        <div
                        className="relative w-full aspect-video rounded-lg overflow-hidden bg-black"
                        onMouseEnter={() => setExpandedPlayback((prev) => ({ ...prev, [m.id]: true }))}
                        onTouchStart={() => setExpandedPlayback((prev) => ({ ...prev, [m.id]: true }))}
                      >
                          <img
                            src={`https://i.ytimg.com/vi/${m.trailer.id}/hqdefault.jpg`}
                            alt={`Miniature trailer ${m.title.english || m.title.romaji || ""}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur"
                              onClick={() => setExpandedPlayback((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}
                            >
                              <Play className="w-4 h-4" />
                              {expandedPlayback[m.id] ? "Arrêter" : "Lire le trailer"}
                            </button>
                          </div>
                          {expandedPlayback[m.id] && (
                            <iframe
                              src={buildYouTubeEmbedUrl(m.trailer.id, { autoplay: true, muted: true, controls: true, playsInline: true })}
                              title={`Trailer ${m.title.english || m.title.romaji || ""}`}
                              className="absolute inset-0 w-full h-full"
                              loading="lazy"
                              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                              allowFullScreen
                            />
                          )}
                          <YoutubeBrandCover />
                        </div>
                      ) : null}
                      
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs uppercase tracking-[0.32em] text-white/60">Description</div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Languages className="w-4 h-4 text-white/80" />
                            {TRANSLATION_OPTIONS.map((lang) => (
                              <button
                                key={lang.code}
                                type="button"
                                onClick={() => handleTranslateDescription(m, lang.code)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${translationLang === lang.code ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/20"}`}
                              >
                                {lang.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        {m.description && (
                          <p className="whitespace-pre-line text-white">
                            {translationLang !== "fr" ? translatedDescriptions[m.id] || stripHtml(m.description) : stripHtml(m.description)}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {m.format && (
                          <div
                            style={{
                              backgroundColor: `${theme.accentColor}20`,
                              border: `1px solid ${theme.accentColor}40`,
                              padding: "8px",
                              borderRadius: "6px"
                            }}
                          >
                            <div style={{ color: theme.muted }}>Format</div>
                            <div className="font-bold" style={{ color: theme.titleColor }}>{m.format}</div>
                          </div>
                          )}
                          {m.episodes && (
                            <div
                              style={{
                                backgroundColor: `${theme.titleColor}20`,
                                border: `1px solid ${theme.titleColor}40`,
                                padding: "8px",
                                borderRadius: "6px"
                              }}
                            >
                              <div style={{ color: theme.muted }}>Épisodes</div>
                              <div className="font-bold" style={{ color: theme.titleColor }}>{m.episodes}</div>
                            </div>
                          )}
                          {m.duration && (
                            <div
                              style={{
                                backgroundColor: `${theme.accentColor}20`,
                                border: `1px solid ${theme.accentColor}40`,
                                padding: "8px",
                                borderRadius: "6px"
                              }}
                            >
                              <div style={{ color: theme.muted }}>Durée</div>
                              <div className="font-bold" style={{ color: theme.accentColor }}>{m.duration} min</div>
                            </div>
                          )}
                          {(m.season || m.seasonYear) && (
                            <div
                              style={{
                                backgroundColor: `${theme.titleColor}20`,
                                border: `1px solid ${theme.titleColor}40`,
                                padding: "8px",
                                borderRadius: "6px"
                              }}
                            >
                              <div style={{ color: theme.muted }}>Saison</div>
                              <div className="font-bold" style={{ color: theme.titleColor }}>
                                {[m.season, m.seasonYear].filter(Boolean).join(" ")}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <NeonFooterBar />
    </main>
  );
}
