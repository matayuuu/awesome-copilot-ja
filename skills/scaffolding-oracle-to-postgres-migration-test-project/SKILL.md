---
name: scaffolding-oracle-to-postgres-migration-test-project
description: '.NET solution内でOracleをtargetとするxUnit integration test projectをscaffoldします。test project、transaction-rollback base class、seed data managerを作成します。Oracle baseline integration testを書く前のPhase 3だけで使用します。Phase 6では呼び出さないでください — PostgreSQL test projectはこのprojectをmigrationして作成し、このSkillを再実行して作るものではありません。'
---
# Oracle-to-PostgreSQL migration 用 Integration Test Project の scaffold

単一のtarget project向けに、transaction managementとseed data infrastructureを備えた、compile可能な空のxUnit test projectを作成します。testを書く前にprojectごとに1回実行します。

## Workflow（作業手順）

```
Progress:
- [ ] Step 1: Inspect the target project
- [ ] Step 2: Create the xUnit test project
- [ ] Step 3: Implement transaction-rollback base class
- [ ] Step 4: Implement seed data manager
- [ ] Step 5: Verify the project compiles
```

**Step 1: target projectを調査する**

target projectの`.csproj`を読み、.NET versionと既存のpackage referenceを確認します。versionは正確に合わせ、upgradeしません。

**Step 2: xUnit test projectを作成する**

- test対象applicationと同じ.NET versionをtargetにする。
- Oracle database connectivity（`Oracle.ManagedDataAccess.Core`）とxUnitのNuGet packageを追加する。
- target projectだけへのproject referenceを追加する — 他のapplication projectは追加しない。
- Oracle database connectivity用に設定した`appsettings.json`を追加する。

**Step 3: transaction-rollback base classを実装する**

- 各testの前にtransactionを開き、後でrollbackするbase test classを作成する。
- rollbackを保証するため、すべてのexceptionをcatchして処理する。
- downstreamのすべてのtest classが継承できるpatternにする。

**Step 4: seed data managerを実装する**

- transaction scope内でtest dataをloadするglobal seed managerを作成する。
- seed dataをcommitしない — 各test後にtransactionがrollbackする。
- `TRUNCATE TABLE`を使わない — 既存のdatabase dataを保持する。
- downstream test creationが従うseed file locationのnaming conventionを定める。

**Step 5: projectのcompileを検証する**

test projectをbuildし、終了前にerrorなしでcompileできることを確認します。

## 主な制約

- **Phase 3 only** — このSkillはOracle-targeting test projectをscaffoldする。PostgreSQL test project（Phase 6）はこのprojectをcopyしてmigrateして作成するため、その時点でこのSkillを再実行しない。
- Oracleがgolden behavior source — Oracle用だけをscaffoldし、PostgreSQL用にはしない。
- 既存の.NETとC# versionを維持し、新しいlanguage featureやruntime featureを導入しない。
- outputはinfrastructureだけを含む空のtest project — test caseは含めない。
