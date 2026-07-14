import { Link, useSearchParams } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { videos as rawVideos, thumb } from "@/data/videos";
import { useState, useEffect, useMemo } from "react";
import { Volume2, VolumeX, ExternalLink, ArrowRight, Youtube, Play, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverPreview } from "@/components/HoverPreview";
import { MangaUniverseBanner } from "@/components/MangaUniverseBanner";
import { supabase } from "@/integrations/supabase/client";

type Service = "youtube" | "prime" | "tiktok";

type Item = {
  id: string;
  title: string;
  series?: string;
  episode?: string;
  thumbnail: string;
  source: "youtube" | "tiktok";
  videoUrl: string;
};

const SERVICES: { id: Service; label: string; icon: any; tint: string }[] = [
  { id: "youtube", label: "YouTube", icon: Youtube, tint: "from-rose-500 to-red-600" },
  { id: "prime", label: "Prime", icon: Play, tint: "from-sky-500 to-blue-600" },
  { id: "tiktok", label: "TikTok", icon: Music2, tint: "from-pink-500 to-fuchsia-600" },
];

const LecteursVideo = () => {
  const [params, setParams] = useSearchParams();
  const fallbackYoutube = useMemo<Item[]>(
    () =>
      [...rawVideos]
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
        .map((v) => ({
          id: v.id,
          title: v.title,
          series: v.series,
          episode: v.episode,
          thumbnail: thumb(v.id),
          source: "youtube" as const,
          videoUrl: `https://www.youtube.com/watch?v=${v.id}`,
        })),
    [],
  );
  const [youtubeList, setYoutubeList] = useState<Item[]>(fallbackYoutube);
  const [tiktokList, setTiktokList] = useState<Item[]>([]);
  const [service, setService] = useState<Service>((params.get("service") as Service) || "youtube");
  const [active, setActive] = useState<string>(params.get("video") || fallbackYoutube[0]?.id || "");
  const [muted, setMuted] = useState(true);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");

  // Load YouTube + TikTok libraries from DB
  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: yt }, { data: tt }] = await Promise.all([
        supabase
          .from("imported_videos")
          .select("external_id, title, thumbnail_url, video_url, published_at, episode")
          .eq("source", "youtube")
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(500),
        supabase
          .from("imported_videos")
          .select("external_id, title, thumbnail_url, video_url, published_at")
          .eq("source", "tiktok")
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(500),
      ]);
      if (!alive) return;
      if (yt?.length) {
        setYoutubeList(
          yt
            .filter((r: any) => r.external_id)
            .map((r: any): Item => ({
              id: r.external_id,
              title: r.title ?? "YouTube",
              episode: r.episode ?? undefined,
              thumbnail: r.thumbnail_url || thumb(r.external_id),
              source: "youtube",
              videoUrl: r.video_url || `https://www.youtube.com/watch?v=${r.external_id}`,
            })),
        );
      }
      if (tt?.length) {
        setTiktokList(
          tt
            .filter((r: any) => r.external_id)
            .map((r: any): Item => ({
              id: r.external_id,
              title: r.title ?? "TikTok",
              series: "@anime.moments.officiel",
              thumbnail: r.thumbnail_url ?? "",
              source: "tiktok",
              videoUrl: r.video_url,
            })),
        );
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const currentList: Item[] =
    service === "tiktok" ? tiktokList : youtubeList;

  useEffect(() => {
    const v = params.get("video");
    if (v && v !== active) setActive(v);
  }, [params, active]);

  // Ensure active id belongs to current service list; otherwise pick first.
  useEffect(() => {
    if (!currentList.length) return;
    if (!currentList.some((v) => v.id === active)) {
      setActive(currentList[0].id);
    }
  }, [service, currentList, active]);

  const activeVideo = currentList.find((v) => v.id === active) || currentList[0];
  const idx = activeVideo ? currentList.findIndex((v) => v.id === activeVideo.id) : 0;
  const next = currentList.length ? currentList[(idx + 1) % currentList.length] : null;

  const select = (id: string) => {
    setActive(id);
    setParams({ video: id, service });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isVertical = orientation === "vertical" || service === "tiktok";
  const activeService = SERVICES.find((x) => x.id === service)!;

  return (
    <PageShell>
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Lecteurs vidéo</p>

        {/* Service tabs */}
        <div className="inline-flex mt-6 p-1 rounded-full bg-secondary border border-border">
          {SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setService(s.id);
                setParams({ service: s.id });
              }}
              className={cn(
                "px-5 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-2",
                service === s.id
                  ? `bg-gradient-to-r ${s.tint} text-white shadow-md`
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <s.icon className="w-4 h-4" /> {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 pb-6">
        {!activeVideo && (
          <div className="text-center text-sm text-muted-foreground py-16">
            {service === "tiktok" ? "Chargement du feed TikTok…" : "Chargement des vidéos…"}
          </div>
        )}
        {activeVideo && (<>
        {/* Player header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center", activeService.tint)}>
              <activeService.icon className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {activeService.label} · Lecteur officiel · {idx + 1}/{currentList.length}
              </div>
              <div className="text-sm font-semibold">
                {service === "tiktok" ? "@anime.moments.officiel" : "@animemomentsAnimeofficiel"}
              </div>
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
        </div>

        {/* Player */}
        <div
          className={cn(
            "mx-auto rounded-3xl overflow-hidden bg-black border border-border shadow-[0_40px_120px_-40px_hsl(var(--neon-magenta)/0.4)] transition-all",
            isVertical ? "aspect-[9/16] max-w-md" : "aspect-video w-full"
          )}
        >
          {activeVideo.source === "tiktok" ? (
            <iframe
              key={`tt-${activeVideo.id}-${muted}`}
              src={`https://www.tiktok.com/player/v1/${activeVideo.id}?autoplay=1&loop=1&rel=0&description=0&music_info=1&muted=${muted ? 1 : 0}`}
              title={activeVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <iframe
              key={`${activeVideo.id}-${muted}`}
              src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&mute=${muted ? 1 : 0}`}
              title={activeVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          {next && (
            <button
              onClick={() => select(next.id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary border border-border hover:border-primary/60 text-sm font-semibold transition-colors"
            >
              Suivant <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <a
            href={activeVideo.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: "var(--gradient-magenta)" }}
          >
            Ouvrir sur {activeService.label} <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="mt-6 text-center">
          <h2 className="font-display text-2xl font-bold">{activeVideo.title}</h2>
          {(activeVideo.series || activeVideo.episode) && (
            <p className="text-sm text-muted-foreground mt-1">
              {activeVideo.series} {activeVideo.episode && `· ${activeVideo.episode}`}
            </p>
          )}
        </div>
        </>)}
      </section>

      <section className="container mx-auto px-4 lg:px-8 pb-16">
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
          Sélection <span className="text-muted-foreground font-normal text-lg">· {currentList.length}</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentList
            .filter((v) => !activeVideo || v.id !== activeVideo.id)
            .map((v) => (
              <button
                key={v.id}
                onClick={() => select(v.id)}
                className="rgb-card group text-left rounded-2xl overflow-hidden bg-card border border-border transition-all"
              >
                {v.source === "youtube" ? (
                  <HoverPreview
                    videoId={v.id}
                    title={v.title}
                    thumbnail={v.thumbnail || thumb(v.id)}
                    vertical={isVertical}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent pointer-events-none" />
                    <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white">
                      YouTube
                    </span>
                  </HoverPreview>
                ) : (
                  <div className="relative aspect-[9/16] bg-black overflow-hidden">
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt={v.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500/40 to-fuchsia-700/40 flex items-center justify-center">
                        <Music2 className="w-8 h-8 text-white/80" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent pointer-events-none" />
                    <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white">
                      TikTok
                    </span>
                  </div>
                )}
                <div className="p-3">
                  <div className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {v.title}
                  </div>
                  {(v.series || v.episode) && (
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {v.series} {v.episode && `· ${v.episode}`}
                    </div>
                  )}
                </div>
              </button>
            ))}
        </div>
      </section>
      <MangaUniverseBanner />
    </PageShell>
  );
};

export default LecteursVideo;