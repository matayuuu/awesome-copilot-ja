---
name: conventional-commit
description: '構造化されたXML形式を使用してConventional Commitメッセージを生成するためのプロンプトとワークフロー。手順、例、検証を含め、Conventional Commits仕様に沿った標準的で説明的なコミットメッセージの作成を支援する。'
---

### 手順

```xml
	<description>This file contains a prompt template for generating conventional commit messages. It provides instructions, examples, and formatting guidelines to help users write standardized, descriptive commit messages in accordance with the Conventional Commits specification.</description>
```

### ワークフロー

**次の手順に従ってください:**

1. `git status`を実行して変更されたファイルを確認する。
2. `git diff`または`git diff --cached`を実行して変更内容を調べる。
3. `git add <file>`で変更をステージする。
4. 次のXML構造を使用してコミットメッセージを組み立てる。
5. コミットメッセージの生成後、Copilotは統合ターミナルで次のコマンドを自動実行する（確認不要）:

```bash
git commit -m "type(scope): description"
```

6. このプロンプトを実行するだけで、Copilotがターミナルでコミットを処理する。

### コミットメッセージの構造

```xml
<commit-message>
	<type>feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert</type>
	<scope>()</scope>
	<description>A short, imperative summary of the change</description>
	<body>(optional: more detailed explanation)</body>
	<footer>(optional: e.g. BREAKING CHANGE: details, or issue references)</footer>
</commit-message>
```

### 例

```xml
<examples>
	<example>feat(parser): add ability to parse arrays</example>
	<example>fix(ui): correct button alignment</example>
	<example>docs: update README with usage instructions</example>
	<example>refactor: improve performance of data processing</example>
	<example>chore: update dependencies</example>
	<example>feat!: send email on registration (BREAKING CHANGE: email service required)</example>
</examples>
```

### 検証

```xml
<validation>
	<type>Must be one of the allowed types. See <reference>https://www.conventionalcommits.org/en/v1.0.0/#specification</reference></type>
	<scope>Optional, but recommended for clarity.</scope>
	<description>Required. Use the imperative mood (e.g., "add", not "added").</description>
	<body>Optional. Use for additional context.</body>
	<footer>Use for breaking changes or issue references.</footer>
</validation>
```

### 最終ステップ

```xml
<final-step>
	<cmd>git commit -m "type(scope): description"</cmd>
	<note>Replace with your constructed message. Include body and footer if needed.</note>
</final-step>
```
