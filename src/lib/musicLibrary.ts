import { supabase } from "@/integrations/supabase/client";

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  url: string;
  source: "archive" | "cloud" | "local";
};

export type MusicGenre = {
  id: string;
  label: string;
  query: string;
};

/** Genres d'ambiance libres de droits (netlabels / Creative Commons). */
export const MUSIC_GENRES: MusicGenre[] = [
  { id: "celtique", label: "Celtique", query: "celtic OR folk OR irish" },
  { id: "dubstep", label: "Dubstep", query: "dubstep OR bass OR drumandbass" },
  { id: "ambiance", label: "Ambiance", query: "ambient OR atmospheric OR drone" },
  { id: "electro", label: "Electro", query: "electronic OR techno OR house" },
  { id: "pop", label: "Pop", query: "pop OR synthpop OR indie" },
  { id: "jazz", label: "Jazz", query: "jazz OR swing OR blues" },
  { id: "lofi", label: "Lo-Fi", query: "lofi OR chillout OR downtempo" },
  { id: "rock", label: "Rock", query: "rock OR metal OR punk" },
  { id: "classique", label: "Classique", query: "classical OR piano OR orchestral" },
  { id: "cinema", label: "Cinéma", query: "soundtrack OR cinematic OR epic" },
];

const SEARCH_ENDPOINT = "https://archive.org/advancedsearch.php";
const ITEMS_PER_PAGE = 24;
const MAX_TRACKS_PER_ITEM = 4;

type ArchiveDoc = { identifier: string; title?: string; creator?: string | string[] };

function cleanTitle(name: string) {
  return decodeURIComponent(name)
    .replace(/\.mp3$/i, "")
    .replace(/^\d+[\s._-]+/, "")
    .replace(/_/g, " ")
    .trim();
}

async function expandItem(doc: ArchiveDoc, genre: string): Promise<MusicTrack[]> {
  try {
    const res = await fetch(`https://archive.org/metadata/${encodeURIComponent(doc.identifier)}`);
    if (!res.ok) return [];
    const data = await res.json();
    const files: any[] = Array.isArray(data?.files) ? data.files : [];
    const artist = Array.isArray(doc.creator) ? doc.creator[0] : doc.creator || "Artiste libre de droits";
    return files
      .filter((f) => typeof f?.name === "string" && /\.mp3$/i.test(f.name) && /mp3/i.test(f?.format || ""))
      .slice(0, MAX_TRACKS_PER_ITEM)
      .map((f) => ({
        id: `${doc.identifier}/${f.name}`,
        title: (typeof f.title === "string" && f.title.trim()) || cleanTitle(f.name),
        artist,
        genre,
        url: `https://archive.org/download/${encodeURIComponent(doc.identifier)}/${encodeURIComponent(f.name)}`,
        source: "archive" as const,
      }));
  } catch {
    return [];
  }
}

/** Charge une page de titres libres de droits pour un genre (catalogue de plusieurs milliers de morceaux). */
export async function fetchGenreTracks(genreId: string, page = 1, search = ""): Promise<MusicTrack[]> {
  const genre = MUSIC_GENRES.find((g) => g.id === genreId) || MUSIC_GENRES[0];
  const terms = search.trim()
    ? `mediatype:(audio) AND collection:(netlabels) AND (${search.trim().replace(/[():]/g, " ")})`
    : `mediatype:(audio) AND collection:(netlabels) AND subject:(${genre.query})`;
  const params = new URLSearchParams();
  params.set("q", terms);
  params.append("fl[]", "identifier");
  params.append("fl[]", "title");
  params.append("fl[]", "creator");
  params.set("rows", String(ITEMS_PER_PAGE));
  params.set("page", String(page));
  params.set("output", "json");
  const res = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`);
  if (!res.ok) return [];
  const json = await res.json();
  const docs: ArchiveDoc[] = json?.response?.docs || [];
  const groups = await Promise.all(docs.map((d) => expandItem(d, genre.id)));
  const seen = new Set<string>();
  return groups.flat().filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

/** Titres publiés dans la bibliothèque du site (envoyés par l'équipe). */
export async function fetchCloudTracks(): Promise<MusicTrack[]> {
  const { data, error } = await supabase
    .from("music_tracks")
    .select("id,title,artist,genre,url")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(300);
  if (error || !data) return [];
  const tracks = await Promise.all(
    data.map(async (row) => {
      let url = row.url;
      if (!/^https?:/i.test(url)) {
        const { data: signed } = await supabase.storage.from("music").createSignedUrl(url, 60 * 60 * 6);
        url = signed?.signedUrl || "";
      }
      return {
        id: row.id,
        title: row.title,
        artist: row.artist || "Bibliothèque Lovanet",
        genre: row.genre || "ambiance",
        url,
        source: "cloud" as const,
      };
    }),
  );
  return tracks.filter((t) => t.url);
}

/** Envoi admin : le fichier rejoint la bibliothèque partagée du site. */
export async function uploadCloudTrack(file: File, genre: string, artist: string) {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${genre}/${Date.now()}-${safeName}`;
  const { error: upErr } = await supabase.storage.from("music").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "audio/mpeg",
  });
  if (upErr) throw upErr;
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("music_tracks").insert({
    title: cleanTitle(file.name),
    artist: artist || "Bibliothèque Lovanet",
    genre,
    url: path,
    source: "upload",
    uploaded_by: userData.user?.id ?? null,
  });
  if (error) throw error;
}

/** Ajout visiteur : lecture locale immédiate, aucun envoi sur le serveur. */
export function makeLocalTrack(file: File): MusicTrack {
  return {
    id: `local-${file.name}-${file.size}`,
    title: cleanTitle(file.name),
    artist: "Mon fichier",
    genre: "local",
    url: URL.createObjectURL(file),
    source: "local",
  };
}