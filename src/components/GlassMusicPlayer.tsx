<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX,
  Search, Upload, Loader2, ListMusic, Music4,
} from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useToast } from "@/hooks/use-toast";
import {
  MUSIC_GENRES, MusicTrack, fetchGenreTracks, fetchCloudTracks, makeLocalTrack, uploadCloudTrack,
} from "@/lib/musicLibrary";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function GlassMusicPlayer() {
  const isAdmin = useIsAdmin();
  const { toast } = useToast();

  const [genre, setGenre] = useState(MUSIC_GENRES[0].id);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [remote, setRemote] = useState<MusicTrack[]>([]);
  const [cloud, setCloud] = useState<MusicTrack[]>([]);
  const [local, setLocal] = useState<MusicTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const tracks = useMemo(() => [...local, ...cloud, ...remote], [local, cloud, remote]);
  const track = tracks[index];

  // Chargement du catalogue libre de droits
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGenreTracks(genre, page, query)
      .then((list) => {
        if (cancelled) return;
        setRemote((prev) => (page === 1 ? list : [...prev, ...list.filter((t) => !prev.some((p) => p.id === t.id))]));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [genre, page, query]);

  useEffect(() => { fetchCloudTracks().then(setCloud).catch(() => {}); }, []);

  // Graphe audio (analyseur pour la synchronisation des animations)
  const ensureGraph = useCallback(() => {
    const el = audioRef.current;
    if (!el || analyserRef.current) return;
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    try {
      const ctx: AudioContext = new AC();
      const src = ctx.createMediaElementSource(el);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
    } catch { /* graphe indisponible : lecture normale */ }
  }, []);

  // Boucle de rendu du visualiseur + vibration 3D du panneau
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== Math.floor(rect.width * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }
      const w = canvas.width;
      const h = canvas.height;
      ctx2d.clearRect(0, 0, w, h);
      const analyser = analyserRef.current;
      const bins = analyser ? analyser.frequencyBinCount : 128;
      const data = new Uint8Array(bins);
      if (analyser) analyser.getByteFrequencyData(data);
      else for (let i = 0; i < bins; i++) data[i] = 0;

      let sum = 0;
      const bars = 72;
      const step = Math.max(1, Math.floor(bins / bars));
      const barW = w / bars;
      for (let i = 0; i < bars; i++) {
        let v = 0;
        for (let k = 0; k < step; k++) v = Math.max(v, data[i * step + k] || 0);
        sum += v;
        const norm = v / 255;
        const bh = Math.max(2 * dpr, norm * h * 0.46);
        const x = i * barW + barW * 0.18;
        const bw = barW * 0.64;
        const grad = ctx2d.createLinearGradient(0, h / 2 - bh, 0, h / 2 + bh);
        grad.addColorStop(0, "rgba(0,255,157,0.95)");
        grad.addColorStop(0.5, "rgba(34,211,238,0.9)");
        grad.addColorStop(1, "rgba(244,114,182,0.85)");
        ctx2d.fillStyle = grad;
        ctx2d.shadowColor = "rgba(0,255,157,0.55)";
        ctx2d.shadowBlur = 14 * dpr * (0.3 + norm);
        const r = Math.min(bw / 2, 4 * dpr);
        ctx2d.beginPath();
        ctx2d.roundRect(x, h / 2 - bh, bw, bh * 2, r);
        ctx2d.fill();
      }
      ctx2d.shadowBlur = 0;
      ctx2d.strokeStyle = "rgba(255,255,255,0.16)";
      ctx2d.lineWidth = 1 * dpr;
      ctx2d.beginPath();
      ctx2d.moveTo(0, h / 2);
      ctx2d.lineTo(w, h / 2);
      ctx2d.stroke();

      const energy = sum / (bars * 255);
      const shell = shellRef.current;
      if (shell) {
        shell.style.setProperty("--audio-energy", energy.toFixed(3));
      }
    };
    draw();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const playTrack = useCallback(async (i: number) => {
    const el = audioRef.current;
    const next = tracks[i];
    if (!el || !next) return;
    ensureGraph();
    if (ctxRef.current?.state === "suspended") { try { await ctxRef.current.resume(); } catch { /* ignore */ } }
    setIndex(i);
    el.src = next.url;
    try { await el.play(); setPlaying(true); } catch { setPlaying(false); }
  }, [ensureGraph, tracks]);

  const toggle = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    if (!el.src && tracks.length) { await playTrack(index); return; }
    ensureGraph();
    if (ctxRef.current?.state === "suspended") { try { await ctxRef.current.resume(); } catch { /* ignore */ } }
    if (el.paused) { try { await el.play(); setPlaying(true); } catch { /* ignore */ } }
    else { el.pause(); setPlaying(false); }
  }, [ensureGraph, index, playTrack, tracks.length]);

  const goNext = useCallback(() => {
    if (!tracks.length) return;
    const i = shuffle ? Math.floor(Math.random() * tracks.length) : (index + 1) % tracks.length;
    playTrack(i);
  }, [index, playTrack, shuffle, tracks.length]);

  const goPrev = useCallback(() => {
    if (!tracks.length) return;
    playTrack((index - 1 + tracks.length) % tracks.length);
  }, [index, playTrack, tracks.length]);

  const onVisitorFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const added = Array.from(files).filter((f) => f.type.startsWith("audio/")).map(makeLocalTrack);
    if (!added.length) return;
    setLocal((prev) => [...added.filter((a) => !prev.some((p) => p.id === a.id)), ...prev]);
    toast({ title: "Ajouté à votre lecture", description: `${added.length} fichier(s) prêt(s) — lecture locale uniquement.` });
  };

  const onAdminFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("audio/")) continue;
        await uploadCloudTrack(file, genre, "Bibliothèque Lovanet");
      }
      setCloud(await fetchCloudTracks());
      toast({ title: "Musiques publiées", description: "Les titres sont disponibles pour tous les visiteurs." });
    } catch (e: any) {
      toast({ title: "Envoi impossible", description: e?.message || "Réessayez.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <section
      ref={shellRef}
      data-testid="aihub-glass-music-player"
      className="glass3d-panel glass3d-surface audio-shell relative w-full overflow-hidden rounded-[2.2rem] p-5 sm:p-7"
    >
      <div className="pointer-events-none absolute inset-0 audio-shell-glow" aria-hidden />

      <header className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="audio-orb inline-flex h-12 w-12 items-center justify-center rounded-2xl">
            <Music4 className="h-6 w-6 text-white" />
          </span>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">Lecteur ambiance 3D</h2>
            <p className="text-xs font-semibold text-white/70">Catalogue libre de droits · {tracks.length} titres chargés</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="glass3d-btn inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white">
            <Upload className="h-4 w-4" /> Ajouter mes musiques
            <input type="file" accept="audio/*" multiple hidden onChange={(e) => onVisitorFiles(e.target.files)} />
          </label>
          {isAdmin && (
            <label className="glass3d-btn inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Publier (admin)
              <input type="file" accept="audio/*" multiple hidden onChange={(e) => onAdminFiles(e.target.files)} />
            </label>
          )}
        </div>
      </header>

      {/* Genres */}
      <div className="relative mt-5 flex flex-wrap gap-2">
        {MUSIC_GENRES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => { setGenre(g.id); setPage(1); setQuery(""); setSearch(""); }}
            className={`glass3d-btn rounded-full px-4 py-2 text-xs font-bold text-white ${genre === g.id ? "is-active" : ""}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Visualiseur */}
      <div className="relative mt-5 overflow-hidden rounded-[1.6rem] border border-white/15 bg-black/30 audio-visual">
        <canvas ref={canvasRef} className="block h-32 w-full sm:h-40" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between text-[11px] font-bold text-white/85">
          <span>{formatTime(current)}</span>
          <span className="truncate px-3 text-center text-white">{track?.title || "Aucune piste"}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Barre de progression */}
      <div
        className="audio-seek relative mt-4 h-3 w-full cursor-pointer overflow-hidden rounded-full"
        onClick={(e) => {
          const el = audioRef.current;
          if (!el || !duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          el.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
        }}
      >
        <div className="audio-seek-fill h-full" style={{ width: `${progress}%` }} />
      </div>

      {/* Commandes */}
      <div className="relative mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button type="button" onClick={() => setShuffle((v) => !v)} aria-label="Lecture aléatoire" className={`glass3d-btn h-11 w-11 rounded-full text-white ${shuffle ? "is-active" : ""}`}><Shuffle className="mx-auto h-4 w-4" /></button>
        <button type="button" onClick={goPrev} aria-label="Précédent" className="glass3d-btn h-12 w-12 rounded-full text-white"><SkipBack className="mx-auto h-5 w-5" /></button>
        <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Lecture"} className="glass3d-btn audio-play h-16 w-16 rounded-full text-white">
          {playing ? <Pause className="mx-auto h-7 w-7" /> : <Play className="mx-auto h-7 w-7" />}
        </button>
        <button type="button" onClick={goNext} aria-label="Suivant" className="glass3d-btn h-12 w-12 rounded-full text-white"><SkipForward className="mx-auto h-5 w-5" /></button>
        <button type="button" onClick={() => setRepeat((v) => !v)} aria-label="Répéter" className={`glass3d-btn h-11 w-11 rounded-full text-white ${repeat ? "is-active" : ""}`}><Repeat className="mx-auto h-4 w-4" /></button>
        <div className="glass3d-btn ml-1 flex items-center gap-2 rounded-full px-3 py-2">
          <button type="button" onClick={() => setMuted((v) => !v)} aria-label="Son" className="text-white">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
            onChange={(e) => { setMuted(false); setVolume(Number(e.target.value)); }}
            className="audio-range h-1 w-24" aria-label="Volume"
=======
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import useAudioVisualizer from "@/hooks/useAudioVisualizer";

type Track = {
  url: string;
  title: string;
};

const DEFAULT_PLAYLIST = [
  "/audio/celtic/JamesMorrisonTheGirlthatBrokeMyHeartConnemaraStockings/James_Morrison__The_Girl_that_Broke_My_Heart_Connemara_Stockings_64kb.mp3",
  "/audio/celtic/LeoRowsomeBoyintheBoatTheMorningDew/Leo_Rowsome__Boy_in_the_Boat_The_Old_Woman_of_the_House_64kb.mp3",
  "/audio/celtic/LiamWalshTheFriezeBritches/Liam_WalshThe_Frieze_Britches_64kb.mp3",
  "/audio/celtic/PaddyKilloranDrowsyMaggieTosstheFeathers/Paddy_Killoran__Drowsy_Maggie_Toss_the_Feathers_64kb.mp3",
];

const formatTrackTitle = (url: string) => {
  const file = url.split("/").filter(Boolean).pop() || "Piste audio";
  return decodeURIComponent(file)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function GlassMusicPlayer({ playlistUrl = "/audio/celtic/playlist.json", className = "" }: { playlistUrl?: string; className?: string }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useAudioVisualizer(audioRef.current, canvasRef.current);

  useEffect(() => {
    let cancelled = false;

    const loadPlaylist = async () => {
      try {
        const response = await fetch(playlistUrl, { cache: "no-store" });
        if (!response.ok) throw new Error("Playlist unavailable");
        const payload = await response.json();
        if (cancelled) return;

        const resolved: Track[] = Array.isArray(payload)
          ? payload.map((url) => ({ url: String(url), title: formatTrackTitle(String(url)) }))
          : DEFAULT_PLAYLIST.map((url) => ({ url, title: formatTrackTitle(url) }));

        setTracks(resolved.length ? resolved : DEFAULT_PLAYLIST.map((url) => ({ url, title: formatTrackTitle(url) })));
      } catch {
        if (!cancelled) {
          setTracks(DEFAULT_PLAYLIST.map((url) => ({ url, title: formatTrackTitle(url) })));
        }
      }
    };

    loadPlaylist();
    return () => {
      cancelled = true;
    };
  }, [playlistUrl]);

  const activeTrack = useMemo(() => tracks[currentIndex] || tracks[0], [tracks, currentIndex]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !activeTrack) return;

    audioEl.src = activeTrack.url;
    audioEl.load();

    if (isPlaying) {
      const playPromise = audioEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => setIsPlaying(false));
      }
    }
  }, [activeTrack, isPlaying]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.volume = muted ? 0 : volume;
    audioEl.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const onTimeUpdate = () => setCurrentTime(audioEl.currentTime || 0);
    const onLoaded = () => setDuration(Number.isFinite(audioEl.duration) ? audioEl.duration : 0);
    const onEnded = () => {
      const nextIndex = tracks.length ? (currentIndex + 1) % tracks.length : 0;
      setCurrentIndex(nextIndex);
    };

    audioEl.addEventListener("timeupdate", onTimeUpdate);
    audioEl.addEventListener("loadedmetadata", onLoaded);
    audioEl.addEventListener("ended", onEnded);

    return () => {
      audioEl.removeEventListener("timeupdate", onTimeUpdate);
      audioEl.removeEventListener("loadedmetadata", onLoaded);
      audioEl.removeEventListener("ended", onEnded);
    };
  }, [currentIndex, tracks.length]);

  const energy = Math.min(1, Math.max(0.2, (Math.abs(currentTime - duration * 0.35) / Math.max(duration, 1)) + 0.38));
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlay = async () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = audioEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => setIsPlaying(false));
    }
    setIsPlaying(true);
  };

  const changeTrack = (direction: number) => {
    if (!tracks.length) return;
    const nextIndex = (currentIndex + direction + tracks.length) % tracks.length;
    setCurrentIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleSeek = (value: number) => {
    const audioEl = audioRef.current;
    if (!audioEl || !Number.isFinite(duration) || duration <= 0) return;
    const nextTime = (value / 100) * duration;
    audioEl.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div className={`audio-shell-glow ${className}`}>
      <div className="audio-shell" style={{ ["--audio-energy" as string]: String(energy) }}>
        <div className="audio-orb">
          <div className="audio-visual">
            <canvas ref={canvasRef} className="audio-eq" />
          </div>
        </div>

        <div className="audio-meta">
          <span>Lova Radio</span>
          <strong>{activeTrack?.title || "Chargement…"}</strong>
        </div>

        <div className="audio-seek" aria-label="Progression du morceau">
          <div className="audio-seek-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="audio-controls">
          <button type="button" className="audio-play" aria-label="Précédent" onClick={() => changeTrack(-1)}>
            <SkipBack size={17} />
          </button>
          <button type="button" className="audio-play primary" aria-label={isPlaying ? "Pause" : "Lecture"} onClick={togglePlay}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button type="button" className="audio-play" aria-label="Suivant" onClick={() => changeTrack(1)}>
            <SkipForward size={17} />
          </button>
        </div>

        <div className="audio-timeline">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="audio-volume-row">
          <button type="button" className="audio-play small" aria-label={muted ? "Réactiver le son" : "Couper le son"} onClick={() => setMuted((v) => !v)}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume * 100}
            onChange={(event) => {
              const nextVolume = Number(event.target.value) / 100;
              setMuted(nextVolume === 0);
              setVolume(nextVolume);
            }}
            aria-label="Volume"
            className="audio-range"
>>>>>>> 37f1d400 (feat: finish Lovable AI Hub glass shell and discovery polish)
          />
        </div>
      </div>

<<<<<<< HEAD
      {/* Recherche + playlist */}
      <div className="relative mt-5 flex items-center gap-2">
        <div className="glass3d-btn flex flex-1 items-center gap-2 rounded-full px-4 py-2">
          <Search className="h-4 w-4 text-white/80" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); setQuery(search); } }}
            placeholder="Rechercher un titre, un artiste, une ambiance…"
            className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-white/50 focus:outline-none"
          />
        </div>
        <button type="button" onClick={() => { setPage(1); setQuery(search); }} className="glass3d-btn rounded-full px-4 py-2 text-xs font-bold text-white">Chercher</button>
      </div>

      <div className="relative mt-4 max-h-80 overflow-y-auto rounded-[1.4rem] border border-white/12 bg-black/25 p-2">
        <div className="mb-2 flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-wide text-white/70">
          <ListMusic className="h-4 w-4" /> Playlist ambiance
        </div>
        {tracks.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => playTrack(i)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition ${i === index ? "bg-white/15" : "hover:bg-white/8"}`}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-white">{t.title}</span>
              <span className="block truncate text-[11px] font-semibold text-white/65">{t.artist} · {t.source === "local" ? "mon fichier" : t.source === "cloud" ? "bibliothèque" : t.genre}</span>
            </span>
            {i === index && playing && <span className="audio-eq" aria-hidden><i /><i /><i /></span>}
          </button>
        ))}
        {!tracks.length && !loading && <p className="p-4 text-sm font-semibold text-white/70">Aucun titre pour cette recherche.</p>}
        <div className="mt-2 flex justify-center">
          <button type="button" onClick={() => setPage((p) => p + 1)} disabled={loading} className="glass3d-btn rounded-full px-5 py-2 text-xs font-bold text-white">
            {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</span> : "Charger plus de titres"}
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={() => { if (repeat) { playTrack(index); } else { goNext(); } }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        hidden
      />
    </section>
  );
}
=======
      <audio ref={audioRef} preload="auto" />
    </div>
  );
}
>>>>>>> 37f1d400 (feat: finish Lovable AI Hub glass shell and discovery polish)
