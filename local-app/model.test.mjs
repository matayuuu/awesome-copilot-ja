import test from "node:test";
import assert from "node:assert/strict";
import { parseFavorites, serializeFavorites, selectItems, mergeFavorites } from "./model.mjs";

test("rejects malformed, wrong-version and invalid favorites before any writes", () => {
  for (const text of [
    "{", "null", "[]", '{"version":2,"favorites":{}}',
    '{"version":1,"favorites":[]}', '{"version":1,"favorites":{"__proto__":1}}',
    '{"version":1,"favorites":{"agent:x":-1}}', '{"version":1,"favorites":{"agent:x":"now"}}',
    '{"version":1,"favorites":{"agent:x":8640000000000001}}',
    '{"version":1,"favorites":{"agent:x":1.5}}',
  ]) assert.throws(() => parseFavorites(text));
  assert.deepEqual(parseFavorites(null), {});
});

test("round trips typed keys without collisions and retains absent catalog items", () => {
  const favorites = { "agent:same": 123, "skill:same": 456, "recipe:book/example": 789 };
  assert.deepEqual(parseFavorites(serializeFavorites(favorites)), favorites);
  assert.deepEqual(mergeFavorites(favorites, { "agent:same": 100, "hook:new": 900 }), { ...favorites, "hook:new": 900 });
});

const items = [
  { key: "agent:z", type: "agent", title: "Z 10", description: "Azure の設計", originalDescription: "architecture", tags: ["cloud"], lastUpdated: "2025-01-01" },
  { key: "agent:a", type: "agent", title: "A 2", description: "テストを自動化", originalDescription: "tests", tags: [], lastUpdated: null },
  { key: "skill:s", type: "skill", title: "A 10", description: "Azure テスト", originalDescription: "tests", tags: [], lastUpdated: "2026-01-01" },
];
const keys = (results) => results.map((item) => item.key);

test("search supports Japanese, original English, tags, fullwidth and multiple terms", () => {
  assert.deepEqual(keys(selectItems(items, { query: "ａｚｕｒｅ テスト" }, {})), ["skill:s"]);
  assert.deepEqual(keys(selectItems(items, { query: "ARCHITECTURE cloud" }, {})), ["agent:z"]);
  assert.equal(selectItems(items, { query: "no-matches" }, {}).length, 0);
});

test("saved and type filters compose without leaking different types", () => {
  const saved = { "agent:z": 100, "skill:s": 200 };
  assert.deepEqual(keys(selectItems(items, { savedOnly: true, type: "agent" }, saved)), ["agent:z"]);
  assert.equal(selectItems(items, { savedOnly: true }, {}).length, 0);
});

test("sorts naturally, newest first and unknown dates last, without mutating input", () => {
  assert.deepEqual(keys(selectItems(items, {}, {})), ["agent:a", "skill:s", "agent:z"]);
  assert.deepEqual(keys(selectItems(items, { sort: "name-desc" }, {})), ["agent:z", "skill:s", "agent:a"]);
  assert.deepEqual(keys(selectItems(items, { sort: "updated" }, {})), ["skill:s", "agent:z", "agent:a"]);
  assert.deepEqual(keys(selectItems(items, { sort: "saved" }, { "agent:a": 20, "agent:z": 10 })), ["agent:a", "agent:z", "skill:s"]);
  assert.equal(items[0].key, "agent:z");
});
