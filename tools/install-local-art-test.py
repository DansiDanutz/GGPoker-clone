import hashlib,json,subprocess,sys,tempfile,shutil
from pathlib import Path
with tempfile.TemporaryDirectory(prefix='installed-art-test-') as tmp:
 root=Path(tmp);repo=root/'repo';(repo/'tools').mkdir(parents=True);art=repo/'home-art';art.mkdir()
 script=repo/'tools/install-local-art.py';shutil.copyfile(Path(__file__).with_name('install-local-art.py'),script)
 (repo/'ui.mjs').write_text("const src='/home-art/green-felt.png'")
 (art/'layout.json').write_text('[{"id":"home","mode":"button"}]')
 for name in ['native-theme.png','native-language-en.json','home.png','green-felt.png','avatar-0.png','edge-1.png','RabbitCard.mp3','observed-private.png']:(art/name).write_bytes(name.encode())
 dest=root/'installed';cmd=[sys.executable,str(script),str(dest)]
 p=subprocess.run(cmd,capture_output=True,text=True);assert p.returncode==0,p.stderr
 manifest=json.loads((dest/'installation-manifest.json').read_text());names={r['file']for r in manifest['files']}
 assert 'observed-private.png' not in names
 assert {'home.png','native-theme.png','green-felt.png','avatar-0.png','edge-1.png','RabbitCard.mp3'}<=names
 for item in manifest['files']:
  content=(dest/item['file']).read_bytes();assert content==(art/item['file']).read_bytes();assert hashlib.sha256(content).hexdigest()==item['sha256'];assert (dest/item['file']).stat().st_mode&0o777==0o600
 assert dest.stat().st_mode&0o777==0o700
 assert subprocess.run(cmd,capture_output=True).returncode!=0,'Existing snapshot must survive'
 bad=subprocess.run([sys.executable,str(script),str(repo/'bad')],capture_output=True,text=True);assert bad.returncode!=0,('Checkout destination denied',bad.stdout,bad.stderr)
 print('PASS local art installer: runtime selection, capture exclusion, exact bytes/hashes, private permissions and overwrite/checkout guards')
