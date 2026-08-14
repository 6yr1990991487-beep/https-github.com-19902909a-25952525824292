#!/usr/bin/env python3
"""
Download files from Google Drive using the export download URL flow.

Usage:
  python scripts/download_drive_videos.py

This script contains the three Drive IDs provided and will download them
into `public/videos/drive-video-1.mp4`, `drive-video-2.mp4`, `drive-video-3.mp4`.

Requires: Python 3 and `requests` (pip install requests)
"""
import os
import sys
from pathlib import Path
import requests

FILES = [
    ("1Hb1rNoKeXqSyErkGty50lKHfitjpcGnI", "public/videos/drive-video-1.mp4"),
    ("1AcbfFvKtq9giD7nu-_8Sy4boyAYrPMN8", "public/videos/drive-video-2.mp4"),
    ("1OnLA9GwyhIhNN-z6v1fufmmpF3y1A-JM", "public/videos/drive-video-3.mp4"),
]


def download_from_google_drive(file_id: str, destination: str):
    url = "https://docs.google.com/uc?export=download"
    session = requests.Session()
    response = session.get(url, params={"id": file_id}, stream=True)

    # Check for confirmation token (large files)
    token = None
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            token = value
            break
    if token:
        response = session.get(url, params={"id": file_id, "confirm": token}, stream=True)

    dest_path = Path(destination)
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    total = response.headers.get("content-length")
    try:
        total = int(total)
    except Exception:
        total = None

    print(f"Downloading {file_id} -> {destination}")
    with open(dest_path, "wb") as f:
        downloaded = 0
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if not chunk:
                continue
            f.write(chunk)
            downloaded += len(chunk)
            if total:
                pct = downloaded * 100 // total
                print(f"\r{pct}% ({downloaded // (1024*1024)} MiB)", end="")
    print("\nDone.")


def main():
    try:
        import requests  # noqa: F401
    except Exception:
        print("This script requires the 'requests' package. Install with: pip install requests")
        sys.exit(1)

    for file_id, out in FILES:
        try:
            download_from_google_drive(file_id, out)
        except Exception as e:
            print(f"Failed to download {file_id}: {e}")


if __name__ == "__main__":
    main()
