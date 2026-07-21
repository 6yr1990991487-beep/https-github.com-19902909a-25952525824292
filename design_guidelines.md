{
  "brand": {
    "name": "Actualités Lovanet — Premium Feed",
    "attributes": [
      "éditorial haut de gamme",
      "crédible (sources publiques vérifiables)",
      "néon RGB maîtrisé + verre (glass)",
      "dense mais lisible (magazine + dashboard)",
      "rapide, vivant, micro-interactions partout"
    ],
    "tone": {
      "voice": "magazine tech + culture pop japonaise",
      "do": [
        "titres courts, impactants",
        "labels de source visibles",
        "dates relatives + date exacte au survol",
        "badges ‘Tendance’, ‘Breaking’, ‘Sorties’"
      ],
      "dont": [
        "contenu générique inventé",
        "titres trop longs",
        "sur-usage de gradients sur zones de lecture"
      ]
    }
  },

  "information_architecture": {
    "routes": {
      "/actualites": {
        "goal": "Lister des actualités premium (vraies sources), filtrables, avec rails/carrousels thématiques et widgets.",
        "primary_actions": [
          "Rechercher",
          "Filtrer (thème, source, date)",
          "Trier (tendance, récent, populaire)",
          "Ouvrir un article",
          "Sauvegarder / suivre une source"
        ]
      },
      "/actualites/:slug": {
        "goal": "Lecture premium + contexte (source, tags, timeline, articles liés).",
        "primary_actions": [
          "Lire",
          "Aller à la source",
          "Partager",
          "Sauvegarder",
          "Voir articles liés"
        ]
      }
    },
    "page_sections_actualites": [
      {
        "id": "hero-editorial",
        "name": "Hero éditorial (Top Story + 2 secondaires)",
        "layout": "split-screen (mobile: stack) + overlay glass",
        "notes": "Le hero doit être la seule zone avec un fond plus ‘cinématique’ (max 20% viewport en gradient)."
      },
      {
        "id": "live-ticker",
        "name": "Ticker Live (Dernières publications)",
        "layout": "marquee horizontal (pause hover) + chips source",
        "notes": "Très premium: vitesse lente, pause au hover, focus clavier possible."
      },
      {
        "id": "bento-premium",
        "name": "Bento Grid (Sélection éditoriale)",
        "layout": "bento 12 colonnes (cards 2x2, 3x2, 4x2)",
        "notes": "Hiérarchie magazine: 1 carte ‘cover story’, 2 cartes ‘analysis’, 4 cartes ‘snack news’."
      },
      {
        "id": "carousels-thematiques",
        "name": "Carrousels spéciaux par thème",
        "layout": "rails horizontaux (snap) + flèches + pagination",
        "notes": "Anime / Manga / Streaming / Gaming / Pop-culture JP."
      },
      {
        "id": "widgets-right-rail",
        "name": "Widgets (Tendances, Calendrier sorties, Radar sources)",
        "layout": "desktop: colonne droite sticky; mobile: accordéons",
        "notes": "Widgets = crédibilité + utilité."
      },
      {
        "id": "footer-sources",
        "name": "Sources & transparence",
        "layout": "liste de sources + statut refresh + disclaimer",
        "notes": "Renforce la confiance (pas de scraping bloqué)."
      }
    ]
  },

  "visual_style": {
    "style_fusion": [
      "Univers Lovanet (néon RGB + glass) comme base",
      "Magazine layout (Swiss editorial) pour la lisibilité",
      "Bento dashboard (2026) pour densité premium",
      "Micro-interactions type ‘product UI’ (hover lift, shimmer, scanline refresh)"
    ],
    "background_strategy": {
      "global": "Conserver le fond deep-space existant (site-tint) + noise overlay déjà présent dans index.css.",
      "hero": "Ajouter une image cinématique + overlay sombre + léger halo néon (pas de gradient saturé sur texte).",
      "reading_areas": "Toujours fond solide/glass (pas de gradient)."
    }
  },

  "typography": {
    "fonts": {
      "display": {
        "current": "Orbitron (déjà importé)",
        "usage": "H1/H2, labels de section, chiffres (tendance)."
      },
      "body": {
        "current": "Inter (déjà importé)",
        "usage": "corps, meta, descriptions, UI"
      },
      "optional_upgrade": {
        "add_google_font": "Space Grotesk",
        "why": "Orbitron est très ‘sci-fi’; Space Grotesk apporte un éditorial premium pour titres d’articles sans perdre le côté tech.",
        "how": "Ajouter dans index.css @import Google Fonts puis définir --font-editorial et l’utiliser uniquement sur titres d’articles (pas sur toute l’app)."
      }
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "article_title_card": "text-lg md:text-xl",
      "body": "text-sm md:text-base",
      "meta": "text-xs uppercase tracking-wider"
    },
    "rules": [
      "Limiter les titres à 2 lignes (line-clamp-2) sur cartes.",
      "Toujours afficher source + date (crédibilité).",
      "Utiliser text-shadow léger uniquement sur hero (lisibilité)."
    ]
  },

  "color_system": {
    "note": "On respecte l’esthétique néon RGB/glass existante. On évite les gradients saturés sur zones de lecture (règle 20%).",
    "tokens_css_custom_properties": {
      "add_to_index_css_root": {
        "--news-ink": "rgba(247, 250, 255, 0.92)",
        "--news-muted": "rgba(226, 232, 240, 0.72)",
        "--news-glass": "rgba(10, 14, 24, 0.52)",
        "--news-glass-strong": "rgba(10, 14, 24, 0.68)",
        "--news-stroke": "rgba(255, 255, 255, 0.14)",
        "--news-stroke-strong": "rgba(255, 255, 255, 0.22)",
        "--news-success": "#34d399",
        "--news-warning": "#fde047",
        "--news-danger": "#fb7185",
        "--news-info": "#38bdf8"
      }
    },
    "semantic": {
      "bg": "var(--theme-bg)",
      "surface": "var(--theme-card)",
      "surface_2": "var(--theme-card-2)",
      "text": "var(--theme-fg-on-bg)",
      "text_muted": "var(--theme-muted)",
      "border": "var(--theme-border-soft)",
      "ring": "var(--theme-ring)",
      "accent_a": "var(--theme-neon-a)",
      "accent_b": "var(--theme-neon-b)",
      "accent_c": "var(--theme-neon-c)"
    },
    "badges": {
      "breaking": "bg-white/10 border-white/20 text-white",
      "tendance": "bg-white/10 border-white/20 text-white + neon-rgb-text-mini",
      "sorties": "bg-white/10 border-white/20 text-white + text-glow-cyan"
    }
  },

  "grid_and_spacing": {
    "container": {
      "max_width": "max-w-7xl",
      "padding": "px-4 sm:px-6 lg:px-8",
      "vertical_rhythm": "py-8 md:py-12"
    },
    "layout": {
      "desktop": "12-col grid: main (8) + rail (4)",
      "tablet": "main (12) + rail (12) en dessous",
      "mobile": "stack + rails horizontaux scrollables"
    },
    "spacing_rules": [
      "Utiliser 2–3x plus d’espace que ‘confortable’: gap-6 md:gap-8.",
      "Cards: p-4 md:p-5; sections: mt-10 md:mt-14.",
      "Toujours séparer les blocs éditoriaux par un Separator discret."
    ]
  },

  "components": {
    "component_path": {
      "shadcn_primary": [
        "/app/frontend/src/components/ui/card.tsx",
        "/app/frontend/src/components/ui/carousel.tsx",
        "/app/frontend/src/components/ui/tabs.tsx",
        "/app/frontend/src/components/ui/badge.tsx",
        "/app/frontend/src/components/ui/button.tsx",
        "/app/frontend/src/components/ui/input.tsx",
        "/app/frontend/src/components/ui/select.tsx",
        "/app/frontend/src/components/ui/scroll-area.tsx",
        "/app/frontend/src/components/ui/skeleton.tsx",
        "/app/frontend/src/components/ui/tooltip.tsx",
        "/app/frontend/src/components/ui/hover-card.tsx",
        "/app/frontend/src/components/ui/calendar.tsx",
        "/app/frontend/src/components/ui/dialog.tsx",
        "/app/frontend/src/components/ui/pagination.tsx",
        "/app/frontend/src/components/ui/sonner.tsx"
      ],
      "custom_components_to_create_js": [
        "frontend/src/components/news/NewsHero.js",
        "frontend/src/components/news/LiveTicker.js",
        "frontend/src/components/news/NewsBentoGrid.js",
        "frontend/src/components/news/NewsRailCarousel.js",
        "frontend/src/components/news/NewsFiltersBar.js",
        "frontend/src/components/news/SourceRadarWidget.js",
        "frontend/src/components/news/ReleaseCalendarWidget.js",
        "frontend/src/components/news/TrendingWidget.js",
        "frontend/src/components/news/ArticleCard.js",
        "frontend/src/components/news/ArticleDetailShell.js"
      ]
    },
    "design_patterns": {
      "card_shell": {
        "base_class": "theme-panel-surface rounded-3xl",
        "premium_border": "rgb-neon",
        "hover": "hover-lift border-beam",
        "notes": "Utiliser rgb-neon uniquement sur cartes ‘premium’ (cover story, carrousels). Les cartes de lecture restent en theme-panel-surface pour lisibilité."
      },
      "buttons": {
        "primary": "btn-neon-rainbow (grand CTA uniquement)",
        "secondary": "theme-action-button",
        "ghost": "bg-transparent hover:bg-white/5 border border-white/10"
      },
      "inputs": {
        "search": "rgb-pill + Input shadcn (theme-search-input)",
        "filters": "Select shadcn + chips (theme-chip)"
      }
    },
    "data_testid_rules": {
      "convention": "kebab-case, basé sur le rôle",
      "examples": [
        "data-testid=\"news-search-input\"",
        "data-testid=\"news-filters-apply-button\"",
        "data-testid=\"news-sort-select\"",
        "data-testid=\"news-hero-primary-article\"",
        "data-testid=\"news-rail-anime-carousel\"",
        "data-testid=\"article-card-open-button\"",
        "data-testid=\"article-detail-source-link\""
      ]
    }
  },

  "page_blueprints": {
    "actualites_listing": {
      "hero": {
        "layout": "Left: cover story (image + title + meta + CTA). Right: 2 stacked secondary stories.",
        "classes": {
          "wrapper": "relative overflow-hidden rounded-[2rem] theme-orb-panel",
          "overlay": "absolute inset-0 bg-black/35",
          "content": "relative grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 md:p-8"
        },
        "micro_interactions": [
          "Auto-rotate top story toutes les 8–10s (pause hover/focus)",
          "Scanline refresh-pulse quand nouvelles données arrivent",
          "CTA shimmer-btn + btn-interactive"
        ]
      },
      "filters_bar": {
        "layout": "Sticky sous le hero (desktop), scroll horizontal sur mobile.",
        "elements": [
          "Search input",
          "Tabs thèmes",
          "Select tri",
          "Date range (Popover + Calendar)",
          "Source multi-select (Command/Select)"
        ],
        "classes": {
          "bar": "sticky top-0 z-30 backdrop-blur-xl bg-black/20 border-b border-white/10",
          "inner": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-3 items-center overflow-x-auto scrollbar-none"
        }
      },
      "live_ticker": {
        "layout": "Marquee (2 tracks) : ‘Dernières’ + ‘Tendance’",
        "classes": {
          "viewport": "marquee-viewport rounded-2xl theme-subpanel p-3",
          "track": "marquee-track gap-3",
          "item": "theme-glass-chip rounded-full px-3 py-2 text-sm"
        },
        "accessibility": "Pause au hover + bouton pause (pour clavier)"
      },
      "bento_grid": {
        "layout": "Bento 12 colonnes: 1 grande carte (6-7 cols), 2 moyennes, 4 petites.",
        "classes": {
          "grid": "grid grid-cols-1 md:grid-cols-12 gap-6",
          "big": "md:col-span-7",
          "mid": "md:col-span-5",
          "small": "md:col-span-4"
        }
      },
      "rails": {
        "themes": ["Anime", "Manga", "Streaming", "Gaming", "Pop-culture JP"],
        "carousel": {
          "component": "shadcn Carousel",
          "classes": {
            "wrapper": "theme-panel-surface rounded-3xl p-4 md:p-5",
            "header": "flex items-end justify-between gap-4",
            "rail": "mt-4",
            "item": "basis-[78%] sm:basis-[46%] lg:basis-[28%]"
          },
          "notes": "Ajouter flèches visibles + pagination dots. Sur mobile: swipe + snap."
        }
      },
      "right_rail_widgets": {
        "widgets": [
          "TrendingWidget (top 10)",
          "ReleaseCalendarWidget (Calendar shadcn)",
          "SourceRadarWidget (sources + statut refresh + latence)"
        ],
        "classes": {
          "rail": "lg:sticky lg:top-24 space-y-6",
          "widget": "theme-subpanel rounded-3xl p-4"
        }
      }
    },

    "article_detail": {
      "layout": "Header hero compact + contenu en colonne + aside (sources/related).",
      "components": [
        "Breadcrumb",
        "Badge (thème)",
        "HoverCard (source info)",
        "Separator",
        "ScrollArea (sommaire si long)",
        "Dialog (partage)"
      ],
      "reading": {
        "max_width": "max-w-3xl",
        "line_height": "leading-7",
        "classes": "theme-panel-surface rounded-3xl p-5 md:p-8"
      }
    }
  },

  "motion_and_microinteractions": {
    "principles": [
      "Motion = feedback, pas décoration",
      "Toujours respecter prefers-reduced-motion",
      "Pas de transition: all"
    ],
    "recommended_library": {
      "name": "framer-motion",
      "why": "Entrées de cartes, hover premium, transitions entre liste et détail (shared layout).",
      "install": "npm i framer-motion",
      "usage_notes_js": [
        "Utiliser motion.div pour ArticleCard",
        "AnimatePresence pour chargements/filtrage",
        "layoutId pour transition carte -> détail"
      ]
    },
    "effects_to_use_existing_css": [
      "hover-lift",
      "border-beam",
      "btn-interactive",
      "shimmer-btn",
      "refresh-pulse",
      "marquee-track / marquee-viewport"
    ],
    "scroll": {
      "parallax": "Hero background image: translateY léger (2–4%) au scroll (optionnel).",
      "sticky": "FiltersBar sticky + Right rail sticky (desktop)."
    }
  },

  "data_and_backend_notes": {
    "sources_priority": {
      "public_apis": [
        {
          "name": "AniList",
          "type": "GraphQL API",
          "use": "tendances, sorties, métadonnées anime/manga",
          "url": "https://anilist.co/"
        },
        {
          "name": "Jikan (MyAnimeList unofficial API)",
          "type": "REST API",
          "use": "métadonnées + saisons",
          "url": "https://jikan.moe/"
        }
      ],
      "rss_editorial": [
        {
          "name": "Anime News Network",
          "type": "RSS",
          "url": "https://www.animenewsnetwork.com/"
        },
        {
          "name": "Crunchyroll News",
          "type": "RSS/News",
          "url": "https://www.crunchyroll.com/news"
        },
        {
          "name": "Polygon (anime/gaming/culture)",
          "type": "RSS",
          "url": "https://www.polygon.com/rss/index.xml"
        },
        {
          "name": "Kotaku (gaming)",
          "type": "RSS",
          "url": "https://kotaku.com/rss"
        }
      ],
      "community_platforms": [
        {
          "name": "Reddit (subreddits anime/manga)",
          "type": "JSON feeds publics",
          "note": "À utiliser avec parcimonie + modération contenu"
        }
      ],
      "notes": [
        "Ne pas scraper des pages bloquées. RSS/API uniquement.",
        "Stocker dans MongoDB: articles normalisés + source + hash pour dédup.",
        "Prévoir refresh scheduler (cron/apscheduler/celery) côté backend.",
        "Toujours afficher la source originale et un lien ‘Voir la source’."
      ]
    },
    "ui_trust_signals": [
      "Afficher ‘Dernière mise à jour’ + statut par source",
      "Badges ‘Source vérifiée’ si RSS/API stable",
      "Déduplication visible (pas de doublons dans rails)"
    ]
  },

  "image_urls": {
    "hero_background_options": [
      {
        "category": "hero",
        "description": "Fond cinématique néon (overlay sombre obligatoire)",
        "url": "https://images.pexels.com/photos/18848570/pexels-photo-18848570.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      },
      {
        "category": "hero",
        "description": "Akihabara anime billboards (premium, très pertinent)",
        "url": "https://images.pexels.com/photos/33249534/pexels-photo-33249534.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      }
    ],
    "section_backgrounds": [
      {
        "category": "section",
        "description": "Night market japonais (pour une section ‘Live / Street’)",
        "url": "https://images.pexels.com/photos/6898432/pexels-photo-6898432.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      }
    ]
  },

  "instructions_to_main_agent": [
    "Refaire /actualites en mode magazine premium: hero éditorial + ticker live + bento + rails thématiques + widgets.",
    "Utiliser les classes existantes (theme-panel-surface, theme-subpanel, rgb-neon, marquee-*) pour cohérence avec Univers Lovanet.",
    "Ne pas inventer du contenu: brancher sur backend ingestion RSS/API (MongoDB) et afficher source/date.",
    "Tous les éléments interactifs et infos clés doivent avoir data-testid (kebab-case).",
    "React en .js (pas .tsx) pour les nouveaux composants.",
    "Ajouter framer-motion pour micro-interactions (optionnel mais recommandé).",
    "Respecter la règle gradients: max 20% viewport, jamais sur zones de lecture, jamais sur petits éléments."
  ],

  "appendix_general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
