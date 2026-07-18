const path = require("path");
const { launch, serve } = require("./headless");

(async () => {
  const srv = await serve(path.resolve(__dirname, ".."));
  const page = await launch(`http://127.0.0.1:${srv.port}/genetics/natural-selection.html`);
  await page.waitFor("window.BOOT_DONE === true");

  const n0 = await page.eval("POP.length");
  if (n0 !== 46) { console.error("FAIL: expected 46 bugs, got", n0); process.exit(1); }

  // strong selection against the current colours → continuous predation
  await page.eval("S.background = 0; S.selection = 3;");

  // the page's own rAF loop drives the ecosystem in real time
  await page.waitFor("eaten >= 3", 8000);

  const eaten = await page.eval("eaten");
  const pop = await page.eval("POP.filter(b=>!b.dead).length");
  const birdsSpawned = await page.eval("eaten + birds.length"); // proxy: at least some hunts happened
  if (eaten < 3) { console.error("FAIL: expected ongoing predation, ate", eaten); process.exit(1); }
  // birth-on-death keeps the population roughly constant (never collapses, never runs away)
  if (pop < 40 || pop > 46) { console.error("FAIL: population not conserved, got", pop); process.exit(1); }

  // no uncaught exception has frozen the rAF loop: eaten keeps climbing
  const e1 = await page.eval("eaten");
  await page.waitFor(`eaten > ${e1}`, 5000);

  console.log(`PASS: seeded ${n0}, ate ${eaten}+ (still climbing), population held at ${pop}`);
  await page.close(); srv.close();
})().catch(e => { console.error("ERROR", e); process.exit(1); });
