import { Link } from "react-router-dom";
import { Youtube, ShoppingBag, Newspaper, Compass, Film, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = [
  { to: "/", label: "Portail" },
  { to: "/anime-moments", label: "Anime Moments" },
  { to: "/decouvrir", label: "Univers Lovanet" },
  { to: "/lecteurs-video", label: "Lecteurs vidéo" },
  { to: "/actualites", label: "Actualités" },
  { to: "/shop", label: "Boutique" },
];

const destinations = [
  { to: "/anime-moments", label: "Anime Moments", icon: Film },
  { to: "/decouvrir", label: "Découvrir", icon: Compass },
  { to: "/chaine-youtube", label: "YouTube", icon: Youtube },
  { to: "/prime-video", label: "Prime Vidéo", icon: PlayCircle },
  { to: "/actualites", label: "Actualités", icon: Newspaper },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
];

const footerPanel =
  "theme-panel-surface rounded-[2rem]";

export const Footer = () => {
  return (
    <footer className="mt-24 px-4 pb-10 sm:px-6 lg:px-8">
      <div className={`mx-auto w-full max-w-6xl overflow-hidden ${footerPanel}`} data-testid="site-footer-shell">
        <div className="grid gap-8 border-b border-[var(--theme-border-soft)] px-5 py-8 sm:px-7 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-10">
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center gap-3" data-testid="footer-home-link">
              <span className="font-display text-2xl font-black tracking-[0.16em] theme-text-main neon-rgb-text-soft">LOVANET</span>
            </Link>
            <p className="theme-text-muted max-w-xl text-sm leading-7" data-testid="footer-description">
              Portail anime et manga, navigation premium, univers immersifs et accès directs vers les sections principales.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="btn-neon-rainbow rounded-full text-white" data-testid="footer-primary-button">
                <Link to="/anime-moments">
                  <Film className="h-4 w-4" />
                  Anime Moments
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="theme-subpanel px-4 py-5">
              <h4 className="theme-text-muted mb-4 text-[11px] uppercase tracking-[0.3em]">Navigation</h4>
              <ul className="space-y-3 text-sm theme-text-main">
                {footerLinks.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="theme-link-inline transition-colors"
                      data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="theme-subpanel px-4 py-5">
              <h4 className="theme-text-muted mb-4 text-[11px] uppercase tracking-[0.3em]">Destinations</h4>
              <ul className="grid gap-3 text-sm theme-text-main">
                {destinations.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="theme-link-inline inline-flex items-center gap-2 transition-colors"
                      data-testid={`footer-destination-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <item.icon className="h-4 w-4 neon-rgb-icon" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="theme-text-muted flex flex-col gap-3 px-5 py-4 text-xs sm:px-7 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span className="neon-rgb-text-mini" data-testid="footer-copyright">
            © {new Date().getFullYear()} Lovanet — Anime Moments.
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/legals" className="theme-link-inline transition-colors" data-testid="footer-legals-link">
              Mentions légales
            </Link>
            <span>·</span>
            <a
              href="https://www.youtube.com/@animemomentsanimeofficiel"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-link-inline transition-colors"
              data-testid="footer-youtube-external-link"
            >
              YouTube officiel
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
