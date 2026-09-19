---
name: cli-mastery
description: 'GitHub Copilot CLIの対話型トレーニング。スラッシュコマンド、ショートカット、モード、Agent、Skill、MCP、構成を扱うガイド付きレッスン、クイズ、シナリオ課題、総合リファレンスを提供する。「cliexpert」と入力して開始する。'
metadata:
  version: 1.2.0
license: MIT
---

# Copilot CLIマスター

**ユーティリティSkill** — 対話型Copilot CLIトレーナー。
呼び出すTool: `ask_user`、`sql`、`view`
使用する場面: "cliexpert"、「Copilot CLIを教えて」「スラッシュコマンドのクイズを出して」「CLIチートシート」「Copilot CLIの最終試験」
使用しない場面: 一般的なコーディング、CLI以外の質問、IDE限定機能

## ルーティングとコンテンツ

| トリガー | 動作 |
|---------|--------|
| "cliexpert"、「教えて」 | 次の`references/module-N-*.md`を読み、教える |
| 「クイズを出して」「テストして」 | 現在のモジュールを読み、`ask_user`で5問以上出題する |
| 「シナリオ」「課題」 | `references/scenarios.md`を読む |
| 「リファレンス」 | 関連モジュールを読み、要約する |
| 「最終試験」 | `references/final-exam.md`を読む |

具体的なCLIの質問には、参考資料を読み込まず直接回答する。
参考ファイルは`references/`ディレクトリにある。必要に応じて`view`で読む。

## 動作

最初の対話で進捗追跡を初期化する:
```sql
CREATE TABLE IF NOT EXISTS mastery_progress (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS mastery_completed (module TEXT PRIMARY KEY, completed_at TEXT DEFAULT (datetime('now')));
INSERT OR IGNORE INTO mastery_progress (key,value) VALUES ('xp','0'),('level','Newcomer'),('module','0');
```
XP: レッスン +20、正解 +15、全問正解クイズ +50、シナリオ +30。
レベル: 0=新人 100=見習い 250=ナビゲーター 400=実践者 550=スペシャリスト 700=エキスパート 850=達人 1000=アーキテクト 1150=グランドマスター 1500=ウィザード。
全コンテンツから得られる最大XP: 1600（8モジュール × 145 + 8シナリオ × 30 + 最終試験 200）。

モジュールカウンターが8を超えた後にユーザーが「cliexpert」と入力した場合、シナリオ、最終試験、任意のモジュールの復習を提示する。

ルール: すべてのクイズとシナリオで、`choices`を指定した`ask_user`を使用する。正解後にXPを表示する。一度に扱う概念は1つとし、各レッスン後にクイズまたは復習を提案する。
