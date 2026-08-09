import * as THREE from 'three';

/**
 * React Three Fiber - Configuration globale pour performances maximales
 * Appliqué à tous les hubs 3D (Cinema, Racing, Train, Urban Quad, Ferry)
 */

// Configuration Canvas optimale pour tous les hubs
export const OPTIMAL_CANVAS_CONFIG = {
  // Device Pixel Ratio adaptatif
  dpr: [1, 2], // [min, max] - 1x sur mobiles faibles, 2x sur desktop
  
  // Configuration WebGL optimale
  gl: {
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance', // Force GPU haute performance
    stencil: false, // Désactive stencil buffer (rarement utilisé)
    depth: true,
    logarithmicDepthBuffer: true, // Meilleur depth buffering
    preserveDrawingBuffer: false, // Performances accrues
    failIfMajorPerformanceCaveat: false,
    precision: 'highp', // Haute précision
    premultipliedAlpha: true,
    
    // Tone mapping pour rendu réaliste
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.2,
    
    // Color space moderne
    outputColorSpace: THREE.SRGBColorSpace,
  },
  
  // Frame loop sur demande (économise batterie/CPU)
  frameloop: 'demand',
  
  // Performance throttling
  performance: {
    min: 0.5, // Descend à 30fps si nécessaire
    max: 1.0, // Vise 60fps
    debounce: 200,
  },
  
  // Mode ombres (si activé)
  shadows: {
    enabled: false, // Désactivé par défaut pour perfs
    type: THREE.PCFSoftShadowMap, // Si activé, meilleur qualité/perf
  },
};

// Configuration OrbitControls optimale
export const OPTIMAL_CONTROLS_CONFIG = {
  enablePan: true,
  enableZoom: true,
  enableDamping: true,
  dampingFactor: 0.05,
  autoRotate: true,
  autoRotateSpeed: 0.3,
  rotateSpeed: 0.8,
  zoomSpeed: 1.2,
  minDistance: 3,
  maxDistance: 30,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI / 1.8,
  // Smooth easing
  enableAnimations: true,
};

// Optimisations géométrie
export const GEOMETRY_OPTIMIZATION = {
  // Réduire segments pour objets éloignés
  LOD_LEVELS: {
    HIGH: { segments: 32, detail: 3 },
    MEDIUM: { segments: 16, detail: 2 },
    LOW: { segments: 8, detail: 1 },
  },
  
  // Utiliser BufferGeometry partout
  USE_BUFFER_GEOMETRY: true,
  
  // Merge géométries similaires
  MERGE_GEOMETRIES: true,
};

// Optimisations matériaux
export const MATERIAL_OPTIMIZATION = {
  // Réduire roughness pour calculs plus rapides
  DEFAULT_ROUGHNESS: 0.7,
  
  // Metalness uniquement si nécessaire
  DEFAULT_METALNESS: 0.2,
  
  // Utiliser MeshStandardMaterial au lieu de MeshPhysicalMaterial
  USE_STANDARD_MATERIALS: true,
  
  // Partager les matériaux identiques
  SHARE_MATERIALS: true,
};

// Optimisations éclairage
export const LIGHTING_OPTIMIZATION = {
  // Limiter nombre de lights
  MAX_POINT_LIGHTS: 12,
  MAX_SPOT_LIGHTS: 4,
  MAX_DIRECTIONAL_LIGHTS: 2,
  
  // Distances optimales
  POINT_LIGHT_MAX_DISTANCE: 20,
  SPOT_LIGHT_MAX_DISTANCE: 30,
  
  // Intensités par défaut
  AMBIENT_INTENSITY: 0.3,
  DIRECTIONAL_INTENSITY: 0.5,
};

// Cache et mémoire
export const CACHE_CONFIG = {
  // Texture caching
  TEXTURE_CACHE_SIZE: 100, // MB
  
  // Geometry caching
  GEOMETRY_CACHE_SIZE: 50, // MB
  
  // Preload commun assets
  PRELOAD_TEXTURES: true,
  PRELOAD_MODELS: false, // Only if needed
  
  // Dispose unused assets
  AUTO_DISPOSE: true,
  DISPOSE_INTERVAL: 30000, // 30s
};

// YouTube Player optimization
export const YOUTUBE_OPTIMIZATION = {
  // Player parameters
  PLAYER_PARAMS: {
    autoplay: 1,
    mute: 0,
    controls: 1,
    loop: 1,
    modestbranding: 1,
    rel: 0,
    showinfo: 0,
    enablejsapi: 1,
    playsinline: 1,
    
    // Quality adaptative
    vq: 'hd720', // Default 720p
    
    // Annotations off
    iv_load_policy: 3,
  },
  
  // Lazy loading
  LAZY_LOAD: true,
  LOADING_STRATEGY: 'lazy',
  
  // Preconnect to YouTube
  PRECONNECT: true,
};

// Performance monitoring
export const PERFORMANCE_MONITORING = {
  ENABLED: true,
  LOG_FPS: false,
  LOG_MEMORY: false,
  WARN_LOW_FPS: true,
  LOW_FPS_THRESHOLD: 30,
};

export default {
  OPTIMAL_CANVAS_CONFIG,
  OPTIMAL_CONTROLS_CONFIG,
  GEOMETRY_OPTIMIZATION,
  MATERIAL_OPTIMIZATION,
  LIGHTING_OPTIMIZATION,
  CACHE_CONFIG,
  YOUTUBE_OPTIMIZATION,
  PERFORMANCE_MONITORING,
};
