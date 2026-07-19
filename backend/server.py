from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Any, Dict, List, Optional
from pathlib import Path
from datetime import datetime, timezone
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import asyncio
import html
import json
import logging
import os
import re
import urllib.parse
import urllib.request
import uuid

ROOT_DIR = Path(__file__).parent
APP_DIR = ROOT_DIR.parent
PUBLIC_DIR = APP_DIR / "frontend" / "public"
MANIFEST_PATH = APP_DIR / "extraction" / "manifest" / "lovanet_manifest.json"
GOOGLE_CREDENTIALS_PATH = Path(os.environ.get("GOOGLE_SEARCH_CONSOLE_CREDENTIALS_FILE", "/tmp/google-search-console-service-account.json"))
GOOGLE_SITE_VERIFICATION = "eDW28NAvAT9tr_dkYRKphCLRed_tlkJefXfYLvPbqd0"
SEARCH_CONSOLE_PROPERTIES = [
    "https://lovanet.fr/",
    "https://animemomentsofficiel.fr/",
    "https://animeofficiel.fr/",
]
SEARCH_CONSOLE_SITEMAPS = [
    "https://lovanet.fr/sitemap.xml",
    "https://lovanet.fr/sitemap-pages.xml",
    "https://lovanet.fr/sitemap-images.xml",
    "https://lovanet.fr/sitemap-videos.xml",
    "https://lovanet.fr/sitemap-products.xml",
    "https://lovanet.fr/sitemap-news.xml",
    "https://lovanet.fr/sitemap-books.xml",
    "https://lovanet.fr/sitemap-catalog.xml",
    "https://animemomentsofficiel.fr/sitemap-animemomentsofficiel-fr.xml",
    "https://animemomentsofficiel.fr/sitemap-catalog-animemomentsofficiel-fr.xml",
    "https://animeofficiel.fr/sitemap-animeofficiel-fr.xml",
    "https://animeofficiel.fr/sitemap-catalog-animeofficiel-fr.xml",
]
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

app = FastAPI(title="Lovanet Replica API", version="1.1.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

SITE_META = {
    "title": "Anime.Moments.officiel : Lovanet Plateforme officielle",
    "description": "Anime, AnimeMoments, Animer officiel : vidéos YouTube, TikTok, Prime Video, catalogue et boutique manga.",
    "keywords": "AnimemomentsAnimeofficiel, Anime Moments, Lovanet, boutique anime, posters anime, collector anime, vêtements anime, sneakers anime",
    "logo": "/favicon.png",
    "canonical": "https://lovanet.fr/",
}

NAV_ROUTES = [
    {"to": "/", "label": "Accueil", "desc": "Page d’accueil Lovanet"},
    {"to": "/lecteurs-video", "label": "Lecteurs vidéo", "desc": "Player immersif anime"},
    {"to": "/chaine-youtube", "label": "YouTube", "desc": "Vidéos & shorts officiels"},
    {"to": "/prime-video", "label": "Prime Vidéo", "desc": "Lecture immersive multi-plateforme"},
    {"to": "/tiktok", "label": "TikTok", "desc": "Shorts & réactions"},
    {"to": "/anime-countdown", "label": "À venir", "desc": "Countdown live des prochains épisodes"},
    {"to": "/anime-catalog", "label": "Catalogue", "desc": "1500+ animés manga"},
    {"to": "/decouvrir", "label": "Univers Lovanet", "desc": "Vitrine SEO produits & vidéos"},
    {"to": "/shop", "label": "Shop", "desc": "Affiches, collectors, vêtements"},
    {"to": "/contact", "label": "Contact", "desc": "Écrire à l’équipe"},
    {"to": "/legals", "label": "Mentions légales", "desc": "CGV & confidentialité"},
]

ROUTE_ALIASES = {
    "/youtube": "/chaine-youtube",
    "/anime-moments-youtube": "/chaine-youtube",
    "/amazon-prime": "/prime-video",
    "/prime": "/prime-video",
    "/catalogue": "/anime-catalog",
    "/anime": "/anime-catalog",
    "/animemoments": "/decouvrir",
    "/animemomentsanimeofficiel": "/decouvrir",
}

PRODUCT_PRICES = [24, 29, 32, 49, 19, 22, 59, 39, 25, 34, 27, 79, 89, 249, 59, 179, 39, 34, 14, 29, 199, 24, 49, 44]
PRODUCT_CATEGORIES = ["poster", "collector", "apparel", "sneakers", "music", "manga", "daily"]
PRODUCT_TAGS = ["Édition limitée", "Holo", "Phosphorescent", "Set de 3", "Art print", "Rétro", "Mural", "3D lenticulaire", "Signature", "Pack x6", "Néo-Tokyo", "Premium"]
COUNTDOWNS = [
    {"title": "Solo Leveling — prochain arc", "date": "2026-08-22T20:00:00+02:00", "platform": "Prime Video", "image": "/products/am-005.svg"},
    {"title": "Jujutsu Kaisen — compilation moments cultes", "date": "2026-09-06T18:30:00+02:00", "platform": "YouTube", "image": "/products/am-003.svg"},
    {"title": "Demon Slayer — short vertical spécial", "date": "2026-09-18T21:00:00+02:00", "platform": "TikTok", "image": "/products/am-007.svg"},
    {"title": "Attack on Titan — marathon Lovanet", "date": "2026-10-01T19:00:00+02:00", "platform": "Lecteur vidéo", "image": "/products/am-001.svg"},
]

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
SYNC_INTERVAL_SECONDS = int(os.environ.get("SYNC_INTERVAL_SECONDS", "300"))
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")
sync_lock = asyncio.Lock()
scheduler_task: Optional[asyncio.Task] = None


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    out = {}
    for key, value in doc.items():
        if key == "_id":
            out["id"] = str(value)
        elif isinstance(value, datetime):
            out[key] = value.isoformat()
        elif isinstance(value, list):
            out[key] = [serialize_doc(v) if isinstance(v, dict) else v for v in value]
        elif isinstance(value, dict):
            out[key] = serialize_doc(value)
        else:
            out[key] = value
    return out


def request_json(url: str, method: str = "GET", body: Optional[dict] = None, timeout: int = 25) -> dict:
    data = None
    headers = {"User-Agent": UA, "Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8", "replace"))


