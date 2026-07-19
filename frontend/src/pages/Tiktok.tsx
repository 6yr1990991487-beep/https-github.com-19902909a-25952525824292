import { useEffect, useState, useCallback, useRef } from "react";
import { PageShell } from "@/components/PageShell";
import { Music2, Heart, MessageCircle, Share2, ArrowUp, ArrowDown, ExternalLink, VolumeX, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminRemoveVideo } from "@/components/AdminRemoveVideo";
import { MangaUniverseBanner } from "@/components/MangaUniverseBanner";
import { ManualSyncButton } from "@/components/ManualSyncButton";

type TTItem = {
  id: string;
  title: string;
  series: string;
  source: "tiktok";
  videoUrl: string;
  thumb?: string | null;
};

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TIKTOK_HANDLE = "@anime.moments.officiel";

const Tiktok = () => {
  const [list, setList] = useState<TTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const v = list[idx];
  const safeIdx = list.length ? idx : 0;

  // Load TikTok videos synced from the FastAPI/MongoDB connector.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}/videos?platform=tiktok&channel_title=${encodeURIComponent(TIKTOK_HANDLE)}&strict=true&limit=80`);
        const json = await response.json();
        if (cancelled) return;
        const filtered = (json.videos || [])
          .filter((r: any) => {
            const channel = String(r.channel_title ?? "").trim().toLowerCase();
            const videoUrl = String(r.video_url ?? "").toLowerCase();
            const videoId = String(r.external_id ?? r.id ?? "").trim();
            const title = String(r.title ?? "").trim();
            return channel === TIKTOK_HANDLE.toLowerCase() && videoUrl.includes("/@anime.moments.officiel/video/") && /^\d{12,}$/.test(videoId) && title.length > 0 && !/followers|following|likes/i.test(title);
          })
          .map((r: any) => ({
            id: r.external_id ?? r.id,
            title: r.title ?? "TikTok",
            series: TIKTOK_HANDLE,
            source: "tiktok" as const,
            videoUrl: r.video_url,
            thumb: r.thumbnail_url ?? r.thumbnail,
          }));
        setList(filtered);
        setIdx(0);
      } catch {
        if (!cancelled) setList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!list.length) return;
      setIdx((i) => (i + dir + list.length) % list.length);
    },
    [list.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") go(1);
      else if (e.key === "ArrowUp") go(-1);
      else if (e.key.toLowerCase() === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Wheel + touch swipe on the player area
  const playerRef = useRef<HTMLDivElement | null>(null);
  const wheelLockRef = useRef(0);
  const touchStartRef = useRef<number | null>(null);
  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 20) return;
      const now = Date.now();
      if (now - wheelLockRef.current < 450) return;
      wheelLockRef.current = now;
      go(e.deltaY > 0 ? 1 : -1);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const start = touchStartRef.current;
      if (start == null) return;
      const end = e.changedTouches[0]?.clientY ?? start;
      const dy = start - end;
      if (Math.abs(dy) > 50) go(dy > 0 ? 1 : -1);
      touchStartRef.current = null;
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [go]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const win = window as Window & { tiktokEmbedLoad?: () => void };
    let script = document.querySelector('script[data-tiktok-embed-script="true"]') as HTMLScriptElement | null;
    const triggerEmbedRefresh = () => {
      if (typeof win.tiktokEmbedLoad === "function") {
        win.tiktokEmbedLoad();
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      script.setAttribute("data-tiktok-embed-script", "true");
      script.onload = triggerEmbedRefresh;
      document.body.appendChild(script);
    } else if (typeof win.tiktokEmbedLoad === "function") {
      triggerEmbedRefresh();
    } else {
      script.addEventListener("load", triggerEmbedRefresh, { once: true });
    }

    return () => {
      script?.removeEventListener("load", triggerEmbedRefresh);
    };
  }, []);

  const hasSyncedVideos = list.length > 0;

  return (
    <PageShell>
      <ManualSyncButton platform="tiktok" label="Sync TikTok" onDone={() => window.location.reload()} />
      <section className="container mx-auto px-4 lg:px-8 py-12 text-center" data-testid="tiktok-page-hero">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 mb-2">Feed officiel</p>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold">
          <span className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
            TikTok
          </span>
        </h1>
        <div className="mt-4">
          <a
            href="https://www.tiktok.com/@anime.moments.officiel"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: "var(--gradient-magenta)" }}
            data-testid="tiktok-official-link"
          >
            Ouvrir TikTok @anime.moments.officiel <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 pb-6" data-testid="tiktok-feed-section">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px] items-start">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white text-xs font-bold flex items-center gap-1.5">
                  <Music2 className="w-3.5 h-3.5" /> TikTok officiel
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground" data-testid="tiktok-feed-mode">
                  {hasSyncedVideos ? `Feed vidéo · ${safeIdx + 1}/${list.length}` : "Widget officiel du profil"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="px-3 py-2 rounded-full bg-secondary border border-border text-xs font-semibold hover:border-pink-500/60 transition-colors flex items-center gap-1.5"
                  data-testid="tiktok-mute-toggle"
                >
                  {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {muted ? "Son OFF" : "Son ON"}
                </button>
                <div className="inline-flex p-1 rounded-full bg-secondary border border-border">
                  <button
                    onClick={() => setOrientation("vertical")}
                    className={cn("px-3 py-1.5 text-xs rounded-full font-semibold", orientation === "vertical" ? "bg-background" : "text-muted-foreground")}
                    data-testid="tiktok-orientation-vertical"
                  >
                    ▯ Vertical
                  </button>
                  <button
                    onClick={() => setOrientation("horizontal")}
                    className={cn("px-3 py-1.5 text-xs rounded-full font-semibold", orientation === "horizontal" ? "bg-background" : "text-muted-foreground")}
                    data-testid="tiktok-orientation-horizontal"
                  >
                    ▭ Horizontal
                  </button>
                </div>
              </div>
            </div>

            {loading && (
              <div className="text-center text-sm text-muted-foreground py-10" data-testid="tiktok-loading-state">
                Chargement du feed TikTok…
              </div>
            )}

            {!loading && hasSyncedVideos && v && (
              <>
                <div className="relative flex items-center justify-center gap-4">
                  <button
                    onClick={() => go(-1)}
                    className="hidden md:flex w-12 h-12 rounded-full bg-secondary/80 border border-border hover:border-pink-500/60 items-center justify-center transition-colors"
                    aria-label="Précédent"
                    data-testid="tiktok-nav-prev"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>

                  <div
                    ref={playerRef}
                    className={cn(
                      "tilt-card neon-edge relative rounded-3xl overflow-hidden bg-black border border-pink-500/30 shadow-[0_40px_120px_-40px_hsl(var(--neon-magenta)/0.6)]",
                      orientation === "vertical" ? "aspect-[9/16] w-full max-w-sm" : "aspect-video w-full max-w-3xl"
                    )}
                    data-testid="tiktok-video-player-shell"
                  >
                    <iframe
                      key={`tt-${v.id}-${muted}`}
                      src={`https://www.tiktok.com/player/v1/${v.id}?autoplay=1&music_info=1&description=1&rel=0&loop=1&muted=${muted ? 1 : 0}`}
                      title={v.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      data-testid="tiktok-video-player"
                    />

                    <div className="absolute right-3 bottom-24 flex flex-col gap-3">
                      <button className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform" data-testid="tiktok-like-button">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform" data-testid="tiktok-comment-button">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <a
                        href={v.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform"
                        data-testid="tiktok-share-link"
                      >
                        <Share2 className="w-5 h-5" />
                      </a>
                    </div>

                    <div className="absolute left-3 right-16 bottom-3 text-white">
                      <p className="text-[10px] uppercase tracking-wider text-white/70">{v.series}</p>
                      <h3 className="text-sm font-bold leading-snug line-clamp-3 mt-0.5">{v.title}</h3>
                    </div>
                    <div className="absolute top-3 left-3 z-30">
                      <AdminRemoveVideo
                        source={v.source}
                        externalId={v.id}
                        onRemoved={() => {
                          setList((arr) => arr.filter((it, i) => i !== idx));
                          setIdx((i) => Math.max(0, i - 1));
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => go(1)}
                    className="hidden md:flex w-12 h-12 rounded-full bg-secondary/80 border border-border hover:border-pink-500/60 items-center justify-center transition-colors"
                    aria-label="Suivant"
                    data-testid="tiktok-nav-next"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>

                <div className="md:hidden mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => go(-1)}
                    className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center"
                    data-testid="tiktok-nav-prev-mobile"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => go(1)}
                    className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center"
                    data-testid="tiktok-nav-next-mobile"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Swipe haut/bas · clavier ↑/↓ · M pour son
                </p>

                <div className="mt-6" data-testid="tiktok-video-carousel">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground" data-testid="tiktok-library-count">
                      Bibliothèque · {list.length} vidéos
                    </h3>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin">
                    {list.map((it, i) => (
                      <button
                        key={`${it.source}-${it.id}-${i}`}
                        onClick={() => setIdx(i)}
                        data-testid={`tiktok-thumbnail-${i + 1}`}
                        className={cn(
                          "snap-start shrink-0 w-24 aspect-[9/16] rounded-xl overflow-hidden relative border-2 transition-all",
                          i === idx ? "border-pink-500 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                        aria-label={`Lire ${it.title}`}
                      >
                        {it.thumb ? (
                          <img src={it.thumb} alt={it.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-500/40 to-fuchsia-700/40 flex items-center justify-center">
                            <Music2 className="w-6 h-6 text-white/80" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                          <span className="text-[9px] text-white font-semibold">#{i + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center mt-4">
                  <a
                    href={v.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                    style={{ background: "var(--gradient-magenta)" }}
                    data-testid="tiktok-open-original-link"
                  >
                    Ouvrir l'original <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </>
            )}

            {!loading && !hasSyncedVideos && (
              <div className="rounded-[28px] border border-white/12 bg-white/[0.04] backdrop-blur-xl p-4 md:p-6 shadow-[0_20px_60px_-30px_hsl(var(--neon-magenta)/0.55)]" data-testid="tiktok-official-profile-widget">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-pink-300">Profil officiel intégré</p>
                    <h2 className="font-display text-2xl font-bold text-white">@anime.moments.officiel</h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    TikTok bloque temporairement la remontée automatique des vidéos dans notre environnement. Le profil officiel et son lecteur restent visibles directement ci-dessous.
                  </p>
                </div>
                <blockquote
                  className="tiktok-embed"
                  cite="https://www.tiktok.com/@anime.moments.officiel"
                  data-unique-id="anime.moments.officiel"
                  data-embed-from="oembed"
                  data-embed-type="creator"
                  style={{ maxWidth: "780px", minWidth: "288px", margin: "0 auto" }}
                >
                  <section>
                    <a target="_blank" href="https://www.tiktok.com/@anime.moments.officiel?refer=creator_embed" rel="noreferrer">
                      @anime.moments.officiel
                    </a>
                  </section>
                </blockquote>
              </div>
            )}
          </div>

          <aside className="space-y-4" data-testid="tiktok-side-panel">
            <div className="rounded-[28px] border border-white/12 bg-white/[0.04] backdrop-blur-xl p-5 shadow-[0_20px_60px_-35px_hsl(var(--neon-cyan)/0.5)]">
              <h3 className="font-display text-xl font-bold text-white mb-2">Accès direct au TikTok officiel</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ouvre la chaîne TikTok officielle pour voir toutes les vidéos, carrousels et publications en direct sur le profil source.
              </p>
              <a
                href="https://www.tiktok.com/@anime.moments.officiel"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: "var(--gradient-magenta)" }}
                data-testid="tiktok-profile-cta"
              >
                Voir le profil officiel <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-white/[0.04] backdrop-blur-xl p-5 shadow-[0_20px_60px_-35px_hsl(var(--neon-magenta)/0.45)]" data-testid="tiktok-status-card">
              <h3 className="font-display text-xl font-bold text-white mb-2">État du flux</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Source cible : <span className="text-white">@anime.moments.officiel</span></li>
                <li>• Mode actuel : <span className="text-white">{hasSyncedVideos ? "lecteur + carrousel vidéos" : "widget officiel TikTok"}</span></li>
                <li>• Mise à jour : <span className="text-white">best-effort automatique</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
      <MangaUniverseBanner />
    </PageShell>
  );
};

export default Tiktok;