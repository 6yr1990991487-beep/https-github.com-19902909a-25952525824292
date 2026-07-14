#!/usr/bin/env python3
"""Phase 3 external sync POC for Lovanet.
One script validates YouTube official API, AniList public GraphQL, TikTok public best-effort,
and Prime Video public best-effort without requiring credentials beyond YOUTUBE_API_KEY.
"""
from __future__ import annotations

from pathlib import Path
from dotenv import dotenv_values
import json
import re
import time
import urllib.parse
import urllib.request

ENV = dotenv_values('/app/backend/.env')
YOUTUBE_API_KEY = ENV.get('YOUTUBE_API_KEY')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
OUT = Path('/app/extraction/manifest/phase3_sync_poc.json')


def request_json(url: str, method: str = 'GET', body: dict | None = None, timeout: int = 25) -> dict:
    data = None
    headers = {'User-Agent': UA, 'Accept': 'application/json'}
    if body is not None:
        data = json.dumps(body).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode('utf-8', 'replace'))


def request_text(url: str, timeout: int = 25) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, resp.read().decode('utf-8', 'replace')


def youtube_sync_poc() -> dict:
    if not YOUTUBE_API_KEY:
        return {'status': 'error', 'error': 'YOUTUBE_API_KEY missing'}
    base = 'https://www.googleapis.com/youtube/v3'
    handle = 'animemomentsAnimeofficiel'
    channel_url = f'{base}/channels?part=snippet,contentDetails,statistics&forHandle={urllib.parse.quote(handle)}&key={YOUTUBE_API_KEY}'
    channel = request_json(channel_url)
    items = channel.get('items') or []
    if not items:
        search_url = f'{base}/search?part=snippet&type=channel&q={urllib.parse.quote(handle)}&maxResults=1&key={YOUTUBE_API_KEY}'
        search = request_json(search_url)
        search_items = search.get('items') or []
        if not search_items:
            return {'status': 'error', 'error': 'Channel not found by handle/search'}
        channel_id = search_items[0]['snippet']['channelId']
        channel = request_json(f'{base}/channels?part=snippet,contentDetails,statistics&id={channel_id}&key={YOUTUBE_API_KEY}')
        items = channel.get('items') or []
    item = items[0]
    uploads = item['contentDetails']['relatedPlaylists']['uploads']
    playlist_url = f'{base}/playlistItems?part=snippet,contentDetails&playlistId={uploads}&maxResults=8&key={YOUTUBE_API_KEY}'
    playlist = request_json(playlist_url)
    videos = []
    for entry in playlist.get('items', []):
        sn = entry.get('snippet', {})
        thumbs = sn.get('thumbnails', {})
        videos.append({
            'platform': 'youtube',
            'external_id': sn.get('resourceId', {}).get('videoId') or entry.get('contentDetails', {}).get('videoId'),
            'title': sn.get('title'),
            'description': (sn.get('description') or '')[:240],
            'thumbnail_url': (thumbs.get('maxres') or thumbs.get('high') or thumbs.get('medium') or thumbs.get('default') or {}).get('url'),
            'published_at': sn.get('publishedAt'),
            'channel_title': sn.get('channelTitle'),
        })
    return {
        'status': 'ok',
        'channel_id': item.get('id'),
        'channel_title': item.get('snippet', {}).get('title'),
        'video_count': len(videos),
        'sample_videos': videos,
    }


def anilist_sync_poc() -> dict:
    query = '''
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
    '''
    data = request_json('https://graphql.anilist.co', method='POST', body={'query': query, 'variables': {'page': 1, 'perPage': 12}})
    media = data.get('data', {}).get('Page', {}).get('media', [])
    items = []
    for anime in media:
        title = anime.get('title') or {}
        trailer = anime.get('trailer') or {}
        items.append({
            'provider': 'anilist',
            'external_id': anime.get('id'),
            'title': title.get('english') or title.get('romaji') or title.get('native'),
            'summary': re.sub(r'<[^>]+>', '', anime.get('description') or '')[:320],
            'year': anime.get('seasonYear'),
            'score': anime.get('averageScore'),
            'genres': anime.get('genres') or [],
            'cover': (anime.get('coverImage') or {}).get('extraLarge') or (anime.get('coverImage') or {}).get('large'),
            'banner': anime.get('bannerImage'),
            'trailerId': trailer.get('id') if trailer.get('site') == 'youtube' else None,
        })
    return {'status': 'ok', 'count': len(items), 'sample_items': items}


def tiktok_best_effort_poc() -> dict:
    url = 'https://www.tiktok.com/@anime.moments.officiel'
    try:
        status, text = request_text(url, timeout=20)
        titles = re.findall(r'"desc":"(.*?)"', text)[:8]
        video_ids = re.findall(r'"id":"(\d{12,})"', text)[:8]
        return {'status': 'ok' if (titles or video_ids) else 'degraded', 'http_status': status, 'found_titles': len(titles), 'found_video_ids': len(video_ids), 'sample': titles[:3]}
    except Exception as exc:
        return {'status': 'degraded', 'error': str(exc)[:240], 'note': 'TikTok public pages often block unauthenticated server crawlers; backend will keep degraded status and fallback controls.'}


def prime_best_effort_poc() -> dict:
    url = 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=anime'
    try:
        status, text = request_text(url, timeout=20)
        titles = list(dict.fromkeys(re.findall(r'aria-label="([^"]*(?:Anime|anime|Manga|manga)[^"]*)"', text)))[:12]
        return {'status': 'ok' if titles else 'degraded', 'http_status': status, 'found_titles': len(titles), 'sample': titles[:5]}
    except Exception as exc:
        return {'status': 'degraded', 'error': str(exc)[:240], 'note': 'Prime Video has no public API and may block/geo-gate pages; backend will use best-effort status and AniList/catalog fallbacks.'}


def main() -> None:
    report = {'started_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
    for name, func in [('youtube', youtube_sync_poc), ('anilist', anilist_sync_poc), ('tiktok', tiktok_best_effort_poc), ('prime', prime_best_effort_poc)]:
        try:
            report[name] = func()
            print(name, report[name].get('status'), 'count', report[name].get('video_count') or report[name].get('count') or report[name].get('found_titles') or report[name].get('found_video_ids'))
        except Exception as exc:
            report[name] = {'status': 'error', 'error': str(exc)[:500]}
            print(name, 'error', str(exc)[:160])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    if report.get('youtube', {}).get('status') != 'ok':
        raise SystemExit('YouTube POC failed')
    if report.get('anilist', {}).get('status') != 'ok':
        raise SystemExit('AniList POC failed')
    print('PHASE3_SYNC_POC_SUCCESS', OUT)


if __name__ == '__main__':
    main()
