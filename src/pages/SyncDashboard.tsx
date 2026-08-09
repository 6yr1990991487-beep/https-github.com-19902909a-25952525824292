import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw, CheckCircle2, XCircle, Clock, Users, Trash2, Shield, Activity, HardDrive, Edit, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = `${(import.meta.env.VITE_BACKEND_URL ?? "")}/api`;

type UserInfo = {
  user_id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

type Stats = {
  users: number;
  trailers_cached: number;
  favorites: number;
  news: number;
};

type AnimeOverride = {
  anime_id: number;
  title_romaji?: string;
  description?: string;
  cover_image?: string;
  hidden?: boolean;
};

export default function SyncDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncRows, setSyncRows] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<AnimeOverride[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<AnimeOverride>>({});

  useEffect(() => {
    // Basic protection
    if (user && user.role !== "admin" && user.email !== "admin@lovanet.com") {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, syncRes, overridesRes] = await Promise.all([
        fetch(`${API}/admin/stats`, { credentials: "include" }),
        fetch(`${API}/admin/users`, { credentials: "include" }),
        fetch(`${API}/admin/sync/status`, { credentials: "include" }),
        fetch(`${API}/admin/animes/overrides`, { credentials: "include" })
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers((await usersRes.json()).users);
      if (syncRes.ok) setSyncRows((await syncRes.json()).status);
      if (overridesRes.ok) setOverrides((await overridesRes.json()).overrides);
    } catch (e) {
      toast.error("Erreur de chargement Admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
        credentials: "include"
      });
      if (res.ok) {
        toast.success(`Rôle mis à jour: ${newRole}`);
        fetchDashboardData();
      } else {
        toast.error("Échec de la mise à jour");
      }
    } catch (e) {
      toast.error("Erreur serveur");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Supprimer cet utilisateur définitivement ?")) return;
    try {
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        toast.success("Utilisateur supprimé");
        fetchDashboardData();
      } else {
        toast.error("Impossible de supprimer");
      }
    } catch (e) {
      toast.error("Erreur serveur");
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch(`${API}/admin/cache/clear`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.deleted} entrées de cache purgées`);
        fetchDashboardData();
      }
    } catch (e) {
      toast.error("Erreur lors de la purge");
    }
  };

  const handleSaveOverride = async (anime_id: number) => {
    try {
      const payload = { ...editForm };
      if (!payload.title_romaji) delete payload.title_romaji;
      if (!payload.description) delete payload.description;
      if (!payload.cover_image) delete payload.cover_image;
      
      const res = await fetch(`${API}/admin/animes/${anime_id}/override`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      if (res.ok) {
        toast.success("Anime mis à jour");
        setEditingId(null);
        fetchDashboardData();
      }
    } catch (e) {
      toast.error("Erreur de mise à jour");
    }
  };

  const handleDeleteOverride = async (anime_id: number) => {
    try {
      const res = await fetch(`${API}/admin/animes/${anime_id}/override`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        toast.success("Remplacement supprimé (Anime restauré)");
        fetchDashboardData();
      }
    } catch (e) {
      toast.error("Erreur");
    }
  };

  if (!user) return <div className="p-20 text-center">Chargement...</div>;

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 py-8 flex flex-col md:flex-row gap-8" data-testid="admin-dashboard-page">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <h2 className="text-xl font-bold mb-6 font-heading text-primary">Admin Lovanet</h2>
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "dashboard" ? "bg-primary text-white" : "hover:bg-white/5"}`}
          >
            <Activity size={18} /> Vue d'ensemble
          </button>
          <button 
            onClick={() => setActiveTab("users")} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "users" ? "bg-primary text-white" : "hover:bg-white/5"}`}
          >
            <Users size={18} /> Utilisateurs
          </button>
          <button 
            onClick={() => setActiveTab("catalog")} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "catalog" ? "bg-primary text-white" : "hover:bg-white/5"}`}
          >
            <Edit size={18} /> Catalogue Animes
          </button>
          <button 
            onClick={() => setActiveTab("system")} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "system" ? "bg-primary text-white" : "hover:bg-white/5"}`}
          >
            <HardDrive size={18} /> Système & Cache
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
            <Button onClick={fetchDashboardData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>

          {activeTab === "dashboard" && stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card/60 border border-white/10 p-6 rounded-xl">
                <p className="text-muted-foreground text-sm font-medium mb-2">Total Utilisateurs</p>
                <p className="text-4xl font-bold text-white">{stats.users}</p>
              </div>
              <div className="bg-card/60 border border-white/10 p-6 rounded-xl">
                <p className="text-muted-foreground text-sm font-medium mb-2">Trailers en Cache</p>
                <p className="text-4xl font-bold text-white">{stats.trailers_cached}</p>
              </div>
              <div className="bg-card/60 border border-white/10 p-6 rounded-xl">
                <p className="text-muted-foreground text-sm font-medium mb-2">Total Favoris</p>
                <p className="text-4xl font-bold text-white">{stats.favorites}</p>
              </div>
              <div className="bg-card/60 border border-white/10 p-6 rounded-xl">
                <p className="text-muted-foreground text-sm font-medium mb-2">Articles News</p>
                <p className="text-4xl font-bold text-white">{stats.news}</p>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-card/40 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="p-4">Nom / Email</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Inscrit le</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.user_id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{u.name || "N/A"}</div>
                        <div className="text-muted-foreground text-xs">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === "admin" ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-white/10 text-white"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 flex items-center justify-end gap-2">
                        {u.role === "user" ? (
                          <Button onClick={() => handleRoleUpdate(u.user_id, "admin")} variant="outline" size="sm" className="h-8">
                            <Shield className="w-3 h-3 mr-2" /> Promouvoir Admin
                          </Button>
                        ) : (
                          <Button onClick={() => handleRoleUpdate(u.user_id, "user")} variant="outline" size="sm" className="h-8 text-amber-500 hover:text-amber-400">
                            Rétrograder
                          </Button>
                        )}
                        <Button onClick={() => handleDeleteUser(u.user_id)} variant="destructive" size="sm" className="h-8 w-8 p-0" disabled={u.email === "admin@lovanet.com"}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "catalog" && (
            <div className="space-y-6">
              <div className="bg-card/40 border border-white/10 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-4">Ajouter un remplacement (Override)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="number" placeholder="AniList ID" className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white text-sm" value={editForm.anime_id || ''} onChange={(e) => setEditForm({...editForm, anime_id: parseInt(e.target.value)})} />
                  <input type="text" placeholder="Nouveau Titre" className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white text-sm" value={editForm.title_romaji || ''} onChange={(e) => setEditForm({...editForm, title_romaji: e.target.value})} />
                  <input type="text" placeholder="URL Image Cover" className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white text-sm" value={editForm.cover_image || ''} onChange={(e) => setEditForm({...editForm, cover_image: e.target.value})} />
                  <label className="flex items-center gap-2 text-sm text-white">
                    <input type="checkbox" checked={editForm.hidden || false} onChange={(e) => setEditForm({...editForm, hidden: e.target.checked})} />
                    Cacher du catalogue (Suppression logique)
                  </label>
                  <Button onClick={() => editForm.anime_id && handleSaveOverride(editForm.anime_id)} className="col-span-full" disabled={!editForm.anime_id}>
                    Sauvegarder l'Override
                  </Button>
                </div>
              </div>

              <div className="bg-card/40 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/40 border-b border-white/10">
                    <tr>
                      <th className="p-4">Anime ID</th>
                      <th className="p-4">Titre (Override)</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {overrides.map(o => (
                      <tr key={o.anime_id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white font-medium">{o.anime_id}</td>
                        <td className="p-4 text-muted-foreground">{o.title_romaji || "-"}</td>
                        <td className="p-4">
                          {o.hidden ? <span className="text-red-500 flex items-center gap-1"><EyeOff size={14} /> Caché</span> : <span className="text-emerald-500">Modifié</span>}
                        </td>
                        <td className="p-4 text-right">
                          <Button onClick={() => handleDeleteOverride(o.anime_id)} variant="destructive" size="sm" className="h-8">
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {overrides.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">Aucun remplacement actif</div>}
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="bg-card/40 border border-white/10 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-2">Purge du Cache Trailers</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cette action supprimera tous les trailers stockés en cache. Lors de la prochaine requête, le système refera appel à l'API YouTube.
                </p>
                <Button onClick={handleClearCache} variant="destructive">
                  Purger le cache
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}