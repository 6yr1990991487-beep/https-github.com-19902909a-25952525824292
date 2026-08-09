import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * HYPER OPTIMISATION MOBILE - Hook de performance ultra-poussé
 * Détection device, batterie, réseau, GPU, mémoire
 */
export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLowPower, setIsLowPower] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [connectionType, setConnectionType] = useState('4g');
  const [deviceMemory, setDeviceMemory] = useState(8);
  const [hardwareConcurrency, setHardwareConcurrency] = useState(4);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [pixelRatio, setPixelRatio] = useState(1);
  const [screenSize, setScreenSize] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    // ═══ DÉTECTION DEVICE ═══
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA = /iphone|ipod|android.*mobile|windows phone|blackberry|mobile/.test(ua);
      const isTabletUA = /ipad|android(?!.*mobile)|tablet/.test(ua);
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(width < 480 || isMobileUA);
      setIsTablet((width >= 768 && width < 1024) || isTabletUA);
      setIsTouchDevice(hasTouch);
      setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); // Cap agressif pour fluidité
      setScreenSize({ width, height });
    };

    // ═══ DÉTECTION MÉMOIRE & CPU ═══
    if ('deviceMemory' in navigator) {
      setDeviceMemory(navigator.deviceMemory || 4);
    }
    if ('hardwareConcurrency' in navigator) {
      setHardwareConcurrency(navigator.hardwareConcurrency || 4);
    }

    // ═══ DÉTECTION LOW-END DEVICE ═══
    const checkLowEnd = () => {
      const memory = navigator.deviceMemory || 4;
      const cores = navigator.hardwareConcurrency || 4;
      const isLow = memory <= 2 || cores <= 2;
      setIsLowEndDevice(isLow);
      if (isLow) setIsLowPower(true);
    };
    checkLowEnd();

    // ═══ DÉTECTION MOUVEMENT RÉDUIT ═══
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    // ═══ DÉTECTION BATTERIE ═══
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const checkBattery = () => {
          const lowBattery = battery.level < 0.2 || (!battery.charging && battery.level < 0.4);
          setIsLowPower(prev => prev || lowBattery);
        };
        checkBattery();
        battery.addEventListener('levelchange', checkBattery);
        battery.addEventListener('chargingchange', checkBattery);
      }).catch(() => {});
    }

    // ═══ DÉTECTION RÉSEAU ═══
    if ('connection' in navigator) {
      const conn = navigator.connection;
      const updateConnection = () => {
        if (conn) {
          setConnectionType(conn.effectiveType || '4g');
          const slowConnection = conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.effectiveType === '3g';
          setIsLowPower(prev => prev || slowConnection);
        }
      };
      updateConnection();
      conn?.addEventListener('change', updateConnection);
    }

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    const motionHandler = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, []);

  // ═══ FLAGS D'OPTIMISATION CALCULÉS ═══
  const shouldReduceAnimations = useMemo(() => {
    return prefersReducedMotion || isLowPower || isMobile || isLowEndDevice;
  }, [prefersReducedMotion, isLowPower, isMobile, isLowEndDevice]);

  const shouldDisableHeavyEffects = useMemo(() => {
    return isLowPower || isLowEndDevice || (isMobile && !isTablet);
  }, [isLowPower, isLowEndDevice, isMobile, isTablet]);

  const shouldDisable3D = useMemo(() => {
    return isLowEndDevice || (isMobile && isLowPower);
  }, [isLowEndDevice, isMobile, isLowPower]);

  const shouldReduceParticles = useMemo(() => {
    return isMobile || isTablet || isLowPower || isLowEndDevice || pixelRatio > 1.25 || hardwareConcurrency <= 8;
  }, [isMobile, isTablet, isLowPower, isLowEndDevice, pixelRatio, hardwareConcurrency]);

  const preferFastDesktop = useMemo(() => {
    return !isMobile && !isTablet;
  }, [isMobile, isTablet]);

  // ═══ PARAMÈTRES D'ANIMATION ADAPTATIFS ═══
  const animationDuration = useMemo(() => {
    if (shouldDisableHeavyEffects) return 0.05;
    if (shouldReduceAnimations) return 0.1;
    if (isTablet) return 0.15;
    return 0.25;
  }, [shouldDisableHeavyEffects, shouldReduceAnimations, isTablet]);

  // ═══ PARAMÈTRES 3D ADAPTATIFS ═══
  const threeDSettings = useMemo(() => {
    if (shouldDisable3D) {
      return {
        dpr: 0.5,
        shadows: false,
        antialias: false,
        pixelRatio: 0.5,
        maxLights: 2,
        geometryDetail: 4,
        particleCount: 10,
        enablePostProcessing: false,
        enableReflections: false,
        frameloop: 'always',
      };
    }
    if (isMobile) {
      return {
        dpr: Math.min(pixelRatio, 1),
        shadows: false,
        antialias: false,
        pixelRatio: 1,
        maxLights: 3,
        geometryDetail: 8,
        particleCount: 30,
        enablePostProcessing: false,
        enableReflections: false,
        frameloop: 'always',
      };
    }
    if (isTablet) {
      return {
        dpr: Math.min(pixelRatio, 1.2),
        shadows: false,
        antialias: false,
        pixelRatio: 1.2,
        maxLights: 4,
        geometryDetail: 10,
        particleCount: 36,
        enablePostProcessing: false,
        enableReflections: false,
        frameloop: 'always',
      };
    }
    return {
      dpr: Math.min(pixelRatio, 1.35),
      shadows: false,
      antialias: false,
      pixelRatio: 1.35,
      maxLights: 6,
      geometryDetail: 12,
      particleCount: 48,
      enablePostProcessing: false,
      enableReflections: false,
      frameloop: 'always',
    };
  }, [shouldDisable3D, isMobile, isTablet, pixelRatio]);

  // ═══ PARAMÈTRES VIDÉO ADAPTATIFS ═══
  const videoSettings = useMemo(() => {
    if (isMobile || isLowPower) {
      return {
        quality: 'small', // 240p
        autoplay: false,
        preload: 'none',
        muted: true,
        playsinline: true,
        controls: true,
      };
    }
    if (isTablet) {
      return {
        quality: 'medium', // 360p
        autoplay: true,
        preload: 'metadata',
        muted: true,
        playsinline: true,
        controls: true,
      };
    }
    return {
      quality: 'hd720', // 720p
      autoplay: true,
      preload: 'auto',
      muted: true,
      playsinline: true,
      controls: true,
    };
  }, [isMobile, isTablet, isLowPower]);

  // ═══ PARAMÈTRES CARROUSEL ADAPTATIFS ═══
  const carouselSettings = useMemo(() => {
    if (isMobile) {
      return {
        speed: 6000,
        delay: 3000,
        itemsToShow: 2,
        gap: 8,
        enableDrag: true,
        enableSnap: true,
      };
    }
    if (isTablet) {
      return {
        speed: 4500,
        delay: 2000,
        itemsToShow: 4,
        gap: 12,
        enableDrag: true,
        enableSnap: true,
      };
    }
    return {
      speed: 3500,
      delay: 1500,
      itemsToShow: 6,
      gap: 16,
      enableDrag: true,
      enableSnap: false,
    };
  }, [isMobile, isTablet]);

  // ═══ PARAMÈTRES IMAGE ADAPTATIFS ═══
  const imageSettings = useMemo(() => {
    if (isMobile) {
      return {
        quality: 60,
        maxWidth: 640,
        lazyLoad: true,
        placeholder: 'blur',
        format: 'webp',
      };
    }
    if (isTablet) {
      return {
        quality: 75,
        maxWidth: 1024,
        lazyLoad: true,
        placeholder: 'blur',
        format: 'webp',
      };
    }
    return {
      quality: 85,
      maxWidth: 1920,
      lazyLoad: true,
      placeholder: 'blur',
      format: 'webp',
    };
  }, [isMobile, isTablet]);

  // ═══ TOUCH HANDLERS OPTIMISÉS ═══
  const getTouchConfig = useCallback(() => {
    if (!isTouchDevice) return {};
    return {
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none',
      userSelect: 'none',
    };
  }, [isTouchDevice]);

  return {
    // Device info
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isTouchDevice,
    isLowPower,
    isLowEndDevice,
    prefersReducedMotion,
    connectionType,
    deviceMemory,
    hardwareConcurrency,
    pixelRatio,
    screenSize,
    
    // Optimization flags
    shouldReduceAnimations,
    shouldDisableHeavyEffects,
    shouldDisable3D,
    shouldReduceParticles,
    preferFastDesktop,
    
    // Adaptive settings
    animationDuration,
    threeDSettings,
    videoSettings,
    carouselSettings,
    imageSettings,
    
    // Helpers
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    getTouchConfig,
    
    // Performance level (0-3)
    performanceLevel: isLowEndDevice ? 0 : isMobile ? 1 : isTablet ? 2 : 3,
  };
}

