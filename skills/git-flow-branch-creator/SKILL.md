---
name: git-flow-branch-creator
description: 'git status/diff を分析して、nvie Git Flow のブランチモデルに沿って適切なブランチを作成する、インテリジェントな Git Flow ブランチ作成ツール。'
---

### ルール

```xml
<instructions>
	<title>Git Flow Branch Creator</title>
	<description>このプロンプトは、git status と git diff（または git diff --cached）を使って現在の git 変更を分析し、Git Flow ブランチモデルに従って適切なブランチ種別を判断し、意味のあるブランチ名を作成します。</description>
	<note>
		このプロンプトを実行すると、Copilot が変更を分析して適切な Git Flow ブランチを自動的に作成します。
	</note>
</instructions>
```

### ワークフロー

**次の手順に従ってください:**

1. `git status` を実行して、現在のリポジトリ状態と変更ファイルを確認する。
2. `git diff`（未ステージ変更用）または `git diff --cached`（ステージ済み変更用）を実行して、変更の性質を分析する。
3. 下記の Git Flow Branch Analysis Framework を使って変更を分析する。
4. 分析結果に基づいて適切なブランチ種別を決定する。
5. Git Flow 規約に従って意味のあるブランチ名を生成する。
6. ブランチを作成して自動的に切り替える。
7. 分析結果と次のアクションの要約を提供する。

### Git Flow Branch Analysis Framework

```xml
<analysis-framework>
	<branch-types>
		<feature>
			<purpose>新機能、機能強化、重要でない改善</purpose>
			<branch-from>develop</branch-from>
			<merge-to>develop</merge-to>
			<naming>feature/descriptive-name または feature/ticket-number-description</naming>
			<indicators>
				<indicator>新しい機能の追加</indicator>
				<indicator>UI/UX の改善</indicator>
				<indicator>新しい API エンドポイントやメソッド</indicator>
				<indicator>データベーススキーマの追加（非破壊的）</indicator>
				<indicator>新しい設定オプション</indicator>
				<indicator>性能改善（重要でない）</indicator>
			</indicators>
		</feature>

		<release>
			<purpose>リリース準備、バージョン更新、最終テスト</purpose>
			<branch-from>develop</branch-from>
			<merge-to>develop AND master</merge-to>
			<naming>release-X.Y.Z</naming>
			<indicators>
				<indicator>バージョン番号の変更</indicator>
				<indicator>ビルド設定の更新</indicator>
				<indicator>ドキュメントの最終化</indicator>
				<indicator>リリース前の小さな不具合修正</indicator>
				<indicator>リリースノートの更新</indicator>
				<indicator>依存関係バージョンの固定</indicator>
			</indicators>
		</release>

		<hotfix>
			<purpose>即時デプロイが必要な重大な本番不具合修正</purpose>
			<branch-from>master</branch-from>
			<merge-to>develop AND master</merge-to>
			<naming>hotfix-X.Y.Z または hotfix/critical-issue-description</naming>
			<indicators>
				<indicator>セキュリティ脆弱性の修正</indicator>
				<indicator>重大な本番環境の不具合</indicator>
				<indicator>データ破損の修正</indicator>
				<indicator>サービス停止の回復</indicator>
				<indicator>緊急の設定変更</indicator>
			</indicators>
		</hotfix>
	</branch-types>
</analysis-framework>
```

### ブランチ命名規約

```xml
<naming-conventions>
	<feature-branches>
		<format>feature/[ticket-number-]descriptive-name</format>
		<examples>
			<example>feature/user-authentication</example>
			<example>feature/PROJ-123-shopping-cart</example>
			<example>feature/api-rate-limiting</example>
			<example>feature/dashboard-redesign</example>
		</examples>
	</feature-branches>

	<release-branches>
		<format>release-X.Y.Z</format>
		<examples>
			<example>release-1.2.0</example>
			<example>release-2.1.0</example>
			<example>release-1.0.0</example>
		</examples>
	</release-branches>

	<hotfix-branches>
		<format>hotfix-X.Y.Z OR hotfix/critical-description</format>
		<examples>
			<example>hotfix-1.2.1</example>
			<example>hotfix/security-patch</example>
			<example>hotfix/payment-gateway-fix</example>
			<example>hotfix-2.1.1</example>
		</examples>
	</hotfix-branches>
</naming-conventions>
```

### 分析プロセス

```xml
<analysis-process>
	<step-1>
		<title>変更の性質分析</title>
		<description>変更されたファイル種別と変更内容の性質を調べる</description>
		<criteria>
			<files-modified>ファイル拡張子、ディレクトリ構造、目的を確認する</files-modified>
			<change-scope>変更が追加的、修正的、準備的なものかを判断する</change-scope>
			<urgency-level>変更が重大な問題の解決なのか、開発的な改善なのかを評価する</urgency-level>
		</criteria>
	</step-1>

	<step-2>
		<title>Git Flow 分類</title>
		<description>変更を適切な Git Flow ブランチ種別にマッピングする</description>
		<decision-tree>
			<question>本番環境に対する重要な修正ですか？</question>
			<if-yes>hotfix ブランチを検討する</if-yes>
			<if-no>
				<question>これらはリリース準備の変更ですか？（バージョン更新、最終調整）</question>
				<if-yes>release ブランチを検討する</if-yes>
				<if-no>feature ブランチをデフォルトとする</if-no>
			</if-no>
		</decision-tree>
	</step-2>

	<step-3>
		<title>ブランチ名生成</title>
		<description>意味のある説明的なブランチ名を作成する</description>
		<guidelines>
			<use-kebab-case>小文字でハイフン区切りにする</use-kebab-case>
			<be-descriptive>目的が明確に分かる名前にする</be-descriptive>
			<include-context>可能ならチケット番号やプロジェクト文脈を含める</include-context>
			<keep-concise>長すぎる名前は避ける</keep-concise>
		</guidelines>
	</step-3>
</analysis-process>
```

