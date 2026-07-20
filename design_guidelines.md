{
  "language": "fr",
  "project": {
    "name": "Lovanet.fr",
    "goal": "Conserver l’esthétique transparente RGB néon existante, tout en priorisant une ThemeBubble ultra-lumineuse avec 500+ options et application globale des thèmes avec contraste automatique robuste.",
    "non_goals": [
      "Ne pas casser l’existant (pages, routes, composants).",
      "Ne pas proposer une refonte complète de palette hors continuité : on enrichit l’esthétique actuelle."
    ]
  },
  "critical_rules": {
    "themebubble_priority": "Priorité absolue : ThemeBubble 500+ options.",
    "off_text_removed": "Le texte/état OFF doit disparaître (pas de libellé OFF).",
    "global_theme_application": "Les thèmes doivent s’appliquer globalement (menus, footer, fonds, overlays, bordures, glow).",
    "auto_contrast": "Contraste automatique pour éviter texte sombre sur fond sombre ou texte blanc sur fond blanc.",
    "root_landing_change": "Retirer la vidéo du bas sur la Root Landing Page (/).",
    "no_tsx_guidance": "Le projet contient des fichiers .js : fournir des consignes d’implémentation en .js (même si les composants shadcn listés sont en .tsx).",
    "testing": "Tous les éléments interactifs et informations clés doivent avoir data-testid en kebab-case."
  },
  "brand_personality": {
    "keywords": [
      "futuriste",
      "premium",
      "immersif",
      "transparent",
      "RGB néon",
      "personnalisable",
      "anime-culture"
    ],
    "visual_metaphors": [
      "verre holographique (glass)",
      "halo lumineux",
      "bordures coniques RGB",
      "bulle flottante (orb)"
    ],
    "do_not": [
      "Ne pas recentrer tout le contenu (éviter App { text-align:center }).",
      "Ne pas utiliser de gradients sombres/saturés type violet/rose sur des zones de lecture.",
      "Ne pas mettre de gradients sur petits éléments (<100px).",
      "Ne pas empiler plusieurs gradients dans le même viewport.",
      "Ne pas utiliser transition: all."
    ]
  },
  "inspiration_refs": {
    "design_patterns": [
      {
        "title": "Glassmorphism (référence technique)",
        "url": "https://superdesign.dev/styles/glassmorphism",
        "takeaways": [
          "Backdrops blur 12–24px",
          "Bords translucides 1px",
          "Opacités par niveaux pour la hiérarchie"
        ]
      },
      {
        "title": "APCA intro (contraste perceptuel)",
        "url": "https://myndex.github.io/apca-introduction/",
        "takeaways": [
          "APCA gère mieux la polarité en dark mode",
          "Cibles Lc recommandées : ~75+ pour texte courant"
        ]
      },
      {
        "title": "WCAG 2.2 contrast minimum (référence réglementaire)",
        "url": "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
        "takeaways": [
          "AA 4.5:1 pour texte normal",
          "3:1 pour texte large"
        ]
      }
    ]
  },
  "typography": {
    "font_pairing": {
      "display": {
        "name": "Orbitron",
        "usage": "Titres, labels techno, chiffres (compteurs, badges).",
        "css_var": "--font-display"
      },
      "body": {
        "name": "Inter",
        "usage": "Texte courant, navigation, descriptions.",
        "css_var": "--font-body"
      }
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-sm md:text-base",
      "small": "text-xs text-muted-foreground"
    },
    "styling_notes": [
      "Limiter les effets glow sur les longs paragraphes : réserver aux titres/badges.",
      "Utiliser .neon-rgb-text-mini ou .neon-rainbow-text pour accents courts (1–4 mots)."
    ]
  },
  "color_system": {
    "strategy": "Système sémantique via CSS variables (HSL/OKLCH si besoin), piloté par ThemeBubble. Les thèmes modifient un set de tokens globaux + un set ‘neon’ (cyan/magenta/purple) + surfaces glass.",
    "base_tokens_existing": {
      "source": "/app/frontend/src/index.css",
      "notes": [
        "Le projet a déjà --neon-cyan/--neon-magenta/--neon-purple et des utilitaires .rgb-neon/.rgb-card/.glass-card.",
        "Conserver ces signatures et les faire dépendre des tokens de thème (ne pas hardcoder partout)."
      ]
    },
    "new_semantic_tokens_to_add": {
      "global": {
        "--theme-bg": "Fond page (derrière tout)",
        "--theme-fg": "Texte principal",
        "--theme-muted": "Texte secondaire",
        "--theme-card": "Surface glass principale",
        "--theme-card-2": "Surface glass élevée",
        "--theme-border": "Bordures",
        "--theme-ring": "Focus ring",
        "--theme-overlay": "Overlays (menus, modals)",
        "--theme-glow": "Glow principal",
        "--theme-glow-2": "Glow secondaire",
        "--theme-neon-a": "Couleur néon A (ex: cyan)",
        "--theme-neon-b": "Couleur néon B (ex: magenta)",
        "--theme-neon-c": "Couleur néon C (ex: purple/blue)"
      },
      "readability": {
        "--theme-fg-on-bg": "Texte calculé automatiquement pour le fond",
        "--theme-fg-on-card": "Texte calculé automatiquement pour les cards",
        "--theme-fg-on-overlay": "Texte calculé automatiquement pour overlays",
        "--theme-link": "Couleur liens (auto-contrast)",
        "--theme-link-hover": "Hover liens"
      }
    },
    "gradient_policy": {
      "restriction": "Respect strict des règles gradients : pas de combos sombres/saturés (violet/rose) sur zones de lecture; gradients max 20% viewport; pas sur petits éléments.",
      "allowed_usage": [
        "Décor de fond (hero uniquement)",
        "Overlays décoratifs très subtils",
        "Jamais sur cartes de contenu textuel"
      ]
    }
  },
  "themebubble_500_options": {
    "ux_goal": "Une bulle flottante ultra brillante (orb) qui ouvre un panneau de sélection de thèmes (500+), avec recherche, filtres, favoris, et aperçu instantané. Aucun état OFF visible.",
    "information_architecture": {
      "bubble": {
        "placement": "bottom-right (mobile: 16px du bord; desktop: 24px)",
        "size": "56px mobile / 64px desktop",
        "behavior": [
          "Tap/click: ouvre un Drawer/Sheet",
          "Long-press (mobile) ou right-click: ouvre un mini menu (favoris, random, reset)",
          "Drag optionnel (si déjà existant) avec snap-to-edge"
        ]
      },
      "panel": {
        "component": "shadcn Sheet (right) sur desktop, Drawer (bottom) sur mobile",
        "sections": [
          "Search",
          "Tabs: Tous / Favoris / Récents",
          "Filtres: ambiance (dark, light, neon, pastel, mono), intensité glow, contraste",
          "Grid de swatches (bento) avec preview",
          "Détails thème (tokens) + bouton appliquer"
        ]
      }
    },
    "visual_spec": {
      "bubble_surface": "Glass + conic RGB border + halo blur (plus intense que .rgb-neon).",
      "bubble_glow": {
        "default": "0 0 18px hsl(var(--theme-neon-a) / 0.35), 0 0 42px hsl(var(--theme-neon-b) / 0.22)",
        "hover": "0 0 26px hsl(var(--theme-neon-a) / 0.55), 0 0 70px hsl(var(--theme-neon-b) / 0.35)",
        "active": "scale 0.98 + glow resserré"
      },
      "no_off_label": "Ne jamais afficher OFF. Si désactivation nécessaire, utiliser ‘Réinitialiser’ dans le panneau."
    },
    "performance_strategy": {
      "theme_catalog": [
        "Stocker 500+ thèmes en JSON (id, name, tags, tokens).",
        "Virtualiser la grille (react-window) si nécessaire.",
        "Pré-calculer des champs (ex: luminance approximative) pour filtrage rapide.",
        "Appliquer le thème via CSS variables sur :root ou body (pas de rerender massif)."
      ],
      "animation_budget": [
        "Respect prefers-reduced-motion.",
        "Limiter les animations lourdes (blur/filters) sur mobile : réduire intensité via media queries pointer:coarse.",
        "Ne pas animer 10 éléments simultanément dans le viewport."
      ]
    },
    "auto_contrast_engine": {
      "approach": "Double stratégie : WCAG2 ratio (conformité) + APCA (perception). Ajuster automatiquement les tokens de texte (fg) et liens selon bg/card/overlay.",
      "js_scaffold": {
        "file_suggestion": "/app/frontend/src/lib/theme/contrast.js",
        "functions": [
          "hexToRgb",
          "srgbToLinear",
          "relativeLuminance",
          "wcagContrastRatio",
          "pickReadableTextColor (noir/blanc ou near-white/near-black)",
          "applyThemeTokens(theme)"
        ],
        "policy": [
          "Texte normal: viser ratio >= 4.5:1 (WCAG2).",
          "Texte large: ratio >= 3:1.",
          "Si échec: ajuster fg vers near-white (#F7FAFF) ou near-black (#0B0F1A) + augmenter opacité surface glass.",
          "Pour overlays: forcer un fond overlay plus opaque (ex: 0.72) si contraste insuffisant."
        ]
      },
      "css_hook": {
        "mechanism": "ThemeBubble applique data-theme-id + écrit des CSS vars calculées (fg-on-bg, fg-on-card, fg-on-overlay).",
        "example": "document.documentElement.style.setProperty('--theme-fg-on-bg', computedFg)"
      }
    },
    "data_testids": {
      "bubble": "data-testid=\"theme-bubble-button\"",
      "open_panel": "data-testid=\"theme-panel-sheet\"",
      "search": "data-testid=\"theme-search-input\"",
      "tab_all": "data-testid=\"theme-tab-all\"",
      "tab_favorites": "data-testid=\"theme-tab-favorites\"",
      "theme_card": "data-testid=\"theme-swatch-card-{themeId}\"",
      "apply": "data-testid=\"theme-apply-button\"",
      "random": "data-testid=\"theme-random-button\"",
      "reset": "data-testid=\"theme-reset-button\""
    }
  },
  "layout_and_grid": {
    "global_shell": {
      "max_width": "Ne pas utiliser max-width centré globalement sur #root. Préférer un container par section/page.",
      "recommended": {
        "page_container": "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
        "hero": "min-h-[70vh] md:min-h-[78vh]",
        "section_spacing": "py-14 md:py-20",
        "bento_grid": "grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6"
      }
    },
    "root_landing": {
      "structure": [
        "Hero (video autoplay background + overlay glass)",
        "3 CTA cards (Anime Moments / TikTok / Shop)",
        "Section ‘Nouveautés’ (carousel)",
        "Footer transparent"
      ],
      "change_request": "Supprimer la vidéo du bas (ne garder que le hero video background)."
    },
    "anime_moments": {
      "route": "/anime-moments",
      "notes": [
        "Conserver l’ancien home ici.",
        "Assurer compatibilité tokens globaux (cards, filtres, badges)."
      ]
    }
  },
  "components": {
    "primary_library": "shadcn/ui",
    "component_path": {
      "sheet": "/app/frontend/src/components/ui/sheet.tsx",
      "drawer": "/app/frontend/src/components/ui/drawer.tsx",
      "tabs": "/app/frontend/src/components/ui/tabs.tsx",
      "input": "/app/frontend/src/components/ui/input.tsx",
      "button": "/app/frontend/src/components/ui/button.tsx",
      "scroll_area": "/app/frontend/src/components/ui/scroll-area.tsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.tsx",
      "popover": "/app/frontend/src/components/ui/popover.tsx",
      "badge": "/app/frontend/src/components/ui/badge.tsx",
      "card": "/app/frontend/src/components/ui/card.tsx",
      "carousel": "/app/frontend/src/components/ui/carousel.tsx",
      "sonner": "/app/frontend/src/components/ui/sonner.tsx"
    },
    "themebubble_components": {
      "bubble_button": {
        "base": "Button (variant ghost/custom) + classes rgb-neon-round + dial-glow",
        "tailwind_classes": "fixed bottom-4 right-4 md:bottom-6 md:right-6 h-14 w-14 md:h-16 md:w-16 rounded-full rgb-neon rgb-neon-round dial-glow btn-interactive",
        "notes": [
          "Ajouter un pseudo-élément halo (radial) via class utilitaire dédiée.",
          "Ajouter aria-label=\"Thèmes\"."
        ]
      },
      "panel": {
        "desktop": "Sheet side=right",
        "mobile": "Drawer",
        "panel_classes": "glass-card rgb-neon border-0",
        "grid": "grid grid-cols-2 sm:grid-cols-3 gap-3",
        "swatch_card": "rgb-card glass-card hover-lift"
      }
    },
    "navbar_footer": {
      "style": "Transparents glass + bordure RGB fine + liens neon-rgb-text-soft.",
      "nav_link": "nav-3d + focus ring visible",
      "avoid": "Ne pas mettre de fond opaque plein sauf si contraste échoue (fallback auto-contrast)."
    }
  },
  "motion_and_microinteractions": {
    "principles": [
      "Tout élément interactif a un feedback (hover/press/focus).",
      "Animations courtes et premium : 180–320ms.",
      "Respect prefers-reduced-motion : désactiver cycles RGB et parallax."
    ],
    "recommended_effects_existing": {
      "source": "/app/frontend/src/index.css",
      "use": [
        ".btn-interactive (lift + shimmer)",
        ".rgb-neon / .rgb-card (border conic + glow)",
        ".nav-3d (underline gradient)",
        ".halo-spin / .dial-glow (bulle lumineuse)"
      ]
    },
    "theme_apply_feedback": [
      "Au clic ‘Appliquer’: toast Sonner + flash léger (classe .refresh-pulse sur body ou main container 700ms).",
      "Prévisualisation au hover (desktop): appliquer temporairement les tokens (debounce 120ms) puis revert au mouseleave."
    ]
  },
  "accessibility": {
    "contrast": [
      "WCAG 2.2 AA: 4.5:1 texte normal, 3:1 texte large.",
      "APCA (si implémenté): viser Lc ~75+ pour texte courant."
    ],
    "focus": [
      "Toujours un focus ring visible: ring-2 ring-[hsl(var(--theme-ring))] ring-offset-2 ring-offset-[hsl(var(--theme-bg))].",
      "Ne pas supprimer outline sans remplacement."
    ],
    "reduced_motion": [
      "Désactiver animations neon-rgb-cycle, rgb-spin, halo-spin si prefers-reduced-motion.",
      "Éviter parallax sur mobile."
    ],
    "keyboard": [
      "ThemeBubble accessible clavier: Tab -> Enter ouvre panel.",
      "Dans le panel: focus trap (Sheet/Dialog gère)."
    ]
  },
  "seo_notes": {
    "scope": "Le SEO avancé est hors focus immédiat ici, mais la landing doit rester indexable et rapide.",
    "ui_impacts": [
      "Éviter texte important uniquement dans vidéo.",
      "Prévoir fallback poster image pour video background.",
      "Ne pas bloquer le rendu avec animations lourdes."
    ]
  },
  "images_and_media": {
    "image_urls": [
      {
        "category": "root-landing-hero-poster",
        "description": "Poster fallback (si autoplay vidéo bloqué) — visuel anime futuriste abstrait.",
        "url": "https://images.unsplash.com/photo-1520975958225-9e8d8f6f0f2b?auto=format&fit=crop&w=1600&q=80"
      },
      {
        "category": "theme-panel-empty-state",
        "description": "Illustration abstraite (glass/neon) pour état vide recherche.",
        "url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80"
      }
    ],
    "video_guidelines": {
      "hero_background": [
        "Autoplay + muted + loop + playsInline.",
        "Overlay glass pour lisibilité.",
        "Ne pas ajouter une 2e vidéo en bas de page (demande utilisateur)."
      ]
    }
  },
  "instructions_to_main_agent": [
    "1) Supprimer le centrage global actuel: dans /app/frontend/src/App.css, retirer #root { max-width/margin auto/text-align:center } et déplacer la logique de container dans les pages (mobile-first).",
    "2) ThemeBubble: créer une bulle flottante ultra lumineuse (pas de label OFF) qui ouvre un Sheet/Drawer shadcn. Ajouter recherche, tabs, favoris, et grille de 500+ thèmes (virtualisation si besoin).",
    "3) Implémenter un moteur de contraste automatique: calculer fg-on-bg / fg-on-card / fg-on-overlay via WCAG2 (ratio) + option APCA. Ajuster automatiquement opacité des surfaces glass si contraste insuffisant.",
    "4) Appliquer les tokens globalement: navbar, footer, backgrounds, overlays, borders, glow. Éviter hardcode de couleurs dans composants; utiliser CSS vars.",
    "5) Root landing (/): conserver hero vidéo autoplay + overlay, mais retirer la vidéo du bas. Garder l’esthétique transparente RGB néon.",
    "6) Ajouter data-testid sur tous les éléments interactifs et infos clés (ThemeBubble, nav links, CTA, search, apply).",
    "7) Respecter prefers-reduced-motion: désactiver cycles RGB/blur lourds sur mobile et en reduced motion."
  ],
  "appendix_general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
