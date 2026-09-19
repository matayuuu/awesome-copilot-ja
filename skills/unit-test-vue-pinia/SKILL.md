---
name: unit-test-vue-pinia
category: testing
description: 'Vue 3 + TypeScript + Vitest + Piniaのコードベース向けに単体テストを作成・レビューします。コンポーネント、composable、storeのテスト作成・更新、createTestingPiniaによるPiniaのモック、Vue Test Utilsのパターン、実装詳細よりブラックボックスアサーションを重視する場合に使用します。'
---
# Vue・Pinia単体テスト

このスキルを使って、Vueコンポーネント、composable、Pinia storeの単体テストを作成またはレビューします。テストは小さく決定的で、振る舞いを優先するものにします。

## ワークフロー

1. まず振る舞いの境界を特定する：コンポーネントUI、composable、storeのどれか。
2. その振る舞いを証明できる最も狭いテスト形式を選ぶ。
3. シナリオを満たす中で最も強力でない選択肢でPiniaをセットアップする。
4. props、フォーム更新、ボタンクリック、子からのemit、store APIなどの公開入力を通してテストを動かす。
5. インスタンスレベルのアサーションを検討する前に、観測可能な出力と副作用をアサートする。
6. 振る舞いを表す明確な名前でテストを返す、またはレビューし、残るカバレッジ不足を記録する。

## 基本ルール

- 1つのテストで1つの振る舞いをテストする。
- まず観測可能な入出力の振る舞い（描画テキスト、emitされたイベント、callback呼び出し、store状態の変化）をアサートする。
- 実装に依存したアサーションを避ける。
- 妥当なDOM、prop、emit、storeレベルのアサーションがない例外的な場合だけ`wrapper.vm`にアクセスする。
- `beforeEach()`で明示的にセットアップし、各テストでモックをリセットする。
- 標準的なPiniaテストセットアップのローカルな正本として、リポジトリに含まれる`references/pinia-patterns.md`を使う。

## Piniaのテスト方針

まず`references/pinia-patterns.md`を使い、リポジトリ内の例で扱われていない場合はPiniaのテストクックブックを参照する。

### コンポーネントテストの標準パターン

mount時は`createTestingPinia`をグローバルPluginとして使います。
一貫性とaction spyのアサーションのしやすさのため、既定値として`createSpy: vi.fn`を優先します。

```ts
const wrapper = mount(ComponentUnderTest, {
	global: {
		plugins: [
			createTestingPinia({
				createSpy: vi.fn,
			}),
		],
	},
});
```

デフォルトではactionをstub化してspyします。
actionが呼ばれたか（または呼ばれなかったか）だけを検証する場合は、`stubActions: true`（デフォルト）を使います。

### 許容される最小限のPiniaセットアップ

次の構成も有効であり、誤りとして指摘してはいけません。

- `createTestingPinia({})`：テストでPinia action spyの振る舞いをアサートしない場合。
- `createTestingPinia({ initialState: ... })`または`createTestingPinia({ stubActions: ... })`を`createSpy`なしで使う構成：状態の初期投入またはactionのstub化だけが必要で、生成されたspyを調べない場合。
- `setActivePinia(createTestingPinia(...))`：store／composable中心のテスト（コンポーネントをmountしない）で、依存storeのモックまたは初期投入が必要な場合。

actionのspyアサーションがテストの意図に含まれる場合は`createSpy: vi.fn`を使います。

### 必要な場合だけ実際のactionを実行する

actionの実際の振る舞いと副作用を検証する必要がある場合だけ`stubActions: false`を使います。単純な「呼ばれた」アサーションのためにデフォルトで有効にしないでください。

```ts
const wrapper = mount(ComponentUnderTest, {
	global: {
		plugins: [
			createTestingPinia({
				createSpy: vi.fn,
				stubActions: false,
			}),
		],
	},
});
```

### `initialState`でstore状態を初期化する

```ts
const wrapper = mount(ComponentUnderTest, {
	global: {
		plugins: [
			createTestingPinia({
				createSpy: vi.fn,
				initialState: {
					counter: { n: 20 },
					user: { name: "Leia Organa" },
				},
			}),
		],
	},
});
```

