import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductArtwork } from "@/components/ProductArtwork";
import type { ShopProduct } from "@/data/shopProducts";
import { thumb } from "@/data/videos";
import { ShoppingCart, Play, Sparkles, Truck, ShieldCheck, Star } from "lucide-react";
import { createImageFallbackHandler, siteFallbackImage } from "@/lib/mediaFallback";

type Slide =
  | { kind: "product"; product: ShopProduct }
  | { kind: "video"; videoId: string; title: string; subtitle: string };

export const ShopHeroBanner = ({
  products,
  videoIds,
  onOpen,
  onOpenCart,
  cartCount,
}: {
  products: ShopProduct[];
  videoIds: string[];
  onOpen: (p: ShopProduct) => void;
  onOpenCart: () => void;
  cartCount: number;
}) => {
  const slides: Slide[] = [
    ...products.slice(0, 3).map<Slide>((p) => ({ kind: "product", product: p })),
    ...videoIds.slice(0, 2).map<Slide>((v, i) => ({
      kind: "video",
      videoId: v,
      title: i === 0 ? "Anime Moments · Drop TikTok viral" : "Édition YouTube Officielle",
      subtitle: i === 0 ? "Séries inspirées des edits TikTok — livraison sous 3–7j" : "Merch officiel de la chaîne · éditions numérotées",
    })),
    ...products.slice(3, 5).map<Slide>((p) => ({ kind: "product", product: p })),
  ];

  const [idx, setIdx] = useState(0);
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
          <Sparkles className="w-3 h-3" /> Boutique officielle Lovanet
        </span>
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold mt-2 gradient-text leading-[1.05]">
          Boutique
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-2xl mx-auto sm:mx-0">
          Anime.Moments.officiel &amp; AnimemomentsAnimeofficiel — collectors, posters, vêtements, sneakers, manga, musique &amp; numériques.
        </p>
      </header>

      <div className="rgb-neon relative rounded-2xl sm:rounded-3xl overflow-hidden bg-card min-h-[280px] sm:min-h-[420px] shadow-[0_20px_80px_-30px_hsl(var(--neon-magenta)/0.55)]">
        {/* premium ambient decor */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[hsl(var(--neon-magenta)/0.35)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[hsl(var(--neon-cyan)/0.3)] blur-3xl" />
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-hidden={i !== idx}
          >
            {s.kind === "video" ? (
              <>
                <img
                  src={`https://i.ytimg.com/vi/${s.videoId}/maxresdefault.jpg`}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const step = img.dataset.fallback || "0";
                    if (step === "0") {
                      img.dataset.fallback = "1";
                      img.src = thumb(s.videoId);
                    } else {
                      img.dataset.fallback = "2";
                      createImageFallbackHandler(`shop-hero-${s.videoId}`, null)(e as any);
                    }
                  }}
                  alt={s.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
                <div className="relative z-10 p-4 sm:p-8 lg:p-10 flex flex-col justify-end h-full max-w-xl">
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
                    <Play className="w-3.5 h-3.5" /> Vidéo · Anime Moments
                  </span>
                  <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 gradient-text leading-tight">{s.title}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{s.subtitle}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button className="rounded-full btn-interactive" onClick={onOpenCart}>
                      <ShoppingCart className="w-4 h-4 mr-2" /> Panier ({cartCount})
                    </Button>
                    <a
                      href={`https://www.youtube.com/watch?v=${s.videoId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-primary/60 text-primary px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2" /> Voir la vidéo
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0">
                  <ProductArtwork seed={s.product.id} category={s.product.category} label={s.product.name} className="w-full h-full block scale-110 blur-[2px] opacity-90" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/50 to-transparent" />
                <div className="relative z-10 grid sm:grid-cols-[1fr,auto] items-center gap-4 sm:gap-6 p-4 sm:p-8 lg:p-10 h-full">
                  <div className="max-w-xl">
                    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
                      <Sparkles className="w-3.5 h-3.5" /> Nouveauté · {s.product.tag}
                    </span>
                    <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-extrabold mb-2 leading-tight line-clamp-2">{s.product.name}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">{s.product.description}</p>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-display text-xl sm:text-3xl font-extrabold gradient-text">{s.product.price} €</span>
                      {s.product.compareAt && s.product.compareAt > s.product.price && (
                        <>
                          <span className="text-muted-foreground line-through text-sm">{s.product.compareAt} €</span>
                          <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40">
                            -{Math.round((1 - s.product.price / s.product.compareAt) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button className="rounded-full btn-interactive" onClick={() => onOpen(s.product)}>
                        Voir le produit
                      </Button>
                      <Button variant="outline" className="rounded-full" onClick={onOpenCart}>
                        <ShoppingCart className="w-4 h-4 mr-2" /> Panier ({cartCount})
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:block relative w-56 h-56 lg:w-72 lg:h-72 shrink-0">
                    <div className="absolute inset-0 rounded-2xl overflow-hidden border border-primary/40 shadow-[0_20px_60px_-20px_hsl(var(--neon-magenta)/0.6)] rotate-3 hover:rotate-0 transition-transform duration-500">
                      <ProductArtwork seed={s.product.id} category={s.product.category} label={s.product.name} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {/* dots */}
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 sm:w-8 bg-primary" : "w-2.5 sm:w-3 bg-white/40"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* trust ticker */}
      <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Truck className="w-4 h-4 text-primary" /> Livraison suivie 3–7j</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-primary" /> Paiement sécurisé</span>
        <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 text-primary" /> 4,8/5 · +12 000 clients</span>
        <span className="inline-flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary" /> Retours 14 jours</span>
      </div>
    </section>
  );
};

export default ShopHeroBanner;