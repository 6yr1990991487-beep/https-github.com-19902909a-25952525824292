import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AudioLanguageSwitcherProps {
  activeLang: string;
  onLanguageChange: (lang: string) => void;
  languages?: string[];
  sources?: Record<string, string>;
}

const LANG_NAMES: Record<string, string> = {
  vostfr: "VOSTFR (VO + s-t FR)",
  vf: "Français (VF · doublage)",
  vo: "VO (Japonais)",
  ensub: "English (VO + subs)",
  endub: "English Dub",
};

const LANG_BADGE: Record<string, string> = {
  vostfr: "VOSTFR",
  vf: "VF",
  vo: "VO",
  ensub: "EN SUB",
  endub: "EN DUB",
};

/**
 * Controlled language/version switcher. It always shows the fixed set of
 * versions (Original VOST / VF / English by default) and simply reports the
 * chosen language back to the parent player, which reloads the trailer in the
 * selected language. This guarantees switching always applies to the video.
 */
export function AudioLanguageSwitcher({
  activeLang,
  onLanguageChange,
  languages = ["vostfr", "vf", "vo"],
  sources = {},
}: AudioLanguageSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="glass"
          className="rounded-full text-xs font-semibold px-3 h-8 border-indigo-400/50 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/40"
          data-testid="audio-language-switcher-trigger"
        >
          <Languages className="w-3.5 h-3.5 mr-1.5" />
          Audio: {LANG_NAMES[activeLang] || (activeLang || "").toUpperCase()}
          <span className="ml-1.5 rounded-full bg-indigo-400/30 px-1.5 py-0.5 text-[9px] font-black tracking-wider">
            {LANG_BADGE[activeLang] || (activeLang || "").toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border-white/20 rounded-xl min-w-[220px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            data-testid={`audio-language-option-${lang}`}
            className={`cursor-pointer flex-col items-start gap-0.5 py-2 text-sm font-medium hover:bg-white/10 ${activeLang === lang ? "text-indigo-400" : "text-white/80"}`}
            onClick={() => onLanguageChange(lang)}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span>{LANG_NAMES[lang] || lang.toUpperCase()}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider ${activeLang === lang ? "bg-indigo-500/40 text-indigo-100" : "bg-white/10 text-white/60"}`}>
                {LANG_BADGE[lang] || lang.toUpperCase()}
              </span>
            </div>
            {sources[lang] ? (
              <span className="text-[10px] font-normal text-white/45">{sources[lang]}</span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
