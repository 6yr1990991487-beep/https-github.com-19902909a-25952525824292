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
    fetch(playlistUrl).then(r => r.json()).then((j: string[]) => {
      if (cancelled) return;
      const list = j.map(u => ({ url: u, title: decodeURIComponent(u.split('/').pop() || u) }));
      setPlaylist(list);
    }).catch(() => {
      // fallback: empty
    });
    return () => { cancelled = true; };
  }, [playlistUrl]);

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
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-3 flex items-center gap-4">
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
    </div>
  );
};

export default CelticPlayer;
