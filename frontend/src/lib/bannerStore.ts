// =============================================================
//  Stockage local des bannières vidéo téléversées (IndexedDB)
// -------------------------------------------------------------
//  Les clips sont enregistrés dans le navigateur de l'utilisateur
//  (hors-ligne, privé). Les métadonnées (titre, sous-titre...) sont
//  dans localStorage, les blobs vidéo dans IndexedDB.
// =============================================================

const DB_NAME = "lovanet-banners";
const STORE = "clips";
const META_KEY = "lovanet.banners.meta";

export type UploadedBannerMeta = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  createdAt: number;
};

export type UploadedBanner = UploadedBannerMeta & { url: string };

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getMeta(): UploadedBannerMeta[] {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || "[]");
  } catch {
    return [];
  }
}

function setMeta(list: UploadedBannerMeta[]) {
  localStorage.setItem(META_KEY, JSON.stringify(list));
}

export async function saveUploadedBanner(
  blob: Blob,
  meta: Omit<UploadedBannerMeta, "id" | "createdAt">
): Promise<UploadedBannerMeta> {
  const id = `up_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const db = await openDB();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  const full: UploadedBannerMeta = { id, createdAt: Date.now(), ...meta };
  const list = getMeta();
  list.push(full);
  setMeta(list);
  return full;
}

export async function getUploadedBanners(): Promise<UploadedBanner[]> {
  const list = getMeta();
  if (!list.length) return [];
  let db: IDBDatabase;
  try {
    db = await openDB();
  } catch {
    return [];
  }
  const out: UploadedBanner[] = [];
  for (const m of list) {
    const blob = await new Promise<Blob | undefined>((res) => {
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).get(m.id);
      r.onsuccess = () => res(r.result as Blob | undefined);
      r.onerror = () => res(undefined);
    });
    if (blob) out.push({ ...m, url: URL.createObjectURL(blob) });
  }
  return out;
}

export async function deleteUploadedBanner(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((res) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  } catch {
    /* ignore */
  }
  setMeta(getMeta().filter((m) => m.id !== id));
}
