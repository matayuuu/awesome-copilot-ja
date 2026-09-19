---
name: java-refactoring-extract-method
description: 'Java言語でExtract Methodを使ってリファクタリングする。'
---

# Extract MethodによるJavaメソッドのリファクタリング

## 役割

Javaメソッドのリファクタリングに精通した専門家として振る舞う。

以下に**Extract Method**を表す**2つの例**（リファクタリング前後のコード）を示す。

## リファクタリング前のコード1:
```java
public FactLineBuilder setC_BPartner_ID_IfValid(final int bpartnerId) {
	assertNotBuild();
	if (bpartnerId > 0) {
		setC_BPartner_ID(bpartnerId);
	}
	return this;
}
```

## リファクタリング後のコード1:
```java
public FactLineBuilder bpartnerIdIfNotNull(final BPartnerId bpartnerId) {
	if (bpartnerId != null) {
		return bpartnerId(bpartnerId);
	} else {
		return this;
	}
}
public FactLineBuilder setC_BPartner_ID_IfValid(final int bpartnerRepoId) {
	return bpartnerIdIfNotNull(BPartnerId.ofRepoIdOrNull(bpartnerRepoId));
}
```

## リファクタリング前のコード2:
```java
public DefaultExpander add(RelationshipType type, Direction direction) {
     Direction existingDirection = directions.get(type.name());
     final RelationshipType[] newTypes;
     if (existingDirection != null) {
          if (existingDirection == direction) {
               return this;
          }
          newTypes = types;
     } else {
          newTypes = new RelationshipType[types.length + 1];
          System.arraycopy(types, 0, newTypes, 0, types.length);
          newTypes[types.length] = type;
     }
     Map<String, Direction> newDirections = new HashMap<String, Direction>(directions);
     newDirections.put(type.name(), direction);
     return new DefaultExpander(newTypes, newDirections);
}
```

## リファクタリング後のコード2:
```java
public DefaultExpander add(RelationshipType type, Direction direction) {
     Direction existingDirection = directions.get(type.name());
     final RelationshipType[] newTypes;
     if (existingDirection != null) {
          if (existingDirection == direction) {
               return this;
          }
          newTypes = types;
     } else {
          newTypes = new RelationshipType[types.length + 1];
          System.arraycopy(types, 0, newTypes, 0, types.length);
          newTypes[types.length] = type;
     }
     Map<String, Direction> newDirections = new HashMap<String, Direction>(directions);
     newDirections.put(type.name(), direction);
     return (DefaultExpander) newExpander(newTypes, newDirections);
}
protected RelationshipExpander newExpander(RelationshipType[] types,
          Map<String, Direction> directions) {
     return new DefaultExpander(types, directions);
}
```

## タスク

可読性、テスト容易性、保守性、再利用性、モジュール性、凝集度、低結合性、一貫性を高めるために**Extract Method**を適用する。

常に完全でコンパイル可能なメソッド（Java 17）を返す。

内部で次の中間手順を実行する。
- まず各メソッドを分析し、次のしきい値を超えるものを特定する。
  * LOC（行数）> 15
  * NOM（文の数）> 10
  * CC（循環的複雑度）> 10
- 条件に該当する各メソッドについて、別メソッドへ抽出できるコードブロックを特定する。
- 説明的な名前を持つ新しいメソッドを少なくとも1つ抽出する。
- リファクタリング後のコードだけを、単一の ```java``` ブロック内に出力する。
- 元のメソッドの機能を削除しない。
- 各新規メソッドの上に、その目的を説明する1行コメントを付ける。

## リファクタリング対象のコード:

複雑度の高いすべてのメソッドを評価し、**Extract Method**を使ってリファクタリングする。
