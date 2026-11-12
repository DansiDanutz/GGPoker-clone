import AppKit
import WebKit

final class PokerWindow: NSWindow {
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { true }
}

final class PokerDragBar: NSView {
    override func mouseDown(with event: NSEvent) { window?.performDrag(with: event) }
}

final class PokerApp: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKScriptMessageHandler, WKUIDelegate, NSWindowDelegate {
    let root: URL, project: URL, node: URL, data: URL
    let visible: Bool
    var window: NSWindow!
    var web: WKWebView!
    var backend: Process?
    var windowButtons: [NSButton] = []
    var auxiliaryWindows: [NSWindow] = []
    private var starting = false

    init(root: URL, project: URL, node: URL, data: URL, visible: Bool = true) {
        self.root = root; self.project = project; self.node = node; self.data = data; self.visible = visible
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = true
        configuration.userContentController.add(self, name: "retry")
        configuration.userContentController.addUserScript(WKUserScript(source:
            "for(const id of ['close','min','zoom']){const e=document.getElementById(id);if(e)e.style.visibility='hidden'}",
            injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        web = WKWebView(frame: .zero, configuration: configuration)
        web.navigationDelegate = self; web.uiDelegate = self; web.underPageBackgroundColor = NSColor(calibratedWhite: 0.125, alpha: 1)
        window = PokerWindow(contentRect: NSRect(x: 0, y: 0, width: 1200, height: 961),
            styleMask: [.borderless, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "PLAYGG Local"; window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true; window.backgroundColor = NSColor(calibratedWhite: 0.08, alpha: 1)
        window.minSize = NSSize(width: 850, height: 615)
        window.contentView = web; window.delegate = self; window.center()
        let drag = PokerDragBar(frame: NSRect(x: 80, y: web.bounds.height - 40, width: web.bounds.width - 380, height: 40))
        drag.autoresizingMask = [.width, .minYMargin]; web.addSubview(drag)
        for (index, kind) in [NSWindow.ButtonType.closeButton, .miniaturizeButton, .zoomButton].enumerated() {
            if let button = NSWindow.standardWindowButton(kind, for: [.titled, .closable, .miniaturizable, .resizable]) {
                button.target = window
                button.action = [#selector(NSWindow.performClose(_:)), #selector(NSWindow.performMiniaturize(_:)), #selector(NSWindow.performZoom(_:))][index]
                button.setFrameOrigin(NSPoint(x: CGFloat(24 + index * 20) - button.frame.width / 2, y: web.bounds.height - 20 - button.frame.height / 2))
                button.autoresizingMask = [.minYMargin]; web.addSubview(button); windowButtons.append(button)
            }
        }
        makeMenus()
        if visible { window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true) }
        start()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }

    private func makeMenus() {
        let menu = NSMenu(), appItem = NSMenuItem(), viewItem = NSMenuItem()
        menu.addItem(appItem); menu.addItem(viewItem)
        let appMenu = NSMenu(title: "PLAYGG Local")
        appMenu.addItem(withTitle: "Quit PLAYGG Local", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = appMenu
        let view = NSMenu(title: "View")
        let reload = view.addItem(withTitle: "Reload", action: #selector(reloadPage(_:)), keyEquivalent: "r")
        reload.target = self; viewItem.submenu = view; NSApp.mainMenu = menu
    }

    @objc private func reloadPage(_ sender: Any?) { if starting { return }; start() }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "retry" { start() }
    }

    private func status(_ failed: Bool = false) {
        let message = failed ? "Local poker could not start." : "Starting local poker…"
        let button = failed ? "<button onclick=\"window.webkit.messageHandlers.retry.postMessage(null)\">Retry</button>" : ""
        web.loadHTMLString("<meta name='color-scheme' content='dark'><style>body{background:#141417;color:#eee;font:18px system-ui;display:grid;place-content:center;height:90vh;text-align:center}button{padding:10px 25px;background:#8d232c;border:0;border-radius:5px;color:white;font:inherit}</style><p>\(message)</p>\(button)", baseURL: nil)
    }

    private func probe(_ completion: @escaping (Bool) -> Void) {
        var request = URLRequest(url: root.appendingPathComponent("api/hosted"), cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 1)
        request.httpMethod = "GET"
        URLSession.shared.dataTask(with: request) { body, response, _ in
            let rows = body.flatMap { try? JSONSerialization.jsonObject(with: $0) as? [[String: Any]] }
            let healthy = (response as? HTTPURLResponse)?.statusCode == 200 && rows != nil && rows!.allSatisfy { $0["room"] is String && $0["id"] is String }
            DispatchQueue.main.async { completion(healthy) }
        }.resume()
    }

    func start() {
        guard !starting else { return }; starting = true; status()
        probe { healthy in
            if healthy { self.ready(); return }
            if self.backend?.isRunning != true {
                let process = Process(); process.executableURL = self.node
                process.arguments = [self.project.appendingPathComponent("server.mjs").path]
                process.currentDirectoryURL = self.project
                var environment = ProcessInfo.processInfo.environment
                let port = self.root.port ?? 18770
                environment["PORT"] = String(port); environment["POKER_REFERENCE_HOME"] = "1"
                environment["POKER_BIND_HOST"] = "127.0.0.1"; environment["POKER_PUBLIC_ORIGIN"] = "http://127.0.0.1:\(port)"
                environment["POKER_DATA_DIR"] = self.data.path; process.environment = environment
                process.standardInput = FileHandle.nullDevice; process.standardOutput = FileHandle.nullDevice; process.standardError = FileHandle.nullDevice
                do { try process.run(); self.backend = process } catch { self.starting = false; self.status(true); return }
            }
            self.waitForBackend(20)
        }
    }

    private func waitForBackend(_ remaining: Int) {
        probe { healthy in
            if healthy { self.ready() }
            else if remaining > 0 { DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { self.waitForBackend(remaining - 1) } }
            else { self.starting = false; self.status(true) }
        }
    }

    private func ready() { starting = false; web.load(URLRequest(url: root)) }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        guard webView === web, let url = navigationAction.request.url,
              url.scheme == root.scheme, url.host == root.host, url.port == root.port,
              let panelType = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems?.first(where: { $0.name == "panel" })?.value,
              (url.path == "/network.html" && panelType == "chat") || (url.path == "/playgg.html" && panelType == "settings") else { return nil }
        let settings = panelType == "settings"
        let child = WKWebView(frame: .zero, configuration: configuration)
        child.navigationDelegate = self; child.uiDelegate = self; child.underPageBackgroundColor = NSColor(calibratedWhite: 0.125, alpha: 1)
        let panel = NSWindow(contentRect: NSRect(x: 0, y: 0, width: settings ? 1200 : 300, height: settings ? 957 : 736), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        panel.title = settings ? "Game Settings" : "Table chat"; panel.appearance = NSAppearance(named: .darkAqua); panel.contentView = child; panel.delegate = self
        panel.isReleasedWhenClosed = false; panel.minSize = NSSize(width: settings ? 800 : 300, height: settings ? 650 : 400)
        panel.center(); auxiliaryWindows.append(panel)
        if visible { panel.makeKeyAndOrderFront(nil) }
        return child
    }

    func webViewDidClose(_ webView: WKWebView) { auxiliaryWindows.first(where: { $0.contentView === webView })?.close() }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        auxiliaryWindows.first(where: { $0.contentView === webView })?.title = webView.title ?? "Table chat"
    }

    func windowWillClose(_ notification: Notification) {
        if (notification.object as? NSWindow) === window { for panel in auxiliaryWindows { panel.close() } }
        else { auxiliaryWindows.removeAll(where: { $0 === (notification.object as? NSWindow) }) }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        let local = url.scheme == root.scheme && url.host == root.host && url.port == root.port
        decisionHandler(local || url.absoluteString == "about:blank" ? .allow : .cancel)
    }
}

#if !PLAYGG_QA
@main enum Main {
    static func main() {
        let info = Bundle.main.infoDictionary!
        guard let address = info["PokerURL"] as? String, let root = URL(string: address), root.scheme == "http", root.host == "127.0.0.1",
              let project = info["PokerProject"] as? String, let node = info["PokerNode"] as? String, let data = info["PokerData"] as? String else { fatalError("Invalid local poker configuration") }
        let app = NSApplication.shared
        let controller = PokerApp(root: root, project: URL(fileURLWithPath: project), node: URL(fileURLWithPath: node), data: URL(fileURLWithPath: data))
        app.setActivationPolicy(.regular); app.delegate = controller
        withExtendedLifetime(controller) { app.run() }
    }
}
#endif
