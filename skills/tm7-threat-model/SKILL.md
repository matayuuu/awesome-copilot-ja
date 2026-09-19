---
name: tm7-threat-model
description: 'Microsoft Threat Modeling Tool v7.3以降と互換性のある有効なMicrosoft Threat Modeling Tool（.tm7）ファイルを作成します。.tm7脅威モデルファイルの作成・生成・変更を依頼されたとき、またはMicrosoft Threat Modeling Toolで問題なく開ける.tm7ファイルを出力するSTRIDE脅威モデリングを行うときに使用します。'
---
# Microsoft Threat Modeling Tool（.tm7）ジェネレーター

Microsoft Threat Modeling Tool（v7.3以降）向けに**有効な`.tm7`ファイル**を生成します。`.tm7`
ファイルは一般的なXMLではなく、正確な名前空間と要素構造を持つ**WCF `DataContractSerializer`**文書です。構造が間違っていると、ツールは次のエラーを表示してファイルを開きません。

> 「ファイルは実際の脅威モデルではないか、脅威モデルが破損している可能性があります。」

役割は、説明されたシステム（コンポーネント、データストア、外部アクター、データフロー、信頼境界）を、図とSTRIDE脅威に変換し、以下で説明する正確な`.tm7`形式でシリアライズすることです。

## ワークフロー

`.tm7`ファイルの生成を依頼されたら、次の手順に従います。

1. **システムをモデル化する。**次の要素を特定します。
   - **プロセス**（Webアプリ、サービス、関数）→ `StencilEllipse`, `GE.P`
   - **データストア**（データベース、キャッシュ、キュー、BLOB）→ `StencilParallelLines`, `GE.DS`
   - **外部関係者**（ユーザー、ブラウザー、サードパーティーシステム）→ `StencilRectangle`, `GE.EI`
   - **信頼境界** → `BorderBoundary`, `GE.TB`
   - 上記を接続する**データフロー** → `Connector`, `GE.DF`
2. 各ステンシルと各フローに**一意の小文字UUID**（例：`148ade68-5c80-40f3-8e1f-4e2cabdb5991`）を割り当てます。`users-browser`のような人間が読めるIDは使いません。
3. ステンシルが重ならないように座標（`Left`／`Top`／`Width`／`Height`）を配置します。
4. 各インタラクションに対して**STRIDE脅威**を生成し、`<ThreatInstances>`に配置します。
5. このガイドの構造を使い、`assets/example-minimal.tm7`を手本にしてシリアライズします。
6. ファイルを返す前に「よくある間違い」チェックリストで検証します。
7. XML宣言や整形出力のインデントなしでファイルを書き出します（シリアライザーが出力するのは連続した1本のXMLストリームです）。

必ず最初に[`assets/example-minimal.tm7`](./assets/example-minimal.tm7)を開いて適応します。シリアライズの骨格はそのまま再利用し、変更するのはステンシルの型、名前、座標、データフロー、脅威だけにします。

## 重要：シリアライズ形式

TM7ファイルは標準XMLではなく、**WCF `DataContractSerializer` XML**を使います。

ファイルはこの正確なルート要素で始めなければなりません。**`<?xml?>`宣言は不要です**。

```xml
<ThreatModel xmlns="http://schemas.datacontract.org/2004/07/ThreatModeling.Model" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
```

**決して使わないもの：**
- `<?xml version="1.0" encoding="utf-8"?>` — デシリアライズに失敗します。
- `xmlns:xsi` / `xmlns:xsd` — これらは標準XML名前空間であり、DataContract名前空間ではありません。
- `<SecurityGaps>`や`<Mitigations>`のような架空の要素 — TM7スキーマには存在しません。

> **注：** `<MetaInformation>`（`<Owner>`、`<Contributors>`などの子要素を持つもの）、
> `<Reviewer>`、`<Assumptions>`、`<ExternalDependencies>`、`<HighLevelSystemDescription>`、
> `<ThreatModelName>`、`<Notes>`、`<KnowledgeBase>`は実際のスキーマの一部であり、
> ツールが出力します。保持してください（下記の構造と`assets/example-minimal.tm7`を参照）。
> ツールが生成しない要素を作り出さないでください。

## 必須の名前空間プレフィックス

| プレフィックス | URI | 用途 |
|--------|-----|----------|
| (既定) | `http://schemas.datacontract.org/2004/07/ThreatModeling.Model` | ルート`ThreatModel` |
| `xmlns:i` | `http://www.w3.org/2001/XMLSchema-instance` | 型属性 |
| `xmlns:z` | `http://schemas.microsoft.com/2003/10/Serialization/` | 参照ID（`z:Id`） |
| `xmlns:a` | `http://schemas.microsoft.com/2003/10/Serialization/Arrays` | 配列／コレクション |
| `xmlns:b` | `http://schemas.datacontract.org/2004/07/ThreatModeling.KnowledgeBase` | ステンシルのプロパティ |
| `xmlns:c` | `http://www.w3.org/2001/XMLSchema` | プリミティブ型の値 |

