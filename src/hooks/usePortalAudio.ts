import { useCallback, useEffect, useRef, useState } from "react";

export type AmbianceId = "cyberpunk" | "temple" | "ocean";

export type AmbiancePreset = {
  id: AmbianceId;
  label: string;
  description: string;
};

export const AMBIANCE_PRESETS: AmbiancePreset[] = [
  { id: "cyberpunk", label: "Cyberpunk", description: "Nappes néon, arpèges rapides" },
  { id: "temple",    label: "Temple",    description: "Cloches lointaines, drone méditatif" },
  { id: "ocean",     label: "Océan",     description: "Ressac lent, sirènes douces" },
];

type PresetConfig = {
  padFreqs: [number, number];
  padWave: OscillatorType;
  padGain: number;
  filterBase: number;
  filterLfoFreq: number;
  filterLfoDepth: number;
  shimmerFreq: number;
  shimmerGain: number;
  vibrateFreq: number;
  vibrateDepth: number;
  chimeNotes: number[];
  chimeWave: OscillatorType;
  chimeIntervalMs: number;
  chimeProbability: number;
  chimeDurationSec: number;
  chimeGain: number;
  noiseGain: number;
  noiseFilterFreq: number;
  noiseFilterQ: number;
  noiseLfoFreq: number;
  noiseLfoDepth: number;
};

const PRESETS: Record<AmbianceId, PresetConfig> = {
  cyberpunk: {
    padFreqs: [110, 82.4],
    padWave: "sawtooth",
    padGain: 0.16,
    filterBase: 900,
    filterLfoFreq: 0.12,
    filterLfoDepth: 700,
    shimmerFreq: 1174.66,
    shimmerGain: 0.035,
    vibrateFreq: 6,
    vibrateDepth: 9,
    chimeNotes: [523.25, 622.25, 739.99, 830.6, 987.77, 1174.66],
    chimeWave: "sawtooth",
    chimeIntervalMs: 2400,
    chimeProbability: 0.75,
    chimeDurationSec: 1.4,
    chimeGain: 0.13,
    noiseGain: 0.0,
    noiseFilterFreq: 800,
    noiseFilterQ: 1,
    noiseLfoFreq: 0.1,
    noiseLfoDepth: 400,
  },
  temple: {
    padFreqs: [65.41, 98.0],
    padWave: "sine",
    padGain: 0.22,
    filterBase: 520,
    filterLfoFreq: 0.05,
    filterLfoDepth: 320,
    shimmerFreq: 659.25,
    shimmerGain: 0.028,
    vibrateFreq: 3,
    vibrateDepth: 3,
    chimeNotes: [261.63, 293.66, 349.23, 392, 440, 523.25],
    chimeWave: "sine",
    chimeIntervalMs: 5200,
    chimeProbability: 0.55,
    chimeDurationSec: 4.5,
    chimeGain: 0.22,
    noiseGain: 0.0,
    noiseFilterFreq: 400,
    noiseFilterQ: 1,
    noiseLfoFreq: 0.05,
    noiseLfoDepth: 120,
  },
  ocean: {
    padFreqs: [55, 82.4],
    padWave: "sine",
    padGain: 0.12,
    filterBase: 420,
    filterLfoFreq: 0.18,
    filterLfoDepth: 260,
    shimmerFreq: 440,
    shimmerGain: 0.02,
    vibrateFreq: 4.2,
    vibrateDepth: 2,
    chimeNotes: [329.63, 392, 440, 493.88],
    chimeWave: "sine",
    chimeIntervalMs: 7200,
    chimeProbability: 0.45,
    chimeDurationSec: 3.2,
    chimeGain: 0.11,
    noiseGain: 0.14,
    noiseFilterFreq: 900,
    noiseFilterQ: 1.4,
    noiseLfoFreq: 0.22,
    noiseLfoDepth: 700,
  },
};

const STORAGE_ENABLED = "lovanet.portal.audio.enabled";
const STORAGE_PRESET = "lovanet.portal.audio.preset";

function readStoredPreset(): AmbianceId {
  if (typeof window === "undefined") return "cyberpunk";
  try {
    const raw = window.localStorage.getItem(STORAGE_PRESET);
    if (raw && (raw === "cyberpunk" || raw === "temple" || raw === "ocean")) {
      return raw;
    }
  } catch (_) { /* ignore */ }
  return "cyberpunk";
}

function readStoredEnabled(defaultEnabled: boolean): boolean {
  if (typeof window === "undefined") return defaultEnabled;
  try {
    const raw = window.localStorage.getItem(STORAGE_ENABLED);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch (_) { /* ignore */ }
  return defaultEnabled;
}

function makeNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, rate * seconds, rate);
  const data = buffer.getChannelData(0);
  // Pink-ish noise (simple)
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.997 * b0 + white * 0.029591;
    b1 = 0.985 * b1 + white * 0.032534;
    b2 = 0.95 * b2 + white * 0.048056;
    data[i] = (b0 + b1 + b2) * 0.4;
  }
  return buffer;
}

