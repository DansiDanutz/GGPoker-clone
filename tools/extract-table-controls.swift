import Foundation
import CoreGraphics
import ImageIO
let root=URL(fileURLWithPath:CommandLine.arguments[1]),out=URL(fileURLWithPath:CommandLine.arguments[2]),atlas="after_lobby/desktop_table_assets"
let frames=(try JSONSerialization.jsonObject(with:Data(contentsOf:root.appendingPathComponent(atlas+".json"))) as! [String:Any])["frames"] as! [String:[String:Any]]
let image=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(root.appendingPathComponent(atlas+".png") as CFURL,nil)!,0,nil)!
func pixels(_ im:CGImage)->Data{let c=CGContext(data:nil,width:im.width,height:im.height,bitsPerComponent:8,bytesPerRow:im.width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!;c.draw(im,in:CGRect(x:0,y:0,width:im.width,height:im.height));return Data(bytes:c.data!,count:im.width*im.height*4)}
for (key,name,w,h) in [("table_menu0428","native-autofold-control-disabled",132,132),("table_menu0429","native-autofold-control-enabled",132,132),("table_menu0419","native-shuffle-control-enabled",124,124),("table_menu0420","native-shuffle-control-disabled",124,124),("table_menu0426","native-table-social-chat",150,150),("table_menu0424","native-table-social-bg",104,89),("table_menu0427","native-table-social-emoji",136,136),("table_menu0439","native-table-social-helmet",136,136),("table_menu0006","native-table-emoticon-bg",40,40),("table_menu0005","native-table-emoticon-standard",74,72),("table_menu0002","native-table-emoticon-dneg",74,72),("table_menu0380","native-table-emoticon-greg",74,72)]{
 let row=frames[key]!,r=row["frame"] as! [String:Int];precondition(row["rotated"] as! Bool == false && r["w"]==w && r["h"]==h)
 let crop=image.cropping(to:CGRect(x:r["x"]!,y:r["y"]!,width:w,height:h))!,url=out.appendingPathComponent(name+".png"),dest=CGImageDestinationCreateWithURL(url as CFURL,"public.png" as CFString,1,nil)!
 CGImageDestinationAddImage(dest,crop,nil);precondition(CGImageDestinationFinalize(dest));let decoded=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!
 precondition(pixels(crop)==pixels(decoded));print("PASS "+key+" original decoded pixels "+String(w)+"x"+String(h))
}
