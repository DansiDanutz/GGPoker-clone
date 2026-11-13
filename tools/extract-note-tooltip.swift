import Foundation
import CoreGraphics
import ImageIO
let source=URL(fileURLWithPath:CommandLine.arguments[1]),out=URL(fileURLWithPath:CommandLine.arguments[2])
let image=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(source as CFURL,nil)!,0,nil)!
func pixels(_ im:CGImage)->Data{let c=CGContext(data:nil,width:im.width,height:im.height,bitsPerComponent:8,bytesPerRow:im.width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!;c.draw(im,in:CGRect(x:0,y:0,width:im.width,height:im.height));return Data(bytes:c.data!,count:im.width*im.height*4)}
let colors:[UInt32]=[0x00B050,0x269CFF,0x7030AA,0x7AFFE8,0x862C08,0x96FA3E,0xFF0000,0xFF8121,0xFFC7D2,0xFFFF00,0xFFFFFF]
var count=0
for (name,x,y,w,h) in [("bg",3203,3428,40,40),("tab",213,994,24,30),("frame",3778,3391,42,42)]{
 let crop=image.cropping(to:CGRect(x:x,y:y,width:w,height:h))!
 for i in (name=="bg" ? [-1] : Array(0..<colors.count)){
  var data=pixels(crop)
  if i>=0{let color=colors[i],rgb=[Int((color>>16)&255),Int((color>>8)&255),Int(color&255)];data.withUnsafeMutableBytes{(p:UnsafeMutableRawBufferPointer)in for n in stride(from:0,to:p.count,by:4){for c in 0..<3{p[n+c]=UInt8((Int(p[n+c])*rgb[c]+127)/255)}}}}
  let provider=CGDataProvider(data:data as CFData)!,im=CGImage(width:w,height:h,bitsPerComponent:8,bitsPerPixel:32,bytesPerRow:w*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGBitmapInfo(rawValue:CGImageAlphaInfo.premultipliedLast.rawValue),provider:provider,decode:nil,shouldInterpolate:true,intent:.defaultIntent)!
  let url=out.appendingPathComponent("native-note-tooltip-\(name)\(i<0 ? "" : "-\(i)").png"),dest=CGImageDestinationCreateWithURL(url as CFURL,"public.png" as CFString,1,nil)!
  CGImageDestinationAddImage(dest,im,nil);precondition(CGImageDestinationFinalize(dest));let decoded=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!
  precondition(pixels(im)==pixels(decoded),"PNG pixels changed");count+=1
 }
}
print("PASS \(count) native note-tooltip crops/tints:PNG decoded pixel equality;8-bit tint rounding, GPU rounding unverified")
