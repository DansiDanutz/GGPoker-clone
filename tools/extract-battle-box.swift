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
try extract("after_lobby/desktop_table_assets.png",[("table0385","winner",297,77),("table0386","remaining",181,121)],"native-battle-box-","battle-box-atlas")
try extract("init_lobby/desktop_assets.png",[("battleroyale0037","left",160,22),("battleroyale0038","right",160,22),("battleroyale0044","arrow",4,9)],"native-battle-rules-","battle-rules-atlas")
print("PASS native bounty panels and Battle rules lines160x22/arrow4x9; exact RGBA readback")

try extract("init_lobby/desktop_assets.png",[("battleroyale0002","logo",128,110),("battleroyale0004","card",116,124),("battleroyale0005","card-selected",116,124),("lobby0855","players",20,20),("lobby0984","tab-up",24,72),("lobby0985","tab-down",24,72),("lobby0986","tab-over",24,72),("lobby0987","tab-selected",24,72)],"native-battle-lobby-","battle-lobby-atlas")
for (source,name) in [("battleroyalelobbybg.png","bg"),("battleroyalelobbybottombg.png","bottom")]{let data=try Data(contentsOf:root.appendingPathComponent("battleroyale/"+source)),url=out.appendingPathComponent("native-battle-lobby-"+name+".png");if FileManager.default.fileExists(atPath:url.path){let existing=try Data(contentsOf:url);precondition(existing==data)}else{try data.write(to:url)}}
print("PASS native Battle lobby logo/cards/tabs/players exact RGBA and unchanged background bytes")
