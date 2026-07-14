#!/usr/bin/env python3
"""Core POC validation for Lovanet reconstruction.
Validates backup identification, live crawl inventory, mirrored assets and manifest completeness.
"""
from pathlib import Path
import json
import re

ROOT = Path('/app')
BACKUP = ROOT / 'extraction/raw/lovanet-fr_260714.backup'
HTML = ROOT / 'extraction/work/root.html'
MANIFEST = ROOT / 'extraction/manifest/lovanet_manifest.json'
PUBLIC = ROOT / 'frontend/public'


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


def test_backup_format():
    assert_true(BACKUP.exists(), 'Backup file missing')
    data = BACKUP.read_bytes()[:5]
    assert_true(data == b'PGDMP', f'Expected PostgreSQL custom dump PGDMP, got {data!r}')
    assert_true(BACKUP.stat().st_size > 1_000_000, 'Backup is unexpectedly small')
    print('OK backup format PGDMP and size validated')


def test_live_html_assets():
    assert_true(HTML.exists(), 'Live HTML not downloaded')
    html = HTML.read_text(encoding='utf-8', errors='replace')
    assert_true('Anime.Moments.officiel : Lovanet Plateforme officielle' in html, 'Live title missing')
    js = re.search(r'src="(/assets/[^"]+\.js)"', html)
    css = re.search(r'href="(/assets/[^"]+\.css)"', html)
    assert_true(js and css, 'Live JS/CSS bundle references missing')
    assert_true((PUBLIC / js.group(1).lstrip('/')).exists(), 'Mirrored JS bundle missing')
    assert_true((PUBLIC / css.group(1).lstrip('/')).exists(), 'Mirrored CSS bundle missing')
    print('OK live HTML and mirrored JS/CSS bundles validated')


def test_manifest_pages_assets():
    assert_true(MANIFEST.exists(), 'Manifest missing')
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    paths = {p['path'] for p in manifest['pages']}
    for path in ['/', '/shop', '/decouvrir', '/lecteurs-video', '/chaine-youtube', '/prime-video', '/tiktok', '/anime-countdown', '/anime-catalog', '/contact', '/legals']:
        assert_true(path in paths, f'Expected page missing from manifest: {path}')
    asset_paths = {a.get('local_path') for a in manifest['assets']}
    for path in ['/assets/index-BeHpH8Zk.js', '/assets/index-Cs62gLZo.css', '/favicon.png', '/products/am-001.svg', '/products/am-012.svg']:
        assert_true(path in asset_paths and (PUBLIC / path.lstrip('/')).exists(), f'Expected asset missing: {path}')
    assert_true(len(manifest['assets']) >= 15, 'Not enough assets mirrored')
    print(f"OK manifest validated: {len(paths)} pages, {len(manifest['assets'])} assets")


def main():
    test_backup_format()
    test_live_html_assets()
    test_manifest_pages_assets()
    print('CORE_POC_SUCCESS')


if __name__ == '__main__':
    main()
