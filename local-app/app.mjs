const catalog = JSON.parse(document.getElementById("catalog-data").textContent);
const items = catalog.items;
const byKey = new Map(items.map((item) => [item.key, item]));
const $ = (id) => document.getElementById(id);
const state = { query: "", type: "all", savedOnly: false, sort: "name", page: 1 };
const pageSize = 24;
let favorites = {};
let storageReady = false;
let detailItem = null;
let detailTrigger = null;
const number = new Intl.NumberFormat("ja-JP");
const date = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });

function reportError(message, error) {
  $("error").textContent = message;
  $("error").hidden = false;
  console.error(message, error);
}

function readStorage() {
  try {
    favorites = parseFavorites(localStorage.getItem(STORAGE_KEY));
    storageReady = true;
    $("error").hidden = true;
  } catch (error) {
    storageReady = false;
    reportError("保存データを読み込めません。ブラウザーのストレージ設定や保存データを確認してください。既存データを保護するため、保存の変更を停止しています。検索と閲覧は利用できます。", error);
  }
}

function updateStorage(transform) {
  try {
    const latest = parseFavorites(localStorage.getItem(STORAGE_KEY));
    const updated = transform(latest);
    localStorage.setItem(STORAGE_KEY, serializeFavorites(updated));
    favorites = updated;
    storageReady = true;
    $("error").hidden = true;
    render();
    return true;
  } catch (error) {
    reportError("ブラウザーに保存できませんでした。空き容量とストレージ設定を確認してください。変更は保存されていません。", error);
    return false;
  }
}

function toggleSave(item) {
  if (!storageReady) return;
  let added;
  const updated = updateStorage((latest) => {
    added = !Object.hasOwn(latest, item.key);
    if (added) latest[item.key] = Date.now();
    else delete latest[item.key];
    return latest;
  });
  if (updated) $("notice").textContent = `${item.title} ${added ? "を保存しました。" : "の保存を解除しました。"}`;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatDate(value) {
  return value && Number.isFinite(Date.parse(value)) ? date.format(new Date(value)) : "日時不明";
}

function updateSaveButton(button, item, detailed = false) {
  const saved = Object.hasOwn(favorites, item.key);
  button.textContent = detailed ? (saved ? "★ 保存済み · 解除する" : "☆ お気に入りに保存") : saved ? "★" : "☆";
  button.setAttribute("aria-pressed", String(saved));
  button.setAttribute("aria-label", `${item.title}${saved ? "の保存を解除" : "を保存"}`);
  button.disabled = !storageReady;
}

function openDetail(item, trigger) {
  detailItem = item;
  detailTrigger = trigger;
  $("detail-type").textContent = `${TYPES[item.type][0]} / ${TYPES[item.type][1]}`;
  $("detail-title").textContent = item.title;
  $("detail-description").textContent = item.description;
  $("detail-original").textContent = item.originalDescription;
  $("detail-original").lang = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(item.originalDescription) ? "ja" : "en";
  $("detail-provenance").textContent = `${item.descriptionFromBody ? "説明メタデータがないため、本文の冒頭から要約しています。 " : ""}更新: ${formatDate(item.lastUpdated)}`;
  $("detail-link").href = item.url;
  $("detail-tags").replaceChildren(...[...new Set(item.tags)].map((tag) => element("span", "tag", tag)));
  $("detail").querySelector("details").open = false;
  updateSaveButton($("detail-save"), item, true);
  $("detail").showModal();
  $("detail-close").focus();
}

function createCard(item) {
  const card = element("article", "card");
  card.dataset.key = item.key;
  const top = element("div", "card-top");
  top.append(element("span", "type-pill", `${TYPES[item.type][2]} / ${TYPES[item.type][0]}`));
  const save = element("button", "save-button");
  updateSaveButton(save, item);
  save.addEventListener("click", () => {
    toggleSave(item);
    const replacement = [...$("cards").querySelectorAll("article")].find((node) => node.dataset.key === item.key);
    (replacement?.querySelector(".save-button") || $("list-title")).focus();
  });
  top.append(save);
  const heading = element("h3");
  const title = element("button", "card-title", item.title);
  title.addEventListener("click", () => openDetail(item, { key: item.key, selector: ".card-title" }));
  heading.append(title);
  const description = element("p", "card-description", item.description);
  const bottom = element("div", "card-bottom");
  const timestamp = state.sort === "saved" && favorites[item.key]
    ? `保存 ${date.format(favorites[item.key])}` : `更新 ${formatDate(item.lastUpdated)}`;
  bottom.append(element("span", "", timestamp));
  const details = element("button", "", "説明を読む ↗");
  details.setAttribute("aria-label", `${item.title}の説明を読む`);
  details.addEventListener("click", () => openDetail(item, { key: item.key, selector: ".card-bottom button" }));
  bottom.append(details);
  card.append(top, heading, description, bottom);
  return card;
}

function renderCategories() {
  const counts = Object.fromEntries(Object.keys(TYPES).map((type) => [
    type, items.filter((item) => item.type === type && (!state.savedOnly || Object.hasOwn(favorites, item.key))).length,
  ]));
  $("categories").replaceChildren();
  for (const [type, [label, description, icon]] of Object.entries(TYPES)) {
    const button = element("button", `category-button${state.type === type ? " active" : ""}`);
    button.dataset.type = type;
    button.setAttribute("aria-pressed", String(state.type === type));
    button.setAttribute("aria-label", `${label}（${description}）`);
    button.append(element("span", "category-icon", icon), element("span", "", label), element("span", "count", number.format(counts[type])));
    button.addEventListener("click", () => {
      state.type = state.type === type ? "all" : type;
      state.page = 1;
      render();
      $("categories").querySelector(`[data-type="${type}"]`).focus();
    });
    $("categories").append(button);
  }
}

function render() {
  const results = selectItems(items, state, favorites);
  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  state.page = Math.max(1, Math.min(state.page, pages));
  $("cards").replaceChildren(...results.slice((state.page - 1) * pageSize, state.page * pageSize).map(createCard));
  $("result-count").textContent = `${number.format(results.length)} 件`;
  $("saved-count").textContent = number.format(items.filter((item) => Object.hasOwn(favorites, item.key)).length);
  $("browse").classList.toggle("active", !state.savedOnly);
  $("browse").setAttribute("aria-pressed", String(!state.savedOnly));
  $("saved").classList.toggle("active", state.savedOnly);
  $("saved").setAttribute("aria-pressed", String(state.savedOnly));
  $("list-title").textContent = state.type === "all"
    ? state.savedOnly ? "保存済みのリソース" : "すべてのリソース"
    : `${state.savedOnly ? "保存済み / " : ""}${TYPES[state.type][0]}`;
  $("clear").hidden = !state.query && state.type === "all";
  $("storage-note").hidden = !state.savedOnly;
  $("empty").hidden = results.length !== 0;
  $("empty-title").textContent = state.savedOnly && !Object.keys(favorites).length
    ? "あなたの道具箱は、ここから。" : "一致するリソースがありません";
  $("empty-text").textContent = state.savedOnly && !Object.keys(favorites).length
    ? "気になるリソースの ☆ を押すと、この一覧に保存できます。" : "検索語やカテゴリーを変えて、もう一度お試しください。";
  $("pagination").hidden = results.length <= pageSize;
  $("page-count").textContent = `${state.page} / ${pages} ページ`;
  $("previous").disabled = state.page === 1;
  $("next").disabled = state.page === pages;
  $("export").disabled = !storageReady;
  $("import").disabled = !storageReady;
  renderCategories();
  if (detailItem) updateSaveButton($("detail-save"), detailItem, true);
}

function setView(savedOnly) {
  state.savedOnly = savedOnly;
  state.type = "all";
  state.page = 1;
  render();
}

$("browse").addEventListener("click", () => setView(false));
$("saved").addEventListener("click", () => setView(true));
$("search").addEventListener("input", (event) => {
  state.query = event.target.value;
  state.page = 1;
  render();
});
$("sort").addEventListener("change", (event) => {
  state.sort = event.target.value;
  state.page = 1;
  render();
});
$("clear").addEventListener("click", () => {
  state.query = "";
  state.type = "all";
  state.page = 1;
  $("search").value = "";
  render();
  $("search").focus();
});
for (const [id, delta] of [["previous", -1], ["next", 1]]) {
  $(id).addEventListener("click", () => {
    state.page += delta;
    render();
    $("list-title").focus();
    $("list-title").scrollIntoView({ block: "start" });
  });
}
$("list-title").tabIndex = -1;
$("detail-close").addEventListener("click", () => $("detail").close());
$("detail").addEventListener("close", () => {
  const card = [...$("cards").querySelectorAll("article")].find((node) => node.dataset.key === detailTrigger?.key);
  (card?.querySelector(detailTrigger.selector) || $("list-title")).focus();
  detailItem = null;
});
$("detail-save").addEventListener("click", () => { if (detailItem) toggleSave(detailItem); });
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !$("detail").open &&
      !event.target.closest("input, textarea, select, [contenteditable]")) {
    event.preventDefault();
    $("search").focus();
  }
});