def request_text(url: str, timeout: int = 20) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, resp.read().decode("utf-8", "replace")


def load_manifest() -> Dict[str, Any]:
    if MANIFEST_PATH.exists():
        try:
            return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        except Exception as exc:
            logger.warning("Unable to read manifest: %s", exc)
    return {"pages": [], "assets": [], "redirects": []}


def load_catalog_file() -> List[Dict[str, Any]]:
    path = PUBLIC_DIR / "catalog-seo.json"
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception as exc:
        logger.warning("Unable to read catalog-seo.json: %s", exc)
        return []


def load_products() -> List[Dict[str, Any]]:
    sitemap = PUBLIC_DIR / "sitemap.xml"
    products: List[Dict[str, Any]] = []
    if sitemap.exists():
        text = sitemap.read_text(encoding="utf-8", errors="replace")
        blocks = re.findall(r"<image:image>(.*?)</image:image>", text, flags=re.S)
        for idx, block in enumerate(blocks[:72], start=1):
            loc = re.search(r"<image:loc>(.*?)</image:loc>", block)
            title = re.search(r"<image:title>(.*?)</image:title>", block)
            caption = re.search(r"<image:caption>(.*?)</image:caption>", block)
            image_url = loc.group(1).replace("https://lovanet.fr", "") if loc else f"/products/am-{idx:03d}.svg"
            products.append(
                {
                    "id": f"am-{idx:03d}",
                    "name": html.unescape(title.group(1)) if title else f"Produit Lovanet {idx:03d}",
                    "image": image_url,
                    "description": html.unescape(caption.group(1)) if caption else "Produit officiel AnimemomentsAnimeofficiel / Lovanet.",
                    "price": PRODUCT_PRICES[(idx - 1) % len(PRODUCT_PRICES)],
                    "category": PRODUCT_CATEGORIES[(idx - 1) % len(PRODUCT_CATEGORIES)],
                    "tag": PRODUCT_TAGS[(idx - 1) % len(PRODUCT_TAGS)],
                    "source": ["youtube", "tiktok", "prime", "both"][(idx - 1) % 4],
                }
            )
    return products


def load_videos_fallback() -> List[Dict[str, Any]]:
    catalog = load_catalog_file()[:36]
    videos = []
    for idx, anime in enumerate(catalog):
        trailer_id = str(anime.get("trailerId") or "").strip()
        if not trailer_id:
            continue
        videos.append(
            {
                "platform": ["youtube", "tiktok", "prime"][idx % 3],
                "external_id": trailer_id,
                "title": anime.get("title") or "Anime Moments",
                "description": (anime.get("summary") or "")[:260],
                "thumbnail_url": anime.get("banner") or anime.get("cover") or f"https://i.ytimg.com/vi/{trailer_id}/hqdefault.jpg",
                "published_at": None,
                "animeId": anime.get("id"),
                "year": anime.get("year"),
                "score": anime.get("score"),
                "sync_source": "catalog-fallback",
            }
        )
    return videos


async def update_sync_state(key: str, status: str, inserted: int = 0, updated: int = 0, error: Optional[str] = None, meta: Optional[dict] = None) -> Dict[str, Any]:
    now = utc_now_iso()
    doc = {
        "key": key,
        "status": status,
        "last_run_at": now,
        "inserted": inserted,
        "updated": updated,
        "last_error": error,
        "meta": meta or {},
    }
    if status in {"ok", "degraded"}:
        doc["last_success_at"] = now
    await db.sync_state.update_one({"key": key}, {"$set": doc}, upsert=True)
    return doc


