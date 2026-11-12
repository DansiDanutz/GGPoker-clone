import Foundation
import CoreGraphics
import ImageIO
// Reuse the shipped glyphs and the existing local deck layout; no font substitution.
precondition(CommandLine.arguments.count == 4, "atlas.png card.json output.png")
let atlas=CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(URL(fileURLWithPath:CommandLine.arguments[1]) as CFURL,nil)!,0,nil)!
let metadata=try! JSONSerialization.jsonObject(with:Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[2]))) as! [String:Any]
let frames=metadata["frames"] as! [String:[String:Any]]
func frame(_ index:Int)->CGImage { let key=String(format:"card%04d",index),r=frames[key]!["frame"] as! [String:Int];return atlas.cropping(to:CGRect(x:r["x"]!,y:r["y"]!,width:r["w"]!,height:r["h"]!))! }
let base=frame(0),space=CGColorSpace(name:CGColorSpace.sRGB)!
var pixels=[UInt8](repeating:0,count:base.width*base.height*4)
pixels.withUnsafeMutableBytes { raw in CGContext(data:raw.baseAddress,width:base.width,height:base.height,bitsPerComponent:8,bytesPerRow:base.width*4,space:space,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!.draw(base,in:CGRect(x:0,y:0,width:base.width,height:base.height)) }
var minX=base.width,minY=base.height,maxX=0,maxY=0
for y in 0..<base.height { for x in 0..<base.width where pixels[(y*base.width+x)*4+3]>0 { minX=min(minX,x);minY=min(minY,y);maxX=max(maxX,x);maxY=max(maxY,y) } }
let cleanBase=base.cropping(to:CGRect(x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1))!
let width=124*13,height=174*4,context=CGContext(data:nil,width:width,height:height,bitsPerComponent:8,bytesPerRow:width*4,space:space,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
context.interpolationQuality = .high
let colours:[[CGFloat]]=[[29/255.0,139/255.0,36/255.0,1],[3/255.0,32/255.0,208/255.0,1],[190/255.0,25/255.0,30/255.0,1],[20/255.0,20/255.0,20/255.0,1]]
for row in 0..<4 { for col in 0..<13 { let left=col*124,bottom=height-(row+1)*174;context.draw(cleanBase,in:CGRect(x:left,y:bottom,width:124,height:174));for (index,x,y,bw,bh) in [(6+col,13,11,49,45),(2+row,13,59,25,25),(2+row,46,83,70,66)] { let glyph=frame(index),scale=min(CGFloat(bw)/CGFloat(glyph.width),CGFloat(bh)/CGFloat(glyph.height)),w=(CGFloat(glyph.width)*scale).rounded(),h=(CGFloat(glyph.height)*scale).rounded(),rect=CGRect(x:CGFloat(left+x),y:CGFloat(bottom+174-y)-h,width:w,height:h);context.saveGState();context.clip(to:rect,mask:glyph);context.setFillColor(CGColor(colorSpace:space,components:colours[row])!);context.fill(rect);context.restoreGState() } } }
let result=context.makeImage()!;precondition(result.width==1612 && result.height==696)
var distinct=Set<Data>()
for row in 0..<4 { for col in 0..<13 { let tile=result.cropping(to:CGRect(x:col*124,y:row*174,width:124,height:174))!;var bytes=[UInt8](repeating:0,count:124*174*4);bytes.withUnsafeMutableBytes { raw in CGContext(data:raw.baseAddress,width:124,height:174,bitsPerComponent:8,bytesPerRow:124*4,space:space,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!.draw(tile,in:CGRect(x:0,y:0,width:124,height:174)) };distinct.insert(Data(bytes));let expected=colours[row].prefix(3).map{Int(($0*255).rounded())};var matches=0;for i in stride(from:0,to:bytes.count,by:4) where bytes[i+3]==255 { if Int(bytes[i])==expected[0] && Int(bytes[i+1])==expected[1] && Int(bytes[i+2])==expected[2] { matches += 1 } };precondition(matches>100,"Missing expected suit colour") } };precondition(distinct.count==52,"Repeated or missing face cells")
let encoded=CFDataCreateMutable(kCFAllocatorDefault,0)!,destination=CGImageDestinationCreateWithData(encoded,"public.png" as CFString,1,nil)!
CGImageDestinationAddImage(destination,result,nil);precondition(CGImageDestinationFinalize(destination));try! Data(bytes:CFDataGetBytePtr(encoded),count:CFDataGetLength(encoded)).write(to:URL(fileURLWithPath:CommandLine.arguments[3]),options:.atomic);print("PASS four-colour deck: 52 original-glyph faces, 1612×696, clubs green/diamonds blue")
