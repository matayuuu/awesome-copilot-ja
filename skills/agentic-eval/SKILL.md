---
name: agentic-eval
description: 'AI Agentの出力を評価・改善するパターンと技法。自己批評・リフレクションループ、品質重視の生成向け評価器・最適化器パイプライン、テスト駆動のコード改善、ルーブリックまたはLLM-as-judge評価、コード・レポート・分析の反復改善、Agent応答品質の測定・改善で使う。'
---

# Agentic評価のパターン

反復的な評価と改善を通じた自己改善のパターン。

## 概要

評価パターンにより、Agentは自身の出力を評価・改善できる。単発生成を越え、反復的な改善ループへ移行する。

```
Generate → Evaluate → Critique → Refine → Output
    ↑                              │
    └──────────────────────────────┘
```

## 使う場面

- **品質が重要な生成**: 高い正確性が必要なコード、レポート、分析
- **評価基準が明確なタスク**: 成功指標が定義されている場合
- **特定の標準が必要なコンテンツ**: スタイルガイド、コンプライアンス、書式

---

## パターン1: 基本的なリフレクション

Agentが自己批評を通じて自身の出力を評価・改善する。

```python
def reflect_and_refine(task: str, criteria: list[str], max_iterations: int = 3) -> str:
    """Generate with reflection loop."""
    output = llm(f"Complete this task:\n{task}")
    
    for i in range(max_iterations):
        # Self-critique
        critique = llm(f"""
        Evaluate this output against criteria: {criteria}
        Output: {output}
        Rate each: PASS/FAIL with feedback as JSON.
        """)
        
        critique_data = json.loads(critique)
        all_pass = all(c["status"] == "PASS" for c in critique_data.values())
        if all_pass:
            return output
        
        # Refine based on critique
        failed = {k: v["feedback"] for k, v in critique_data.items() if v["status"] == "FAIL"}
        output = llm(f"Improve to address: {failed}\nOriginal: {output}")
    
    return output
```

**重要な洞察**: 批評結果を確実に解析するため、構造化JSON出力を使う。

---

## パターン2: 評価器と最適化器

生成と評価を別コンポーネントへ分離し、責任範囲を明確にする。

```python
class EvaluatorOptimizer:
    def __init__(self, score_threshold: float = 0.8):
        self.score_threshold = score_threshold
    
    def generate(self, task: str) -> str:
        return llm(f"Complete: {task}")
    
    def evaluate(self, output: str, task: str) -> dict:
        return json.loads(llm(f"""
        Evaluate output for task: {task}
        Output: {output}
        Return JSON: {{"overall_score": 0-1, "dimensions": {{"accuracy": ..., "clarity": ...}}}}
        """))
    
    def optimize(self, output: str, feedback: dict) -> str:
        return llm(f"Improve based on feedback: {feedback}\nOutput: {output}")
    
    def run(self, task: str, max_iterations: int = 3) -> str:
        output = self.generate(task)
        for _ in range(max_iterations):
            evaluation = self.evaluate(output, task)
            if evaluation["overall_score"] >= self.score_threshold:
                break
            output = self.optimize(output, evaluation)
        return output
```

---

## パターン3: コード固有のリフレクション

コード生成向けのテスト駆動改善ループ。

```python
class CodeReflector:
    def reflect_and_fix(self, spec: str, max_iterations: int = 3) -> str:
        code = llm(f"Write Python code for: {spec}")
        tests = llm(f"Generate pytest tests for: {spec}\nCode: {code}")
        
        for _ in range(max_iterations):
            result = run_tests(code, tests)
            if result["success"]:
                return code
            code = llm(f"Fix error: {result['error']}\nCode: {code}")
        return code
```

---

## 評価戦略

### 成果ベース
出力が期待される結果を達成しているか評価する。

```python
def evaluate_outcome(task: str, output: str, expected: str) -> str:
    return llm(f"Does output achieve expected outcome? Task: {task}, Expected: {expected}, Output: {output}")
```

### LLM-as-Judge
LLMを使って出力を比較し、順位付けする。

```python
def llm_judge(output_a: str, output_b: str, criteria: str) -> str:
    return llm(f"Compare outputs A and B for {criteria}. Which is better and why?")
```

### ルーブリックベース
重み付きの観点に照らして出力を採点する。

```python
RUBRIC = {
    "accuracy": {"weight": 0.4},
    "clarity": {"weight": 0.3},
    "completeness": {"weight": 0.3}
}

def evaluate_with_rubric(output: str, rubric: dict) -> float:
    scores = json.loads(llm(f"Rate 1-5 for each dimension: {list(rubric.keys())}\nOutput: {output}"))
    return sum(scores[d] * rubric[d]["weight"] for d in rubric) / 5
```

---

## ベストプラクティス

| 実践 | 理由 |
|----------|-----------|
| **明確な基準** | 具体的で測定可能な評価基準を事前に定義する |
| **反復回数の制限** | 無限ループを防ぐため最大反復回数（3～5）を設定する |
| **収束チェック** | 反復間で出力スコアが改善しなければ停止する |
| **履歴の記録** | デバッグと分析のため全経路を保持する |
| **構造化出力** | 評価結果を確実に解析するためJSONを使う |

---

## クイックスタートチェックリスト

```markdown
## 評価実装チェックリスト

### セットアップ
- [ ] 評価基準/ルーブリックを定義する
- [ ] 「十分に良い」とするスコアしきい値を設定する
- [ ] 最大反復回数を設定する（既定: 3）

### 実装
- [ ] generate() 関数を実装する
- [ ] 構造化出力を返す evaluate() 関数を実装する
- [ ] optimize() 関数を実装する
- [ ] 改善ループを接続する

### 安全性
- [ ] 収束検出を追加する
- [ ] デバッグ用にすべての反復をログに記録する
- [ ] 評価結果の解析失敗を適切に扱う
```