### エッジケースと検証

```xml
<edge-cases>
	<mixed-changes>
		<scenario>変更に feature と bug fix の両方が含まれる</scenario>
		<resolution>最も重要な変更の種類を優先するか、複数ブランチに分割することを提案する</resolution>
	</mixed-changes>

	<no-changes>
		<scenario>git status/diff で変更が検出されない</scenario>
		<resolution>ユーザーに通知し、git status を確認するか、まず変更を行うよう案内する</resolution>
	</no-changes>

	<existing-branch>
		<scenario>既に feature/hotfix/release ブランチ上にいる</scenario>
		<resolution>新しいブランチが必要か、現在のブランチが適切かを分析する</resolution>
	</existing-branch>

	<conflicting-names>
		<scenario>提案したブランチ名が既に存在する</scenario>
		<resolution>連番サフィックスを付けるか、代替名を提案する</resolution>
	</conflicting-names>
</edge-cases>
```

### 例示

```xml
<examples>
	<example-1>
		<scenario>新しいユーザー登録 API エンドポイントを追加した</scenario>
		<analysis>新機能、追加的変更、重大ではない</analysis>
		<branch-type>feature</branch-type>
		<branch-name>feature/user-registration-api</branch-name>
		<command>git checkout -b feature/user-registration-api develop</command>
	</example-1>

	<example-2>
		<scenario>認証における重大なセキュリティ脆弱性を修正した</scenario>
		<analysis>セキュリティ修正、プロダクションで重大、即時デプロイが必要</analysis>
		<branch-type>hotfix</branch-type>
		<branch-name>hotfix/auth-security-patch</branch-name>
		<command>git checkout -b hotfix/auth-security-patch master</command>
	</example-2>

	<example-3>
		<scenario>バージョンを 2.1.0 に更新し、リリースノートを最終化した</scenario>
		<analysis>リリース準備、バージョン更新、ドキュメント</analysis>
		<branch-type>release</branch-type>
		<branch-name>release-2.1.0</branch-name>
		<command>git checkout -b release-2.1.0 develop</command>
	</example-3>

	<example-4>
		<scenario>データベースクエリの性能を改善し、キャッシュを更新した</scenario>
		<analysis>性能改善、重大ではない機能強化</analysis>
		<branch-type>feature</branch-type>
		<branch-name>feature/database-performance-optimization</branch-name>
		<command>git checkout -b feature/database-performance-optimization develop</command>
	</example-4>
</examples>
```

### 検証チェックリスト

```xml
<validation>
	<pre-analysis>
		<check>リポジトリがクリーンな状態である（競合を起こす未コミット変更がない）</check>
		<check>現在のブランチが適切な開始点である（feature/release は develop、hotfix は master）</check>
		<check>リモートリポジトリが最新である</check>
	</pre-analysis>

	<analysis-quality>
		<check>変更分析が修正ファイルをすべてカバーしている</check>
		<check>ブランチ種別の選定が Git Flow の原則に従っている</check>
		<check>ブランチ名が意味があり、規約に従っている</check>
		<check>エッジケースが考慮され、適切に処理されている</check>
	</analysis-quality>

	<execution-safety>
		<check>対象ブランチ（develop/master）が存在し、アクセス可能である</check>
		<check>提案したブランチ名が既存ブランチと競合しない</check>
		<check>ユーザーがブランチ作成に対して適切な権限を持っている</check>
	</execution-safety>
</validation>
```

### 最終実行

```xml
<execution-protocol>
	<analysis-summary>
		<git-status>git status コマンドの出力</git-status>
		<git-diff>git diff の関連部分の出力</git-diff>
		<change-analysis>変更が何を意味するかの詳細分析</change-analysis>
		<branch-decision>なぜそのブランチ種別を選んだのかの説明</branch-decision>
	</analysis-summary>

	<branch-creation>
		<command>git checkout -b [branch-name] [source-branch]</command>
		<confirmation>ブランチ作成と現在のブランチ状態を確認する</confirmation>
		<next-steps>次の行動（コミット、ブランチの push など）のガイダンスを提供する</next-steps>
	</branch-creation>

	<fallback-options>
		<alternative-names>主案が適切でない場合は 2〜3 個の代替ブランチ名を提案する</alternative-names>
		<manual-override>分析が誤っている場合、ユーザーが別のブランチ種別を指定できるようにする</manual-override>
	</fallback-options>
</execution-protocol>
```

### Git Flow 参照

```xml
<gitflow-reference>
	<main-branches>
		<master>本番環境向けコード、すべてのコミットがリリースとなる</master>
		<develop>機能開発の統合ブランチ、最新の開発変更を含む</develop>
	</main-branches>

	<supporting-branches>
		<feature>develop から分岐し、develop にマージする</feature>
		<release>develop から分岐し、develop と master の両方にマージする</release>
		<hotfix>master から分岐し、develop と master の両方にマージする</hotfix>
	</supporting-branches>

	<merge-strategy>
		<flag>履歴を保持するために常に --no-ff フラグを使う</flag>
		<tagging>master ブランチでリリースにタグを付ける</tagging>
		<cleanup>マージが成功した後にブランチを削除する</cleanup>
	</merge-strategy>
</gitflow-reference>
```
