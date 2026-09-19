---
name: legacy-circuit-mockups
description: 'HTML5 Canvasの描画技法を使ってブレッドボード回路のモックアップと視覚図を生成する。回路レイアウトの作成、電子部品の配置の可視化、ブレッドボード図の描画、6502ビルドのモックアップ、レトロコンピューターの回路図生成、ビンテージ電子工作プロジェクトの設計を求められたときに使う。555タイマー、W65C02Sマイクロプロセッサ、28C256 EEPROM、W65C22 VIAチップ、7400シリーズ論理ゲート、LED、抵抗、コンデンサー、スイッチ、ボタン、水晶発振子、配線に対応する。'
---

# レガシー回路モックアップ

レトロコンピューティングや電子工作プロジェクト向けに、ブレッドボード回路のモックアップと視覚図を作成するSkill。このSkillはHTML5 Canvasの描画機構を活用し、6502マイクロプロセッサ、555タイマーIC、EEPROM、7400シリーズ論理ゲートなどのビンテージ部品を含むインタラクティブな回路レイアウトを描画する。

## このSkillを使う場面

- ユーザーが「ブレッドボードレイアウトを作成」または「回路をモックアップ」したい
- ユーザーがブレッドボード上の部品配置を可視化したい
- ユーザーが6502コンピューターを組み立てるための視覚的な参照を必要としている
- ユーザーが「回路を描く」または「電子回路を図解」したい
- ユーザーが教育用の電子工作ビジュアルを作成したい
- ユーザーがBen Eaterのチュートリアルまたはレトロコンピューティングプロジェクトに言及した
- ユーザーが555タイマー回路またはLEDプロジェクトをモックアップしたい
- ユーザーが部品間の配線接続を可視化する必要がある

## 前提条件

- 同梱の参照ファイルにある部品ピン配置の理解
- ブレッドボードレイアウトの慣例（行、列、電源レール）の知識

## 対応コンポーネント

### Microprocessors & Memory

| コンポーネント | ピン | 説明 |
|-----------|------|-------------|
| W65C02S | 40-pin DIP | 8-bit microprocessor with 16-bit address bus |
| 28C256 | 28-pin DIP | 32KB parallel EEPROM |
| W65C22 | 40-pin DIP | Versatile Interface Adapter (VIA) |
| 62256 | 28-pin DIP | 32KB static RAM |

### Logic & Timer ICs

| コンポーネント | ピン | 説明 |
|-----------|------|-------------|
| NE555 | 8-pin DIP | Timer IC for timing and oscillation |
| 7400 | 14-pin DIP | Quad 2-input NAND gate |
| 7402 | 14-pin DIP | Quad 2-input NOR gate |
| 7404 | 14-pin DIP | Hex inverter (NOT gate) |
| 7408 | 14-pin DIP | Quad 2-input AND gate |
| 7432 | 14-pin DIP | Quad 2-input OR gate |

### Passive & Active Components

| コンポーネント | 説明 |
|-----------|-------------|
| LED | Light emitting diode (various colors) |
| Resistor | Current limiting (configurable values) |
| Capacitor | Filtering and timing (ceramic/electrolytic) |
| Crystal | Clock oscillator |
| Switch | Toggle switch (latching) |
| Button | Momentary push button |
| Potentiometer | Variable resistor |
| Photoresistor | Light-dependent resistor |

### グリッドシステム

```javascript
// Standard breadboard grid: 20px spacing
const gridSize = 20;
const cellX = Math.floor(x / gridSize) * gridSize;
const cellY = Math.floor(y / gridSize) * gridSize;
```

### コンポーネント描画パターン

```javascript
// All components follow this structure:
{
  type: 'component-type',
  x: gridX,
  y: gridY,
  width: componentWidth,
  height: componentHeight,
  rotation: 0,  // 0, 90, 180, 270
  properties: { /* component-specific data */ }
}
```

### 配線接続

```javascript
// Wire connection format:
{
  start: { x: startX, y: startY },
  end: { x: endX, y: endY },
  color: '#ff0000'  // Wire color coding
}
```

## 手順別ワークフロー

### 基本的なLED回路モックアップの作成

1. ブレッドボードの寸法とグリッドを定義する
2. 電源レール接続（+5VとGND）を配置する
3. アノード/カソードの向きを指定してLEDコンポーネントを追加する
4. 電流制限抵抗を配置する
5. 部品間の配線接続を描く
6. ラベルと注釈を追加する

### 555タイマー回路の作成

1. ブレッドボードにNE555 ICを配置する（ピン1〜4を左、5〜8を右）
2. ピン1（GND）をグラウンドレールに接続する
3. ピン8（Vcc）を電源レールに接続する
4. タイミング抵抗とコンデンサーを追加する
5. トリガーとスレッショルドの接続を配線する
6. 出力をLEDまたは他の負荷に接続する

### 6502マイクロプロセッサのレイアウト作成

1. ブレッドボード中央にW65C02Sを配置する
2. プログラム保存用に28C256 EEPROMを追加する
3. I/O用にW65C22 VIAを配置する
4. アドレスデコード用に7400シリーズ論理ICを追加する
5. アドレスバス（A0-A15）を配線する
6. データバス（D0-D7）を配線する
7. 制御信号（R/W、PHI2、RESB）を接続する
8. リセットボタンとクロック水晶を追加する

## 部品ピン配置クイックリファレンス

### 555 Timer (8-pin DIP)

| Pin | Name | Function |
|:---:|:-----|:---------|
| 1 | GND | Ground (0V) |
| 2 | TRIG | Trigger (< 1/3 Vcc starts timing) |
| 3 | OUT | Output (source/sink 200mA) |
| 4 | RESET | Active-low reset |
| 5 | CTRL | Control voltage (bypass with 10nF) |
| 6 | THR | Threshold (> 2/3 Vcc resets) |
| 7 | DIS | Discharge (open collector) |
| 8 | Vcc | Supply (+4.5V to +16V) |

