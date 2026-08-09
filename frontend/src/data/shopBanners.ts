// =============================================================
//  Bannières vidéo de la Boutique — CONTENU ÉDITABLE
// -------------------------------------------------------------
//  Pour AJOUTER une bannière : déposez votre clip .mp4 dans le
//  dossier /public puis ajoutez une entrée ci-dessous.
//  Chaque bannière utilise VOTRE propre vidéo locale (100% maison).
// =============================================================

export type BannerVideoSlide = {
  /** Chemin de la vidéo locale, ex: "/ma-video.mp4" (fichier dans /public) */
  src: string;
  /** Image d'aperçu optionnelle affichée pendant le chargement de la vidéo */
  poster?: string;
  /** Titre principal de la bannière */
  title: string;
  /** Sous-titre / description courte */
  subtitle: string;
  /** Petit badge affiché au-dessus du titre */
  badge?: string;
};

export const BANNER_VIDEO_SLIDES: BannerVideoSlide[] = [
  {
    src: "/banner-seq-2.mp4",
    title: "Anime Moments \u00b7 Drop TikTok viral",
    subtitle: "S\u00e9ries inspir\u00e9es des edits TikTok \u2014 livraison sous 3\u20137j",
    badge: "Vid\u00e9o \u00b7 Anime Moments",
  },
  {
    src: "/banner-seq-3.mp4",
    title: "\u00c9dition YouTube Officielle",
    subtitle: "Merch officiel de la cha\u00eene \u00b7 \u00e9ditions num\u00e9rot\u00e9es",
    badge: "Vid\u00e9o \u00b7 Cha\u00eene officielle",
  },
  {
    src: "/root-capture-video-latest.mp4",
    title: "Neo Sakura \u00b7 Banni\u00e8re Cin\u00e9 4K",
    subtitle: "Trailers anime remasteris\u00e9s 4K \u2014 collector \u00e9dition limit\u00e9e num\u00e9rot\u00e9e",
    badge: "Vid\u00e9o \u00b7 \u00c9dition Cin\u00e9",
  },
  {
    src: "/custom_video_lovanet.mp4",
    title: "Lovanet Zone \u00b7 Capsule Collector",
    subtitle: "Pi\u00e8ces exclusives de l'univers Lovanet \u2014 s\u00e9rie limit\u00e9e maison",
    badge: "Vid\u00e9o \u00b7 Univers Lovanet",
  },
];
