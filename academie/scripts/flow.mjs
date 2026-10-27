// Interactieve test: maakt echte oefeningen, controleert opslag en hervatten.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("arabische-academie") ?? "{}").state);
const check = (cond, msg) => {
  console.log(`${cond ? "OK  " : "FOUT"} ${msg}`);
  if (!cond) process.exitCode = 1;
};

// 1. Les 9: koppeloefening + meerkeuze, dan hervatten na herladen.
await page.goto(`${BASE}/lessen/9`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Start oefeningen" }).click();
const pairs = { "بَ": "ba", "بِ": "bi", "بُ": "bu" };
for (const [ar, lat] of Object.entries(pairs)) {
  await page.locator("main button", { hasText: new RegExp(`^${ar}$`) }).first().click();
  await page.locator("button", { hasText: new RegExp(`^${lat}$`) }).first().click();
}
await page.getByRole("button", { name: "Volgende" }).click();
await page.locator("button", { hasText: /^bi$/ }).click();
check(await page.getByText("Goed!").isVisible(), "meerkeuze 'bi' wordt goed gerekend");
await page.getByRole("button", { name: "Volgende" }).click();
let st = await state();
check(st.lessons["9"]?.step === 3, `voortgang opgeslagen (stap ${st.lessons["9"]?.step})`);
check(st.lessons["9"]?.status === "in_progress", "les staat op 'bezig'");
await page.reload({ waitUntil: "networkidle" });
check(await page.getByText("3 / 11").isVisible(), "les hervat bij oefening 3 na herladen");

// 2. Les 8: Arabisch typen met het app-toetsenbord.
await page.goto(`${BASE}/lessen/8`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Start oefeningen" }).click();
for (const ch of ["ك", "ت", "ا", "ب"]) await page.locator("button.ar", { hasText: new RegExp(`^${ch}$`) }).first().click();
await page.getByRole("button", { name: "Controleer" }).click();
check(await page.getByText("Goed!", { exact: false }).first().isVisible(), "getypt كتاب via toetsenbord is goed");
await page.getByRole("button", { name: "Volgende" }).click();
await page.locator("input[dir=rtl]").fill("درص");
await page.getByRole("button", { name: "Controleer" }).click();
check(await page.getByText("Nog niet goed", { exact: true }).isVisible(), "fout antwoord wordt fout gerekend");
await page.getByRole("button", { name: "Volgende" }).click();
st = await state();
check(Object.keys(st.mistakes).includes("L8-e2"), "fout wordt bewaard voor herhaling");
check(st.skills.writing.n >= 2, "vaardigheidsscore schrijven bijgewerkt");

// 3. Schrijfbord: tekenen en vergelijken.
await page.goto(`${BASE}/schrijven`, { waitUntil: "networkidle" });
await page.getByRole("radio", { name: "Schrijfbord" }).click();
const canvas = page.locator("canvas").nth(1);
await canvas.scrollIntoViewIfNeeded();
const box = await canvas.boundingBox();
await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.45);
await page.mouse.down();
for (let i = 0; i <= 20; i++) await page.mouse.move(box.x + box.width * (0.75 - i * 0.025), box.y + box.height * (0.45 + Math.sin(i / 6) * 0.05));
await page.mouse.up();
await page.getByRole("button", { name: "Vergelijk" }).click();
check(await page.getByText(/Overeenkomst: \d+%/).isVisible(), "schrijfbord geeft een vergelijkingsscore");

// 4. Leesmodule: harakat uitzetten en woord aanklikken.
await page.goto(`${BASE}/lezen`, { waitUntil: "networkidle" });
await page.getByText("Mijn familie").click();
await page.getByRole("radio", { name: "Zonder" }).click();
const firstWord = await page.locator("p.ar button").first().textContent();
check(!/[ً-ْ]/.test(firstWord ?? ""), `harakat verborgen (${firstWord})`);
await page.locator("p.ar button").nth(3).click();
check(await page.getByText("mijn familie", { exact: true }).isVisible(), "woord aanklikken toont betekenis");
await page.getByRole("button", { name: "Bewaar" }).click();
st = await state();
check(Object.values(st.dictionary).some((w) => w.nl === "mijn familie"), "woord bewaard in woordenboek");
check(Object.keys(st.cards).length >= 2, "flashcards aangemaakt (herkennen + produceren)");

// 5. Flashcards herhalen.
await page.goto(`${BASE}/woorden`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Toon betekenis" }).click();
await page.getByRole("button", { name: "Goed", exact: true }).click();
st = await state();
check(Object.values(st.cards).some((c) => c.reps === 1), "kaart herhaald en ingepland via FSRS");

// 6. Dashboard: AI-status eerlijk, dagplan zichtbaar.
await page.goto(`${BASE}/spreken`, { waitUntil: "networkidle" });
const aiConfigured = await page.evaluate(() => fetch("/api/ai/status").then((r) => r.json()));
if (!aiConfigured.configured) check(await page.getByText(/niet geconfigureerd/).isVisible(), "spreektrainer meldt eerlijk dat AI niet geconfigureerd is");
const r = await page.evaluate(() => fetch("/api/ai", { method: "POST", body: JSON.stringify({ task: "tutor", messages: [{ role: "user", content: "hoi" }] }) }).then((x) => x.status));
if (!aiConfigured.configured) check(r === 503, `AI-route weigert zonder sleutel (${r})`);

check(errors.length === 0, `geen JavaScript-fouten${errors.length ? ": " + errors.join(" | ") : ""}`);
await browser.close();
