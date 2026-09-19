---
name: javascript-typescript-jest
description: 'モック戦略、テスト構成、一般的なパターンを含む、Jestを使ったJavaScript/TypeScriptテスト作成のベストプラクティス。'
---

### テスト構成
- テストファイル名には `.test.ts` または `.test.js` 接尾辞を付ける。
- テスト対象のコードの隣、または専用の `__tests__` ディレクトリにテストファイルを置く。
- 期待する振る舞いを説明する、分かりやすいテスト名を使う。
- ネストしたdescribeブロックで関連するテストを整理する。
- 次のパターンに従う: `describe('Component/Function/Class', () => { it('should do something', () => {}) })`

### 効果的なモック
- テストを分離するため、外部依存（API、データベースなど）をモックする。
- モジュール単位のモックには `jest.mock()` を使う。
- 特定の関数のモックには `jest.spyOn()` を使う。
- モックの振る舞いを定義するには `mockImplementation()` または `mockReturnValue()` を使う。
- `afterEach` で `jest.resetAllMocks()` を使い、テスト間でモックをリセットする。

### 非同期コードのテスト
- テストでは常にPromiseを返すか、async/await構文を使う。
- Promiseには `resolves`/`rejects` マッチャーを使う。
- 遅いテストには `jest.setTimeout()` で適切なタイムアウトを設定する。

### スナップショットテスト
- 変更頻度の低いUIコンポーネントや複雑なオブジェクトにはスナップショットテストを使う。
- スナップショットは小さく、焦点を絞る。
- スナップショットの変更を慎重にレビューしてからコミットする。

### Reactコンポーネントのテスト
- コンポーネントのテストにはEnzymeよりReact Testing Libraryを使う。
- ユーザーの振る舞いとコンポーネントのアクセシビリティをテストする。
- アクセシビリティロール、ラベル、またはテキスト内容で要素を検索する。
- より現実的なユーザー操作には `fireEvent` より `userEvent` を使う。

## よく使うJestマッチャー
- 基本: `expect(value).toBe(expected)`、`expect(value).toEqual(expected)`
- 真偽値: `expect(value).toBeTruthy()`、`expect(value).toBeFalsy()`
- 数値: `expect(value).toBeGreaterThan(3)`、`expect(value).toBeLessThanOrEqual(3)`
- 文字列: `expect(value).toMatch(/pattern/)`、`expect(value).toContain('substring')`
- 配列: `expect(array).toContain(item)`、`expect(array).toHaveLength(3)`
- オブジェクト: `expect(object).toHaveProperty('key', value)`
- 例外: `expect(fn).toThrow()`、`expect(fn).toThrow(Error)`
- モック関数: `expect(mockFn).toHaveBeenCalled()`、`expect(mockFn).toHaveBeenCalledWith(arg1, arg2)`
