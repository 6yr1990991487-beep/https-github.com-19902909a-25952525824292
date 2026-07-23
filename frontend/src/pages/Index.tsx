import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Play, ShoppingBag, Youtube, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/PageShell";
import MiniCatalogOrb from "@/components/MiniCatalogOrb";
import AnimeMomentsPresentation from "@/components/AnimeMomentsPresentation";
import crystalCity from "@/assets/crystal-city.jpg.asset.json";

const ANIME_MOMENTS_CAPTURE_VIDEO = "https://customer-assets-39nsmqrw.emergentagent.net/job_16dccaa9-172a-47f9-83d4-c61db40f190a/artifacts/vajscga7_562-07d7-49-86fd-d037713525344-2560x1440.mp4";

import NeonFooterBar from "@/components/NeonFooterBar";
import MangaNeonBar from "@/components/MangaNeonBar";
import TabletTrailerPlayer from "@/components/TabletTrailerPlayer";

import { Button } from "@/components/ui/button";
import { SHOP_PRODUCTS, categoryLabel } from "@/data/shopProducts";
import { ProductArtwork } from "@/components/ProductArtwork";
import { MiniPreviewPlayer } from "@/components/MiniPreviewPlayer";
import { supabase } from "@/integrations/supabase/client";

const SHOP_REEL_MP4 =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

/** Fisher–Yates shuffle (non-mutating) so trailers play in a non-repeating order. */
const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Live video/poster preview shown inside the two anime home cards. */
const AnimePreview = ({
  trailerIds,
  posters,
  accent,
}: {
  trailerIds: string[];
  posters: string[];
  accent: "magenta" | "cyan";
}) => {
  const [idx, setIdx] = useState(0);
  const [queue, setQueue] = useState<string[]>(() => shuffle(trailerIds));
  const [tIdx, setTIdx] = useState(0);
  useEffect(() => {
    setQueue(shuffle(trailerIds));
    setTIdx(0);
  }, [trailerIds.join("|")]);
  useEffect(() => {
    if (trailerIds.length > 0 || posters.length === 0) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % posters.length), 1800);
    return () => clearInterval(id);
  }, [trailerIds.length, posters.length]);
  useEffect(() => {
    if (queue.length < 2) return;
    const id = setInterval(() => {
      setTIdx((i) => {
        const next = i + 1;
        if (next >= queue.length) {
          let reshuffled = shuffle(queue);
          if (reshuffled[0] === queue[queue.length - 1] && reshuffled.length > 1) {
            [reshuffled[0], reshuffled[1]] = [reshuffled[1], reshuffled[0]];
          }
          setQueue(reshuffled);
          return 0;
        }
        return next;
      });
    }, 14000);
    return () => clearInterval(id);
  }, [queue]);
  const trailerId = queue[tIdx];
  const glow =
    accent === "magenta"
      ? "shadow-[0_0_30px_-5px_hsl(var(--neon-magenta)/0.7)]"
      : "shadow-[0_0_30px_-5px_hsl(var(--neon-cyan)/0.7)]";
  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-white/10 bg-black ${glow} pointer-events-none`}
      aria-hidden
    >
      {trailerId ? (
        <iframe
          key={trailerId}
          className="absolute inset-0 w-full h-full pointer-events-none"
          src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerId}&modestbranding=1&playsinline=1&rel=0`}
          title="Aperçu animé"
          loading="lazy"
          tabIndex={-1}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : posters.length > 0 ? (
        <img
          src={posters[idx]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-white/5" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-black/60 text-white/90 backdrop-blur">
        Live preview
      </span>
    </div>
  );
};

const tags = ["Lovanet", "Manga animé", "YouTube", "TikTok", "Shop", "3D", "Live", "Selection"];
const reactions = [
  { emoji: "🔥", label: "Hot" },
  { emoji: "😂", label: "Fun" },
  { emoji: "😍", label: "Love" },
  { emoji: "⚡", label: "Hype" },
  { emoji: "👀", label: "Watch" },
];

