import { PageShell } from "@/components/PageShell";
import lecteurBanner from "@/assets/lecteur-video-banner-v15.mp4.asset.json";

/**
 * Page Lecteur vidéo — version épurée :
 * une seule bannière vidéo en haut de page, aucune autre bannière ni image.
 */
const LecteursVideo = () => (
  <PageShell>
    <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-10">
      <h1 className="sr-only">Lecteur vidéo Lovanet</h1>
      <div className="mx-auto max-w-[854px] overflow-hidden rounded-[2rem] border border-white/12 bg-black shadow-[0_28px_90px_-42px_rgba(56,189,248,0.6)]">
        <video
          src={lecteurBanner.url}
          className="w-full h-auto block"
          style={{ aspectRatio: "854 / 480" }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Bannière vidéo Lovanet"
        />
      </div>
    </section>
  </PageShell>
);

export default LecteursVideo;
