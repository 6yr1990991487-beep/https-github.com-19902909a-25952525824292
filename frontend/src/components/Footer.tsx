import { Link } from "react-router-dom";
import { Mail, Youtube, ShoppingBag, Newspaper, Compass, Film, PlayCircle } from "lucide-react";
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

export const Footer = () => {
  return (
    <footer className="mt-24 border-t border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="space-y-5">
          <Link to="/" className="inline-flex items-center gap-3" data-testid="footer-home-link">
            <span className="font-display text-2xl font-black tracking-[0.14em] text-white">LOVANET</span>
          </Link>
          <p className="max-w-xl text-sm leading-7 text-white/62" data-testid="footer-description">
            Portail anime et manga pensé pour explorer les vidéos, les actualités, les univers immersifs et la boutique collector dans une expérience visuelle premium.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="glass" className="rounded-full border-white/15 bg-white/[0.05] text-white" data-testid="footer-contact-button">
              <Link to="/contact">
                <Mail className="h-4 w-4" />
                Contact
              </Link>
            </Button>
            <Button asChild className="btn-neon-rainbow rounded-full text-white" data-testid="footer-primary-button">
              <Link to="/anime-moments">
                <Film className="h-4 w-4" />
                Explorer Anime Moments
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h4 className="mb-4 text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">Navigation</h4>
            <ul className="space-y-3 text-sm text-white/72">
              {footerLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="transition-colors hover:text-white" data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/70">Destinations</h4>
            <ul className="grid gap-3 text-sm text-white/72">
              {destinations.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex items-center gap-2 transition-colors hover:text-white"
                    data-testid={`footer-destination-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-white/48 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span data-testid="footer-copyright">© {new Date().getFullYear()} Lovanet — Anime Moments.</span>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/legals" className="transition-colors hover:text-white" data-testid="footer-legals-link">Mentions légales</Link>
            <span>·</span>
            <a
              href="https://www.youtube.com/@animemomentsanimeofficiel"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
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
