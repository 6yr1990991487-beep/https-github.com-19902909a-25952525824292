import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

type SyncRow = {
  key: string;
  status: string;
  last_run_at?: string;
  last_success_at?: string;
  last_error?: string | null;
  inserted?: number;
  updated?: number;
  meta?: Record<string, unknown>;
};

export default function SyncDashboard() {
  const [rows, setRows] = useState<SyncRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/admin/sync/status`);
      if (!response.ok) throw new Error(`sync status ${response.status}`);
      const json = await response.json();
      setRows(json.status ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, []);

  const runNow = async (target: "all" | "youtube" | "anilist" | "tiktok" | "prime") => {
    setBusy(target);
    setError(null);
    try {
      const response = await fetch(`${API}/admin/sync/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      if (!response.ok) throw new Error(`manual sync ${response.status}`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const cards = [
    { id: "all" as const, title: "Sync globale 5 min", desc: "Relance YouTube, AniList, TikTok et Prime best-effort" },
    { id: "youtube" as const, title: "YouTube API", desc: "Import officiel @animemomentsAnimeofficiel" },
    { id: "anilist" as const, title: "AniList catalogue", desc: "Cartes anime, miniatures, trailers et genres" },
    { id: "tiktok" as const, title: "TikTok best-effort", desc: "Profil @anime.moments.officiel sans API officielle" },
    { id: "prime" as const, title: "Prime Video best-effort", desc: "Prime n’a pas d’API publique; statut dégradé possible" },
  ];

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8" data-testid="sync-dashboard-page">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Sync Dashboard</h1>
            <p className="text-sm text-muted-foreground">Auto-sync toutes les 5 minutes · YouTube · TikTok · Prime · AniList</p>
          </div>
          <Button data-testid="sync-dashboard-refresh" onClick={refresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </header>

        {error && <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((job) => (
            <div key={job.id} className="rounded-lg border bg-card/60 backdrop-blur p-4 flex flex-col gap-3">
              <div>
                <div className="font-semibold">{job.title}</div>
                <div className="text-xs text-muted-foreground">{job.desc}</div>
              </div>
              <Button data-testid={`sync-run-${job.id}`} onClick={() => runNow(job.id)} disabled={busy === job.id} size="sm" className="self-start">
                <RefreshCw className={`w-4 h-4 mr-2 ${busy === job.id ? "animate-spin" : ""}`} />
                {busy === job.id ? "En cours…" : "Relancer"}
              </Button>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">État des synchronisations</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground"><Clock className="inline w-4 h-4 mr-1" />Aucun état disponible.</p>
          ) : (
            <ul className="space-y-2" data-testid="sync-state-list">
              {rows.map((r) => (
                <li key={r.key} className="flex items-start gap-2 text-sm border rounded-md p-2 bg-card/40">
                  {r.status === "ok" ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> : <XCircle className="w-4 h-4 text-amber-500 mt-0.5" />}
                  <div>
                    <div className="font-medium">{r.key} · {r.status}</div>
                    <div className="text-xs text-muted-foreground">{r.last_run_at || "—"} · +{r.inserted ?? 0} / maj {r.updated ?? 0}</div>
                    {r.last_error && <div className="text-xs mt-1 text-muted-foreground">{r.last_error}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  );
}
