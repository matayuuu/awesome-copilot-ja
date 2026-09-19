---
name: minecraft-plugin-development
description: 'Paper、Spigot、Bukkit 向け Minecraft サーバープラグインを作成または変更するときに使用する。`plugin.yml` の設定、コマンド、リスナー、スケジューラー、プレイヤー状態、チームまたはアリーナシステム、永続的な進行状況、経済またはプロフィールデータ、構成ファイル、Adventure テキスト、バージョン互換性を保った API 利用を扱う。「Minecraft plugin を作る」「Paper コマンドを追加」「Bukkit リスナーを修正」「plugin.yml を作成」「ミニゲーム機構を実装」「パークまたはクエストシステムを追加」「サーバープラグインの挙動をデバッグ」のような依頼で起動する。'
---

# Minecraftプラグイン開発

Paper、Spigot、BukkitエコシステムでMinecraftサーバープラグインを扱うときにこのSkillを使う。

このSkillは、戦闘システム、ウェーブまたはボス戦、戦争またはチームモード、アリーナ、キットシステム、クールダウン式能力、スコアボード、設定駆動のゲームルールなど、ゲームプレイ中心のプラグインに特に有効である。

実際のPaperプラグインに基づく実装パターンが必要な場合は、必要に応じて次の参照を読み込む:

- [`references/project-patterns.md`](references/project-patterns.md): 実際のゲームプレイプラグインに見られる高レベルのアーキテクチャパターン
- [`references/bootstrap-registration.md`](references/bootstrap-registration.md): `onEnable`、コマンド接続、リスナー登録、終了時の想定
- [`references/state-sessions-and-phases.md`](references/state-sessions-and-phases.md): プレイヤーセッションモデル、ゲームフェーズ、試合状態、再接続に安全なロジック
- [`references/config-data-and-async.md`](references/config-data-and-async.md): 設定マネージャー、データベース永続化プレイヤーデータ、非同期フラッシュ、UI更新タスク
- [`references/maps-heroes-and-feature-modules.md`](references/maps-heroes-and-feature-modules.md): マップローテーション、ヒーローまたはクラスシステム、モジュール拡張
- [`references/minigame-instance-flow.md`](references/minigame-instance-flow.md): アリーナインスタンス、カウントダウン、戦利品更新、ウェーブシステム、可視性分離、エンティティとゲームの所有権
- [`references/persistent-progression-and-events.md`](references/persistent-progression-and-events.md): プロフィール、パーク、バフ、クエスト、経済、カスタムドメインイベント、拡張レジストリを持つ長期稼働PvPサーバー
- [`references/build-test-and-runtime-validation.md`](references/build-test-and-runtime-validation.md): MavenまたはGradleのパッケージ化、シェード依存関係、生成リソース、任意依存関係、設定検証コマンド、初回サーバーテスト計画

## 対象範囲

- 対象: Paper、Spigot、Bukkitプラグイン開発
- 対象: `plugin.yml`、コマンド、タブ補完、リスナー、スケジューラー、設定、権限、Adventureテキスト、プレイヤー状態、ミニゲームフロー、アリーナインスタンス、マップコピー、戦利品、ウェーブ、永続プロフィール、パーク、バフ、クエスト、経済、PvP／PvEゲームループ
- 対象: Javaベースのサーバープラグインアーキテクチャ、デバッグ、リファクタリング、機能実装
- 既定で対象外: Fabric mod、Forge mod、クライアントmod、Bedrockアドオン

ユーザーが「Minecraft plugin」と言い、スタックが不明な場合は、まずPaper／Spigot／Bukkitかmodding stackかを判断する。

## 既定の作業スタイル

このSkillが起動したら:

1. サーバーAPIと対象バージョンを特定する。
2. ビルドシステムとJavaバージョンを特定する。
3. `plugin.yml`、メインプラグインクラス、コマンドまたはリスナーの登録を確認する。
4. コード編集前にゲームプレイフローを整理する:
   - player lifecycle
   - game phases
   - timers and scheduled tasks
   - team, arena, or match state
   - config and persistence
5. 登録、設定、実行時動作の整合性を保つ、最小限で一貫した変更を行う。

プラグインがゲームプレイ中心または状態を持つ場合は、編集前に[`references/project-patterns.md`](references/project-patterns.md)と[`references/state-sessions-and-phases.md`](references/state-sessions-and-phases.md)を読む。

タスクがアリーナ分離、マップインスタンス、チェストまたはリソース補充、ウェーブ生成、ルート投票、観戦者の可視性、ゲーム固有チャットに関係する場合は、[`references/minigame-instance-flow.md`](references/minigame-instance-flow.md)も読む。

