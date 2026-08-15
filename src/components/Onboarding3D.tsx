import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Shield, Cpu, Bot, MessagesSquare, Sparkles as SparkleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { answerQuestion, BOT_GREETINGS, SUGGESTIONS, type BotId } from '@/lib/lovabotKnowledge';

// ---------------------------------------------------------
// TRANSPARENT LOVA-ORB ANIMATION
// ---------------------------------------------------------
const LovaOrb = ({ color, isSpeaking }: { color: string; isSpeaking?: boolean }) => {
  return (
    <div className="lova-orb-scene" style={{ '--lova-orb-color': color } as React.CSSProperties}>
      <div className="lova-orb-glow" style={{ background: color }} />
      <div className={`lova-orb ${isSpeaking ? 'lova-orb-speaking' : ''}`}>
        <div className="lova-orb-reflection" />
      </div>
      <div className="lova-orb-ring" />
      <div className="lova-orb-ring lova-orb-ring-2" />
    </div>
  );
};

// ---------------------------------------------------------
// COMPACT TRANSPARENT ONBOARDING / ASSISTANT WIDGET
// ---------------------------------------------------------

const stepsData = [
  {
    name: "Lova-Bot",
    icon: <Bot className="w-4 h-4" />,
    color: "from-cyan-300 to-blue-600",
    orb: "linear-gradient(135deg,#67e8f9,#0ea5e9,#3b82f6)",
    text: "Je suis Lova-Bot ! Je t'accompagne dans tes premiers pas. N'hésite pas à explorer les vidéos et le magasin magique.",
  },
  {
    name: "Lova-AI",
    icon: <Cpu className="w-4 h-4" />,
    color: "from-sky-400 to-indigo-400",
    orb: "linear-gradient(135deg,#7dd3fc,#6366f1,#a855f7)",
    text: "Intelligence cristalline connectée. Je filtre et optimise tes recommandations pour un univers Lovanet sur-mesure.",
  },
  {
    name: "Lova King AI",
    icon: <Shield className="w-4 h-4" />,
    color: "from-amber-400 to-emerald-600",
    orb: "linear-gradient(135deg,#fbbf24,#34d399,#10b981)",
    text: "Je suis Lova King AI, l'esprit millénaire de la forêt numérique. Je protège l'écosystème et garantis la puissance de Lovanet.",
  }
];

type ChatMsg = { role: "user" | "bot"; text: string; link?: { label: string; to: string } };

export const Onboarding3D = () => {
  const [isVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Jamais d'ouverture automatique : le widget démarre toujours réduit.
  const [minimized, setMinimized] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const botId: BotId = step === 1 ? "lova-ai" : step === 2 ? "lova-king" : "lova-bot";

  useEffect(() => {
    setMessages([{ role: "bot", text: BOT_GREETINGS[botId] }]);
  }, [botId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const ask = (question: string) => {
    const userMsg = question.trim();
    if (!userMsg) return;
    setChatInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setIsTyping(true);
    setIsSpeaking(true);
    const reply = answerQuestion(userMsg, botId);
    window.setTimeout(() => {
      setIsTyping(false);
      setMessages((m) => [...m, { role: "bot", text: reply.text, link: reply.link }]);
      window.setTimeout(() => setIsSpeaking(false), 1500);
    }, 350);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    ask(chatInput);
  };

  useEffect(() => {
    setIsSpeaking(true);
    const timer = setTimeout(() => setIsSpeaking(false), 2500);
    return () => clearTimeout(timer);
  }, [step, minimized]);

  const handleClose = () => setMinimized(true);

  if (!isVisible) return null;

  const currentData = stepsData[step];

  if (minimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-3 z-[60] cursor-pointer sm:right-4 md:bottom-6 md:right-6"
        onClick={() => { setMinimized(false); }}
      >
        <div
          className="glass3d-btn relative flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-xl"
          aria-label="Ouvrir LovaBot"
        >
          <MessagesSquare className="h-6 w-6 text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" strokeWidth={1.6} />
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="dock-popup fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-3 right-3 z-[60] max-h-[78dvh] overflow-y-auto pointer-events-auto sm:left-5 sm:right-5 md:bottom-6 md:left-auto md:right-6 md:w-[400px] md:max-h-none md:overflow-visible"
      >
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)_inset]">

          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition text-white z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative h-[150px] w-full sm:h-[190px] md:h-[220px]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <LovaOrb color={currentData.orb} isSpeaking={isSpeaking} />
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-end border-t border-white/10 bg-black/60 p-4 text-center sm:p-5">
            <h3 className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentData.color} mb-2 flex items-center justify-center gap-2`}>
              <span className={`text-${currentData.color.split(' ')[1].replace('to-', '')}`}><SparkleIcon className="w-4 h-4" /></span>
              {currentData.name}
            </h3>

            <div className="mb-3 flex max-h-[190px] min-h-[110px] flex-col gap-2 overflow-y-auto custom-scrollbar rounded-lg border border-white/10 bg-white/5 p-2 text-left">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "self-end max-w-[85%]" : "self-start max-w-[92%]"}>
                  <div className={`rounded-xl px-2.5 py-1.5 text-[11px] leading-relaxed ${m.role === "user" ? "bg-white/20 text-white" : "bg-black/40 text-white/85 border border-white/10"}`}>
                    {m.text}
                  </div>
                  {m.link && (
                    <Link
                      to={m.link.to}
                      onClick={handleClose}
                      className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-white/20"
                    >
                      {m.link.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))}
              {isTyping && <div className="self-start text-[11px] text-white/50">…</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.slice(0, 3).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(q)}
                  className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-white/75 hover:bg-white/15"
                >
                  {q}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 mb-4 relative z-20">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Demander à ${currentData.name}...`}
                className="flex-1 bg-black/50 border border-white/20 rounded-full px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={isTyping || !chatInput.trim()}
                className={`px-3 rounded-full bg-gradient-to-r ${currentData.color} text-white font-bold text-xs shadow-lg disabled:opacity-50 transition-all`}
              >
                Envoyer
              </button>
            </form>

            <div className="flex justify-between items-center w-full mt-auto">
              <div className="flex gap-2">
                {stepsData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-gradient-to-r ' + currentData.color + ' w-4' : 'bg-white/20'}`}
                    aria-label={`Bot ${i + 1}`}
                  />
                ))}
              </div>
              <Button onClick={handleClose} size="sm" className="h-8 text-xs rounded-full bg-white/10 border border-white/20 font-bold text-white hover:bg-white/20 transition-all">
                Masquer <X className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