### W65C02S (40-pin DIP) - Key Pins

| Pin | Name | Function |
|:---:|:-----|:---------|
| 8 | VDD | Power supply |
| 21 | VSS | Ground |
| 37 | PHI2 | System clock input |
| 40 | RESB | Active-low reset |
| 34 | RWB | Read/Write signal |
| 9-25 | A0-A15 | Address bus |
| 26-33 | D0-D7 | Data bus |

### 28C256 EEPROM (28-pin DIP) - Key Pins

| Pin | Name | Function |
|:---:|:-----|:---------|
| 14 | GND | Ground |
| 28 | VCC | Power supply |
| 20 | CE | Chip enable (active-low) |
| 22 | OE | Output enable (active-low) |
| 27 | WE | Write enable (active-low) |
| 1-10, 21-26 | A0-A14 | Address inputs |
| 11-19 | I/O0-I/O7 | Data bus |

## 公式リファレンス

### 抵抗の計算

- **オームの法則:** V = I × R
- **LED電流:** R = (Vcc - Vled) / Iled
- **電力:** P = V × I = I² × R

### 555タイマーの公式

**非安定モード:**

- Frequency: f = 1.44 / ((R1 + 2×R2) × C)
- High time: t₁ = 0.693 × (R1 + R2) × C
- Low time: t₂ = 0.693 × R2 × C
- Duty cycle: D = (R1 + R2) / (R1 + 2×R2) × 100%

**単安定モード:**

- Pulse width: T = 1.1 × R × C

### コンデンサーの計算

- Capacitive reactance: Xc = 1 / (2πfC)
- Energy stored: E = ½ × C × V²

## 色分けの慣例

### 配線の色

| 色 | 用途 |
|-------|---------|
| Red | +5V / Power |
| Black | Ground |
| Yellow | Clock / Timing |
| Blue | Address bus |
| Green | Data bus |
| Orange | Control signals |
| White | General purpose |

### LEDの色

| 色 | 順方向電圧 |
|-------|-----------------|
| Red | 1.8V - 2.2V |
| Green | 2.0V - 2.2V |
| Yellow | 2.0V - 2.2V |
| Blue | 3.0V - 3.5V |
| White | 3.0V - 3.5V |

## 構築例

### 構築1 — 単一LED

**コンポーネント:** 赤色LED、220Ω抵抗、ジャンパー線、電源

**手順:**

1. 電源GNDからA5行へ黒いジャンパー線を挿入する
2. 電源+5VからJ5行へ赤いジャンパー線を挿入する
3. GNDに対応する行に、カソード（短い脚）が来るようLEDを配置する
4. 電源とLEDアノードの間に220Ω抵抗を配置する

### 構築2 — 555非安定点滅回路

**コンポーネント:** NE555、LED、抵抗（10kΩ、100kΩ）、コンデンサー（10µF）

**手順:**

1. 中央の溝をまたぐように555 ICを配置する
2. ピン1をGNDに、ピン8を+5Vに接続する
3. ピン4をピン8に接続する（リセットを無効化）
4. ピン7と+5Vの間に10kΩを配線する
5. ピン6と7の間に100kΩを配線する
6. ピン6とGNDの間に10µFを配線する
7. ピン3（出力）をLED回路に接続する

## トラブルシューティング

| 問題 | 解決策 |
|-------|----------|
| LED doesn't light | Check polarity (anode to +, cathode to -) |
| Circuit doesn't power | Verify power rail connections |
| IC not working | Check VCC and GND pin connections |
| 555 not oscillating | Verify threshold/trigger capacitor wiring |
| Microprocessor stuck | Check RESB is HIGH after reset pulse |

## 参照

詳しい部品仕様は、同梱の参照ファイルで確認できる。

- [555.md](references/555.md) - 555タイマーICの完全な仕様
- [6502.md](references/6502.md) - MOS 6502マイクロプロセッサの詳細
- [6522.md](references/6522.md) - W65C22 VIAインターフェイスアダプター
- [28256-eeprom.md](references/28256-eeprom.md) - AT28C256 EEPROMの仕様
- [6C62256.md](references/6C62256.md) - 62256 SRAMの詳細
- [7400-series.md](references/7400-series.md) - TTL論理ゲートのピン配置
- [assembly-compiler.md](references/assembly-compiler.md) - アセンブラーの仕様
- [assembly-language.md](references/assembly-language.md) - アセンブリ言語の仕様
- [basic-electronic-components.md](references/basic-electronic-components.md) - 抵抗、コンデンサー、スイッチ
- [breadboard.md](references/breadboard.md) - ブレッドボードの仕様
- [common-breadboard-components.md](references/common-breadboard-components.md) - 部品の総合リファレンス
- [connecting-electronic-components.md](references/connecting-electronic-components.md) - 手順別の組み立てガイド
- [emulator-28256-eeprom.md](references/emulator-28256-eeprom.md) - 28256-eepromエミュレーション仕様
- [emulator-6502.md](references/emulator-6502.md) - 6502エミュレーション仕様
- [emulator-6522.md](references/emulator-6522.md) - 6522エミュレーション仕様
- [emulator-6C62256.md](references/emulator-6C62256.md) - 6C62256エミュレーション仕様
- [emulator-lcd.md](references/emulator-lcd.md) - LCDエミュレーション仕様
- [lcd.md](references/lcd.md) - LCDディスプレイの接続
- [minipro.md](references/minipro.md) - EEPROMプログラマーの使用方法
- [t48eeprom-programmer.md](references/t48eeprom-programmer.md) - T48プログラマーのリファレンス
