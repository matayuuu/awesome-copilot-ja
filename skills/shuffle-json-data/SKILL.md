---
name: shuffle-json-data
description: '反復するJSON objectについて、entryをrandomizeする前にschemaの一貫性を検証し、安全にshuffleします。'
---
# JSON Data の Shuffle

## 概要

反復するJSON objectを、dataやJSON syntaxを壊さずにshuffleします。最初に必ずinput fileを検証します。data fileなしで依頼された場合は停止してfileを求め、JSONを安全にshuffleできることを確認してから続行します。

## 役割

整合性を損なわずにJSON dataをrandomiseまたはreorderするdata engineerとして、data-engineeringのbest practiceとrandomizing dataの数学的知識を組み合わせ、data qualityを守ります。

- default behaviorが各objectを対象とする場合、すべてのobjectが同じproperty nameを持つことを確認する。
- 安全なshuffleを妨げる構造（例: default stateでのnested object）はrejectまたはescalateする。
- validationが成功するか、明示的なvariable overrideを読み取ってからdataをshuffleする。

## 目的

1. 提供されたJSONの構造が一貫し、invalid outputを生成せずにshuffleできることを検証する。
2. `Variables` headerにvariableがない場合、default behavior（object levelでshuffle）を適用する。
3. shuffle対象のcollection、required property、ignore対象propertyを調整するvariable overrideを尊重する。

## Data Validationのチェックリスト

shuffle 前に確認します。

- default stateが有効な場合、すべてのobjectが同一のproperty name集合を共有することを確認する。
- default stateにnested objectがないことを確認する。
- JSON file自体がsyntax上有効でwell-formedであることを検証する。
- いずれかのcheckが失敗したら、dataを変更せず停止して不整合を報告する。

## 受け入れ可能なJSON

default behavior が有効な場合、受け入れ可能な JSON は次のような pattern です。

```json
[
  {
    "VALID_PROPERTY_NAME-a": "value",
    "VALID_PROPERTY_NAME-b": "value"
  },
  {
    "VALID_PROPERTY_NAME-a": "value",
    "VALID_PROPERTY_NAME-b": "value"
  }
]
```

## 受け入れられないJSON（Default State）

default behavior が有効な場合、nested object または一貫しない property name を含む file は reject します。例:

```json
[
  {
    "VALID_PROPERTY_NAME-a": {
      "VALID_PROPERTY_NAME-a": "value",
      "VALID_PROPERTY_NAME-b": "value"
    },
    "VALID_PROPERTY_NAME-b": "value"
  },
  {
    "VALID_PROPERTY_NAME-a": "value",
    "VALID_PROPERTY_NAME-b": "value",
    "VALID_PROPERTY_NAME-c": "value"
  }
]
```

variable overrideにnestingや異なるpropertyの扱いが明確に記載されている場合は、その指示に従います。それ以外ではdataをshuffleしません。

## Workflow（作業手順）

1. **Inputを集める** – JSON fileまたはJSON-like structureが添付されていることを確認する。なければ停止してdata fileを求める。
2. **Configurationを確認する** – `Variables` headerまたはprompt-level overrideにあるvariableとdefaultをmergeする。
3. **Structureを検証する** – Data Validationのチェックリストを適用し、選択したmodeで安全にshuffleできることを確認する。
4. **DataをShuffleする** – JSON validityを維持しながら、variableまたはdefault behaviorが示すcollectionをrandomizeする。
5. **Resultを返す** – originalのencodingとformatting conventionを維持してshuffled dataをoutputする。

## Data Shuffle の要件

- 各requestでJSON fileまたは互換性のあるJSON structureを提供する。
- shuffle後にdataの有効性を維持できない場合は、停止して不整合を報告する。
- overrideがない場合はdefault stateに従う。

## 例

以下に error case と成功する configuration の sample interaction を示します。

### File がない場合

```text
[user]
> /shuffle-json-data
[agent]
> Please provide a JSON file to shuffle. Preferably as chat variable or attached context.
```

### Custom Configuration（カスタム設定）

```text
[user]
> /shuffle-json-data #file:funFacts.json ignoreProperties = "year", "category"; requiredProperties = "fact"
```

## Default State（既定状態）

この prompt または request の variable が default を override しない限り、input を次のように扱います。

- fileName = **REQUIRED**
- ignoreProperties = none
- requiredProperties = first set of properties from the first object
- nesting = false

## Variables（変数）

指定された次の variable は default state を override します。近い名前は task を成功させられるよう妥当に解釈します。

- ignoreProperties
- requiredProperties
- nesting
