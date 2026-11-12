import AppKit
import WebKit
import Darwin

final class NativeCheck {
    let controller: PokerApp
    let stage: String, directory: URL
    let deadline = Date().addingTimeInterval(100)
    var captured = Set<String>()
    var phase = "login"
    var timer: Timer?
    var busy = false, submitted = false, finished = false
    var sawChatWindow = false

    init(_ controller: PokerApp, stage: String, directory: URL) {
        self.controller = controller; self.stage = stage; self.directory = directory
    }

    func fail(_ message: String) -> Never { fputs("FAIL native wrapper: \(message)\n", stderr); exit(1) }

    func tick() {
        if let child = controller.auxiliaryWindows.first?.contentView as? WKWebView {
            sawChatWindow = true
            if child.url?.query == "panel=settings", !busy, !captured.contains("settings") {
                busy = true
                child.evaluateJavaScript("document.querySelector('#shufflePreview')?.dataset.frame === '52'") { value, _ in
                    self.busy = false
                    if value as? Bool == true { self.capture("settings", view: child) }
                    else if let web = self.controller.web { self.handTick(web) }
                }
                return
            }
            if !busy && !captured.contains("chat") {
                busy = true
                child.evaluateJavaScript("!!document.querySelector('#chatForm')?.onsubmit && !document.querySelector('#chatForm').hidden && !document.querySelector('#chatText').disabled") { value, _ in
                    self.busy = false
                    if value as? Bool == true { self.capture("chat", view: child) }
                }
                return
            }
        }
        if finished || busy { return }
        if Date() > deadline { fail("UI readiness timed out") }
        guard let web = controller.web else { return }
        if phase != "login" { handTick(web); return }; busy = true
        web.evaluateJavaScript("JSON.stringify({player:document.querySelector('#profile')?.textContent||'',form:!!document.querySelector('form')?.onsubmit})") { value, error in
            self.busy = false
            guard error == nil, let text = value as? String, let body = text.data(using: .utf8), let state = try? JSONSerialization.jsonObject(with: body) as? [String: Any] else { return }
            if self.stage == "first", state["form"] as? Bool == true, !self.captured.contains("login") { self.capture("login"); return }
            if state["player"] as? String == "NativeWrapperQA" {
                if self.stage == "first" {
                    if let process = self.controller.backend { try! String(process.processIdentifier).write(to: self.directory.appendingPathComponent("backend.pid"), atomically: true, encoding: .utf8) }
                    self.phase = "owner"; web.load(URLRequest(url: self.controller.root.appendingPathComponent("lobby.html")))
                } else {
                    self.phase = "recover"; let saved = try! String(contentsOf: self.directory.appendingPathComponent("table-url"), encoding: .utf8); web.load(URLRequest(url: URL(string: saved)!))
                }; return
            }
            if state["form"] as? Bool == true && !self.submitted {
                if self.stage == "second" { self.fail("cold relaunch did not retain the cookie") }
                self.submitted = true
                web.evaluateJavaScript("const f=document.querySelector('form');f.nickname.value='NativeWrapperQA';f.pin.value='654321';f.requestSubmit(f.querySelector('[value=create]'))") { _, error in
                    if let error = error { self.fail(error.localizedDescription) }
                }
            }
        }
    }

    func capture(_ name: String, view: WKWebView? = nil) {
        busy = true; captured.insert(name)
        let snapshot = { (view ?? self.controller.web!).takeSnapshot(with: nil) { image, error in
            defer { self.busy = false }
            guard let image = image, error == nil, let tiff = image.tiffRepresentation,
                  let bitmap = NSBitmapImageRep(data: tiff), let png = bitmap.representation(using: .png, properties: [:]) else { self.fail("Could not capture " + name) }
            try! png.write(to: self.controller.project.appendingPathComponent("home-art/webkit-journey-" + name + ".png"))
        } }
        if name == "showdown" { DispatchQueue.main.asyncAfter(deadline: .now() + 3, execute: snapshot) } else { snapshot() }
    }

