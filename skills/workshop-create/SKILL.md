---
name: workshop-create
description: '新しい workshop を作成するか、既存のディレクトリを workshop として使う。2つの経路に対応する: (A) オペレーターが指定した既存のローカルディレクトリを使う、または (B) サインイン済みアカウントに新しいプライベート GitHub リポジトリを作成する。別のリポジトリ内にリポジトリを作成しない。'
---
# Workshop を作成

desks が配置されるルートディレクトリである新しい workshop をセットアップする。

## 使用する場面

- オペレーターが「workshop を作成」または「新しい workshop を開始」と言う場合
- オペレーターが共有ルートの下で作業を整理したい場合
- オペレーターが workshop として使いたい既存ディレクトリを持っている場合

## 2つの経路

### 経路 A: 既存のディレクトリを使う

オペレーターが使いたいフォルダーをすでに持っている。クローンしたリポジトリの場合も、ローカルプロジェクトフォルダーの場合もある。

1. **パスの存在を確認する。** なければ、オペレーターに有効なパスを尋ねる。
2. **既存の workshop マーカーを検出する。** `desks/` または `classroom/`
フォルダー、`workshop.md`、`CAIRN.md`、`hands-up.md` を探す。これらのいずれかが見つかれば既存の workshop だが、これは検出であり停止条件ではない。次の手順へ進み、不足しているものを追加する。既存の内容を上書きしない。
3. **workshop 構造をスキャフォールドする**（不足しているものだけ）:
   ```
   <path>/
     desks/           # where desks live
     bench/            # shared workspace
     CAIRN.md          # operating disposition
     README.md         # workshop map
   ```
4. **`git init` を実行しない。** ディレクトリがすでに Git リポジトリである場合や、オペレーターがまだ作成を望まない場合がある。Git の状態を変更しない。
5. **GitHub リポジトリを作成しない。** この経路はローカル専用である。

### 経路 B: 新しいプライベート GitHub リポジトリを作成する

オペレーターが GitHub リポジトリを基盤とする新しい workshop を望んでいる。

1. **workshop 名を決める。** 短く、空白を含めず、kebab-case を推奨する。
2. **クローン先の親を選び、検証する。** `gh repo create --clone` は
   **現在の作業ディレクトリ**へクローンするため、まず明示的な親
   ディレクトリを選ぶ（オペレーターに尋ねるか、設定済みの workshop
   ディレクトリを使う）。その親がすでに git リポジトリの内部に **ない** ことを確認する:
   ```bash
   git -C <parent-dir> rev-parse --is-inside-work-tree
   ```
   `true` と表示された場合は別の親を選ぶ。そうしないと新しいリポジトリが既存のリポジトリ内に入れ子になる。必要なら親を作成する。
3. **その親からリポジトリを作成してクローンする:**
   ```bash
   cd <parent-dir>
   gh repo create <owner>/<name> --private --clone
   ```
   `<owner>` にはオペレーターがサインインしている GitHub アカウントを使う。
4. **クローンしたリポジトリ内に workshop 構造の雛形を作る。** Git は
   空のディレクトリを追跡しないため、ほかに内容がないフォルダーにはプレースホルダーを追加する。そうしないと次回のクローンで雛形が残らない:
   ```
   <name>/
     desks/.gitkeep
     bench/.gitkeep
     CAIRN.md
     README.md
   ```
5. `.gitkeep` のプレースホルダーを含む雛形をコミットして push する。

### 重要: リポジトリを入れ子にしない

**すでに git リポジトリの内部にあるディレクトリで `git init` を実行しない。** 初期化前に次を確認する:

```bash
git -C <parent-dir> rev-parse --is-inside-work-tree
```

`true` が返った場合、親はすでに git リポジトリである。その中に別のリポジトリを作成しない。次のいずれかを選ぶ:
- 経路 A を使う（雛形だけを作成し、git は使わない）
- またはリポジトリの内部ではない別の場所へクローンする

## CAIRN.md の内容

すべての desk が読む運用方針:

```markdown
# cairn

the trail markers that say: someone was here, and they were honest.

## how a desk stands

- **stop is a valid finish.** don't force a result when the evidence
  says stop. "this doesn't work" is a finding, not a failure.
- **"done" means it holds.** if you'd bet your desk on it, ship it.
  if not, say what's uncertain and why.
- **hold scope.** touch only what the task needs. if you find something
  outside scope, note it and move on — don't chase it.
- **never go silent, never bluff.** partial + honest > complete + wrong.
  if you're stuck, say so. if you're unsure, say that too.
- **equal standing.** you can say "that's the wrong question." you can
  disagree with another desk. you answer to evidence, not hierarchy.

## the bench

the shared workspace. leave your work where others can find it.
label it. if it supersedes earlier work, say so.

## hands-up

when two desks disagree and can't settle it against external facts,
that's a hands-up. it goes to the operator. this is the system
working, not failing.
```

## 作成後

オペレーターに次を伝える:
- workshop の場所（完全なパス）
- これで `desk-open` を使って desk を開けること
- desk がシグナルを出し始めると Cairn にシグナルが表示されること

## 原則

- workshop は製品ではなく場所である。単純に保つ。
- 配置場所はオペレーターが決める。推測しない。
- 既存ディレクトリにすでに作業内容がある場合は、すべて保持する。
  不足しているものだけを追加する。
