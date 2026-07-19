import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index";
import RootLandingPage from "./pages/RootLandingPage";
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
import OAuthConsent from "./pages/OAuthConsent";
import SyncDashboard from "./pages/SyncDashboard";
import Actualites from "./pages/Actualites";
import HubTrainStationStandalone from "./pages/HubTrainStationStandalone";
import HubFerryStandalone from "./pages/HubFerryStandalone";
import { ThemeBubble } from "./components/ThemeBubble";
import { CartProvider } from "./context/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import GoogleTranslate from "./components/GoogleTranslate";
import { HologramOverlay } from "./components/HologramOverlay";
import { LocalizedHead } from "./components/LocalizedHead";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/lib/seoI18n";

const queryClient = new QueryClient();
const LOCALE_PREFIXES = SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE);

const APP_ROUTES: Array<{ path: string; element: JSX.Element }> = [
  { path: "/", element: <RootLandingPage /> },
  { path: "/anime-moments", element: <Index /> },
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
  { path: "/actualites", element: <Actualites /> },
  { path: "/actualites/:slug", element: <Actualites /> },
  { path: "/decouvrir", element: <Discover /> },
  { path: "/hub/train-station", element: <HubTrainStationStandalone /> },
  { path: "/hub/ferry", element: <HubFerryStandalone /> },
];

const REDIRECTS: Array<{ from: string; to: string }> = [
  { from: "/home", to: "/anime-moments" },
  { from: "/accueil", to: "/anime-moments" },
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

const AppShell = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const isHubPreviewRoute = pathname.startsWith("/hub/") || LOCALE_PREFIXES.some((lang) => pathname.startsWith(`/${lang}/hub/`));
  const rootPaths = new Set(["/", ...LOCALE_PREFIXES.map((lang) => `/${lang}`)]);
  const isRootLandingRoute = rootPaths.has(pathname);

  return (
    <CartProvider>
      {!isHubPreviewRoute && <LocalizedHead />}
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isHubPreviewRoute && !isRootLandingRoute && <ThemeBubble />}
      {!isHubPreviewRoute && <CartDrawer />}
      {!isHubPreviewRoute && !isRootLandingRoute && !pathname.startsWith('/anime-catalog') && !pathname.startsWith('/tiktok') && !pathname.startsWith('/anime-countdown') && !LOCALE_PREFIXES.some((lang) => pathname.startsWith(`/${lang}/anime-catalog`) || pathname.startsWith(`/${lang}/tiktok`) || pathname.startsWith(`/${lang}/anime-countdown`)) && <GoogleTranslate />}
      {!isHubPreviewRoute && !isRootLandingRoute && !pathname.startsWith('/anime-catalog') && !pathname.startsWith('/tiktok') && !pathname.startsWith('/anime-countdown') && !LOCALE_PREFIXES.some((lang) => pathname.startsWith(`/${lang}/anime-catalog`) || pathname.startsWith(`/${lang}/tiktok`) || pathname.startsWith(`/${lang}/anime-countdown`)) && <HologramOverlay />}
    </CartProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
