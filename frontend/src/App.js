import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import "@/App.css";
import { countdownSeed, languages, navRoutes, productsSeed, routeAliases, siteMeta, videosSeed } from "@/lovanetData";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categoryLabels = {
  all: "Tout",
  poster: "Affiches",
  collector: "Collectors",
  apparel: "Vêtements",
  sneakers: "Sneakers",
  music: "Musique",
  manga: "Manga & BD",
  daily: "Quotidien",
};

const platformLabels = {
  youtube: "YouTube",
  tiktok: "TikTok",
  prime: "Prime Video",
  all: "Toutes plateformes",
};

const CartContext = createContext(null);

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatPrice(price) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(price);
}

function useApiResource(path, fallback) {
  const fallbackRef = useRef(fallback);

  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);


  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    axios
      .get(`${API}${path}`)
      .then((response) => {
        if (!alive) return;
        setData(response.data);
      })
      .catch((err) => {
        if (!alive) return;
        console.warn(`API fallback for ${path}`, err);
        setError("Source API indisponible, affichage depuis les assets reconstruits.");
        setData(fallbackRef.current);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [path]);

  return { data, loading, error };
}

function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = window.localStorage.getItem("lovanet:cart:v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem("lovanet:cart:v1", JSON.stringify(items));
    } catch {
      // localStorage may be unavailable in restricted browsing modes.
    }
  }, [items]);

  const add = useCallback((product, qty = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, qty: item.qty + qty } : item));
      }
      return [...current, { ...product, qty }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const setQty = useCallback((id, qty) => setItems((current) => current.map((item) => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item))), []);
  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const value = useMemo(() => ({ items, add, remove, setQty, clear, count, total, open, setOpen }), [items, add, remove, setQty, clear, count, total, open]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useCart() {
  return useContext(CartContext);
}

function BackgroundFX() {
  return (
    <div className="background-fx" aria-hidden="true">
      <span className="orb orb-one" />
      <span className="orb orb-two" />
      <span className="orb orb-three" />
      <span className="grid-noise" />
      {Array.from({ length: 12 }).map((_, index) => (
        <span key={index} className={`floating-bubble bubble-${index + 1}`} />
      ))}
    </div>
  );
}

function Header() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, setOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header" data-testid="site-header">
      <div className="header-inner">
        <div className="brand-cluster">
          <Link to="/" className="brand-link" data-testid="header-logo-link" aria-label="Lovanet — Accueil">
            <img src={siteMeta.logo} alt="Lovanet" className="brand-logo" />
            <span className="brand-word">Lovanet</span>
          </Link>
          <button className={cn("mega-trigger", megaOpen && "active")} data-testid="mega-menu-button" type="button" aria-expanded={megaOpen} onClick={() => setMegaOpen(true)} onMouseEnter={() => setMegaOpen(true)}>
            ✦
          </button>
        </div>

        <nav className="desktop-nav" aria-label="Navigation principale">
          {navRoutes.slice(0, 9).map((route) => (
            <NavLink key={route.to} to={route.to} end={route.to === "/"} data-testid={`nav-link-${route.label.toLowerCase().replaceAll(" ", "-")}`} className={({ isActive }) => cn("nav-pill", isActive && "active")}>
              {route.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/shop" className="primary-chip" data-testid="header-shop-cta">Boutique</Link>
          <button className="cart-button" data-testid="cart-drawer-open-button" type="button" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier (${count})`}>
            <span>Panier</span>
            <strong>{count}</strong>
          </button>
          <button className="mobile-trigger" data-testid="mobile-menu-button" type="button" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen}>☰</button>
        </div>
      </div>

      {megaOpen && (
        <div className="mega-panel" data-testid="mega-menu-panel" onMouseLeave={() => setMegaOpen(false)}>
          <div className="mega-copy">
            <span className="eyebrow">Anime · AnimeMoments · Manga</span>
            <h2>Plateforme officielle Lovanet</h2>
            <p>Vidéos, boutique, catalogue 1500+ animés et univers néon reconstruit depuis le site live et la sauvegarde.</p>
          </div>
          <div className="mega-grid">
            {navRoutes.map((route) => (
              <Link key={route.to} to={route.to} className="mega-card" data-testid={`mega-link-${route.to.replaceAll("/", "") || "home"}`}>
                <strong>{route.label}</strong>
                <span>{route.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {mobileOpen && (
        <nav className="mobile-panel" data-testid="mobile-menu-panel" aria-label="Navigation mobile">
          {navRoutes.map((route) => (
            <Link key={route.to} to={route.to} className="mobile-link" data-testid={`mobile-link-${route.to.replaceAll("/", "") || "home"}`}>{route.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function CartDrawer() {
  const { items, open, setOpen, remove, setQty, total, clear } = useCart();
  const [form, setForm] = useState({ name: "", email: "", note: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setStatus("");
    try {
      const payload = { ...form, items: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })) };
      const response = await axios.post(`${API}/orders`, payload);
      setStatus(response.data.message || "Commande enregistrée.");
      clear();
      setForm({ name: "", email: "", note: "" });
    } catch (error) {
      setStatus(error.response?.data?.detail || "Impossible d’enregistrer la commande pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="drawer-backdrop" data-testid="cart-drawer-backdrop" role="presentation">
      <aside className="cart-drawer" data-testid="cart-drawer" aria-label="Panier Lovanet">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Boutique Lovanet</span>
            <h2>Panier</h2>
          </div>
          <button className="icon-button" data-testid="cart-drawer-close-button" type="button" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="cart-lines">
          {items.length === 0 ? (
            <div className="empty-state">Votre panier est vide. Explorez les affiches, collectors et drops manga.</div>
          ) : (
            items.map((item) => (
              <div className="cart-line" key={item.id} data-testid={`cart-line-${item.id}`}>
                <img src={item.image} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <span>{formatPrice(item.price)}</span>
                  <div className="qty-row">
                    <button type="button" data-testid={`cart-decrement-${item.id}`} onClick={() => setQty(item.id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button type="button" data-testid={`cart-increment-${item.id}`} onClick={() => setQty(item.id, item.qty + 1)}>+</button>
                    <button type="button" data-testid={`cart-remove-${item.id}`} onClick={() => remove(item.id)}>Retirer</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
        <form className="checkout-form" data-testid="checkout-form" onSubmit={submitOrder}>
          <input data-testid="checkout-name-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom" required />
          <input data-testid="checkout-email-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email" required />
          <textarea data-testid="checkout-note-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note de commande" />
          <button className="primary-button full" data-testid="checkout-submit-button" disabled={loading || !items.length} type="submit">{loading ? "Enregistrement…" : "Valider la demande"}</button>
        </form>
        {status && <p className="form-status" data-testid="checkout-status-message">{status}</p>}
      </aside>
    </div>
  );
}

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="section-title">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

function ProductCard({ product, compact = false }) {
  const { add } = useCart();
  return (
    <article className={cn("product-card", compact && "compact")} data-testid={`product-card-${product.id}`}>
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-tag">{product.tag}</span>
      </div>
      <div className="product-body">
        <span className="source-chip">{product.source}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-footer">
          <strong>{formatPrice(product.price)}</strong>
          <button className="small-button" data-testid={`add-to-cart-${product.id}`} type="button" onClick={() => add(product)}>Ajouter</button>
        </div>
      </div>
    </article>
  );
}

function VideoCard({ video, onPlay }) {
  return (
    <article className="video-card" data-testid={`video-card-${video.id}`}>
      <button type="button" className="video-thumb" data-testid={`video-play-${video.id}`} onClick={() => onPlay(video)}>
        <img src={video.thumbnail} alt={video.title} loading="lazy" />
        <span className="play-badge">▶</span>
      </button>
      <div className="video-info">
        <span className={`platform-badge ${video.platform}`}>{platformLabels[video.platform]}</span>
        <h3>{video.title}</h3>
        <p>{video.description}</p>
      </div>
    </article>
  );
}

function VideoModal({ video, onClose }) {
  if (!video) return null;
  const embedId = video.id || video.trailerId;
  return (
    <div className="modal-backdrop" data-testid="video-modal" role="dialog" aria-modal="true">
      <div className="video-modal-panel">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Lecture immersive</span>
            <h2>{video.title}</h2>
          </div>
          <button className="icon-button" data-testid="video-modal-close" type="button" onClick={onClose}>×</button>
        </div>
        <div className="iframe-shell">
          <iframe title={video.title} src={`https://www.youtube-nocookie.com/embed/${embedId}?autoplay=1&rel=0&modestbranding=1`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero-section" data-testid="home-hero">
      <div className="hero-copy">
        <span className="eyebrow">Anime.Moments.officiel · Lovanet</span>
        <h1>Anime, AnimeMoments, Animer officiel : la plateforme manga néon.</h1>
        <p>Vidéos YouTube, shorts TikTok, Prime Video, catalogue de 1500+ animés et boutique manga reconstruits avec les assets du site Lovanet.fr.</p>
        <div className="hero-actions">
          <Link className="primary-button" data-testid="home-hero-primary-cta" to="/shop">Entrer dans la boutique</Link>
          <Link className="secondary-button" data-testid="home-hero-secondary-cta" to="/lecteurs-video">Regarder les vidéos</Link>
        </div>
      </div>
      <div className="hero-visual" data-testid="home-hero-visual">
        <div className="tablet-frame">
          <img src="/assets/manga-banner-CxOqMKFj.jpg" alt="Bannière manga Lovanet" />
          <div className="tablet-overlay">
            <span>Live Universe</span>
            <strong>Catalogue + Shop + Vidéos</strong>
          </div>
        </div>
        <div className="floating-card one"><strong>1500+</strong><span>animés catalogue</span></div>
        <div className="floating-card two"><strong>72</strong><span>drops boutique</span></div>
      </div>
    </section>
  );
}

function HomePage() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const featuredProducts = productsSeed.slice(0, 8);
  const featuredVideos = videosSeed.slice(0, 6);
  return (
    <>
      <Hero />
      <section className="route-strip" data-testid="home-route-strip">
        {navRoutes.slice(1, 9).map((route) => (
          <Link to={route.to} key={route.to} className="route-tile" data-testid={`home-route-${route.to.replaceAll("/", "")}`}> <strong>{route.label}</strong><span>{route.desc}</span></Link>
        ))}
      </section>
      <section className="page-section">
        <SectionTitle eyebrow="Boutique" title="Drops manga officiels">Produits issus du sitemap live Lovanet : affiches, collectors, vêtements et objets anime.</SectionTitle>
        <div className="product-grid featured" data-testid="home-featured-products">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} compact />)}
        </div>
      </section>
      <section className="page-section">
        <SectionTitle eyebrow="Vidéos" title="YouTube · TikTok · Prime Video">Lecteurs immersifs et cartes vidéos dérivées du catalogue officiel.</SectionTitle>
        <div className="video-grid" data-testid="home-featured-videos">
          {featuredVideos.map((video) => <VideoCard key={video.id} video={video} onPlay={setSelectedVideo} />)}
        </div>
      </section>
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </>
  );
}

