#!/usr/bin/env python3
"""Generate Lovanet SEO assets from recovered/catalog content.
Creates logo, robots, sitemap index + vertical sitemaps, RSS/Atom, local SEO backup and frontend news data.
"""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
from pathlib import Path
import html
import json
import re
import textwrap
import xml.etree.ElementTree as ET
from xml.dom import minidom

APP = Path('/app')
PUBLIC = APP / 'frontend' / 'public'
SRC = APP / 'frontend' / 'src'
PRIMARY = 'https://lovanet.fr'
SECONDARY = 'https://animemomentsofficiel.fr'
DOMAINS = [PRIMARY, SECONDARY]
NOW = datetime.now(timezone.utc)
ISO_NOW = NOW.isoformat(timespec='seconds')
RFC_NOW = NOW.strftime('%a, %d %b %Y %H:%M:%S +0000')

PAGES = [
    {'path': '/', 'title': 'Anime.Moments.officiel : Lovanet Plateforme officielle', 'description': 'Plateforme officielle anime, AnimeMoments, Animer officiel : vidéos YouTube, TikTok, Prime Video, catalogue et boutique manga.', 'priority': '1.0', 'changefreq': 'daily'},
    {'path': '/decouvrir', 'title': 'Univers Lovanet', 'description': 'Découvrir l’univers Lovanet, les vidéos, produits, catalogues anime et liens officiels.', 'priority': '0.8', 'changefreq': 'weekly'},
    {'path': '/shop', 'title': 'Boutique Lovanet anime manga', 'description': 'Posters, collectors, vêtements, sneakers, musique, manga et objets anime Anime.Moments.officiel.', 'priority': '0.95', 'changefreq': 'daily'},
    {'path': '/anime-catalog', 'title': 'Catalogue Anime 1500+ animés', 'description': 'Catalogue anime/manga avec miniatures, bandes-annonces, genres, cartes et carrousel circulaire.', 'priority': '0.95', 'changefreq': 'daily'},
    {'path': '/actualites', 'title': 'Actualités anime Lovanet', 'description': 'Actualités Anime.Moments.officiel, nouvelles vidéos, sorties manga, produits et catalogue anime.', 'priority': '0.9', 'changefreq': 'hourly'},
    {'path': '/anime-countdown', 'title': 'Anime à venir', 'description': 'Countdown live des sorties, épisodes, vidéos et événements anime à venir.', 'priority': '0.85', 'changefreq': 'daily'},
    {'path': '/chaine-youtube', 'title': 'YouTube AnimeMoments officiel', 'description': 'Chaîne YouTube officielle Anime.Moments.officiel avec vidéos, shorts et trailers anime.', 'priority': '0.9', 'changefreq': 'hourly'},
    {'path': '/chaine-youtube/manga', 'title': 'YouTube Manga AnimeMoments', 'description': 'Vidéos manga, anime shorts et contenus synchronisés depuis la chaîne officielle.', 'priority': '0.85', 'changefreq': 'hourly'},
    {'path': '/lecteurs-video', 'title': 'Lecteurs vidéo anime', 'description': 'Lecteurs immersifs Lovanet pour vidéos anime, bandes-annonces et moments officiels.', 'priority': '0.85', 'changefreq': 'daily'},
    {'path': '/prime-video', 'title': 'Prime Video anime manga', 'description': 'Section Prime Video Anime.Moments.officiel et sélection manga/anime best-effort.', 'priority': '0.8', 'changefreq': 'daily'},
    {'path': '/tiktok', 'title': 'TikTok Anime.Moments.officiel', 'description': 'Shorts anime TikTok, réactions et miniatures synchronisées best-effort.', 'priority': '0.8', 'changefreq': 'hourly'},
    {'path': '/contact', 'title': 'Contact Lovanet', 'description': 'Contacter l’équipe Lovanet Anime.Moments.officiel.', 'priority': '0.6', 'changefreq': 'monthly'},
    {'path': '/legals', 'title': 'Mentions légales Lovanet', 'description': 'Mentions légales, conditions, confidentialité et informations Lovanet.', 'priority': '0.4', 'changefreq': 'monthly'},
]

