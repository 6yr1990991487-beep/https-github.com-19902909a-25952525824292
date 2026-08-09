import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type User = {
  user_id: string;
  email: string;
  name: string;
  role?: string;
  picture?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  favorites: number[];
  toggleFavorite: (id: number) => Promise<void>;
  ratings: Record<number, number>;
  rateAnime: (id: number, rating: number) => Promise<void>;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateAvatar: (url: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  favorites: [],
  toggleFavorite: async () => {},
  ratings: {},
  rateAnime: async () => {},
  login: () => {},
  logout: async () => {},
  updateAvatar: async () => {},
});

const API = (import.meta.env.VITE_BACKEND_URL ?? "") + "/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auth/me`, { credentials: "include" });
      if (!res.ok) throw new Error("Not logged in");
      const data = await res.json();
      setUser(data);
      
      const favRes = await fetch(`${API}/favorites`, { credentials: "include" });
      if (favRes.ok) {
        const favData = await favRes.json();
        setFavorites(favData.favorites || []);
      }
      const ratRes = await fetch(`${API}/ratings`, { credentials: "include" });
      if (ratRes.ok) {
        const ratData = await ratRes.json();
        const ratMap: Record<number, number> = {};
        for (const r of ratData.ratings || []) {
          ratMap[r.anime_id] = r.rating;
        }
        setRatings(ratMap);
      }
    } catch {
      setUser(null);
      setFavorites([]);
      setRatings({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const updateAvatar = async (url: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/auth/me/avatar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ picture: url }),
        credentials: "include"
      });
      if (res.ok) {
        setUser({ ...user, picture: url });
      }
    } catch (e) {
      console.error("Failed to update avatar", e);
    }
  };

  const rateAnime = async (animeId: number, rating: number) => {
    if (!user) {
      setRatings(prev => ({ ...prev, [animeId]: rating }));
      return;
    }
    
    setRatings(prev => ({ ...prev, [animeId]: rating }));
    try {
      await fetch(`${API}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: animeId, rating }),
        credentials: "include"
      });
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setUser(null);
    setFavorites([]);
  };

  const toggleFavorite = async (animeId: number) => {
    if (!user) {
      const prev = [...favorites];
      const next = prev.includes(animeId) ? prev.filter(id => id !== animeId) : [...prev, animeId];
      setFavorites(next);
      return;
    }
    
    const isAdding = !favorites.includes(animeId);
    setFavorites(prev => isAdding ? [...prev, animeId] : prev.filter(id => id !== animeId));
    
    try {
      const res = await fetch(`${API}/favorites${isAdding ? '' : `/${animeId}`}`, {
        method: isAdding ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: isAdding ? JSON.stringify({ anime_id: animeId }) : undefined,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to sync");
    } catch (e) {
      console.error(e);
      setFavorites(prev => !isAdding ? [...prev, animeId] : prev.filter(id => id !== animeId));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, favorites, toggleFavorite, ratings, rateAnime, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
