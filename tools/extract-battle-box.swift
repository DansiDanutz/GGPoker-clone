import Foundation
import CoreGraphics
import ImageIO
import CryptoKit
let root=URL(fileURLWithPath:CommandLine.arguments[1]),out=URL(fileURLWithPath:CommandLine.arguments[2]),atlas=root.appendingPathComponent("after_lobby/desktop_table_assets.png"),metadata=atlas.deletingPathExtension().appendingPathExtension("json")
func pixels(_ image:CGImage)->Data{let c=CGContext(data:nil,width:image.width,height:image.height,bitsPerComponent:8,bytesPerRow:image.width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!;c.draw(image,in:CGRect(x:0,y:0,width:image.width,height:image.height));return Data(bytes:c.data!,count:image.width*image.height*4)}
func hash(_ data:Data)->String{SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined()}
let json=try JSONSerialization.jsonObject(with:Data(contentsOf:metadata)) as! [String:Any],frames=json["frames"] as! [String:[String:Any]],image=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(atlas as CFURL,nil)!,0,nil)!
var records=[[String:Any]]()
for (key,name,w,h) in [("table0385","winner",297,77),("table0386","remaining",181,121)]{
 let frame=frames[key]!,r=frame["frame"] as! [String:Int];precondition(frame["rotated"] as! Bool == false && r["w"]==w && r["h"]==h)
 let crop=image.cropping(to:CGRect(x:r["x"]!,y:r["y"]!,width:w,height:h))!,url=out.appendingPathComponent("native-battle-box-"+name+".png")
 if !FileManager.default.fileExists(atPath:url.path){let dest=CGImageDestinationCreateWithURL(url as CFURL,"public.png" as CFString,1,nil)!;CGImageDestinationAddImage(dest,crop,nil);precondition(CGImageDestinationFinalize(dest))}
 let check=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!;precondition(check.width==w && check.height==h && pixels(crop)==pixels(check),"Preserve existing output; native pixels changed")
 let raw=try Data(contentsOf:url);records.append(["file":url.lastPathComponent,"frame":key,"width":w,"height":h,"rgbaExact":true,"sha256":hash(raw),"bytes":raw.count])
}
let receipt:[String:Any] = ["method":"StageAssets desktop frame-only crop; exact decoded RGBA readback, no synthetic trim padding","sources":[atlas.path:hash(try Data(contentsOf:atlas)),metadata.path:hash(try Data(contentsOf:metadata))],"files":records]
try JSONSerialization.data(withJSONObject:receipt,options:[.prettyPrinted,.sortedKeys]).write(to:out.appendingPathComponent("rea/battle-box-atlas.json"));print("PASS native bounty winner297x77/remaining181x121 sprites and exact RGBA readback")
