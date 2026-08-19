import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";

const API = (import.meta.env.VITE_BACKEND_URL ?? "") + "/api";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [compact, setCompact] = useState(false);
  const { login } = useAuth();

  const handleGoogleSuccess = async (response: any) => {
    try {
      const res = await fetch(`${API}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Google auth failed");
      login(data);
      toast.success("Connecté avec succès");
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e.message || "Erreur de connexion Google");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("La connexion Google a échoué."),
    flow: "implicit",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const body = isRegister ? { email, password, name } : { email, password };
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include"
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentification échouée");
      
      login(data);
      toast.success(isRegister ? "Inscription réussie !" : "Connexion réussie !");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-background">
      <video
        className="fixed inset-0 w-full h-full object-cover pointer-events-none opacity-20"
        autoPlay
        loop
        muted
        playsInline
        src="/global-bg-web.mp4"
      />

      <motion.div initial={{ opacity: 0, y: -8, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.36 }} className={`fixed right-6 top-16 z-50 transform-gpu transition-all duration-500 ${compact ? 'translate-y-0 scale-95' : ''}`}>
        <motion.div whileHover={{ translateY: -4 }} className={`w-full max-w-md ${compact ? 'w-48' : 'w-full max-w-md'} glass-panel p-4 ${compact ? 'py-2 px-3' : 'p-8'} rounded-2xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]`} style={{ perspective: 1200 }}>
          <div className="login-deco one animate" />
          <div className="login-deco two animate" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center shadow-[inset_0_2px_6px_rgba(255,255,255,0.06),0_12px_30px_-6px_rgba(34,211,238,0.12)]">
                <img src="/lovanet-icon-32.png?v=16" alt="Lovanet" className="h-6 w-6" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-foreground">{compact ? 'Lovanet' : (isRegister ? "Créer un compte" : "Se connecter")}</div>
                {!compact && <div className="text-xs text-muted-foreground">Accède à ton compte sans quitter la page</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button title="Aide" onClick={() => alert('Besoin d\'aide pour vous connecter ? Contactez support@lovanet.fr')} className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/10 hover:bg-black/20 text-white/90" aria-label="Aide connexion">
                <span className="text-sm font-bold">?</span>
              </button>
              <button onClick={() => setCompact((c) => !c)} className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-black/20 hover:bg-black/30 text-white/90" aria-label="Réduire/ouvrir panneau">
                {compact ? '+' : '—'}
              </button>
            </div>
          </div>

          {!compact && (
            <div className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
                {isRegister && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nom complet</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-foreground">Mot de passe</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="col-span-2 w-full glass-btn text-primary-foreground font-medium py-3 rounded-lg transition-colors mt-2 disabled:opacity-50"
                    data-testid="submit-auth-btn"
                  >
                    {isLoading ? "Patientez..." : isRegister ? "S'inscrire" : "Se connecter"}
                  </button>
                </div>
              </form>

              <div className="mt-4 flex items-center justify-between">
                <span className="w-1/5 border-b border-border"></span>
                <span className="text-xs text-muted-foreground uppercase">Ou continuer avec</span>
                <span className="w-1/5 border-b border-border"></span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button onClick={() => googleLogin()} className="flex items-center gap-3 w-full justify-center glass-btn glass-btn-ghost transition-all">
                  <img src="/icons/invite_192.png" alt="Google" className="h-6 w-6 rounded-md" />
                  <span className="text-sm font-medium">Continuer avec Google</span>
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-secondary-foreground">
                {isRegister ? "Déjà un compte ?" : "Pas encore de compte ?"}
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="ml-2 text-primary font-medium hover:underline"
                >
                  {isRegister ? "Se connecter" : "S'inscrire"}
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}