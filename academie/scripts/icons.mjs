// Genereert PNG-iconen uit public/icon.svg met de vooraf geïnstalleerde Chromium.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { readFileSync } from "node:fs";

const svg = readFileSync(new URL("../public/icon.svg", import.meta.url), "utf8");
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [size, name, pad] of [[192, "icon-192.png", 0], [512, "icon-512.png", 0], [180, "apple-touch-icon.png", 0], [512, "icon-maskable-512.png", 0.12]]) {
  await page.setViewportSize({ width: size, height: size });
  const inner = Math.round(size * (1 - pad * 2));
  await page.setContent(`<html><body style="margin:0;background:#0f5c46;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px">${svg.replace("<svg ", `<svg width="${inner}" height="${inner}" `)}</body></html>`);
  await page.screenshot({ path: new URL(`../public/${name}`, import.meta.url).pathname, omitBackground: pad === 0 });
}
await browser.close();
console.log("iconen gemaakt");