async def upsert_many(collection_name: str, docs: List[Dict[str, Any]], key_fields: List[str]) -> Dict[str, int]:
    inserted = 0
    updated = 0
    collection = db[collection_name]
    for doc in docs:
        doc["updated_at"] = utc_now_iso()
        filt = {field: doc.get(field) for field in key_fields}
        if any(value is None for value in filt.values()):
            continue
        existing = await collection.find_one(filt, {"_id": 1})
        created_at_value = doc.pop("created_at", utc_now_iso())
        if existing:
            updated += 1
        else:
            inserted += 1
        await collection.update_one(filt, {"$set": doc, "$setOnInsert": {"created_at": created_at_value}}, upsert=True)
    return {"inserted": inserted, "updated": updated}


def search_console_credentials_ready() -> bool:
    return GOOGLE_CREDENTIALS_PATH.exists() and GOOGLE_CREDENTIALS_PATH.is_file()


def get_search_console_service_account_info() -> Dict[str, Any]:
    if not search_console_credentials_ready():
        return {}
    try:
        data = json.loads(GOOGLE_CREDENTIALS_PATH.read_text(encoding="utf-8"))
        project_id = data.get("project_id")
        return {
            "project_id": project_id,
            "client_email": data.get("client_email"),
            "token_uri": data.get("token_uri"),
            "activation_url": f"https://console.developers.google.com/apis/api/searchconsole.googleapis.com/overview?project={project_id}" if project_id else None,
        }
    except Exception:
        return {}


def get_search_console_service():
    if not search_console_credentials_ready():
        raise RuntimeError("Google Search Console credentials file missing")
    credentials = service_account.Credentials.from_service_account_file(
        str(GOOGLE_CREDENTIALS_PATH),
        scopes=["https://www.googleapis.com/auth/webmasters"],
    )
    return build("webmasters", "v3", credentials=credentials, cache_discovery=False)


async def fetch_search_console_status() -> Dict[str, Any]:
    service_account_info = get_search_console_service_account_info()
    base = {
        "verification_meta": GOOGLE_SITE_VERIFICATION,
        "required_scope": "https://www.googleapis.com/auth/webmasters",
        "properties": SEARCH_CONSOLE_PROPERTIES,
        "sitemaps_ready": SEARCH_CONSOLE_SITEMAPS,
        "credentials_detected": search_console_credentials_ready(),
        "service_account": service_account_info,
    }
    if not search_console_credentials_ready():
        return {
            **base,
            "status": "credentials_missing",
            "message": "Le fichier credentials Search Console est introuvable côté backend.",
            "property_access": [],
        }
    try:
        service = await asyncio.to_thread(get_search_console_service)
        sites = await asyncio.to_thread(lambda: service.sites().list().execute())
        entries = sites.get("siteEntry", [])
        property_access = [
            {
                "site_url": entry.get("siteUrl"),
                "permission_level": entry.get("permissionLevel"),
                "verified": entry.get("permissionLevel") != "siteUnverifiedUser",
            }
            for entry in entries
            if entry.get("siteUrl") in SEARCH_CONSOLE_PROPERTIES or entry.get("siteUrl", "").startswith("sc-domain:")
        ]
        return {
            **base,
            "status": "ok",
            "message": "Connexion Search Console active.",
            "property_access": property_access,
        }
    except HttpError as exc:
        msg = str(exc)
        reason = "api_access_not_configured" if "accessNotConfigured" in msg or "has not been used in project" in msg else "google_api_error"
        message = msg
        if reason == "api_access_not_configured" and service_account_info.get("activation_url"):
            message = f"Google Search Console API désactivée sur le projet du compte de service. Activez-la ici puis relancez la soumission : {service_account_info['activation_url']}"
        return {
            **base,
            "status": reason,
            "message": message,
            "property_access": [],
        }
    except Exception as exc:
        return {
            **base,
            "status": "error",
            "message": str(exc),
            "property_access": [],
        }


async def submit_search_console_sitemaps() -> Dict[str, Any]:
    status = await fetch_search_console_status()
    if status.get("status") != "ok":
        return {
            **status,
            "submitted": [],
        }
    service = await asyncio.to_thread(get_search_console_service)
    property_access = {row.get("site_url"): row for row in status.get("property_access", [])}
    submitted = []
    final_status = "ok"
    for sitemap_url in SEARCH_CONSOLE_SITEMAPS:
        target_property = next((site for site in SEARCH_CONSOLE_PROPERTIES if sitemap_url.startswith(site)), "https://lovanet.fr/")
        access = property_access.get(target_property)
        if not access:
            submitted.append({
                "site_url": target_property,
                "sitemap_url": sitemap_url,
                "status": "skipped",
                "message": "La propriété Search Console n'est pas accessible avec ce compte de service.",
            })
            final_status = "partial"
            continue
        try:
            await asyncio.to_thread(lambda tp=target_property, sm=sitemap_url: service.sitemaps().submit(siteUrl=tp, feedpath=sm).execute())
            submitted.append({
                "site_url": target_property,
                "sitemap_url": sitemap_url,
                "status": "submitted",
            })
        except HttpError as exc:
            submitted.append({
                "site_url": target_property,
                "sitemap_url": sitemap_url,
                "status": "error",
                "message": str(exc),
            })
            final_status = "partial"
        except Exception as exc:
            submitted.append({
                "site_url": target_property,
                "sitemap_url": sitemap_url,
                "status": "error",
                "message": str(exc),
            })
            final_status = "partial"
    now = utc_now_iso()
    await db.sync_state.update_one(
        {"key": "google-search-console"},
        {
            "$set": {
                "key": "google-search-console",
                "status": final_status,
                "last_run_at": now,
                "last_success_at": now if final_status == "ok" else None,
                "meta": {"submitted": submitted},
            }
        },
        upsert=True,
    )
    return {
        **status,
        "status": final_status,
        "submitted": submitted,
        "submitted_at": now,
    }


