// Rooktest: opent elke pagina in Chromium (mobiel + desktop) en meldt JavaScript-fouten.
// Gebruik: start eerst `npm run build && npm start`, dan `npm run test:e2e` (BASE_URL optioneel).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.SHOT_DIR;
const PAGES = ["/", "/instaptoets", "/lessen", "/lessen/1", "/lessen/9", "/lessen/27", "/lezen", "/schrijven", "/luisteren", "/spreken", "/grammatica", "/woorden", "/docent", "/planner", "/instellingen"];

const browser = await chromium.launch();
let failures = 0;
for (const [name, viewport] of [["mobiel", { width: 390, height: 844 }], ["desktop", { width: 1366, height: 900 }]]) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !/favicon|Failed to load resource/.test(m.text()) && errors.push(m.text()));
  for (const p of PAGES) {
    errors.length = 0;
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    const ok = errors.length === 0 && !overflow;
    if (!ok) failures++;
    console.log(`${ok ? "OK  " : "FOUT"} [${name}] ${p}${overflow ? " (horizontale scroll)" : ""}${errors.length ? " " + errors.join(" | ") : ""}`);
    if (OUT) await page.screenshot({ path: `${OUT}/${name}${p.replace(/\//g, "_") || "_home"}.png`, fullPage: false });
  }
  await ctx.close();
}
await browser.close();
process.exit(failures ? 1 : 0);