export function usePortalAudio(options: { defaultEnabled?: boolean } = {}) {
  const { defaultEnabled = false } = options;
  const [enabled, setEnabled] = useState<boolean>(() => readStoredEnabled(defaultEnabled));
  const [preset, setPreset] = useState<AmbianceId>(() => readStoredPreset());
  const [ready, setReady] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<any>({});
  const chimeIntervalRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (chimeIntervalRef.current) {
      window.clearInterval(chimeIntervalRef.current);
      chimeIntervalRef.current = null;
    }
    if (nodes?.master && ctx) {
      try {
        nodes.master.gain.cancelScheduledValues(ctx.currentTime);
        nodes.master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      } catch (_) { /* ignore */ }
    }
    if (ctx) {
      window.setTimeout(() => { try { ctx.close(); } catch (_) { /* ignore */ } }, 900);
    }
    ctxRef.current = null;
    nodesRef.current = {};
    setReady(false);
  }, []);

  const start = useCallback(async (targetPreset?: AmbianceId) => {
    if (typeof window === "undefined") return;
    if (ctxRef.current) return;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx: AudioContext = new AudioContextClass();
    if (ctx.state === "suspended") { try { await ctx.resume(); } catch (_) { /* ignore */ } }
    ctxRef.current = ctx;

    const cfg = PRESETS[targetPreset || preset];
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.Q.value = 6;
    lpf.frequency.value = cfg.filterBase;
    lpf.connect(master);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = cfg.filterLfoFreq;
    lfoGain.gain.value = cfg.filterLfoDepth;
    lfo.connect(lfoGain).connect(lpf.frequency);
    lfo.start();

    const padA = ctx.createOscillator();
    const padB = ctx.createOscillator();
    padA.type = cfg.padWave;
    padB.type = cfg.padWave;
    padA.frequency.value = cfg.padFreqs[0];
    padB.frequency.value = cfg.padFreqs[1];
    padA.detune.value = -8;
    padB.detune.value = 8;
    const padGain = ctx.createGain();
    padGain.gain.value = cfg.padGain;
    padA.connect(padGain);
    padB.connect(padGain);
    padGain.connect(lpf);
    padA.start();
    padB.start();

    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = cfg.shimmerFreq;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = cfg.shimmerGain;
    const vib = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vib.frequency.value = cfg.vibrateFreq;
    vibGain.gain.value = cfg.vibrateDepth;
    vib.connect(vibGain).connect(shimmer.frequency);
    vib.start();
    shimmer.connect(shimmerGain).connect(master);
    shimmer.start();

    let noiseSource: AudioBufferSourceNode | null = null;
    if (cfg.noiseGain > 0) {
      const buffer = makeNoiseBuffer(ctx, 4);
      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = cfg.noiseFilterFreq;
      noiseFilter.Q.value = cfg.noiseFilterQ;
      const noiseLfo = ctx.createOscillator();
      const noiseLfoGain = ctx.createGain();
      noiseLfo.frequency.value = cfg.noiseLfoFreq;
      noiseLfoGain.gain.value = cfg.noiseLfoDepth;
      noiseLfo.connect(noiseLfoGain).connect(noiseFilter.frequency);
      noiseLfo.start();
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = cfg.noiseGain;
      noiseSource.connect(noiseFilter).connect(noiseGain).connect(master);
      noiseSource.start();
    }

    master.gain.setTargetAtTime(0.32, ctx.currentTime, 1.4);

    const scheduleChime = () => {
      const now = ctx.currentTime;
      const freq = cfg.chimeNotes[Math.floor(Math.random() * cfg.chimeNotes.length)];
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const env = ctx.createGain();
      carrier.type = cfg.chimeWave;
      modulator.type = "sine";
      carrier.frequency.value = freq;
      modulator.frequency.value = freq * 2;
      modGain.gain.value = freq * 1.5;
      modulator.connect(modGain).connect(carrier.frequency);
      env.gain.value = 0;
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(cfg.chimeGain, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, now + cfg.chimeDurationSec);
      carrier.connect(env).connect(master);
      modulator.start();
      carrier.start();
      carrier.stop(now + cfg.chimeDurationSec + 0.1);
      modulator.stop(now + cfg.chimeDurationSec + 0.1);
    };
    chimeIntervalRef.current = window.setInterval(() => {
      if (Math.random() < cfg.chimeProbability) scheduleChime();
    }, cfg.chimeIntervalMs);

    nodesRef.current = { master, lpf, padA, padB, shimmer, noiseSource };
    setReady(true);
  }, [preset]);

  const toggle = useCallback(async () => {
    if (enabled) {
      stop();
      setEnabled(false);
      try { window.localStorage.setItem(STORAGE_ENABLED, "0"); } catch (_) { /* ignore */ }
    } else {
      await start();
      setEnabled(true);
      try { window.localStorage.setItem(STORAGE_ENABLED, "1"); } catch (_) { /* ignore */ }
    }
  }, [enabled, start, stop]);

  const changePreset = useCallback(async (nextPreset: AmbianceId) => {
    setPreset(nextPreset);
    try { window.localStorage.setItem(STORAGE_PRESET, nextPreset); } catch (_) { /* ignore */ }
    if (enabled) {
      stop();
      // small delay before restarting to allow fade-out
      window.setTimeout(() => { start(nextPreset); }, 500);
    }
  }, [enabled, start, stop]);

  useEffect(() => () => stop(), [stop]);

  // Deferred auto-start after first user gesture (browsers require gesture for audio)
  useEffect(() => {
    if (!enabled || ctxRef.current) return;
    const handler = () => {
      start();
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [enabled, start]);

  return { enabled, ready, preset, toggle, changePreset, start, stop };
}
