// Optional exact bundle ID selects an owned test app. Counts audio only; saves no samples.
import Foundation
import ScreenCaptureKit
import CoreMedia
import AppKit

final class Meter: NSObject, SCStreamOutput {
    var frames = 0, peak: Float = 0
    func stream(_ stream: SCStream, didOutputSampleBuffer buffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .audio, let block = CMSampleBufferGetDataBuffer(buffer),
              let format = CMSampleBufferGetFormatDescription(buffer),
              let asbd = CMAudioFormatDescriptionGetStreamBasicDescription(format)?.pointee,
              asbd.mFormatID == kAudioFormatLinearPCM, asbd.mBitsPerChannel == 32,
              asbd.mFormatFlags & kAudioFormatFlagIsFloat != 0 else { return }
        let length = CMBlockBufferGetDataLength(block)
        var samples = [Float](repeating: 0, count: length / 4)
        guard length > 0, length % 4 == 0, samples.withUnsafeMutableBytes({CMBlockBufferCopyDataBytes(block, atOffset: 0, dataLength: length, destination: $0.baseAddress!)}) == noErr else {return}
        frames += CMSampleBufferGetNumSamples(buffer)
        for sample in samples {peak = max(peak,abs(sample))}
    }
}
let content = try await SCShareableContent.excludingDesktopWindows(true,onScreenWindowsOnly:true)
let target = CommandLine.arguments.dropFirst().first
guard let app = content.applications.first(where:{ candidate in
    guard let running = NSRunningApplication(processIdentifier:candidate.processID) else { return false }
    if let target { return running.bundleIdentifier == target }
    return running.executableURL?.path.hasSuffix("/Loader/GGPoker.app/Contents/MacOS/GGnet") == true
}), let display=content.displays.first else {fatalError("Selected application or display unavailable")}
let filter=SCContentFilter(display:display,including:[app],exceptingWindows:[])
let cfg=SCStreamConfiguration()
cfg.capturesAudio=true
cfg.width=2;cfg.height=2
cfg.minimumFrameInterval=CMTime(value:1,timescale:1)
let stream=SCStream(filter:filter,configuration:cfg,delegate:nil)
let meter=Meter(), queue=DispatchQueue(label:"native.audio.probe")
try stream.addStreamOutput(meter,type:.audio,sampleHandlerQueue:queue)
try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
    stream.startCapture { error in if let error {continuation.resume(throwing:error)} else {continuation.resume()} }
}
try await Task.sleep(for:.seconds(5))
try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
    stream.stopCapture { error in if let error {continuation.resume(throwing:error)} else {continuation.resume()} }
}
queue.sync {print("Selected app audio: frames=\(meter.frames) peak=\(meter.peak)")}