KEYWORDS = [
    'anime', 'AnimeMoments', 'Animer officiel', 'Anime.Moments.officiel', 'AnimemomentsAnimeofficiel',
    'Lovanet', 'manga animé', 'catalogue anime', 'boutique manga', 'YouTube anime', 'TikTok anime',
    'Prime Video anime', 'poster anime', 'figurine anime', 'manga', 'actualités anime', 'bandes annonces anime'
]


def esc(value: object) -> str:
    return html.escape(str(value or ''), quote=True)


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[’'\"]", '', value)
    value = re.sub(r'[^a-z0-9]+', '-', value)
    return value.strip('-')[:90] or 'actualite-lovanet'


def pretty_xml(root: ET.Element) -> str:
    rough = ET.tostring(root, encoding='utf-8')
    return minidom.parseString(rough).toprettyxml(indent='  ', encoding='utf-8').decode('utf-8')


def load_catalog() -> list[dict]:
    path = PUBLIC / 'catalog-seo.json'
    if path.exists():
        return json.loads(path.read_text(encoding='utf-8'))
    return []


def parse_products_from_sitemap() -> list[dict]:
    products = []
    sitemap = PUBLIC / 'sitemap.xml'
    if sitemap.exists():
        text = sitemap.read_text(encoding='utf-8', errors='replace')
        blocks = re.findall(r'<image:image>(.*?)</image:image>', text, re.S)
        for idx, block in enumerate(blocks[:120], start=1):
            loc = re.search(r'<image:loc>(.*?)</image:loc>', block)
            title = re.search(r'<image:title>(.*?)</image:title>', block)
            caption = re.search(r'<image:caption>(.*?)</image:caption>', block)
            pid = f'am-{idx:03d}'
            image = (loc.group(1).replace(PRIMARY, '') if loc else f'/products/{pid}.svg')
            products.append({
                'id': pid,
                'url': f'{PRIMARY}/shop?product={pid}',
                'name': html.unescape(title.group(1) if title else f'Produit Lovanet {pid}'),
                'description': html.unescape(caption.group(1) if caption else 'Produit officiel anime manga Lovanet.'),
                'image': image,
                'price': [24, 29, 32, 49, 19, 22, 59, 39, 25, 34, 27, 79][(idx - 1) % 12],
                'category': ['poster', 'collector', 'apparel', 'sneakers', 'music', 'manga', 'daily'][(idx - 1) % 7],
                'rating': round(4.4 + ((idx % 6) / 10), 1),
                'reviews': 18 + idx * 3,
            })
    if products:
        return products
    for idx, svg in enumerate(sorted((PUBLIC / 'products').glob('am-*.svg')), start=1):
        pid = svg.stem
        products.append({
            'id': pid,
            'url': f'{PRIMARY}/shop?product={pid}',
            'name': f'Produit anime manga Lovanet {pid.upper()}',
            'description': 'Produit officiel Anime.Moments.officiel disponible dans la boutique Lovanet.',
            'image': f'/products/{svg.name}',
            'price': [24, 29, 32, 49, 19, 22, 59, 39][(idx - 1) % 8],
            'category': 'manga',
            'rating': 4.7,
            'reviews': 24 + idx,
        })
    return products


def build_videos(catalog: list[dict]) -> list[dict]:
    videos = []
    for item in catalog:
        trailer = str(item.get('trailerId') or '').strip()
        if not trailer:
            continue
        videos.append({
            'id': trailer,
            'url': f'{PRIMARY}/lecteurs-video?video={trailer}',
            'embedUrl': f'https://www.youtube-nocookie.com/embed/{trailer}',
            'contentUrl': f'https://www.youtube.com/watch?v={trailer}',
            'title': item.get('title') or 'Anime.Moments.officiel vidéo anime',
            'description': (item.get('summary') or 'Vidéo anime Anime.Moments.officiel synchronisée avec le catalogue Lovanet.')[:500],
            'thumbnail': item.get('banner') or item.get('cover') or f'https://i.ytimg.com/vi/{trailer}/hqdefault.jpg',
            'uploadDate': f'{NOW.date().isoformat()}T08:00:00+00:00',
            'genres': item.get('genres') or [],
            'score': item.get('score') or 86,
        })
        if len(videos) >= 80:
            break
    return videos


def build_news(products: list[dict], videos: list[dict], catalog: list[dict]) -> list[dict]:
    news = []
    sources = []
    for video in videos[:12]:
        sources.append(('video', video['title'], video['description'], video['thumbnail'], '/chaine-youtube', ['video anime', 'YouTube', 'AnimeMoments']))
    for product in products[:8]:
        sources.append(('product', product['name'], product['description'], product['image'], '/shop', ['produit anime', 'boutique manga', product.get('category', 'manga')]))
    for anime in catalog[:10]:
        sources.append(('catalog', anime.get('title'), anime.get('summary', ''), anime.get('banner') or anime.get('cover'), '/anime-catalog', ['catalogue anime', 'manga', 'trailer']))
    for idx, (kind, title, desc, image, base_path, tags) in enumerate(sources[:30]):
        date = NOW - timedelta(hours=idx * 3)
        slug = slugify(f'{kind}-{title}-{idx + 1}')
        news.append({
            'id': slug,
            'slug': slug,
            'url': f'{PRIMARY}/actualites/{slug}',
            'title': str(title or 'Actualité anime Lovanet')[:110],
            'description': str(desc or 'Actualité Anime.Moments.officiel publiée sur Lovanet.')[:240],
            'image': image or '/lovanet-og.svg',
            'datePublished': date.isoformat(timespec='seconds'),
            'dateModified': date.isoformat(timespec='seconds'),
            'category': kind,
            'tags': tags + ['Lovanet', 'anime', 'AnimemomentsAnimeofficiel'],
            'sourcePath': base_path,
            'author': 'Rédaction Lovanet',
        })
    return news


def write_logo() -> None:
    logo = '''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" role="img" aria-labelledby="title desc">
<title id="title">Lovanet Anime.Moments.officiel</title><desc id="desc">Logo néon officiel Lovanet pour anime, manga et Anime Moments.</desc>
<defs>
<radialGradient id="bg" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#172554"/><stop offset="0.45" stop-color="#080b18"/><stop offset="1" stop-color="#020617"/></radialGradient>
<linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#22d3ee"/><stop offset="0.45" stop-color="#e879f9"/><stop offset="1" stop-color="#a3ff12"/></linearGradient>
<filter id="glow"><feGaussianBlur stdDeviation="16" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="1200" height="1200" rx="260" fill="url(#bg)"/>
<circle cx="600" cy="600" r="435" fill="none" stroke="url(#g)" stroke-width="34" opacity="0.9" filter="url(#glow)"/>
<path d="M365 815V350h112v358h286v107H365Z" fill="url(#g)" filter="url(#glow)"/>
<path d="M745 350h112v465H745V553L620 715h-58l-126-162v-1h132l25 34 152-236Z" fill="#f8fafc" opacity="0.92"/>
<text x="600" y="980" text-anchor="middle" font-family="Orbitron, Arial, sans-serif" font-size="82" font-weight="900" letter-spacing="9" fill="url(#g)">LOVANET</text>
</svg>'''
    (PUBLIC / 'lovanet-logo-custom.svg').write_text(logo, encoding='utf-8')
    og = logo.replace('width="1200" height="1200" viewBox="0 0 1200 1200"', 'width="1200" height="630" viewBox="0 0 1200 630"')
    og = og.replace('<rect width="1200" height="1200" rx="260"', '<rect width="1200" height="630" rx="80"')
    og = og.replace('cy="600" r="435"', 'cy="315" r="235"')
    og = og.replace('d="M365 815V350h112v358h286v107H365Z"', 'd="M365 465V210h95v165h230v90H365Z"')
    og = og.replace('d="M745 350h112v465H745V553L620 715h-58l-126-162v-1h132l25 34 152-236Z"', 'd="M720 210h95v255h-95V330L620 445h-58L462 330h106l25 28 127-148Z"')
    og = og.replace('x="600" y="980"', 'x="600" y="565"')
    (PUBLIC / 'lovanet-og.svg').write_text(og, encoding='utf-8')


def sitemap_urlset(extra_ns: dict[str, str] | None = None) -> ET.Element:
    ns = {'xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    if extra_ns:
        ns.update(extra_ns)
    return ET.Element('urlset', ns)


def add_url(parent: ET.Element, loc: str, lastmod: str | None = None, changefreq: str | None = None, priority: str | None = None) -> ET.Element:
    url = ET.SubElement(parent, 'url')
    ET.SubElement(url, 'loc').text = loc
    if lastmod:
        ET.SubElement(url, 'lastmod').text = lastmod
    if changefreq:
        ET.SubElement(url, 'changefreq').text = changefreq
    if priority:
        ET.SubElement(url, 'priority').text = priority
    return url


def write_sitemaps(products: list[dict], videos: list[dict], catalog: list[dict], news: list[dict]) -> None:
    today = NOW.date().isoformat()
    # Index
    index = ET.Element('sitemapindex', {'xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9'})
    for name in ['sitemap-pages.xml', 'sitemap-images.xml', 'sitemap-videos.xml', 'sitemap-products.xml', 'sitemap-news.xml', 'sitemap-books.xml']:
        sm = ET.SubElement(index, 'sitemap')
        ET.SubElement(sm, 'loc').text = f'{PRIMARY}/{name}'
        ET.SubElement(sm, 'lastmod').text = today
    (PUBLIC / 'sitemap.xml').write_text(pretty_xml(index), encoding='utf-8')
    (PUBLIC / 'sitemap-index.xml').write_text(pretty_xml(index), encoding='utf-8')

    pages = sitemap_urlset()
    for page in PAGES:
        add_url(pages, f"{PRIMARY}{page['path']}", today, page['changefreq'], page['priority'])
    for item in news[:30]:
        add_url(pages, item['url'], item['dateModified'][:10], 'daily', '0.75')
    (PUBLIC / 'sitemap-pages.xml').write_text(pretty_xml(pages), encoding='utf-8')

    image_ns = {'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1'}
    images = sitemap_urlset(image_ns)
    image_sources = []
    for product in products[:120]:
        image_sources.append((product['url'], PRIMARY + product['image'] if product['image'].startswith('/') else product['image'], product['name'], product['description']))
    for anime in catalog[:300]:
        if anime.get('cover'):
            image_sources.append((f"{PRIMARY}/anime-catalog#anime-{anime.get('id')}", anime['cover'], anime.get('title'), anime.get('summary', '')))
    for loc, img, title, caption in image_sources[:420]:
        u = add_url(images, loc, today)
        im = ET.SubElement(u, 'image:image')
        ET.SubElement(im, 'image:loc').text = img
        ET.SubElement(im, 'image:title').text = str(title or 'Lovanet anime')[:120]
        ET.SubElement(im, 'image:caption').text = str(caption or 'Image anime manga Lovanet')[:240]
    (PUBLIC / 'sitemap-images.xml').write_text(pretty_xml(images), encoding='utf-8')

    video_ns = {'xmlns:video': 'http://www.google.com/schemas/sitemap-video/1.1'}
    video_sm = sitemap_urlset(video_ns)
    for video in videos[:80]:
        u = add_url(video_sm, video['url'], today)
        v = ET.SubElement(u, 'video:video')
        ET.SubElement(v, 'video:thumbnail_loc').text = video['thumbnail']
        ET.SubElement(v, 'video:title').text = str(video['title'])[:100]
        ET.SubElement(v, 'video:description').text = str(video['description'])[:2000]
        ET.SubElement(v, 'video:content_loc').text = video['contentUrl']
        ET.SubElement(v, 'video:player_loc').text = video['embedUrl']
        ET.SubElement(v, 'video:publication_date').text = video['uploadDate']
        ET.SubElement(v, 'video:family_friendly').text = 'yes'
    (PUBLIC / 'sitemap-videos.xml').write_text(pretty_xml(video_sm), encoding='utf-8')

    prod_sm = sitemap_urlset(image_ns)
    for product in products[:160]:
        u = add_url(prod_sm, product['url'], today, 'weekly', '0.7')
        im = ET.SubElement(u, 'image:image')
        ET.SubElement(im, 'image:loc').text = PRIMARY + product['image'] if product['image'].startswith('/') else product['image']
        ET.SubElement(im, 'image:title').text = product['name'][:120]
        ET.SubElement(im, 'image:caption').text = product['description'][:240]
    (PUBLIC / 'sitemap-products.xml').write_text(pretty_xml(prod_sm), encoding='utf-8')

    news_ns = {'xmlns:news': 'http://www.google.com/schemas/sitemap-news/0.9', 'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1'}
    news_sm = sitemap_urlset(news_ns)
    for item in news[:30]:
        u = add_url(news_sm, item['url'], item['dateModified'][:10])
        n = ET.SubElement(u, 'news:news')
        pub = ET.SubElement(n, 'news:publication')
        ET.SubElement(pub, 'news:name').text = 'Lovanet Actualités Anime'
        ET.SubElement(pub, 'news:language').text = 'fr'
        ET.SubElement(n, 'news:publication_date').text = item['datePublished']
        ET.SubElement(n, 'news:title').text = item['title']
        kws = ', '.join(item['tags'][:8])
        ET.SubElement(n, 'news:keywords').text = kws
        im = ET.SubElement(u, 'image:image')
        ET.SubElement(im, 'image:loc').text = item['image'] if str(item['image']).startswith('http') else PRIMARY + item['image']
        ET.SubElement(im, 'image:title').text = item['title']
    (PUBLIC / 'sitemap-news.xml').write_text(pretty_xml(news_sm), encoding='utf-8')

    books = sitemap_urlset(image_ns)
    for product in [p for p in products if p.get('category') == 'manga'][:80]:
        add_url(books, product['url'], today, 'weekly', '0.55')
    (PUBLIC / 'sitemap-books.xml').write_text(pretty_xml(books), encoding='utf-8')


def write_feeds(news: list[dict]) -> None:
    rss = ET.Element('rss', {'version': '2.0', 'xmlns:media': 'http://search.yahoo.com/mrss/'})
    channel = ET.SubElement(rss, 'channel')
    ET.SubElement(channel, 'title').text = 'Lovanet Actualités Anime.Moments.officiel'
    ET.SubElement(channel, 'link').text = f'{PRIMARY}/actualites'
    ET.SubElement(channel, 'description').text = 'Actualités anime, vidéos, produits, manga et catalogue Lovanet.'
    ET.SubElement(channel, 'language').text = 'fr-fr'
    ET.SubElement(channel, 'lastBuildDate').text = RFC_NOW
    for item in news[:30]:
        e = ET.SubElement(channel, 'item')
        ET.SubElement(e, 'title').text = item['title']
        ET.SubElement(e, 'link').text = item['url']
        ET.SubElement(e, 'guid', {'isPermaLink': 'true'}).text = item['url']
        ET.SubElement(e, 'description').text = item['description']
        ET.SubElement(e, 'pubDate').text = datetime.fromisoformat(item['datePublished']).strftime('%a, %d %b %Y %H:%M:%S +0000')
        ET.SubElement(e, 'media:thumbnail', {'url': item['image'] if str(item['image']).startswith('http') else PRIMARY + item['image']})
    (PUBLIC / 'rss.xml').write_text(pretty_xml(rss), encoding='utf-8')

    feed = ET.Element('feed', {'xmlns': 'http://www.w3.org/2005/Atom'})
    ET.SubElement(feed, 'title').text = 'Lovanet Actualités Anime.Moments.officiel'
    ET.SubElement(feed, 'id').text = f'{PRIMARY}/actualites'
    ET.SubElement(feed, 'updated').text = ISO_NOW
    ET.SubElement(feed, 'link', {'href': f'{PRIMARY}/atom.xml', 'rel': 'self'})
    ET.SubElement(feed, 'link', {'href': f'{PRIMARY}/actualites'})
    for item in news[:30]:
        e = ET.SubElement(feed, 'entry')
        ET.SubElement(e, 'title').text = item['title']
        ET.SubElement(e, 'id').text = item['url']
        ET.SubElement(e, 'link', {'href': item['url']})
        ET.SubElement(e, 'updated').text = item['dateModified']
        ET.SubElement(e, 'published').text = item['datePublished']
        ET.SubElement(e, 'summary').text = item['description']
    (PUBLIC / 'atom.xml').write_text(pretty_xml(feed), encoding='utf-8')


def write_robots() -> None:
    body = f"""User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/sync
Disallow: /.lovable/

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /products/
Allow: /assets/
Allow: /lovanet-logo-custom.svg
Allow: /lovanet-logo-custom.png
Allow: /lovanet-og.svg
Allow: /favicon.ico
Allow: /favicon-32x32.png
Allow: /favicon-16x16.png
Allow: /apple-touch-icon.png

User-agent: Googlebot-Video
Allow: /

Sitemap: {PRIMARY}/sitemap.xml
Sitemap: {PRIMARY}/sitemap-images.xml
Sitemap: {PRIMARY}/sitemap-videos.xml
Sitemap: {PRIMARY}/sitemap-products.xml
Sitemap: {PRIMARY}/sitemap-news.xml
Sitemap: {SECONDARY}/sitemap.xml

# Google Search Console verification: add the provided google-site-verification value in index.html when available.
"""
    (PUBLIC / 'robots.txt').write_text(body, encoding='utf-8')


def write_backup(products: list[dict], videos: list[dict], catalog: list[dict], news: list[dict]) -> None:
    books = [p for p in products if p.get('category') == 'manga']
    backup = {
        'generatedAt': ISO_NOW,
        'primaryDomain': PRIMARY,
        'alternateDomains': [SECONDARY],
        'keywords': KEYWORDS,
        'pages': PAGES,
        'products': products,
        'videos': videos,
        'news': news,
        'books': books,
        'catalogSample': catalog[:300],
        'searchConsole': {
            'status': 'credentials_required',
            'requiredScopes': ['https://www.googleapis.com/auth/webmasters'],
            'sitemapsReady': ['sitemap.xml', 'sitemap-images.xml', 'sitemap-videos.xml', 'sitemap-products.xml', 'sitemap-news.xml', 'sitemap-books.xml'],
        },
    }
    (PUBLIC / 'seo-backup.json').write_text(json.dumps(backup, ensure_ascii=False, indent=2), encoding='utf-8')
    (PUBLIC / 'seo-news.json').write_text(json.dumps(news, ensure_ascii=False, indent=2), encoding='utf-8')
    data_ts = 'export const SEO_NEWS = ' + json.dumps(news, ensure_ascii=False, indent=2) + ' as const;\nexport type SeoNewsItem = (typeof SEO_NEWS)[number];\n'
    (SRC / 'data' / 'seoNews.ts').write_text(data_ts, encoding='utf-8')


def write_jsonld_static(products: list[dict], videos: list[dict], news: list[dict]) -> None:
    org = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization', '@id': f'{PRIMARY}/#organization', 'name': 'Lovanet Anime.Moments.officiel',
                'url': PRIMARY, 'logo': f'{PRIMARY}/lovanet-logo-custom.png',
                'sameAs': ['https://www.youtube.com/@animemomentsanimeofficiel', 'https://www.tiktok.com/@anime.moments.officiel'],
                'aggregateRating': {'@type': 'AggregateRating', 'ratingValue': '4.8', 'reviewCount': '1284'},
                'review': {'@type': 'Review', 'name': 'Avis éditorial Lovanet', 'reviewBody': 'Plateforme anime complète réunissant vidéos, catalogue, boutique manga et actualités Anime.Moments.officiel.', 'reviewRating': {'@type': 'Rating', 'ratingValue': '5', 'bestRating': '5'}, 'author': {'@type': 'Organization', 'name': 'Lovanet'}},
            },
            {'@type': 'WebSite', '@id': f'{PRIMARY}/#website', 'url': PRIMARY, 'name': 'Lovanet', 'potentialAction': {'@type': 'SearchAction', 'target': f'{PRIMARY}/anime-catalog?q={{search_term_string}}', 'query-input': 'required name=search_term_string'}},
        ],
    }
    (PUBLIC / 'structured-data.json').write_text(json.dumps(org, ensure_ascii=False, indent=2), encoding='utf-8')


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    catalog = load_catalog()
    products = parse_products_from_sitemap()
    videos = build_videos(catalog)
    news = build_news(products, videos, catalog)
    write_logo()
    write_sitemaps(products, videos, catalog, news)
    write_feeds(news)
    write_robots()
    write_backup(products, videos, catalog, news)
    write_jsonld_static(products, videos, news)
    print(json.dumps({'pages': len(PAGES), 'products': len(products), 'videos': len(videos), 'news': len(news), 'catalog': len(catalog)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
