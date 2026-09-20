import fs from "node:fs";
import path from "node:path";
import { collectCatalog, descriptionHash, root } from "./local-catalog.mjs";

const items = collectCatalog().map((item) => ({
  ...item, sourceHash: descriptionHash(item.description),
}));
const output = path.join(root, "website", "public", "data", "local-source.json");
fs.writeFileSync(output, `${JSON.stringify(items, null, 2)}\n`);
const counts = Object.fromEntries([...new Set(items.map((item) => item.type))]
  .map((type) => [type, items.filter((item) => item.type === type).length]));
console.log(JSON.stringify({ total: items.length, counts, output }, null, 2));
