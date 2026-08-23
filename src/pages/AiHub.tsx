import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Environment, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Cpu, Shield, Search, PlayCircle, Gavel, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LovaAI, LovaAIEnv, LovaKingAI, LovaKingEnv } from '@/components/bots/BotModels';
import { PageShell } from '@/components/PageShell';
import GlassMusicPlayer from '@/components/GlassMusicPlayer';

export const AiHub = () => {
  const [activeTab, setActiveTab] = useState('lova-bot');

  const renderContent = () => {
    switch (activeTab) {
      case 'lova-bot':
        return null;
      case 'lova-ai':
        return <PlaylistFeature />;
      case 'lova-king':
        return <FortressVIPFeature />;
      default:
        return null;
    }
  };

  const render3D = () => {
    if (activeTab === 'lova-bot') return null;
    return (
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} className="w-full h-full">
        {activeTab === 'lova-ai' && (
          <>
            <ambientLight intensity={0.8} />
            <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={1.5} castShadow color="#ffffff" />
            <Environment preset="city" />
            <LovaAIEnv />
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              <LovaAI isSpeaking={false} />
            </Float>
          </>
        )}
        {activeTab === 'lova-king' && (
          <>
            <color attach="background" args={['#050505']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} color="#fbbf24" castShadow />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <LovaKingEnv />
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              <LovaKingAI isSpeaking={false} />
            </Float>
          </>
        )}
        <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 3} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    );
  };

  return (
    <PageShell className="page-nav-glass ai-hub-page">
      <div className="ai-hub-bg-fallback" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-4">
        <div className="mb-6 flex justify-center">
          <GlassMusicPlayer className="w-full max-w-3xl" />
        </div>

        <div className="mb-5 flex flex-wrap justify-center gap-2.5">
          <button
            onClick={() => setActiveTab('lova-bot')}
            className={`glass3d-btn flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${activeTab === 'lova-bot' ? 'is-active scale-105' : 'text-white/70 hover:text-white'}`}
          >
            <Bot className="h-4 w-4" /> Lova-Bot
          </button>
          <button
            onClick={() => setActiveTab('lova-ai')}
            className={`glass3d-btn flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${activeTab === 'lova-ai' ? 'is-active scale-105' : 'text-white/70 hover:text-white'}`}
          >
            <Cpu className="h-4 w-4" /> Lova-AI
          </button>
          <button
            onClick={() => setActiveTab('lova-king')}
            className={`glass3d-btn flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${activeTab === 'lova-king' ? 'is-active scale-105' : 'text-white/70 hover:text-white'}`}
          >
            <Shield className="h-4 w-4" /> Lova King AI
          </button>
        </div>

        {activeTab !== 'lova-bot' && (
          <div className="mx-auto grid h-auto max-w-5xl grid-cols-1 gap-4 lg:h-[470px] lg:grid-cols-2">
          <div className="glass3d-panel glass3d-surface overflow-y-auto rounded-[1.6rem] border border-white/22 bg-white/[0.08] p-4 backdrop-blur-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="glass3d-panel glass3d-surface relative overflow-hidden rounded-[1.6rem] border border-white/18 bg-white/[0.08] backdrop-blur-2xl">
            <div className="absolute left-3 top-3 z-10 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-black tracking-[0.16em] text-white/75">
              LIVE RENDER
            </div>
            {render3D()}
          </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

const PlaylistFeature = () => {
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = (mood: string) => {
    setLoading(true);
    setPlaylist([]);
    setTimeout(() => {
      setLoading(false);
      if (mood === 'epic') setPlaylist(['Attack on Titan', 'Jujutsu Kaisen', 'Demon Slayer']);
      if (mood === 'chill') setPlaylist(['Yuru Camp', 'Frieren', 'Spy x Family']);
      if (mood === 'sad') setPlaylist(['Your Lie in April', 'Clannad', 'Violet Evergarden']);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="mb-1 text-2xl font-black text-white">Playlist par Humeur</h2>
      <p className="mb-5 text-sm text-white/72">Lova-AI génère une sélection basée sur ton état d'esprit.</p>
      <div className="mb-5 grid grid-cols-3 gap-2">
        <Button onClick={() => generate('epic')} className="h-8 border border-white/35 bg-white/12 px-2 text-xs text-white hover:bg-white/22">Épique</Button>
        <Button onClick={() => generate('chill')} className="h-8 border border-white/35 bg-white/12 px-2 text-xs text-white hover:bg-white/22">Détente</Button>
        <Button onClick={() => generate('sad')} className="h-8 border border-white/35 bg-white/12 px-2 text-xs text-white hover:bg-white/22">Émotion</Button>
      </div>
      <div className="flex-1 rounded-2xl border border-white/20 bg-white/[0.08] p-3 backdrop-blur-xl">
        {loading && <div className="flex h-full items-center justify-center text-sm text-white/85 animate-pulse">Lova-AI analyse tes goûts...</div>}
        {!loading && playlist.length === 0 && <div className="flex h-full items-center justify-center text-sm text-white/55">Sélectionne une humeur pour commencer.</div>}
        {!loading && playlist.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
            {playlist.map((anime, i) => (
              <div key={i} className="group flex items-center justify-between rounded-xl border border-white/15 bg-white/8 px-3 py-2 transition-colors hover:bg-white/14">
                <span className="text-sm font-bold text-white/92">{anime}</span>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-white/80 group-hover:bg-white/25 group-hover:text-white"><PlayCircle className="h-4 w-4" /></Button>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const FortressVIPFeature = () => {
  const [bid, setBid] = useState(4500);
  const [isHighest, setIsHighest] = useState(false);

  const placeBid = () => {
    setBid(prev => prev + 100);
    setIsHighest(true);
    setTimeout(() => setIsHighest(false), 5000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-2xl font-black text-white">La Forteresse VIP</h2>
        <div className="flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/85">
          <Lock className="h-3 w-3" /> SÉCURITÉ
        </div>
      </div>
      <p className="mb-4 text-sm text-white/72">Lova King AI gère les accès exclusifs et les enchères secrètes.</p>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/[0.08] p-4 backdrop-blur-xl">
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-white">
            <Shield className="h-4 w-4 text-white/85" /> Défis Exclusifs
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/82">Regarder 5 épisodes VIP</span>
              <span className="font-mono text-white">2 / 5</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-2/5 rounded-full bg-white/70" />
            </div>
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-white/70 line-through">Connecter son compte Discord</span>
              <CheckCircle2 className="h-4 w-4 text-white/80" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.08] p-4 backdrop-blur-xl">
          <div className="absolute right-0 top-0 rounded-bl-lg border-l border-b border-white/20 bg-white/18 px-2.5 py-1 text-[10px] font-black text-white/85">LIVE</div>
          <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-white">
            <Gavel className="h-4 w-4 text-white/85" /> Enchère Secrète
          </h3>
          <p className="mb-4 text-xs text-white/68">Figurine Holographique Lova King AI (Édition Limitée 1/10)</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-white/55">Enchère Actuelle</p>
              <p className="font-mono text-2xl font-black text-white">{bid} <span className="text-xs text-white/65">LC</span></p>
            </div>
            <Button onClick={placeBid} disabled={isHighest} className={`rounded-full border border-white/35 bg-white/15 px-3 text-xs font-bold text-white transition-all hover:bg-white/25 ${isHighest ? 'opacity-85' : ''}`}>
              {isHighest ? 'Meilleur Enchérisseur' : `Enchérir ${bid + 100} LC`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