### `createTestingPinia`でPiniaプラグインを追加する

```ts
const wrapper = mount(ComponentUnderTest, {
	global: {
		plugins: [
			createTestingPinia({
				createSpy: vi.fn,
				plugins: [myPiniaPlugin],
			}),
		],
	},
});
```

### エッジケース向けのgetter上書きパターン

```ts
const pinia = createTestingPinia({ createSpy: vi.fn });
const store = useCounterStore(pinia);

store.double = 999;
// @ts-expect-error test-only reset of overridden getter
store.double = undefined;
```

### 純粋なstore単体テスト

コンポーネントを描画せずstoreの状態遷移とactionの振る舞いを検証する場合は、`createPinia()`を使った純粋なstoreテストを優先します。依存storeのstub、初期化済みテストダブル、action spyが必要な場合だけ`createTestingPinia()`を使います。

```ts
beforeEach(() => {
	setActivePinia(createPinia());
});

it("increments", () => {
	const counter = useCounterStore();
	counter.increment();
	expect(counter.n).toBe(1);
});
```

## Vue Test Utilsの方針

Vue Test Utilsのガイダンス（<https://test-utils.vuejs.org/guide/>）に従います。

- 焦点を絞った単体テストでは、デフォルトで浅くマウントする。
- 統合的な振る舞いが対象の場合だけ、コンポーネントツリー全体をmountする。
- props、ユーザーに近い操作、emitされたイベントを通して振る舞いを駆動する。
- 親の内部に触れる代わりに、子のstubイベントには`findComponent(...).vm.$emit(...)`を優先する。
- 更新が非同期の場合だけ`nextTick`を使う。
- `wrapper.emitted(...)`でemitされたイベントとpayloadをアサートする。
- DOM、emitイベント、prop、storeレベルのアサーションで振る舞いを表せない場合だけ`wrapper.vm`にアクセスする。例外として扱い、アサーションの範囲を狭く保つ。

## 主なテストスニペット

emitしてpayloadをアサートする：

```ts
await wrapper.find("button").trigger("click");
expect(wrapper.emitted("submit")?.[0]?.[0]).toBe("Mango Mission");
```

入力を更新して出力をアサートする：

```ts
await wrapper.find("input").setValue("Agent Violet");
await wrapper.find("form").trigger("submit");
expect(wrapper.emitted("save")?.[0]?.[0]).toBe("Agent Violet");
```

## テスト作成のワークフロー

1. テストする振る舞いの境界を特定する。
2. 最小限のfixtureデータを作る（その振る舞いに必要なフィールドだけ）。
3. Piniaと必要なテストダブルを設定する。
4. 公開入力を通して振る舞いを起動する。
5. 公開出力と副作用をアサートする。
6. 実装ではなく振る舞いを説明するよう、テスト名を整える。

## 制約と安全性

- private／internalな実装詳細をテストしない。
- 動的なUIの振る舞いにsnapshotを過剰利用しない。
- 1つの振る舞いだけが重要なら、大きなオブジェクトの全フィールドをアサートしない。
- 偽データは決定的にし、ランダム値を避ける。
- 上記の許容される最小構成の1つであるPiniaセットアップを誤りだと主張しない。
- テスト対象の振る舞いに追加の範囲が必要でない限り、動作しているテストを深いmountや実actionへ書き換えない。
- レビューでは、テストカバレッジ不足、壊れやすいselector、実装依存のアサーションを明示的に指摘する。

## 出力契約

- `create`または`update`では、完成したテストコードと、選択したPinia戦略を説明する短い注記を返す。
- `review`では、まず具体的な指摘を返し、その後に不足するカバレッジや壊れやすさのリスクを示す。
- 最も安全な選択が曖昧な場合は、選択したテストセットアップの根拠となった仮定を示す。

## 参照

- `references/pinia-patterns.md`
- Piniaテストクックブック: <https://pinia.vuejs.org/cookbook/testing.html>
- Vue Test Utilsガイド: <https://test-utils.vuejs.org/guide/>
