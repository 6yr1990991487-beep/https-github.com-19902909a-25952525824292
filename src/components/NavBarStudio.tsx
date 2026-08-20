import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCcw, Search, Shuffle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DEFAULT_NAV_SETTINGS,
  NAV_SKINS,
  type NavBarStyle,
  type NavBtnStyle,
  type NavCarouselStyle,
  type NavNeonStyle,
  type NavSkinSettings,
  readNavSettings,
  saveNavSettings,
} from "@/lib/navSkins";

const BAR_STYLES: { id: NavBarStyle; label: string }[] = [
  { id: "glass", label: "Verre" },
  { id: "frost", label: "Givre" },
  { id: "solid", label: "Plein" },
  { id: "outline", label: "Contour" },
  { id: "holo", label: "Holo" },
];
const NEON_STYLES: { id: NavNeonStyle; label: string }[] = [
  { id: "wave", label: "Vague" },
  { id: "pulse", label: "Pulsé" },
  { id: "chase", label: "Serpentin" },
  { id: "scan", label: "Scanner" },
  { id: "underline", label: "Souligné" },
  { id: "aura", label: "Aura" },
  { id: "none", label: "Aucun" },
];
const BTN_STYLES: { id: NavBtnStyle; label: string }[] = [
  { id: "glass", label: "Verre" },
  { id: "pill", label: "Pilule" },
  { id: "solid", label: "Plein" },
  { id: "outline", label: "Contour" },
  { id: "cut", label: "Biseau" },
  { id: "neon", label: "Néon" },
];
const CAROUSEL_STYLES: { id: NavCarouselStyle; label: string }[] = [
  { id: "glass", label: "Verre" },
  { id: "neon", label: "Néon" },
  { id: "minimal", label: "Minimal" },
  { id: "frame", label: "Cadre" },
  { id: "spotlight", label: "Spot" },
];

const PAGE_SIZE = 40;

function Chips<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-[10px] uppercase tracking-widest text-white/45">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              value === option.id
                ? "border-white/35 bg-white/15 text-white"
                : "border-transparent bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/85",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NavBarStudio() {
  const [settings, setSettings] = useState<NavSkinSettings>(() => readNavSettings());
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "theme" | "creation">("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    saveNavSettings(settings);
  }, [settings]);

  const update = (patch: Partial<NavSkinSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch, enabled: patch.enabled ?? true }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NAV_SKINS.filter(
      (skin) => (kind === "all" || skin.kind === kind) && (!q || skin.label.toLowerCase().includes(q)),
    );
  }, [kind, query]);

  useEffect(() => setLimit(PAGE_SIZE), [kind, query]);

  const applySkin = (id: string) => {
    const skin = NAV_SKINS.find((s) => s.id === id);
    if (!skin) return;
    setSettings((prev) => ({
      ...prev,
      enabled: true,
      skinId: skin.id,
      bar: skin.bar,
      neon: skin.neon,
      btn: skin.btn,
      carousel: skin.carousel,
    }));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="nav-bar-studio">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
          className={cn(
            "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
            settings.enabled
              ? "border-white/35 bg-white/15 text-white"
              : "border-white/15 bg-white/5 text-white/60",
          )}
        >
          {settings.enabled ? "Personnalisation active" : "Personnalisation désactivée"}
        </button>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Aléatoire"
            onClick={() => applySkin(NAV_SKINS[Math.floor(Math.random() * NAV_SKINS.length)].id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Réinitialiser la barre"
            onClick={() => setSettings({ ...DEFAULT_NAV_SETTINGS })}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <Chips title="Style de la barre" options={BAR_STYLES} value={settings.bar} onChange={(v) => update({ bar: v })} />
        <Chips title="Néon animé" options={NEON_STYLES} value={settings.neon} onChange={(v) => update({ neon: v })} />
        <Chips title="Boutons de page" options={BTN_STYLES} value={settings.btn} onChange={(v) => update({ btn: v })} />
        <Chips
          title="Carrousels de défilement"
          options={CAROUSEL_STYLES}
          value={settings.carousel}
          onChange={(v) => update({ carousel: v })}
        />
        <div className="grid grid-cols-2 gap-3 pt-1">
          <label className="text-[10px] uppercase tracking-widest text-white/45">
            Vitesse
            <input
              type="range"
              min={0.4}
              max={2.2}
              step={0.1}
              value={settings.speed}
              onChange={(e) => update({ speed: Number(e.target.value) })}
              className="mt-1 w-full accent-white"
            />
          </label>
          <label className="text-[10px] uppercase tracking-widest text-white/45">
            Intensité
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={settings.intensity}
              onChange={(e) => update({ intensity: Number(e.target.value) })}
              className="mt-1 w-full accent-white"
            />
          </label>
        </div>
      </div>

      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un style de barre (ex. bleu électrique néon)..."
          className="h-9 rounded-xl border border-white/10 bg-white/5 pl-9 text-[12px] text-white placeholder:text-white/30"
        />
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {([
            ["all", "Tous"],
            ["theme", "Thèmes"],
            ["creation", "Créations néon"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                kind === id ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-white/40">{filtered.length} styles</span>
      </div>

      <ScrollArea className="h-[38vh] pr-3 md:h-[calc(100vh-30rem)]">
        <div className="grid grid-cols-2 gap-2 pb-4">
          {filtered.slice(0, limit).map((skin) => {
            const active = settings.skinId === skin.id && settings.enabled;
            return (
              <button
                key={skin.id}
                type="button"
                onClick={() => applySkin(skin.id)}
                className={cn(
                  "group overflow-hidden rounded-xl border p-2 text-left transition-all",
                  active ? "border-white/40 bg-white/10" : "border-white/8 bg-white/[0.02] hover:border-white/25",
                )}
              >
                <div
                  className="mb-2 flex h-9 items-center gap-1.5 rounded-lg px-2"
                  style={{
                    background: `linear-gradient(115deg, ${skin.accent}33, ${skin.accent2}22 55%, ${skin.accent3}33)`,
                    boxShadow: `inset 0 0 0 1px ${skin.accent}66, 0 0 16px -6px ${skin.accent2}`,
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: skin.accent }} />
                  <span className="h-1.5 flex-1 rounded" style={{ background: `${skin.accent2}88` }} />
                  <span className="h-1.5 w-4 rounded" style={{ background: skin.accent3 }} />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="line-clamp-1 text-[11px] font-semibold text-white">{skin.label}</span>
                  {active && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                </div>
                <span className="text-[9px] uppercase tracking-widest text-white/40">
                  {skin.kind === "creation" ? "Création" : "Thème"} · {skin.neon}
                </span>
              </button>
            );
          })}
        </div>
        {limit < filtered.length && (
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE_SIZE * 2)}
            className="mb-4 w-full rounded-xl border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-white/80 hover:bg-white/10"
          >
            Afficher plus ({filtered.length - limit} restants)
          </button>
        )}
      </ScrollArea>
    </div>
  );
}
