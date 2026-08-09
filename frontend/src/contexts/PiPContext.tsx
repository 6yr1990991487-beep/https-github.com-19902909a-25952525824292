import React, { createContext, useContext, useState, ReactNode } from "react";

type PiPContextType = {
  videoId: string | null;
  playVideo: (id: string) => void;
  closeVideo: () => void;
};

const PiPContext = createContext<PiPContextType | undefined>(undefined);

export function PiPProvider({ children }: { children: ReactNode }) {
  const [videoId, setVideoId] = useState<string | null>(null);

  const playVideo = (id: string) => setVideoId(id);
  const closeVideo = () => setVideoId(null);

  return (
    <PiPContext.Provider value={{ videoId, playVideo, closeVideo }}>
      {children}
    </PiPContext.Provider>
  );
}

export function usePiP() {
  const context = useContext(PiPContext);
  if (!context) throw new Error("usePiP must be used within PiPProvider");
  return context;
}
