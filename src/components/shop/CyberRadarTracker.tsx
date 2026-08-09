import { useState, useEffect } from "react";
import { Radar, Package, Box, MapPin, Truck, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const STEPS = [
  { id: "ordered", label: "Commande confirmée", icon: Box },
  { id: "prepared", label: "Préparation", icon: Package },
  { id: "shipped", label: "En transit spatial", icon: Truck },
  { id: "delivered", label: "Livré", icon: CheckCircle2 },
];

export function CyberRadarTracker({ orderId = "LVN-42069" }: { orderId?: string }) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(2); // 0 to 3

  // Animation effect for the radar
  const [angle, setAngle] = useState(0);
  
  useEffect(() => {
    if (!open) return;
    let raf: number;
    const animate = () => {
      setAngle(a => (a + 2) % 360);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-bold transition-all">
          <Radar className="w-3.5 h-3.5 animate-pulse" />
          Suivre {orderId}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-[#050a14] border-sky-500/30 text-white overflow-hidden p-0 rounded-2xl">
        <div className="relative p-6">
          {/* Cyberpunk Radar Visual */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48 rounded-full border border-sky-500/40 bg-sky-950/20 overflow-hidden shadow-[0_0_30px_rgba(14,165,233,0.2)]">
              {/* Radar Grid */}
              <div className="absolute inset-0 rounded-full border-2 border-sky-500/20 m-6" />
              <div className="absolute inset-0 rounded-full border-2 border-sky-500/20 m-12" />
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-sky-500/20" />
              <div className="absolute left-0 right-0 top-1/2 h-px bg-sky-500/20" />
              
              {/* Sweeper */}
              <div 
                className="absolute top-1/2 left-1/2 w-24 h-24 origin-top-left"
                style={{ 
                  transform: `rotate(${angle}deg)`,
                  background: 'conic-gradient(from 0deg at 0 0, transparent 0deg, rgba(14,165,233,0.5) 90deg)',
                }}
              />
              
              {/* Target Blip */}
              <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-sky-400 rounded-full shadow-[0_0_10px_#38bdf8] animate-ping" />
              
              {/* Center Node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-sky-300 rounded-full" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="font-display font-black text-xl text-sky-300 tracking-wider uppercase">Tracking {orderId}</h3>
            <p className="text-xs text-sky-500/70 mt-1 font-mono">Dernière position : Orbite basse terrestre</p>
          </div>

          <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-sky-500/30 before:to-transparent">
            {STEPS.map((step, idx) => {
              const active = idx === progress;
              const completed = idx < progress;
              return (
                <div key={step.id} className={`relative flex items-center gap-4 ${completed ? 'text-white' : active ? 'text-sky-300' : 'text-white/30'}`}>
                  <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${completed ? 'bg-sky-500 border-sky-400' : active ? 'bg-[#050a14] border-sky-400 shadow-[0_0_15px_#38bdf8]' : 'bg-[#050a14] border-white/20'}`}>
                    <step.icon className={`h-4 w-4 ${completed ? 'text-black' : active ? 'text-sky-400' : 'text-white/30'}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{step.label}</h4>
                    {active && <p className="text-[10px] text-sky-400 mt-0.5 animate-pulse">En cours...</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