async def maybe_submit_search_console_sitemaps(trigger: str) -> Dict[str, Any]:
    state = await db.sync_state.find_one({"key": "google-search-console"}, {"_id": 0})
    last_run = state.get("last_run_at") if state else None
    if last_run:
        try:
            previous = datetime.fromisoformat(str(last_run).replace("Z", "+00:00"))
            if (datetime.now(timezone.utc) - previous).total_seconds() < 12 * 60 * 60:
                return {"status": "skipped", "message": "Soumission Search Console déjà exécutée récemment.", "trigger": trigger}
        except Exception:
            pass
    result = await submit_search_console_sitemaps()
    if result.get("status") != "ok":
        now = utc_now_iso()
        await db.sync_state.update_one(
            {"key": "google-search-console"},
            {
                "$set": {
                    "key": "google-search-console",
                    "status": result.get("status"),
                    "last_run_at": now,
                    "meta": {"message": result.get("message"), "submitted": result.get("submitted", [])},
                }
            },
            upsert=True,
        )
        result["submitted_at"] = now
    result["trigger"] = trigger
    return result


async def sync_youtube_videos(limit: int = 24) -> Dict[str, Any]:
    def work() -> Dict[str, Any]:
        if not YOUTUBE_API_KEY:
            raise RuntimeError("YOUTUBE_API_KEY missing")
        base = "https://www.googleapis.com/youtube/v3"
        handle = "animemomentsAnimeofficiel"
        channel = request_json(f"{base}/channels?part=snippet,contentDetails,statistics&forHandle={urllib.parse.quote(handle)}&key={YOUTUBE_API_KEY}")
        items = channel.get("items") or []
        if not items:
            search = request_json(f"{base}/search?part=snippet&type=channel&q={urllib.parse.quote(handle)}&maxResults=1&key={YOUTUBE_API_KEY}")
            search_items = search.get("items") or []
            if not search_items:
                raise RuntimeError("YouTube channel not found")
            channel_id = search_items[0]["snippet"]["channelId"]
            channel = request_json(f"{base}/channels?part=snippet,contentDetails,statistics&id={channel_id}&key={YOUTUBE_API_KEY}")
            items = channel.get("items") or []
        item = items[0]
        uploads = item["contentDetails"]["relatedPlaylists"]["uploads"]
        playlist = request_json(f"{base}/playlistItems?part=snippet,contentDetails&playlistId={uploads}&maxResults={min(limit, 50)}&key={YOUTUBE_API_KEY}")
        docs = []
        for entry in playlist.get("items", []):
            sn = entry.get("snippet", {})
            thumbs = sn.get("thumbnails", {})
            video_id = sn.get("resourceId", {}).get("videoId") or entry.get("contentDetails", {}).get("videoId")
            if not video_id:
                continue
            docs.append({
                "platform": "youtube",
                "external_id": video_id,
                "title": sn.get("title") or "Anime.Moments.officiel",
                "description": (sn.get("description") or "")[:900],
                "thumbnail_url": (thumbs.get("maxres") or thumbs.get("high") or thumbs.get("medium") or thumbs.get("default") or {}).get("url"),
                "published_at": sn.get("publishedAt"),
                "channel_title": sn.get("channelTitle") or item.get("snippet", {}).get("title"),
                "video_url": f"https://www.youtube.com/watch?v={video_id}",
                "sync_source": "youtube-data-api-v3",
                "raw": {"playlistItemId": entry.get("id"), "channelId": item.get("id")},
            })
        return {"channel": {"id": item.get("id"), "title": item.get("snippet", {}).get("title")}, "docs": docs}
    try:
        result = await asyncio.to_thread(work)
        counts = await upsert_many("videos", result["docs"], ["platform", "external_id"])
        state = await update_sync_state("youtube", "ok", **counts, meta={"channel": result["channel"], "count": len(result["docs"])})
        return {"status": "ok", **counts, "count": len(result["docs"]), "state": state}
    except Exception as exc:
        state = await update_sync_state("youtube", "error", error=str(exc)[:500])
        return {"status": "error", "error": str(exc), "state": state}


