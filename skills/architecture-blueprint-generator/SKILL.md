---
name: architecture-blueprint-generator
description: 'コードベースを分析して詳細なアーキテクチャ文書を作成する、包括的なプロジェクトアーキテクチャ青写真ジェネレーター。技術スタックとアーキテクチャパターンを自動検出し、図を生成し、実装パターンを文書化し、アーキテクチャの一貫性を保って新規開発を導く拡張可能な青写真を提供する。'
---

# 包括的なプロジェクトアーキテクチャ青写真ジェネレーター

## 設定変数
${PROJECT_TYPE="Auto-detect|.NET|Java|React|Angular|Python|Node.js|Flutter|Other"} <!-- 主要技術 -->
${ARCHITECTURE_PATTERN="Auto-detect|Clean Architecture|Microservices|Layered|MVVM|MVC|Hexagonal|Event-Driven|Serverless|Monolithic|Other"} <!-- 主要アーキテクチャパターン -->
${DIAGRAM_TYPE="C4|UML|Flow|Component|None"} <!-- アーキテクチャ図の種類 -->
${DETAIL_LEVEL="High-level|Detailed|Comprehensive|Implementation-Ready"} <!-- 含める詳細レベル -->
${INCLUDES_CODE_EXAMPLES=true|false} <!-- パターンを示すサンプルコードを含める -->
${INCLUDES_IMPLEMENTATION_PATTERNS=true|false} <!-- 詳細な実装パターンを含める -->
${INCLUDES_DECISION_RECORDS=true|false} <!-- アーキテクチャ決定記録を含める -->
${FOCUS_ON_EXTENSIBILITY=true|false} <!-- 拡張ポイントとパターンを強調する -->

## 生成するプロンプト

"コードベースのアーキテクチャパターンを徹底的に分析し、アーキテクチャの一貫性を維持する決定的な参照資料となる包括的な `Project_Architecture_Blueprint.md` 文書を作成する。次の方法を使う:

