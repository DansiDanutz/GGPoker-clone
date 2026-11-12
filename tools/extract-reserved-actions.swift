import Foundation
import CoreGraphics
import ImageIO
// Starling table/player textures are extracted separately from ATF, not this desktop atlas.
let source=URL(fileURLWithPath:CommandLine.arguments[1]), output=URL(fileURLWithPath:CommandLine.arguments[2])
let image=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(source as CFURL,nil)!,0,nil)!
func pixels(_ image:CGImage)->Data {
 let context=CGContext(data:nil,width:image.width,height:image.height,bitsPerComponent:8,bytesPerRow:image.width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
 context.draw(image,in:CGRect(x:0,y:0,width:image.width,height:image.height))
 return Data(bytes:context.data!,count:image.width*image.height*4)
}
for (name,x,y,w,h) in [("background",2731,3428,40,40),("check",549,924,23,17),("box",3376,2767,26,26),("hover",3376,2795,26,26),("selected",3241,3103,26,26),("aof-fold",1579,2321,128,134),("aof-fold-selected",1709,2321,128,134),("aof-allin",2567,2314,128,134),("aof-allin-selected",1449,2321,128,134),("quick-fold-up",3194,1343,232,152),("quick-fold-over",3428,1343,232,152),("quick-fold-down",1170,1389,232,152),("bet-preset-up",2133,2662,24,60),("bet-preset-over",3270,2663,24,60),("bet-preset-down",4070,3009,24,60),("bet-amount",954,1364,20,55),("bet-active",2492,1481,15,11),("bet-thumb",1454,3160,59,63),("aof-main-allin",378,2279,128,134),("aof-main-allin-down",508,2279,128,134),("aof-main-fold",170,2299,128,134),("aof-main-fold-down",2,2314,128,134)] {
 let crop=image.cropping(to:CGRect(x:x,y:y,width:w,height:h))!
 let url=output.appendingPathComponent("native-reserved-\(name).png")
 let destination=CGImageDestinationCreateWithURL(url as CFURL,"public.png" as CFString,1,nil)!
 CGImageDestinationAddImage(destination,crop,nil)
 precondition(CGImageDestinationFinalize(destination))
 let decoded=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL,nil)!,0,nil)!
 precondition(pixels(crop)==pixels(decoded),"Native sprite pixels changed: \(name)")
}
print("PASS22 desktop action sprites: decoded pixels equal atlas crops")
