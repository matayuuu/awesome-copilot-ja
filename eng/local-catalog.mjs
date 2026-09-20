import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseFrontmatter, parseYamlFile } from "./yaml-parser.mjs";
import { getGitFileDates } from "./utils/git-dates.mjs";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const sourceUrl = (file) =>
  `https://github.com/github/awesome-copilot/blob/main/${file.split("/").map(encodeURIComponent).join("/")}`;

export function descriptionHash(description) {
  return createHash("sha256").update(description).digest("hex");
}

export function assertResourceCoverage(items, sourceKeys) {
  const generatedKeys = new Set(items.map((item) => item.key));
  const missing = sourceKeys.filter((key) => !generatedKeys.has(key));
  if (missing.length) throw new Error(`Source resources omitted by generator: ${missing.join(", ")}`);
}

export function collectCatalog() {
  const items = [];
  for (const [file, type] of [
    ["agents", "agent"], ["instructions", "instruction"], ["skills", "skill"],
    ["plugins", "plugin"], ["extensions", "extension"],
  ]) {
    const data = readJson(`website/public/data/${file}.json`);
    for (const item of data.items) {
      let description = item.description;
      const descriptionFromBody = !description;
      if (descriptionFromBody) {
        const content = fs.readFileSync(path.join(root, item.path), "utf8");
        description = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
          .trim().split(/\r?\n\s*\r?\n/).filter((paragraph) => !paragraph.startsWith("#")).slice(0, 2).join("\n\n");
      }
      items.push({
        key: `${type}:${item.id}`,
        type,
        title: item.title || item.name || item.id,
        description,
        descriptionFromBody,
        lastUpdated: item.lastUpdated || null,
        url: `https://awesome-copilot.github.com/${type}/${encodeURIComponent(item.id)}/`,
        tags: [...(item.tags || []), ...(item.tools || []), ...(item.keywords || [])],
      });
    }
  }
  const dates = getGitFileDates(["hooks", "workflows", "cookbook", "website/data"], root);
  for (const [directory, type] of [["hooks", "hook"], ["workflows", "workflow"]]) {
    for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
      if (type === "hook" ? !entry.isDirectory() : !entry.isFile() || !entry.name.endsWith(".md")) continue;
      const file = type === "hook" ? `${directory}/${entry.name}/README.md` : `${directory}/${entry.name}`;
      const meta = parseFrontmatter(path.join(root, file));
      if (!meta) throw new Error(`Cannot read resource metadata: ${file}`);
      items.push({
        key: `${type}:${entry.name.replace(/\.md$/, "")}`,
        type, title: meta.name || entry.name, description: meta.description,
        lastUpdated: dates.get(file) || null, url: sourceUrl(file), tags: meta.tags || [],
      });
    }
  }
  const tools = parseYamlFile(path.join(root, "website", "data", "tools.yml"));
  if (!Array.isArray(tools?.tools)) throw new Error("Cannot read tools catalog");
  for (const tool of tools.tools) {
    items.push({
      key: `tool:${tool.id}`, type: "tool", title: tool.name, description: tool.description,
      lastUpdated: dates.get("website/data/tools.yml") || null,
      url: tool.links?.github || tool.links?.documentation || tool.links?.blog || sourceUrl("website/data/tools.yml"),
      tags: tool.tags || [],
    });
  }
  for (const book of readJson("website/public/data/samples.json").cookbooks) {
    items.push({
      key: `cookbook:${book.id}`, type: "cookbook", title: book.name, description: book.description,
      lastUpdated: null, url: sourceUrl(`${book.path}/README.md`), tags: [],
    });
    for (const recipe of book.recipes) {
      const doc = Object.values(recipe.variants)[0]?.doc;
      items.push({
        key: `recipe:${book.id}/${recipe.id}`, type: "recipe", title: recipe.name,
        description: recipe.description, lastUpdated: doc ? dates.get(doc) || null : null,
        url: recipe.external ? recipe.url : sourceUrl(doc || `${book.path}/README.md`),
        tags: recipe.tags || [],
      });
    }
  }
  const keys = new Set();
  for (const item of items) {
    if (keys.has(item.key)) throw new Error(`Duplicate catalog key: ${item.key}`);
    keys.add(item.key);
    if (typeof item.description !== "string" || !item.description.trim()) {
      throw new Error(`Missing source description: ${item.key}`);
    }
    if (!/^https?:$/.test(new URL(item.url).protocol)) throw new Error(`Unsafe URL: ${item.key}`);
  }
  const sourceKeys = [];
  for (const [directory, type, suffix] of [
    ["agents", "agent", ".agent.md"], ["instructions", "instruction", ".instructions.md"],
    ["skills", "skill", null], ["hooks", "hook", null], ["workflows", "workflow", ".md"],
  ]) {
    for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
      if (suffix ? !entry.isFile() || !entry.name.endsWith(suffix) : !entry.isDirectory()) continue;
      const id = suffix ? entry.name.slice(0, -suffix.length) : entry.name;
      sourceKeys.push(`${type}:${id}`);
    }
  }
  assertResourceCoverage(items, sourceKeys);
  return items.sort((a, b) => a.key.localeCompare(b.key, "en"));
}

export function localizeCatalog(items, translations) {
  const errors = [];
  const localized = items.map((item) => {
    const translation = translations[item.key] ||
      (/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(item.description)
        ? { sourceHash: descriptionHash(item.description), ja: item.description }
        : undefined);
    if (!translation || typeof translation.ja !== "string" ||
        !/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(translation.ja)) {
      errors.push(`Missing Japanese description: ${item.key}`);
    } else if (translation.sourceHash !== descriptionHash(item.description)) {
      errors.push(`Stale Japanese description: ${item.key}`);
    }
    return { ...item, originalDescription: item.description, description: translation?.ja };
  });
  if (errors.length) throw new Error(errors.join("\n"));
  return localized;
}
