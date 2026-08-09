import { useState } from "react";
import { Globe, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGS: Array<{ code: string; label: string; flag: string }> = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export type TranslateCardButtonProps = {
  onTranslate: (targetLang: string) => Promise<void> | void;
  onClear?: () => void;
  activeLang?: string | null;
  loading?: boolean;
  compact?: boolean;
  size?: "xs" | "sm";
  className?: string;
  align?: "start" | "end";
};

export function TranslateCardButton({
  onTranslate,
  onClear,
  activeLang,
  loading,
  compact = false,
  size = "sm",
  className,
  align = "end",
}: TranslateCardButtonProps) {
  const [open, setOpen] = useState(false);
  const active = LANGS.find((l) => l.code === activeLang) || null;
  const sizeClasses = size === "xs" ? "h-6 px-2 text-[9px]" : "h-8 px-3 text-[11px]";

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!!loading}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-[0.14em] transition-colors backdrop-blur-md",
          sizeClasses,
          active
            ? "border-fuchsia-300/60 bg-fuchsia-500/25 text-fuchsia-100"
            : "border-white/20 bg-black/40 text-white/85 hover:border-white/50",
          loading && "opacity-70 cursor-wait",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
        {compact ? null : <span>{active ? `${active.flag} ${active.code.toUpperCase()}` : "Traduire"}</span>}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-40 mt-1 max-h-72 w-44 overflow-y-auto rounded-xl border border-white/15 bg-black/92 p-1 shadow-2xl backdrop-blur-xl notranslate",
            align === "end" ? "right-0" : "left-0",
            "top-full",
          )}
          role="menu"
        >
          {active && onClear && (
            <button
              type="button"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[11px] text-white/70 hover:bg-white/10"
            >
              <span>◀</span> Rétablir l'original
            </button>
          )}
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={async () => {
                setOpen(false);
                await onTranslate(lang.code);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[11px]",
                lang.code === activeLang
                  ? "bg-fuchsia-500/25 text-fuchsia-100"
                  : "text-white/85 hover:bg-white/10",
              )}
            >
              <span className="text-sm leading-none">{lang.flag}</span>
              <span className="flex-1">{lang.label}</span>
              {lang.code === activeLang && <Check className="h-3 w-3 text-fuchsia-200" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