async def sync_anilist_catalog(page: int = 1, per_page: int = 50) -> Dict[str, Any]:
    query = """
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC]) {
          id
          title { romaji english native }
          description(asHtml: false)
          seasonYear
          averageScore
          genres
          coverImage { large extraLarge }
          bannerImage
          trailer { id site thumbnail }
        }
      }
    }
    """
    def work() -> List[Dict[str, Any]]:
        data = request_json("https://graphql.anilist.co", method="POST", body={"query": query, "variables": {"page": page, "perPage": per_page}})
        docs = []
        for anime in data.get("data", {}).get("Page", {}).get("media", []):
            title = anime.get("title") or {}
            trailer = anime.get("trailer") or {}
            docs.append({
                "provider": "anilist",
                "external_id": anime.get("id"),
                "id": anime.get("id"),
                "title": title.get("english") or title.get("romaji") or title.get("native"),
                "summary": re.sub(r"<[^>]+>", "", anime.get("description") or "")[:1400],
                "year": anime.get("seasonYear"),
                "score": anime.get("averageScore"),
                "genres": anime.get("genres") or [],
                "cover": (anime.get("coverImage") or {}).get("extraLarge") or (anime.get("coverImage") or {}).get("large"),
                "banner": anime.get("bannerImage"),
                "trailerId": trailer.get("id") if trailer.get("site") == "youtube" else None,
                "url": f"https://lovanet.fr/anime-catalog#anime-{anime.get('id')}",
                "sync_source": "anilist-graphql",
            })
        return docs
    try:
        docs = await asyncio.to_thread(work)
        counts = await upsert_many("catalog_items", docs, ["provider", "external_id"])
        state = await update_sync_state("catalog:anilist", "ok", **counts, meta={"page": page, "per_page": per_page, "count": len(docs)})
        return {"status": "ok", **counts, "count": len(docs), "state": state}
    except Exception as exc:
        state = await update_sync_state("catalog:anilist", "error", error=str(exc)[:500])
        return {"status": "error", "error": str(exc), "state": state}


async def sync_tiktok_public() -> Dict[str, Any]:
    def work() -> List[Dict[str, Any]]:
        status, text = request_text("https://www.tiktok.com/@anime.moments.officiel", timeout=20)
        sec_uid_match = re.search(r'"secUid":"([^"]+)"', text)
        sec_uid = sec_uid_match.group(1) if sec_uid_match else None

        docs: List[Dict[str, Any]] = []

        if sec_uid:
            try:
                api_url = "https://www.tiktok.com/api/post/item_list/"
                query = urllib.parse.urlencode({
                    "aid": "1988",
                    "count": "24",
                    "cursor": "0",
                    "device_platform": "web_pc",
                    "secUid": sec_uid,
                })
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
                    "Accept": "application/json, text/plain, */*",
                    "Referer": "https://www.tiktok.com/@anime.moments.officiel",
                }
                req = urllib.request.Request(f"{api_url}?{query}", headers=headers)
                with urllib.request.urlopen(req, timeout=20) as response:
                    body = response.read().decode("utf-8", "replace")
                if body.strip():
                    payload = json.loads(body)
                    for idx, item in enumerate(payload.get("itemList") or []):
                        video_id = str(item.get("id") or "").strip()
                        title = str(item.get("desc") or "").strip()
                        video = item.get("video") or {}
                        if not re.fullmatch(r"\d{12,}", video_id):
                            continue
                        docs.append({
                            "platform": "tiktok",
                            "external_id": video_id,
                            "title": title or f"TikTok Anime Moments {video_id}",
                            "description": title or "Vidéo publique TikTok Anime.Moments.officiel détectée via profil officiel.",
                            "thumbnail_url": video.get("dynamicCover") or video.get("originCover") or video.get("cover") or f"/products/am-{(idx % 12) + 1:03d}.svg",
                            "published_at": datetime.fromtimestamp(int(item.get("createTime")), tz=timezone.utc).isoformat() if item.get("createTime") else None,
                            "channel_title": "@anime.moments.officiel",
                            "video_url": f"https://www.tiktok.com/@anime.moments.officiel/video/{video_id}",
                            "sync_source": "tiktok-web-item-list",
                            "raw": {"http_status": status, "secUid": sec_uid},
                        })
            except Exception:
                docs = []

        if docs:
            return docs

        titles = [html.unescape(t.encode("utf-8").decode("unicode_escape", "ignore")) for t in re.findall(r'"desc":"(.*?)"', text)[:12]]
        ids = list(dict.fromkeys(re.findall(r'"id":"(\d{12,})"', text)))[:12]
        docs = []
        for idx, video_id in enumerate(ids):
            title = titles[idx] if idx < len(titles) and titles[idx] else ""
            normalized_title = html.unescape(title.encode("utf-8").decode("unicode_escape", "ignore")).strip() if title else ""
            if not re.fullmatch(r"\d{12,}", video_id):
                continue
            if normalized_title and re.search(r"followers|following|likes", normalized_title, flags=re.I):
                continue
            docs.append({
                "platform": "tiktok",
                "external_id": video_id,
                "title": normalized_title or f"TikTok Anime Moments {video_id}",
                "description": normalized_title or "Vidéo publique TikTok Anime.Moments.officiel détectée en best-effort.",
                "thumbnail_url": f"/products/am-{(idx % 12) + 1:03d}.svg",
                "published_at": None,
                "channel_title": "@anime.moments.officiel",
                "video_url": f"https://www.tiktok.com/@anime.moments.officiel/video/{video_id}",
                "sync_source": "tiktok-public-best-effort",
                "raw": {"http_status": status, "source_handle": "@anime.moments.officiel", "secUid": sec_uid},
            })
        return docs
    try:
        docs = await asyncio.to_thread(work)
        counts = await upsert_many("videos", docs, ["platform", "external_id"]) if docs else {"inserted": 0, "updated": 0}
        valid_ids = [doc["external_id"] for doc in docs]
        delete_query: Dict[str, Any] = {
            "platform": "tiktok",
            "$or": [
                {"channel_title": {"$ne": "@anime.moments.officiel"}},
                {"video_url": {"$not": {"$regex": r"https://www\.tiktok\.com/@anime\.moments\.officiel/video/"}}},
                {"sync_source": {"$nin": ["tiktok-public-best-effort", "tiktok-web-item-list"]}},
                {"title": {"$regex": r"followers|following|likes", "$options": "i"}},
            ],
        }
        if valid_ids:
            delete_query = {
                "platform": "tiktok",
                "$or": [
                    {"external_id": {"$nin": valid_ids}},
                    {"channel_title": {"$ne": "@anime.moments.officiel"}},
                    {"video_url": {"$not": {"$regex": r"https://www\.tiktok\.com/@anime\.moments\.officiel/video/"}}},
                    {"sync_source": {"$nin": ["tiktok-public-best-effort", "tiktok-web-item-list"]}},
                    {"title": {"$regex": r"followers|following|likes", "$options": "i"}},
                ],
            }
        stale_delete = await db.videos.delete_many(delete_query)
        status = "ok" if docs else "degraded"
        state = await update_sync_state("tiktok", status, inserted=counts.get("inserted", 0), updated=counts.get("updated", 0), meta={"count": len(docs), "deleted_non_matching": stale_delete.deleted_count, "note": "Public best-effort; no official TikTok API credentials provided."})
        return {"status": status, **counts, "count": len(docs), "deleted_non_matching": stale_delete.deleted_count, "state": state}
    except Exception as exc:
        state = await update_sync_state("tiktok", "degraded", error=str(exc)[:500], meta={"note": "TikTok blocks many server crawlers without official API."})
        return {"status": "degraded", "error": str(exc), "state": state}


