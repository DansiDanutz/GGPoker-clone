import Foundation
import CoreGraphics
import ImageIO
let root=URL(fileURLWithPath:CommandLine.arguments[1]),out=URL(fileURLWithPath:CommandLine.arguments[2])
func pixels(_ image:CGImage)->Data{let c=CGContext(data:nil,width:image.width,height:image.height,bitsPerComponent:8,bytesPerRow:image.width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!;c.draw(image,in:CGRect(x:0,y:0,width:image.width,height:image.height));return Data(bytes:c.data!,count:image.width*image.height*4)}
for (atlas,key,name,w,h) in [("init_lobby/desktop_assets","table_popup0316","winner",320,112),("init_lobby/desktop_assets","table_popup0315","final",320,112),("init_lobby/desktop_assets","table_popup0480","info",24,24),("init_lobby/desktop_assets","table_popup0481","ribbon",264,31)]{
 let json=try JSONSerialization.jsonObject(with:Data(contentsOf:root.appendingPathComponent(atlas+".json"))) as! [String:Any],frame=(json["frames"] as! [String:[String:Any]])[key]!,r=frame["frame"] as! [String:Int]
 precondition(frame["rotated"] as! Bool == false && r["w"]==w && r["h"]==h)
 let image=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(root.appendingPathComponent(atlas+".png") as CFURL,nil)!,0,nil)!,crop=image.cropping(to:CGRect(x:r["x"]!,y:r["y"]!,width:w,height:h))!,url=out.appendingPathComponent("native-result-"+name+".png"),dest=CGImageDestinationCreateWithURL(url as CFURL,"public.png" as CFString,1,nil)!
 CGImageDestinationAddImage(dest,crop,nil);precondition(CGImageDestinationFinalize(dest));let check=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!
 precondition(pixels(crop)==pixels(check),"Native crop pixels changed");print("PASS "+key+" original pixels and "+String(w)+"x"+String(h))
}
