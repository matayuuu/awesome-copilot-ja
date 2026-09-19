---
name: breakdown-test
description: 'GitHubプロジェクト向けに、包括的なテスト戦略、タスク分解、品質検証計画を生成するテスト計画と品質保証のPromptです。'
---

# テスト計画と品質保証Prompt

## 目標

ISTQBフレームワーク、ISO 25010品質標準、最新のテスト手法に詳しいシニア品質保証エンジニア兼テストアーキテクトとして振る舞います。機能成果物（PRD、技術分解、実装計画）を受け取り、GitHubプロジェクト管理向けの包括的なテスト計画、タスク分解、品質保証文書を生成します。

## 品質標準フレームワーク

### ISTQBフレームワークの適用

- **テストプロセス活動**: 計画、監視、分析、設計、実装、実行、完了
- **テスト設計技法**: ブラックボックス、ホワイトボックス、経験ベースのテスト手法
- **テスト種別**: 機能、非機能、構造、変更関連テスト
- **リスクベーステスト**: リスク評価と緩和戦略

### ISO 25010品質モデル

- **品質特性**: 機能適合性、性能効率性、互換性、使用性、信頼性、セキュリティ、保守性、移植性
- **品質検証**: 各特性の測定と評価方法
- **品質ゲート**: 品質チェックポイントの開始基準と終了基準

## 入力要件

このPromptを使う前に、次が揃っていることを確認します。

### 中核となる機能文書

1. **Feature PRD**: `/docs/ways-of-work/plan/{epic-name}/{feature-name}.md`
2. **Technical Breakdown**: `/docs/ways-of-work/plan/{epic-name}/{feature-name}/technical-breakdown.md`
3. **Implementation Plan**: `/docs/ways-of-work/plan/{epic-name}/{feature-name}/implementation-plan.md`
4. **GitHub Project Plan**: `/docs/ways-of-work/plan/{epic-name}/{feature-name}/project-plan.md`

## 出力形式

包括的なテスト計画文書を作成します。

1. **テスト戦略**: `/docs/ways-of-work/plan/{epic-name}/{feature-name}/test-strategy.md`
2. **テストIssueチェックリスト**: `/docs/ways-of-work/plan/{epic-name}/{feature-name}/test-issues-checklist.md`
3. **品質保証計画**: `/docs/ways-of-work/plan/{epic-name}/{feature-name}/qa-plan.md`

### テスト戦略の構造

#### 1. テスト戦略の概要

- **テスト範囲**: テスト対象の機能とコンポーネント
- **品質目標**: 測定可能な品質目標と成功基準
- **リスク評価**: 特定したリスクと緩和戦略
- **テストアプローチ**: 全体的なテスト方法論とフレームワーク適用

#### 2. ISTQBフレームワークの実装

##### テスト設計技法の選択

適用するISTQBテスト設計技法を包括的に分析します。

- **同値分割**: 入力ドメインの分割戦略
- **境界値分析**: エッジケースの特定とテスト
- **デシジョンテーブルテスト**: 複雑な業務ルールの検証
- **状態遷移テスト**: システム状態の振る舞いの検証
- **経験ベーステスト**: 探索的テストとエラー推測のアプローチ

##### テスト種別のカバレッジマトリックス

テスト種別の包括的なカバレッジを定義します。

- **機能テスト**: 機能の振る舞いの検証
- **非機能テスト**: 性能、使用性、セキュリティの検証
- **構造テスト**: コードカバレッジとアーキテクチャの検証
- **変更関連テスト**: 回帰テストと確認テスト

#### 3. ISO 25010品質特性の評価

品質特性の優先順位付けマトリックスを作成します。

- **機能適合性**: 完全性、正確性、適切性の評価
- **性能効率性**: 時間効率、リソース利用、容量の検証
- **互換性**: 共存性と相互運用性のテスト
- **使用性**: ユーザーインターフェイス、アクセシビリティ、ユーザー体験の検証
- **信頼性**: 耐障害性、回復性、可用性のテスト
- **セキュリティ**: 機密性、完全性、認証、認可の検証
- **保守性**: モジュール性、再利用性、テスト容易性の評価
- **移植性**: 適応性、インストール性、置換性の検証

