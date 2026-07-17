# Headless browser tests for the sims

Real-browser tests **with zero npm dependencies** — this repo has no
package.json / node_modules, and that includes tests.

## How it works

`tests/headless.js` spawns a **chrome-headless-shell** binary and speaks raw
Chrome DevTools Protocol over **Node ≥ 22's built-in `WebSocket`**. No
puppeteer, no playwright, no installs.

- **Working Chrome binaries** (found in this order):
  1. `$CHROME_BIN` if set
  2. `~/.cache/puppeteer/chrome-headless-shell/mac-*/…/chrome-headless-shell`
     (left behind by an old puppeteer install — verified working)
  3. `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless`
- `page.screenshot(file)` uses `Page.captureScreenshot`, which renders
  in-process and needs no display — works fine in a background job with no
  screen attached.

## Writing a test

```js
const path = require("path");
const { launch, serve } = require("./headless");
(async () => {
  const srv  = await serve(path.resolve(__dirname, ".."));
  const page = await launch(`http://127.0.0.1:${srv.port}/electromagnetism/charge-in-field.html`);
  await page.waitFor("window.BOOT_DONE === true");
  const v = await page.eval("someReadoutVar");   // any expression; promises awaited
  await page.close(); srv.close();
})();
```

`page.eval(expr)` → JSON value (throws on page exception, with the real stack
trace — useful since a thrown exception inside a sim's `frame()` silently
kills the `requestAnimationFrame` loop and a live page just looks frozen).
`page.waitFor(expr, ms)` → polls until truthy.
`page.screenshot(file)` → PNG of the viewport, no display required.

Run: `node tests/test_*.js` (each file is standalone, exits non-zero on FAIL).

## Gotchas

1. **Wait for `window.BOOT_DONE`, not just page load.** Every sim sets this
   as the last line of its script, right before starting the animation loop.
2. **Serve over HTTP, never `file://`.**
3. **Guard against vacuous passes.** Count what you scanned/rendered and FAIL
   on zero — never let a test pass because the thing under test wasn't on
   the page at all.
</content>
