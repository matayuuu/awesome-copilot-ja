import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { assertResourceCoverage, collectCatalog, descriptionHash, localizeCatalog, root } from "./local-catalog.mjs";

test("fails when a malformed source resource was silently omitted by the upstream generator", () => {
  const generated = [{ key: "skill:valid" }];
  assert.throws(() => assertResourceCoverage(generated, ["skill:valid", "skill:omitted"]), /skill:omitted/);
  assert.doesNotThrow(() => assertResourceCoverage(generated, ["skill:valid"]));
});

test("localization rejects deliberately missing, English-only and stale entries", () => {
  const item = { key: "agent:fixture", description: "Analyze source code" };
  assert.throws(() => localizeCatalog([item], {}), /Missing Japanese/);
  assert.throws(() => localizeCatalog([item], { [item.key]: { ja: "Analyze", sourceHash: descriptionHash(item.description) } }), /Missing Japanese/);
  assert.throws(() => localizeCatalog([item], { [item.key]: { ja: "コードを解析します。", sourceHash: "stale" } }), /Stale Japanese/);
  const localized = localizeCatalog([item], { [item.key]: { ja: "コードを解析します。", sourceHash: descriptionHash(item.description) } });
  assert.equal(localized[0].description, "コードを解析します。");
  assert.equal(localized[0].originalDescription, item.description);
});

test("already Japanese source descriptions are preserved, not retranslated", () => {
  const item = { key: "skill:fixture", description: "コードを解析します。" };
  assert.equal(localizeCatalog([item], {})[0].description, item.description);
});

test("inventory includes every local agent, instruction, skill, hook and workflow", () => {
  const catalog = collectCatalog();
  const keys = new Set(catalog.map((item) => item.key));
  for (const [directory, type, suffix] of [
    ["agents", "agent", ".agent.md"], ["instructions", "instruction", ".instructions.md"],
    ["skills", "skill", null], ["hooks", "hook", null], ["workflows", "workflow", ".md"],
  ]) {
    const entries = fs.readdirSync(path.join(root, directory), { withFileTypes: true })
      .filter((entry) => suffix ? entry.isFile() && entry.name.endsWith(suffix) : entry.isDirectory());
    for (const entry of entries) {
      const id = suffix ? entry.name.slice(0, -suffix.length) : entry.name;
      assert.ok(keys.has(`${type}:${id}`), `Missing source resource: ${type}:${id}`);
    }
    assert.equal(catalog.filter((item) => item.type === type).length, entries.length);
  }
  assert.equal(keys.size, catalog.length);
  assert.equal(new Set(catalog.map((item) => item.type)).size, 10);
});
