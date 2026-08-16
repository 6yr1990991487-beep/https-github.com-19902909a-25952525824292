import { useNavigate } from "react-router-dom";
import { User, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGamification } from "@/contexts/GamificationContext";
import { Button } from "@/components/ui/button";

export function UserProfileWidget() {
  const { user } = useAuth();
  const { lovaCoins, neonColor } = useGamification();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button 
        onClick={() => navigate("/login")} 
        variant="outline" 
        size="sm" 
        className="rounded-full border-white/10 bg-black/40 text-white/80 hover:bg-white/10 hover:text-white"
      >
        <User className="h-4 w-4 mr-2" />
        Se connecter
      </Button>
    );
  }

  return (
    <button
      onClick={() => navigate("/profile")}
      className="flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 text-white/80 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white hover:scale-105"
      title="Mon Profil"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
        <Coins className="h-3 w-3" /> {lovaCoins}
      </div>
      <div className="w-[1px] h-4 bg-white/20 mx-1" />
      {user.picture ? (
        <img 
          src={user.picture} 
          alt="Avatar" 
          className="w-6 h-6 rounded-full border border-white/20" 
          style={neonColor ? { borderColor: neonColor, boxShadow: `0 0 5px ${neonColor}` } : {}}
        />
      ) : (
        <User className="h-4 w-4" />
      )}
    </button>
  );
}