    func handTick(_ web: WKWebView) {
        if phase == "list", web.url?.path == "/network.html" { phase = "hand" }
        if stage == "first", phase == "hand", !FileManager.default.fileExists(atPath: directory.appendingPathComponent("audio-ready").path) { try! "ready".write(to: directory.appendingPathComponent("audio-ready"), atomically: true, encoding: .utf8) }
        let path = web.url?.path ?? ""
        let ready = (phase == "owner" && path == "/lobby.html") || (["lobby", "list"].contains(phase) && path == "/playgg.html") || (phase == "hand" && path == "/network.html")
        if stage == "first", ready, !captured.contains(phase) { capture(phase); return }
        busy = true
        let key = (try? String(contentsOf: directory.appendingPathComponent("data/owner.key"), encoding: .utf8))?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let values = try! JSONSerialization.data(withJSONObject: [phase, key])
        let script = try! String(contentsOf: controller.project.appendingPathComponent("tools/native-hand-step.js"), encoding: .utf8)
        let setup = "window.nativePhase=" + String(data: values, encoding: .utf8)! + ";window.nativeKey=nativePhase[1];window.nativePhase=nativePhase[0];"
        web.evaluateJavaScript(setup + script + ";JSON.stringify(window.nativeResult||{})") { value, error in
            self.busy = false
            if let error = error { if error.localizedDescription.contains("navigation") { return }; self.fail(error.localizedDescription) }
            guard let text = value as? String, let data = text.data(using: .utf8), let result = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }
            if let error = result["error"] as? String { self.fail(error) }
            guard let next = result["next"] as? String else { return }
            web.evaluateJavaScript("delete window.nativeResult", completionHandler: nil)
            if !self.captured.contains("showdown"), let starts = result["audioStarts"] as? Int { print("Native decoded audio sources started: \(starts)"); fflush(stdout) }
            if var signal = result["audioSignal"] as? [String: Any] {
                signal["observedAt"] = ISO8601DateFormatter().string(from: Date())
                signal["scope"] = "Isolated native WKWebView: decoded buffers and transparent gain-to-destination analyser"
                signal["limitation"] = "Graph signal does not prove physical speaker output or native reference timing"
                let data = try! JSONSerialization.data(withJSONObject: signal, options: [.prettyPrinted, .sortedKeys])
                try! data.write(to: self.controller.project.appendingPathComponent("home-art/rea/local-webkit-audio-signal.json"))
                if !self.captured.contains("showdown") { print("Native WebKit nonzero signal: \(signal)"); fflush(stdout) }
            }
            if next == "lobby" { self.phase = "lobby"; web.load(URLRequest(url: self.controller.root.appendingPathComponent("playgg.html"))) }
            else if next == "list" { self.phase = "list" }
            else if next == "settled" || next == "recovered" {
                let record = try! JSONSerialization.data(withJSONObject: result["state"]!)
                try! record.write(to: self.directory.appendingPathComponent(self.stage + "-hand.json"))
                if let url = result["url"] as? String { try! url.write(to: self.directory.appendingPathComponent("table-url"), atomically: true, encoding: .utf8) }
                if self.stage == "first", !self.captured.contains("showdown") { web.evaluateJavaScript("window.nativeResult=" + text, completionHandler: nil); self.capture("showdown"); return }
                self.verify()
            }
            if self.phase == "list", web.url?.path == "/network.html" { self.phase = "hand" }
        }
    }

    func verify() {
        finished = true; timer?.invalidate()
        guard controller.windowButtons.count == 3, abs(controller.web.bounds.width - 1200) < 1, abs(controller.web.bounds.height - 961) < 1 else { fail("native controls or viewport differ") }
        if stage == "first" {
            guard sawChatWindow, controller.auxiliaryWindows.isEmpty else { fail("detached chat window was not opened and closed") }
            guard let process = controller.backend, process.isRunning else { fail("first launch did not start the isolated backend") }
            try! String(process.processIdentifier).write(to: directory.appendingPathComponent("backend.pid"), atomically: true, encoding: .utf8)
        } else if controller.backend != nil { fail("relaunch spawned a duplicate backend") }
        controller.web.configuration.websiteDataStore.httpCookieStore.getAllCookies { cookies in
            DispatchQueue.main.async {
                guard let cookie = cookies.first(where: { $0.name == "localplayer" }), cookie.isHTTPOnly, let expiry = cookie.expiresDate, expiry > Date() else { self.fail("persistent HttpOnly cookie missing") }
                let stored = try! String(contentsOf: self.directory.appendingPathComponent("data/local-players.json"), encoding: .utf8)
                if stored.contains(cookie.value) { self.fail("raw cookie was stored in the backend") }
                print("PASS native \(self.stage): actual WKWebView login, persistent cookie, 1200×961 viewport, three native controls and backend reuse policy"); fflush(stdout)
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) { NSApp.terminate(nil) }
            }
        }
    }
}

@main enum NativeTest {
    static func main() {
        let args = CommandLine.arguments
        guard args.count == 6, let root = URL(string: args[2]) else { exit(2) }
        let directory = URL(fileURLWithPath: args[1]), app = NSApplication.shared
        let controller = PokerApp(root: root, project: URL(fileURLWithPath: args[3]), node: URL(fileURLWithPath: args[4]), data: directory.appendingPathComponent("data"), visible: true)
        let check = NativeCheck(controller, stage: args[5], directory: directory)
        app.setActivationPolicy(.accessory); app.delegate = controller
        check.timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in check.tick() }
        withExtendedLifetime((controller, check)) { app.run() }
    }
}
