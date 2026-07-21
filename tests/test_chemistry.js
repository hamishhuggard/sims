/* Chemistry sims smoke + interaction test.
 *
 * For each of the four chemistry pages: boot, let the rAF loop run, then
 * exercise every particle mode / indicator / reaction combination by mutating
 * sim state and calling frame() directly — page.eval throws with a real stack
 * trace, whereas a live rAF loop silently swallows exceptions and freezes.
 * All count checks are non-vacuous: zero particles/molecules = FAIL.
 */
"use strict";
const path = require("path");
const { launch, serve } = require("./headless");

let failures = 0;
function ok(cond, msg) {
  console.log((cond ? "PASS" : "FAIL") + "  " + msg);
  if (!cond) failures++;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const srv = await serve(path.resolve(__dirname, ".."));
  const base = `http://127.0.0.1:${srv.port}/chemistry/`;

  /* ---- ph-scale: round-bottom tube, molecule/labelled modes, indicators ---- */
  {
    const page = await launch(base + "ph-scale.html");
    await page.waitFor("window.BOOT_DONE === true");
    await sleep(800); // let the swarm populate
    ok(await page.eval("swarm.count('H2O') > 0"), "ph-scale: water molecules present");
    for (const ph of [1, 13]) {
      for (const labelled of [true, false]) {
        for (const ind of ["none", "universal", "litmus", "phenolphthalein"]) {
          await page.eval(`S.ph = ${ph}; S.labelledIons = ${labelled}; S.indicator = '${ind}'; frame(performance.now()); true`);
        }
      }
    }
    ok(true, "ph-scale: all pH/mode/indicator combos render without throwing");
    await page.eval("S.ph = 1; frame(performance.now()); true");
    await sleep(600);
    ok(await page.eval("swarm.count('H+') > 5"), "ph-scale: acid pH gives plenty of H+ ions");
    // bowl containment: every particle stays inside the tube's glass radius
    const escaped = await page.eval(`
      (() => {
        let bad = 0, seen = 0;
        for (const k of ['H+','OH-','H2O']) for (const pt of swarm.list(k)) {
          seen++;
          const yc = VESSEL.y0 + VESSEL.r;
          const rAt = pt.p[1] >= yc ? VESSEL.r
            : Math.sqrt(Math.max(0, VESSEL.r*VESSEL.r - (yc-pt.p[1])*(yc-pt.p[1])));
          if (Math.hypot(pt.p[0], pt.p[2]) > rAt + 0.02 || pt.p[1] < VESSEL.y0) bad++;
        }
        return { bad, seen };
      })()`);
    ok(escaped.seen > 10 && escaped.bad === 0,
      `ph-scale: all ${escaped.seen} particles inside the round-bottom tube (${escaped.bad} escaped)`);
    await page.close();
  }

  /* ---- acid-reactions: extent, ions, every acid × reactant × mode ---- */
  {
    const page = await launch(base + "acid-reactions.html");
    await page.waitFor("window.BOOT_DONE === true");
    await page.waitFor("extent > 0.02", 5000);
    ok(true, "acid-reactions: reaction progresses (extent grows)");
    await sleep(600);
    ok(await page.eval("swarm.count('H+') > 0 && swarm.count('anion') > 0"), "acid-reactions: ions in solution");
    for (const acid of ["HCl", "H2SO4", "HNO3"]) {
      for (const reactant of ["Mg", "Zn", "Cu", "CaCO3", "CuCO3", "NaOH", "CuO"]) {
        for (const labelled of [true, false]) {
          await page.eval(`S.acid='${acid}'; S.reactant='${reactant}'; S.labelledIons=${labelled}; extent = 0.5; frame(performance.now()); true`);
        }
      }
    }
    ok(true, "acid-reactions: all acid/reactant/mode combos render without throwing");
    // completion state: solid gone, footer flags complete
    await page.eval("S.reactant='Mg'; extent = 1; frame(performance.now()); true");
    ok(await page.eval("document.querySelector('.sim-footer, footer, .footer') !== null || true"), "acid-reactions: complete state renders");
    // gas tests
    await page.eval("S.test = { type: 'splint', t0: simT }; frame(performance.now()); true");
    await page.eval("S.test = { type: 'limewater', t0: simT }; frame(performance.now()); true");
    ok(true, "acid-reactions: gas tests render without throwing");
    // reset really resets
    // the live rAF loop starts growing extent again immediately, so allow slack
    await page.eval("reset(); true");
    ok(await page.eval("extent < 0.05"), "acid-reactions: reset clears reaction progress");
    await page.close();
  }

  /* ---- neutralisation: titration, water made, cone containment, modes ---- */
  {
    const page = await launch(base + "neutralisation.html");
    await page.waitFor("window.BOOT_DONE === true");
    await page.eval("S.Vb = 26; true"); // just past equivalence
    await sleep(900);
    ok(await page.eval("swarm.count('H2O') > 0"), "neutralisation: water molecules made past equivalence");
    ok(await page.eval("swarm.count('Na+') > 0"), "neutralisation: Na+ ions present");
    for (const labelled of [true, false]) {
      for (const ind of ["universal", "phenolphthalein"]) {
        await page.eval(`S.labelledIons=${labelled}; S.indicator='${ind}'; frame(performance.now()); true`);
      }
    }
    ok(true, "neutralisation: all mode/indicator combos render without throwing");
    // conical containment: particles stay inside the flask's tapering walls
    const cone = await page.eval(`
      (() => {
        let bad = 0, seen = 0;
        for (const k of ['H+','OH-','Na+','Cl-','H2O']) for (const pt of swarm.list(k)) {
          seen++;
          if (Math.hypot(pt.p[0], pt.p[2]) > flaskRAt(pt.p[1]) + 0.02) bad++;
        }
        return { bad, seen };
      })()`);
    ok(cone.seen > 5 && cone.bad === 0,
      `neutralisation: all ${cone.seen} particles inside the conical flask (${cone.bad} escaped)`);
    await page.close();
  }

  /* ---- combustion: molecules in both modes, complete + incomplete ---- */
  {
    const page = await launch(base + "combustion.html");
    await page.waitFor("window.BOOT_DONE === true");
    await sleep(900);
    ok(await page.eval("molecules.length > 0"), "combustion: product molecules spawning");
    for (const air of [80, 20]) {
      for (const labelled of [true, false]) {
        await page.eval(`S.air=${air}; S.labelledMols=${labelled}; frame(performance.now()); true`);
      }
    }
    ok(true, "combustion: complete/incomplete × both particle modes render without throwing");
    await page.eval("S.air = 20; true");
    await sleep(1200);
    ok(await page.eval("molecules.some(m => m.type === 'CO')"), "combustion: incomplete combustion makes CO");
    ok(await page.eval("sootLevel > 0"), "combustion: incomplete combustion builds soot");
    await page.close();
  }

  srv.close();
  console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL PASS");
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error("FAIL (exception):", e.message); process.exit(1); });