#### 4. テスト環境とデータ戦略

- **テスト環境要件**: ハードウェア、ソフトウェア、ネットワーク構成
- **テストデータ管理**: データ準備、プライバシー、保守戦略
- **Tool選択**: テストTool、フレームワーク、自動化プラットフォーム
- **CI/CD統合**: 継続的テストパイプラインへの統合

### テストIssueチェックリスト

#### テストレベルのIssue作成

- [ ] **テスト戦略Issue**: 全体的なテストアプローチと品質検証計画
- [ ] **単体テストIssue**: 各実装タスクのコンポーネントレベルテスト
- [ ] **統合テストIssue**: コンポーネント間のインターフェイスと相互作用のテスト
- [ ] **エンドツーエンドテストIssue**: Playwrightを使った完全なユーザーワークフロー検証
- [ ] **性能テストIssue**: 非機能要件の検証
- [ ] **セキュリティテストIssue**: セキュリティ要件と脆弱性のテスト
- [ ] **アクセシビリティテストIssue**: WCAG準拠とインクルーシブデザインの検証
- [ ] **回帰テストIssue**: 変更影響と既存機能の維持

#### テスト種別の特定と優先順位付け

- [ ] **機能テストの優先度**: 重要なユーザーパスと中核業務ロジック
- [ ] **非機能テストの優先度**: 性能、セキュリティ、使用性の要件
- [ ] **構造テストの優先度**: コードカバレッジ目標とアーキテクチャ検証
- [ ] **変更関連テストの優先度**: リスクベースの回帰テスト範囲

#### テスト依存関係の文書化

- [ ] **実装の依存関係**: 特定の開発タスクによりブロックされるテスト
- [ ] **環境の依存関係**: テスト環境とデータの要件
- [ ] **Toolの依存関係**: テストフレームワークと自動化Toolのセットアップ
- [ ] **チーム間の依存関係**: 外部システムまたはチームへの依存関係

#### テストカバレッジ目標とメトリクス

- [ ] **コードカバレッジ目標**: 行カバレッジ80%超、重要パスの分岐カバレッジ90%超
- [ ] **機能カバレッジ目標**: 受け入れ基準を100%検証
- [ ] **リスクカバレッジ目標**: 高リスクシナリオを100%検証
- [ ] **品質特性カバレッジ**: 各ISO 25010特性の検証方法

### タスクレベルの分解

#### 実装タスクの作成と見積もり

- [ ] **テスト実装タスク**: 詳細なテストケース開発と自動化タスク
- [ ] **テスト環境セットアップタスク**: インフラと構成のタスク
- [ ] **テストデータ準備タスク**: データ生成と管理タスク
- [ ] **テスト自動化フレームワークタスク**: Toolセットアップとフレームワーク開発

#### タスク見積もりガイドライン

- [ ] **単体テストタスク**: コンポーネントあたり0.5〜1 story point
- [ ] **統合テストタスク**: インターフェイスあたり1〜2 story points
- [ ] **E2Eテストタスク**: ユーザーワークフローあたり2〜3 story points
- [ ] **性能テストタスク**: 性能要件あたり3〜5 story points
- [ ] **セキュリティテストタスク**: セキュリティ要件あたり2〜4 story points

#### タスク依存関係と順序付け

- [ ] **順次依存関係**: 特定の順序で実装しなければならないテスト
- [ ] **並行開発**: 同時に開発できるテスト
- [ ] **クリティカルパスの特定**: 提供までのクリティカルパス上のテストタスク
- [ ] **リソース割り当て**: チームのスキルとキャパシティに基づくタスク割り当て

#### タスク割り当て戦略

