---
name: datanalysis-credit-risk
description: '融資前モデリング向けの信用リスクデータクリーニングおよび変数スクリーニングパイプライン。品質評価、欠損値分析、モデリング前の変数選択が必要な生の信用データを扱う場合に使用する。データの読み込みと整形、異常期間の除外、欠損率の計算、高欠損率変数・低 IV 変数・高 PSI 変数・高相関変数の除外、Null Importance によるノイズ除去、クリーニングレポート生成を扱う。'
---

# データクリーニングと変数スクリーニング

## クイックスタート

```bash
# Run the complete data cleaning pipeline
python ".github/skills/datanalysis-credit-risk/scripts/example.py"
```

## 処理全体の説明

データクリーニングパイプラインは次の 11 ステップで構成され、元データを削除せず各ステップを独立して実行します。

1. **データ取得** - 生データを読み込み、整形する
2. **組織別サンプル分析** - 組織ごとのサンプル数と不良サンプル率を集計する
3. **OOS データの分離** - モデリング用サンプルから out-of-sample（OOS）サンプルを分離する
4. **異常月の除外** - 不良サンプル数または総サンプル数が不足する月を除外する
5. **欠損率の計算** - 各特徴量について全体および組織別の欠損率を計算する
6. **高欠損率特徴量の除外** - 全体の欠損率がしきい値を超える特徴量を除外する
7. **低 IV 特徴量の除外** - 全体の IV が低すぎる、または IV が低すぎる組織が多い特徴量を除外する
8. **高 PSI 特徴量の除外** - PSI が不安定な特徴量を除外する
9. **Null Importance によるノイズ除去** - ラベル置換法でノイズ特徴量を除外する
10. **高相関特徴量の除外** - 元の gain に基づいて高相関の特徴量を除外する
11. **レポートの出力** - 全ステップの詳細と統計を含む Excel レポートを生成する

## コア関数

| 関数 | 目的 | モジュール |
|------|------|----------|
| `get_dataset()` | データの読み込みと整形 | references.func |
| `org_analysis()` | 組織別サンプル分析 | references.func |
| `missing_check()` | 欠損率の計算 | references.func |
| `drop_abnormal_ym()` | 異常月の除外 | references.analysis |
| `drop_highmiss_features()` | 高欠損率特徴量の除外 | references.analysis |
| `drop_lowiv_features()` | 低 IV 特徴量の除外 | references.analysis |
| `drop_highpsi_features()` | 高 PSI 特徴量の除外 | references.analysis |
| `drop_highnoise_features()` | Null Importance によるノイズ除去 | references.analysis |
| `drop_highcorr_features()` | 高相関特徴量の除外 | references.analysis |
| `iv_distribution_by_org()` | IV 分布の統計 | references.analysis |
| `psi_distribution_by_org()` | PSI 分布の統計 | references.analysis |
| `value_ratio_distribution_by_org()` | 有値率分布の統計 | references.analysis |
| `export_cleaning_report()` | クリーニングレポートの出力 | references.analysis |

## パラメーターの説明

### データ読み込みパラメーター
- `DATA_PATH`: データファイルのパス（parquet 形式を推奨）
- `DATE_COL`: 日付列名
- `Y_COL`: ラベル列名
- `ORG_COL`: 組織列名
- `KEY_COLS`: 主キー列名のリスト

### OOS 組織の構成
- `OOS_ORGS`: out-of-sample 組織のリスト

### 異常月の除外パラメーター
- `min_ym_bad_sample`: 月ごとの最小不良サンプル数（既定値 10）
- `min_ym_sample`: 月ごとの最小総サンプル数（既定値 500）

### 欠損率パラメーター
- `missing_ratio`: 全体の欠損率しきい値（既定値 0.6）

### IV パラメーター
- `overall_iv_threshold`: 全体の IV しきい値（既定値 0.1）
- `org_iv_threshold`: 単一組織の IV しきい値（既定値 0.1）
- `max_org_threshold`: 許容する低 IV 組織数の上限（既定値 2）

### PSI パラメーター
- `psi_threshold`: PSI しきい値（既定値 0.1）
- `max_months_ratio`: 不安定な月の割合の上限（既定値 1/3）
- `max_orgs`: 不安定な組織数の上限（既定値 6）

### Null Importance パラメーター
- `n_estimators`: 木の数（既定値 100）
- `max_depth`: 木の最大深度（既定値 5）
- `gain_threshold`: gain 差のしきい値（既定値 50）

### 高相関パラメーター
- `max_corr`: 相関しきい値（既定値 0.9）
- `top_n_keep`: 元の gain 順位で上位 N 個の特徴量を保持する（既定値 20）

## 出力レポート

生成される Excel レポートには次のシートが含まれます。

1. **汇总** - 操作結果と条件を含む全ステップの要約情報
2. **机构样本统计** - 組織ごとのサンプル数と不良サンプル率
3. **分离OOS数据** - OOS サンプル数とモデリング用サンプル数
4. **Step4-异常月份处理** - 除外された異常月
5. **缺失率明细** - 各特徴量の全体および組織別の欠損率
6. **Step5-有值率分布统计** - 有値率の範囲ごとの特徴量分布
7. **Step6-高缺失率处理** - 除外された高欠損率特徴量
8. **Step7-IV明细** - 各特徴量の組織別および全体の IV 値
9. **Step7-IV处理** - IV 条件を満たさない特徴量と低 IV 組織
10. **Step7-IV分布统计** - IV の範囲ごとの特徴量分布
11. **Step8-PSI明细** - 各特徴量の組織別・月別 PSI 値
12. **Step8-PSI处理** - PSI 条件を満たさない特徴量と不安定な組織
13. **Step8-PSI分布统计** - PSI の範囲ごとの特徴量分布
14. **Step9-null importance处理** - 除外されたノイズ特徴量
15. **Step10-高相关性剔除** - 除外された高相関特徴量

## 特長

- **対話型入力**: 各ステップの実行前にパラメーターを入力でき、既定値も利用できる
- **独立実行**: 元データを削除せず各ステップを独立して実行し、比較分析を容易にする
- **完全なレポート**: 詳細、統計、分布を含む完全な Excel レポートを生成する
- **マルチプロセス対応**: IV と PSI の計算をマルチプロセスで高速化できる
- **組織別分析**: 組織別の統計とモデリング/OOS の区別をサポートする
