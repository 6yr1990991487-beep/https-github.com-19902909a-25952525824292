{
  "project": {
    "name": "Lovanet.fr replica (anime/manga shop + media portal)",
    "goal": "Reproduire à l’identique l’UI/UX et les comportements visibles du site live + compléter via le backup. Priorité: fidélité (layout, assets, redirections, overlays, bulles flottantes, mega-menu, cart drawer, sections vidéo).",
    "non_goals": [
      "Rebranding ou refonte créative (sauf si un élément manque et doit être reconstruit à l’identique)",
      "Changer la palette vers un style ‘safe’ corporate"
    ]
  },
  "brand_attributes": [
    "dark neon anime aesthetic",
    "futuristic / arcade",
    "glassmorphism overlays",
    "high-energy but readable",
    "content-first (catalog + videos)",
    "ecommerce-lite (cart drawer, product cards)"
  ],
  "critical_constraints": {
    "stack": ["React (JS files)", "Tailwind", "shadcn/ui (src/components/ui)", "FastAPI (/api)", "MongoDB"],
    "replica_rule": "If backup contains usable markup/assets, match it first; otherwise crawl live site and mirror. Do not invent new branding.",
    "testing_rule": "All interactive + key informational elements MUST include data-testid (kebab-case, role-based).",
    "gradient_restriction": "Follow the GRADIENT RESTRICTION RULE appended at end of this file. Note: original site uses neon; keep neon mostly as glows/accents and small decorative gradients, not large saturated gradients.",
    "fonts": "Orbitron for headings/nav + Inter (or similar) for body."
  },
  "typography": {
    "font_pairing": {
      "display": {
        "name": "Orbitron",
        "usage": ["site logo wordmark", "primary nav", "hero H1", "section titles", "price emphasis"],
        "css": "font-family: 'Orbitron', system-ui, sans-serif;"
      },
      "body": {
        "name": "Inter",
        "usage": ["body", "product descriptions", "forms", "legal"],
        "css": "font-family: 'Inter', system-ui, sans-serif;"
      }
    },
    "scale_tailwind": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-medium text-white/80",
      "h3": "text-xl sm:text-2xl font-semibold",
      "body": "text-sm sm:text-base leading-relaxed text-white/80",
      "small": "text-xs text-white/60",
      "nav": "text-sm font-semibold tracking-wide uppercase"
    },
    "letter_spacing": {
      "orbitron": "tracking-[0.06em]",
      "inter": "tracking-normal"
    }
  },
  "color_system": {
    "mode": "dark-first",
    "notes": [
      "Le site original est dark neon. Utiliser des fonds quasi-noirs + surfaces verre + accents néon (cyan/magenta/violet) sous forme de glow/border, pas en gros gradients.",
      "Éviter les gradients saturés couvrant de grandes zones. Préférer: solid dark + glow + petites aurora blobs derrière.",
      "Ne jamais mettre du texte sombre sur fond transparent."
    ],
    "tokens_hsl_for_shadcn": {
      "root_dark": {
        "--background": "222 35% 6%",
        "--foreground": "0 0% 98%",
        "--card": "222 35% 8%",
        "--card-foreground": "0 0% 98%",
        "--popover": "222 35% 8%",
        "--popover-foreground": "0 0% 98%",
        "--primary": "190 95% 55%",
        "--primary-foreground": "222 35% 8%",
        "--secondary": "222 25% 14%",
        "--secondary-foreground": "0 0% 98%",
        "--muted": "222 20% 16%",
        "--muted-foreground": "0 0% 70%",
        "--accent": "292 92% 70%",
        "--accent-foreground": "222 35% 8%",
        "--destructive": "0 72% 52%",
        "--destructive-foreground": "0 0% 98%",
        "--border": "0 0% 100%",
        "--input": "0 0% 100%",
        "--ring": "190 95% 55%",
        "--radius": "0.9rem"
      },
      "extra_css_vars": {
        "--surface-glass": "rgba(255,255,255,0.06)",
        "--surface-glass-strong": "rgba(255,255,255,0.10)",
        "--stroke-glass": "rgba(255,255,255,0.14)",
        "--stroke-glass-strong": "rgba(255,255,255,0.22)",
        "--shadow-elev": "0 18px 60px rgba(0,0,0,0.55)",
        "--shadow-glow-cyan": "0 0 0 1px rgba(34,211,238,0.22), 0 0 28px rgba(34,211,238,0.18)",
        "--shadow-glow-magenta": "0 0 0 1px rgba(232,121,249,0.18), 0 0 28px rgba(232,121,249,0.14)",
        "--noise-opacity": "0.06"
      }
    },
    "hex_palette_reference": {
      "bg": "#070A12",
      "bg_2": "#0B1020",
      "glass": "rgba(255,255,255,0.06)",
      "stroke": "rgba(255,255,255,0.14)",
      "text": "#F5F7FF",
      "text_muted": "rgba(245,247,255,0.72)",
      "cyan": "#22D3EE",
      "magenta": "#E879F9",
      "violet": "#A78BFA",
      "lime_accent": "#A3FF12"
    }
  },
  "layout_and_grid": {
    "global": {
      "container": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      "section_spacing": "py-10 sm:py-14 lg:py-18",
      "stack_spacing": "space-y-6 sm:space-y-8",
      "avoid_centered_app": "Do not center-align the whole app; keep left-aligned reading flow."
    },
    "header": {
      "type": "fixed header with glass bar",
      "classes": "fixed top-0 inset-x-0 z-50",
      "inner": "h-16 sm:h-[72px]",
      "backdrop": "bg-[rgba(7,10,18,0.55)] backdrop-blur-xl border-b border-white/10"
    },
    "page_shell": {
      "top_padding": "pt-16 sm:pt-[72px]",
      "background": "dark base + aurora blobs + subtle noise overlay"
    }
  },
  "components": {
    "component_path": {
      "navigation": [
        "/app/frontend/src/components/ui/navigation-menu.jsx",
        "/app/frontend/src/components/ui/menubar.jsx",
        "/app/frontend/src/components/ui/dropdown-menu.jsx"
      ],
      "overlays": [
        "/app/frontend/src/components/ui/dialog.jsx",
        "/app/frontend/src/components/ui/sheet.jsx",
        "/app/frontend/src/components/ui/drawer.jsx",
        "/app/frontend/src/components/ui/alert-dialog.jsx"
      ],
      "cards": [
        "/app/frontend/src/components/ui/card.jsx",
        "/app/frontend/src/components/ui/badge.jsx",
        "/app/frontend/src/components/ui/hover-card.jsx"
      ],
      "forms": [
        "/app/frontend/src/components/ui/form.jsx",
        "/app/frontend/src/components/ui/input.jsx",
        "/app/frontend/src/components/ui/textarea.jsx",
        "/app/frontend/src/components/ui/checkbox.jsx",
        "/app/frontend/src/components/ui/label.jsx",
        "/app/frontend/src/components/ui/button.jsx"
      ],
      "commerce": [
        "/app/frontend/src/components/ui/sheet.jsx (cart drawer)",
        "/app/frontend/src/components/ui/table.jsx (cart lines on desktop)",
        "/app/frontend/src/components/ui/separator.jsx",
        "/app/frontend/src/components/ui/progress.jsx (free shipping / checkout steps)"
      ],
      "media": [
        "/app/frontend/src/components/ui/aspect-ratio.jsx",
        "/app/frontend/src/components/ui/tabs.jsx",
        "/app/frontend/src/components/ui/carousel.jsx"
      ],
      "feedback": [
        "/app/frontend/src/components/ui/sonner.jsx (toasts)",
        "/app/frontend/src/components/ui/skeleton.jsx",
        "/app/frontend/src/components/ui/tooltip.jsx"
      ],
      "data_display": [
        "/app/frontend/src/components/ui/pagination.jsx",
        "/app/frontend/src/components/ui/breadcrumb.jsx",
        "/app/frontend/src/components/ui/scroll-area.jsx"
      ]
    },
    "design_patterns": {
      "glass_panel": {
        "use_for": ["mega menu panel", "cart drawer", "video overlay panels", "product quick view"],
        "tailwind": "bg-white/[0.06] border border-white/15 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-elev)]"
      },
      "neon_border": {
        "use_for": ["active nav item", "primary CTA", "selected filter chip"],
        "tailwind": "ring-1 ring-cyan-300/30 shadow-[var(--shadow-glow-cyan)]"
      },
      "chip": {
        "tailwind": "inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/80"
      },
      "product_card": {
        "layout": "image top (aspect ratio), title + price row, quick actions",
        "hover": "lift + glow + image zoom",
        "tailwind": "group relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md"
      }
    }
  },
  "page_blueprints": {
    "routes": {
      "home": "/",
      "shop": "/shop",
      "decouvrir": "/decouvrir",
      "lecteurs_video": "/lecteurs-video",
      "chaine_youtube": "/chaine-youtube",
      "youtube_manga": "/chaine-youtube/manga",
      "prime_video": "/prime-video",
      "tiktok": "/tiktok",
      "anime_countdown": "/anime-countdown",
      "anime_catalog": "/anime-catalog",
      "contact": "/contact",
      "legals": "/legals",
      "languages": ["/en", "/es", "/de", "/it", "/pt", "/ja", "/zh"],
      "aliases_redirects": ["/youtube", "/prime", "/amazon-prime", "/catalogue", "/anime", "/animemoments"]
    },
    "home": {
      "hero": {
        "structure": [
          "Left: H1 + subheading + 2 CTAs (Shop / Watch)",
          "Right: featured video embed or carousel of featured items",
          "Background: aurora blobs + floating orbs"
        ],
        "cta": {
          "primary": "Boutique",
          "secondary": "Regarder",
          "data_testids": ["home-hero-primary-cta", "home-hero-secondary-cta"]
        }
      },
      "sections": [
        "Featured products (carousel)",
        "Latest videos (tabs: YouTube / TikTok / Prime)",
        "Anime à venir (countdown teaser)",
        "Newsletter/CTA strip (small, glass)"
      ]
    },
    "shop": {
      "layout": "Left filters (desktop) / filter sheet (mobile) + product grid",
      "grid": "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6",
      "cart_entry": "Add-to-cart triggers cart drawer overlay",
      "data_testids": [
        "shop-filter-open-button",
        "shop-search-input",
        "shop-product-grid",
        "cart-drawer-open-button"
      ]
    },
    "video_pages": {
      "common": {
        "player": "Use AspectRatio + responsive embeds",
        "layout": "Tabs for categories + grid of video cards",
        "video_card": "thumbnail + platform badge + title"
      }
    },
    "anime_countdown": {
      "hero": "Countdown module with glass panel + neon ring",
      "calendar": "Use shadcn Calendar for date selection if needed",
      "data_testids": ["anime-countdown-timer", "anime-countdown-select-anime"]
    },
    "contact": {
      "form": "shadcn Form + Input/Textarea + validation + Sonner toast",
      "data_testids": ["contact-form", "contact-form-submit-button"]
    },
    "legals": {
      "layout": "Readable long-form: max-w-3xl, high line-height, solid background (no gradients)",
      "data_testids": ["legals-page"]
    }
  },
  "motion_and_microinteractions": {
    "library": {
      "recommended": "framer-motion",
      "install": "npm i framer-motion",
      "usage_notes": [
        "Use for entrance (fade/slide), hover lift, orb drift animations.",
        "Respect prefers-reduced-motion: reduce durations and disable continuous drift."
      ]
    },
    "principles": [
      "No universal transition: never transition: all",
      "Hover: cards lift (translate-y-[-2px]) + glow intensifies",
      "Buttons: press scale 0.98, focus ring visible",
      "Mega-menu: open with opacity + slight y translate",
      "Cart drawer: slide-in from right with backdrop fade",
      "Floating orbs: slow drift (20–40s) behind content"
    ],
    "tailwind_snippets": {
      "card_hover": "transition-[box-shadow,transform,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5",
      "button_press": "active:scale-[0.98] transition-[transform,background-color,border-color,box-shadow] duration-150",
      "menu_open": "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
      "drawer_open": "data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
    }
  },
  "visual_effects": {
    "floating_orbs_bubbles": {
      "goal": "Recréer les bulles flottantes / orbs derrière les sections (hero, header, mega-menu backdrop).",
      "implementation": {
        "css_only": {
          "approach": "Absolute positioned divs with radial-gradient backgrounds + blur + keyframe drift.",
          "example_classes": [
            "pointer-events-none absolute -z-10 blur-3xl opacity-60",
            "bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.35),transparent_60%)]"
          ]
        },
        "framer_motion": {
          "approach": "motion.div with animate x/y arrays + long duration + repeat Infinity",
          "note": "Disable or reduce for prefers-reduced-motion"
        }
      }
    },
    "noise_overlay": {
      "goal": "Subtle grain to avoid flat dark areas.",
      "implementation": "Add a fixed pseudo-element overlay using a tiny noise png/svg or CSS repeating-radial trick; opacity var(--noise-opacity)."
    },
    "glow": {
      "rule": "Use glow as shadow/border, not as huge gradients.",
      "examples": [
        "shadow-[0_0_0_1px_rgba(34,211,238,0.22),0_0_28px_rgba(34,211,238,0.18)]",
        "shadow-[0_0_0_1px_rgba(232,121,249,0.18),0_0_28px_rgba(232,121,249,0.14)]"
      ]
    }
  },
  "accessibility": {
    "contrast": [
      "Text on glass panels must be white/near-white (text-white/80+)",
      "Avoid thin light-gray text on glass; use at least text-white/70",
      "Focus states: always visible ring (ring-2 ring-cyan-300/40)"
    ],
    "keyboard": [
      "Mega-menu and cart drawer must trap focus (shadcn Dialog/Sheet handles this)",
      "Escape closes overlays",
      "Tab order: header -> content -> footer"
    ],
    "reduced_motion": [
      "Disable continuous orb drift",
      "Reduce entrance animation durations"
    ]
  },
  "data_testid_conventions": {
    "format": "kebab-case",
    "examples": [
      "header-mega-menu-trigger",
      "header-cart-open-button",
      "cart-drawer-checkout-button",
      "shop-product-card-add-button",
      "video-tabs-youtube-trigger",
      "contact-form-submit-button"
    ],
    "coverage": "Buttons, links, inputs, menus, drawers, dialogs, pagination, key info (prices, totals, countdown)."
  },
  "assets_and_images": {
    "image_urls": {
      "policy": "Prefer mirrored assets from /public/assets and /public/products extracted from backup/live. Do not introduce new stock imagery unless missing.",
      "placeholders_if_missing": [
        {
          "category": "background",
          "description": "Abstract dark neon aurora/orbs background (temporary until mirrored assets exist)",
          "url": "(MISSING_PROVIDER)"
        }
      ]
    },
    "video_embeds": {
      "sources": ["YouTube", "TikTok", "Prime Video"],
      "rule": "Use responsive AspectRatio; show skeleton while loading; provide external link fallback."
    }
  },
  "libraries": {
    "recommended": [
      {
        "name": "framer-motion",
        "why": "orb drift + entrance animations + hover microinteractions",
        "install": "npm i framer-motion"
      }
    ],
    "optional": [
      {
        "name": "react-player",
        "why": "Unified embeds for YouTube/TikTok (if needed); otherwise use iframe",
        "install": "npm i react-player"
      }
    ]
  },
  "instructions_to_main_agent": [
    "1) Crawl live Lovanet.fr pages + parse backup. Mirror assets into /app/frontend/public/assets and /app/frontend/public/products. Keep original filenames/paths when possible.",
    "2) Replace current default CRA styles: remove centered App-header patterns; rely on Tailwind + tokens in index.css.",
    "3) Update index.css tokens to dark-first values above; set html/body to .dark by default (or add class on root).",
    "4) Build a fixed glass header with NavigationMenu mega-menu + cart Sheet drawer. Ensure data-testid on triggers and links.",
    "5) Implement floating orbs + noise overlay as reusable BackgroundFX component used across pages.",
    "6) Implement routes listed; add redirects/aliases in React Router (Navigate) and backend if needed.",
    "7) Use shadcn components only for interactive primitives (no raw HTML dropdowns/calendars/toasts). Use Sonner for toasts.",
    "8) Ensure accessibility: focus rings, keyboard nav, reduced motion.",
    "9) Keep neon gradients minimal (<=20% viewport) and mostly decorative; prefer solid dark surfaces + glow borders.",
    "10) JS files only (no TSX). Named exports for components; default exports for pages."
  ],
  "appendix_general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
