import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Trash2, Film, Loader2 } from "lucide-react";
import {
  saveUploadedBanner,
  getUploadedBanners,
  deleteUploadedBanner,
  type UploadedBanner,
} from "@/lib/bannerStore";

export function BannerUploader({ onChange }: { onChange?: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("Vid\u00e9o \u00b7 Ma banni\u00e8re");
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState<UploadedBanner[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => setList(await getUploadedBanners());

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    try {
      await saveUploadedBanner(file, {
        title: title || file.name.replace(/\.[^.]+$/, ""),
        subtitle: subtitle || "Banni\u00e8re personnalis\u00e9e",
        badge: badge || "Vid\u00e9o \u00b7 Ma banni\u00e8re",
      });
      setFile(null);
      setTitle("");
      setSubtitle("");
      if (inputRef.current) inputRef.current.value = "";
      await refresh();
      onChange?.();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteUploadedBanner(id);
    await refresh();
    onChange?.();
  };

  return (
    <>
      <Button
        variant="outline"
        className="rounded-full"
        onClick={() => setOpen(true)}
        data-testid="banner-upload-button"
      >
        <Upload className="w-4 h-4 mr-2" /> T\u00e9l\u00e9verser un clip
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-[#0d1424] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
                <Film className="h-5 w-5 text-primary" /> Banni\u00e8re vid\u00e9o
              </h3>
              <button onClick={() => setOpen(false)} className="text-white/60 transition-colors hover:text-white" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                data-testid="banner-file-input"
                className="block w-full cursor-pointer text-sm text-white/80 file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-primary-foreground hover:file:opacity-90"
              />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la banni\u00e8re"
                data-testid="banner-title-input"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
              />
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Sous-titre"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
              />
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Badge"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
              />
              <Button
                className="w-full rounded-full"
                onClick={handleSave}
                disabled={!file || saving}
                data-testid="banner-save-button"
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement\u2026</>
                ) : (
                  <>Ajouter la banni\u00e8re</>
                )}
              </Button>
              <p className="text-[11px] text-white/40">
                Les clips sont stock\u00e9s dans votre navigateur (hors-ligne, priv\u00e9).
              </p>
            </div>

            {list.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-3">
                <p className="mb-2 text-xs uppercase tracking-wider text-white/50">
                  Vos banni\u00e8res ({list.length})
                </p>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {list.map((b) => (
                    <div key={b.id} className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
                      <video src={b.url} muted className="h-9 w-14 rounded bg-black object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{b.title}</p>
                        <p className="truncate text-[11px] text-white/50">{b.subtitle}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-white/50 transition-colors hover:text-red-400"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default BannerUploader;
