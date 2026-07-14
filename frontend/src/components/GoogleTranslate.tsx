import { useEffect, useState } from "react";
import { Globe, X } from "lucide-react";

/**
 * Google Translate widget with auto-detection.
 * - Injects the Google Translate JS element (hidden).
 * - Switches language via the `googtrans` cookie + reload.
 * - Detects browser locale on first visit; if not French, offers a translation banner.
 */

const SOURCE_LANG = "fr";
const LANGS: { code: string; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function setGoogTrans(target: string) {
  const value = `/${SOURCE_LANG}/${target}`;
  document.cookie = `googtrans=${value}; path=/`;
  const host = window.location.hostname;
  // Set on parent domain too so it survives across subdomains
  const parts = host.split(".");
  if (parts.length > 1) {
    document.cookie = `googtrans=${value}; path=/; domain=.${parts.slice(-2).join(".")}`;
  }
}
function currentLang(): string {
  const c = getCookie("googtrans");
  if (c) {
    const parts = c.split("/");
    return parts[2] || SOURCE_LANG;
  }
  return SOURCE_LANG;
}

export default function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<string>(SOURCE_LANG);
  const [banner, setBanner] = useState<{ code: string; label: string } | null>(null);

  useEffect(() => {
    // Load Google Translate script once
    if (!document.getElementById("google-translate-script")) {
      (window as any).googleTranslateElementInit = () => {
        try {
          // @ts-ignore
          new google.translate.TranslateElement(
            {
              pageLanguage: SOURCE_LANG,
              includedLanguages: LANGS.map((l) => l.code).join(","),
              autoDisplay: false,
              layout: 0,
            },
            "google_translate_element"
          );
        } catch {}
      };
      const s = document.createElement("script");
      s.id = "google-translate-script";
      s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }

    setLang(currentLang());

    // Auto-detect on first visit
    const dismissed = localStorage.getItem("lovanet.translate.banner.dismissed");
    if (!dismissed && currentLang() === SOURCE_LANG) {
      const nav = (navigator.language || "").toLowerCase();
      const code = nav.split("-")[0];
      if (code && code !== SOURCE_LANG) {
        const match =
          LANGS.find((l) => l.code.toLowerCase() === nav) ||
          LANGS.find((l) => l.code.toLowerCase().startsWith(code));
        if (match) setBanner({ code: match.code, label: match.label });
      }
    }
  }, []);

  const switchTo = (target: string) => {
    if (target === SOURCE_LANG) {
      // Clear cookie
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      const host = window.location.hostname;
      const parts = host.split(".");
      if (parts.length > 1) {
        document.cookie = `googtrans=; path=/; domain=.${parts.slice(-2).join(".")}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    } else {
      setGoogTrans(target);
    }
    window.location.reload();
  };

  const dismissBanner = () => {
    localStorage.setItem("lovanet.translate.banner.dismissed", "1");
    setBanner(null);
  };

  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <>
      {/* Hidden Google element required by the script */}
      <div id="google_translate_element" style={{ position: "absolute", left: -9999, top: -9999 }} />

      {/* Auto-detect banner */}
      {banner && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[92%] rounded-2xl border border-fuchsia-400/40 bg-black/85 backdrop-blur-xl px-4 py-3 shadow-[0_0_30px_rgba(217,70,239,0.35)] flex items-center gap-3 notranslate">
          <Globe className="w-5 h-5 text-fuchsia-300 shrink-0" />
          <span className="text-sm text-white/90 flex-1">
            Traduire ce site en <strong>{banner.label}</strong> ?
          </span>
          <button
            onClick={() => switchTo(banner.code)}
            className="text-xs px-3 py-1.5 rounded-full bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-semibold"
          >
            Oui
          </button>
          <button
            onClick={dismissBanner}
            className="text-white/50 hover:text-white"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating language switcher */}
      <div className="fixed bottom-4 left-4 z-[55] notranslate">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-white text-xs hover:border-fuchsia-400/60 hover:shadow-[0_0_18px_rgba(217,70,239,0.45)] transition"
          aria-label="Changer la langue"
        >
          <Globe className="w-4 h-4" />
          <span>{active.flag} {active.label}</span>
        </button>
        {open && (
          <div className="absolute bottom-12 left-0 max-h-72 overflow-y-auto w-52 rounded-xl border border-white/15 bg-black/90 backdrop-blur-xl shadow-2xl p-1 notranslate">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => switchTo(l.code)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                  l.code === lang ? "bg-fuchsia-500/25 text-fuchsia-200" : "text-white/85 hover:bg-white/10"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}