## ファイル構造（正しい順序）

ツールの完全なエクスポートには、`DrawingSurfaceList`、`MetaInformation`、`Notes`、`ThreatInstances`、`ThreatMetaData`（空または自己終了が多い）、大きな汎用`KnowledgeBase`（`ThreatMetaData`の内部ではなく**トップレベルの兄弟要素**）、最後に`Profile`がこの順序で含まれます。

```xml
<ThreatModel xmlns="..." xmlns:i="...">
  <DrawingSurfaceList>
    <DrawingSurfaceModel z:Id="i1" xmlns:z="...">
      <GenericTypeId xmlns="...Abstracts">DRAWINGSURFACE</GenericTypeId>
      <Guid xmlns="...Abstracts">{guid}</Guid>
      <Properties xmlns="...Abstracts" xmlns:a="...Arrays">...</Properties>
      <TypeId xmlns="...Abstracts">DRAWINGSURFACE</TypeId>
      <Borders xmlns:a="...Arrays">
        <!-- Stencil elements: processes, data stores, external entities, boundaries -->
      </Borders>
      <Lines xmlns:a="...Arrays">
        <!-- Data flow lines connecting stencils -->
      </Lines>
      <Notes xmlns:a="...Arrays"/>
    </DrawingSurfaceModel>
  </DrawingSurfaceList>
  <MetaInformation>
    <!-- Owner, Contributors, Reviewer, Assumptions, ThreatModelName, etc. -->
  </MetaInformation>
  <Notes xmlns:a="...Arrays"/>
  <ThreatInstances>
    <!-- Threat entries -->
  </ThreatInstances>
  <ThreatMetaData/>
  <KnowledgeBase z:Id="i21" xmlns:a="...ThreatModeling.KnowledgeBase" xmlns:z="...">
    <!-- Generic SDL stencil/threat catalog — top-level sibling of ThreatMetaData -->
  </KnowledgeBase>
  <Profile>
    <PromptedKb xmlns=""/>
  </Profile>
</ThreatModel>
```

> `<KnowledgeBase>`（汎用SDLステンシル／脅威カタログ）は大きいものですが**必須**です。
> ツールはこれを使って各ステンシルの`TypeId`を解決します。`ThreatMetaData`の後、`Profile`の前に置く**トップレベルの兄弟要素**であり、`ThreatMetaData`の内部には置きません。`assets/example-minimal.tm7`からそのまま再利用し、KnowledgeBaseにすでに存在する`TypeId`のステンシルだけを追加します。

## ステンシル要素

`<Borders>`内の各ステンシルは`<a:KeyValueOfguidanyType>`でラップします。

```xml
<a:KeyValueOfguidanyType>
  <a:Key>{guid}</a:Key>
  <a:Value z:Id="i2" i:type="StencilEllipse">
    <GenericTypeId xmlns="...Abstracts">GE.P</GenericTypeId>
    <Guid xmlns="...Abstracts">{guid}</Guid>
    <Properties xmlns="...Abstracts">
      <a:anyType i:type="b:HeaderDisplayAttribute" xmlns:b="...KnowledgeBase">
        <b:DisplayName>Web Application</b:DisplayName>
        <b:Name/>
        <b:Value i:nil="true"/>
      </a:anyType>
      <a:anyType i:type="b:StringDisplayAttribute" xmlns:b="...KnowledgeBase">
        <b:DisplayName>Name</b:DisplayName>
        <b:Name/>
        <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">My Component</b:Value>
      </a:anyType>
      <!-- Out Of Scope, Reason, configurable attributes -->
    </Properties>
    <TypeId xmlns="...Abstracts">SE.P.TMCore.WebApp</TypeId>
    <Height xmlns="...Abstracts">100</Height>
    <Left xmlns="...Abstracts">400</Left>
    <StrokeDashArray i:nil="true" xmlns="...Abstracts"/>
    <StrokeThickness xmlns="...Abstracts">1</StrokeThickness>
    <Top xmlns="...Abstracts">200</Top>
    <Width xmlns="...Abstracts">100</Width>
  </a:Value>
</a:KeyValueOfguidanyType>
```

### ステンシルの形状タイプ

