#!/usr/bin/env python3
"""Install a verified runtime module/page graph outside the synced source checkout."""
import argparse,hashlib,json,os,re,shutil,subprocess,tempfile
from pathlib import Path

references=re.compile(r"[\"']([a-zA-Z0-9_./-]+\.(?:mjs|html|css))(?:[?#][^\"'\s]*)?[\"']")

def runtime_files(repo):
    pending=[repo/'server.mjs'];found=set()
    while pending:
        lexical=pending.pop();path=lexical.resolve()
        assert path.is_relative_to(repo),'Runtime reference escapes checkout: '+str(lexical)
        assert not any(p.is_symlink() for p in [lexical,*lexical.parents] if p.is_relative_to(repo)),'Symlinked runtime source requires review'
        if path in found:continue
        assert path.is_file(),'Missing runtime dependency: '+str(path)
        assert path.suffix in ('.mjs','.html','.css'),'Unsupported runtime dependency'
        found.add(path)
        for reference in references.findall(path.read_text()):
            pending.append((repo/reference.lstrip('/'))if reference.startswith('/')else path.parent/reference)
    return sorted(found)

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('destination',type=Path);parser.add_argument('--inventory',action='store_true');args=parser.parse_args()
    repo=Path(__file__).resolve().parents[1];files=runtime_files(repo);size=sum(p.stat().st_size for p in files)
    assert size<=16*1024*1024,'Unexpected runtime code footprint'
    destination=args.destination.expanduser().resolve()
    assert not destination.is_relative_to(repo),'Use an installation directory outside the checkout'
    assert not any(destination.is_relative_to((Path.home()/name).resolve()) for name in ('Documents','Desktop','Library/Mobile Documents')),'Use a nonsynced installation directory'
    if args.inventory:print(json.dumps({'files':len(files),'bytes':size,'destination':str(destination),'paths':[str(p.relative_to(repo))for p in files]}));return
    def git(*cmd):return subprocess.check_output(['git','-C',str(repo),*cmd],text=True).strip()
    commit=git('rev-parse','HEAD');assert not git('status','--porcelain'),'Commit source changes before installing a runtime'
    git('ls-files','--error-unmatch','--',*[str(p.relative_to(repo))for p in files])
    assert not destination.exists(),'Destination already exists; preserve the installed release'
    destination.parent.mkdir(parents=True,exist_ok=True)
    assert shutil.disk_usage(destination.parent).free>size+10*1024**3,'Insufficient local headroom'
    stage=Path(tempfile.mkdtemp(prefix='.playgg-runtime-',dir=destination.parent));os.chmod(stage,0o700)
    try:
        records=[]
        for source in files:
            relative=source.relative_to(repo);target=stage/relative;target.parent.mkdir(parents=True,exist_ok=True);os.chmod(target.parent,0o700)
            shutil.copyfile(source,target);os.chmod(target,0o600)
            digest=hashlib.sha256(target.read_bytes()).hexdigest();assert digest==hashlib.sha256(source.read_bytes()).hexdigest(),str(relative)
            records.append({'file':str(relative),'bytes':target.stat().st_size,'sha256':digest})
        assert git('rev-parse','HEAD')==commit and not git('status','--porcelain'),'Source changed during installation'
        manifest=stage/'runtime-manifest.json';manifest.write_text(json.dumps({'sourceCommit':commit,'files':records},indent=2));os.chmod(manifest,0o600)
        stage.rename(destination);print(json.dumps({'sourceCommit':commit,'files':len(files),'bytes':size,'destination':str(destination)}))
    finally:
        if stage.exists():shutil.rmtree(stage)

if __name__=='__main__':main()
