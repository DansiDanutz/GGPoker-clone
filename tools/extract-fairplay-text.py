import json,sys
from pathlib import Path
source,out=map(Path,sys.argv[1:])
data=json.loads(source.read_text(encoding="utf-8-sig"))
keys={1:("OffensiveNicknameAvatar","OffensiveNicknameAvatarMessage"),3:("ReportChipDumping","ReportChipDumpingMessage"),4:("BonusAbuse","BonusAbuseMessage"),5:("ReportCollusion","ReportCollusionMessage"),6:("ReportBumHunting","ReportBumHuntingMessage"),7:("SuspiciousPlay","SuspiciousPlayMessage"),8:("Bots","BotsMessage"),9:("RTA","RTAMessage")}
def english(key):
 value=data[key]["en"]
 assert isinstance(value,str) and value
 return value
result={"placeholder":english("Pleaseselectreportingcategory"),"heading":english("WhatHappened"),"types":{str(n):{"title":english(k),"description":english(v)} for n,(k,v) in keys.items()}}
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
assert json.loads(out.read_text())==result
print("PASS packagedEnglish report strings:",len(keys),"categories,exact JSON roundtrip")
