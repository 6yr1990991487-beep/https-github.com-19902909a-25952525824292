import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ProductArtwork } from "@/components/ProductArtwork";
import type { ShopProduct } from "@/data/shopProducts";
import { BANNER_VIDEO_SLIDES } from "@/data/shopBanners";
import { getUploadedBanners } from "@/lib/bannerStore";
import { ShoppingCart, Play, Sparkles, Volume2, VolumeX } from "lucide-react";

type VideoSlideData = { src: string; poster?: string; title: string; subtitle: string; badge?: string };

type Slide =
  | { kind: "product"; product: ShopProduct }
  | { kind: "video"; src: string; poster?: string; title: string; subtitle: string; badge?: string };

export const ShopHeroBanner = ({
  products,
  onOpen,
  onOpenCart,
  cartCount,
}: {
  products: ShopProduct[];
  videoIds?: string[];
  onOpen: (p: ShopProduct) => void;
  onOpenCart: () => void;
  cartCount: number;
}) => {
  const [uploaded, setUploaded] = useState<VideoSlideData[]>([]);

  const loadUploaded = useCallback(async () => {
    const items = await getUploadedBanners();
    setUploaded(
      items.map((i) => ({ src: i.url, title: i.title, subtitle: i.subtitle, badge: i.badge }))
    );
  }, []);

  useEffect(() => {
    loadUploaded();
  }, [loadUploaded]);

  const videoSlides: VideoSlideData[] = [...BANNER_VIDEO_SLIDES, ...uploaded];

  const slides: Slide[] = [
    ...products.slice(0, 3).map<Slide>((p) => ({ kind: "product", product: p })),
    ...videoSlides.map<Slide>((v) => ({
      kind: "video",
      src: v.src,
      poster: v.poster,
      title: v.title,
      subtitle: v.subtitle,
      badge: v.badge,
    })),
    ...products.slice(3, 5).map<Slide>((p) => ({ kind: "product", product: p })),
  ];

  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const paused = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      if (!paused.current) setIdx((i) => (i + 1) % slides.length);
    }, 4200);
    return () => window.clearInterval(t);
  }, [slides.length]);

  return (
    <section
      className="container mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-8"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {/* Premium heading */}
      <header className="mb-4 sm:mb-6 text-center sm:text-left">
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-primary">
          <Sparkles className="w-3 h-3" /> Magasin officielle Lovanet
        </span>
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold mt-2 gradient-text leading-[1.05]">
          Magasin
        </h1>
      </header>
    </section>
  );
};

export default ShopHeroBanner;