import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  /** Row id in `imported_videos`. Preferred when known. */
  rowId?: string;
  /** Fallback: delete by source + external_id. */
  source?: "youtube" | "tiktok" | "prime";
  externalId?: string | null;
  onRemoved?: () => void;
  className?: string;
  label?: string;
};

/**
 * Tiny admin-only button to manually remove a video from the
 * `imported_videos` table (used on every service page).
 * Renders nothing for non-admins.
 */
export const AdminRemoveVideo = ({
  rowId,
  source,
  externalId,
  onRemoved,
  className,
  label = "Retirer",
}: Props) => {
  const isAdmin = useIsAdmin();
  const [busy, setBusy] = useState(false);
  if (!isAdmin) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    if (!rowId && !(source && externalId)) {
      toast({ title: "Suppression impossible", description: "Identifiant manquant." });
      return;
    }
    if (!window.confirm("Retirer définitivement cette vidéo de la bibliothèque ?")) return;
    setBusy(true);
    let query = supabase.from("imported_videos").delete();
    query = rowId
      ? query.eq("id", rowId)
      : query.eq("source", source!).eq("external_id", externalId!);
    const { error } = await query;
    setBusy(false);
    if (error) {
      toast({ title: "Échec", description: error.message });
      return;
    }
    toast({ title: "Vidéo retirée" });
    onRemoved?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title="Admin · retirer cette vidéo"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
        "bg-red-500/90 hover:bg-red-500 text-white shadow-lg border border-red-300/40",
        "transition-transform hover:scale-105 disabled:opacity-50",
        className,
      )}
    >
      <Trash2 className="w-3 h-3" /> {busy ? "…" : label}
    </button>
  );
};

export default AdminRemoveVideo;