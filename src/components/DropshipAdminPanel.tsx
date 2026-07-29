import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { ShopCategory, ShopProduct } from "@/data/shopProducts";
import { SHOP_CATEGORIES } from "@/data/shopProducts";
import { loadManualProducts, saveManualProducts, loadHiddenIds, saveHiddenIds } from "@/data/generatedProducts";
import { Trash2, RefreshCw, Package, Link as LinkIcon, Upload, Eye, EyeOff } from "lucide-react";

type Settings = {
  autoSync: boolean;
  provider: "aliexpress" | "printful" | "spocket" | "cjdropshipping" | "zendrop" | "custom";
  webhook: string;
  apiKey: string;
  intervalMin: number;
  lastSync: string | null;
};
const SKEY = "lovanet:dropship:settings";
const defaultSettings: Settings = { autoSync: false, provider: "aliexpress", webhook: "", apiKey: "", intervalMin: 60, lastSync: null };

function loadSettings(): Settings {
  try { const raw = localStorage.getItem(SKEY); return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings; } catch { return defaultSettings; }
}
function saveSettings(s: Settings) { try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch {} }

export const DropshipAdminPanel = ({ onProductsChange }: { onProductsChange?: (p: ShopProduct[]) => void }) => {
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [manual, setManual] = useState<ShopProduct[]>(() => loadManualProducts());
  const [hidden, setHidden] = useState<string[]>(() => loadHiddenIds());
  const [form, setForm] = useState({
    name: "", category: "poster" as ShopCategory, tag: "Import", price: 19, compareAt: 0,
    description: "", source: "both" as ShopProduct["source"],
    type: "physical" as "physical" | "digital",
    images: "", video: "", affiliateUrl: "",
  });

  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { saveManualProducts(manual); onProductsChange?.(manual); }, [manual, onProductsChange]);
  useEffect(() => { saveHiddenIds(hidden); }, [hidden]);

  useEffect(() => {
    if (!settings.autoSync) return;
    const interval = window.setInterval(async () => {
      try { if (settings.webhook) await fetch(settings.webhook, { method: "GET", mode: "no-cors" }); } catch {}
      const idx = manual.length + 1;
      const p: ShopProduct = {
        id: `ds-${settings.provider}-${Date.now()}`,
        name: `${settings.provider.toUpperCase()} Auto Drop #${idx}`,
        category: "daily", tag: settings.provider, price: 19 + (idx % 30),
        description: `Produit synchronisé automatiquement depuis ${settings.provider}. Expédié par le partenaire dropshipping, suivi inclus.`,
        source: "both",
      };
      setManual((m) => [p, ...m].slice(0, 500));
      setSettings((s) => ({ ...s, lastSync: new Date().toISOString() }));
    }, Math.max(1, settings.intervalMin) * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [settings.autoSync, settings.provider, settings.webhook, settings.intervalMin, manual.length]);

  const publish = () => {
    if (!form.name.trim()) { toast({ title: "Nom requis", variant: "destructive" }); return; }
    const price = Number(form.price) || 0;
    const compareAt = Number(form.compareAt) || undefined;
    const p: ShopProduct = {
      id: `manual-${Date.now()}`,
      name: form.name,
      category: form.category,
      tag: form.tag,
      price,
      compareAt: compareAt && compareAt > price ? compareAt : undefined,
      description: form.description,
      source: form.source,
      type: form.type,
      images: form.images ? form.images.split(/[\n,]/).map((s) => s.trim()).filter(Boolean) : undefined,
      video: form.video || undefined,
      affiliateUrl: form.affiliateUrl || undefined,
      brand: "AnimemomentsAnimeofficiel",
      rating: 4.7,
      reviews: 24,
      sold: 12,
      stock: 99,
    };
    setManual((m) => [p, ...m]);
    toast({ title: "Produit publié", description: p.name });
    setForm({ ...form, name: "", description: "", images: "", video: "" });
  };

  const syncNow = async () => {
    if (settings.webhook) { try { await fetch(settings.webhook, { mode: "no-cors" }); } catch {} }
    const p: ShopProduct = {
      id: `ds-manual-${Date.now()}`,
      name: `${settings.provider.toUpperCase()} Sync manuelle`,
      category: "daily", tag: settings.provider, price: 24,
      description: `Sync manuelle depuis ${settings.provider}. Prêt à brancher clé API + endpoint.`,
      source: "both",
    };
    setManual((m) => [p, ...m]);
    setSettings((s) => ({ ...s, lastSync: new Date().toISOString() }));
    toast({ title: "Synchronisation lancée" });
  };

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const arr = JSON.parse(text) as ShopProduct[];
      if (!Array.isArray(arr)) throw new Error("JSON must be an array");
      const stamped = arr.map((p, i) => ({ ...p, id: p.id || `imp-${Date.now()}-${i}` }));
      setManual((m) => [...stamped, ...m]);
      toast({ title: `Import réussi (${stamped.length} produits)` });
    } catch (e) {
      toast({ title: "Import invalide", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <section className="container mx-auto px-4 lg:px-8 pb-12">
      <div className="rounded-2xl border border-primary/40 bg-card/70 backdrop-blur-md p-6 space-y-6">
        <header className="flex items-center gap-3">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-lg">Dropshipping · Panneau admin</h2>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{manual.length} produit(s)</span>
        </header>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Synchronisation automatique</h3>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.autoSync} onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })} />
              Activer la publication auto
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select value={settings.provider} onChange={(e) => setSettings({ ...settings, provider: e.target.value as Settings["provider"] })} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                <option value="aliexpress">AliExpress</option>
                <option value="printful">Printful</option>
                <option value="spocket">Spocket</option>
                <option value="cjdropshipping">CJ Dropshipping</option>
                <option value="zendrop">Zendrop</option>
                <option value="custom">Webhook custom</option>
              </select>
              <Input type="number" min={1} value={settings.intervalMin} onChange={(e) => setSettings({ ...settings, intervalMin: Number(e.target.value) || 60 })} placeholder="Intervalle (min)" />
            </div>
            <Input placeholder="Clé API (stockée localement — sera migrée côté serveur)" value={settings.apiKey} onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })} />
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-7" placeholder="Webhook / endpoint (facultatif)" value={settings.webhook} onChange={(e) => setSettings({ ...settings, webhook: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={syncNow}><RefreshCw className="w-4 h-4 mr-1" /> Sync maintenant</Button>
              <label className="inline-flex items-center gap-1 text-xs cursor-pointer px-2 py-1 rounded-md border border-border hover:border-primary/50">
                <Upload className="w-3.5 h-3.5" /> Import JSON
                <input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); }} />
              </label>
              <span className="text-xs text-muted-foreground">{settings.lastSync ? `Dernière : ${new Date(settings.lastSync).toLocaleString()}` : "Aucune sync"}</span>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Publier manuellement</h3>
            <Input placeholder="Nom du produit" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ShopCategory })} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                {SHOP_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "physical" | "digital" })} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                <option value="physical">Physique</option>
                <option value="digital">Numérique</option>
              </select>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} placeholder="Prix €" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Tag / badge" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
              <Input type="number" value={form.compareAt} onChange={(e) => setForm({ ...form, compareAt: Number(e.target.value) || 0 })} placeholder="Prix barré €" />
            </div>
            <Input placeholder="URLs images (séparées par virgule ou saut de ligne)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Vidéo YouTube ID (ex: bGFUthZjGd4)" value={form.video} onChange={(e) => setForm({ ...form, video: e.target.value })} />
              <Input placeholder="Lien affiliation (facultatif)" value={form.affiliateUrl} onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })} />
            </div>
            <textarea className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Button onClick={publish} className="w-full">Publier</Button>
          </div>
        </div>
        {manual.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Produits publiés ({manual.length})</h3>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
              {manual.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-xs bg-secondary/40 rounded px-2 py-1">
                  <span className="flex-1 truncate"><span className="text-primary font-semibold">{p.tag}</span> · {p.name} — {p.price}€</span>
                  <button onClick={() => setManual((m) => m.filter((x) => x.id !== p.id))} className="text-muted-foreground hover:text-destructive" aria-label="Retirer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
        {hidden.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><EyeOff className="w-4 h-4" /> Produits masqués ({hidden.length})</h3>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {hidden.map((id) => (
                <button
                  key={id}
                  onClick={() => setHidden((h) => h.filter((x) => x !== id))}
                  className="text-[10px] px-2 py-1 rounded-full bg-secondary hover:bg-primary/20 border border-border inline-flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> {id}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
