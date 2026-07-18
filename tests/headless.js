/* Minimal headless-Chrome harness for the viewer app — NO npm dependencies.
 *
 * Uses the chrome-headless-shell binary from puppeteer's cache plus Node 22's
 * built-in WebSocket to speak Chrome DevTools Protocol directly. This keeps the
 * repo free of package.json / node_modules (see ARCHITECTURE.md: no build step).
 *
 * Usage from a test script:
 *   const { launch } = require("./headless");
 *   const page = await launch("http://localhost:8123/");
 *   const title = await page.eval("document.title");
 *   await page.close();
 *
 * page.eval(expr) — runs expr in the page, awaits promises, returns JSON value.
 * See tests/README.md for the full recipe (server, waiting for async CSV load…).
 */
"use strict";
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

function findChrome(){
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  const cache = path.join(os.homedir(), ".cache/puppeteer/chrome-headless-shell");
  if (fs.existsSync(cache)){
    const versions = fs.readdirSync(cache).filter(d => d.startsWith("mac-")).sort();
    for (const v of versions.reverse()){
      const bin = path.join(cache, v, "chrome-headless-shell-mac-x64/chrome-headless-shell");
      if (fs.existsSync(bin)) return bin;
    }
  }
  const app = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (fs.existsSync(app)) return app;
  throw new Error("No Chrome found. Set CHROME_BIN or install puppeteer's chrome-headless-shell.");
}

async function launch(url, { width = 1280, height = 800 } = {}){
  const bin = findChrome();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-profile-"));
  const proc = spawn(bin, [
    "--headless", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--disable-gpu",
    `--window-size=${width},${height}`, "about:blank"
  ], { stdio: ["ignore", "ignore", "pipe"] });

  // Chrome prints "DevTools listening on ws://..." to stderr once ready
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = "";
    const t = setTimeout(() => reject(new Error("Chrome didn't start in 15s:\n" + buf)), 15000);
    proc.stderr.on("data", d => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m){ clearTimeout(t); resolve(m[1]); }
    });
    proc.on("exit", c => { clearTimeout(t); reject(new Error("Chrome exited early (" + c + "):\n" + buf)); });
  });

  const ws = new WebSocket(wsUrl);   // Node >= 22 global
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = e => rej(new Error("ws error: " + e.message)); });

  let msgId = 0;
  const pending = new Map();
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)){
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });

  const { targetId } = await send("Target.createTarget", { url });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Runtime.enable", {}, sessionId);

  async function evalIn(expression){
    const r = await send("Runtime.evaluate",
      { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails){
      const ed = r.exceptionDetails;
      throw new Error("page threw: " + (ed.exception && (ed.exception.description || ed.exception.value) || ed.text));
    }
    return r.result.value;
  }

  return {
    eval: evalIn,
    /* navigate the same tab/profile to a new URL (e.g. to check localStorage
       persistence across pages) — unlike a fresh launch(), this keeps the
       same browser profile/origin storage. */
    async navigate(url){
      await send("Page.enable", {}, sessionId);
      await send("Page.navigate", { url }, sessionId);
    },
    /* render the page to a PNG in-process (no display needed — works headless) */
    async screenshot(file){
      await send("Page.enable", {}, sessionId);
      const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
      fs.writeFileSync(file, Buffer.from(data, "base64"));
      return file;
    },
    /* poll an expression until truthy (default 10s) — for async boot (CSV fetch etc.) */
    async waitFor(expression, timeoutMs = 10000){
      const t0 = Date.now();
      for (;;){
        const v = await evalIn(expression);
        if (v) return v;
        if (Date.now() - t0 > timeoutMs) throw new Error("waitFor timed out: " + expression);
        await new Promise(r => setTimeout(r, 100));
      }
    },
    async close(){
      try { ws.close(); } catch {}
      proc.kill();
      try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
    }
  };
}

/* Start a static file server for `dir`; returns { port, close } */
function serve(dir, port = 0){
  const http = require("http");
  const mime = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".csv":"text/csv", ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png" };
  const srv = http.createServer((req, res) => {
    const p = path.join(dir, decodeURIComponent(new URL(req.url, "http://x").pathname));
    const file = fs.existsSync(p) && fs.statSync(p).isDirectory() ? path.join(p, "index.html") : p;
    fs.readFile(file, (err, data) => {
      if (err){ res.writeHead(404); res.end("not found"); return; }
      res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise(resolve => srv.listen(port, "127.0.0.1", () =>
    resolve({ port: srv.address().port, close: () => srv.close() })));
}

module.exports = { launch, serve, findChrome };
