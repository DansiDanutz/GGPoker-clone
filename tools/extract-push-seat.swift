import Foundation
import CoreGraphics
import ImageIO
let root=URL(fileURLWithPath:CommandLine.arguments[1]),out=URL(fileURLWithPath:CommandLine.arguments[2]),atlas="after_lobby/desktop_table_assets"
let frames=(try JSONSerialization.jsonObject(with:Data(contentsOf:root.appendingPathComponent(atlas+".json"))) as! [String:Any])["frames"] as! [String:[String:Any]]
let image=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(root.appendingPathComponent(atlas+".png") as CFURL,nil)!,0,nil)!
func pixels(_ im:CGImage)->Data{let c=CGContext(data:nil,width:im.width,height:im.height,bitsPerComponent:8,bytesPerRow:im.width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!;c.draw(im,in:CGRect(x:0,y:0,width:im.width,height:im.height));return Data(bytes:c.data!,count:im.width*im.height*4)}
for(key,name,w,h)in[("table_menu0327","native-push-seat-control",70,70),("table0348","native-push-seat-select",184,184),("table0349","native-push-seat-arrow",90,90),("table0350","native-push-seat-info-bg",30,30),("table0351","native-push-seat-info-side",30,30),("table0352","native-push-seat-info-icon",78,100)]{
 let row=frames[key]!,r=row["frame"] as! [String:Int];precondition(row["rotated"] as! Bool == false && r["w"]==w && r["h"]==h)
 let crop=image.cropping(to:CGRect(x:r["x"]!,y:r["y"]!,width:w,height:h))!,url=out.appendingPathComponent(name+".png"),dest=CGImageDestinationCreateWithURL(url as CFURL,"public.png" as CFString,1,nil)!
 CGImageDestinationAddImage(dest,crop,nil);precondition(CGImageDestinationFinalize(dest));let decoded=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!
 precondition(pixels(crop)==pixels(decoded));print("PASS "+key+" decoded native pixels "+String(w)+"x"+String(h))
}
