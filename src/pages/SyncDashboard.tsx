import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";

type JobRun = {
  jobname: string | null;
  status: string | null;
  start_time: string | null;
  end_time: string | null;
  return_message: string | null;
};

type Counts = { imported_videos: number; youtube_manga_videos: number; imported_videos_backup: number };

// Small admin surface that lets the operator monitor the pg_cron auto-sync
// jobs (last run, status, error) and trigger sync-videos / youtube-anime-sync
// manually without opening the Supabase dashboard.
export default function SyncDashboard() {
  const [runs, setRuns] = useState<JobRun[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [{ count: c1 }, { count: c2 }, { count: c3 }] = await Promise.all([
        supabase.from("imported_videos" as never).select("*", { count: "exact", head: true }),
        supabase.from("youtube_manga_videos" as never).select("*", { count: "exact", head: true }),
        supabase.from("imported_videos_backup" as never).select("*", { count: "exact", head: true }),
      ]);
      setCounts({
        imported_videos: c1 ?? 0,
        youtube_manga_videos: c2 ?? 0,
        imported_videos_backup: c3 ?? 0,
      });
      // Best-effort read of the cron history — the view is restricted, so a
      // failure here just leaves the runs list empty without breaking the UI.
      const { data } = await (supabase as unknown as {
        rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: JobRun[] | null }>;
      }).rpc("get_cron_run_details").catch(() => ({ data: null }));
      if (Array.isArray(data)) setRuns(data);
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

  const runNow = async (fn: "sync-videos" | "youtube-anime-sync") => {
    setBusy(fn);
    setError(null);
    try {
      const { error } = await supabase.functions.invoke(fn, { body: {} });
      if (error) throw error;
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Sync Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Auto-sync anime · AnimeMoments · Animer officiel · manga
            </p>
          </div>
          <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </header>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Vidéos importées", value: counts?.imported_videos },
            { label: "Anime YouTube", value: counts?.youtube_manga_videos },
            { label: "Sauvegardes locales", value: counts?.imported_videos_backup },
          ].map((c) => (
            <div key={c.label} className="rounded-lg border bg-card/60 backdrop-blur p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
              <div className="text-3xl font-bold mt-1">
                {c.value ?? (loading ? "…" : 0)}
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: "sync-videos" as const, title: "sync-videos", desc: "Import YouTube → imported_videos (toutes les 30 min)" },
            { id: "youtube-anime-sync" as const, title: "youtube-anime-sync", desc: "Import anime YouTube → youtube_manga_videos (toutes les 6 h)" },
          ].map((job) => (
            <div key={job.id} className="rounded-lg border bg-card/60 backdrop-blur p-4 flex flex-col gap-3">
              <div>
                <div className="font-semibold">{job.title}</div>
                <div className="text-xs text-muted-foreground">{job.desc}</div>
              </div>
              <Button
                onClick={() => runNow(job.id)}
                disabled={busy === job.id}
                size="sm"
                className="self-start"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${busy === job.id ? "animate-spin" : ""}`} />
                {busy === job.id ? "En cours…" : "Relancer maintenant"}
              </Button>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Derniers passages cron</h2>
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              <Clock className="inline w-4 h-4 mr-1" />
              Aucun historique cron disponible. Les jobs s'exécutent en tâche
              de fond ; les compteurs ci-dessus reflètent l'état réel.
            </p>
          ) : (
            <ul className="space-y-2">
              {runs.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm border rounded-md p-2 bg-card/40">
                  {r.status === "succeeded" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                  )}
                  <div>
                    <div className="font-medium">{r.jobname}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.start_time} → {r.end_time}
                    </div>
                    {r.return_message && (
                      <div className="text-xs mt-1 text-muted-foreground">{r.return_message}</div>
                    )}
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
