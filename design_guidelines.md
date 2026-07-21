{
  "design_system_name": "Lovanet Mobile/Tablet Premium Neon Editorial",
  "brand_attributes": [
    "premium",
    "immersif",
    "futuriste anime/manga",
    "lisible sur petits écrans",
    "néon RGB maîtrisé (accents, pas surcharge)",
    "rapide et tactile"
  ],
  "success_actions": [
    "Ouvrir le menu mobile et naviguer en 1-2 taps",
    "Consommer vidéos + carrousels sans jank",
    "Changer le thème via ThemeBubble et appliquer au menu/navigation rapide",
    "Découvrir des previews/captures qui tournent automatiquement sans distraire"
  ],
  "layout_and_grid": {
    "mobile_first_rules": [
      "Touch targets min 44x44 (idéal 48x48) pour boutons/icônes/menu.",
      "Éviter les carrousels trop longs: 3–5 items visibles par rail (le reste via swipe).",
      "Toujours montrer un ‘peek’ (10–20%) de la carte suivante dans les carrousels pour inciter au swipe.",
      "Ne pas empiler vidéo + carrousel + actions sans respiration: intercaler des séparateurs et des titres courts."
    ],
    "container": {
      "max_width": "max-w-[1120px]",
      "page_padding": "px-4 sm:px-6 lg:px-8",
      "section_spacing": "py-10 sm:py-12 lg:py-16",
      "stack_spacing": "space-y-6 sm:space-y-8"
    },
    "tablet_rules": [
      "À partir de md: passer les sections ‘captures + actions’ en 2 colonnes (grid-cols-12).",
      "Vidéos: 7/4 ou 16/9 selon contexte; éviter les hauteurs fixes trop grandes.",
      "Menu mobile devient ‘Sheet’ plein écran sur tablette portrait; sur tablette paysage, préférer un Drawer latéral."
    ],
    "recommended_grids": {
      "news_cards": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5",
      "capture_zone": "grid grid-cols-1 md:grid-cols-12 gap-4",
      "capture_left": "md:col-span-7",
      "capture_right": "md:col-span-5"
    }
  },
  "typography": {
    "font_pairing": {
      "display": {
        "name": "Orbitron",
        "usage": "H1/H2, titres de sections, labels courts (premium sci-fi)",
        "note": "Déjà importé dans index.css"
      },
      "body": {
        "name": "Inter",
        "usage": "texte éditorial, descriptions, métadonnées",
        "note": "Déjà importé dans index.css"
      }
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-medium text-muted-foreground",
      "section_title": "text-xl sm:text-2xl font-semibold",
      "card_title": "text-base font-semibold leading-snug",
      "body": "text-sm sm:text-base leading-relaxed",
      "meta": "text-xs uppercase tracking-[0.14em] text-muted-foreground"
    },
    "copy_rules": [
      "Réduire les mentions marketing longues; préférer des micro-labels (8–14 mots max).",
      "Titres: 1 ligne sur mobile si possible (line-clamp-1), descriptions 2 lignes (line-clamp-2).",
      "Éviter les blocs de texte sur fonds ‘glow’; réserver le néon aux accents (icônes, bordures, CTA)."
    ]
  },
  "color_system": {
    "notes": [
      "Le projet a déjà une base dark + néon (cyan/magenta/purple). Conserver l’esthétique premium RGB, mais limiter les gradients et les zones trop lumineuses sur mobile.",
      "Pour respecter la règle gradients: utiliser les gradients uniquement en décor (hero overlay, halos), jamais sur zones de lecture.",
      "Préférer des surfaces glass (semi-transparentes) + bordures RGB animées existantes (.rgb-neon/.rgb-card)."
    ],
    "design_tokens_css": {
      "path": "/app/frontend/src/index.css",
      "instructions": [
        "Ne pas réécrire tout :root; ajouter des tokens dédiés mobile/tablette + ThemeBubble/NavTheme.",
        "Créer une ‘base couleur’ pour ThemeBubble (HSL) et dériver un thème de navigation rapide (menu)."
      ],
      "tokens_to_add": {
        "--bubble-h": "210",
        "--bubble-s": "92%",
        "--bubble-l": "58%",
        "--bubble-a": "hsl(var(--bubble-h) var(--bubble-s) var(--bubble-l))",
        "--bubble-b": "hsl(calc(var(--bubble-h) + 110) 92% 60%)",
        "--bubble-c": "hsl(calc(var(--bubble-h) + 220) 92% 62%)",
        "--nav-theme-bg": "rgba(10,14,24,0.72)",
        "--nav-theme-border": "rgba(255,255,255,0.18)",
        "--nav-theme-accent": "var(--bubble-a)",
        "--nav-theme-accent-2": "var(--bubble-b)",
        "--nav-theme-accent-3": "var(--bubble-c)"
      }
    },
    "semantic_colors": {
      "bg": "var(--theme-bg)",
      "surface": "var(--theme-card)",
      "surface_2": "var(--theme-card-2)",
      "border_soft": "var(--theme-border-soft)",
      "text": "var(--theme-fg-on-bg)",
      "muted": "var(--theme-muted)",
      "link": "var(--theme-link)",
      "focus_ring": "var(--theme-ring)",
      "accent_rgb": "var(--theme-neon-a) / var(--theme-neon-b) / var(--theme-neon-c)"
    }
  },
  "components": {
    "component_path": {
      "navigation": [
        "/app/frontend/src/components/ui/sheet.tsx",
        "/app/frontend/src/components/ui/drawer.tsx",
        "/app/frontend/src/components/ui/navigation-menu.tsx",
        "/app/frontend/src/components/ui/scroll-area.tsx",
        "/app/frontend/src/components/ui/tabs.tsx",
        "/app/frontend/src/components/ui/separator.tsx",
        "/app/frontend/src/components/ui/button.tsx",
        "/app/frontend/src/components/ui/badge.tsx"
      ],
      "content": [
        "/app/frontend/src/components/ui/card.tsx",
        "/app/frontend/src/components/ui/carousel.tsx",
        "/app/frontend/src/components/ui/aspect-ratio.tsx",
        "/app/frontend/src/components/ui/skeleton.tsx",
        "/app/frontend/src/components/ui/tooltip.tsx"
      ],
      "themebubble": [
        "/app/frontend/src/components/ui/popover.tsx",
        "/app/frontend/src/components/ui/slider.tsx",
        "/app/frontend/src/components/ui/switch.tsx",
        "/app/frontend/src/components/ui/toggle-group.tsx",
        "/app/frontend/src/components/ui/accordion.tsx"
      ],
      "feedback": [
        "/app/frontend/src/components/ui/sonner.tsx",
        "/app/frontend/src/components/ui/progress.tsx"
      ]
    },
    "navbar_mobile": {
      "pattern": "Header compact + bouton menu (Sheet/Drawer) + barre d’actions rapide (icônes) + recherche optionnelle.",
      "sheet_layout": [
        "Top: logo + close",
        "Middle: Navigation principale (liste) + sous-sections en Accordion",
        "Bottom: Quick actions (2 colonnes) + switch thème + liens légaux"
      ],
      "tailwind": {
        "header": "sticky top-0 z-50 backdrop-blur-xl bg-[rgba(10,14,24,0.55)] border-b border-white/10",
        "menu_button": "h-11 w-11 rounded-full rgb-neon rgb-neon-round",
        "nav_item": "flex items-center justify-between rounded-xl px-3 py-3 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-ring)]",
        "quick_actions_grid": "grid grid-cols-2 gap-3"
      },
      "data_testids": {
        "menu_open": "mobile-nav-open-button",
        "menu_close": "mobile-nav-close-button",
        "nav_link": "mobile-nav-link",
        "quick_action": "mobile-nav-quick-action"
      }
    },
    "carousels_and_videos": {
      "carousel_engine": "shadcn/ui Carousel (Embla)",
      "rules": [
        "Sur mobile: hauteur de carte contrôlée (pas de 70vh).",
        "Vidéos: poster image + play overlay; ne pas autoplay par défaut.",
        "Lazy-load images/vidéos via IntersectionObserver; précharger seulement le 1er item du rail.",
        "Ajouter des Skeletons pendant chargement."
      ],
      "card_recipe": {
        "wrapper": "rgb-card glass-card rounded-2xl",
        "media": "rounded-xl overflow-hidden rgb-frame",
        "meta_row": "flex items-center gap-2 text-xs text-muted-foreground",
        "cta": "mt-3 inline-flex items-center justify-center h-11 px-4 rounded-xl btn-neon-rainbow"
      },
      "data_testids": {
        "carousel": "featured-carousel",
        "carousel_next": "carousel-next-button",
        "carousel_prev": "carousel-prev-button",
        "video_card": "video-card",
        "video_play": "video-card-play-button"
      }
    },
    "themebubble": {
      "positioning": {
        "rule": "Décaler du bord gauche: left-4 (mobile) / left-6 (sm+) et bottom-4. Ne jamais coller au bord.",
        "safe_area": "Respecter env(safe-area-inset-*) si iOS (padding-bottom)."
      },
      "structure": [
        "Orb button (toujours visible)",
        "Popover/Panel (tabs): Couleurs | Navigation | Motion",
        "Section Navigation: appliquer le thème dérivé au menu/navigation rapide"
      ],
      "nav_theme_application": {
        "behavior": [
          "Quand l’utilisateur change la couleur de base (bubble-h/s/l), mettre à jour --bubble-*.",
          "Le thème du menu rapide utilise --nav-theme-accent(1/2/3) dérivés.",
          "Ajouter 3 mini previews (chips) montrant: lien actif, badge, bouton."
        ],
        "preview_components": [
          "Badge (active)",
          "Button (primary)",
          "Nav item (active underline)"
        ],
        "tailwind": {
          "orb": "theme-orb-button h-14 w-14 rounded-full",
          "panel": "theme-orb-panel w-[min(92vw,420px)] rounded-3xl p-4",
          "preview_row": "grid grid-cols-3 gap-2",
          "preview_chip": "rounded-xl border border-white/10 bg-white/5 p-2"
        },
        "data_testids": {
          "bubble_toggle": "theme-bubble-toggle",
          "bubble_panel": "theme-bubble-panel",
          "bubble_nav_theme_apply": "theme-bubble-apply-nav-theme-button",
          "bubble_color_slider": "theme-bubble-color-slider"
        }
      }
    },
    "auto_variations_previews": {
      "goal": "Ajouter des petites prévisualisations + contenu à variation automatique dans la zone des captures, sans distraire ni casser les perfs.",
      "pattern": "‘Capture Deck’ = 1 grande carte + 2 mini cartes (stack) + un rail horizontal de mini previews.",
      "variation_rules": [
        "Rotation aléatoire douce toutes les 12–18s (pas 3s).",
        "Changer uniquement: accent border (rgb angle), teinte overlay légère, ordre des mini cartes.",
        "Jamais changer la couleur du texte principal; garder lisibilité.",
        "Respect prefers-reduced-motion: désactiver rotation/animations et garder un état statique."
      ],
      "implementation_hint_js": {
        "state": "useState({ variantIndex, accentHue, layoutSeed })",
        "timer": "setInterval avec jitter (Math.random) + clearInterval on unmount",
        "perf": "Ne pas recalculer tout le DOM: appliquer classes conditionnelles + CSS variables sur wrapper"
      },
      "tailwind": {
        "deck": "grid grid-cols-1 md:grid-cols-12 gap-4",
        "hero_card": "md:col-span-7 theme-panel-surface rounded-3xl p-4",
        "mini_stack": "md:col-span-5 space-y-4",
        "mini_card": "theme-subpanel rounded-2xl p-4"
      },
      "data_testids": {
        "capture_deck": "capture-deck",
        "capture_preview": "capture-preview-card"
      }
    }
  },
  "motion_and_microinteractions": {
    "principles": [
      "Micro-animations partout, mais ‘mobile-safe’: réduire sur pointer:coarse.",
      "Pas de transition universelle (interdit).",
      "Animations: 180–350ms, easing cubic-bezier(.22,1,.36,1)."
    ],
    "recommended": {
      "hover": [
        "Cartes: hover-lift (desktop), sur mobile: état press (scale 0.98).",
        "Boutons: btn-interactive / btn-neon-rainbow (déjà défini)."
      ],
      "scroll": [
        "Entrées de sections: fade+rise léger via Framer Motion (optionnel) ou classes animate-hero-rise.",
        "Carrousels: pas d’autoplay agressif; si autoplay, pause au touch/hover et désactiver sur mobile."
      ]
    },
    "libraries": {
      "framer_motion": {
        "when": "Uniquement pour transitions d’apparition et micro-interactions du menu/bubble.",
        "install": "npm i framer-motion",
        "usage": "motion.div avec initial/animate + reducedMotion via useReducedMotion()"
      }
    }
  },
  "performance": {
    "rules": [
      "Lazy-load médias (images/vidéos) via IntersectionObserver; charger poster d’abord.",
      "Utiliser Skeleton (shadcn) pour éviter layout shift.",
      "Limiter les ombres lourdes sur mobile; préférer border + glow subtil.",
      "Éviter les animations continues multiples dans le même viewport (réduire rgb-spin sur mobile si nécessaire)."
    ],
    "video": [
      "Préférer poster + lecture au tap.",
      "Précharger metadata seulement: <video preload=\"metadata\">.",
      "Désactiver autoplay sur mobile; si besoin, mute + playsInline + user gesture."
    ]
  },
  "accessibility": {
    "rules": [
      "Focus visible: ring-2 ring-[var(--theme-ring)] ring-offset-0.",
      "Contraste: texte principal toujours sur surface sombre stable (pas sur gradient).",
      "Respect prefers-reduced-motion: couper rgb cycles, rotations, marquees.",
      "Aria-label sur icônes (menu, play, close)."
    ]
  },
  "content_cleanup": {
    "remove_or_shorten": [
      "Mentions marketing longues et auto-promo (ex: ‘MAGAZINE PREMIUM… auto-refresh 5 min…’).",
      "Remplacer par: titre court + source + timestamp + tag thématique."
    ],
    "replacement_pattern": {
      "headline": "Titre (max 60 caractères)",
      "meta": "Source · il y a X min",
      "tag": "Badge thématique (1 mot)"
    }
  },
  "image_urls": [
    {
      "category": "hero_background_optional",
      "description": "Fond abstrait premium (à utiliser en overlay léger, opacity 0.12–0.18 max, jamais derrière du texte dense)",
      "url": "https://images.pexels.com/photos/29101878/pexels-photo-29101878.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    },
    {
      "category": "section_texture_optional",
      "description": "Texture métallique ondulée (pour une section vidéo/capture, en décor, blur + opacity faible)",
      "url": "https://images.pexels.com/photos/13577776/pexels-photo-13577776.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    },
    {
      "category": "editorial_tech_optional",
      "description": "Visuel techno (à utiliser comme poster/thumbnail si besoin, sinon éviter pour ne pas casser l’identité anime)",
      "url": "https://images.pexels.com/photos/7562088/pexels-photo-7562088.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    }
  ],
  "instructions_to_main_agent": [
    "Priorité 1: Mobile/tablette — revoir layout des sections (vidéos/carrousels/actions) avec grilles proposées + peek carrousel + tailles contrôlées.",
    "Priorité 2: ThemeBubble — décaler du bord (left-4/bottom-4) + ajouter onglet ‘Navigation’ qui applique un thème dérivé au menu rapide via CSS variables --nav-theme-*.",
    "Priorité 3: Variations automatiques — implémenter un ‘Capture Deck’ avec rotation douce (12–18s) et variations limitées (accent/ordre), respect reduced-motion.",
    "Priorité 4: Nettoyage contenu — supprimer les mentions inutiles; remplacer par pattern éditorial court.",
    "Tous les éléments interactifs et infos clés doivent avoir data-testid (kebab-case).",
    "Le codebase est en .js côté app: écrire les nouveaux composants en .js (pas .tsx). Les composants shadcn existants sont en .tsx mais peuvent être importés depuis des fichiers .js."
  ],
  "append_general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
