---
name: javax-to-jakarta-migration
description: 'javax.*からjakarta.*名前空間へJavaコードを移行する。Tomcat 11、Jakarta EE 10へアップグレードするとき、またはコードベースでjavaxインポートが検出されたときに使う。'
argument-hint: "File, package, or module to migrate"
---

# javax → jakarta移行Skill

## 使用する場面
- Tomcat 11 / Jakarta EE 10以降へアップグレードするとき
- コードレビューで `javax.*` インポートが検出されたとき
- 既存プロジェクトをjakarta名前空間へ移行するとき

## 手順

### 手順1 — javaxの使用箇所をスキャンする
移行が必要な `javax.*` インポートをコードベース全体から検索する。
```
javax.servlet.*      → jakarta.servlet.*
javax.persistence.*  → jakarta.persistence.*
javax.validation.*   → jakarta.validation.*
javax.annotation.*   → jakarta.annotation.*
javax.inject.*       → jakarta.inject.*
javax.enterprise.*   → jakarta.enterprise.*
javax.faces.*        → jakarta.faces.*
javax.ws.rs.*        → jakarta.ws.rs.*
javax.el.*           → jakarta.el.*
javax.json.*         → jakarta.json.*
javax.mail.*         → jakarta.mail.*
javax.websocket.*    → jakarta.websocket.*
```

**次は移行しない**（`javax.*` のまま残す）。
- `javax.sql.*` — part of JDK
- `javax.naming.*` — part of JDK (JNDI)
- `javax.crypto.*` — part of JDK
- `javax.net.*` — part of JDK
- `javax.security.auth.*` — part of JDK
- `javax.swing.*`, `javax.xml.parsers.*` — JDK packages

### 手順2 — pom.xmlを更新する
依存関係の座標を置き換える。

| Old | New |
|-----|-----|
| `javax.servlet:javax.servlet-api` | `jakarta.servlet:jakarta.servlet-api:6.0.0` |
| `javax.persistence:javax.persistence-api` | `jakarta.persistence:jakarta.persistence-api:3.1.0` |
| `javax.validation:validation-api` | `jakarta.validation:jakarta.validation-api:3.0.2` |
| `javax.annotation:javax.annotation-api` | `jakarta.annotation:jakarta.annotation-api:2.1.1` |

### 手順3 — web.xmlを更新する（存在する場合）
```xml
<!-- Old namespace -->
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee" version="4.0">

<!-- New namespace -->
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee" version="6.0">
```

### 手順4 — Javaソースファイルを更新する
`.java` ファイル内のすべての `javax.` インポートを対応する `jakarta.` に置き換える。

### 手順5 — 検証する
1. `mvn clean compile` または `gradlew build` を実行し、コンパイルエラーを修正する。
2. `mvn test` または `gradlew test` を実行し、すべてのテストが成功することを確認する。
3. 残っている `javax.*` インポートを検索する（JDKパッケージを除く）。

### 出力
変更したすべてのファイル、置換したインポート、必要な手動手順を含む移行概要を提示する。
