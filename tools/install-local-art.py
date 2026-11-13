#!/usr/bin/env python3
"""Install a byte-verified private runtime-art snapshot outside the source checkout."""
import argparse,hashlib,json,os,re,shutil,tempfile
from pathlib import Path

def assets(repo):
    art=repo/'home-art'
    text='\n'.join(p.read_text() for pattern in ('*.mjs','*.html','*.css') for p in repo.glob(pattern))
    names=set(re.findall(r'[a-zA-Z0-9_-]+\.(?:png|webp|json|ttf|mp3)',text))
    names.update(item['id']+'.png' for item in json.loads((art/'layout.json').read_text()) if item.get('mode') in ('button','art'))
    names.update(f'{kind}-{i}.png' for kind in ('slide','edge') for i in range(15))
    names.update(f'avatar-{i}.png' for i in range(7))
    return sorted(p for p in art.iterdir() if p.is_file() and (p.name.startswith('native-') and p.suffix in ('.png','.webp','.json','.ttf') or p.suffix=='.mp3' or p.name in names))

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('destination',type=Path);parser.add_argument('--inventory',action='store_true');args=parser.parse_args()
    repo=Path(__file__).resolve().parents[1];files=assets(repo);size=sum(p.stat().st_size for p in files)
    assert size<=256*1024*1024,'Unexpected runtime-art footprint'
    assert all(not p.is_symlink() for p in files),'Symlinked artwork requires review'
    destination=args.destination.expanduser().resolve()
    assert not destination.is_relative_to(repo),'Use a nonsynced installation directory outside the checkout'
    home=Path.home()
    assert not any(destination.is_relative_to((home/name).resolve()) for name in ('Documents','Desktop','Library/Mobile Documents')),'Use a nonsynced installation directory'
    if args.inventory:print(json.dumps({'files':len(files),'bytes':size,'destination':str(destination)}));return
    assert not destination.exists(),'Destination already exists; preserve the installed snapshot'
    destination.parent.mkdir(parents=True,exist_ok=True)
    assert shutil.disk_usage(destination.parent).free>size+10*1024**3,'Insufficient headroom for essential local artwork installation'
    stage=Path(tempfile.mkdtemp(prefix='.playgg-art-',dir=destination.parent));os.chmod(stage,0o700)
    try:
        records=[]
        for source in files:
            target=stage/source.name;shutil.copyfile(source,target);os.chmod(target,0o600)
            digest=hashlib.sha256(target.read_bytes()).hexdigest();assert digest==hashlib.sha256(source.read_bytes()).hexdigest(),source.name
            records.append({'file':source.name,'bytes':target.stat().st_size,'sha256':digest})
        (stage/'installation-manifest.json').write_text(json.dumps({'source':str(repo),'files':records},indent=2));os.chmod(stage/'installation-manifest.json',0o600)
        stage.rename(destination);print(json.dumps({'files':len(files),'bytes':size,'destination':str(destination)}))
    finally:
        if stage.exists():shutil.rmtree(stage)

if __name__=='__main__':main()
