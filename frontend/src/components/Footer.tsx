import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  const [email, setEmail] = useState("");
  return (
    <footer className="border-t border-border bg-card/40 mt-24">
      {/* SEO — Sitelinks empilés (rendu accessible, structure crawlable) */}
      <nav aria-label="Lovanet — Plateforme officielle dédiée à l'anime" className="container mx-auto px-4 lg:px-8 pt-10">
        <p className="sr-only">Lovanet — Plateforme officielle dédiée à l'anime · Anime.Moments.officiel &amp; AnimemomentsAnimeofficiel · Animés à venir, Catalogue, Boutique.</p>
        <ul className="grid gap-1 text-sm text-muted-foreground">
          <li><Link to="/" className="hover:text-primary">Lovanet Plateforme officiel →</Link></li>
          <li><Link to="/anime-catalog" className="hover:text-primary">Catalogue →</Link></li>
          <li><Link to="/decouvrir" className="hover:text-primary">Univers Lovanet →</Link></li>
          <li><Link to="/shop" className="hover:text-primary">Boutique →</Link></li>
          <li>
            <Link to="/chaine-youtube" className="hover:text-primary">AnimemomentsAnimeofficiel → YouTube</Link>{" "}
            <a href="https://www.youtube.com/@animemomentsanimeofficiel" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-wider text-primary/80 hover:text-primary">↗ partenaire</a>
          </li>
          <li>
            <Link to="/chaine-youtube" className="hover:text-primary">AnimemomentsAnimeofficiel →</Link>{" "}
            <a href="https://www.youtube.com/@animemomentsanimeofficiel" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-wider text-primary/80 hover:text-primary">↗ partenaire</a>
          </li>
          <li>
            <Link to="/prime-video" className="hover:text-primary">Anime.Moments.officiel → Prime Video</Link>{" "}
            <a href="https://www.primevideo.com/search/ref=atv_nb_sr?phrase=anime" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-wider text-primary/80 hover:text-primary">↗ partenaire</a>
          </li>
          <li>
            <Link to="/tiktok" className="hover:text-primary">Anime.Moments.officiel → TikTok</Link>{" "}
            <a href="https://www.tiktok.com/@anime.moments.officiel" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-wider text-primary/80 hover:text-primary">↗ partenaire</a>
          </li>
          <li><Link to="/anime-countdown" className="hover:text-primary">À venir →</Link></li>
        </ul>
      </nav>
      <div className="container mx-auto px-4 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <Link to="/" className="font-display font-extrabold tracking-wider text-lg">
            Lovanet
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Plateforme officielle Lovanet — catalogue d'animés, épisodes en streaming et séries manga sur Prime Video, YouTube et TikTok.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold mb-3 tracking-[0.25em] text-primary uppercase">Navigation</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Accueil</Link></li>
            <li><Link to="/lecteurs-video" className="hover:text-primary">Lecteurs vidéo</Link></li>
            <li><Link to="/chaine-youtube" className="hover:text-primary">YouTube</Link></li>
            <li><Link to="/prime-video" className="hover:text-primary">Prime Vidéo</Link></li>
            <li><Link to="/tiktok" className="hover:text-primary">TikTok</Link></li>
            <li><Link to="/actualites" className="hover:text-primary">Actualités anime →</Link></li>
            <li><Link to="/shop" className="hover:text-primary">Shop</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold mb-3 tracking-[0.25em] text-primary uppercase">Communauté</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="https://www.youtube.com/channel/UC0T9pcWA9_lpdB6-ZucZYmw" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                YouTube · @animemomentsAnimeofficiel
              </a>
            </li>
            <li>
              <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                TikTok officiel
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold mb-3 tracking-[0.25em] text-primary uppercase">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-3">Reçois les meilleurs moments anime chaque semaine.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); setEmail(""); }}
            className="flex gap-2"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.fr"
              className="rounded-full bg-secondary border-border"
            />
            <Button type="submit" className="rounded-full">OK</Button>
          </form>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-4 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 justify-between">
          <span>© {new Date().getFullYear()} Lovanet — Anime Moments. Tous droits réservés.</span>
          <span className="space-x-3">
            <Link to="/" className="hover:text-primary">Manga animé</Link>
            <span>·</span>
            <Link to="/chaine-youtube" className="hover:text-primary">YouTube</Link>
            <span>·</span>
            <Link to="/tiktok" className="hover:text-primary">TikTok</Link>
            <span>·</span>
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <span>·</span>
            <Link to="/legals" className="hover:text-primary">Mentions légales</Link>
          </span>
        </div>
      </div>
    </footer>
  );
};