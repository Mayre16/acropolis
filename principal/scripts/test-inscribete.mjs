import { chromium } from "playwright";

const URL = "http://localhost:3100/circulo-de-amigos/";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const failed = [];
page.on("response", (res) => {
  if (res.status() >= 400 && res.url().includes("_next")) {
    failed.push(`${res.status()} ${res.url()}`);
  }
});

await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
console.log("JS chunk failures:", failed.length ? failed : "none");

const heroBtn = page.getByRole("button", { name: /Inscríbete ahora/i });
await heroBtn.waitFor({ state: "visible", timeout: 15000 });
await heroBtn.click();

const dialog = page.getByRole("dialog", { name: /Inscripción — Círculo de Amigos/i });
await dialog.waitFor({ state: "visible", timeout: 5000 });
console.log("PASS: hero opens modal");

await page.getByRole("button", { name: "Cerrar" }).click();
await dialog.waitFor({ state: "hidden", timeout: 3000 });

await page.getByRole("link", { name: "Inscríbete" }).first().click();
await dialog.waitFor({ state: "visible", timeout: 5000 });
console.log("PASS: nav opens modal");

await browser.close();