| 形状 | `i:type` | `GenericTypeId` | 説明 |
|-------|----------|-----------------|-------------|
| プロセス（円） | `StencilEllipse` | `GE.P` | プロセス、Webアプリ、サービス |
| データストア（平行線） | `StencilParallelLines` | `GE.DS` | データベース、ストレージ、キャッシュ |
| 外部関係者（長方形） | `StencilRectangle` | `GE.EI` | ユーザー、外部システム |
| 信頼境界（境界） | `BorderBoundary` | `GE.TB` | 信頼境界 |

### 一般的な`TypeId`値（SDL TMナレッジベース）

| `TypeId` | コンポーネント |
|----------|-----------|
| `SE.P.TMCore.WebApp` | Webアプリケーション |
| `SE.P.TMCore.AzureAppServiceWebApp` | Azure App Service Webアプリ |
| `SE.P.TMCore.AzureEventHub` | Azure Event Hub |
| `SE.P.TMCore.DynamicsCRM` | Dynamics CRM |
| `SE.DS.TMCore.SQL` | SQLデータベース |
| `SE.DS.TMCore.AzureSQLDB` | Azure SQLデータベース |
| `SE.EI.TMCore.Browser` | ブラウザー |
| `SE.EI.TMCore.Mobile` | モバイルクライアント |

## データフロー線

`<Lines>`内の線も`i:type="Connector"`を持つ`<a:KeyValueOfguidanyType>`を使います。

```xml
<a:KeyValueOfguidanyType>
  <a:Key>{line-guid}</a:Key>
  <a:Value z:Id="i10" i:type="Connector">
    <GenericTypeId xmlns="...Abstracts">GE.DF</GenericTypeId>
    <Guid xmlns="...Abstracts">{line-guid}</Guid>
    <Properties xmlns="...Abstracts">...</Properties>
    <TypeId xmlns="...Abstracts">SE.DF.TMCore.Request</TypeId>
    <HandleX xmlns="...Abstracts">0</HandleX>
    <HandleY xmlns="...Abstracts">0</HandleY>
    <SourceGuid xmlns="...Abstracts">{source-stencil-guid}</SourceGuid>
    <SourceX xmlns="...Abstracts">0</SourceX>
    <SourceY xmlns="...Abstracts">0</SourceY>
    <TargetGuid xmlns="...Abstracts">{target-stencil-guid}</TargetGuid>
    <TargetX xmlns="...Abstracts">0</TargetX>
    <TargetY xmlns="...Abstracts">0</TargetY>
  </a:Value>
</a:KeyValueOfguidanyType>
```

## プロパティ属性の型

Propertiesには型付きの`<a:anyType>`要素を使います。

| `i:type` | 用途 | 値 |
|----------|---------|-------|
| `b:HeaderDisplayAttribute` | セクション見出し | `i:nil="true"` |
| `b:StringDisplayAttribute` | テキスト値（Name、Reason） | `i:type="c:string"` |
| `b:BooleanDisplayAttribute` | 真偽値（Out Of Scope） | `i:type="c:boolean"` |
| `b:ListDisplayAttribute` | ドロップダウンリスト | `<b:SelectedIndex>`を持つ |

## 脅威インスタンス

脅威は`<a:KeyValueOfstringThreatpc_P0_PhOB>`（末尾が正確に`PhOB`であることに注意）を使って`<ThreatInstances>`に配置します。ステンシルとは異なり、脅威の`<a:Value>`フィールドには**`b:`プレフィックス**（`ThreatModeling.KnowledgeBase`名前空間）を付けます。また、`<a:Key>`は`TH<id> + <SourceGuid> + <FlowGuid> + <TargetGuid>`を文字どおり連結したものです。

