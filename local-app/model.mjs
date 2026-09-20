export const STORAGE_KEY = "awesome-copilot-ja:favorites:v1";
export const TYPES = {
  agent: ["Agents", "エージェント", "AG"],
  instruction: ["Instructions", "開発ルール", "IN"],
  skill: ["Skills", "専門スキル", "SK"],
  plugin: ["Plugins", "プラグイン", "PL"],
  extension: ["Extensions", "キャンバス拡張", "EX"],
  hook: ["Hooks", "イベント連携", "HK"],
  workflow: ["Workflows", "自動化", "WF"],
  tool: ["Tools", "開発ツール", "TL"],
  cookbook: ["Cookbooks", "レシピ集", "CB"],
  recipe: ["Recipes", "実装レシピ", "RC"],
};

export function parseFavorites(text) {
  if (text === null) return {};
  const data = JSON.parse(text);
  if (!data || data.version !== 1 || !data.favorites ||
      typeof data.favorites !== "object" || Array.isArray(data.favorites)) {
    throw new Error("保存データの形式またはバージョンが正しくありません。");
  }
  for (const [key, timestamp] of Object.entries(data.favorites)) {
    if (!/^(agent|instruction|skill|plugin|extension|hook|workflow|tool|cookbook|recipe):.+$/.test(key) ||
        !Number.isSafeInteger(timestamp) || timestamp <= 0 || timestamp > 8640000000000000) {
      throw new Error("保存データに不正な項目または日時が含まれています。");
    }
  }
  return data.favorites;
}

export function serializeFavorites(favorites) {
  const text = JSON.stringify({ version: 1, favorites }, null, 2);
  parseFavorites(text);
  return text;
}

const collator = new Intl.Collator("ja", { numeric: true, sensitivity: "base" });
const normalize = (value) => value.normalize("NFKC").toLocaleLowerCase("ja");

export function selectItems(items, { query = "", type = "all", savedOnly = false, sort = "name" }, favorites) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  const results = items.filter((item) => {
    if (type !== "all" && item.type !== type) return false;
    if (savedOnly && !Object.hasOwn(favorites, item.key)) return false;
    const text = normalize([item.title, item.description, item.originalDescription, item.key, ...item.tags].join(" "));
    return words.every((word) => text.includes(word));
  });
  const byName = (a, b) => collator.compare(a.title, b.title) || collator.compare(a.key, b.key);
  const dateValue = (value) => Number.isFinite(Date.parse(value)) ? Date.parse(value) : 0;
  return results.sort((a, b) => {
    if (sort === "updated") return dateValue(b.lastUpdated) - dateValue(a.lastUpdated) || byName(a, b);
    if (sort === "saved") return (favorites[b.key] || 0) - (favorites[a.key] || 0) || byName(a, b);
    if (sort === "name-desc") return -byName(a, b);
    return byName(a, b);
  });
}

export function mergeFavorites(current, incoming) {
  const result = { ...current };
  for (const [key, timestamp] of Object.entries(incoming)) {
    result[key] = Math.max(result[key] || 0, timestamp);
  }
  return result;
}
