import Foundation
import CoreGraphics
import ImageIO
import CryptoKit
let root=URL(fileURLWithPath:CommandLine.arguments[1]),out=URL(fileURLWithPath:CommandLine.arguments[2])
func pixels(_ image:CGImage)->Data{let c=CGContext(data:nil,width:image.width,height:image.height,bitsPerComponent:8,bytesPerRow:image.width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!;c.draw(image,in:CGRect(x:0,y:0,width:image.width,height:image.height));return Data(bytes:c.data!,count:image.width*image.height*4)}
func hash(_ data:Data)->String{SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined()}
func extract(_ relative:String,_ entries:[(String,String,Int,Int)],_ prefix:String,_ receiptName:String)throws{
 let atlas=root.appendingPathComponent(relative),metadata=atlas.deletingPathExtension().appendingPathExtension("json")
 let json=try JSONSerialization.jsonObject(with:Data(contentsOf:metadata)) as! [String:Any],frames=json["frames"] as! [String:[String:Any]],image=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(atlas as CFURL,nil)!,0,nil)!
 var records=[[String:Any]]()
 for (key,name,w,h) in entries{
  let frame=frames[key]!,r=frame["frame"] as! [String:Int];precondition(frame["rotated"] as! Bool == false && r["w"]==w && r["h"]==h)
  let crop=image.cropping(to:CGRect(x:r["x"]!,y:r["y"]!,width:w,height:h))!,url=out.appendingPathComponent(prefix+name+".png")
  if !FileManager.default.fileExists(atPath:url.path){let dest=CGImageDestinationCreateWithURL(url as CFURL,"public.png" as CFString,1,nil)!;CGImageDestinationAddImage(dest,crop,nil);precondition(CGImageDestinationFinalize(dest))}
  let check=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!;precondition(check.width==w && check.height==h && pixels(crop)==pixels(check),"Preserve existing output; native pixels changed")
  let raw=try Data(contentsOf:url);records.append(["file":url.lastPathComponent,"frame":key,"width":w,"height":h,"rgbaExact":true,"sha256":hash(raw),"bytes":raw.count])
 }
 let receipt:[String:Any] = ["method":"StageAssets desktop frame-only crop; exact decoded RGBA readback, no synthetic trim padding","sources":[atlas.path:hash(try Data(contentsOf:atlas)),metadata.path:hash(try Data(contentsOf:metadata))],"files":records]
 try JSONSerialization.data(withJSONObject:receipt,options:[.prettyPrinted,.sortedKeys]).write(to:out.appendingPathComponent("rea/"+receiptName+".json"))
}
if CommandLine.arguments.contains("--cash-game-info") {
 try extract("init_lobby/desktop_assets.png",[("common0004","close-up",12,11),("common0005","close-over",12,11),("lobby0191","arrow-up",22,80),("lobby0192","arrow-down",22,80),("lobby0193","arrow-over",22,80),("lobby0112","link-icon",16,16)],"native-cash-game-info-","cash-game-info-atlas")
 exit(0)
}
if CommandLine.arguments.contains("--cash-preview-controls") {
 try extract("init_lobby/desktop_assets.png",[("lobby0083","tab-left-up",18,18),("lobby0084","tab-left-selected",18,18),("lobby0085","tab-right-up",18,18),("lobby0086","tab-right-selected",18,18),("lobby_preview0047","note-color",78,37),("lobby_preview0048","note-memo",78,36)],"native-preview-control-","cash-preview-controls-atlas")
 // Bake the fixed117x28 native tabs:flat stretch bands make this exact and avoid browser border-image seams.
 var receipt=try JSONSerialization.jsonObject(with:Data(contentsOf:out.appendingPathComponent("rea/cash-preview-controls-atlas.json"))) as! [String:Any]
 var rendered=[[String:Any]]()
 for stem in ["tab-left-up","tab-left-selected","tab-right-up","tab-right-selected"] {
  let source=out.appendingPathComponent("native-preview-control-"+stem+".png"),image=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(source as CFURL,nil)!,0,nil)!,raw=pixels(image),width=117,height=28
  precondition(image.width==18 && image.height==18)
  for n in 0..<18 { for c in 0..<4 { precondition(raw[(n*18+8)*4+c]==raw[(n*18+9)*4+c] && raw[(8*18+n)*4+c]==raw[(9*18+n)*4+c],"Stretch bands must be flat") } }
  var rgba=Data(count:width*height*4)
  for y in 0..<height { let sy=y<8 ? y : y>=height-8 ? 18-height+y : 8+(y-8)*2/(height-16)
   for x in 0..<width { let sx=x<8 ? x : x>=width-8 ? 18-width+x : 8+(x-8)*2/(width-16)
    for c in 0..<4 { rgba[(y*width+x)*4+c]=raw[(sy*18+sx)*4+c] }
   }
  }
  let scaled=CGImage(width:width,height:height,bitsPerComponent:8,bitsPerPixel:32,bytesPerRow:width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGBitmapInfo(rawValue:CGImageAlphaInfo.premultipliedLast.rawValue),provider:CGDataProvider(data:rgba as CFData)!,decode:nil,shouldInterpolate:false,intent:.defaultIntent)!,url=out.appendingPathComponent("native-preview-control-"+stem+"-117x28.png")
  if !FileManager.default.fileExists(atPath:url.path) { let dest=CGImageDestinationCreateWithURL(url as CFURL,"public.png" as CFString,1,nil)!;CGImageDestinationAddImage(dest,scaled,nil);precondition(CGImageDestinationFinalize(dest)) }
  let check=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!
  precondition(check.width==width && check.height==height && pixels(check)==rgba,"Preserve existing output; native scale9 pixels changed")
  rendered.append(["file":url.lastPathComponent,"source":source.lastPathComponent,"sourceSha256":hash(try Data(contentsOf:source)),"width":width,"height":height,"grid":[8,8,2,2],"rgbaExact":true,"sha256":hash(try Data(contentsOf:url)),"bytes":try Data(contentsOf:url).count])
 }
 receipt["rendered"]=rendered;receipt["renderMethod"]="Native8px borders copied exactly;2px flat stretch bands verified equal,then extended to117x28;no browser nine-patch seams"
 try JSONSerialization.data(withJSONObject:receipt,options:[.prettyPrinted,.sortedKeys]).write(to:out.appendingPathComponent("rea/cash-preview-controls-atlas.json"))
 print("PASS native preview4tabs/2notes exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--cash-preview-player") {
 try extract("init_lobby/desktop_assets.png",[("lobby_preview0030","info",64,46)],"native-tourney-preview-","cash-preview-player-atlas")
 print("PASS native Hold’em preview player plate exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--cash-preview-table") {
 try extract("init_lobby/desktop_assets.png",[("lobby_preview0000","holdem-table",223,351)],"native-lobby-preview-","cash-preview-table-atlas")
 print("PASS native Hold’em preview table exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--cash-table-counter") {
 try extract("init_lobby/desktop_assets.png",[("lobby0089","filled",97,9),("lobby0090","empty",97,9)],"native-cash-table-counter-","cash-table-counter-atlas")
 print("PASS native Table2counterassets exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--cash-group-notes") {
 try extract("init_lobby/desktop_assets.png",[("lobby0536","color",15,20),("lobby0537","memo",20,20)],"native-cash-group-note-","cash-group-notes-atlas")
 print("PASS native Group2noteassets exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--cash-group-players") {
 try extract("init_lobby/desktop_assets.png",[("common0133","selected",10,10),("lobby_preview0034","sort",8,4)],"native-cash-group-player-","cash-group-players-atlas")
 print("PASS native Group2playerassets exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--cash-group-row") {
 try extract("init_lobby/desktop_assets.png",[("lobby0959","players-bg",48,36),("lobby0846","players-icon",24,24),("common0277","indicator",4,8),("common0028","join-over",20,40),("common0029","join-down",20,40)],"native-cash-group-","cash-group-row-atlas")
 print("PASS native Group5rowassets exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--cash-group-controls") {
 try extract("init_lobby/desktop_assets.png",[("lobby_popup0338","line-back",10,4),("lobby_popup0339","line-fill",10,4),("lobby_popup0340","thumb",32,32),("lobby_popup0342","minmax-up",32,32),("lobby_popup0343","minmax-over",32,32),("lobby_popup0344","minmax-down",32,32),("lobby_popup0345","choice",40,32),("lobby_popup0347","choice-active",40,32),("lobby_popup0349","back",24,24),("lobby_popup0350","minus-up",24,24),("lobby_popup0351","minus-over",24,24),("lobby_popup0352","minus-down",24,24),("lobby_popup0353","plus-up",24,24),("lobby_popup0354","plus-over",24,24),("lobby_popup0355","plus-down",24,24),("common0006","close-up",32,32),("common0007","close-over",32,32),("common0008","close-down",32,32),("common0274","info",16,16)],"native-cash-group-","cash-group-controls-atlas")
 print("PASS native Group19controls exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--lobby-preview-markers") {
 try extract("init_lobby/desktop_assets.png",[("lobby_preview0014","dealer",20,21),("lobby_preview0015","small-blind",24,25),("lobby_preview0016","big-blind",24,25)],"native-tourney-preview-","lobby-preview-marker-atlas")
 print("PASS native lobby3markers: exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--lobby-preview-seat") {
 try extract("init_lobby/desktop_assets.png",[("lobby_preview0017","up",55,55),("lobby_preview0018","down",55,55),("lobby_preview0019","over",55,55)],"native-lobby-preview-seat-","lobby-preview-seat-atlas")
 print("PASS native preview seat3 sprites: exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--report-scrollbar") {
 try extract("init_lobby/desktop_assets.png",[("common0275","scrollbar",8,16)],"native-fairplay-","report-scrollbar-atlas")
 print("PASS native report scrollbar: exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--report-input") {
 try extract("after_lobby/desktop_table_assets.png",[("table_menu0145","input",20,20)],"native-fairplay-","report-input-atlas")
 print("PASS native report input: exact decoded RGBA")
 exit(0)
}
if CommandLine.arguments.contains("--hud-more") {
 try extract("init_lobby/desktop_assets.png",[("lobby_popup0367","button",20,20),("table_popup0216","report",19,20)],"native-hud-more-","hud-more-atlas")
 print("PASS2 native HUD More/Report sprites: exact decoded RGBA")
 exit(0)
}
try extract("after_lobby/desktop_table_assets.png",[("table0385","winner",297,77),("table0386","remaining",181,121)],"native-battle-box-","battle-box-atlas")
try extract("init_lobby/desktop_assets.png",[("battleroyale0037","left",160,22),("battleroyale0038","right",160,22),("battleroyale0044","arrow",4,9)],"native-battle-rules-","battle-rules-atlas")
print("PASS native bounty panels and Battle rules lines160x22/arrow4x9; exact RGBA readback")

try extract("init_lobby/desktop_assets.png",[("battleroyale0002","logo",128,110),("battleroyale0004","card",116,124),("battleroyale0005","card-selected",116,124),("lobby0855","players",20,20),("lobby0984","tab-up",24,72),("lobby0985","tab-down",24,72),("lobby0986","tab-over",24,72),("lobby0987","tab-selected",24,72)],"native-battle-lobby-","battle-lobby-atlas")
for (source,name) in [("battleroyalelobbybg.png","bg"),("battleroyalelobbybottombg.png","bottom")]{let data=try Data(contentsOf:root.appendingPathComponent("battleroyale/"+source)),url=out.appendingPathComponent("native-battle-lobby-"+name+".png");if FileManager.default.fileExists(atPath:url.path){let existing=try Data(contentsOf:url);precondition(existing==data)}else{try data.write(to:url)}}
print("PASS native Battle lobby logo/cards/tabs/players exact RGBA and unchanged background bytes")

try extract("init_lobby/desktop_assets.png",[("battleroyale0006","title",308,30),("battleroyale0007","top",308,128),("battleroyale0008","row",308,60),("battleroyale0021","empty",154,116),("battleroyale0063","avatar-frame",48,48),("battleroyale0064","avatar-mask",48,48),("lobby0351","new",25,25)],"native-battle-highlights-","battle-highlights-atlas")
try extract("after_lobby/desktop_table_assets.png",[("table0387","empty-box",92,92)],"native-battle-highlights-","battle-highlights-box-atlas")
print("PASS native bounty highlight title/top/row/empty/avatar sprites; exact RGBA readback")

// Native TourneyLobbyBase common81 nine-patch,8px fixed borders.
try extract("init_lobby/desktop_assets.png",[("common0081","panel",24,24)],"native-tourney-","tourney-panel-atlas")
print("PASS native tournament common81 panel24x24; exact RGBA readback")

try extract("init_lobby/desktop_assets.png",[("common0030","up",20,40),("common0032","down",20,40),("common0027","disabled",20,40),("common0020","shadow",40,40)],"native-tourney-entry-","tourney-entry-atlas")
print("PASS native tournament entry states/shadow; exact RGBA readback")

try extract("init_lobby/desktop_assets.png",[("lobby0512","over",40,24),("lobby0513","focus",40,24),("lobby0514","up",40,24),("lobby0516","icon",14,14),("lobby0517","icon-disabled",14,14),("lobby0550","reset-up",40,18),("lobby0551","reset-down",40,18)],"native-tourney-search-","tourney-search-atlas")
print("PASS native player search7sprites exact decoded RGBA")

try extract("init_lobby/desktop_assets.png",[("lobby_preview0014","dealer",20,21),("lobby_preview0015","small-blind",24,25),("lobby_preview0016","big-blind",24,25),("lobby_preview0030","info",64,46)],"native-tourney-preview-","tourney-preview-atlas")
for (source,name) in [("Preview_TournamentTable_BR_st1.png","rush"),("Preview_TournamentTable_BR_st3.png","final")]{let data=try Data(contentsOf:root.appendingPathComponent("preview/"+source)),url=out.appendingPathComponent("native-tourney-preview-"+name+".png");if FileManager.default.fileExists(atPath:url.path){let existing=try Data(contentsOf:url);precondition(existing==data)}else{try data.write(to:url)}}
