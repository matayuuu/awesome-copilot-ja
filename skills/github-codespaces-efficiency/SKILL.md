---
name: github-codespaces-efficiency
description: GitHub Codespacesの効率を監査・改善する。Codespacesの起動を高速化したい、Codespacesの支出を削減したい、スリムなdevcontainerを作りたい、マシンサイズを適正化したい、アイドルタイムアウトを調整したい、または継続的な利用実績に基づいてprebuildの対象ブランチを絞りたい場合に使用する。
---

# GitHub Codespaces Efficiency

GitHub Codespacesの効率改善作業への簡潔な入口として、このSkillを使用する。リポジトリを調査し、無駄を特定して、必要な参照だけを読み込みながら進める。

`.devcontainer/`がまだ存在しない場合は、[`references/codespaces.md`](./references/codespaces.md)を読み込み、以下の手順へ進む前にベースラインを定義する。

## このSkillを使用する場面

- Codespacesの起動を高速化したい、またはCodespacesの支出を削減したい場合。
- リポジトリに`.devcontainer/`がある、またはCodespacesの明示的な設定について質問している場合。
- devcontainerの最適化、マシンサイズ、prebuild戦略、アイドルタイムアウトについて質問している場合。
- 初めてCodespacesを設定する、または新しい`.devcontainer/`をゼロから作成する必要がある場合。

## 必要なものだけを読み込む

- [`references/codespaces.md`](./references/codespaces.md) — devcontainer、マシンサイズ、prebuild、アイドルタイムアウトに関する指針と報告。
- [`references/review-rubric.md`](./references/review-rubric.md) — レビューを行う場合だけ読み込む。

## 基本ワークフロー

### 1. まず測定する

```bash
find .devcontainer -maxdepth 2 -type f
gh codespace list
repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
gh api "/repos/$repo/codespaces/machines"
```

`gh`認証に失敗した場合、またはユーザーにリポジトリ管理者スコープがない場合は、`.devcontainer/`ファイルの静的分析を行う。マシンタイプとprebuildに関する推奨は未検証として示す。

次を確認する：2 GBを超えるdevcontainerイメージ、または10個を超えるfeature、利用データが示す必要量より大きいマシンタイプ、`devcontainer-lock.json`の欠落（追加を推奨する — 多くのリポジトリはlock-fileのサポートより前に作られている）、広すぎるprebuildの対象、利用パターンと合わないアイドルタイムアウト。

### 2. ガードレールを適用する

提案する各修正について、推奨する前に次の規則に照らして確認する。

1. チームが毎日使うツールを削除しない — 必須の開発ツールや拡張機能を削る修正は除外する。
2. 常に小さいほどよいとは仮定しない — マシンコストと開発者体験／スループットのバランスを取る。
3. devcontainerを本番イメージにしない — チームが明示的に必要としない限り、本番専用の依存関係を追加する修正は除外する。
4. 段階的な変更を優先する — `.devcontainer/`がない場合だけグリーンフィールドのベースラインを適用し、既存設定を再構成する変更は除外せず指摘する。
5. リポジトリの変更と組織設定を分離する — リポジトリで編集可能なファイルと組織レベルまたはユーザーレベルのCodespaces設定を混ぜる修正は、2つの別々の推奨事項に分ける。

### 3. 上位3つの修正を選ぶ

下記の6候補から、手順1の監査証拠で裏付けられ、手順2のすべてのガードレールに合格するものだけを残す。生き残った候補を、推定月間コスト削減額（USD）の順に並べる。最大3件まで、両方の条件を満たす候補をすべて選ぶ。

1. devcontainerを削減する — 日常の開発作業に不要なfeature、パッケージ、拡張機能を削除し、イメージを2 GB未満、featureを10個未満にすることを目標とする
2. マシンタイプを適正化する — 観測した利用パターンに合わせる。データがない場合は、仮定を明示する
3. prebuildの対象を絞る — デフォルトブランチ、過去14日間に活動した`release/*`ブランチ、週5回を超えるCodespacesがあるブランチで有効にし、それ以外では無効にする
4. アイドルタイムアウトを調整する — デフォルトは30分、ほとんどのセッションが30分前に終了するなら15分、ほとんどのセッションがそれより長く続くなら60分
5. 未使用の拡張機能またはポート転送ルールを削除する
6. devcontainerイメージのサイズを削減し、レイヤーキャッシュを改善する

### 4. 検証する

- テスト用Codespaceを起動し、devcontainerの変更が期待どおりにビルド・起動することを確認する。
- テレメトリが利用できる場合は、観測した利用状況に対してマシンサイズを検証する。利用できない場合は未検証として示す。
- 設定が正しく見える場合でも、予期しないビルドまたは起動の失敗は実際のバグとして扱う。

## 必須の出力

**無駄の原因：** [コストまたは起動時間への主な要因]

**提案する修正：** [監査証拠で裏付けられ、ガードレールに合格した上位3つの変更]

**検証：** [ライブで実証済み / 静的分析のみ / 残存リスク]

**影響：**
- 起動時間：[予想] / [利用可能なら測定値]
- 月間支出：[予想] / [利用可能なら測定値]
- リソース使用率：[予想] / [利用可能なら測定値]

## 参照

- [`references/codespaces.md`](./references/codespaces.md)
- [`references/review-rubric.md`](./references/review-rubric.md) — 完了した効率改善をレビューするときに読み込む
