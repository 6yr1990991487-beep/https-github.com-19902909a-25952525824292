import { useEffect, useRef, useState } from "react";
import { Youtube, X, Upload, Trash2 } from "lucide-react";
import { loadYTCover, saveYTCover, YT_COVER_DEFAULT, YTCoverConfig } from "./YoutubeBrandCover";

/**
 * Floating settings bubble to customize the YouTube-logo overlay
 * (color, custom logo, position, size, enable/disable).
 */
export default function YoutubeBrandSettings() {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState<YTCoverConfig>(YT_COVER_DEFAULT);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCfg(loadYTCover());
  }, []);

  const update = (patch: Partial<YTCoverConfig>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    saveYTCover(next);
  };

  const onUpload = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => update({ logoUrl: String(reader.result || "") });
    reader.readAsDataURL(f);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-40 z-[55] flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-white text-xs hover:border-red-400/60 hover:shadow-[0_0_18px_rgba(239,68,68,0.45)] transition notranslate"
        aria-label="Personnaliser le logo lecteur"
      >
        <Youtube className="w-4 h-4 text-red-400" />
        <span>Cache logo</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0a16] p-5 space-y-4 notranslate"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Cache lecteur vidéo</h2>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={cfg.enabled}
                onChange={(e) => update({ enabled: e.target.checked })}
              />
              Activer le cache sur les lecteurs
            </label>

            <div>
              <label className="text-xs uppercase tracking-widest text-white/60 block mb-1">
                Couleur
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cfg.color}
                  onChange={(e) => update({ color: e.target.value })}
                  className="w-12 h-9 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={cfg.color}
                  onChange={(e) => update({ color: e.target.value })}
                  className="flex-1 px-2 py-1.5 rounded bg-black/40 border border-white/15 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-white/60 block mb-1">
                Logo personnalisé (optionnel)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs"
                >
                  <Upload className="w-3.5 h-3.5" /> Importer
                </button>
                {cfg.logoUrl && (
                  <>
                    <img
                      src={cfg.logoUrl}
                      alt=""
                      className="h-8 w-16 object-contain rounded bg-white/5 border border-white/10"
                    />
                    <button
                      onClick={() => update({ logoUrl: "" })}
                      className="text-red-300 hover:text-red-200"
                      aria-label="Retirer le logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-white/60 block mb-1">
                Position
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["tl", "tr", "bl", "br"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => update({ position: p })}
                    className={`py-1.5 rounded text-xs border ${
                      cfg.position === p
                        ? "bg-fuchsia-500/30 border-fuchsia-400 text-white"
                        : "bg-black/30 border-white/15 text-white/70 hover:text-white"
                    }`}
                  >
                    {p === "tl" ? "↖" : p === "tr" ? "↗" : p === "bl" ? "↙" : "↘"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-widest text-white/60 block mb-1">
                  Largeur : {cfg.width}px
                </label>
                <input
                  type="range"
                  min={40}
                  max={200}
                  value={cfg.width}
                  onChange={(e) => update({ width: Number(e.target.value) })}
                  className="w-full accent-fuchsia-400"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/60 block mb-1">
                  Hauteur : {cfg.height}px
                </label>
                <input
                  type="range"
                  min={16}
                  max={80}
                  value={cfg.height}
                  onChange={(e) => update({ height: Number(e.target.value) })}
                  className="w-full accent-fuchsia-400"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setCfg(YT_COVER_DEFAULT);
                saveYTCover(YT_COVER_DEFAULT);
              }}
              className="w-full py-2 rounded bg-white/5 hover:bg-white/10 text-white/70 text-xs"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </>
  );
}