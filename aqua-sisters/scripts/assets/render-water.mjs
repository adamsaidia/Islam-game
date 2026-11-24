// Genereert de water-achtergronden (public/images) met een WebGL-causticsshader.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const out = path.resolve(dir, '../../public/images');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
for (const [name, w, h, tone] of [['water-hero.jpg', 2400, 1600, 1], ['water-mobile.jpg', 1080, 1600, 1], ['water-og.jpg', 1200, 630, 0.9]]) {
  await page.goto(`file://${dir}/water.html?w=${w}&h=${h}&tone=${tone}`);
  const data = await page.waitForFunction(() => window.done).then((h) => h.jsonValue());
  fs.writeFileSync(path.join(out, name), Buffer.from(data.split(',')[1], 'base64'));
  console.log('✓', name);
}
await browser.close();
