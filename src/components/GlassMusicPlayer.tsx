import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, Upload, Loader2, Music4 } from "lucide-react";
import {
  MUSIC_GENRES,
  fetchGenreTracks,
  fetchCloudTracks,
  uploadCloudTrack,
  makeLocalTrack,
  type MusicTrack,
} from "@/lib/musicLibrary";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { toast } from "@/hooks/use-toast";

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};

export default function GlassMusicPlayer() {
  const isAdmin = useIsAdmin();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const [genre, setGenre] = useState(MUSIC_GENRES[0].id);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [uploading, setUploading] = useState(false);

  const current = tracks[index];

  const load = useCallback(
    async (g: string, p: number, q: string, append: boolean) => {
      setLoading(true);
      try {
        const [remote, cloud] = await Promise.all([
          fetchGenreTracks(g, p, q),
          p === 1 && !q ? fetchCloudTracks() : Promise.resolve([] as MusicTrack[]),
        ]);
        const next = [...cloud, ...remote];
        setTracks((prev) => {
          const base = append ? prev : [];
          const seen = new Set(base.map((t) => t.id));
          return [...base, ...next.filter((t) => !seen.has(t.id))];
        });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    setIndex(0);
    load(genre, 1, search, false);
  }, [genre, load]);

  // Web Audio analyser -> vibration 3D
  useEffect(() => {
    const el = audioRef.current;
    if (!el || analyserRef.current) return;
    try {
      const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const src = ctx.createMediaElementSource(el);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        rafRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(data);
        const canvas = canvasRef.current;
        const energy = data.reduce((a, b) => a + b, 0) / (data.length * 255);
        wrapRef.current?.style.setProperty("--audio-energy", energy.toFixed(3));
        if (!canvas) return;
        const c = canvas.getContext("2d");
        if (!c) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== Math.floor(rect.width * dpr)) {
          canvas.width = Math.floor(rect.width * dpr);
          canvas.height = Math.floor(rect.height * dpr);
        }
        const w = canvas.width;
        const h = canvas.height;
        c.clearRect(0, 0, w, h);
        const bars = data.length;
        const bw = w / bars;
        for (let i = 0; i < bars; i++) {
          const v = data[i] / 255;
          const bh = Math.max(2, v * h);
          const grad = c.createLinearGradient(0, h, 0, h - bh);
          grad.addColorStop(0, "rgba(0,255,157,0.95)");
          grad.addColorStop(1, "rgba(167,139,250,0.85)");
          c.fillStyle = grad;
          c.fillRect(i * bw + bw * 0.15, h - bh, bw * 0.7, bh);
        }
      };
      draw();
    } catch {
      /* analyser indisponible (CORS) : le lecteur reste fonctionnel */
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playIndex = (i: number) => {
    setIndex(i);
    setPlaying(true);
    requestAnimationFrame(() => audioRef.current?.play().catch(() => {}));
  };

  const toggle = () => {
    const el = audioRef.current;
    if (!el || !current) return;
    if (el.paused) {
      el.play().catch(() => {});
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const next = () => {
    if (!tracks.length) return;
    playIndex(shuffle ? Math.floor(Math.random() * tracks.length) : (index + 1) % tracks.length);
  };
  const prev = () => {
    if (!tracks.length) return;
    playIndex((index - 1 + tracks.length) % tracks.length);
  };

  const onVisitorFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const locals = Array.from(files).map(makeLocalTrack);
    setTracks((prev) => [...locals, ...prev]);
    setIndex(0);
    toast({ title: "Ajouté au lecteur", description: `${locals.length} titre(s) en lecture locale.` });
  };

  const onAdminFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) await uploadCloudTrack(f, genre, "Bibliothèque Lovanet");
      toast({ title: "Envoyé", description: "Les titres rejoignent la bibliothèque du site." });
      load(genre, 1, "", false);
    } catch (e: any) {
      toast({ title: "Envoi impossible", description: e?.message ?? "Erreur inconnue", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const pct = useMemo(() => (duration ? (progress / duration) * 100 : 0), [progress, duration]);

  return (
    <div ref={wrapRef} className="glass3d-panel audio-shell rounded-3xl p-5 md:p-6" data-testid="glass-music-player">
      <div className="flex items-center gap-3 mb-4">
        <Music4 className="w-5 h-5 text-[#00ff9d]" />
        <h2 className="text-white font-bold tracking-wide">Lecteur ambiance Lovanet</h2>
      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MUSIC_GENRES.map((g) => (
          <button
            key={g.id}
            onClick={() => setGenre(g.id)}
            data-testid={`music-genre-${g.id}`}
            className={`glass3d-btn px-3 py-1.5 rounded-full text-xs font-semibold text-white ${genre === g.id ? "is-active" : ""}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Visualiseur */}
      <div className="audio-visual rounded-2xl overflow-hidden border border-white/15 bg-black/25 mb-4">
        <canvas ref={canvasRef} className="audio-eq" />
      </div>

      <div className="audio-meta mb-2">
        <strong>{current ? `${current.title} — ${current.artist}` : "Sélectionne un titre"}</strong>
        <span>{fmt(progress)} / {fmt(duration)}</span>
      </div>

      <button
        type="button"
        className="audio-seek mb-4"
        onClick={(e) => {
          const el = audioRef.current;
          if (!el || !duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          el.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
        }}
        aria-label="Position de lecture"
      >
        <span className="audio-seek-fill" style={{ width: `${pct}%` }} />
      </button>

      <div className="audio-controls mb-4">
        <button className="glass3d-btn audio-play" onClick={prev} aria-label="Précédent"><SkipBack className="w-4 h-4" /></button>
        <button className="glass3d-btn is-active audio-play primary" onClick={toggle} aria-label="Lecture" data-testid="music-play">
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button className="glass3d-btn audio-play" onClick={next} aria-label="Suivant"><SkipForward className="w-4 h-4" /></button>
        <button
          className={`glass3d-btn audio-play ${shuffle ? "is-active" : ""}`}
          onClick={() => setShuffle((s) => !s)}
          aria-label="Aléatoire"
        >
          <Shuffle className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <Volume2 className="w-4 h-4 text-white/70" />
          <input
            className="audio-range"
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
          />
        </div>
      </div>

      {/* Recherche + envois */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              load(genre, 1, search, false);
            }
          }}
          placeholder="Rechercher un titre libre de droits…"
          className="glass3d-btn flex-1 min-w-[12rem] rounded-full px-4 py-2 text-sm text-white placeholder:text-white/60 outline-none"
        />
        <label className="glass3d-btn cursor-pointer inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white">
          <Upload className="w-4 h-4" /> Ma musique
          <input type="file" accept="audio/*" multiple hidden onChange={(e) => onVisitorFiles(e.target.files)} />
        </label>
        {isAdmin && (
          <label className="glass3d-btn is-active cursor-pointer inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Publier (admin)
            <input type="file" accept="audio/*" multiple hidden onChange={(e) => onAdminFiles(e.target.files)} />
          </label>
        )}
      </div>

      {/* Playlist */}
      <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/15 bg-black/20 divide-y divide-white/10">
        {tracks.map((t, i) => (
          <button
            key={t.id}
            onClick={() => playIndex(i)}
            className={`w-full text-left px-4 py-2.5 text-sm transition ${
              i === index ? "bg-[#00ff9d]/15 text-white" : "text-white/80 hover:bg-white/10"
            }`}
          >
            <span className="block truncate font-medium">{t.title}</span>
            <span className="block truncate text-xs text-white/55">{t.artist}</span>
          </button>
        ))}
        {!tracks.length && !loading && (
          <div className="px-4 py-6 text-center text-white/60 text-sm">Aucun titre pour ce filtre.</div>
        )}
        {loading && (
          <div className="px-4 py-6 flex items-center justify-center text-white/70 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement du catalogue…
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-center">
        <button
          onClick={() => {
            const p = page + 1;
            setPage(p);
            load(genre, p, search, true);
          }}
          disabled={loading}
          className="glass3d-btn rounded-full px-5 py-2 text-sm text-white disabled:opacity-50"
        >
          Charger plus de titres
        </button>
      </div>

      <audio
        ref={audioRef}
        src={current?.url}
        crossOrigin="anonymous"
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={next}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}
