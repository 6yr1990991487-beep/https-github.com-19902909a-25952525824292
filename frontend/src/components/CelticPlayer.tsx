import React, { useEffect, useRef, useState } from 'react';
import useAudioVisualizer from '@/hooks/useAudioVisualizer';

type Track = { url: string; title?: string };

const CelticPlayer: React.FC<{ playlistUrl?: string; className?: string }> = ({ playlistUrl = '/audio/celtic/playlist.json', className }) => {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useAudioVisualizer(audioRef.current, canvasRef.current);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tried = new Set<string>();
      const candidates = [
        playlistUrl,
        `${import.meta.env.BASE_URL || '/'}${playlistUrl.replace(/^\//, '')}`,
        playlistUrl.replace(/^\//, ''),
        `${window.location.origin}${playlistUrl}`
      ];
      const triedArr: string[] = [];
      const errors: Record<string, string> = {};
      for (const url of candidates) {
        if (!url || tried.has(url)) continue;
        tried.add(url);
        triedArr.push(url);
        try {
          const resp = await fetch(url);
          if (!resp.ok) {
            errors[url] = `HTTP ${resp.status}`;
            continue;
          }
          const j = await resp.json();
          if (cancelled) return;
          if (Array.isArray(j)) {
            const list = j.map((u: string) => ({ url: u, title: decodeURIComponent((u as string).split('/').pop() || u) }));
            setPlaylist(list);
            // expose debug info if enabled
            setDebugInfo({ tried: triedArr, errors });
            return;
          }
        } catch (e: any) {
          errors[url] = e?.message || String(e);
        }
      }
      setDebugInfo({ tried: triedArr, errors });
    })();
    return () => { cancelled = true; };
  }, [playlistUrl]);

  // Debug UI state
  const [debugInfo, setDebugInfo] = useState<{ tried: string[]; errors: Record<string, string> }>({ tried: [], errors: {} });
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const debugEnabled = params.get('celticDebug') === '1';

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onended = () => { setPlaying(false); setCurrent((c) => (c + 1) % Math.max(1, playlist.length)); };
    a.addEventListener('ended', onended);
    return () => { a.removeEventListener('ended', onended); };
  }, [playlist.length]);

  const playIndex = (i: number) => {
    if (!playlist[i]) return;
    setCurrent(i);
    const a = audioRef.current;
    if (!a) return;
    a.src = playlist[i].url;
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    setPlaying(true);
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { const p = a.play(); if (p && typeof p.catch === 'function') p.catch(() => {}); setPlaying(true); }
  };

  return (
    <div className={`relative z-10 pointer-events-auto ${className || ''}`}> 
      <div className="w-full mx-auto max-w-3xl">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-4">
          <div className="flex-1">
            <canvas ref={canvasRef as any} className="w-full h-20 rounded-md" />
            <div className="mt-2 text-sm text-slate-200">{playlist[current]?.title || 'Aucune piste chargée'}</div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => playIndex((current - 1 + playlist.length) % Math.max(1, playlist.length))} className="px-3 py-2 bg-white/5 rounded">Prev</button>
              <button onClick={togglePlay} className="px-4 py-2 bg-white/10 rounded font-bold">{playing ? 'Pause' : 'Play'}</button>
              <button onClick={() => playIndex((current + 1) % Math.max(1, playlist.length))} className="px-3 py-2 bg-white/5 rounded">Next</button>
            </div>
            <div className="w-48 text-xs text-slate-300">Playlist: {playlist.length} pistes</div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} hidden controls />

      <div className="absolute inset-x-0 top-0 mt-28 max-w-3xl mx-auto pointer-events-auto">
        <div className="max-h-64 overflow-y-auto bg-black/20 rounded-lg p-2 border border-white/5">
          {playlist.length === 0 && <div className="text-slate-400 text-sm p-2">Index de playlist introuvable ou en cours de génération...</div>}
          {playlist.map((t, i) => (
            <div key={i} className={`flex items-center justify-between px-2 py-1 rounded hover:bg-white/3 ${i===current? 'bg-white/5':''}`}>
              <div className="text-sm text-slate-200 truncate pr-2">{t.title}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => playIndex(i)} className="text-xs bg-white/5 px-2 py-1 rounded">Play</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {debugEnabled && (
        <div className="fixed left-4 bottom-4 z-50 w-80 max-h-64 overflow-y-auto bg-black/80 text-xs text-white border border-white/20 rounded-md p-2">
          <div className="flex items-center justify-between mb-2">
            <strong>Debug CelticPlayer</strong>
            <button onClick={() => { window.location.search = window.location.search.replace('celticDebug=1', ''); }} className="text-[10px] px-2 py-1 bg-white/5 rounded">Close</button>
          </div>
          <div className="mb-2">Tried URLs:</div>
          {debugInfo.tried.map((u) => (
            <div key={u} className="break-words mb-1">{u} {debugInfo.errors[u] ? <span className="text-rose-400"> — {debugInfo.errors[u]}</span> : null}</div>
          ))}
          <div className="mt-2 text-slate-400">Open console for more details.</div>
        </div>
      )}
    </div>
  );
};

export default CelticPlayer;
