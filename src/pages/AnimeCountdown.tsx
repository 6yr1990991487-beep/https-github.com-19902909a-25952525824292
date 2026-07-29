import { useEffect, useState } from "react";
import { Palette, ChevronDown } from "lucide-react";
import NeonFooterBar from "@/components/NeonFooterBar";
import { Navbar } from "@/components/Navbar";
import YoutubeBrandCover from "@/components/YoutubeBrandCover";

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

function formatCountdown(seconds: number) {
  if (seconds <= 0) return "En diffusion";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}j ${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
}

/**
 * Upcoming anime episodes — auto-synced from AniList GraphQL (public, no key).
 * Original card design with live countdown per item.
 */
export default function AnimeCountdown() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const themes = [
    { key: "light", label: "Clair", bg: "#f5f3ee", surface: "rgba(0,0,0,0.04)", text: "#1a1a1a", muted: "rgba(0,0,0,0.55)", border: "rgba(0,0,0,0.08)", titleColor: "#e11d48" },
    { key: "cream", label: "Crème", bg: "#faf6ef", surface: "rgba(0,0,0,0.03)", text: "#2d2416", muted: "rgba(45,36,22,0.6)", border: "rgba(45,36,22,0.1)", titleColor: "#b45309" },
    { key: "sky", label: "Ciel", bg: "#eaf4fb", surface: "rgba(0,0,0,0.03)", text: "#0c2340", muted: "rgba(12,35,64,0.6)", border: "rgba(12,35,64,0.1)", titleColor: "#2563eb" },
    { key: "sakura", label: "Sakura", bg: "#fdeef2", surface: "rgba(0,0,0,0.03)", text: "#4a1d2b", muted: "rgba(74,29,43,0.6)", border: "rgba(74,29,43,0.1)", titleColor: "#be185d" },
    { key: "dark", label: "Nuit", bg: "#05040b", surface: "rgba(255,255,255,0.04)", text: "#ffffff", muted: "rgba(255,255,255,0.6)", border: "rgba(255,255,255,0.1)", titleColor: "#22d3ee" },
  ] as const;
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = themes[themeIdx];
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const stripHtml = (s?: string) =>
    (s || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();

  const fetchData = async () => {
    try {
      // Pull as many pages as AniList exposes for releasing shows so we catch every new episode
      const pageNums = Array.from({ length: 20 }, (_, i) => i + 1); // up to 1000 titles
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
        // Progressive render so new titles appear as they're fetched
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
        } catch {}
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
    } catch {}
    try {
      const e = localStorage.getItem("lovanet.cache.countdown.expanded");
      if (e) setExpanded(JSON.parse(e));
      const t = localStorage.getItem("lovanet.cache.countdown.theme");
      if (t) setThemeIdx(Number(t) || 0);
    } catch {}
    fetchData();
    const sync = setInterval(fetchData, 1000 * 60 * 3); // auto-sync every 3 min
    const tick = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    // Re-sync when the tab regains focus so the user always sees the latest additions
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

  return (
    <main
      className="min-h-screen pb-20 relative overflow-hidden transition-colors"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <Navbar />
      <div className="h-12" />

      <header className="relative px-4 md:px-10 pt-10 pb-6 text-center">
        <h1
          className="text-3xl md:text-5xl font-black tracking-wide"
          style={{ color: theme.titleColor }}
        >
          Animés à venir — Compte à rebours
        </h1>

        {/* Theme picker */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full p-1.5"
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

      <section className="relative px-4 md:px-10">
        {loading && <p className="text-center" style={{ color: theme.muted }}>Chargement…</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((m) => {
            const airingAt = m.nextAiringEpisode!.airingAt;
            const remaining = airingAt - now;
            const color = m.coverImage.color || "#a855f7";
            return (
              <article
                key={m.id}
                className="relative rounded-2xl overflow-hidden transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  boxShadow: `0 10px 40px ${color}33`,
                }}
              >
                {/* Full poster fully visible — no crop, no overlay */}
                <div
                  className="relative flex items-center justify-center p-3"
                  style={{ backgroundColor: `${color}22` }}
                >
                  {m.coverImage.extraLarge && (
                    <img
                      src={m.coverImage.extraLarge}
                      alt={m.title.romaji || ""}
                      loading="lazy"
                      className="w-full h-auto max-h-[360px] object-contain rounded-xl"
                    />
                  )}
                </div>

                <div className="p-4">
                  <div className="text-xs mb-1" style={{ color: theme.muted }}>
                    Épisode {m.nextAiringEpisode!.episode}
                    {m.episodes ? ` / ${m.episodes}` : ""}
                  </div>
                  <h2 className="text-base font-bold line-clamp-2 mb-3" style={{ color: theme.text }}>
                    {m.title.english || m.title.romaji}
                  </h2>
                  <div
                    className="text-center font-mono text-lg tracking-wider"
                    style={{ color }}
                  >
                    {formatCountdown(remaining)}
                  </div>
                  <div className="text-center text-[11px] mt-1" style={{ color: theme.muted }}>
                    {new Date(airingAt * 1000).toLocaleString("fr-FR")}
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                    {m.genres?.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: theme.surface, color: theme.muted, border: `1px solid ${theme.border}` }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Hidden description / full sheet — expandable, always available */}
                  <div className="mt-3">
                      <button
                        onClick={() =>
                          setExpanded((s) => ({ ...s, [m.id]: !s[m.id] }))
                        }
                        className="w-full inline-flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-widest py-1.5 rounded-lg transition-colors"
                        style={{
                          backgroundColor: theme.surface,
                          color: theme.titleColor,
                          border: `1px solid ${theme.border}`,
                        }}
                        aria-expanded={!!expanded[m.id]}
                      >
                        {expanded[m.id] ? "Masquer la fiche" : "Fiche complète & trailer"}
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${expanded[m.id] ? "rotate-180" : ""}`}
                        />
                      </button>

                      {expanded[m.id] && (
                        <div
                          className="mt-3 space-y-2 text-[12px] leading-relaxed rounded-lg p-3"
                          style={{
                            backgroundColor: theme.surface,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          {m.trailer?.id && m.trailer?.site === "youtube" ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                              <iframe
                                src={`https://www.youtube-nocookie.com/embed/${m.trailer.id}?rel=0&modestbranding=1&playsinline=1`}
                                title={`Trailer ${m.title.english || m.title.romaji || ""}`}
                                className="absolute inset-0 w-full h-full"
                                loading="lazy"
                                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                allowFullScreen
                              />
                              <YoutubeBrandCover />
                            </div>
                          ) : m.bannerImage ? (
                            <img
                              src={m.bannerImage}
                              alt=""
                              loading="lazy"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : null}
                          {m.studios?.nodes?.[0]?.name && (
                            <div className="text-[10px] uppercase tracking-widest" style={{ color: theme.muted }}>
                              Studio · {m.studios.nodes.map((n) => n?.name).filter(Boolean).join(", ")}
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-2 text-[11px]">
                            {typeof m.averageScore === "number" && (
                              <div>
                                <div style={{ color: theme.muted }}>Score</div>
                                <div className="font-bold" style={{ color: theme.text }}>{m.averageScore}/100</div>
                              </div>
                            )}
                            {m.format && (
                              <div>
                                <div style={{ color: theme.muted }}>Format</div>
                                <div className="font-bold" style={{ color: theme.text }}>{m.format}</div>
                              </div>
                            )}
                            {m.episodes && (
                              <div>
                                <div style={{ color: theme.muted }}>Épisodes</div>
                                <div className="font-bold" style={{ color: theme.text }}>{m.episodes}</div>
                              </div>
                            )}
                            {m.duration && (
                              <div>
                                <div style={{ color: theme.muted }}>Durée</div>
                                <div className="font-bold" style={{ color: theme.text }}>{m.duration} min</div>
                              </div>
                            )}
                            {(m.season || m.seasonYear) && (
                              <div>
                                <div style={{ color: theme.muted }}>Saison</div>
                                <div className="font-bold" style={{ color: theme.text }}>
                                  {[m.season, m.seasonYear].filter(Boolean).join(" ")}
                                </div>
                              </div>
                            )}
                          </div>
                          {m.description ? (
                            <p className="whitespace-pre-line" style={{ color: theme.text }}>
                              {stripHtml(m.description)}
                            </p>
                          ) : (
                            <p className="italic" style={{ color: theme.muted }}>
                              Synopsis en cours d'importation… actualisation automatique.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <NeonFooterBar />
    </main>
  );
}