// ═══ ANIMATIONS MOBILE ULTRA-LÉGÈRES ═══
export const mobileAnimationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1 }
  },
  slideUp: {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 5 },
    transition: { duration: 0.1 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.1 }
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
    transition: { duration: 0 }
  }
};

// ═══ ANIMATIONS DESKTOP COMPLÈTES ═══
export const desktopAnimationVariants = {
  fadeIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// ═══ HELPER ANIMATION RESPONSIVE ═══
export function useResponsiveAnimation(animationType = 'fadeIn') {
  const { shouldReduceAnimations, shouldDisableHeavyEffects } = useMobileOptimization();
  
  if (shouldDisableHeavyEffects) {
    return mobileAnimationVariants.none;
  }
  if (shouldReduceAnimations) {
    return mobileAnimationVariants[animationType] || mobileAnimationVariants.fadeIn;
  }
  return desktopAnimationVariants[animationType] || desktopAnimationVariants.fadeIn;
}

// ═══ HOOK INTERSECTION OBSERVER OPTIMISÉ ═══
export function useOptimizedIntersection(options = {}) {
  const { isMobile } = useMobileOptimization();
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once) observer.disconnect();
        } else if (!options.once) {
          setIsVisible(false);
        }
      },
      {
        threshold: isMobile ? 0.05 : 0.1,
        rootMargin: isMobile ? '50px' : '100px',
        ...options,
      }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, isMobile, options.once]);

  return [setRef, isVisible];
}

// ═══ DEBOUNCE OPTIMISÉ ═══
export function useDebounce(value, delay) {
  const { isMobile } = useMobileOptimization();
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, isMobile ? delay * 1.5 : delay);

    return () => clearTimeout(handler);
  }, [value, delay, isMobile]);

  return debouncedValue;
}

// ═══ THROTTLE OPTIMISÉ ═══
export function useThrottle(callback, delay) {
  const { isMobile } = useMobileOptimization();
  const lastRan = useState(Date.now())[0];
  const actualDelay = isMobile ? delay * 2 : delay;

  return useCallback((...args) => {
    if (Date.now() - lastRan >= actualDelay) {
      callback(...args);
    }
  }, [callback, actualDelay, lastRan]);
}

export default useMobileOptimization;
