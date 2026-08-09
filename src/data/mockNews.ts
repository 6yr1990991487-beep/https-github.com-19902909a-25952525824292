import { SEO_NEWS } from "@/data/seoNews";
import { IMPORTED_VIDEOS } from "@/data/importedVideos";

// Mix sources intelligently
const SOURCES = [
  { id: "anilist", name: "AniList" },
  { id: "anidb", name: "AniDB" },
  { id: "myanimelist", name: "MyAnimeList" },
  { id: "animenewsnetwork", name: "Anime News Network" },
  { id: "crunchyroll", name: "Crunchyroll News" },
  { id: "funimation", name: "Funimation Blog" },
  { id: "hidive", name: "HIDIVE News" },
  { id: "comicnatalie", name: "Comic Natalie" },
  { id: "famitsu", name: "Famitsu" },
  { id: "siliconera", name: "Siliconera" },
  { id: "kotaku", name: "Kotaku" },
  { id: "ign", name: "IGN Anime" },
  { id: "polygon", name: "Polygon Anime" },
  { id: "gematsu", name: "Gematsu" },
  { id: "animemotivation", name: "Anime Motivation" },
  { id: "mangamogura", name: "Manga Mogura" },
  { id: "shonenjump", name: "Shonen Jump" },
  { id: "vizmedia", name: "Viz Media" },
  { id: "kodansha", name: "Kodansha Comics" },
  { id: "yenpress", name: "Yen Press" },
  { id: "sevenseas", name: "Seven Seas Ent" },
  { id: "tokyootakumode", name: "Tokyo Otaku Mode" },
  { id: "qooapp", name: "QooApp" },
  { id: "soranews24", name: "SoraNews24" },
  { id: "animetrends", name: "Anime Trends" },
  { id: "livechart", name: "LiveChart.me" },
  { id: "animecorner", name: "Anime Corner" },
  { id: "jlist", name: "J-List Blog" },
  { id: "otakuusa", name: "Otaku USA" },
  { id: "animeuknews", name: "Anime UK News" },
  { id: "oricon", name: "Oricon News" },
  { id: "dengekionline", name: "Dengeki Online" },
  { id: "4gamer", name: "4Gamer" },
  { id: "vjump", name: "V-Jump" },
  { id: "animeanime", name: "Anime! Anime!" },
  { id: "webnewtype", name: "WebNewtype" },
  { id: "mantanweb", name: "Mantan Web" },
  { id: "animatetimes", name: "Animate Times" },
  { id: "cbr", name: "CBR Anime" },
  { id: "screenrant", name: "ScreenRant Anime" },
  { id: "dualshockers", name: "DualShockers" },
  { id: "nichegamer", name: "Niche Gamer" },
  { id: "rpgsite", name: "RPG Site" },
  { id: "destructoid", name: "Destructoid" },
  { id: "theverge", name: "The Verge Anime" },
  { id: "animehunch", name: "AnimeHunch" },
  { id: "mywaifulist", name: "MyWaifuList News" },
  { id: "sugoilite", name: "Sugoi Lite" },
  { id: "wsjmanga", name: "WSJ_manga" },
  { id: "lovanet", name: "Lovanet Officiel" }
];

export const getMockNews = (limit = 24, offset = 0) => {
  // Intelligent mixing of content:
  // Instead of just mapping SEO_NEWS sequentially, let's create a balanced, engaging feed
  const baseItems = SEO_NEWS.map((item, index) => {
    // Assign a random but deterministic source from the 50 sources
    const srcIndex = (index * 7 + 13) % SOURCES.length;
    const source = SOURCES[srcIndex];
    
    // Attach a related video excerpt to some items to push presentation
    let embed_video = undefined;
    if (index % 4 === 0) { // Every 4th article gets a video excerpt
      const vid = IMPORTED_VIDEOS[(index * 3) % IMPORTED_VIDEOS.length];
      if (vid && vid.source === "youtube") {
        embed_video = vid.external_id;
      }
    }

    return {
      id: item.id || `news-${index}`,
      slug: item.slug || `news-${index}`,
      title: item.title,
      description: item.description,
      excerpt: item.description,
      content: item.description,
      image: item.image,
      published_at: item.datePublished,
      source_name: source.name,
      source_group: source.name,
      author: item.author || source.name,
      categories: [item.category || "anime"],
      embed_video
    };
  });

  // Sort them so it's a mix of different categories and sources, simulating a real algorithm
  // A simple deterministic shuffle based on string length and index
  const items = [...baseItems].sort((a, b) => {
    const scoreA = (a.title.length % 5) * 10 - new Date(a.published_at).getTime() / 1000000000;
    const scoreB = (b.title.length % 5) * 10 - new Date(b.published_at).getTime() / 1000000000;
    return scoreB - scoreA; // descending
  });

  const homeData = {
    hero: items.slice(0, 3),
    featured: items.slice(3, 9),
    latest: items.slice(9, 21),
    rails: {
      anime: items.filter(i => i.categories.includes("anime")).slice(0, 10),
      manga: items.filter(i => i.categories.includes("manga")).slice(0, 10),
      streaming: items.filter(i => i.categories.includes("video")).slice(0, 10),
      gaming: items.filter(i => i.categories.includes("gaming") || i.categories.includes("video")).slice(0, 10),
      "pop-culture": items.filter(i => i.categories.includes("pop-culture") || i.categories.includes("anime")).slice(0, 10),
    },
    trending: items.slice(21, 26),
    calendar: items.slice(26, 31),
    sources: SOURCES,
    updated_at: new Date().toISOString()
  };

  const paginatedItems = items.slice(offset, offset + limit);

  const listingData = {
    items: paginatedItems,
    total: items.length,
    offset: offset,
    limit: limit,
    source: "all",
    categories: [
      { id: "anime", label: "Anime" },
      { id: "manga", label: "Manga" },
      { id: "video", label: "Streaming" },
      { id: "gaming", label: "Gaming" },
      { id: "pop-culture", label: "Pop Culture" },
    ]
  };

  return { items, homeData, listingData };
};