const Index = () => {
  const [ytIds, setYtIds] = useState<string[]>([]);
  const [animeTrailers, setAnimeTrailers] = useState<{ countdown: string[]; catalog: string[] }>({
    countdown: [],
    catalog: [],
  });
  const [animePosters, setAnimePosters] = useState<{ countdown: string[]; catalog: string[] }>({
    countdown: [],
    catalog: [],
  });

  useEffect(() => {
    let cancelled = false;
    try {
      const cached = localStorage.getItem("lovanet.cache.ytIds");
      if (cached) setYtIds(JSON.parse(cached));
    } catch {
      // ignore cache read failure
    }
    (async () => {
      const { data } = await supabase
        .from("imported_videos")
        .select("external_id, title, published_at")
        .eq("source", "youtube")
        .not("title", "ilike", "%ruri%")
        .order("published_at", { ascending: false })
        .limit(24);
      if (cancelled || !data) return;
      const ids = data.map((r: any) => r.external_id).filter(Boolean);
      setYtIds(ids);
      try { localStorage.setItem("lovanet.cache.ytIds", JSON.stringify(ids)); } catch {
        // ignore cache write failure
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    try {
      const t = localStorage.getItem("lovanet.cache.animeTrailers");
      const p = localStorage.getItem("lovanet.cache.animePosters");
      if (t) setAnimeTrailers(JSON.parse(t));
      if (p) setAnimePosters(JSON.parse(p));
    } catch {
      // ignore cache read failure
    }
    (async () => {
      try {
        const q = `query {
          trending: Page(page: 1, perPage: 50) {
            media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
              coverImage { large }
              trailer { id site }
            }
          }
          upcoming: Page(page: 1, perPage: 50) {
            media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC, isAdult: false) {
              coverImage { large }
              trailer { id site }
            }
          }
        }`;
        const res = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const j = await res.json();
        if (cancelled) return;
        const trending = j?.data?.trending?.media ?? [];
        const upcoming = j?.data?.upcoming?.media ?? [];
        const pickTrailers = (arr: any[]) =>
          Array.from(
            new Set(
              arr
                .filter((m) => m?.trailer?.site === "youtube" && m?.trailer?.id)
                .map((m) => m.trailer.id as string),
            ),
          ).slice(0, 30);
        const nextTrailers = {
          catalog: pickTrailers(trending),
          countdown: pickTrailers(upcoming),
        };
        const nextPosters = {
          catalog: trending.map((m: any) => m?.coverImage?.large).filter(Boolean).slice(0, 30),
          countdown: upcoming.map((m: any) => m?.coverImage?.large).filter(Boolean).slice(0, 30),
        };
        setAnimeTrailers(nextTrailers);
        setAnimePosters(nextPosters);
        try {
          localStorage.setItem("lovanet.cache.animeTrailers", JSON.stringify(nextTrailers));
          localStorage.setItem("lovanet.cache.animePosters", JSON.stringify(nextPosters));
        } catch {
          // ignore cache write failure
        }
      } catch (e) {
        console.error("AniList trailer fetch", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const ytForYoutube = ytIds.slice(0, 6);
  const ytForPrime = ytIds.slice(6, 12).length ? ytIds.slice(6, 12) : ytIds.slice(0, 6);

  const platforms = [
    { to: "/chaine-youtube", title: "YouTube", desc: "Vidéos anime et shorts officiels", icon: Youtube,
      preview: { kind: "youtube" as const, sources: ytForYoutube } },
    { to: "/prime-video", title: "Prime Vidéo", desc: "Lecture multi-plateforme immersive", icon: Play,
      preview: { kind: "youtube" as const, sources: ytForPrime } },
    { to: "/tiktok", title: "TikTok", desc: "Posts courts et réactions rapides", icon: Music2,
      preview: { kind: "tiktok" as const, sources: [], loadTiktokFromDB: true } },
    { to: "/shop", title: "Shop", desc: "Drops manga liés aux contenus", icon: ShoppingBag,
      preview: { kind: "mp4" as const, sources: [SHOP_REEL_MP4] } },
  ];

  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: "linear-gradient(135deg, hsl(220 30% 8% / 0.55) 0%, hsl(220 25% 12% / 0.65) 50%, hsl(220 30% 8% / 0.55) 100%)",
            backdropFilter: "blur(20px) saturate(1.1)",
            WebkitBackdropFilter: "blur(20px) saturate(1.1)",
          }}
        />
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-[0.05] animate-blob animation-delay-4000"
            style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan)), transparent 70%)" }} />
        </div>
        <div className="absolute inset-0 -z-10 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="sparkle absolute w-1 h-1 rounded-full bg-white/40"
              style={{
                left: `${10 + i * 15}%`,
                bottom: "10%",
                animationDelay: `${i * 0.9}s`,
              }}
            />
          ))}
        </div>

        <div className="relative w-full pt-6 lg:pt-8">
          <div
            className="relative w-full overflow-hidden rounded-[1.8rem] border border-white/10 bg-[rgba(4,10,20,0.88)] shadow-[0_28px_80px_-28px_rgba(0,0,0,0.7)]"
            data-testid="anime-moments-capture-banner"
          >
            <div className="aspect-[21/9] w-full">
              <video
                src={ANIME_MOMENTS_CAPTURE_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
                data-testid="anime-moments-capture-video"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,24,0.05),rgba(5,10,24,0.28))]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(5,10,24,0.42))]" />
          </div>
          <TabletTrailerPlayer />
          <div className="container mx-auto px-4 lg:px-8 mt-3">
            <MangaNeonBar height={26} className="rounded-full overflow-hidden" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 pt-4 pb-2">
        <AnimeMomentsPresentation />
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="aspect-[21/9] w-full">
            <img
              src={crystalCity.url}
              alt="Crystalline skyline"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      <section className="container mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-center justify-end mb-4">
          <Link to="/shop" className="text-sm text-primary hover:underline whitespace-nowrap">Boutique →</Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {SHOP_PRODUCTS.slice(0, 24).map((p) => (
            <Link
              key={p.id}
              to="/shop"
              className="rgb-card group rounded-xl overflow-hidden bg-card border border-border transition-all hover:-translate-y-0.5"
            >
              <div className="rgb-frame aspect-square overflow-hidden">
                <div className="rgb-art w-full h-full group-hover:scale-110 transition-transform duration-700">
                  <ProductArtwork seed={p.id} category={p.category} label={p.name} />
                </div>
              </div>
              <div className="p-2">
                <div className="font-display font-bold text-[11px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {p.name}
                </div>
                <div className="rgb-price text-[11px] font-bold mt-0.5">{p.price} €</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default Index;
