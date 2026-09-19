---
name: generate-custom-instructions-from-codebase
description: 'GitHub Copilot 向けの移行とコード進化の指示生成。2つのプロジェクト状態（ブランチ、コミット、またはリリース）間の差分を分析し、技術移行、大規模リファクタリング、またはフレームワーク更新中に Copilot が整合性を保てるようにする、正確な指示を作成します。'
---

# 移行とコード進化の指示生成

## 設定変数

```
${MIGRATION_TYPE="Framework Version|Architecture Refactoring|Technology Migration|Dependencies Update|Pattern Changes"}
<!-- マイグレーションまたは進化の種類 -->

${SOURCE_REFERENCE="branch|commit|tag"}
<!-- 変更前の状態の参照ポイント -->

${TARGET_REFERENCE="branch|commit|tag"}  
<!-- 変更後の状態の参照ポイント -->

${ANALYSIS_SCOPE="Entire project|Specific folder|Modified files only"}
<!-- 分析対象の範囲 -->

${CHANGE_FOCUS="Breaking Changes|New Conventions|Obsolete Patterns|API Changes|Configuration"}
<!-- 変更の主な観点 -->

${AUTOMATION_LEVEL="Conservative|Balanced|Aggressive"}
<!-- Copilot 提案の自動化レベル -->

${GENERATE_EXAMPLES="true|false"}
<!-- 変換例を含める -->

${VALIDATION_REQUIRED="true|false"}
<!-- 適用前に検証を要求する -->
```

## 生成プロンプト

```
"Analyze code evolution between two project states to generate precise migration instructions for GitHub Copilot. These instructions will guide Copilot to automatically apply the same transformation patterns during future modifications. Follow this methodology:

### Phase 1: Comparative State Analysis

#### Structural Changes Detection
- Compare folder structure between ${SOURCE_REFERENCE} and ${TARGET_REFERENCE}
- Identify moved, renamed, or deleted files
- Analyze changes in configuration files
- Document new dependencies and removed ones

#### Code Transformation Analysis
${MIGRATION_TYPE == "Framework Version" ? 
  "- Identify API changes between framework versions
   - Analyze new features being used
   - Document obsolete methods/properties
   - Note syntax or convention changes" : ""}

${MIGRATION_TYPE == "Architecture Refactoring" ? 
  "- Analyze architectural pattern changes
   - Identify new abstractions introduced
   - Document responsibility reorganization
   - Note changes in data flows" : ""}

${MIGRATION_TYPE == "Technology Migration" ? 
  "- Analyze replacement of one technology with another
   - Identify functional equivalences
   - Document API and syntax changes
   - Note new dependencies and configurations" : ""}

#### Transformation Pattern Extraction
- Identify repetitive transformations applied
- Analyze conversion rules from old to new format
- Document exceptions and special cases
- Create before/after correspondence matrix

### Phase 2: Migration Instructions Generation

Create a `.github/copilot-migration-instructions.md` file with this structure:

\`\`\`markdown
# GitHub Copilot Migration Instructions

## Migration Context
- **Type**: ${MIGRATION_TYPE}
- **From**: ${SOURCE_REFERENCE} 
- **To**: ${TARGET_REFERENCE}
- **Date**: [GENERATION_DATE]
- **Scope**: ${ANALYSIS_SCOPE}

## Automatic Transformation Rules

### 1. Mandatory Transformations
${AUTOMATION_LEVEL != "Conservative" ? 
  "[AUTOMATIC_TRANSFORMATION_RULES]
   - **Old Pattern**: [OLD_CODE]
   - **New Pattern**: [NEW_CODE]
   - **Trigger**: When to detect this pattern
   - **Action**: Transformation to apply automatically" : ""}

### 2. Transformations with Validation
${VALIDATION_REQUIRED == "true" ? 
  "[TRANSFORMATIONS_WITH_VALIDATION]
   - **Detected Pattern**: [DESCRIPTION]
   - **Suggested Transformation**: [NEW_APPROACH]
   - **Required Validation**: [VALIDATION_CRITERIA]
   - **Alternatives**: [ALTERNATIVE_OPTIONS]" : ""}

### 3. API Correspondences
${CHANGE_FOCUS == "API Changes" || MIGRATION_TYPE == "Framework Version" ? 
  "[API_CORRESPONDENCE_TABLE]
   | Old API   | New API   | Notes     | Example        |
   | --------- | --------- | --------- | -------------- |
   | [OLD_API] | [NEW_API] | [CHANGES] | [CODE_EXAMPLE] | " : ""} |

### 4. New Patterns to Adopt
[DETECTED_EMERGING_PATTERNS]
- **Pattern**: [PATTERN_NAME]
- **Usage**: [WHEN_TO_USE] 
- **Implementation**: [HOW_TO_IMPLEMENT]
- **Benefits**: [ADVANTAGES]

### 5. Obsolete Patterns to Avoid
[DETECTED_OBSOLETE_PATTERNS]
- **Obsolete Pattern**: [OLD_PATTERN]
- **Why Avoid**: [REASONS]
- **Alternative**: [NEW_PATTERN]
- **Migration**: [CONVERSION_STEPS]

## File Type Specific Instructions

${GENERATE_EXAMPLES == "true" ? 
  "### Configuration Files
   [CONFIG_TRANSFORMATION_EXAMPLES]
   
   ### Main Source Files
   [SOURCE_TRANSFORMATION_EXAMPLES]
   
   ### Test Files
   [TEST_TRANSFORMATION_EXAMPLES]" : ""}

## Validation and Security

### Automatic Control Points
- Verifications to perform after each transformation
- Tests to run to validate changes
- Performance metrics to monitor
- Compatibility checks to perform

### Manual Escalation
Situations requiring human intervention:
- [COMPLEX_CASES_LIST]
- [ARCHITECTURAL_DECISIONS]
- [BUSINESS_IMPACTS]

## Migration Monitoring

### Tracking Metrics
- Percentage of code automatically migrated
- Number of manual validations required
- Error rate of automatic transformations
- Average migration time per file

### Error Reporting
How to report incorrect transformations to Copilot:
- Feedback patterns to improve rules
- Exceptions to document
- Adjustments to make to instructions

\`\`\`

### Phase 3: Contextual Examples Generation

${GENERATE_EXAMPLES == "true" ? 
  "#### Transformation Examples
   For each identified pattern, generate:
   
   \`\`\`
   // BEFORE (${SOURCE_REFERENCE})
   [OLD_CODE_EXAMPLE]
   
   // AFTER (${TARGET_REFERENCE}) 
   [NEW_CODE_EXAMPLE]
   
   // COPILOT INSTRUCTIONS
   When you see this pattern [TRIGGER], transform it to [NEW_PATTERN] following these steps: [STEPS]
   \`\`\`" : ""}

### Phase 4: Validation and Optimization

#### Instructions Testing
- Apply instructions on test code
- Verify transformation consistency
- Adjust rules based on results
- Document exceptions and edge cases

#### Iterative Optimization  
${AUTOMATION_LEVEL == "Aggressive" ? 
  "- Refine rules to maximize automation
   - Reduce false positives in detection
   - Improve transformation accuracy
   - Document lessons learned" : ""}

### Final Result

Migration instructions that enable GitHub Copilot to:
1. **Automatically apply** the same transformations during future modifications
2. **Maintain consistency** with newly adopted conventions  
3. **Avoid obsolete patterns** by automatically proposing alternatives
4. **Accelerate future migrations** by capitalizing on acquired experience
5. **Reduce errors** by automating repetitive transformations

These instructions transform Copilot into an intelligent migration assistant, capable of reproducing your technology evolution decisions consistently and reliably.
"
```

