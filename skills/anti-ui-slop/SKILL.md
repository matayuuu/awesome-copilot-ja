---
name: anti-ui-slop
description: 'コーディングエージェントが汎用的なUIを出荷しないようにします。UIZZEの実在する80万以上のWeb・iOS画面を使って製品固有のインターフェイスを構築し、デザイン契約を定義し、必要な状態を網羅して厳格な完了ゲートを実行します。Codex、Claude Code、Cursor、CopilotなどのコーディングエージェントでWebまたはiOSのインターフェイスを設計、実装、再設計、批評、出荷前レビューするときに使用します。「anti-ui-slop」、「stop UI slop」、「ground this UI in real screens」、「run the UI finish gate」で起動します。'
license: MIT
metadata:
  version: "1.2.13"
  author: "UIZZE <business@uizze.com>"
  compatibility: "Claude Code、Codex、Cursor、GitHub Copilot 向けに設計されています。プロジェクトファイルの読み取りと URL の取得ができる任意のエージェントで動作します。"
  tags: "ui-design, design-system, design-review, frontend, web-ui, ios-ui"
---

> **AIコーディングエージェントが汎用的なUIを出荷しないようにします。**

# UIの凡庸化を止める

[UIZZE](https://uizze.com) を通じて、実在する80万以上のWeb・iOS画面を活用した製品固有のUIを構築します。

![UIZZEでUIの凡庸化を止める](https://uizze.com/landing/anti-ui-slop-skill-banner.png)

## 概要

製品概要、既存UI、コンポーネント、ローカルのデザインシステムを利用して、意図のあるインターフェイスを作成します。Uizze は焦点を絞ったデザインガイダンスと、必要に応じて少数の関連する視覚的参照を提供します。

## 前提条件

- 構築、再設計、レビューする画面またはコンポーネント（ファイルパスまたは簡単な説明）。
- 新しいシステムを発明するのではなく拡張できるよう、製品の既存コンポーネント、デザイントークン、視覚言語。
- 焦点を絞った参照資料とホストされた素材のための、有料 Uizze MCP への任意のアクセス。

## 認証

- 無料のスキルと公開カタログは、アカウント、トークン、MCP接続、依存関係、スクリプト、実行可能ファイルなしで動作します。
- 任意の完全版 UIZZE MCP は、ホストの通常の接続・認証フローを使用することがあります。実際のホスト結果がない限り、接続済みであると主張してはいけません。

## 製品を起点にする

設計前に、概要、既存UI、コンポーネント、トークン、制約を読みます。これらは常にこのスキルより優先されます。馴染みのある操作規則を保ち、製品固有のオブジェクト、ワークフロー、優先順位を視覚的に明確にします。目新しさだけを目的に追加してはいけません。

## プレイブックを1つ読み込む

現在の依頼には、次のうち最大1ファイルを選びます。

- 新しいインターフェイスまたは大規模な再設計: `reference/new-work.md`
- 製品またはダッシュボードの作業: `reference/operate.md`
- 改良と仕上げ: `reference/polish.md`
- 簡素化または要約: `reference/distill.md`
- 明示的な監査: `reference/audit.md`
- ネイティブ iOS 作業: `reference/ios.md`

2つ目のプレイブックを読み込んではいけません。例をチェックリストとして扱うのではなく、判断して適用します。

## 任意のUizze根拠

有料 MCP を使用する前に `references/uizze-reference-policy.md` を読みます。公開されるのは `find_ui_references` と `find_ui_materials` のみです。具体的で未解決の視覚的または素材に関する問いが、根拠によって改善される場合にのみ使用します。何も返されなければ、何も言わずに続行します。

## 完了

依頼された範囲を完了します。環境が対応している場合は、一度レンダリングして確認します。クリッピング、重なり、歪んだメディア、アクセスできないコントロール、反応しない操作などの観測可能な不具合を修正します。引き継ぎは簡潔にします。
