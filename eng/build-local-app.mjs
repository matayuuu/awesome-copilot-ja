import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { collectCatalog, localizeCatalog, root } from "./local-catalog.mjs";

const app = path.join(root, "local-app");
const translations = {};
for (const file of fs.readdirSync(path.join(app, "translations")).filter((file) => file.endsWith(".json")).sort()) {
  const entries = JSON.parse(fs.readFileSync(path.join(app, "translations", file), "utf8"));
  for (const [key, value] of Object.entries(entries)) {
    if (Object.hasOwn(translations, key)) throw new Error(`Duplicate translation: ${key}`);
    translations[key] = value;
  }
}
const items = localizeCatalog(collectCatalog(), translations);
const revision = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const payload = JSON.stringify({ items, revision, generated: new Date().toISOString() })
  .replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
const model = fs.readFileSync(path.join(app, "model.mjs"), "utf8").replace(/^export /gm, "");
const script = `${model}\n${fs.readFileSync(path.join(app, "app.mjs"), "utf8")}`;
let html = fs.readFileSync(path.join(app, "index.html"), "utf8");
for (const [marker, content] of [
  ["/* APP_STYLES */", fs.readFileSync(path.join(app, "styles.css"), "utf8")],
  ["/* APP_DATA */", payload],
  ["/* APP_SCRIPT */", script],
]) {
  if (!html.includes(marker)) throw new Error(`Missing template marker: ${marker}`);
  html = html.replace(marker, () => content);
}
fs.mkdirSync(path.join(app, "dist"), { recursive: true });
fs.writeFileSync(path.join(app, "dist", "index.html"), html);
fs.copyFileSync(path.join(root, "LICENSE"), path.join(app, "dist", "LICENSE.txt"));
const counts = Object.fromEntries([...new Set(items.map((item) => item.type))]
  .map((type) => [type, items.filter((item) => item.type === type).length]));
console.log(`Japanese catalog: ${items.length}/${items.length} descriptions; ${JSON.stringify(counts)}`);
console.log("Built local-app/dist/index.html (self-contained, no runtime network requests)");
