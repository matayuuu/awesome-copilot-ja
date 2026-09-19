---
name: markstream-install
description: 'Markstream のストリーミング Markdown レンダラーを Vue、React、Svelte、Angular、Nuxt、Vue 2 アプリケーションにインストールして構成する。パッケージ選択、最小限の peer dependencies、CSS の順序、SSR の境界、ストリーミングモード、レンダラー設定に使用する。'
license: MIT
compatibility: 'JavaScript or TypeScript frontend project using Vue 3, Nuxt 3/4, Vue 2.6/2.7, React 18+, Next.js, Angular 20+, or Svelte 5.'
metadata:
  source: https://github.com/Simon-He95/markstream-vue
  documentation: https://markstream.simonhe.me/
---

# Markstream をインストール

[Markstream](https://github.com/Simon-He95/markstream-vue) の適切なパッケージを既存アプリケーションに組み込み、不必要なオプション依存関係を導入したり、セキュリティ上の既定値を弱めたりしないようにする。

パッケージや peer を選ぶ前に [references/scenarios.md](references/scenarios.md) を確認する。

## いつ使うか

次のような依頼があったときにこのスキルを使う:

- AI チャットやドキュメントインターフェイスにストリーミング Markdown レンダリングを追加する;
- Vue、Nuxt、React、Next.js、Svelte、Angular、Vue 2 に Markstream をインストールする;
- 壊れた Markstream の導入、スタイル不足、SSR の失敗を修復する;
- 別の Markdown レンダラーを Markstream に置き換える;
- static、smooth-streaming、外部解析 AST 入力のいずれを選ぶか決める。

## ワークフロー

### 1. ホストアプリケーションを確認する

依存関係を変更する前に、次を確認する:

- `package.json` のフレームワークとバージョン;
- パッケージマネージャのロックファイル;
- アプリケーションが SSR を使うかどうか;
- reset、Tailwind、UnoCSS、デザインシステムのスタイル;
- 必要なオプション機能: コードハイライト、強化された File/Diff サーフェイス、Monaco、Mermaid、D2、インフォグラフィックブロック、KaTeX。

ソースリポジトリの名前が `markstream-vue` だからといって、Vue 向けパッケージが正しいと決めつけない。シナリオ表からフレームワーク固有のパッケージを選ぶ。

### 2. 最小限の依存関係をインストールする

フレームワーク向けパッケージを 1 つだけインストールする。依頼された UI がその機能を使う場合にのみ、任意の peer を追加する。

例:

```bash
npm install markstream-vue
npm install markstream-react
npm install markstream-svelte
npm install markstream-angular
npm install markstream-vue2
```

既存のパッケージマネージャを維持する。不要なオプション peer を前もって一括で入れない。

### 3. CSS を正しい順序で読み込む

Markstream のスタイルより先にアプリケーションの reset をインポートする。パッケージの CSS は明示的にインポートし、コンポーネントの import によって自動注入されることに依存しない。

Tailwind または UnoCSS を使う場合は、コンポーネントレイヤーで該当するパッケージのサブパスを使う:

```css
@import 'markstream-vue/index.css' layer(components);
```

React、Svelte、Angular、Vue 2 には対応するパッケージ名を使う。数式レンダリングを有効にする場合は、次もインポートする:

```css
@import 'katex/dist/katex.min.css';
```

Vue CLI 4 や他の Webpack 4 ベースの Vue 2 アプリケーションでは、パッケージの export map を解決できない。そのようなプロジェクトでは、公開済みファイルを直接 import する:

```ts
import 'markstream-vue2/dist/index.css'
```

### 4. 最小限で動作するレンダラーを追加する

静的ドキュメントやほとんどのストリーミングチャットインターフェイスでは `content` を優先する。Markstream の組み込み smooth streaming は、ホスト側が AST を維持しなくても、不規則なトークン配信のペースを調整できる。

Vue 3 のチャット画面では、まず次から始める:

```vue
<MarkdownRender
  mode="chat"
  :content="markdown"
  :final="false"
  smooth-streaming="auto"
  :fade="false"
  typewriter
/>
```

完了したチャット履歴では、同じレンダラーモードを維持したまま、ペーシングをオフにする:

```vue
<MarkdownRender
  mode="chat"
  :content="markdown"
  :final="true"
  :smooth-streaming="false"
  :fade="true"
  :typewriter="false"
/>
```

React、Svelte、Angular では、同等の camelCase やフレームワークのバインディング構文を使う。ストリーミング中は `smoothStreaming="auto"`、`fade=false`、`typewriter=true` を維持し、完了した履歴では `smoothStreaming=false` と `typewriter=false` を使う。

`nodes` と `final` を使うのは、ワーカー、共有 AST ストア、カスタム変換、別のアプリケーション層がすでに解析を担当している場合だけに限定する。

### 5. フレームワーク固有の境界を扱う

- Nuxt では、ブラウザ専用の任意 peer を client の境界の内側に置く。
- Next.js では、ライブ SSE や WebSocket ストリームに対して `'use client'` コンポーネント内でルートの `markstream-react` を使う。SSR を前提とした HTML と hydration には `markstream-react/next`、サーバー専用レンダリングには `markstream-react/server` を使う。
- `markstream-svelte` は Svelte 5 のときだけ使う。
- Angular アプリケーションが現在の `markstream-angular` バージョン要件を満たしていることを確認する。
- Vue 3 では、AI チャットには `mode="chat"`、リッチドキュメントには `mode="docs"`、軽量な非チャット画面には `mode="minimal"` を使う。
- 長い Vue 3 会話や既存のメッセージ virtualizer がある場合は、2 つ目の virtualizer を追加する前に Markstream のパフォーマンスガイドを確認する。

### 6. 安全な既定値を保つ

HTML ポリシーは既定で `safe` であり、Mermaid は strict mode を使う。ユーザーがその設定が必要な信頼できる従来の画面を明示しない限り、どちらも広げない。例外はその画面にのみ限定する。

### 7. 検証する

最小限の関連する build、typecheck、test コマンドを実行する。次を確認する:

1. 選択したパッケージがフレームワークに一致している;
2. 追加したオプション peer が依頼されたものだけである;
3. スタイルが reset の後に読み込まれている;
4. SSR ページでブラウザ専用 peer がサーバー上で評価されない;
5. 静的コンテンツと少なくとも 1 回の増分更新が正しくレンダリングされる。

選択したパッケージ、追加した peer、CSS の配置場所、ストリーミング入力の選択、検証コマンドを報告する。

## 公式リファレンス

- [Installation](https://markstream.simonhe.me/guide/installation)
- [AI chat and streaming](https://markstream.simonhe.me/guide/ai-chat-streaming)
- [Performance](https://markstream.simonhe.me/guide/performance)
- [Troubleshooting](https://markstream.simonhe.me/guide/troubleshooting)
- [Component overrides](https://markstream.simonhe.me/guide/component-overrides)
