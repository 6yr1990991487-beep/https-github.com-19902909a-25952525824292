#!/usr/bin/env python3
import os, time, json

ROOT = '/app/public/audio/celtic'
OUT = os.path.join(ROOT, 'playlist.json')
SLEEP = 30

def build_index():
    tracks = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        for f in filenames:
            if f.lower().endswith(('.mp3', '.wav', '.ogg', '.flac')):
                rel = os.path.relpath(os.path.join(dirpath, f), '/app/public')
                tracks.append('/' + rel.replace('\\', '/'))
    tracks_sorted = sorted(set(tracks))
    tmp = OUT + '.tmp'
    with open(tmp, 'w') as fh:
        json.dump(tracks_sorted, fh, indent=2)
    os.replace(tmp, OUT)
    return len(tracks_sorted)

def main():
    print('Playlist watcher started, writing to', OUT)
    os.makedirs(ROOT, exist_ok=True)
    prev = -1
    try:
        while True:
            try:
                count = build_index()
                if count != prev:
                    print('WROTE', OUT, 'COUNT', count)
                    prev = count
            except Exception as e:
                print('Error building index:', e)
            time.sleep(SLEEP)
    except KeyboardInterrupt:
        print('Watcher stopped')

if __name__ == '__main__':
    main()