### 1. アーキテクチャの検出と分析
- ${PROJECT_TYPE == "Auto-detect" ? "プロジェクト構造を分析し、次を調べて使われているすべての技術スタックとフレームワークを特定する:
  - プロジェクトファイルと設定ファイル
  - パッケージ依存関係とimport文
  - フレームワーク固有のパターンと規約
  - ビルドとデプロイ設定" : "${PROJECT_TYPE} 固有のパターンと実践に集中する"}
  
- ${ARCHITECTURE_PATTERN == "Auto-detect" ? "次を分析してアーキテクチャパターンを判定する:
  - フォルダー構成と名前空間
  - 依存関係の流れとコンポーネント境界
  - インターフェイス分離と抽象化パターン
  - コンポーネント間の通信メカニズム" : "${ARCHITECTURE_PATTERN} アーキテクチャがどのように実装されているか文書化する"}

### 2. アーキテクチャ概要
- アーキテクチャ全体のアプローチを明確かつ簡潔に説明する
- アーキテクチャ上の選択から読み取れる指針を文書化する
- アーキテクチャの境界と、その強制方法を特定する
- 標準パターンの混成や適応があれば記録する

### 3. アーキテクチャの可視化
${DIAGRAM_TYPE != "None" ? `複数の抽象レベルで ${DIAGRAM_TYPE} 図を作成する:
- 主要サブシステムを示す高レベルアーキテクチャ概要
- 関係と依存関係を示すコンポーネント相互作用図
- 情報がシステム内をどう流れるかを示すデータフロー図
- 図は理論上のパターンではなく、実際の実装を正確に反映させる` : "実際のコード依存関係に基づいてコンポーネント関係を説明し、次について明確な文章説明を提供する:
- サブシステムの構成と境界
- 依存方向とコンポーネント相互作用
- データフローとプロセス順序"}

### 4. 中核アーキテクチャコンポーネント
コードベースで見つかった各アーキテクチャコンポーネントについて:

- **目的と責任**:
  - アーキテクチャ内での主機能
  - 対応するビジネス領域または技術的関心事
  - 境界とスコープ制限

- **内部構造**:
  - コンポーネント内のクラス/モジュール構成
  - 主要な抽象化とその実装
  - 利用されている設計パターン

- **相互作用パターン**:
  - コンポーネントが他とどう通信するか
  - 公開および利用するインターフェイス
  - 依存性注入パターン
  - イベント発行/購読メカニズム

- **進化パターン**:
  - コンポーネントをどう拡張できるか
  - 変化点とプラグインメカニズム
  - 構成とカスタマイズの方法

### 5. アーキテクチャ層と依存関係
- コードベースで実装されている層構造を対応付ける
- 層間の依存ルールを文書化する
- 層分離を可能にする抽象化メカニズムを特定する
- 循環依存や層違反があれば記録する
- 分離を維持するために使われている依存性注入パターンを文書化する

### 6. データアーキテクチャ
- ドメインモデルの構造と構成を文書化する
- エンティティ関係と集約パターンを対応付ける
- データアクセスパターン（repository、data mapperなど）を特定する
- データ変換とマッピング方法を文書化する
- キャッシュ戦略と実装を記録する
- データ検証パターンを文書化する

### 7. 横断的関心事の実装
横断的関心事の実装パターンを文書化する:

- **認証と認可**:
  - セキュリティモデル実装
  - 権限強制パターン
  - ID管理方法
  - セキュリティ境界パターン

- **エラー処理とレジリエンス**:
  - 例外処理パターン
  - 再試行とサーキットブレーカーの実装
  - フォールバックとグレースフルデグラデーション戦略
  - エラー報告と監視方法

- **ロギングと監視**:
  - 計装パターン
  - 可観測性の実装
  - 診断情報の流れ
  - 性能監視の方法

- **検証**:
  - 入力検証戦略
  - ビジネスルール検証の実装
  - 検証責務の分散
  - エラー報告パターン

- **構成管理**:
  - 構成ソースのパターン
  - 環境固有の構成戦略
  - シークレット管理方法
  - フィーチャーフラグ実装

### 8. サービス通信パターン
- Document service boundary definitions
- Identify communication protocols and formats
- Map synchronous vs. asynchronous communication patterns
- Document API versioning strategies
- Identify service discovery mechanisms
- Note resilience patterns in service communication

### 9. 技術固有のアーキテクチャパターン
${PROJECT_TYPE == "Auto-detect" ? "検出された各技術スタックについて、固有のアーキテクチャパターンを文書化する:" : `${PROJECT_TYPE} 固有のアーキテクチャパターンを文書化する:`}

${(PROJECT_TYPE == ".NET" || PROJECT_TYPE == "Auto-detect") ? 
"#### .NET Architectural Patterns (if detected)
- Host and application model implementation
- Middleware pipeline organization
- Framework service integration patterns
- ORM and data access approaches
- API implementation patterns (controllers, minimal APIs, etc.)
- Dependency injection container configuration" : ""}

${(PROJECT_TYPE == "Java" || PROJECT_TYPE == "Auto-detect") ? 
"#### Java Architectural Patterns (if detected)
- Application container and bootstrap process
- Dependency injection framework usage (Spring, CDI, etc.)
- AOP implementation patterns
- Transaction boundary management
- ORM configuration and usage patterns
- Service implementation patterns" : ""}

${(PROJECT_TYPE == "React" || PROJECT_TYPE == "Auto-detect") ? 
"#### React Architectural Patterns (if detected)
- Component composition and reuse strategies
- State management architecture
- Side effect handling patterns
- Routing and navigation approach
- Data fetching and caching patterns
- Rendering optimization strategies" : ""}

${(PROJECT_TYPE == "Angular" || PROJECT_TYPE == "Auto-detect") ? 
"#### Angular Architectural Patterns (if detected)
- Module organization strategy
- Component hierarchy design
- Service and dependency injection patterns
- State management approach
- Reactive programming patterns
- Route guard implementation" : ""}

${(PROJECT_TYPE == "Python" || PROJECT_TYPE == "Auto-detect") ? 
"#### Python Architectural Patterns (if detected)
- Module organization approach
- Dependency management strategy
- OOP vs. functional implementation patterns
- Framework integration patterns
- Asynchronous programming approach" : ""}

### 10. 実装パターン
${INCLUDES_IMPLEMENTATION_PATTERNS ? 
"主要なアーキテクチャコンポーネントの具体的な実装パターンを文書化する:

- **インターフェイス設計パターン**:
  - インターフェイス分離の方法
  - 抽象レベルの決定
  - 汎用インターフェイスと特化インターフェイスのパターン
  - 既定の実装パターン

- **サービス実装パターン**:
  - サービスライフタイム管理
  - サービス構成パターン
  - 操作実装テンプレート
  - サービス内のエラー処理

- **リポジトリ実装パターン**:
  - クエリパターン実装
  - トランザクション管理
  - 並行処理
  - 一括操作パターン

- **Controller/API実装パターン**:
  - リクエスト処理パターン
  - レスポンス整形方法
  - パラメーター検証
  - APIバージョニング実装

- **ドメインモデル実装**:
  - Entity実装パターン
  - Value Objectパターン
  - Domain Event実装
  - 業務ルールの強制" : "詳細な実装パターンはコードベース全体で異なることに触れる。"}

### 11. テストアーキテクチャ
- アーキテクチャに沿ったテスト戦略を文書化する
- テスト境界パターン（unit、integration、system）を特定する
- テストダブルとモック方法を対応付ける
- テストデータ戦略を文書化する
- テストツールとフレームワークの統合を記録する

### 12. デプロイアーキテクチャ
- 設定から導かれるデプロイトポロジを文書化する
- 環境固有のアーキテクチャ適応を特定する
- ランタイム依存関係解決パターンを対応付ける
- 環境横断の構成管理を文書化する
- コンテナー化とオーケストレーション方法を特定する
- クラウドサービス統合パターンを記録する

### 13. 拡張と進化のパターン
${FOCUS_ON_EXTENSIBILITY ? 
"アーキテクチャを拡張するための詳細なガイダンスを提供する:

- **機能追加パターン**:
  - アーキテクチャ整合性を保ちながら新機能を追加する方法
  - 種類ごとの新規コンポーネント配置場所
  - 依存関係導入ガイドライン
  - 構成拡張パターン

- **変更パターン**:
  - 既存コンポーネントを安全に変更する方法
  - 後方互換性を維持する戦略
  - 非推奨化パターン
  - 移行方法

- **統合パターン**:
  - 新しい外部システムを統合する方法
  - アダプター実装パターン
  - 腐敗防止層パターン
  - サービスファサード実装" : "アーキテクチャ内の主要な拡張ポイントを文書化する。"}

${INCLUDES_CODE_EXAMPLES ? 
"### 14. アーキテクチャパターンの例
主要なアーキテクチャパターンを示す代表的なコード例を抽出する:

- **層分離の例**:
  - インターフェイス定義と実装の分離
  - 層横断通信パターン
  - 依存性注入の例

- **コンポーネント通信の例**:
  - サービス呼び出しパターン
  - イベント発行と処理
  - メッセージ受け渡し実装

- **拡張ポイントの例**:
  - プラグイン登録と検出
  - 拡張インターフェイス実装
  - 構成駆動の拡張パターン

各例にはパターンを明確に示す十分な文脈を含めるが、例は簡潔に保ち、アーキテクチャ概念へ集中させる。" : ""}

${INCLUDES_DECISION_RECORDS ? 
"### 15. アーキテクチャ決定記録
コードベースから明らかな主要なアーキテクチャ決定を文書化する:

- **アーキテクチャスタイルの決定**:
  - 現在のアーキテクチャパターンが選ばれた理由
  - 検討された代替案（コードの変遷に基づく）
  - 決定に影響した制約

- **技術選定の決定**:
  - 主要な技術選択とそのアーキテクチャ上の影響
  - フレームワーク選定の根拠
  - カスタムコンポーネントと既製コンポーネントの判断

- **実装アプローチの決定**:
  - 選択された具体的な実装パターン
  - 標準パターンの適用方法
  - 性能と保守性のトレードオフ

各決定について次を記録する:
- 決定を必要にした文脈
- 決定時に考慮した要因
- 結果として生じた影響（良い面と悪い面）
- 導入された将来の柔軟性または制約" : ""}

### ${INCLUDES_DECISION_RECORDS ? "16" : INCLUDES_CODE_EXAMPLES ? "15" : "14"}. アーキテクチャガバナンス
- アーキテクチャ整合性がどのように維持されているかを文書化する
- アーキテクチャ準拠の自動チェックを特定する
- コードベースから読み取れるアーキテクチャレビュー手順を記録する
- アーキテクチャ文書化の実践を文書化する

### ${INCLUDES_DECISION_RECORDS ? "17" : INCLUDES_CODE_EXAMPLES ? "16" : "15"}. 新規開発の青写真
新機能を実装するための明確なアーキテクチャガイドを作成する:

- **開発ワークフロー**:
  - 機能種別ごとの開始点
  - コンポーネント作成順序
  - 既存アーキテクチャとの統合手順
  - アーキテクチャ層ごとのテスト方法

- **実装テンプレート**:
  - 主要アーキテクチャコンポーネント向けの基底クラス/インターフェイステンプレート
  - 新規コンポーネントの標準ファイル構成
  - 依存関係宣言パターン
  - 文書化要件

- **よくある落とし穴**:
  - 避けるべきアーキテクチャ違反
  - よくあるアーキテクチャ上の誤り
  - 性能上の考慮事項
  - テストの盲点

この青写真がいつ生成されたかの情報と、アーキテクチャの進化に合わせて最新に保つための推奨事項を含める。"