```xml
<ThreatInstances xmlns:a="...Arrays">
  <a:KeyValueOfstringThreatpc_P0_PhOB>
    <a:Key>TH117{source-guid}{flow-guid}{target-guid}</a:Key>
    <a:Value xmlns:b="...KnowledgeBase">
      <b:ChangedBy/>
      <b:DrawingSurfaceGuid>{drawing-surface-guid}</b:DrawingSurfaceGuid>
      <b:FlowGuid>{flow-guid}</b:FlowGuid>
      <b:Id>32</b:Id>
      <b:InteractionKey>{source-guid}:{flow-guid}:{target-guid}</b:InteractionKey>
      <b:InteractionString i:nil="true"/>
      <b:ModifiedAt>2025-01-01T00:00:00</b:ModifiedAt>
      <b:Priority>High</b:Priority>
      <b:Properties>
        <a:KeyValueOfstringstring>
          <a:Key>Title</a:Key>
          <a:Value>An adversary may spoof the user and gain access</a:Value>
        </a:KeyValueOfstringstring>
        <a:KeyValueOfstringstring>
          <a:Key>UserThreatCategory</a:Key>
          <a:Value>Spoofing</a:Value>
        </a:KeyValueOfstringstring>
        <a:KeyValueOfstringstring>
          <a:Key>UserThreatShortDescription</a:Key>
          <a:Value>Spoofing is when a process or entity is something other than its claimed identity.</a:Value>
        </a:KeyValueOfstringstring>
        <a:KeyValueOfstringstring>
          <a:Key>PossibleMitigations</a:Key>
          <a:Value>Enable multi-factor authentication and least-privilege access control.</a:Value>
        </a:KeyValueOfstringstring>
        <a:KeyValueOfstringstring>
          <a:Key>Priority</a:Key>
          <a:Value>High</a:Value>
        </a:KeyValueOfstringstring>
        <a:KeyValueOfstringstring>
          <a:Key>SDLPhase</a:Key>
          <a:Value>Design</a:Value>
        </a:KeyValueOfstringstring>
      </b:Properties>
      <b:SourceGuid>{source-stencil-guid}</b:SourceGuid>
      <b:State>Mitigated</b:State>
      <b:StateInformation i:nil="true"/>
      <b:TargetGuid>{target-stencil-guid}</b:TargetGuid>
      <b:Title i:nil="true"/>
      <b:TypeId>TH117</b:TypeId>
      <b:Upgraded>false</b:Upgraded>
      <b:Wide>false</b:Wide>
    </a:Value>
  </a:KeyValueOfstringThreatpc_P0_PhOB>
</ThreatInstances>
```

**すべてのGUIDが解決できなければなりません。**`SourceGuid`と`TargetGuid`は`<Borders>`内の実在するstencilの`<a:Key>`値と一致し、`FlowGuid`は`<Lines>`内の実在するconnectorの`<a:Key>`と一致する必要があります。宙ぶらりんの参照があると、図の要素が欠落した状態でモデルが開きます。

`UserThreatCategory`には標準STRIDEカテゴリを使います：**S**（なりすまし）、**T**（改ざん）、**R**（否認）、**I**（情報漏えい）、**D**（サービス拒否）、**E**（権限昇格）。

## TM7ファイルを壊すよくある間違い

1. **`<?xml version="1.0"?>`宣言を追加する**——`DataContractSerializer`はこれを出力しない。
2. DataContract名前空間の代わりに**`xmlns:xsi`／`xmlns:xsd`を使う**。
3. **`<Border>`、`<Line>`、`<Stencil>`のような単純な要素名を使う**——`<a:KeyValueOfguidanyType>`のようなDataContractラッパー型を使う必要がある。
4. **`<SecurityGaps>`や`<Mitigations>`のようにツールが生成しない要素を作る**——これらはスキーマに存在しない。（`<MetaInformation>`、`<Notes>`、`<KnowledgeBase>`は有効なので保持する。）
5. 実際のUUID（例：`148ade68-5c80-40f3-8e1f-4e2cabdb5991`）の代わりに`users-browser`のような**人間が読めるGUIDを使う**。
6. **宙ぶらりんの参照**——`<Borders>`／`<Lines>`に実際には定義されていないステンシル／データフローGUIDを指すLine、脅威の`SourceGuid`／`TargetGuid`、または脅威の`FlowGuid`。すべての参照は含まれる要素に解決できなければならない。
7. **`z:Id`参照属性の欠落または重複**——シリアライズされる各オブジェクトには`z:Id`が必要で、各`z:Id`（例：`i1`、`i2`、`i10`）はファイル全体で**一意**でなければならない。要素追加のためテンプレートブロックを複製するときは、必ず`z:Id`（およびネストしたもの）を未使用の値に振り直す。同じidを再利用するとDataContract object idが重複し、デシリアライズに失敗する。
8. **子要素の`xmlns`が欠落する**——各`GenericTypeId`、`Guid`、`Properties`、`TypeId`などには、それぞれ`xmlns="http://schemas.datacontract.org/2004/07/ThreatModeling.Model.Abstracts"`が必要。
9. **インデント付き整形出力**——正しい出力は、本文内に追加の改行やインデントがない連続したXMLストリームである。

## 参照アセット

このスキルのディレクトリにある[`assets/example-minimal.tm7`](./assets/example-minimal.tm7)を、常に構造上の参照として使います。これは個人情報やプロジェクトデータを含まない完全に合成・無害化されたエクスポートで、1本のデータフローで接続された2つのステンシルと、すべての参照が解決する1つのSTRIDE脅威を含み、ツールで問題なく開きます。ステンシルの型、名前、プロパティ、座標、データフロー、脅威をユーザーのアーキテクチャに合わせて適応しますが、**シリアライズ形式や名前空間構造は決して変更せず**、同梱の`KnowledgeBase`にすでに存在するステンシルの`TypeId`だけを使います。生成後、名前空間、ラッパー要素、GUID参照がすべて一致することを確認するため、出力の骨格を例と照合します。
