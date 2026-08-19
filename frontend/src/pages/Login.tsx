import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { Navbar } from "../components/Navbar";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    try {
      const prev = localStorage.getItem('lovanet.nav.style');
      (window as any).__lovanet_prev_nav_style = prev;
      window.dispatchEvent(new CustomEvent('navstyle:change', { detail: null }));
    } catch {}
    return () => {
      try {
        const prev = (window as any).__lovanet_prev_nav_style;
        if (prev !== undefined && prev !== null) {
          window.dispatchEvent(new CustomEvent('navstyle:change', { detail: prev }));
        }
      } catch {}
    };
  }, []);

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
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-20 sm:pt-24">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isRegister ? "Créer un compte" : "Bon retour"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isRegister ? "Rejoignez Lovanet aujourd'hui" : "Connectez-vous pour continuer"}
          </p>
        </div>

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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="votre@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-medium py-3 rounded-lg transition-colors mt-6 disabled:opacity-50"
            data-testid="submit-auth-btn"
          >
            {isLoading ? "Patientez..." : isRegister ? "S'inscrire" : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-border"></span>
          <span className="text-xs text-muted-foreground uppercase">Ou continuer avec</span>
          <span className="w-1/5 border-b border-border"></span>
        </div>

        <div className="mt-6 flex justify-center w-full">
            <div className="w-full relative [&>div]:!w-full [&>div>div]:!w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast.error("La connexion Google a échoué.");
                }}
                useOneTap
              />
            </div>
        </div>

        <p className="mt-8 text-center text-sm text-secondary-foreground">
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
      </div>
    </>
  );
}