---
name: context-map
description: '変更を加える前に、タスクに関連するすべてのファイルを整理したコンテキストマップを生成する。'
---

# コンテキストマップ

変更を実装する前にコードベースを分析し、コンテキストマップを作成してください。

## タスク

{{task_description}}

## 手順

1. このタスクに関連するファイルをコードベースから検索する
2. 直接の依存関係（import/export）を特定する
3. 関連するテストを見つける
4. 既存コードから類似パターンを探す

## 出力形式

```markdown
## Context Map

### Files to Modify
| File | Purpose | Changes Needed |
|------|---------|----------------|
| path/to/file | description | what changes |

### Dependencies (may need updates)
| File | Relationship |
|------|--------------|
| path/to/dep | imports X from modified file |

### Test Files
| Test | Coverage |
|------|----------|
| path/to/test | tests affected functionality |

### Reference Patterns
| File | Pattern |
|------|---------|
| path/to/similar | example to follow |

### Risk Assessment
- [ ] Breaking changes to public API
- [ ] Database migrations needed
- [ ] Configuration changes required
```

このマップがレビューされるまで実装を開始しないでください。
