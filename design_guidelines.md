{
  "language": "fr",
  "scope": {
    "goal": "Créer une nouvelle landing page racine / (longue, riche, futuriste manga) tout en conservant l’identité visuelle existante, et déplacer l’actuelle Accueil vers /anime-moments sans casser SEO, hubs 3D, vidéos, bulles flottantes, ni routes existantes.",
    "non_goals": [
      "Ne pas refondre les pages Discover/Shop/Actualités/Légals (hors liens navbar).",
      "Ne pas changer radicalement la palette: continuité avec les tokens actuels (deep-space + néons)."
    ]
  },
  "brand_attributes": [
    "Futuriste / cyber-manga",
    "Premium (effets verre + relief 3D)",
    "Énergique (néons animés) mais lisible",
    "Immersif (vidéo/3D/scroll narratif)",
    "Techno mais chaleureux (micro-interactions, pas ‘cold corporate’)"
  ],
  "design_references": {
    "visual_direction": [
      {
        "name": "Samurai Landing Page (Anime Style UI)",
        "url": "https://dribbble.com/shots/26595383-Samurai-Landing-Page-Anime-Style-UI",
        "takeaways": [
          "Composition cinématique + gros titres",
          "Sections longues avec alternance texte/visuels",
          "CTA contrastés et hiérarchie claire"
        ]
      },
      {
        "name": "Design Trends 2026 (Behance)",
        "url": "https://www.behance.net/gallery/239027109/Design-Trends-2026",
        "takeaways": [
          "Neo-minimalisme + micro-maximalisme (détails fins, pas de surcharge)",
          "Glassmorphism 2.0 (verre plus net, bordures doubles)",
          "Motion subtil et continu"
        ]
      },
      {
        "name": "Neon Glassmorphism Handbook (CSS)",
        "url": "https://www.samadshaikh.dev/blog/css-glassmorphism-handbook-neon-ui-layouts",
        "takeaways": [
          "Verre lisible: opacité contrôlée + blur 10–30px",
          "Bordures lumineuses via inner/outer shadows",
          "Contraste texte prioritaire"
        ]
      }
    ],
    "notes": "Aucune référence publique fiable de Lovanet.fr n’a été trouvée via recherche web. Les guidelines ci-dessous s’alignent donc sur les tokens CSS existants du projet (Orbitron/Inter, deep-space, néons cyan/magenta/purple) pour préserver la continuité."
  },
  "typography": {
    "font_pairing": {
      "display": {
        "family": "Orbitron",
        "usage": "H1–H3, labels courts, chiffres/compteurs",
        "css_var": "--font-display"
      },
      "body": {
        "family": "Inter",
        "usage": "paragraphes, UI, descriptions",
        "css_var": "--font-body"
      }
    },
    "scale_tailwind": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-sm md:text-base",
      "small": "text-xs text-muted-foreground"
    },
    "typesetting_rules": [
      "Limiter les lignes de texte à max-w-prose (≈ 65–75 caractères) sur desktop.",
      "Utiliser tracking-wide sur les titres Orbitron (ex: tracking-[0.02em]) pour un rendu ‘tech’.",
      "Éviter les paragraphes en full neon/gradient: réserver aux accents (mots-clés, badges)."
    ]
  },
  "color_system": {
    "continuity_policy": "Réutiliser les CSS variables existantes dans index.css (:root). Ne pas introduire une nouvelle palette arbitraire.",
    "tokens_existing": {
      "background": "hsl(var(--background))",
      "foreground": "hsl(var(--foreground))",
      "card": "hsl(var(--card))",
      "border": "hsl(var(--border))",
      "primary": "hsl(var(--primary))",
      "neon_cyan": "hsl(var(--neon-cyan))",
      "neon_magenta": "hsl(var(--neon-magenta))",
      "neon_purple": "hsl(var(--neon-purple))"
    },
    "semantic_usage": {
      "page_bg": "--gradient-hero (background only)",
      "section_bg": "--gradient-surface (background only)",
      "glass_surface": "utility .glass / .glass-card",
      "focus_ring": "--ring",
      "borders": "--border",
      "cta_primary": "--primary + glow (--glow-cyan)",
      "cta_accent": "btn-neon-rainbow (déjà défini) uniquement pour CTA majeurs"
    },
    "gradient_policy": {
      "rule": "Respecter strictement la GRADIENT RESTRICTION RULE (voir fin du document).",
      "allowed_in_this_project": [
        "Hero background: --gradient-hero (déjà sombre et lisible)",
        "Accents décoratifs: conic gradients sur bordures (.rgb-neon/.rgb-card) car ce ne sont pas des zones de lecture",
        "CTA principal: .btn-neon-rainbow (surface large, lisible)"
      ],
      "avoid": [
        "Ne pas mettre de gradient derrière des paragraphes longs.",
        "Ne pas multiplier les gradients dans la même section.",
        "Ne pas appliquer de gradient sur des petits boutons secondaires (<100px)."
      ]
    }
  },
  "layout_and_grid": {
    "global_container": {
      "rule": "Ne pas centrer l’app via .App { text-align:center }. Utiliser des containers Tailwind.",
      "container": "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
      "section_spacing": "py-14 sm:py-18 lg:py-24",
      "stack_spacing": "space-y-10 sm:space-y-12"
    },
    "page_structure_root": {
      "pattern": "Long scroll narratif (Z-pattern sur hero, puis alternance split sections + bento grids).",
      "sections": [
        {
          "id": "hero",
          "goal": "Positionnement + CTA + preuve visuelle (vidéo/loop) + bulles flottantes",
          "layout": "2 colonnes desktop (texte gauche, visuel droit), 1 colonne mobile",
          "notes": "Inclure un fond décoratif (blobs .animate-blob) mais garder la zone de lecture sur fond solide/hero gradient."
        },
        {
          "id": "quick-portal",
          "goal": "Accès rapide vers /anime-moments, /discover, /shop",
          "layout": "Bento 3 cartes (1 grande + 2 petites) avec .rgb-card",
          "notes": "Chaque carte = image/vidéo thumb + label + micro-CTA."
        },
        {
          "id": "storyline",
          "goal": "Section éditoriale manga (3 ‘chapitres’)",
          "layout": "Timeline verticale mobile → horizontale desktop",
          "notes": "Utiliser badges + numéros (Orbitron) + petites illustrations."
        },
        {
          "id": "featured-videos",
          "goal": "Mettre en avant des vidéos (auto-sync plateformes externes) sans casser l’existant",
          "layout": "Carousel shadcn + cartes verre",
          "notes": "Prévoir skeletons + états vides."
        },
        {
          "id": "3d-hubs-teaser",
          "goal": "Teaser des hubs 3D (Ferry/Train Station) avec CTA vers Shop/Discover",
          "layout": "Split: texte + preview (image/placeholder) + CTA",
          "notes": "Ne pas intégrer les hubs 3D ici si risque perf; teaser seulement."
        },
        {
          "id": "community-proof",
          "goal": "Preuve sociale / stats / promesses",
          "layout": "Grid 2x2 ou 3x2 de stats + mini témoignages",
          "notes": "Utiliser .depth-card ou .holo-card pour variété."
        },
        {
          "id": "faq",
          "goal": "Répondre aux questions SEO + conversion",
          "layout": "Accordion shadcn",
          "notes": "FAQ = contenu indexable, texte lisible (fond solide)."
        },
        {
          "id": "final-cta",
          "goal": "CTA final vers /anime-moments + newsletter/compte",
          "layout": "Card verre pleine largeur",
          "notes": "Un seul CTA principal + un secondaire ghost."
        }
      ]
    },
    "responsive_rules": [
      "Mobile-first: tout doit fonctionner en 360px.",
      "Sur mobile: réduire les effets 3D/tilt (déjà géré via media queries dans index.css).",
      "Limiter les vidéos en autoplay sur mobile: préférer poster + play."
    ]
  },
  "components": {
    "component_path": {
      "shadcn_ui": "/app/frontend/src/components/ui",
      "primary": [
        "button.tsx",
        "card.tsx",
        "badge.tsx",
        "navigation-menu.tsx",
        "sheet.tsx",
        "accordion.tsx",
        "carousel.tsx",
        "tabs.tsx",
        "separator.tsx",
        "tooltip.tsx",
        "skeleton.tsx",
        "sonner.tsx"
      ]
    },
    "landing_components_to_build_js": [
      {
        "name": "RootLandingPage",
        "type": "page",
        "route": "/",
        "file_suggestion": "frontend/src/pages/RootLandingPage.js",
        "notes": "JS uniquement (pas TSX)."
      },
      {
        "name": "HeroManga",
        "type": "section",
        "file_suggestion": "frontend/src/components/landing/HeroManga.js",
        "uses": ["Button", "Badge", "Card"],
        "classes": ["gradient-hero", "animate-blob", "btn-neon-rainbow", "nav-3d"],
        "data_testids": [
          "home-hero-primary-cta-button",
          "home-hero-secondary-cta-button"
        ]
      },
      {
        "name": "QuickPortalBento",
        "type": "section",
        "file_suggestion": "frontend/src/components/landing/QuickPortalBento.js",
        "uses": ["Card", "Button", "Badge"],
        "classes": ["rgb-card", "rgb-frame", "hover-lift"],
        "data_testids": [
          "home-portal-anime-moments-card",
          "home-portal-discover-card",
          "home-portal-shop-card"
        ]
      },
      {
        "name": "FeaturedVideosRail",
        "type": "section",
        "file_suggestion": "frontend/src/components/landing/FeaturedVideosRail.js",
        "uses": ["Carousel", "Card", "Skeleton", "Button"],
        "data_testids": [
          "home-featured-videos-carousel",
          "home-featured-videos-item"
        ]
      },
      {
        "name": "FAQAccordion",
        "type": "section",
        "file_suggestion": "frontend/src/components/landing/FAQAccordion.js",
        "uses": ["Accordion"],
        "data_testids": ["home-faq-accordion"]
      }
    ],
    "navbar_updates": {
      "routing": [
        "Le lien ‘Accueil’ doit pointer vers / (nouvelle landing)",
        "Ajouter/renommer un lien vers l’ancienne home: ‘Anime Moments’ → /anime-moments"
      ],
      "interaction": [
        "Conserver l’effet .nav-3d (underline gradient) sur hover/active.",
        "Sur mobile: utiliser Sheet shadcn pour menu burger."
      ],
      "data_testids": [
        "navbar-home-link",
        "navbar-anime-moments-link",
        "navbar-discover-link",
        "navbar-shop-link",
        "navbar-news-link"
      ]
    }
  },
  "motion_and_microinteractions": {
    "principles": [
      "Motion = ‘énergie contrôlée’: animations lentes en fond, rapides sur interactions.",
      "Respect prefers-reduced-motion (déjà présent dans index.css).",
      "Pas de transition: all. Toujours cibler transform/opacity/box-shadow." 
    ],
    "recommended_effects_existing": [
      "Bulles/blobs: .animate-blob + delays",
      "Boutons: .btn-interactive / .btn-magnetic / .shimmer-btn",
      "Cartes: .tilt-card (desktop), .rgb-card hover",
      "Hero entrance: .animate-hero-rise",
      "Nav underline: .nav-3d"
    ],
    "framer_motion_optional": {
      "use_case": "Entrées de sections au scroll (fade+rise) + stagger sur bento",
      "install": "npm i framer-motion",
      "pattern": "motion.section initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true, margin:'-80px'}} transition={{duration:0.6, ease:[0.2,0.8,0.2,1]}}"
    }
  },
  "seo_and_content_structure": {
    "rules": [
      "Conserver la structure meta existante (title/description/canonical/OG).",
      "La nouvelle page / doit avoir un H1 unique, puis H2 par section.",
      "FAQ en HTML sémantique (Accordion) pour contenu indexable.",
      "Ajouter des ancres (#discover, #shop, #videos) uniquement si utile; ne pas casser les routes."
    ],
    "migration": {
      "old_home": "Déplacer l’actuelle page d’accueil vers /anime-moments en conservant son contenu et ses metas (ou canonical adapté).",
      "redirects": "Si possible côté serveur/proxy: 301 de toute ancienne URL home spécifique vers /anime-moments si elle existait."
    }
  },
  "accessibility": {
    "requirements": [
      "Contraste AA: texte sur surfaces verre doit rester lisible (ajouter bg overlay si besoin).",
      "Focus visible: utiliser ring (ring-2 ring-ring ring-offset-2 ring-offset-background).",
      "Zones cliquables >= 44px sur mobile.",
      "Respect prefers-reduced-motion: pas d’animations essentielles pour comprendre."
    ]
  },
  "implementation_notes_js": {
    "js_only": "Le projet contient des fichiers .js: écrire les nouveaux composants en .js (pas .tsx).",
    "data_testid_rule": "Tous les éléments interactifs et infos clés DOIVENT avoir data-testid en kebab-case.",
    "css_cleanup": [
      "App.css actuel centre #root (text-align:center). À supprimer/neutraliser pour respecter le flux de lecture.",
      "Préférer Tailwind + tokens existants dans index.css."
    ]
  },
  "image_urls": {
    "note": "Aucune image n’a été sélectionnée via provider (Unsplash/Pexels) car l’identité semble dépendre d’assets internes (manga/vidéos). Utiliser des placeholders internes existants. Si besoin, demander une sélection ciblée (hero background ‘cyber city’, ‘anime neon street’).",
    "categories": [
      {
        "category": "hero_background_optional",
        "description": "Image/vidéo de fond légère (poster) si aucune vidéo interne n’est disponible.",
        "urls": []
      },
      {
        "category": "bento_thumbnails_optional",
        "description": "Vignettes pour les 3 cartes portail (Anime Moments / Discover / Shop).",
        "urls": []
      }
    ]
  },
  "instructions_to_main_agent": [
    "Créer une nouvelle page / longue avec sections listées (hero, bento, storyline, vidéos, teaser hubs 3D, preuve sociale, FAQ, final CTA).",
    "Déplacer l’actuelle home vers /anime-moments (route + navbar).",
    "Ne pas casser les hubs 3D existants sur Discover/Shop; sur /, seulement teaser (image + CTA) pour éviter perf.",
    "Réutiliser les classes utilitaires déjà présentes dans index.css (rgb-card, rgb-neon, btn-neon-rainbow, nav-3d, glass, etc.).",
    "Nettoyer App.css pour enlever le centrage global (#root text-align:center) et padding rigide; utiliser containers Tailwind.",
    "Ajouter data-testid sur tous les CTA, liens navbar, items carousel, formulaires, messages clés.",
    "Respecter prefers-reduced-motion et éviter transition: all."
  ],
  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