function updateThemeButton() {
  $("theme").setAttribute("aria-label", `${document.documentElement.dataset.theme === "dark" ? "ライト" : "ダーク"}テーマに切り替え`);
}
$("theme").addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  const url = new URL(location.href);
  url.searchParams.set("scoutTheme", theme);
  history.replaceState(null, "", url);
  updateThemeButton();
});

function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = element("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("export").addEventListener("click", () => {
  readStorage();
  render();
  if (!storageReady) return;
  download(serializeFavorites(favorites), "copilot-library-favorites.json");
  $("notice").textContent = "お気に入りのバックアップをエクスポートしました。";
});
$("import").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error("ファイルの上限は 5 MB です。");
    const incoming = parseFavorites(await file.text());
    const missing = Object.keys(incoming).filter((key) => !byKey.has(key)).length;
    if (updateStorage((current) => mergeFavorites(current, incoming))) {
      $("notice").textContent = `${Object.keys(incoming).length} 件を取り込みました。既存のお気に入りは保持されています。${missing ? ` 現在のカタログにない ${missing} 件は保存データだけに保持しています。` : ""}`;
    }
  } catch (error) {
    reportError(`インポートできませんでした。${error.message} 既存の保存データは変更していません。`, error);
  } finally {
    event.target.value = "";
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY || event.key === null) {
    readStorage();
    render();
  }
});

$("total-count").textContent = number.format(items.length);
$("hero-total").textContent = number.format(items.length);
$("snapshot").textContent = `データ生成 ${formatDate(catalog.generated)} · ${catalog.revision}`;
readStorage();
render();
updateThemeButton();
