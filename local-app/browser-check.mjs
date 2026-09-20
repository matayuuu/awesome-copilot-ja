import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { STORAGE_KEY, selectItems } from "./model.mjs";

const require = createRequire(import.meta.url);
const base = process.env.LOCAL_APP_URL || "http://127.0.0.1:4317/";
if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(base).hostname)) {
  throw new Error("Browser checks must target a loopback URL.");
}
const output = path.resolve(process.env.LOCAL_APP_REPORT_DIR || "reports/local-catalog");
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, locale: "ja-JP", colorScheme: "light" });
const page = await context.newPage();
const pageErrors = [];
const remoteRequests = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("request", (request) => {
  if (!request.url().startsWith(new URL(base).origin)) remoteRequests.push(request.url());
});
const check = async (name, run) => { await run(); console.log(`PASS ${name}`); };
const cardKeys = () => page.locator(".card").evaluateAll((cards) => cards.map((card) => card.dataset.key));
const waitCount = (count) => page.waitForFunction((expected) => document.getElementById("result-count").textContent === `${expected.toLocaleString("ja-JP")} 件`, count);
const importData = (text) => page.locator("#import").setInputFiles({ name: "favorites.json", mimeType: "application/json", buffer: Buffer.from(text) });
const audits = [];
async function audit(label) {
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const results = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
  }));
  audits.push({ label, violations: results.violations });
  fs.writeFileSync(path.join(output, "accessibility.json"), JSON.stringify(audits, null, 2));
  assert.deepEqual(results.violations.map((entry) => ({
    id: entry.id, impact: entry.impact, nodes: entry.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
  })), [], label);
}
try {
  await page.goto(`${base}?scoutTheme=light`);
  await page.locator(".card").first().waitFor();
  const items = await page.locator("#catalog-data").evaluate((node) => JSON.parse(node.textContent).items);
  await check(`all ${items.length} descriptions and all 10 category filters`, async () => {
    assert.equal(new Set(items.map((item) => item.type)).size, 10);
    assert.ok(items.every((item) => /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(item.description)));
    await waitCount(items.length);
    assert.equal(await page.locator(".card").count(), 24);
    for (const type of new Set(items.map((item) => item.type))) {
      await page.locator(`[data-type="${type}"]`).click();
      const expected = items.filter((item) => item.type === type);
      await waitCount(expected.length);
      assert.ok((await cardKeys()).every((key) => key.startsWith(`${type}:`)));
      await page.locator(`[data-type="${type}"]`).click();
    }
  });
  await check("Japanese and English search, empty state, pagination and all four sorts", async () => {
    for (const query of ["テスト", "ＡＺＵＲＥ", "code review", "this-should-never-match-xyz987654"]) {
      await page.getByRole("searchbox").fill(query);
      await waitCount(selectItems(items, { query }, {}).length);
    }
    assert.equal(await page.locator("#empty").isVisible(), true);
    await page.locator("#clear").click();
    await page.locator("#next").click();
    assert.match(await page.locator("#page-count").textContent(), /^2 \//);
    await page.locator("#previous").click();
    for (const sort of ["name", "name-desc", "updated", "saved"]) {
      await page.locator("#sort").selectOption(sort);
      assert.deepEqual(await cardKeys(), selectItems(items, { sort }, {}).slice(0, 24).map((item) => item.key));
    }
    await page.locator("#sort").selectOption("name");
  });
  await check("favorites persist through reload, compose with filters, and synchronize across tabs", async () => {
    const first = (await cardKeys())[0];
    await page.locator(".save-button").nth(0).click();
    const second = (await cardKeys())[1];
    await page.locator(".save-button").nth(1).click();
    await page.reload();
    await page.locator("#saved").click();
    await waitCount(2);
    assert.deepEqual(new Set(await cardKeys()), new Set([first, second]));
    await page.locator("#sort").selectOption("saved");
    assert.equal((await cardKeys())[0], second);
    const tab = await context.newPage();
    await tab.goto(base);
    await tab.locator(`.card[data-key="${first}"] .save-button`).click();
    await waitCount(1);
    assert.equal((await cardKeys())[0], second);
    await tab.close();
  });
  await check("detail modal, complete Japanese/original text, keyboard closing and saving", async () => {
    await page.locator(".card-title").first().click();
    assert.equal(await page.getByRole("dialog").isVisible(), true);
    assert.ok((await page.locator("#detail-description").textContent()).length > 0);
    await page.locator("summary").click();
    assert.ok((await page.locator("#detail-original").textContent()).length > 0);
    await page.locator("#detail-save").click();
    await page.keyboard.press("Escape");
    await waitCount(0);
    assert.equal(await page.locator("#empty").isVisible(), true);
    await page.waitForFunction(() => !document.getElementById("detail").open &&
      document.activeElement.id === "list-title");
    assert.equal(await page.evaluate(() => document.activeElement.id), "list-title");
  });
  await check("backup round trip, malformed import, unknown keys and HTML injection are handled safely", async () => {
    const backup = { version: 1, favorites: { [items[0].key]: 100, "skill:not-in-snapshot": 200 } };
    await importData(JSON.stringify(backup));
    await page.waitForFunction(() => document.getElementById("notice").textContent.includes("取り込みました"));
    await waitCount(1);
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#export").click();
    const download = await downloadPromise;
    assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(), "utf8")), backup);
    const before = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    await importData('{"version":2,"favorites":{}}');
    await page.locator("#error").waitFor({ state: "visible" });
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), before);
    await page.locator("#browse").click();
    await page.getByRole("searchbox").fill('<img src=x onerror="window.injected=true">');
    await waitCount(0);
    assert.equal(await page.evaluate(() => window.injected), undefined);
    await page.locator("#clear").click();
    await page.reload();
  });
  await check("blocked writes do not claim success or change favorite state", async () => {
    const blocked = await context.newPage();
    await blocked.addInitScript(() => {
      Storage.prototype.setItem = () => { throw new DOMException("Quota exceeded", "QuotaExceededError"); };
    });
    await blocked.goto(base);
    const button = blocked.locator(".save-button").first();
    const before = await button.getAttribute("aria-pressed");
    await button.click();
    assert.equal(await blocked.locator("#error").isVisible(), true);
    assert.match(await blocked.locator("#error").textContent(), /保存できません/);
    assert.equal(await button.getAttribute("aria-pressed"), before);
    await blocked.close();
  });
  await check("corrupt storage is protected and search remains usable", async () => {
    const isolated = await browser.newContext();
    const broken = await isolated.newPage();
    await broken.addInitScript((key) => localStorage.setItem(key, "{broken"), STORAGE_KEY);
    await broken.goto(base);
    await broken.locator("#error").waitFor({ state: "visible" });
    assert.equal(await broken.locator(".save-button").first().isDisabled(), true);
    await broken.getByRole("searchbox").fill("Azure");
    assert.ok(await broken.locator(".card").count() > 0);
    assert.equal(await broken.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), "{broken");
    await isolated.close();
  });
  await check("desktop, mobile, light/dark themes and dialog accessibility", async () => {
    await page.goto(`${base}?scoutTheme=light`);
    await page.locator(".card").first().waitFor();
    await audit("desktop-light");
    await page.screenshot({ path: path.join(output, "desktop-light.png") });
    await page.locator(".card-title").first().click();
    await audit("dialog-light");
    await page.keyboard.press("Escape");
    await page.locator("#theme").click();
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    await audit("desktop-dark");
    await page.locator('[data-type="agent"]').click();
    await audit("category-dark");
    await page.locator('[data-type="agent"]').click();
    await page.screenshot({ path: path.join(output, "desktop-dark.png") });
    await page.setViewportSize({ width: 390, height: 844 });
    for (const theme of ["light", "dark"]) {
      await page.goto(`${base}?scoutTheme=${theme}`);
      await page.locator(".card").first().waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await audit(`mobile-${theme}`);
      await page.screenshot({ path: path.join(output, `mobile-${theme}.png`) });
    }
  });
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(remoteRequests, []);
  fs.writeFileSync(path.join(output, "capture.json"), JSON.stringify({
    url: base, captured: new Date().toISOString(), browser: browser.version(), locale: "ja-JP",
    desktop: { width: 1440, height: 1050 }, mobile: { width: 390, height: 844 }, deviceScaleFactor: 1,
    source: "local-app/browser-check.mjs", changes: "none", personalData: "none; isolated test browser and public catalog only",
    review: { visual: "pending", privacy: "pending" },
  }, null, 2));
  console.log(`PASS no runtime errors or external requests; ${items.length} resources; screenshots: ${output}`);
} finally {
  await browser.close();
}
