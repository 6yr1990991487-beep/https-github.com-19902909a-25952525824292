from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Any, Dict, List, Optional
from pathlib import Path
from datetime import datetime, timezone
import html
import json
import logging
import os
import re
import uuid

ROOT_DIR = Path(__file__).parent
APP_DIR = ROOT_DIR.parent
PUBLIC_DIR = APP_DIR / "frontend" / "public"
MANIFEST_PATH = APP_DIR / "extraction" / "manifest" / "lovanet_manifest.json"
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

app = FastAPI(title="Lovanet Replica API", version="1.0.0")
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


def load_manifest() -> Dict[str, Any]:
    if MANIFEST_PATH.exists():
        try:
            return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        except Exception as exc:
            logger.warning("Unable to read manifest: %s", exc)
    return {"pages": [], "assets": [], "redirects": []}


def load_catalog() -> List[Dict[str, Any]]:
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
    if products:
        return products
    return [
        {"id": f"am-{idx:03d}", "name": f"Produit Lovanet {idx:03d}", "image": f"/products/am-{idx:03d}.svg", "description": "Produit officiel Lovanet.", "price": PRODUCT_PRICES[(idx - 1) % len(PRODUCT_PRICES)], "category": PRODUCT_CATEGORIES[(idx - 1) % len(PRODUCT_CATEGORIES)], "tag": PRODUCT_TAGS[(idx - 1) % len(PRODUCT_TAGS)], "source": "both"}
        for idx in range(1, 13)
    ]


def load_videos() -> List[Dict[str, Any]]:
    catalog = load_catalog()[:36]
    videos = []
    for idx, anime in enumerate(catalog):
        trailer_id = str(anime.get("trailerId") or "").strip()
        if not trailer_id:
            continue
        videos.append(
            {
                "id": trailer_id,
                "title": anime.get("title") or "Anime Moments",
                "description": (anime.get("summary") or "")[:260],
                "thumbnail": anime.get("banner") or anime.get("cover") or f"https://i.ytimg.com/vi/{trailer_id}/hqdefault.jpg",
                "platform": ["youtube", "tiktok", "prime"][idx % 3],
                "animeId": anime.get("id"),
                "year": anime.get("year"),
                "score": anime.get("score"),
            }
        )
    return videos


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


@api_router.get("/")
async def root():
    return {"message": "Lovanet replica API", "status": "ok"}


@api_router.get("/health")
async def health():
    return {"status": "ok", "time": utc_now_iso()}


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
async def get_videos(platform: Optional[str] = None, limit: int = Query(24, ge=1, le=60)):
    videos = load_videos()
    if platform and platform != "all":
        videos = [v for v in videos if v.get("platform") == platform]
    return {"videos": videos[:limit], "total": len(videos)}


@api_router.get("/countdowns")
async def get_countdowns():
    return {"countdowns": COUNTDOWNS}


@api_router.get("/catalog")
async def get_catalog(q: Optional[str] = None, genre: Optional[str] = None, limit: int = Query(48, ge=1, le=200), offset: int = Query(0, ge=0)):
    catalog = load_catalog()
    if q:
        needle = q.lower().strip()
        catalog = [a for a in catalog if needle in str(a.get("title", "")).lower() or needle in str(a.get("summary", "")).lower()]
    if genre and genre != "all":
        catalog = [a for a in catalog if genre in a.get("genres", [])]
    genres = sorted({genre for anime in load_catalog()[:500] for genre in anime.get("genres", [])})
    return {"items": catalog[offset : offset + limit], "total": len(catalog), "genres": genres}


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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
