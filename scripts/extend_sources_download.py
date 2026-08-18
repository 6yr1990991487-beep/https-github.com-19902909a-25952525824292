#!/usr/bin/env python3
"""
Simple crawler to scrape Free Music Archive and Jamendo search pages for direct audio links
and download them into /app/public/audio/celtic. This is a best-effort scraper (no API keys).
"""
import os
import re
import time
import urllib.request
from urllib.parse import quote_plus, urljoin

OUT_DIR='/app/public/audio/celtic'
os.makedirs(OUT_DIR, exist_ok=True)

def download_file(url, dest):
    try:
        if os.path.exists(dest):
            return True
        urllib.request.urlretrieve(url, dest)
        return True
    except Exception as e:
        print('DL ERR', url, e)
        return False

def crawl_fma(query='celtic', pages=5):
    base = 'https://freemusicarchive.org'
    for p in range(1, pages+1):
        url = f'https://freemusicarchive.org/search/?quicksearch={quote_plus(query)}&page={p}'
        print('FMA page', p, url)
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'})
            with urllib.request.urlopen(req, timeout=30) as r:
                html = r.read().decode('utf-8', errors='ignore')
        except Exception as e:
            print('FMA fetch err', e)
            continue
        # find links to .mp3
        for m in re.finditer(r'href="([^"]+\.mp3)"', html, re.IGNORECASE):
            link = m.group(1)
            if link.startswith('/'):
                link = urljoin(base, link)
            fname = os.path.basename(link.split('?')[0])
            dest = os.path.join(OUT_DIR, fname)
            print('FMA DL', link)
            download_file(link, dest)
        time.sleep(0.2)

def crawl_jamendo(query='celtic', pages=3):
    # Jamendo heavily uses JS and APIs; attempt simple search and look for audio urls
    for p in range(1, pages+1):
        url = f'https://www.jamendo.com/search?q={quote_plus(query)}&page={p}'
        print('Jamendo page', p, url)
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'})
            with urllib.request.urlopen(req, timeout=30) as r:
                html = r.read().decode('utf-8', errors='ignore')
        except Exception as e:
            print('Jamendo fetch err', e)
            continue
        # naive approach: extract urls ending with mp3
        for m in re.finditer(r'((https?:)?//[^"\']+\.mp3[^"]*)', html, re.IGNORECASE):
            link = m.group(1)
            if link.startswith('//'):
                link = 'https:' + link
            if link.startswith('http'):
                fname = os.path.basename(link.split('?')[0])
                dest = os.path.join(OUT_DIR, fname)
                print('Jamendo DL', link)
                download_file(link, dest)
        time.sleep(0.2)

def main():
    print('Extend downloader started')
    try:
        crawl_fma('celtic', pages=10)
        crawl_jamendo('celtic', pages=5)
    except KeyboardInterrupt:
        print('Interrupted')
    print('Extend downloader finished')

if __name__ == '__main__':
    main()
