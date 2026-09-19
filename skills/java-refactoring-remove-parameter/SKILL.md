---
name: java-refactoring-remove-parameter
description: 'Java言語でRemove Parameterを使ってリファクタリングする。'
---

# Remove ParameterによるJavaメソッドのリファクタリング

## 役割

Javaメソッドのリファクタリングに精通した専門家として振る舞う。

以下に**Remove Parameter**を表す**2つの例**（リファクタリング前後のコード）を示す。

## リファクタリング前のコード1:
```java
public Backend selectBackendForGroupCommit(long tableId, ConnectContext context, boolean isCloud)
        throws LoadException, DdlException {
    if (!Env.getCurrentEnv().isMaster()) {
        try {
            long backendId = new MasterOpExecutor(context)
                    .getGroupCommitLoadBeId(tableId, context.getCloudCluster(), isCloud);
            return Env.getCurrentSystemInfo().getBackend(backendId);
        } catch (Exception e) {
            throw new LoadException(e.getMessage());
        }
    } else {
        return Env.getCurrentSystemInfo()
                .getBackend(selectBackendForGroupCommitInternal(tableId, context.getCloudCluster(), isCloud));
    }
}
```

## リファクタリング後のコード1:
```java
public Backend selectBackendForGroupCommit(long tableId, ConnectContext context)
        throws LoadException, DdlException {
    if (!Env.getCurrentEnv().isMaster()) {
        try {
            long backendId = new MasterOpExecutor(context)
                    .getGroupCommitLoadBeId(tableId, context.getCloudCluster());
            return Env.getCurrentSystemInfo().getBackend(backendId);
        } catch (Exception e) {
            throw new LoadException(e.getMessage());
        }
    } else {
        return Env.getCurrentSystemInfo()
                .getBackend(selectBackendForGroupCommitInternal(tableId, context.getCloudCluster()));
    }
}
```

## リファクタリング前のコード2:
```java
NodeImpl( long id, long firstRel, long firstProp )
{
     this( id, false );
}
```

## リファクタリング後のコード2:
```java
NodeImpl( long id)
{
     this( id, false );
}
```

## タスク

可読性、テスト容易性、保守性、再利用性、モジュール性、凝集度、低結合性、一貫性を高めるために**Remove Parameter**を適用する。

常に完全でコンパイル可能なメソッド（Java 17）を返す。

内部で次の中間手順を実行する。
- まず各メソッドを分析し、未使用または冗長なパラメーター（クラスフィールド、定数、他のメソッド呼び出しから取得できる値）を特定する。
- 条件に該当する各メソッドについて、定義と内部のすべての呼び出しから不要なパラメーターを削除する。
- パラメーター削除後もメソッドが正しく動作することを確認する。
- リファクタリング後のコードだけを、単一の ```java``` ブロック内に出力する。
- 元のメソッドの機能を削除しない。
- 各変更メソッドの上に、削除したパラメーターとその理由を示す1行コメントを付ける。

## リファクタリング対象のコード:

未使用パラメーターを持つすべてのメソッドを評価し、**Remove Parameter**を使ってリファクタリングする。
