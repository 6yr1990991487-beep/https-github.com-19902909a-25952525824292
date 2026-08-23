import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { getSiteOrigin } from "@/lib/siteOrigin";

const Legals = () => {
  useEffect(() => {
    document.title = "Mentions légales — Lovanet";
    const desc =
      "Mentions légales de Lovanet : éditeur, hébergement, propriété intellectuelle, données personnelles et contact.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${getSiteOrigin()}/legals`);
  }, []);

  return (
    <PageShell>
      <article className="container mx-auto px-4 lg:px-8 py-16 max-w-3xl">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Informations</p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
            Mentions légales
          </h1>
          <p className="text-muted-foreground mt-4">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </header>

        <section className="space-y-10 text-sm md:text-base leading-relaxed text-foreground/90">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-primary">Propriété intellectuelle</h2>
            <p>
              L’ensemble des éléments du site (textes, visuels, sons, logos, marque
              Lovanet) est protégé par le droit d’auteur. Toute
              reproduction, représentation ou diffusion sans autorisation écrite
              préalable est interdite. Les contenus tiers restent la propriété de
              leurs ayants droit respectifs.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 text-primary">Données personnelles &amp; cookies</h2>
            <p>
              Lovanet collecte uniquement les données strictement nécessaires au
              fonctionnement du service (compte client, commandes via la magasin,
              formulaire de contact). Conformément au RGPD, vous disposez d’un droit
              d’accès, de rectification et de suppression de vos données en nous
              contactant. Des cookies techniques peuvent être déposés pour la session
              et la lecture des médias intégrés.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 text-primary">Responsabilité</h2>
            <p>
              L’éditeur s’efforce d’assurer l’exactitude des informations publiées
              mais ne peut être tenu responsable des erreurs, omissions ou
              indisponibilités du service. Les liens vers des sites tiers ne
              sauraient engager la responsabilité de Lovanet.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 text-primary">Contact</h2>
            <p>
              Pour toute demande relative aux présentes mentions légales :{" "}
              <Link to="/contact" className="text-primary underline underline-offset-2 hover:opacity-80">
                formulaire de contact
              </Link>.
            </p>
          </div>
        </section>
      </article>
    </PageShell>
  );
};

export default Legals;