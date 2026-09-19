---
name: react19-source-patterns
description: 'react19-source-patterns に関する作業を支援する Skill です。対象のファイルや設定を確認し、必要な手順、検証方法、注意点を案内します。対象技術の調査、実装、運用、トラブルシューティングに使用します。'
---

# React 19 Source Migration Patterns

Reference for every source-file migration required for React 19.

## Quick Reference Table

| Pattern | Action | Reference |
|---|---|---|
| `ReactDOM.render(...)` | → `createRoot().render()` | See references/api-migrations.md |
| `ReactDOM.hydrate(...)` | → `hydrateRoot(...)` | See references/api-migrations.md |
| `unmountComponentAtNode` | → `root.unmount()` | Inline fix |
| `ReactDOM.findDOMNode` | → direct ref | Inline fix |
| `forwardRef(...)` wrapper | → ref as direct prop | See references/api-migrations.md |
| `Component.defaultProps = {}` | → ES6 default params | See references/api-migrations.md |
| `useRef()` no arg | → `useRef(null)` | Inline fix  add `null` |
| Legacy Context | → `createContext` | [→ api-migrations.md#legacy-context](references/api-migrations.md#legacy-context) |
| String refs `this.refs.x` | → `createRef()` | [→ api-migrations.md#string-refs](references/api-migrations.md#string-refs) |
| `import React from 'react'` (unused) | Remove | Only if no `React.` usage in file |

## PropTypes Rule

Do **not** remove `.propTypes` assignments. The `prop-types` package still works as a standalone validator. React 19 only removes the built-in runtime checking from the React package  the package itself remains valid.

Add this comment above any `.propTypes` block:
```jsx
// NOTE: React 19 no longer runs propTypes validation at runtime.
// PropTypes kept for documentation and IDE tooling only.
```

## Read the Reference

For full before/after code for each migration, read **`references/api-migrations.md`**. It contains the complete patterns including edge cases for `forwardRef` with `useImperativeHandle`, `defaultProps` null vs undefined behavior, and legacy context provider/consumer cross-file migrations.
