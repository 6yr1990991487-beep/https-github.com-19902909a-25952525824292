import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/");
      return;
    }

    const sessionId = match[1];
    
    // Clear hash cleanly
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    const exchange = async () => {
      try {
        const res = await fetch(`${(import.meta.env.VITE_BACKEND_URL ?? "")}/api/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
          credentials: "include"
        });
        
        if (!res.ok) throw new Error("Auth failed");
        
        // Reload to let AuthProvider pick up the new cookie
        window.location.reload();
      } catch (e) {
        console.error(e);
        navigate("/");
      }
    };
    
    exchange();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050914] text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        <p className="text-sm font-semibold tracking-widest uppercase">Connexion en cours...</p>
      </div>
    </div>
  );
}
