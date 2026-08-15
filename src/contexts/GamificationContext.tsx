import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export const DAILY_QUESTS = [
  { id: "read_news", label: "Lire 3 actualités", target: 3, reward: 50, icon: "📰" },
  { id: "watch_trailer", label: "Regarder un trailer", target: 1, reward: 30, icon: "🍿" },
  { id: "translate_item", label: "Traduire le site", target: 1, reward: 20, icon: "🌍" },
  { id: "shop_explore", label: "Lèche-vitrine", target: 10, reward: 30, icon: "👀" },
  { id: "shop_add_cart", label: "Ajouter au panier", target: 3, reward: 20, icon: "🛒" },
  { id: "shop_wishlist", label: "Mettre en favori", target: 5, reward: 30, icon: "❤️" },
];

export const EPIC_QUESTS = [
  { id: "epic_shop_purchase", label: "Premier Achat", desc: "Valider une commande", target: 1, reward: 500, icon: "🛍️" },
  { id: "epic_shop_vip", label: "Client VIP", desc: "Valider 10 commandes", target: 10, reward: 2000, icon: "👑" },
  { id: "epic_shop_whale", label: "Mécène Otaku", desc: "Dépenser 1000€ en magasin", target: 1000, reward: 5000, icon: "💎" },
  { id: "epic_news_reader", label: "Rat de bibliothèque", desc: "Lire 100 actualités", target: 100, reward: 1000, icon: "📚" },
];

type GamificationContextType = {
  lovaCoins: number;
  addCoins: (amount: number, reason: string) => void;
  achievements: string[];
  unlockedAvatars: string[];
  unlockAvatar: (id: string, cost: number) => boolean;
  unlockAchievement: (id: string) => void;
  neonColor: string | null;
  setNeonColor: (color: string | null) => void;
  epicProgress: Record<string, number>;
  incrementEpic: (questId: string, amount?: number) => void;
  questProgress: Record<string, number>;
  incrementQuest: (questId: string) => void;
};

const GamificationContext = createContext<GamificationContextType>({
  lovaCoins: 0,
  addCoins: () => {},
  achievements: [],
  unlockedAvatars: [],
  unlockAvatar: () => false,
  unlockAchievement: () => {},
  neonColor: null,
  setNeonColor: () => {},
  questProgress: {},
  incrementQuest: () => {},
  epicProgress: {},
  incrementEpic: () => {},
});

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [epicProgress, setEpicProgress] = useState<Record<string, number>>({});
  const [lovaCoins, setLovaCoins] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [unlockedAvatars, setUnlockedAvatars] = useState<string[]>([]);
  const [neonColor, setNeonColor] = useState<string | null>(null);
  const [questProgress, setQuestProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const savedCoins = localStorage.getItem("lovanet.coins");
      if (savedCoins) setLovaCoins(parseInt(savedCoins, 10));

            const savedAchievements = localStorage.getItem("lovanet.achievements");
      if (savedAchievements) setAchievements(JSON.parse(savedAchievements));

      const savedAvatars = localStorage.getItem("lovanet.unlockedAvatars");
      if (savedAvatars) setUnlockedAvatars(JSON.parse(savedAvatars));

      const savedColor = localStorage.getItem("lovanet.neonColor");
      if (savedColor) setNeonColor(savedColor);

      const today = new Date().toISOString().split("T")[0];
      const savedEpic = localStorage.getItem("lovanet.epicProgress");
      if (savedEpic) setEpicProgress(JSON.parse(savedEpic));

      const savedDate = localStorage.getItem("lovanet.questsDate");
      if (savedDate !== today) {
        setQuestProgress({});
        localStorage.setItem("lovanet.questsDate", today);
        localStorage.removeItem("lovanet.questProgress");
      } else {
        const savedProgress = localStorage.getItem("lovanet.questProgress");
        if (savedProgress) setQuestProgress(JSON.parse(savedProgress));
      }
    } catch {}
  }, []);

  const addCoins = useCallback((amount: number, reason: string) => {
    setLovaCoins(prev => {
      const next = prev + amount;
      localStorage.setItem("lovanet.coins", next.toString());
      toast.success(`+${amount} LovaCoins !`, { description: reason });
      return next;
    });
  }, []);

  
  const unlockAvatar = useCallback((id: string, cost: number) => {
    let success = false;
    setLovaCoins(prev => {
      if (prev >= cost) {
        const nextCoins = prev - cost;
        localStorage.setItem("lovanet.coins", nextCoins.toString());
        setUnlockedAvatars(prevAvatars => {
          const nextAvatars = [...prevAvatars, id];
          localStorage.setItem("lovanet.unlockedAvatars", JSON.stringify(nextAvatars));
          return nextAvatars;
        });
        toast.success(`Avatar débloqué !`, { description: `-${cost} LovaCoins` });
        success = true;
        return nextCoins;
      } else {
        toast.error("Fonds insuffisants", { description: "Vous n'avez pas assez de LovaCoins." });
        return prev;
      }
    });
    return success;
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("lovanet.achievements", JSON.stringify(next));
      toast.success("Succès débloqué !", { description: "Voir mon profil" });
      return next;
    });
  }, []);

  const incrementEpic = useCallback((questId: string, amount: number = 1) => {
    setEpicProgress(prev => {
      const current = prev[questId] || 0;
      const quest = EPIC_QUESTS.find(q => q.id === questId);
      
      if (!quest || current >= quest.target) return prev;

      const nextVal = Math.min(current + amount, quest.target);
      const nextProgress = { ...prev, [questId]: nextVal };
      localStorage.setItem("lovanet.epicProgress", JSON.stringify(nextProgress));

      if (nextVal >= quest.target && current < quest.target) {
        setTimeout(() => {
          addCoins(quest.reward, `Quête Épique terminée : ${quest.label}`);
          unlockAchievement(quest.id);
        }, 500);
      }

      return nextProgress;
    });
  }, [addCoins, unlockAchievement]);

  const incrementQuest = useCallback((questId: string) => {
    setQuestProgress(prev => {
      const current = prev[questId] || 0;
      const quest = DAILY_QUESTS.find(q => q.id === questId);
      if (!quest || current >= quest.target) return prev;

      const nextVal = current + 1;
      const nextProgress = { ...prev, [questId]: nextVal };
      localStorage.setItem("lovanet.questProgress", JSON.stringify(nextProgress));

      if (nextVal === quest.target) {
        // Quest completed!
        setTimeout(() => {
          addCoins(quest.reward, `Quête terminée : ${quest.label}`);
        }, 500);
      }

      return nextProgress;
    });
  }, [addCoins]);

  const handleSetNeonColor = useCallback((color: string | null) => {
    setNeonColor(color);
    if (color) localStorage.setItem("lovanet.neonColor", color);
    else localStorage.removeItem("lovanet.neonColor");
  }, []);

  return (
    <GamificationContext.Provider value={{ 
      lovaCoins, 
      addCoins, 
      achievements, 
      unlockAchievement,
      unlockedAvatars,
      unlockAvatar, 
      neonColor, 
      setNeonColor: handleSetNeonColor,
      questProgress,
      incrementQuest,
      epicProgress,
      incrementEpic
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  return useContext(GamificationContext);
}
