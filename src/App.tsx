import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ChaineYoutube from "./pages/ChaineYoutube";
import ChaineYoutubeManga from "./pages/ChaineYoutubeManga";
import LecteursVideo from "./pages/LecteursVideo";
import PrimeVideo from "./pages/PrimeVideo";
import Tiktok from "./pages/Tiktok";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import Legals from "./pages/Legals";
import NotFound from "./pages/NotFound";
import AnimeCountdown from "./pages/AnimeCountdown";
import AnimeCatalog from "./pages/AnimeCatalog";
import Discover from "./pages/Discover";
import Actualites from "./pages/Actualites";
import OAuthConsent from "./pages/OAuthConsent";
import SyncDashboard from "./pages/SyncDashboard";
import { ThemeBubble } from "./components/ThemeBubble";
import { CartProvider } from "./context/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import GoogleTranslate from "./components/GoogleTranslate";
import { LocalizedHead } from "./components/LocalizedHead";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/lib/seoI18n";

const queryClient = new QueryClient();

// Every localized language other than the default (French) gets its own URL
// prefix so Google indexes distinct pages per language: /en/shop, /ja/,
// /es/anime-catalog, etc. LocalizedHead reads the prefix and swaps meta.
const LOCALE_PREFIXES = SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE);

const APP_ROUTES: Array<{ path: string; element: JSX.Element }> = [
  { path: "/", element: <Index /> },
  { path: "/chaine-youtube", element: <ChaineYoutube /> },
  { path: "/chaine-youtube/manga", element: <ChaineYoutubeManga /> },
  { path: "/lecteurs-video", element: <LecteursVideo /> },
  { path: "/prime-video", element: <PrimeVideo /> },
  { path: "/tiktok", element: <Tiktok /> },
  { path: "/shop", element: <Shop /> },
  { path: "/contact", element: <Contact /> },
  { path: "/legals", element: <Legals /> },
  { path: "/anime-countdown", element: <AnimeCountdown /> },
  { path: "/anime-catalog", element: <AnimeCatalog /> },
  { path: "/decouvrir", element: <Discover /> },
  { path: "/actualites", element: <Actualites /> },
];

// Legacy / friendly aliases -> canonical branded routes. Keeps old inbound
// links working and matches the Google sitelinks ordering (YouTube, Discover,
// Prime Video, TikTok, Shop, Countdown, Catalog).
const REDIRECTS: Array<{ from: string; to: string }> = [
  { from: "/youtube", to: "/chaine-youtube" },
  { from: "/anime-moments-youtube", to: "/chaine-youtube" },
  { from: "/animemoments", to: "/chaine-youtube" },
  { from: "/animemomentsanimeofficiel", to: "/chaine-youtube" },
  { from: "/discover", to: "/decouvrir" },
  { from: "/prime", to: "/prime-video" },
  { from: "/amazon-prime", to: "/prime-video" },
  { from: "/tik-tok", to: "/tiktok" },
  { from: "/boutique", to: "/shop" },
  { from: "/catalogue", to: "/anime-catalog" },
  { from: "/anime", to: "/anime-catalog" },
  { from: "/a-venir", to: "/anime-countdown" },
  { from: "/countdown", to: "/anime-countdown" },
  { from: "/admin", to: "/admin/sync" },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <CartProvider>
        <LocalizedHead />
        <Toaster />
        <Sonner />
        <Routes>
          {APP_ROUTES.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
          {LOCALE_PREFIXES.flatMap((lang) =>
            APP_ROUTES.map((r) => (
              <Route
                key={`${lang}-${r.path}`}
                path={r.path === "/" ? `/${lang}` : `/${lang}${r.path}`}
                element={r.element}
              />
            )),
          )}
          {REDIRECTS.map((r) => (
            <Route key={`redir-${r.from}`} path={r.from} element={<Navigate to={r.to} replace />} />
          ))}
          <Route path="/admin/sync" element={<SyncDashboard />} />
          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ThemeBubble />
        <CartDrawer />
        <GoogleTranslate />
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