- [ ] **スキルベースの割り当て**: チームメンバーの専門性に合わせたタスク
- [ ] **キャパシティ計画**: メンバー間の作業量のバランス
- [ ] **ナレッジ移転**: ジュニアとシニアメンバーのペアリング
- [ ] **クロストレーニングの機会**: タスク割り当てによるスキル開発

### 品質保証計画

#### 品質ゲートとチェックポイント

包括的な品質検証チェックポイントを作成します。

- **開始基準**: 各テストフェーズを開始するための要件
- **終了基準**: フェーズ完了に必要な品質標準
- **品質メトリクス**: 品質達成度を示す測定可能な指標
- **エスカレーション手順**: 品質失敗に対処するプロセス

#### GitHub Issueの品質標準

- [ ] **テンプレート準拠**: すべてのテストIssueが標準テンプレートに従う
- [ ] **必須フィールドの入力**: 必須フィールドに正確な情報を入力
- [ ] **ラベルの一貫性**: すべてのテスト作業項目で標準ラベルを使用
- [ ] **優先度の割り当て**: 定義済み基準によるリスクベースの優先順位付け
- [ ] **価値の評価**: 業務価値と品質影響の評価

#### ラベル付けと優先順位付けの標準

- [ ] **テスト種別ラベル**: `unit-test`, `integration-test`, `e2e-test`, `performance-test`, `security-test`
- [ ] **品質ラベル**: `quality-gate`, `iso25010`, `istqb-technique`, `risk-based`
- [ ] **優先度ラベル**: `test-critical`, `test-high`, `test-medium`, `test-low`
- [ ] **コンポーネントラベル**: `frontend-test`, `backend-test`, `api-test`, `database-test`

#### 依存関係の検証と管理

- [ ] **循環依存の検出**: ブロック関係を防ぐ検証
- [ ] **クリティカルパス分析**: 提供スケジュール上のテスト依存関係の特定
- [ ] **リスク評価**: 依存関係の遅延が品質検証へ与える影響分析
- [ ] **緩和戦略**: ブロックされたテスト作業に対する代替アプローチ

#### 見積もり精度とレビュー

- [ ] **過去データの分析**: 過去のプロジェクトデータを使った見積もり精度の向上
- [ ] **テクニカルリードレビュー**: テスト複雑度の見積もりに対する専門家の検証
- [ ] **リスクバッファの割り当て**: 不確実性の高いタスクへの追加時間の割り当て
- [ ] **見積もりの精緻化**: 見積もり精度を反復的に改善

## テスト用GitHub Issueテンプレート

### テスト戦略Issueテンプレート

```markdown
# Test Strategy: {Feature Name}

## Test Strategy Overview

{Summary of testing approach based on ISTQB and ISO 25010}

## ISTQB Framework Application

**Test Design Techniques Used:**
- [ ] Equivalence Partitioning
- [ ] Boundary Value Analysis
- [ ] Decision Table Testing
- [ ] State Transition Testing
- [ ] Experience-Based Testing

**Test Types Coverage:**
- [ ] Functional Testing
- [ ] Non-Functional Testing
- [ ] Structural Testing
- [ ] Change-Related Testing (Regression)

## ISO 25010 Quality Characteristics

**Priority Assessment:**
- [ ] Functional Suitability: {Critical/High/Medium/Low}
- [ ] Performance Efficiency: {Critical/High/Medium/Low}
- [ ] Compatibility: {Critical/High/Medium/Low}
- [ ] Usability: {Critical/High/Medium/Low}
- [ ] Reliability: {Critical/High/Medium/Low}
- [ ] Security: {Critical/High/Medium/Low}
- [ ] Maintainability: {Critical/High/Medium/Low}
- [ ] Portability: {Critical/High/Medium/Low}

## Quality Gates
- [ ] Entry criteria defined
- [ ] Exit criteria established
- [ ] Quality thresholds documented

## Labels
`test-strategy`, `istqb`, `iso25010`, `quality-gates`

## Estimate
{Strategic planning effort: 2-3 story points}
```

### Playwrightテスト実装Issueテンプレート

