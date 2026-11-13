import hashlib,json,os,shutil,subprocess,sys,tempfile
from pathlib import Path
installer=Path(__file__).with_name('install-local-runtime.py').resolve()
with tempfile.TemporaryDirectory(prefix='playgg-runtime-test-') as tmp:
 root=Path(tmp).resolve();repo=root/'source';(repo/'engine').mkdir(parents=True);(repo/'tools').mkdir();fixture_installer=repo/'tools/install-local-runtime.py';shutil.copyfile(installer,fixture_installer)
 (repo/'server.mjs').write_text("import value from './engine/model.mjs';const files=new Set(['network.html','ui.mjs']);console.log(value)")
 (repo/'engine/model.mjs').write_text("export default 'isolated runtime'")
 (repo/'network.html').write_text('<script type="module" src="/ui.mjs"></script>')
 (repo/'engine/nested').mkdir();(repo/'engine/nested/helper.mjs').write_text("import value from '../../engine/model.mjs';export default value");(repo/'ui.mjs').write_text("import value from './engine/nested/helper.mjs?v=1';console.log(value)")
 (repo/'owner.key').write_text('private fixture key');(repo/'tables.json').write_text('[]');(repo/'unused-test.mjs').write_text('throw Error()')
 def git(*args):return subprocess.check_output(['git','-C',str(repo),*args],stderr=subprocess.STDOUT,text=True)
 git('init','-q');git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@localhost','commit','-qm','fixture')
 dest=root/'installed';command=[sys.executable,str(fixture_installer),str(dest)]
 result=subprocess.run(command,capture_output=True,text=True);assert result.returncode==0,result.stderr
 manifest=json.loads((dest/'runtime-manifest.json').read_text());names={r['file']for r in manifest['files']};assert names=={'server.mjs','engine/model.mjs','network.html','ui.mjs','engine/nested/helper.mjs'}
 assert manifest['sourceCommit']==git('rev-parse','HEAD').strip();assert dest.stat().st_mode&0o777==0o700
 for row in manifest['files']:
  path=dest/row['file'];assert path.read_bytes()==(repo/row['file']).read_bytes();assert hashlib.sha256(path.read_bytes()).hexdigest()==row['sha256'];assert path.stat().st_mode&0o777==0o600
 away=root/'source-away';repo.rename(away)
 launched=subprocess.run(['node','--permission','--allow-fs-read='+str(dest),str(dest/'server.mjs')],cwd=root,capture_output=True,text=True);assert launched.returncode==0,launched.stderr;assert launched.stdout.strip()=='isolated runtime';denied=subprocess.run(['node','--permission','--allow-fs-read='+str(dest),'--input-type=module','-e',"import{readFileSync}from'node:fs';try{readFileSync("+json.dumps(str(away/'server.mjs'))+");process.exit(1)}catch(e){if(e.code!=='ERR_ACCESS_DENIED')throw e}"],capture_output=True,text=True);assert denied.returncode==0,denied.stderr;away.rename(repo)
 assert subprocess.run(command,capture_output=True).returncode!=0,'Existing release must survive'
 bad=[sys.executable,str(fixture_installer),str(repo/'bad')];assert subprocess.run(bad,capture_output=True).returncode!=0,'Checkout destination denied'
 original=(repo/'ui.mjs').read_text();(repo/'ui.mjs').write_text(original+';')
 dirty=[sys.executable,str(fixture_installer),str(root/'dirty')];assert subprocess.run(dirty,capture_output=True).returncode!=0;assert not(root/'dirty').exists();(repo/'ui.mjs').write_text(original)
 (root/'escape.mjs').write_text('secret');(repo/'server.mjs').write_text("import '../escape.mjs'")
 assert subprocess.run(command+['--inventory'],capture_output=True).returncode!=0,'Escaping imports denied'
 print('PASS installed runtime: complete local graph, committed hashes/private permissions, no data/tests/git copied, launch without source, dirty/overwrite/checkout/escape guards')
