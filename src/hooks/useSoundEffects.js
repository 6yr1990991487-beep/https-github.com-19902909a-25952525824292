// Sound Effects Hook for Interactive Hubs - PREMIUM AUDIO
import { useCallback, useRef, useState, useEffect } from 'react';
import { getRandomTrainAnnouncement } from '../data/trainAnnouncements';

// Create audio context and oscillator-based sounds
export function useSoundEffects() {
  const audioContextRef = useRef(null);
  const ambientNodesRef = useRef({});
  const activeAnnouncementAudioRef = useRef(null);
  const announcementTimeoutRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.5);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // TRAIN SOUNDS
  // ═══════════════════════════════════════════════════════════════

  // Train horn sound - low frequency horn
  const playTrainHorn = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Train horn frequencies
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(180, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
      oscillator.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.6);
      
      gainNode.gain.setValueAtTime(0.3 * masterVolume, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4 * masterVolume, ctx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // Train arrival bell - Ding dong station bell
  const playStationBell = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      
      // First bell (ding)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(830, ctx.currentTime); // E5
      gain1.gain.setValueAtTime(0.3 * masterVolume, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.8);
      
      // Second bell (dong) - delayed
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(622, ctx.currentTime); // Eb5
        gain2.gain.setValueAtTime(0.3 * masterVolume, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 1);
      }, 400);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // Train station announcement jingle - Premium SNCF style
  const playAnnouncementJingle = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      // SNCF-style 4-note jingle (iconic French train announcement)
      const notes = [659.25, 783.99, 659.25, 523.25]; // E5, G5, E5, C5
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.25);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.25);
        gain.gain.linearRampToValueAtTime(0.25 * masterVolume, ctx.currentTime + i * 0.25 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.5);
        osc.start(ctx.currentTime + i * 0.25);
        osc.stop(ctx.currentTime + i * 0.25 + 0.6);
      });
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  const playSpeechFallback = useCallback((text) => {
    try {
      if (!text || !('speechSynthesis' in window)) {
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.volume = masterVolume;

      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find((voice) => voice.lang?.startsWith('fr')) || voices[0];
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.log('Speech fallback not available');
    }
  }, [masterVolume]);

  const stopAnnouncementAudio = useCallback(() => {
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
      announcementTimeoutRef.current = null;
    }

    if (activeAnnouncementAudioRef.current) {
      activeAnnouncementAudioRef.current.pause();
      activeAnnouncementAudioRef.current.currentTime = 0;
      activeAnnouncementAudioRef.current = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const playStationAnnouncement = useCallback((announcementType = 'arrival', selectedAnnouncement = null) => {
    const announcement = selectedAnnouncement || getRandomTrainAnnouncement(announcementType);

    if (!announcement) {
      return null;
    }

    if (isMuted) {
      return announcement;
    }

    stopAnnouncementAudio();
    playAnnouncementJingle();

    announcementTimeoutRef.current = setTimeout(() => {
      try {
        const audio = new Audio(announcement.audioSrc);
        audio.volume = masterVolume;
        audio.preload = 'auto';
        activeAnnouncementAudioRef.current = audio;
        audio.onended = () => {
          if (activeAnnouncementAudioRef.current === audio) {
            activeAnnouncementAudioRef.current = null;
          }
        };
        audio.onerror = () => {
          console.log('Train announcement MP3 unavailable');
          playSpeechFallback(announcement.text);
        };
        audio.play().catch(() => {
          console.log('Train announcement autoplay blocked until user interaction');
          playSpeechFallback(announcement.text);
        });
      } catch (e) {
        console.log('Train announcement audio not available');
        playSpeechFallback(announcement.text);
      }
    }, 1200);

    return announcement;
  }, [isMuted, masterVolume, playAnnouncementJingle, playSpeechFallback, stopAnnouncementAudio]);

  // Quick platform announcement chime
  const playPlatformChime = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      // Two-tone platform chime
      const chimes = [
        { freq: 880, start: 0, duration: 0.3 },
        { freq: 1046.5, start: 0.15, duration: 0.4 },
      ];
      
      chimes.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.2 * masterVolume, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration + 0.1);
      });
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // Train brakes screech
  const playTrainBrakes = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const noise = ctx.createBufferSource();
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = noiseBuffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(4000, ctx.currentTime + 0.5);
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.15 * masterVolume, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25 * masterVolume, ctx.currentTime + 0.3);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start(ctx.currentTime);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // ═══════════════════════════════════════════════════════════════
  // CAR/URBAN SOUNDS
  // ═══════════════════════════════════════════════════════════════

  // Car horn sound - higher pitch
  const playCarHorn = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(380, ctx.currentTime + 0.15);
      oscillator.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.15 * masterVolume, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // F1 Engine rev sound
  const playEngineRev = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.8);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.2 * masterVolume, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3 * masterVolume, ctx.currentTime + 0.3);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // Boost whoosh sound
  const playBoost = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const noise = ctx.createBufferSource();
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = noiseBuffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.2);
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.3 * masterVolume, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start(ctx.currentTime);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // ═══════════════════════════════════════════════════════════════
  // MARITIME/FERRY SOUNDS
  // ═══════════════════════════════════════════════════════════════

  // Ship horn - deep foghorn
  const playShipHorn = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, ctx.currentTime);
      osc2.frequency.setValueAtTime(112, ctx.currentTime); // Slight detune for thickness
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.35 * masterVolume, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.35 * masterVolume, ctx.currentTime + 1.5);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
      
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 2);
      osc2.stop(ctx.currentTime + 2);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // Seagull cry
  const playSeagull = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      // Seagull-like frequency modulation
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.4);
      osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.6);
      
      gainNode.gain.setValueAtTime(0.15 * masterVolume, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2 * masterVolume, ctx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.7);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // ═══════════════════════════════════════════════════════════════
  // CONCERT/MUSIC SOUNDS
  // ═══════════════════════════════════════════════════════════════

  // Bass drop
  const playBassDrop = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.5 * masterVolume, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // Crowd cheer
  const playCrowdCheer = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const noise = ctx.createBufferSource();
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = noiseBuffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25 * masterVolume, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.25 * masterVolume, ctx.currentTime + 1.5);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start(ctx.currentTime);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // ═══════════════════════════════════════════════════════════════
  // AMBIENT SOUND LOOPS
  // ═══════════════════════════════════════════════════════════════

  // Start ocean ambient
  const startOceanAmbient = useCallback(() => {
    if (ambientNodesRef.current.ocean) return;
    try {
      const ctx = getAudioContext();
      
      // Create brown noise for ocean
      const bufferSize = ctx.sampleRate * 10;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(isMuted ? 0 : 0.15 * masterVolume, ctx.currentTime);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();
      
      ambientNodesRef.current.ocean = { noise, gainNode };
    } catch (e) {
      console.log('Ocean ambient not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // Start city ambient
  const startCityAmbient = useCallback(() => {
    if (ambientNodesRef.current.city) return;
    try {
      const ctx = getAudioContext();
      
      // Low rumble for city
      const bufferSize = ctx.sampleRate * 8;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(isMuted ? 0 : 0.08 * masterVolume, ctx.currentTime);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();
      
      ambientNodesRef.current.city = { noise, gainNode };
    } catch (e) {
      console.log('City ambient not available');
    }
  }, [getAudioContext, isMuted, masterVolume]);

  // Stop ambient sounds
  const stopAmbient = useCallback((type) => {
    if (ambientNodesRef.current[type]) {
      try {
        ambientNodesRef.current[type].noise.stop();
      } catch (e) {}
      ambientNodesRef.current[type] = null;
    }
  }, []);

  // Stop all ambient
  const stopAllAmbient = useCallback(() => {
    Object.keys(ambientNodesRef.current).forEach(key => {
      stopAmbient(key);
    });
  }, [stopAmbient]);

  // Update ambient volume when master volume changes
  useEffect(() => {
    Object.values(ambientNodesRef.current).forEach(ambient => {
      if (ambient && ambient.gainNode) {
        ambient.gainNode.gain.setValueAtTime(
          isMuted ? 0 : 0.1 * masterVolume,
          audioContextRef.current?.currentTime || 0
        );
      }
    });
  }, [masterVolume, isMuted]);

  useEffect(() => {
    if (!activeAnnouncementAudioRef.current) {
      return;
    }

    activeAnnouncementAudioRef.current.volume = isMuted ? 0 : masterVolume;
    if (isMuted) {
      stopAnnouncementAudio();
    }
  }, [masterVolume, isMuted, stopAnnouncementAudio]);

  useEffect(() => {
    return () => {
      stopAnnouncementAudio();
    };
  }, [stopAnnouncementAudio]);

  return {
    // Train sounds
    playTrainHorn,
    playStationBell,
    playAnnouncementJingle,
    playStationAnnouncement,
    stopAnnouncementAudio,
    playPlatformChime,
    playTrainBrakes,
    // Car sounds
    playCarHorn,
    playEngineRev,
    playBoost,
    // Maritime sounds
    playShipHorn,
    playSeagull,
    // Concert sounds
    playBassDrop,
    playCrowdCheer,
    // Ambient controls
    startOceanAmbient,
    startCityAmbient,
    stopAmbient,
    stopAllAmbient,
    // Volume controls
    isMuted,
    setIsMuted,
    masterVolume,
    setMasterVolume
  };
}

export default useSoundEffects;
