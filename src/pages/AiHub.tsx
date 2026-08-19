import React, { useState, useEffect } from 'react';
import aiHubLongBanner from '@/assets/aihub-banner-v2.mp4.asset.json';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Environment, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Cpu, Shield, Search, PlayCircle, Gavel, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LovaBot, LovaBotEnv, LovaAI, LovaAIEnv, LovaKingAI, LovaKingEnv } from '@/components/bots/BotModels';
import { PageShell } from '@/components/PageShell';
import GlassMusicPlayer from '@/components/GlassMusicPlayer';

export const AiHub = () => {
  const [activeTab, setActiveTab] = useState('lova-bot');

  const renderContent = () => {
    switch (activeTab) {
      case 'lova-bot':
        return <TreasureHuntFeature />;
      case 'lova-ai':
        return <PlaylistFeature />;
      case 'lova-king':
        return <FortressVIPFeature />;
      default:
        return null;
    }
  };

  const render3D = () => {
    return (
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} className="w-full h-full">
        {activeTab === 'lova-bot' && (
          <>
            <ambientLight intensity={0.6} />
            <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={1} castShadow color="#ffffff" />
            <Environment preset="city" />
            <LovaBotEnv />
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              <LovaBot isSpeaking={false} />
            </Float>
          </>
        )}
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
      {/** Background video with runtime availability check; fallback shown if asset missing */}
      <BackgroundVideo src={aiHubLongBanner.url} />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 pb-12 pt-4">
        <div className="mb-8 flex justify-center">
          <GlassMusicPlayer className="w-full max-w-3xl" />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('lova-bot')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'lova-bot' ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-105' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <Bot className="w-5 h-5" /> Lova-Bot
          </button>
          <button
            onClick={() => setActiveTab('lova-ai')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'lova-ai' ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <Cpu className="w-5 h-5" /> Lova-AI
          </button>
          <button
            onClick={() => setActiveTab('lova-king')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'lova-king' ? 'bg-gradient-to-r from-amber-400 to-red-600 text-white shadow-lg shadow-red-500/20 scale-105' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <Shield className="w-5 h-5" /> Lova King AI
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md overflow-y-auto">
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
          <div className="bg-black/20 border border-white/5 rounded-3xl overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-black/50 px-4 py-1 rounded-full text-xs font-mono text-white/50 border border-white/10">
              LIVE RENDER
            </div>
            {render3D()}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

const BackgroundVideo: React.FC<{ src: string }> = ({ src }) => {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    (async () => {
      try {
        const res = await fetch(src, { method: 'HEAD', signal: controller.signal });
        if (!mounted) return;
        setAvailable(res.ok);
      } catch (e) {
        if (!mounted) return;
        setAvailable(false);
      } finally {
        clearTimeout(timeout);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [src]);

  if (available === null) {
    return <div className="ai-hub-bg-loading" aria-hidden />;
  }

  if (available === false) {
    return <div className="ai-hub-bg-fallback" aria-hidden />;
  }

  return (
    <video src={src} className="ai-hub-bg-video" autoPlay muted loop playsInline preload="auto" />
  );
};

const TreasureHuntFeature = () => {
  const [hunted, setHunted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleHunt = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHunted(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">Chasse aux Trésors</h2>
      <p className="text-slate-400 mb-8">Lova-Bot a caché des récompenses sur le site aujourd'hui !</p>
      <div className="flex-1 flex flex-col justify-center items-center">
        {!hunted ? (
          <div className="bg-emerald-950/30 border border-emerald-500/20 p-6 rounded-2xl text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">L'énigme du jour</h3>
            <p className="text-emerald-200/70 italic mb-6">"Je brille dans la nuit, mais je ne suis pas une étoile. Que suis-je ?"</p>
            <Button onClick={handleHunt} disabled={loading} className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all">
              {loading ? 'Recherche en cours...' : 'Fouiller la zone'}
            </Button>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-950/30 border border-emerald-500/50 p-6 rounded-2xl text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💎</span>
            </div>
            <h3 className="text-2xl font-bold text-emerald-400 mb-2">Trouvé !</h3>
            <p className="text-slate-300 mb-6">Félicitations, tu as gagné <strong className="text-white">50 LovaCoins</strong>.</p>
            <p className="text-xs text-slate-500">Reviens demain pour une nouvelle énigme.</p>
          </motion.div>
        )}
      </div>
    </div>
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
      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 mb-2">Playlist par Humeur</h2>
      <p className="text-slate-400 mb-8">Lova-AI génère une sélection parfaite basée sur ton état d'esprit.</p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Button onClick={() => generate('epic')} className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30">🔥 Épique</Button>
        <Button onClick={() => generate('chill')} className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30">😌 Détente</Button>
        <Button onClick={() => generate('sad')} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30">😢 Émotion</Button>
      </div>
      <div className="flex-1 bg-black/20 rounded-2xl p-4 border border-white/5">
        {loading && <div className="h-full flex items-center justify-center text-sky-400 animate-pulse">Lova-AI analyse tes goûts...</div>}
        {!loading && playlist.length === 0 && <div className="h-full flex items-center justify-center text-slate-600">Sélectionne une humeur pour commencer.</div>}
        {!loading && playlist.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
            {playlist.map((anime, i) => (
              <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center group hover:bg-white/10 transition-colors">
                <span className="font-bold text-slate-200">{anime}</span>
                <Button size="icon" variant="ghost" className="rounded-full text-sky-400 group-hover:bg-sky-500 group-hover:text-white"><PlayCircle className="w-5 h-5" /></Button>
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
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-600">La Forteresse VIP</h2>
        <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
          <Lock className="w-3 h-3" /> SÉCURITÉ OPTIMALE
        </div>
      </div>
      <p className="text-slate-400 mb-6">Lova King AI gère les accès exclusifs et les enchères secrètes.</p>
      <div className="space-y-6">
        <div className="bg-red-950/20 border border-red-500/20 p-5 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" /> Défis Exclusifs
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Regarder 5 épisodes VIP</span>
              <span className="text-amber-500 font-mono">2 / 5</span>
            </div>
            <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-red-500 w-2/5 h-full" />
            </div>
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-slate-300 line-through">Connecter son compte Discord</span>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-amber-950/20 border border-amber-500/20 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg">LIVE</div>
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-500" /> Enchère Secrète
          </h3>
          <p className="text-sm text-slate-400 mb-4">Figurine Holographique Lova King AI (Édition Limitée 1/10)</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Enchère Actuelle</p>
              <p className="text-3xl font-black text-amber-400 font-mono">{bid} <span className="text-sm text-amber-500/50">LC</span></p>
            </div>
            <Button onClick={placeBid} disabled={isHighest} className={`rounded-full font-bold transition-all ${isHighest ? 'bg-green-500/20 text-green-400 border-none hover:bg-green-500/20' : 'bg-gradient-to-r from-amber-500 to-red-600 text-white hover:scale-105'}`}>
              {isHighest ? 'Meilleur Enchérisseur' : `Enchérir ${bid + 100} LC`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