function ShopPage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const { data, loading } = useApiResource(`/products?category=${category}&q=${encodeURIComponent(query)}&limit=72`, { products: productsSeed, total: productsSeed.length }, [category, query]);
  const products = data.products || productsSeed;
  const categories = ["all", ...Object.keys(categoryLabels).filter((key) => key !== "all")];
  return (
    <section className="page-section top-page" data-testid="shop-page">
      <SectionTitle eyebrow="Boutique Lovanet" title="Posters, collectors, vêtements et objets anime">Catalogue produits reconstruit depuis le sitemap et les SVG `/products/am-*.svg` du site original.</SectionTitle>
      <div className="shop-toolbar">
        <input data-testid="shop-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un produit…" />
        <div className="filter-chips" data-testid="shop-category-filters">
          {categories.map((key) => <button type="button" key={key} data-testid={`shop-filter-${key}`} className={cn("filter-chip", category === key && "active")} onClick={() => setCategory(key)}>{categoryLabels[key]}</button>)}
        </div>
      </div>
      {loading && <p className="loading-line">Chargement boutique…</p>}
      <div className="product-grid" data-testid="shop-product-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

function DiscoverPage() {
  return (
    <section className="page-section top-page" data-testid="discover-page">
      <SectionTitle eyebrow="Discover Lovanet" title="Un univers anime relié à toutes les plateformes">Le site original réunit boutique, catalogue, shorts, vidéos longues et lecteurs immersifs dans une identité sombre, verre et néon.</SectionTitle>
      <div className="universe-grid">
        {navRoutes.slice(1, 9).map((route, index) => (
          <Link to={route.to} key={route.to} className="universe-card" data-testid={`discover-card-${index}`}>
            <img src={`/products/am-${String(index + 1).padStart(3, "0")}.svg`} alt="" />
            <span className="eyebrow">Section {String(index + 1).padStart(2, "0")}</span>
            <h3>{route.label}</h3>
            <p>{route.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MediaPage({ platform = "all", title, eyebrow, description }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const fallback = { videos: platform === "all" ? videosSeed : videosSeed.filter((video) => video.platform === platform), total: videosSeed.length };
  const { data, loading } = useApiResource(`/videos?platform=${platform}&limit=24`, fallback, [platform]);
  const videos = data.videos || fallback.videos;
  const manualSync = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 850);
  };
  return (
    <section className="page-section top-page" data-testid={`${platform}-media-page`}>
      <SectionTitle eyebrow={eyebrow} title={title}>{description}</SectionTitle>
      <div className="media-hero">
        <div className="iframe-shell large">
          <iframe title="Lovanet featured video" src={`https://www.youtube-nocookie.com/embed/${videos[0]?.id || "LHtdKWJdif4"}?rel=0&modestbranding=1`} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        </div>
        <div className="media-panel">
          <span className="eyebrow">Synchronisation</span>
          <h3>Flux vidéo reconstruit</h3>
          <p>Les cartes utilisent les trailers et médias du catalogue Lovanet. Le bouton flottant du site original est recréé pour rafraîchir l’interface.</p>
          <button type="button" data-testid="manual-sync-button" className="primary-button" onClick={manualSync}>{refreshing ? "Sync en cours…" : "Sync manuel"}</button>
        </div>
      </div>
      {loading && <p className="loading-line">Chargement vidéos…</p>}
      <div className="video-grid" data-testid="media-video-grid">
        {videos.map((video) => <VideoCard key={video.id} video={video} onPlay={setSelectedVideo} />)}
      </div>
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </section>
  );
}

function PlayerPage() {
  const [params] = useSearchParams();
  const requested = params.get("video");
  const selected = videosSeed.find((video) => video.id === requested) || videosSeed[0];
  return (
    <section className="page-section top-page" data-testid="player-page">
      <SectionTitle eyebrow="Lecteur vidéo" title="Player immersif anime">Lecture plein écran en panneau glassmorphism comme la tablette/overlay détectée dans le bundle original.</SectionTitle>
      <div className="player-layout">
        <div className="iframe-shell cinema">
          <iframe title={selected.title} src={`https://www.youtube-nocookie.com/embed/${selected.id}?rel=0&modestbranding=1`} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        </div>
        <div className="playlist-panel">
          {videosSeed.slice(0, 10).map((video) => (
            <Link data-testid={`playlist-link-${video.id}`} key={video.id} to={`/lecteurs-video?video=${video.id}`} className={cn("playlist-row", selected.id === video.id && "active")}>{video.title}</Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountdownPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const active = countdownSeed[activeIndex];
  const diff = Math.max(0, new Date(active.date).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return (
    <section className="page-section top-page" data-testid="anime-countdown-page">
      <SectionTitle eyebrow="Anime à venir" title="Countdown live des prochains épisodes">Sélectionnez un événement pour afficher le timer néon.</SectionTitle>
      <div className="countdown-layout">
        <div className="countdown-card" data-testid="anime-countdown-timer">
          <img src={active.image} alt="" />
          <span className="eyebrow">{active.platform}</span>
          <h3>{active.title}</h3>
          <div className="timer-grid">
            <strong>{days}<span>jours</span></strong>
            <strong>{hours}<span>heures</span></strong>
            <strong>{minutes}<span>min</span></strong>
            <strong>{seconds}<span>sec</span></strong>
          </div>
        </div>
        <div className="countdown-list" data-testid="anime-countdown-select-anime">
          {countdownSeed.map((item, index) => <button type="button" data-testid={`countdown-option-${index}`} className={cn(index === activeIndex && "active")} onClick={() => setActiveIndex(index)} key={item.title}>{item.title}<span>{item.platform}</span></button>)}
        </div>
      </div>
    </section>
  );
}

function CatalogPage() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [selected, setSelected] = useState(null);
  const { data, loading } = useApiResource(`/catalog?q=${encodeURIComponent(query)}&genre=${genre}&limit=60`, { items: [], total: 0, genres: [] }, [query, genre]);
  const items = data.items || [];
  return (
    <section className="page-section top-page" data-testid="anime-catalog-page">
      <SectionTitle eyebrow="Catalogue Anime" title="1500+ animés manga avec trailers">Catalogue importé depuis `/catalog-seo.json` du site live Lovanet.</SectionTitle>
      <div className="shop-toolbar">
        <input data-testid="catalog-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher Attack on Titan, Naruto…" />
        <select data-testid="catalog-genre-select" value={genre} onChange={(event) => setGenre(event.target.value)}>
          <option value="all">Tous genres</option>
          {(data.genres || []).map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
      </div>
      {loading && <p className="loading-line">Chargement catalogue…</p>}
      <div className="catalog-grid" data-testid="catalog-grid">
        {items.map((anime) => (
          <article className="anime-card" data-testid={`anime-card-${anime.id}`} key={anime.id} id={`anime-${anime.id}`}>
            <img src={anime.cover} alt={anime.title} loading="lazy" />
            <div>
              <span className="source-chip">{anime.year || "Anime"} · {anime.score || "—"}/100</span>
              <h3>{anime.title}</h3>
              <p>{anime.summary}</p>
              {anime.trailerId && <button type="button" data-testid={`anime-trailer-${anime.id}`} className="small-button" onClick={() => setSelected({ id: String(anime.trailerId).trim(), title: anime.title })}>Trailer</button>}
            </div>
          </article>
        ))}
      </div>
      <VideoModal video={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "Contact Lovanet", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await axios.post(`${API}/forms/contact`, form);
      setStatus(response.data.message);
      setForm({ name: "", email: "", subject: "Contact Lovanet", message: "" });
    } catch (error) {
      setStatus(error.response?.data?.detail || "Erreur lors de l’envoi du message.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="page-section top-page contact-layout" data-testid="contact-page">
      <div>
        <SectionTitle eyebrow="Contact" title="Écrire à l’équipe Anime.Moments.officiel">Formulaire dynamique relié au backend FastAPI/MongoDB.</SectionTitle>
        <div className="contact-cards">
          <a href="https://www.youtube.com/@animemomentsanimeofficiel" target="_blank" rel="noreferrer">YouTube officiel</a>
          <a href="https://www.tiktok.com/@animemomentsanimeofficiel" target="_blank" rel="noreferrer">TikTok officiel</a>
          <Link to="/shop">Boutique Lovanet</Link>
        </div>
      </div>
      <form className="contact-form" data-testid="contact-form" onSubmit={submit}>
        <input data-testid="contact-name-input" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input data-testid="contact-email-input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input data-testid="contact-subject-input" placeholder="Sujet" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <textarea data-testid="contact-message-input" placeholder="Votre message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        <button className="primary-button full" data-testid="contact-form-submit-button" disabled={loading} type="submit">{loading ? "Envoi…" : "Envoyer"}</button>
        {status && <p className="form-status" data-testid="contact-form-status">{typeof status === "string" ? status : JSON.stringify(status)}</p>}
      </form>
    </section>
  );
}

function LegalsPage() {
  return (
    <section className="page-section top-page legal-page" data-testid="legals-page">
      <SectionTitle eyebrow="Mentions légales" title="CGV & confidentialité Lovanet">Page reconstruite pour conserver les accès visibles depuis le menu original.</SectionTitle>
      <article className="legal-panel">
        <h3>Éditeur</h3><p>Lovanet / Anime.Moments.officiel — plateforme officielle anime, vidéos, catalogue et boutique manga.</p>
        <h3>Propriété intellectuelle</h3><p>Les images, SVG, descriptions produits, routes et contenus sont réutilisés dans le cadre de la reconstruction autorisée par le propriétaire du site.</p>
        <h3>Boutique</h3><p>Le panier et les demandes de commande sont enregistrés côté backend pour reproduire le comportement dynamique de la plateforme.</p>
        <h3>Données personnelles</h3><p>Les soumissions de formulaires sont stockées dans MongoDB pour permettre le suivi de contact. Les données peuvent être supprimées sur demande.</p>
      </article>
    </section>
  );
}

function LanguagePage({ code }) {
  const lang = languages.find((item) => item.code === code) || languages[0];
  return (
    <section className="page-section top-page" data-testid={`language-page-${code}`}>
      <SectionTitle eyebrow={`Hreflang ${lang.code}`} title={lang.headline}>Route localisée reconstruite depuis les alternates visibles dans le HTML live.</SectionTitle>
      <div className="language-panel">
        <img src="/favicon.png" alt="Lovanet" />
        <p>{siteMeta.description}</p>
        <Link className="primary-button" to="/decouvrir">Discover Lovanet</Link>
      </div>
    </section>
  );
}

function AdminPage() {
  const { data } = useApiResource("/site", { manifestSummary: { pages: 27, assets: 87 }, ui: [] }, []);
  return (
    <section className="page-section top-page" data-testid="admin-inventory-page">
      <SectionTitle eyebrow="Inventaire" title="Rapport backup/live">Écran technique de contrôle pour les pages, assets, redirections et composants UI reconstruits.</SectionTitle>
      <div className="admin-grid">
        <div><strong>{data.manifestSummary?.pages || 0}</strong><span>pages/routes détectées</span></div>
        <div><strong>{data.manifestSummary?.assets || 0}</strong><span>assets mirrorrés</span></div>
        <div><strong>PGDMP</strong><span>sauvegarde PostgreSQL/Supabase</span></div>
      </div>
    </section>
  );
}

function FloatingActions() {
  const [syncing, setSyncing] = useState(false);
  return (
    <div className="floating-actions" data-testid="floating-actions">
      <Link to="/contact" className="float-bubble" data-testid="floating-contact-button">Contact</Link>
      <button type="button" className="float-bubble sync" data-testid="floating-sync-button" onClick={() => { setSyncing(true); window.setTimeout(() => setSyncing(false), 900); }}>{syncing ? "Sync…" : "Sync"}</button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer" data-testid="site-footer">
      <div><strong>Lovanet</strong><span>Anime.Moments.officiel : Lovanet Plateforme officielle</span></div>
      <nav>{navRoutes.slice(0, 6).map((route) => <Link key={route.to} to={route.to}>{route.label}</Link>)}</nav>
    </footer>
  );
}

function AliasRedirect({ to }) {
  return <Navigate to={to} replace />;
}

function NotFoundPage() {
  return (
    <section className="page-section top-page" data-testid="not-found-page">
      <SectionTitle eyebrow="404" title="Page non trouvée">Cette route n’a pas été détectée dans le crawl Lovanet.</SectionTitle>
      <Link className="primary-button" to="/">Retour accueil</Link>
    </section>
  );
}

function AppShell() {
  return (
    <div className="App lovanet-app">
      <BackgroundFX />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/decouvrir" element={<DiscoverPage />} />
          <Route path="/lecteurs-video" element={<PlayerPage />} />
          <Route path="/chaine-youtube" element={<MediaPage platform="youtube" eyebrow="YouTube AnimeMoments" title="Chaîne YouTube officielle" description="Vidéos, moments cultes, shorts et compilations manga." />} />
          <Route path="/chaine-youtube/manga" element={<MediaPage platform="youtube" eyebrow="YouTube Manga" title="Chaîne dédiée manga" description="Flux manga et vidéos synchronisées avec l’univers Anime.Moments.officiel." />} />
          <Route path="/prime-video" element={<MediaPage platform="prime" eyebrow="Prime Video" title="Lecture immersive Prime Video" description="Espace de lecture multi-plateforme avec panneaux verre et contenus anime." />} />
          <Route path="/tiktok" element={<MediaPage platform="tiktok" eyebrow="TikTok" title="Shorts Anime.Moments.officiel" description="Shorts verticaux, réactions et tendances manga." />} />
          <Route path="/anime-countdown" element={<CountdownPage />} />
          <Route path="/anime-catalog" element={<CatalogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legals" element={<LegalsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/sync" element={<AdminPage />} />
          {languages.map((language) => <Route key={language.code} path={`/${language.code}`} element={<LanguagePage code={language.code} />} />)}
          {Object.entries(routeAliases).map(([from, to]) => <Route key={from} path={from} element={<AliasRedirect to={to} />} />)}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <FloatingActions />
      <CartDrawer />
    </div>
  );
}

function App() {
  useEffect(() => {
    document.title = siteMeta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", siteMeta.description);
  }, []);

  return (
    <BrowserRouter>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
