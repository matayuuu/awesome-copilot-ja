---
name: sandbox-npm-install
description: 'Docker sandbox environmentにnpm packageをインストールします。workspaceがvirtiofsでmountされたcontainer内でnode_modulesをインストール、再インストール、更新する必要がある場合に使用します。native binary（esbuild、lightningcss、rollup）はvirtiofs上でクラッシュするため、packageはlocal ext4 filesystemへインストールしてからsymlinkで戻します。'
---
# Sandboxでのnpm install

## このSkillを使う場面

次の場合は必ずこの Skill を使います。
- 新しい sandbox sessionで初めてnpm packageをインストールするとき
- `package.json`または`package-lock.json`が変更され、再インストールが必要なとき
- `SIGILL`、`SIGSEGV`、`mmap`、`unaligned sysNoHugePageOS`などのerrorでnative binaryがクラッシュするとき
- `node_modules` directoryがない、または壊れているとき

## 前提条件

- virtiofs で workspace が mount された Docker sandbox environment
- container で Node.js と npm が使用できること
- target workspace に `package.json` file があること

## 背景

Docker sandbox workspaceは通常**virtiofs**（hostとLinux VM間のfile sync）でmountされます。native Go / Rust binary（esbuild、lightningcss、rollupなど）は、aarch64のvirtiofsから実行するとmmap alignment failureでcrashします。containerのlocal ext4 filesystemへinstallし、workspaceへsymlinkを戻して解決します。

## インストール手順

workspace root から同梱の install script を実行します。

```bash
bash scripts/install.sh
```

### 主なoption

| option | 説明 |
|---|---|
| `--workspace <path>` | `package.json`を含むdirectoryへのpath（省略時はauto-detect） |
| `--playwright` | E2E testing用にPlaywright Chromium browserもinstall |

### Scriptの動作

1. `package.json`、`package-lock.json`、`.npmrc`（存在する場合）をlocal ext4 directoryへコピーする
2. local filesystemで`npm ci`（lockfileがなければ`npm install`）を実行する
3. `node_modules`をworkspaceへsymlinkする
4. 存在する場合、既知のnative binary（esbuild、rollup、lightningcss、vite）を検証する
5. 任意でPlaywright browserとsystem dependencyをインストールする（利用可能なら`sudo`を使用）

検証に失敗した場合はscriptを再実行します。初期setup中のcrashは一時的なことがあります。

## インストール後の検証

script完了後、toolchainが動作することを確認します。例:

```bash
npm test             # Run project tests
npm run build        # Build the project
npm run dev          # Start dev server
```

## 重要な注意

- local install directory（例: `/home/agent/project-deps`）は**container-local**で、hostへ同期されない
- `node_modules` symlinkはhostではbroken linkに見えるが、通常`node_modules`はgitignore対象なので問題ない
- hostで`npm ci`または`npm install`を実行すると、symlinkは自然に実directoryへ置き換わる
- `package.json`または`package-lock.json`を変更したら、install scriptを再実行する
- mountされたworkspaceで`npm ci`や`npm install`を直接実行しない — native binaryがcrashする

## トラブルシューティング

| 問題 | 解決策 |
|---|---|
| dev server実行時の`SIGILL`または`SIGSEGV` | install scriptを再実行し、workspaceで`npm install`を直接実行していないことを確認する |
| install後に`node_modules`が見つからない | symlinkの存在を`ls -la node_modules`で確認する |
| install中のpermission error | local deps directoryへcurrent userがwriteできることを確認する |
| verificationが断続的に失敗 | scriptを再実行する — native binaryの初回load時クラッシュは非決定的な場合がある |

## Viteの互換性

projectがViteを使う場合、symlink pathを`server.fs.allow`で許可する必要があります。Viteがsymlink経由でfileをserveできるよう、symlink targetのparent directory（例: `/home/agent/project-deps/`）をVite configへ追加します。
