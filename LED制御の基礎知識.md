# LEDイルミネーション制御の基礎知識

チーム共有用 - 初心者向けガイド

---

## 目次

1. [WS2812Bとは](#ws2812bとは)
2. [LEDの制御方法](#ledの制御方法)
3. [データ構造](#データ構造)
4. [アニメーションの仕組み](#アニメーションの仕組み)
5. [実装例](#実装例)
6. [既存ツール紹介](#既存ツール紹介)
7. [よくある誤解](#よくある誤解)

---

## WS2812Bとは

### 特徴

WS2812B（通称：NeoPixel）は**アドレサブルLED**です。

```
普通のLED: 全部が同じ色
  ● ● ● ● ●  ← すべて赤

WS2812B: 各LEDが個別の色
  🔴 🟢 🔵 🟡 🟣  ← それぞれ違う色
```

### このプロジェクトのスペック

```
LEDテープ仕様:
- 長さ: 2メートル
- LED間隔: 5cm
- LED数: 2m ÷ 0.05m = 40個/本
- テープ数: 1〜15本（可変）

例）5本のテープの場合:
テープ1: ●●●●●...（40個）
テープ2: ●●●●●...（40個）
テープ3: ●●●●●...（40個）
テープ4: ●●●●●...（40個）
テープ5: ●●●●●...（40個）

合計: 40 × 5 = 200個のLED
```

---

## LEDの制御方法

### 基本原則

**重要**: WS2812Bは**時間指定の命令を受け付けません**。

❌ **間違った理解**:
```
「LED1を明度100で2秒間光らせる」という命令を送る
```

✅ **正しい理解**:
```
「今この瞬間、全LEDをこの色にする」という命令を送る
時間管理はプログラム側で行う
```

### 制御の流れ

```
1. 全40個のLEDの色を決定
   ↓
2. 一括送信（FastLED.show()）
   ↓
3. LEDはその色を保持
   ↓
4. 次のフレームまで待つ（例: 33ms）
   ↓
5. また全40個の色を決定（少し変化）
   ↓
6. 一括送信
   ↓
7. 繰り返し...
```

**映画のコマ送りと同じ仕組み**です。

---

## データ構造

### 各LEDはRGB値を持つ

```cpp
// LED1個のデータ
struct LED {
  uint8_t red;    // 0-255
  uint8_t green;  // 0-255
  uint8_t blue;   // 0-255
}

// 例
LED led1 = {255, 0, 0};     // 赤
LED led2 = {0, 255, 0};     // 緑
LED led3 = {0, 0, 255};     // 青
LED led4 = {255, 255, 0};   // 黄色
LED led5 = {128, 0, 128};   // 紫（半分の明るさ）
```

### 2次元配列で管理

```cpp
// テープ5本 × LED40個の場合
CRGB leds[5][40];

// テープ0のLED0を赤に設定
leds[0][0] = CRGB(255, 0, 0);

// テープ2のLED10を緑に設定
leds[2][10] = CRGB(0, 255, 0);
```

### 視覚的なイメージ

```
         LED0  LED1  LED2  LED3  LED4 ... LED39
テープ0  [255] [200] [150] [100] [ 50] ... [  0]
テープ1  [255] [200] [150] [100] [ 50] ... [  0]
テープ2  [255] [200] [150] [100] [ 50] ... [  0]
テープ3  [255] [200] [150] [100] [ 50] ... [  0]
テープ4  [255] [200] [150] [100] [ 50] ... [  0]

↑ この数値は輝度（0-255）
実際はRGB各色でこの配列が必要
```

---

## アニメーションの仕組み

### フレームレート（fps）

| 更新間隔 | fps | 用途 | 見え方 |
|---------|-----|------|--------|
| 変更時のみ | - | 静止画 | 変化なし |
| 1000ms (1秒) | 1fps | ゆっくり切り替え | パッパッと変わる |
| **33ms** | **30fps** | **通常のアニメーション** | **滑らか** ⭐ |
| 16ms | 60fps | 高速アニメーション | とても滑らか |

**推奨: 30fps（33msごとに更新）**

### 滝パターンの例

```
フレーム0（時間 0ms）:
LED[0]  ████████  明度255
LED[1]  ██████░░  明度200
LED[2]  ████░░░░  明度150
LED[3]  ██░░░░░░  明度100
LED[4]  ░░░░░░░░  明度0
LED[5]  ░░░░░░░░  明度0
...

↓ 33ms後

フレーム1（時間 33ms）:
LED[0]  ░░░░░░░░  明度0      ← 消えた
LED[1]  ████████  明度255    ← 下に移動
LED[2]  ██████░░  明度200
LED[3]  ████░░░░  明度150
LED[4]  ██░░░░░░  明度100
LED[5]  ░░░░░░░░  明度0
...

↓ 33ms後

フレーム2（時間 66ms）:
LED[0]  ░░░░░░░░  明度0
LED[1]  ░░░░░░░░  明度0
LED[2]  ████████  明度255    ← さらに下に
LED[3]  ██████░░  明度200
LED[4]  ████░░░░  明度150
LED[5]  ██░░░░░░  明度100
...
```

**5秒間のアニメーション = 30fps × 5秒 = 150フレーム**

---

## 実装例

### Arduino + FastLED

```cpp
#include <FastLED.h>

#define NUM_STRIPS 5
#define NUM_LEDS 40
#define DATA_PIN 6

CRGB leds[NUM_STRIPS][NUM_LEDS];

void setup() {
  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds[0], NUM_LEDS);
  // 他のテープも同様に設定...
}

void loop() {
  waterfall_effect();
  FastLED.show();  // 全LEDに一括送信
  delay(33);       // 30fps = 33ms待機
}

void waterfall_effect() {
  static int pos = 0;

  // 全テープ、全LEDの色を計算
  for (int strip = 0; strip < NUM_STRIPS; strip++) {
    for (int led = 0; led < NUM_LEDS; led++) {
      int distance = abs(led - pos);

      if (distance < 5) {
        // 滝の水しぶき部分
        int brightness = 255 * (1.0 - distance / 5.0);
        leds[strip][led] = CRGB(0, brightness, brightness);
      } else {
        // それ以外は消灯
        leds[strip][led] = CRGB(0, 0, 0);
      }
    }
  }

  pos++;
  if (pos >= NUM_LEDS) pos = 0;  // ループ
}
```

### データサイズの計算

```
1フレーム分のデータ:
= テープ数 × LED数 × 3バイト(RGB)
= 5本 × 40個 × 3バイト
= 600バイト

5秒間のアニメーション（30fps）:
= 600バイト × 150フレーム
= 90,000バイト
= 約90KB
```

---

## 既存ツール紹介

### 1. Neopixel Effect Generator ⭐ おすすめ

- **URL**: https://adrianotiger.github.io/Neopixel-Effect-Generator/
- **特徴**:
  - ブラウザで動作（インストール不要）
  - プログラミング知識不要
  - Arduinoコードを自動生成
  - モバイル対応

**使い方**:
1. Webページを開く
2. LEDストリップを追加（ピン番号、LED数を指定）
3. エフェクトを選択・カスタマイズ
4. 「Generate Arduino Code」でコード生成
5. ArduinoIDEにコピペして実行

### 2. LED Matrix Editor

- **URL**: https://xantorohara.github.io/led-matrix-editor/
- **特徴**:
  - 8x8マトリックス用
  - 方眼紙のようなビジュアルエディター
  - アニメーション作成可能

### 3. FastLED Animator

- **URL**: https://www.fastledanimator.com/
- **特徴**:
  - LEDストリップシミュレーター
  - プロジェクト保存・共有機能

### 4. 当プロジェクトのシミュレーター

- **URL**: https://led-illumination-simulator.vercel.app
- **特徴**:
  - 垂直LEDテープ専用（1-15本）
  - 21種類のアニメーションパターン
  - リアルタイムプレビュー
  - **今後の機能**: データエクスポート（予定）

---

## よくある誤解

### ❌ 誤解1: 個別命令を送る

```
間違い:
「LED1を赤で3秒」
「LED2を緑で5秒」
のような個別命令を送る
```

```
正解:
全LEDの状態を毎フレーム送信
時間管理はプログラム側で行う
```

### ❌ 誤解2: LEDが時間を管理

```
間違い:
LED側が「あと2秒光る」などのタイマーを持つ
```

```
正解:
LEDは最後に受信した色を保持するだけ
マイコン側のプログラムが時間を管理
```

### ❌ 誤解3: 3秒ごとに更新すれば良い

```
間違い:
静止画なので3秒ごとに更新
```

```
正解:
静止画なら更新不要（一度送信すればOK）
アニメーションなら30fps（33msごと）推奨
```

---

## データ形式の選択肢

### 方式1: コード埋め込み（FastLED）

**メリット**:
- メモリ効率が良い
- リアルタイム計算で無限ループ可能

**デメリット**:
- プログラミング知識が必要
- パターン変更にコード修正が必要

```cpp
// コード例
void loop() {
  for(int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CHSV(i * 10, 255, 255);
  }
  FastLED.show();
}
```

### 方式2: フレームデータ保存（JSON/バイナリ）

**メリット**:
- Webツールで視覚的に作成可能
- プログラミング不要

**デメリット**:
- ファイルサイズが大きい
- メモリ制約（Arduino UNOは厳しい、ESP32ならOK）

```json
{
  "frames": [
    {"strips": [[255, 200, 150, ...], ...]},
    {"strips": [[250, 195, 145, ...], ...]}
  ]
}
```

### 方式3: コマンド送信（MQTT JSON）

**メリット**:
- ネットワーク経由で制御可能
- Home Assistantなどと連携

**デメリット**:
- WiFi必須（ESP8266/ESP32）
- エフェクトはマイコン側に実装必要

```json
{
  "effect": "waterfall",
  "color": "#00ffff",
  "speed": 50
}
```

---

## 次のステップ

### Phase 1: 学習（完了）✅
- WS2812Bの仕組み理解
- データ構造の理解
- 既存ツールの調査

### Phase 2: プロトタイピング
1. Arduinoで基本的な制御を試す
2. 1本のLEDテープで滝パターンを実装
3. 複数テープに拡張

### Phase 3: データ作成
1. 既存ツール（Neopixel Effect Generator）を試す
2. Webシミュレーターにエクスポート機能追加
3. データ形式の最適化

### Phase 4: 実機テスト
1. Raspberry Piまたは Arduino + LEDテープで実機テスト
2. Webシミュレーターとの比較
3. 大学への提案・設置

---

## 参考リンク

### 公式ドキュメント
- FastLED: https://fastled.io/
- Adafruit NeoPixel: https://learn.adafruit.com/adafruit-neopixel-uberguide

### 日本語チュートリアル
- Device Plus: https://deviceplus.jp/arduino/how-to-add-rgb-led-strip-to-home-lighting/
- Zenn.dev: https://zenn.dev/kotaproj/articles/02ca9acbc160d7056fd2

### オープンソースツール
- Neopixel Effect Generator: https://github.com/Adrianotiger/Neopixel-Effect-Generator
- LED Matrix Editor: https://github.com/xantorohara/led-matrix-editor
- FastLED Animator: https://www.fastledanimator.com/

### このプロジェクト
- Webシミュレーター: https://led-illumination-simulator.vercel.app
- GitHub: https://github.com/iidaatcnt/led-illumination-simulator

---

## まとめ

### 重要ポイント3つ

1. **各LEDは個別制御**
   - 40個のLEDそれぞれにRGB値を設定

2. **時間ではなく状態を送信**
   - 「2秒光らせる」ではなく「今この色」を送る
   - 時間管理はプログラム側

3. **30fpsで更新**
   - 33msごとに全LEDの色を計算して送信
   - 映画のコマ送りと同じ

### データ構造の基本

```
2次元配列[テープ数][LED数]
例: leds[5][40] = 200個のLED
各LED = RGB (3バイト)
1フレーム = 600バイト
5秒30fps = 90KB
```

---

**作成日**: 2025年10月18日
**バージョン**: 1.0
**対象読者**: チームメンバー（初心者向け）
**作成者**: iidaatcnt