タスクが永続的なプレイヤー進行、プロフィール保存、経済報酬、パーク、バフ、クエスト、カスタム戦闘イベント、長期稼働の共有PvPサーバーに関係する場合は、[`references/persistent-progression-and-events.md`](references/persistent-progression-and-events.md)も読む。

タスクがビルドファイル、`plugin.yml`メタデータ、シェード依存関係、生成リソース出力、テストサーバーへのデプロイ、任意プラグイン統合、リリース検証に関係する場合は、[`references/build-test-and-runtime-validation.md`](references/build-test-and-runtime-validation.md)も読む。

## プロジェクト確認チェックリスト

存在する場合は、まず次を確認する:

- `plugin.yml`
- `pom.xml`、`build.gradle`、`build.gradle.kts`
- `JavaPlugin`を継承するプラグインメインクラス
- コマンドエグゼキューターとタブ補完
- リスナークラス
- `config.yml`、メッセージ、キット、アリーナ、カスタムYAMLファイルの設定初期化コード
- `target/classes`、`build/resources`、コピーされたプラグインjarなどの生成リソース出力
- BukkitスケジューラーAPIによるスケジューラー利用
- プレイヤーデータ、チーム状態、アリーナ状態、試合状態のコンテナー

## 基本ルール

### リポジトリの具体的なサーバーAPIを優先する

- プロジェクトがすでにPaper APIを対象としている場合、互換性が明示的に必要でない限り、汎用Bukkitへ下げずPaper優先APIを使い続ける。
- すべてのバージョンにAPIが存在すると仮定しない。まず既存の依存関係と周辺のコードスタイルを確認する。

### 登録を同期する

コマンド、権限、リスナーを追加するときは、同じ変更で関連する登録箇所を更新する:

- `plugin.yml`
- `onEnable`でのプラグイン起動登録
- コード内の権限チェック
- 関連する設定またはメッセージキー

### メインスレッド境界を守る

- APIが明示的に許可していない限り、非同期タスクからワールド状態、エンティティ、インベントリ、スコアボード、その他大半のBukkit APIオブジェクトを操作しない。
- 外部I/O、重い計算、データベース処理には非同期タスクを使い、ゲームプレイ変更を適用する前にメインスレッドへ戻る。

### 分散したbooleanではなく状態としてゲームプレイをモデル化する

ゲームプレイプラグインでは、重複したフラグより明示的な状態オブジェクトを優先する:

- 試合またはゲームフェーズ
- プレイヤーの役割またはクラス
- クールダウン状態
- チーム所属
- アリーナ割り当て
- 生存、脱落、観戦、キュー待ちの状態

機能が試合中心のミニゲームまたは永続的な乱闘ゲームプレイに影響する場合は、症状を修正する前に隠れた状態遷移を探す。

複数アリーナのプラグインでは、ゲームごとの可視性、チャット受信者、スコアボード、戦利品、エンティティ所有権を分離する。あるアリーナが別のアリーナを誤って観測または変更できないようにする。

### 設定駆動の値を優先する

機能にダメージ、クールダウン、報酬、期間、メッセージ、マップ設定、トグルが含まれる場合:

- ハードコードより設定値を優先する
- 妥当な既定値を用意する
- キー名を安定させ、読みやすく保つ
- 欠落値を検証またはサニタイズする

### reloadの挙動に注意する

- コードが十分に対応していない限り、安全なホットリロードを約束しない。
- 設定をリロードするときは、メモリ内キャッシュ、スケジュールタスク、ゲームプレイ状態を一貫して扱う。

## 実装パターン

### コマンド

新しいコマンドでは:

- `plugin.yml`にコマンドを追加する
- 必要に応じてエグゼキューターとタブ補完を実装する
- `Player`へキャストする前に送信者の型を検証する
- 解析、権限チェック、ゲームプレイロジックを分離する
- 無効な使い方には、プレイヤーに明確なフィードバックを送る

最小限の登録例:

```yaml
commands:
  arena:
    description: Join or leave an arena
    usage: /arena <join|leave>
```

```java
@Override
public void onEnable() {
    ArenaCommand command = new ArenaCommand(gameService);
    PluginCommand arena = getCommand("arena");
    if (arena != null) {
        arena.setExecutor(command);
        arena.setTabCompleter(command);
    }
}
```

### リスナー

イベントリスナーでは:

- 早い段階でガードし、早期リターンする
- 現在のプレイヤー、アリーナ、ゲームフェーズがイベントを処理すべきか確認する
- 移動、ダメージ、インタラクトの連続発生など高頻度イベントで重い処理を避ける
- 可能な場合は繰り返しのチェックを集約する

### スケジュールタスク

タイマー、ラウンド、カウントダウン、クールダウン、定期チェックでは:

