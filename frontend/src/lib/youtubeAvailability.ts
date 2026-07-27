import { getVideoStatusSync, setVideoStatus } from "@/lib/videoAvailability";

export type YouTubeAvailabilityApiItem = {
  video_id: string;
  available: boolean;
  status: string;
  thumbnail?: string;
};

export async function hydrateYouTubeAvailability(videoIds: Array<string | null | undefined>) {
  const unique = Array.from(new Set(videoIds.map((value) => String(value || "").trim()).filter(Boolean)));
  const missing = unique.filter((videoId) => !getVideoStatusSync(videoId)).slice(0, 40);
  if (!missing.length) return [] as YouTubeAvailabilityApiItem[];

  const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/youtube/availability`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_ids: missing }),
  });

  if (!response.ok) {
    throw new Error(`youtube-availability-http-${response.status}`);
  }

  const json = await response.json();
  const items = Array.isArray(json?.items) ? (json.items as YouTubeAvailabilityApiItem[]) : [];
  for (const item of items) {
    setVideoStatus(item.video_id, item.available ? "ok" : "unavailable");
  }
  return items;
}