async def sync_prime_public() -> Dict[str, Any]:
    def work() -> List[Dict[str, Any]]:
        status, text = request_text("https://www.primevideo.com/search/ref=atv_nb_sr?phrase=anime", timeout=20)
        titles = list(dict.fromkeys(re.findall(r'aria-label="([^"]*(?:Anime|anime|Manga|manga)[^"]*)"', text)))[:12]
        docs = []
        for idx, title in enumerate(titles):
            docs.append({
                "platform": "prime",
                "external_id": f"prime-anime-{idx}-{abs(hash(title))}",
                "title": html.unescape(title),
                "description": "Titre anime/manga détecté depuis une page publique Prime Video en best-effort.",
                "thumbnail_url": f"/products/am-{((idx + 4) % 12) + 1:03d}.svg",
                "published_at": None,
                "channel_title": "Prime Video Anime",
                "video_url": "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=anime",
                "sync_source": "prime-public-best-effort",
                "raw": {"http_status": status},
            })
        return docs
    try:
        docs = await asyncio.to_thread(work)
        counts = await upsert_many("videos", docs, ["platform", "external_id"]) if docs else {"inserted": 0, "updated": 0}
        status = "ok" if docs else "degraded"
        state = await update_sync_state("prime", status, **counts, meta={"count": len(docs), "note": "Prime Video has no public API; public crawl may be geo-gated/blocked."})
        return {"status": status, **counts, "count": len(docs), "state": state}
    except Exception as exc:
        state = await update_sync_state("prime", "degraded", error=str(exc)[:500], meta={"note": "Prime Video has no public API and may block unauthenticated crawlers."})
        return {"status": "degraded", "error": str(exc), "state": state}


async def sync_all_external(trigger: str = "manual") -> Dict[str, Any]:
    if sync_lock.locked():
        return {"status": "locked", "message": "Une synchronisation est déjà en cours."}
    async with sync_lock:
        await update_sync_state("all", "running", meta={"trigger": trigger})
        results = {
            "youtube": await sync_youtube_videos(),
            "catalog_anilist": await sync_anilist_catalog(),
            "tiktok": await sync_tiktok_public(),
            "prime": await sync_prime_public(),
        }
        search_console = await maybe_submit_search_console_sitemaps(trigger=trigger)
        overall = "ok" if all(v.get("status") in {"ok", "degraded", "skipped", "partial", "api_access_not_configured"} for v in [*results.values(), search_console]) else "partial"
        await update_sync_state("all", overall, meta={"trigger": trigger, "results": {k: v.get("status") for k, v in results.items()}, "search_console": search_console.get("status")})
        return {"status": overall, "trigger": trigger, "results": results, "search_console": search_console}