- キャンセルが必要な場合はタスクハンドルを保存する
- プラグイン無効化時と試合またはアリーナ終了時にタスクをキャンセルする
- 明示的な意図がない限り、同じゲームプレイ上の関心事に複数の重複タスクを作らない
- 緩く協調する多数の反復タスクより、1つの権威あるゲームループを優先する
- ゲームが想定状態を離れたら、カウントダウンまたは補充タスクが自らキャンセルするようにする

メインスレッドへ戻す例:

```java
Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
    PlayerData data = repository.load(playerId);
    Bukkit.getScheduler().runTask(plugin, () -> {
        Player player = Bukkit.getPlayer(playerId);
        if (player != null && player.isOnline()) {
            scoreboard.update(player, data);
        }
    });
});
```

### プレイヤーと試合の状態

プレイヤーごとまたは試合ごとの状態では:

- 所有権を明確に定義する
- 退出、キック、死亡、試合終了、プラグイン無効化時に後片付けする
- `Player`をキーにした古いマップによるメモリリークを避ける
- 生きたプレイヤーオブジェクトが厳密に必要でない限り、永続追跡には`UUID`を優先する

### テキストとメッセージ

プロジェクトがAdventureまたはMiniMessageを使う場合:

- 既存の書式設定方法に従う
- 理由なく従来のカラーコードとAdventureスタイルを混在させない
- ゲームプレイに表示するメッセージはテンプレートを設定可能に保つ

## 高リスク領域

次を編集するときは特に注意する:

- ダメージ処理とカスタム戦闘ロジック
- 死亡、リスポーン、観戦、脱落のフロー
- アリーナ参加と退出のフロー
- スコアボードまたはボスバーの更新
- インベントリ変更とキット配布
- 非同期データベースまたはファイルアクセス
- 経済、クエスト、パーク、プロフィールの変更
- カスタムイベント発生または拡張レジストリ
- バージョン依存のAPI呼び出し
- `onDisable`での終了処理と後片付け
- アリーナ間の可視性、チャット、ブロードキャスト分離
- マップのコピー、アンロード、フォルダー削除ロジック
- Mob、NPC、投射物、一時エンティティの所有権
- チェストまたはリソース補充システム

## 出力要件

プラグインコードを実装または改訂するとき:

- ユーザーが設計だけを求めていない限り、擬似コードではなく実行可能なJavaコードを作る
- `plugin.yml`、設定ファイル、ビルドファイル、リソースに必要な更新を記載する
- バージョンの前提を明示する
- スレッド安全性またはAPI互換性のリスクがあれば指摘する
- プロジェクトの既存規約とフォルダー構造を維持する

要求された変更がプラグイン起動、非同期データ、試合フロー、クラスシステム、ローテーションマップに関係する場合は、編集前に対応する参照ファイルを読む。

## 検証チェックリスト

完了前に、タスクで可能な範囲で次を検証する:

- コマンド、リスナー、機能が正しく登録されている
- `plugin.yml`が実装した動作と一致している
- importとAPI型が対象サーバースタックに一致している
- スケジューラーの利用が安全である
- コードで参照する設定キーが存在するか、既定値を持つ
- 試合終了、プレイヤー退出、プラグイン無効化の状態後片付け経路がある
- アリーナごとのチャット、可視性、スコアボード、ブロードキャストが分離されている
- 一時ワールド、Mob、タスク、生成リソースが片付けられている
- 明らかなnull、キャスト、ライフサイクル上の危険がない

## よくある落とし穴

- 確認せずに`CommandSender`を`Player`へキャストする
- 非同期タスクからBukkit状態を更新する
- リスナー登録または`plugin.yml`でのコマンド宣言を忘れる
- `UUID`の方が安全なのに`Player`オブジェクトを長期間のマップキーにする
- ラウンド、アリーナ、プラグイン終了後も反復タスクを残す
- 設定に置くべきゲームプレイ定数をハードコードする
- Spigot対象プラグインでPaper専用APIを前提にする
- 状態を持つプラグインがリロードで壊れやすいのに、リロードを無償の操作として扱う
- 無関係なゲームインスタンス間でブロードキャスト、プレイヤー表示、スコアボード変更を行う
- チャンクが利用可能になる前にチェスト／コンテナブロックを読み込むまたは変更する
- 生成したMobまたは一時エンティティを所有ゲームから登録解除し忘れる
- `src/main/resources`のソースファイルではなく`target/classes`または`build/resources`の生成ファイルを編集する

## 推奨する応答形式

大きな依頼では、次の構成で作業する:

1. Current plugin context and assumptions
2. Gameplay or lifecycle impact
3. Code changes
4. Required registration or config updates
5. Validation and remaining risks

小さな依頼では回答を簡潔にするが、必要な`plugin.yml`、設定、ライフサイクル更新には触れる。
