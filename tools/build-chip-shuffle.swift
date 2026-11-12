import Foundation
import CoreGraphics
import ImageIO
precondition(CommandLine.arguments.count == 3, "source-frames output.png")
let input=URL(fileURLWithPath:CommandLine.arguments[1]),output=URL(fileURLWithPath:CommandLine.arguments[2]),w=145,h=165,columns=16,rows=16
let space=CGColorSpace(name:CGColorSpace.sRGB)!
func pixels(_ image:CGImage)->Data {
 let ctx=CGContext(data:nil,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:space,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
 ctx.draw(image,in:CGRect(x:0,y:0,width:w,height:h));return Data(bytes:ctx.data!,count:w*h*4)
}
let ctx=CGContext(data:nil,width:w*columns,height:h*rows,bitsPerComponent:8,bytesPerRow:w*columns*4,space:space,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
var images=[CGImage]()
for index in 0..<245 {
 let image=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(input.appendingPathComponent("\(index+1).png") as CFURL,nil)!,0,nil)!
 precondition(image.width==w && image.height==h);images.append(image)
 ctx.draw(image,in:CGRect(x:index%columns*w,y:(rows-1-index/columns)*h,width:w,height:h))
}
let atlas=ctx.makeImage()!
for (index,image) in images.enumerated() {
 let crop=atlas.cropping(to:CGRect(x:index%columns*w,y:index/columns*h,width:w,height:h))!
 precondition(pixels(crop)==pixels(image),"Native frame pixels changed at \(index+1)")
}
let bytes=CFDataCreateMutable(nil,0)!,destination=CGImageDestinationCreateWithData(bytes,"public.png" as CFString,1,nil)!
CGImageDestinationAddImage(destination,atlas,nil);precondition(CGImageDestinationFinalize(destination))
try! (bytes as Data).write(to:output,options:.atomic)
print("PASS245 native Chip frames:145×165; every atlas cell pixel-equal to source")