async def sync_scheduler_loop() -> None:
    await asyncio.sleep(5)
    while True:
        try:
            await sync_all_external(trigger="scheduler-5min")
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            logger.exception("Auto sync loop failed: %s", exc)
            await update_sync_state("all", "error", error=str(exc)[:500], meta={"trigger": "scheduler-5min"})
        await asyncio.sleep(SYNC_INTERVAL_SECONDS)


class FormSubmission(BaseModel):
    model_config = ConfigDict(extra="allow")
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    subject: Optional[str] = Field(default="Contact Lovanet", max_length=180)
    message: str = Field(..., min_length=5, max_length=4000)


class OrderLine(BaseModel):
    id: str
    name: str
    price: float
    qty: int = Field(..., ge=1, le=99)


class OrderCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    items: List[OrderLine]
    note: Optional[str] = Field(default="", max_length=1200)


class SyncRunRequest(BaseModel):
    target: str = Field(default="all")


@api_router.get("/")
async def root():
    return {"message": "Lovanet replica API", "status": "ok"}


@api_router.get("/health")
async def health():
    return {"status": "ok", "time": utc_now_iso(), "sync_interval_seconds": SYNC_INTERVAL_SECONDS}


@api_router.get("/site")
async def get_site():
    manifest = load_manifest()
    return {
        "meta": SITE_META,
        "nav": NAV_ROUTES,
        "aliases": ROUTE_ALIASES,
        "manifestSummary": {
            "pages": len(manifest.get("pages", [])),
            "assets": len(manifest.get("assets", [])),
            "backup": manifest.get("backup", {}),
        },
        "ui": manifest.get("ui_components", []),
        "sync": {"interval_seconds": SYNC_INTERVAL_SECONDS, "youtube_configured": bool(YOUTUBE_API_KEY)},
    }


@api_router.get("/pages")
async def get_pages():
    return {"pages": load_manifest().get("pages", [])}


@api_router.get("/redirects")
async def get_redirects():
    return {"aliases": ROUTE_ALIASES, "redirects": load_manifest().get("redirects", [])}


@api_router.get("/products")
async def get_products(category: Optional[str] = None, q: Optional[str] = None, limit: int = Query(72, ge=1, le=200)):
    products = load_products()
    if category and category != "all":
        products = [p for p in products if p.get("category") == category]
    if q:
        needle = q.lower().strip()
        products = [p for p in products if needle in p.get("name", "").lower() or needle in p.get("description", "").lower()]
    return {"products": products[:limit], "total": len(products)}


@api_router.get("/videos")
async def get_videos(
    platform: Optional[str] = None,
    limit: int = Query(24, ge=1, le=200),
    channel_title: Optional[str] = None,
    strict: bool = False,
):
    query: Dict[str, Any] = {}
    if platform and platform != "all":
        query["platform"] = platform
    if channel_title:
        query["channel_title"] = channel_title
    docs = await db.videos.find(query, {"_id": 0}).sort("published_at", -1).to_list(limit)
    source = "mongodb"
    if not docs and not strict:
        docs = load_videos_fallback()
        if platform and platform != "all":
            docs = [v for v in docs if v.get("platform") == platform]
        if channel_title:
            docs = [v for v in docs if v.get("channel_title") == channel_title]
        source = "fallback"
    normalized = []
    for doc in docs[:limit]:
        doc = dict(doc)
        doc.setdefault("id", doc.get("external_id"))
        doc.setdefault("thumbnail", doc.get("thumbnail_url"))
        normalized.append(doc)
    return {"videos": normalized, "total": len(normalized), "source": source}


@api_router.get("/countdowns")
async def get_countdowns():
    return {"countdowns": COUNTDOWNS}


@api_router.get("/catalog")
async def get_catalog(q: Optional[str] = None, genre: Optional[str] = None, limit: int = Query(48, ge=1, le=200), offset: int = Query(0, ge=0)):
    filt: Dict[str, Any] = {}
    if genre and genre != "all":
        filt["genres"] = genre
    if q:
        filt["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"summary": {"$regex": q, "$options": "i"}},
        ]
    total = await db.catalog_items.count_documents(filt)
    docs = await db.catalog_items.find(filt, {"_id": 0}).sort("score", -1).skip(offset).limit(limit).to_list(limit)
    source = "mongodb"
    if not docs:
        catalog = load_catalog_file()
        if q:
            needle = q.lower().strip()
            catalog = [a for a in catalog if needle in str(a.get("title", "")).lower() or needle in str(a.get("summary", "")).lower()]
        if genre and genre != "all":
            catalog = [a for a in catalog if genre in a.get("genres", [])]
        total = len(catalog)
        docs = catalog[offset : offset + limit]
        source = "catalog-seo-json"
    full_for_genres = await db.catalog_items.find({}, {"genres": 1, "_id": 0}).limit(600).to_list(600)
    if full_for_genres:
        genres = sorted({g for anime in full_for_genres for g in anime.get("genres", [])})
    else:
        genres = sorted({g for anime in load_catalog_file()[:500] for g in anime.get("genres", [])})
    return {"items": docs, "total": total, "genres": genres, "source": source}


