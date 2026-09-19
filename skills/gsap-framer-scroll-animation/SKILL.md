---
name: gsap-framer-scroll-animation
description: >-
  ユーザーが vanilla JS、React、Next.js でスクロールアニメーション、スクロール効果、パララックス、
  スクロール連動の表示、ピン留めセクション、横スクロール、テキストアニメーション、または
  スクロール位置に連動するモーションを作りたい場合に、この Skill を使う。
  GSAP ScrollTrigger（pinning、scrubbing、snapping、timelines、horizontal scroll、ScrollSmoother、
  matchMedia）と Framer Motion / Motion v12（useScroll、useTransform、useSpring、whileInView、
  variants）を扱う。「スクロールでアニメーション」「スクロール中にフェードイン」「Apple のような
  スクロール」「パララックス効果」「sticky section」「スクロール進捗バー」「entrance animation」
  とだけ言われた場合にも使う。GSAP または Framer Motion のコード生成を求める Copilot プロンプト
  パターンにも対応する。創造的な考え方とデザイン品質の向上には premium-frontend-ui Skill と組み合わせる。
metadata:
  author: 'Utkarsh Patrikar'
  author_url: 'https://github.com/utkarsh232005'
---

# GSAP と Framer Motion — スクロールアニメーション Skill

GitHub Copilot プロンプト、すぐ使えるコードレシピ、詳細な API リファレンスを備えた本番品質のスクロールアニメーション。

> **デザイン上の補助:** この Skill はスクロール駆動モーションの*技術実装*を提供する。
> アニメーションの**方法**と**タイミング**を導く*創造的な考え方*、デザイン原則、プレミアムな美学については、
> 常に **premium-frontend-ui** Skill を参照する。両者を組み合わせることで、premium-frontend-ui が
> **何を**、**なぜ**行うかを決め、この Skill が**どのように**実装するかを担う。

## ライブラリのクイック選択

| 要件 | 使用するもの |
|---|---|
| Vanilla JS、Webflow、Vue | **GSAP** |
| ピン留め、横スクロール、複雑なタイムライン | **GSAP** |
| React / Next.js、宣言的なスタイル | **Framer Motion** |
| whileInView による entrance animation | **Framer Motion** |
| 同じ Next.js アプリで両方を使う | references の注記を参照 |

完全なレシピと Copilot プロンプトについては、関連するリファレンスファイルを読む。

- **GSAP** → `references/gsap.md` — ScrollTrigger API、全レシピ、React 統合
- **Framer Motion** → `references/framer.md` — useScroll、useTransform、全レシピ

## セットアップ（必ず最初に行う）

### GSAP
```bash
npm install gsap
```
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger); // MUST call before any ScrollTrigger usage
```

### Framer Motion (Motion v12, 2025)
```bash
npm install motion   # new package name since mid-2025
# or: npm install framer-motion  — still works, same API
```
```js
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
// legacy: import { motion } from 'framer-motion'  — also valid
```

## ワークフロー

1. ユーザーの意図を解釈し、GSAP と Framer Motion のどちらが適切か判断する。
2. 詳細な API とパターンについて `references/` の関連文書を読む。
3. 必要なパッケージがまだ存在しなければ、インストールを提案する。
4. 求められた形式（React コンポーネント、hook 要件、vanilla JS）に従って、アニメーション構造の雛形を実装する。
5. アクセシビリティ設定を用意し、hook が無限再レンダリングを起こさないようにしながら、スクロール要素と in-view 要素に適切なツールを適用する。

## よく使う 5 つのスクロールパターン

クイックリファレンス。Copilot プロンプト付きの完全なレシピはリファレンスファイルにある。

### 1. Fade-in on enter (GSAP)
```js
gsap.from('.card', {
  opacity: 0, y: 50, stagger: 0.15, duration: 0.8,
  scrollTrigger: { trigger: '.card', start: 'top 85%' }
});
```

### 2. Fade-in on enter (Framer Motion)
```jsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.6 }}
/>
```

### 3. Scrub / scroll-linked (GSAP)
```js
gsap.to('.hero-img', {
  scale: 1.3, opacity: 0, ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
});
```

### 4. Scroll-linked (Framer Motion)
```jsx
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
return <motion.div style={{ y }} />;
```

### 5. Pinned timeline (GSAP)
```js
const tl = gsap.timeline({
  scrollTrigger: { trigger: '.section', pin: true, scrub: 1, start: 'top top', end: '+=200%' }
});
tl.from('.title', { opacity: 0, y: 60 }).from('.img', { scale: 0.85 });
```

## 重要なルール（常に適用する）

- **GSAP**: 使用前に必ず `gsap.registerPlugin(ScrollTrigger)` を呼び出す
- **GSAP scrub**: 必ず `ease: 'none'` を使う。scrub 中の easing は不自然に感じられる
- **GSAP React**: `@gsap/react` の `useGSAP` を使い、通常の `useEffect` は使わない。ScrollTrigger を自動でクリーンアップできる
- **GSAP デバッグ**: 開発中は `markers: true` を追加し、本番前に削除する
- **Framer**: `useTransform` の出力は通常の div ではなく、`motion.*` 要素の `style` prop に渡す
- **Framer Next.js**: motion hook を使うファイルの先頭には必ず `'use client'` を追加する
- **両方**: `transform` と `opacity` だけをアニメーションし、`width`、`height`、`box-shadow` は避ける
- **アクセシビリティ**: 必ず `prefers-reduced-motion` を確認する。パターンは各リファレンスファイルを参照する
- **プレミアムな仕上げ**: モーションのタイミング、easing カーブ、抑制について **premium-frontend-ui** Skill の原則に従う。アニメーションは補助するものであり、圧倒してはならない

## Copilot へのプロンプト作成のヒント

- 最初に完全な selector、基準画像、スクロール範囲を Copilot に渡す。曖昧なプロンプトからは曖昧なコードが生まれる
- GSAP では selector、start/end 文字列、scrub と toggleActions のどちらが必要かを必ず指定する
- Framer では使用する hook（useScroll または whileInView）、offset 値、変換対象を必ず指定する
- `/fix` を依頼するときは正確なエラーメッセージを貼る。実際のエラーがある方が Copilot の修正精度は大幅に高い
- Copilot Chat では `@workspace` スコープを使い、既存のコンポーネント構造を読み取らせる

## リファレンスファイル

| ファイル | 内容 |
|---|---|
| `references/gsap.md` | ScrollTrigger API 完全リファレンス、10 レシピ、React（useGSAP）、Lenis、matchMedia、アクセシビリティ |
| `references/framer.md` | useScroll / useTransform API 完全リファレンス、8 レシピ、variants、Motion v12 の注記、Next.js のヒント |

## 関連 Skill

| Skill | 関係 |
|---|---|
| **premium-frontend-ui** | Creative philosophy, design principles, and aesthetic guidelines — defines *when* and *why* to animate |
