import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://localhost:3100/circulo-de-amigos", { waitUntil: "networkidle", timeout: 45000 });

const buttons = await page.locator("button").allTextContents();
console.log("All buttons:", buttons);

const links = await page.getByRole("link").allTextContents();
console.log("Links with Inscr:", links.filter((t) => /inscr/i.test(t)));

const html = await page.content();
const idx = html.indexOf("Inscr");
console.log("First Inscr snippet:", html.slice(idx, idx + 200));

await browser.close();
