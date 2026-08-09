// HubAudioControls - Universal Audio Control Component for all Hubs
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVolume2, FiVolumeX, FiMusic, FiRadio, FiMic } from 'react-icons/fi';

const HubAudioControls = ({ 
  hubType = 'default', // 'train', 'ferry', 'urban', 'cinema'
  soundEffects,
  onAmbientToggle,
  showAmbient = true,
  position = 'bottom-left' // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  
  const { 
    isMuted, 
    setIsMuted, 
    masterVolume, 
    setMasterVolume,
    startOceanAmbient,
    startCityAmbient,
    stopAllAmbient,
    playStationBell,
    playAnnouncementJingle,
    playStationAnnouncement,
    playPlatformChime,
    playShipHorn,
    playSeagull,
    playCrowdCheer,
    playBassDrop
  } = soundEffects || {};

  // Position classes
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  };

  // Handle station announcement with loading state
  const handleAnnouncement = (type) => {
    if (isAnnouncing) return;
    setIsAnnouncing(true);
    playStationAnnouncement?.(type);
    // Reset after announcement duration
    setTimeout(() => setIsAnnouncing(false), 8000);
  };

  // Hub-specific sounds
  const hubSounds = {
    train: [
      { name: 'Arrivée', icon: '🚄', action: () => handleAnnouncement('arrival'), isAnnouncement: true },
      { name: 'Départ', icon: '🚅', action: () => handleAnnouncement('departure'), isAnnouncement: true },
      { name: 'Info', icon: '📢', action: () => handleAnnouncement('info'), isAnnouncement: true },
      { name: 'Cloche', icon: '🔔', action: playStationBell },
      { name: 'Jingle', icon: '🎵', action: playAnnouncementJingle },
      { name: 'Quai', icon: '🔊', action: playPlatformChime }
    ],
    ferry: [
      { name: 'Corne', icon: '🚢', action: playShipHorn },
      { name: 'Mouette', icon: '🐦', action: playSeagull }
    ],
    urban: [
      { name: 'Bass', icon: '🎵', action: playBassDrop },
      { name: 'Foule', icon: '👏', action: playCrowdCheer }
    ],
    cinema: [
      { name: 'Bass', icon: '🎬', action: playBassDrop }
    ],
    default: []
  };

  // Toggle ambient sound based on hub type
  const toggleAmbient = () => {
    if (ambientOn) {
      stopAllAmbient?.();
      setAmbientOn(false);
    } else {
      if (hubType === 'ferry') {
        startOceanAmbient?.();
      } else if (hubType === 'train' || hubType === 'urban') {
        startCityAmbient?.();
      }
      setAmbientOn(true);
    }
    onAmbientToggle?.(!ambientOn);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAmbient?.();
      // Cancel any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopAllAmbient]);

  const currentSounds = hubSounds[hubType] || hubSounds.default;
  const isTrainHub = hubType === 'train';

  return (
    <div 
      className={`absolute ${positionClasses[position]} z-20`}
      data-testid="hub-audio-controls"
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className={`mb-3 rounded-2xl p-4 border min-w-[180px] ${isTrainHub ? 'bg-slate-950/92 border-cyan-200/20' : 'bg-black/92  border-white/20'}`}
          >
            {/* Volume Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-xs font-medium">Volume</span>
                <span className="text-cyan-400 text-xs">{Math.round((masterVolume || 0.5) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume || 0.5}
                onChange={(e) => setMasterVolume?.(parseFloat(e.target.value))}
                data-testid={`hub-audio-volume-slider-${hubType}`}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-cyan-400
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Ambient Toggle */}
            {showAmbient && (
              <button
                onClick={toggleAmbient}
                data-testid={`hub-audio-ambient-toggle-${hubType}`}
                className={`w-full mb-3 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  ambientOn 
                    ? 'bg-cyan-500/30 border border-cyan-400/50 text-cyan-300' 
                    : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20'
                }`}
              >
                <FiRadio className={ambientOn ? 'animate-pulse' : ''} />
                <span className="text-xs font-medium">
                  {hubType === 'ferry' ? 'Océan' : 'Ville'} {ambientOn ? 'ON' : 'OFF'}
                </span>
              </button>
            )}

            {/* Quick Sound Buttons */}
            {currentSounds.length > 0 && (
              <div className="space-y-2">
                <span className="text-white/60 text-xs">Sons rapides</span>
                <div className="grid grid-cols-2 gap-2">
                  {currentSounds.map((sound, i) => (
                    <motion.button
                      key={i}
                      onClick={() => sound.action?.()}
                      disabled={sound.isAnnouncement && isAnnouncing}
                      data-testid={`hub-audio-quick-sound-${hubType}-${sound.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`py-2 px-3 rounded-lg border transition-all flex items-center justify-center gap-1 ${
                        sound.isAnnouncement && isAnnouncing
                          ? 'bg-emerald-500/30 border-emerald-400/50 cursor-wait'
                          : 'bg-white/10 hover:bg-white/20 border-white/10'
                      }`}
                    >
                      <span className={sound.isAnnouncement && isAnnouncing ? 'animate-pulse' : ''}>{sound.icon}</span>
                      <span className="text-white/80 text-xs">{sound.name}</span>
                    </motion.button>
                  ))}
                </div>
                {hubType === 'train' && (
                  <div className="mt-2 text-center">
                    <span className="text-emerald-400/60 text-[10px]">
                      {isAnnouncing ? 'Annonce en cours...' : 'Train Hub muet par défaut'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Control Button */}
      <div className="flex items-center gap-2">
        {/* Mute Button */}
        <motion.button
          onClick={() => setIsMuted?.(!isMuted)}
          data-testid={`hub-audio-mute-button-${hubType}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-3 rounded-full  border transition-all ${
            isMuted 
              ? 'bg-red-500/30 border-red-400/50 text-red-300' 
              : 'bg-black/50 border-white/20 text-white/80 hover:bg-black/92'
          }`}
        >
          {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
        </motion.button>

        {/* Expand Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          data-testid={`hub-audio-expand-button-${hubType}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-3 rounded-full  border transition-all ${
            isExpanded 
              ? 'bg-cyan-500/30 border-cyan-400/50 text-cyan-300' 
              : 'bg-black/50 border-white/20 text-white/80 hover:bg-black/92'
          }`}
        >
          <FiMusic size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default HubAudioControls;
