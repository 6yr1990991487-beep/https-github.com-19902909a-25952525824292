import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiMaximize, FiMinimize } from 'react-icons/fi';

function FullscreenToggle({ containerRef, position = 'top-left', style = {}, className = '' }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const toggle = useCallback((e) => {
    e.stopPropagation();
    const el = containerRef?.current;
    if (!el) return;
    try {
      let result;
      if (!document.fullscreenElement) {
        const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (fn) result = fn.call(el);
      } else {
        const fn = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (fn) result = fn.call(document);
      }
      if (result && result.catch) result.catch(() => {});
    } catch (err) {
      console.warn('Fullscreen not available:', err.message);
    }
  }, [containerRef]);

  /* position="inline" → pas d'absolute, utilisé dans une colonne parent */
  const posClass = position === 'inline' ? '' : ({
    'top-left':    'absolute top-2 sm:top-4 left-2 sm:left-4',
    'top-right-2': 'absolute top-2 sm:top-4 right-28 sm:right-72',
    'top-right-3': 'absolute top-3 right-3',
  }[position] || 'absolute top-2 sm:top-4 left-2 sm:left-4');

  return (
    <motion.button
      onClick={toggle}
      className={`${posClass} z-40 pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center text-white ${className}`}
      style={{
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.22)',
        ...style,
      }}
      whileHover={{ background: 'rgba(255,255,255,0.13)', scale: 1.1 }}
      whileTap={{ scale: 0.88 }}
      data-testid="fullscreen-toggle"
      title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
    >
      {isFullscreen ? <FiMinimize size={15} /> : <FiMaximize size={15} />}
    </motion.button>
  );
}

export default FullscreenToggle;
