---
description: 'Node.js の生成スクリプトと Astro サイトを、既存の構成と検証コマンドに従って変更する。'
applyTo: 'eng/**/*.mjs, scripts/**/*.mjs, website/**/*.{ts,tsx,astro,mjs}'
---

# Node.js と Website

- Node.js のスクリプトは既存の ES modules、Node 標準 API、テストの記述スタイルに合わせる。依存を追加する前に、標準 API または既存依存で解決できないか確認する。
- `eng/` の変更では、生成物の直接編集ではなく生成元を変更する。カタログまたは生成処理に影響する変更は `npm run build` で検証する。
- `website/` では既存の Astro、React、TypeScript コンポーネントとデザイン規約を再利用する。表示ラベル、フォーム、操作要素を変更する場合は、既存のアクセシブルな名前とキーボード操作を維持する。
- Website のビルド結果に影響する変更は `npm run website:build` を実行する。アクセシビリティ監査に関係する変更では、必要に応じて `npm run website:a11y` を実行する。
- 依存を変更したときは、該当する `package.json` と `package-lock.json` を同じ package manager 操作で更新する。
