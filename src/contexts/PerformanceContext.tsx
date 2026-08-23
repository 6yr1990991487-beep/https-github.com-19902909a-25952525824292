import { createContext, useContext, useEffect, useState } from "react";

const VIDEO_PREF_KEY = "site_disable_videos";
const VIDEO_PREF_MANUAL_KEY = "site_disable_videos_manual";

interface PerformanceContextType {
  disableAnimations: boolean;
  disableVideos: boolean;
  decorOverlayEnabled: boolean;
  toggleAnimations: () => void;
  toggleDecorOverlay: () => void;
  toggleVideos: () => void;
  isMobile: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [disableAnimations, setDisableAnimations] = useState(false);
  const [disableVideos, setDisableVideos] = useState(false);
  const [decorOverlayEnabled, setDecorOverlayEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1280;
      setIsMobile(mobile);
      return mobile;
    };
    
    const isMobileDevice = checkMobile();
    
    try {
      const savedAnimations = localStorage.getItem("site_disable_animations");
      const savedVideos = localStorage.getItem(VIDEO_PREF_KEY);
      const savedVideosManual = localStorage.getItem(VIDEO_PREF_MANUAL_KEY);
      const savedDecorOverlay = localStorage.getItem("site_decor_overlay_enabled");
      
      // If no saved preference and is mobile/tablet, default to animations disabled
      if (savedAnimations === null && isMobileDevice) {
        setDisableAnimations(true);
      } else if (savedAnimations !== null) {
        setDisableAnimations(JSON.parse(savedAnimations));
      }
      
      const shouldForcePreviewVisibility =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname.includes("preview") ||
          window.location.hostname.includes("emergent") ||
          window.location.port === "3000");

      // Preview hosts are forced to keep background video enabled to avoid stale localStorage hiding the whole loop.
      if (shouldForcePreviewVisibility) {
        try {
          localStorage.setItem(VIDEO_PREF_KEY, JSON.stringify(false));
          localStorage.setItem(VIDEO_PREF_MANUAL_KEY, "0");
          sessionStorage.setItem(VIDEO_PREF_KEY, JSON.stringify(false));
          sessionStorage.setItem(VIDEO_PREF_MANUAL_KEY, "0");
        } catch {}
        document.body.removeAttribute("data-hide-videos");
        setDisableVideos(false);
      } else if (savedVideosManual === "1") {
        setDisableVideos(JSON.parse(savedVideos ?? "false"));
      } else {
        setDisableVideos(false);
        localStorage.setItem(VIDEO_PREF_KEY, JSON.stringify(false));
        localStorage.setItem(VIDEO_PREF_MANUAL_KEY, "0");
      }

      if (savedDecorOverlay !== null) {
        setDecorOverlayEnabled(JSON.parse(savedDecorOverlay));
      } else {
        setDecorOverlayEnabled(true);
      }
    } catch {}

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // CSS class on <body> — survives React re-renders without DOM manipulation
  useEffect(() => {
    try { localStorage.setItem("site_disable_animations", JSON.stringify(disableAnimations)); } catch {}
  }, [disableAnimations]);

  // Force preview hosts to always keep videos visible
  useEffect(() => {
    const shouldForcePreviewVisibility =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("preview") ||
        window.location.hostname.includes("emergent") ||
        window.location.port === "3000");

    if (shouldForcePreviewVisibility) {
      document.body.removeAttribute("data-hide-videos");
      try {
        localStorage.setItem(VIDEO_PREF_KEY, JSON.stringify(false));
        localStorage.setItem(VIDEO_PREF_MANUAL_KEY, "0");
        sessionStorage.setItem(VIDEO_PREF_KEY, JSON.stringify(false));
        sessionStorage.setItem(VIDEO_PREF_MANUAL_KEY, "0");
      } catch {}
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("site_decor_overlay_enabled", JSON.stringify(decorOverlayEnabled)); } catch {}
    if (!decorOverlayEnabled) {
      document.body.setAttribute("data-hide-decors", "1");
    } else {
      document.body.removeAttribute("data-hide-decors");
    }
  }, [decorOverlayEnabled]);

  useEffect(() => {
    const shouldForcePreviewVisibility =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("preview") ||
        window.location.hostname.includes("emergent") ||
        window.location.port === "3000");

    // On preview hosts, NEVER apply data-hide-videos
    if (shouldForcePreviewVisibility) {
      document.body.removeAttribute("data-hide-videos");
    } else {
      try { localStorage.setItem(VIDEO_PREF_KEY, JSON.stringify(disableVideos)); } catch {}
      if (disableVideos) {
        document.body.setAttribute("data-hide-videos", "1");
      } else {
        document.body.removeAttribute("data-hide-videos");
        // Try to resume background/hero videos after they become visible again.
        window.requestAnimationFrame(() => {
          const nodes = document.querySelectorAll("video[data-bg-video], video.hero-banner-video");
          nodes.forEach((node) => {
            const video = node as HTMLVideoElement;
            video.muted = true;
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(() => {});
            }
          });
        });
      }
    }
  }, [disableVideos]);

  useEffect(() => {
    try { localStorage.setItem("site_decor_overlay_enabled", JSON.stringify(decorOverlayEnabled)); } catch {}
  }, [decorOverlayEnabled]);

  const toggleAnimations = () => setDisableAnimations((v) => !v);
  const toggleDecorOverlay = () => setDecorOverlayEnabled((v) => !v);
  const toggleVideos = () => {
    try { localStorage.setItem(VIDEO_PREF_MANUAL_KEY, "1"); } catch {}
    setDisableVideos((v) => !v);
  };

  // Make toggleAnimations apply changes immediately to body/localStorage
  const _toggleAnimationsImmediate = () => {
    setDisableAnimations((v) => {
      const next = !v;
      try { localStorage.setItem("site_disable_animations", JSON.stringify(next)); } catch {}
      if (next) document.body.setAttribute("data-hide-decors", "1");
      else document.body.removeAttribute("data-hide-decors");
      // notify listeners
      try { window.dispatchEvent(new Event("lovanet:decor-update")); } catch {}
      return next;
    });
  };

  return (
    <PerformanceContext.Provider value={{ disableAnimations, disableVideos, decorOverlayEnabled, toggleAnimations: _toggleAnimationsImmediate, toggleDecorOverlay, toggleVideos, isMobile }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within PerformanceProvider");
  }
  return context;
}