## 典型的なユースケース

### フレームワーク バージョン移行
Angular 14 から Angular 17 への移行、React の Class Components から Hooks への移行、または .NET Framework から .NET Core への移行を記録するのに最適です。互換性破壊の変更を自動的に特定し、対応する変換ルールを生成します。

### テクノロジースタックの進化
jQuery から React、REST から GraphQL、SQL から NoSQL など、技術そのものを置き換える場合に不可欠です。包括的な移行ガイドとパターンマッピングを作成します。

### アーキテクチャのリファクタリング
モノリスからマイクロサービス、MVC から Clean Architecture、Component から Composable Architecture などの大規模リファクタリングに最適です。将来の同様の変換に備えて、アーキテクチャ知識を保存します。

### 設計パターンのモダナイゼーション
Repository Pattern、Dependency Injection、Observer から Reactive Programming への採用に役立ちます。理由と実装差分を文書化します。

## 独自の利点

### 🧠 **人工知能の強化**
従来の移行ドキュメントと異なり、これらの指示は GitHub Copilot が将来のコード修正時に、あなたの技術進化判断を自動的に再現できるように "学習" させます。

### 🔄 **知識資産化**
特定プロジェクトで得た移行経験を再利用可能なルールに変換し、移行ノウハウの喪失を防ぎ、同様の作業をより高速に進めます。

### 🎯 **文脈に応じた正確さ**
汎用的な助言ではなく、実際のコードベースに合わせて、プロジェクトの進化から得た実際の before/after 例を含む具体的な指示を生成します。

### ⚡ **自動的な一貫性**
新しいコード追加が自動的に新しい規約に従うようにし、アーキテクチャの退行を防ぎ、コード進化の整合性を維持します。
