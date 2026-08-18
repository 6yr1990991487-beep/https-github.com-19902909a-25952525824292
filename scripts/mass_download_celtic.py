#!/usr/bin/env python3
import os, sys, json, time, urllib.request, urllib.error, re
from urllib.parse import quote_plus

OUT_DIR='/app/public/audio/celtic'
os.makedirs(OUT_DIR, exist_ok=True)

allowed_license_keywords=['creativecommons.org','creative commons','public domain','cc0','no copyright','no rights reserved','cc-by','cc by','cc0']

ROWS=200

session_start=time.time()

def search_page(query,page):
    url=f"https://archive.org/advancedsearch.php?q={quote_plus(query)}+AND+mediatype:audio&fl[]=identifier,title,creator,license,publicdate&rows={ROWS}&page={page+1}&output=json"
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            return json.load(r)
    except Exception as e:
        print('search_page error',e,file=sys.stderr)
        return None

def fetch_metadata(identifier):
    url=f'https://archive.org/metadata/{identifier}'
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            return json.load(r)
    except Exception as e:
        print('metadata error',identifier,e,file=sys.stderr)
        return None

def license_ok(lic):
    if not lic:
        return False
    l=lic.lower()
    for kw in allowed_license_keywords:
        if kw in l:
            return True
    return False

seen_ids=set()

query='celtic'
page=0
ids=[]
print('Collecting identifiers from archive.org for query:',query)
while True:
    j=search_page(query,page)
    if not j:
        print('No response for page',page)
        break
    docs=j.get('response',{}).get('docs',[])
    if not docs:
        print('No more docs at page',page)
        break
    for d in docs:
        ident=d.get('identifier')
        if ident and ident not in seen_ids:
            seen_ids.add(ident)
            ids.append(ident)
    page+=1
    print('Collected',len(ids),'identifiers so far (page',page,')')
    time.sleep(0.2)

print('Total identifiers collected:',len(ids))

downloaded=0
skipped=0
errors=0

for idx,ident in enumerate(ids,1):
    meta=fetch_metadata(ident)
    if not meta:
        errors+=1
        continue
    lic = meta.get('metadata',{}).get('license') or meta.get('license') or meta.get('metadata',{}).get('rights')
    if isinstance(lic,list):
        lic=' '.join(lic)
    lic_str = lic if lic else ''
    if not license_ok(lic_str):
        skipped+=1
        print('SKIP (license unverified):',ident)
        continue
    files=meta.get('files',[])
    if not files:
        skipped+=1
        continue
    target_dir=os.path.join(OUT_DIR, ident)
    os.makedirs(target_dir, exist_ok=True)
    for f in files:
        name=f.get('name')
        fmt=f.get('format') or ''
        if not name:
            continue
        lower=name.lower()
        if lower.endswith(('.mp3','.wav','.flac','.ogg')) or 'mp3' in fmt.lower() or 'wav' in fmt.lower():
            dl_url=f'https://archive.org/download/{ident}/{name}'
            dest=os.path.join(target_dir,name)
            if os.path.exists(dest):
                continue
            try:
                print('Downloading',dl_url)
                urllib.request.urlretrieve(dl_url,dest)
                downloaded+=1
            except Exception as e:
                print('download error',dl_url,e,file=sys.stderr)
                errors+=1
    if idx%10==0:
        elapsed=int(time.time()-session_start)
        print(f'Progress: processed {idx}/{len(ids)} ids, downloaded {downloaded}, skipped {skipped}, errors {errors}, elapsed {elapsed}s')
    time.sleep(0.05)

print('Finished. downloaded',downloaded,'skipped',skipped,'errors',errors)