@api_router.get("/admin/sync/status")
async def sync_status():
    rows = await db.sync_state.find({}, {"_id": 0}).sort("last_run_at", -1).to_list(50)
    return {"status": rows, "running": sync_lock.locked(), "interval_seconds": SYNC_INTERVAL_SECONDS}


@api_router.post("/admin/sync/run")
async def admin_sync_run(payload: SyncRunRequest):
    target = payload.target
    if target == "youtube":
        return await sync_youtube_videos()
    if target in {"catalog", "anilist", "catalog:anilist"}:
        return await sync_anilist_catalog()
    if target == "tiktok":
        return await sync_tiktok_public()
    if target == "prime":
        return await sync_prime_public()
    return await sync_all_external(trigger="admin-manual")


@api_router.post("/sync/youtube")
async def sync_youtube_endpoint():
    return await sync_youtube_videos()


@api_router.post("/sync/catalog/anilist")
async def sync_catalog_endpoint():
    return await sync_anilist_catalog()


@api_router.post("/sync/tiktok")
async def sync_tiktok_endpoint():
    return await sync_tiktok_public()


@api_router.post("/sync/prime")
async def sync_prime_endpoint():
    return await sync_prime_public()


@api_router.post("/forms/{form_type}")
async def submit_form(form_type: str, payload: FormSubmission):
    doc = payload.model_dump()
    doc.update({"id": str(uuid.uuid4()), "type": form_type, "status": "received", "created_at": utc_now_iso()})
    await db.submissions.insert_one(doc)
    return {"status": "success", "message": "Votre message a bien été transmis à l’équipe Lovanet.", "submission": serialize_doc(doc)}


@api_router.post("/orders")
async def create_order(payload: OrderCreate):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Le panier est vide.")
    total = round(sum(item.price * item.qty for item in payload.items), 2)
    doc = payload.model_dump()
    doc.update({"id": str(uuid.uuid4()), "total": total, "status": "received", "created_at": utc_now_iso()})
    await db.orders.insert_one(doc)
    return {"status": "success", "message": "Commande de démonstration enregistrée côté Lovanet.", "order": serialize_doc(doc)}


@api_router.get("/seo/export")
async def seo_export():
    backup_path = PUBLIC_DIR / "seo-backup.json"
    if not backup_path.exists():
        raise HTTPException(status_code=404, detail="SEO backup not generated yet.")
    try:
        backup = json.loads(backup_path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to read SEO backup: {exc}")
    sync_rows = await db.sync_state.find({}, {"_id": 0}).sort("last_run_at", -1).to_list(50)
    return {
        "status": "ok",
        "generated_at": backup.get("generatedAt"),
        "primary_domain": backup.get("primaryDomain"),
        "alternate_domains": backup.get("alternateDomains", []),
        "counts": {
            "pages": len(backup.get("pages", [])),
            "products": len(backup.get("products", [])),
            "videos": len(backup.get("videos", [])),
            "news": len(backup.get("news", [])),
            "books": len(backup.get("books", [])),
            "catalogSample": len(backup.get("catalogSample", [])),
            "catalogCount": backup.get("catalogCount", len(backup.get("catalogSample", []))),
        },
        "sitemaps": backup.get("searchConsole", {}).get("sitemapsReady", []),
        "backup": backup,
        "sync_state": sync_rows,
    }

@api_router.get("/seo/search-console/status")
async def search_console_status():
    return await fetch_search_console_status()


@api_router.post("/seo/search-console/submit")
async def search_console_submit():
    return await submit_search_console_sitemaps()


@api_router.get("/submissions")
async def list_submissions(limit: int = Query(50, ge=1, le=200)):
    rows = await db.submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return {"submissions": rows}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    global scheduler_task
    await db.videos.create_index([("platform", 1), ("external_id", 1)], unique=True)
    await db.catalog_items.create_index([("provider", 1), ("external_id", 1)], unique=True)
    await db.sync_state.create_index("key", unique=True)
    if scheduler_task is None or scheduler_task.done():
        scheduler_task = asyncio.create_task(sync_scheduler_loop())
        logger.info("Lovanet auto-sync scheduler started every %s seconds", SYNC_INTERVAL_SECONDS)


@app.on_event("shutdown")
async def shutdown_db_client():
    global scheduler_task
    if scheduler_task and not scheduler_task.done():
        scheduler_task.cancel()
    client.close()