```markdown
# Playwright Tests: {Story/Component Name}

## Test Implementation Scope
{Specific user story or component being tested}

## ISTQB Test Case Design
**Test Design Technique**: {Selected ISTQB technique}
**Test Type**: {Functional/Non-Functional/Structural/Change-Related}

## Test Cases to Implement
**Functional Tests:**
- [ ] Happy path scenarios
- [ ] Error handling validation
- [ ] Boundary value testing
- [ ] Input validation testing

**Non-Functional Tests:**
- [ ] Performance testing (response time < {threshold})
- [ ] Accessibility testing (WCAG compliance)
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

## Playwright Implementation Tasks
- [ ] Page Object Model development
- [ ] Test fixture setup
- [ ] Test data management
- [ ] Test case implementation
- [ ] Visual regression tests
- [ ] CI/CD integration

## Acceptance Criteria
- [ ] All test cases pass
- [ ] Code coverage targets met (>80%)
- [ ] Performance thresholds validated
- [ ] Accessibility standards verified

## Labels
`playwright`, `e2e-test`, `quality-validation`

## Estimate
{Test implementation effort: 2-5 story points}
```

### 品質保証Issueテンプレート

```markdown
# Quality Assurance: {Feature Name}

## Quality Validation Scope
{Overall quality validation for feature/epic}

## ISO 25010 Quality Assessment
**Quality Characteristics Validation:**
- [ ] Functional Suitability: Completeness, correctness, appropriateness
- [ ] Performance Efficiency: Time behavior, resource utilization, capacity
- [ ] Usability: Interface aesthetics, accessibility, learnability, operability
- [ ] Security: Confidentiality, integrity, authentication, authorization
- [ ] Reliability: Fault tolerance, recovery, availability
- [ ] Compatibility: Browser, device, integration compatibility
- [ ] Maintainability: Code quality, modularity, testability
- [ ] Portability: Environment adaptability, installation procedures

## Quality Gates Validation
**Entry Criteria:**
- [ ] All implementation tasks completed
- [ ] Unit tests passing
- [ ] Code review approved

**Exit Criteria:**
- [ ] All test types completed with >95% pass rate
- [ ] No critical/high severity defects
- [ ] Performance benchmarks met
- [ ] Security validation passed

## Quality Metrics
- [ ] Test coverage: {target}%
- [ ] Defect density: <{threshold} defects/KLOC
- [ ] Performance: Response time <{threshold}ms
- [ ] Accessibility: WCAG {level} compliance
- [ ] Security: Zero critical vulnerabilities

## Labels
`quality-assurance`, `iso25010`, `quality-gates`

## Estimate
{Quality validation effort: 3-5 story points}
```

## Success Metrics

### Test Coverage Metrics

- **コードカバレッジ**: 80%超の行カバレッジ、重要パスでは90%超の分岐カバレッジ
- **機能カバレッジ**: 受け入れ基準を100%検証
- **リスクカバレッジ**: 高リスクシナリオを100%テスト
- **Quality Characteristics Coverage**: 適用可能なすべてのISO 25010特性の検証

### 品質検証メトリクス

- **Defect Detection Rate**: 本番前に95%超の欠陥を検出
- **Test Execution Efficiency**: テスト自動化カバレッジ90%超
- **Quality Gate Compliance**: リリース前に品質ゲートを100%通過
- **Risk Mitigation**: 特定したリスクの100%に緩和策で対応

### プロセス効率メトリクス

- **Test Planning Time**: 包括的なテスト戦略の作成を2時間未満
- **Test Implementation Speed**: テスト開発はstory pointあたり1日未満
- **Quality Feedback Time**: テスト完了から品質評価まで2時間未満
- **Documentation Completeness**: すべてのテストIssueにテンプレート情報を100%記載

この包括的なテスト計画アプローチにより、効率的なプロジェクト管理とすべてのテスト活動に対する明確な責任分担を維持しながら、業界標準に沿った徹底的な品質検証を実現します。
