import Foundation
import CoreGraphics
import ImageIO
let source=URL(fileURLWithPath:CommandLine.arguments[1]), output=URL(fileURLWithPath:CommandLine.arguments[2])
let image=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(source as CFURL,nil)!,0,nil)!
for (name,x,y,w,h) in [("felt",3740,331,323,262),("open",520,2542,148,94),("open-down",2198,2547,148,94)] {
 let crop=image.cropping(to:CGRect(x:x,y:y,width:w,height:h))!
 let destination=CGImageDestinationCreateWithURL(output.appendingPathComponent("native-squeeze-\(name).png") as CFURL,"public.png" as CFString,1,nil)!
 CGImageDestinationAddImage(destination,crop,nil)
 precondition(CGImageDestinationFinalize(destination))
}
