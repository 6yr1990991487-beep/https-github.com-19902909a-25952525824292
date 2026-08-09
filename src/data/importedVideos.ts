export type ImportedVideo = {
  id: string;
  source: "youtube" | "tiktok" | "prime";
  external_id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  published_at: string;
  episode?: string | null;
  created_at?: string;
};

export const IMPORTED_VIDEOS: ImportedVideo[] = [
  {
    id: "yt-1",
    source: "youtube",
    external_id: "LHtdKWJdif4",
    title: "Attack on Titan - Trailer Officiel",
    thumbnail_url: "https://i.ytimg.com/vi/LHtdKWJdif4/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=LHtdKWJdif4",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "yt-2",
    source: "youtube",
    external_id: "6vMuWuWlW4I",
    title: "Demon Slayer - Nouveau Trailer",
    thumbnail_url: "https://i.ytimg.com/vi/6vMuWuWlW4I/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=6vMuWuWlW4I",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "yt-3",
    source: "youtube",
    external_id: "RIyb52EMx8c",
    title: "Jujutsu Kaisen - Opening",
    thumbnail_url: "https://i.ytimg.com/vi/RIyb52EMx8c/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=RIyb52EMx8c",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "yt-4",
    source: "youtube",
    external_id: "bGFUthZjGd4",
    title: "So It's Something Else 😂",
    thumbnail_url: "https://i.ytimg.com/vi/bGFUthZjGd4/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=bGFUthZjGd4",
    published_at: new Date(Date.now() - 100000).toISOString(),
    created_at: new Date(Date.now() - 100000).toISOString(),
  },
  {
    id: "yt-5",
    source: "youtube",
    external_id: "5Fr9M1GBDBo",
    title: "You Did A Good Job 😂",
    thumbnail_url: "https://i.ytimg.com/vi/5Fr9M1GBDBo/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=5Fr9M1GBDBo",
    published_at: new Date(Date.now() - 200000).toISOString(),
    created_at: new Date(Date.now() - 200000).toISOString(),
  },
  {
    id: "yt-6",
    source: "youtube",
    external_id: "i0Pz8tmOy8o",
    title: "I Was Working So Much Harder! 😂",
    thumbnail_url: "https://i.ytimg.com/vi/i0Pz8tmOy8o/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=i0Pz8tmOy8o",
    published_at: new Date(Date.now() - 300000).toISOString(),
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "yt-7",
    source: "youtube",
    external_id: "E6X7VsKuMsM",
    title: "I'm Just So Impressed With Your Determination 😂",
    thumbnail_url: "https://i.ytimg.com/vi/E6X7VsKuMsM/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=E6X7VsKuMsM",
    published_at: new Date(Date.now() - 400000).toISOString(),
    created_at: new Date(Date.now() - 400000).toISOString(),
  },
  {
    id: "yt-8",
    source: "youtube",
    external_id: "DtEDLCrliHs",
    title: "You Haven't Forgotten About The Task At Hand 😂",
    thumbnail_url: "https://i.ytimg.com/vi/DtEDLCrliHs/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=DtEDLCrliHs",
    published_at: new Date(Date.now() - 500000).toISOString(),
    created_at: new Date(Date.now() - 500000).toISOString(),
  },
  {
    id: "yt-9",
    source: "youtube",
    external_id: "S0BmS2xG8tg",
    title: "What Do You Want The Most ? GOLD 😂",
    thumbnail_url: "https://i.ytimg.com/vi/S0BmS2xG8tg/hqdefault.jpg",
    video_url: "https://www.youtube.com/watch?v=S0BmS2xG8tg",
    published_at: new Date(Date.now() - 600000).toISOString(),
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  // TIKTOK
  {
    id: "tk-1",
    source: "tiktok",
    external_id: "7152000000000000001",
    title: "TikTok Anime Edit 1",
    thumbnail_url: "https://placehold.co/400x600/1a1a2e/cyan?text=TikTok+1",
    video_url: "https://www.tiktok.com/@user/video/7152000000000000001",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "tk-2",
    source: "tiktok",
    external_id: "7152000000000000002",
    title: "TikTok Anime Edit 2",
    thumbnail_url: "https://placehold.co/400x600/1a1a2e/magenta?text=TikTok+2",
    video_url: "https://www.tiktok.com/@user/video/7152000000000000002",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  // PRIME
  {
    id: "pr-1",
    source: "prime",
    external_id: "pr-vid-1",
    title: "Prime Video Anime Trailer 1",
    thumbnail_url: "https://placehold.co/600x400/1a1a2e/cyan?text=Prime+1",
    video_url: "https://www.primevideo.com/detail/0",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }
];