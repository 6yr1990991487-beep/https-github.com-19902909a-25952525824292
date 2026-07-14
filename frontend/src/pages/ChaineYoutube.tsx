import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { videos as fallbackVideos, thumb as ytThumb } from "@/data/videos";
import { Youtube, ExternalLink, Calendar, Sparkles, Volume2, VolumeX, ArrowRight, Play } from "lucide-react";
import { HoverPreview } from "@/components/HoverPreview";
import { cn } from "@/lib/utils";
import { AdminRemoveVideo } from "@/components/AdminRemoveVideo";
import { MangaUniverseBanner } from "@/components/MangaUniverseBanner";
import { ManualSyncButton } from "@/components/ManualSyncButton";

type ImportedVideo = {
  id: string;
  source: "youtube" | "tiktok" | "prime";
  external_id: string | null;
  title: string;
  thumbnail_url: string | null;
  video_url: string;
  published_at: string | null;
  episode: string | null;
};

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const isNew = (d?: string | null) => {
  if (!d) return false;
  return Date.now() - new Date(d).getTime() < 7 * 24 * 60 * 60 * 1000;
};

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "";

const ChaineYoutube = () => {
  const [items, setItems] = useState<ImportedVideo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch(`${API}/videos?platform=youtube&limit=80`);
        const json = await response.json();
        if (!active) return;
        const rows = (json.videos ?? []).map((r: any): ImportedVideo => ({
          id: r.id ?? r.external_id,
          source: "youtube",
          external_id: r.external_id ?? r.id,
          title: r.title ?? "Anime.Moments.officiel",
          thumbnail_url: r.thumbnail_url ?? r.thumbnail,
          video_url: r.video_url ?? `/lecteurs-video?video=${r.external_id ?? r.id}`,
          published_at: r.published_at ?? null,
          episode: r.episode ?? null,
        }));
        setItems(rows);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const fallback: ImportedVideo[] = [...fallbackVideos]
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .map((v) => ({
      id: v.id,
      source: "youtube",
      external_id: v.id,
      title: v.title,
      thumbnail_url: ytThumb(v.id),
      video_url: `/lecteurs-video?video=${v.id}`,
      published_at: v.date ?? null,
      episode: v.episode ?? null,
    }));

  const list = loaded && items.length > 0 ? items : fallback;
  const playable = list.filter((v) => !!v.external_id);
  const activeVideo = playable.find((v) => v.external_id === activeId) || playable[0];
  const activeYtId = activeVideo?.external_id ?? null;
  const nextVideo = playable.length
    ? playable[(playable.findIndex((v) => v.external_id === activeYtId) + 1) % playable.length]
    : null;

  const playInline = (id: string | null) => {
    if (!id) return;
    setActiveId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageShell>
      <ManualSyncButton platform="youtube" label="Sync YouTube" onDone={() => window.location.reload()} />
    <section className="container mx-auto px-4 lg:px-8 pt-6">
      <MangaUniverseBanner
        videoIds={playable
          .map((v) => v.external_id)
          .filter((x): x is string => !!x)
          .slice(0, 12)}
      />
    </section>
    <section className="container mx-auto px-4 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
          <Youtube className="w-6 h-6" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Chaîne officielle</p>
      </div>
      <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-3">YouTube · AnimeMoments</h1>
      <p className="text-muted-foreground max-w-2xl mb-6">
        Vidéos anime, shorts officiels et moments forts diffusés directement depuis la chaîne Lovanet.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild className="rounded-full gap-2 bg-primary hover:bg-primary/90">
          <a href="https://www.youtube.com/@animemomentsanimeofficiel" target="_blank" rel="noopener noreferrer">
            Ouvrir YouTube <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
        <Button asChild variant="outline" className="rounded-full gap-2 border-red-500/60 text-red-400 hover:bg-red-500/10">
          <a href="/chaine-youtube/manga">
            Univers Manga & Anime →
          </a>
        </Button>
        <div className="inline-flex p-1 rounded-full bg-secondary border border-border">
          <button
            onClick={() => setOrientation("horizontal")}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full font-semibold transition-colors",
              orientation === "horizontal" ? "bg-background text-foreground" : "text-muted-foreground"
            )}
          >
            ▭ Horizontal
          </button>
          <button
            onClick={() => setOrientation("vertical")}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full font-semibold transition-colors",
              orientation === "vertical" ? "bg-background text-foreground" : "text-muted-foreground"
            )}
          >
            ▯ Vertical
          </button>
        </div>
      </div>
    </section>

      {activeYtId && (
        <section className="container mx-auto px-4 lg:px-8 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                <Youtube className="w-4 h-4 text-white" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Lecteur intégré · YouTube
                </div>
                <div className="text-sm font-semibold truncate max-w-[60vw]">{activeVideo?.title}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted((m) => !m)}
                className="px-3 py-2 rounded-full bg-secondary border border-border text-xs font-semibold hover:border-primary/60 transition-colors flex items-center gap-1.5"
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {muted ? "Activer son" : "Muet"}
              </button>
              {nextVideo && (
                <button
                  onClick={() => playInline(nextVideo.external_id)}
                  className="px-3 py-2 rounded-full bg-secondary border border-border text-xs font-semibold hover:border-primary/60 transition-colors flex items-center gap-1.5"
                >
                  Suivant <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <Link
                to={`/lecteurs-video?video=${activeYtId}`}
                className="px-3 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-1.5"
                style={{ background: "var(--gradient-magenta)" }}
              >
                Plein écran <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div
            className={cn(
              "mx-auto rgb-frame rounded-3xl overflow-hidden bg-black border border-border shadow-[0_40px_120px_-40px_hsl(var(--neon-magenta)/0.4)] transition-all",
              orientation === "horizontal" ? "aspect-video w-full" : "aspect-[9/16] max-w-md"
            )}
          >
            <iframe
              key={`${activeYtId}-${muted}`}
              src={`https://www.youtube.com/embed/${activeYtId}?autoplay=1&rel=0&mute=${muted ? 1 : 0}`}
              title={activeVideo?.title || "YouTube"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 lg:px-8 pb-16 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {list.map((v) => {
          const cover = v.thumbnail_url || (v.external_id ? ytThumb(v.external_id) : "");
          const fresh = isNew(v.published_at);
          const previewId = v.external_id || v.id;
          const isActive = !!v.external_id && v.external_id === activeYtId;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => playInline(v.external_id)}
              className={cn(
                "rgb-card group text-left rounded-2xl overflow-hidden bg-card border border-border transition-all",
                isActive && "ring-2 ring-primary"
              )}
            >
              <HoverPreview
                videoId={previewId}
                title={v.title}
                thumbnail={cover}
                vertical={orientation === "vertical"}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 z-20">
                  <AdminRemoveVideo
                    rowId={v.id}
                    source="youtube"
                    externalId={v.external_id}
                    onRemoved={() => setItems((arr) => arr.filter((x) => x.id !== v.id))}
                  />
                </span>
                <span className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 ml-0.5" />
                  </span>
                </span>
                {fresh && (
                  <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    <Sparkles className="w-3 h-3" /> Nouveau
                  </span>
                )}
                {v.episode && (
                  <span className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur text-foreground text-[11px] font-semibold">
                    {v.episode}
                  </span>
                )}
              </HoverPreview>
              <div className="p-4">
                <h3 title={v.title} className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors min-h-[2.5rem]">
                  {v.title}
                </h3>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  {v.published_at ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {fmt(v.published_at)}
                    </span>
                  ) : <span />}
                  <Link
                    to={`/lecteurs-video?video=${v.external_id || v.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Plein écran <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </button>
          );
        })}
      </section>
    </PageShell>
  );
};

export default ChaineYoutube;