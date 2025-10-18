# LEDイルミネーションデータ エクスポート機能 仕様書

## 概要

Webシミュレーターで作成したイルミネーションパターンを、実際のハードウェア（Raspberry Pi / Arduino）で再生可能なデータ形式でエクスポートする機能。

---

## 1. データ形式

### 1.1 基本構造

```json
{
  "version": "1.0",
  "metadata": {
    "name": "滝パターン - 青色",
    "pattern": "waterfall",
    "createdAt": "2025-10-18T14:30:00Z",
    "duration": 5,
    "fps": 30
  },
  "hardware": {
    "stripCount": 5,
    "ledCount": 40,
    "height": 2.0,
    "ledSpacing": 0.05
  },
  "animation": {
    "frames": [
      {
        "time": 0,
        "strips": [
          [0, 0, 255, 255, 128, 64, ...],  // strip 0: 40個のLED輝度値 (0-255)
          [0, 0, 255, 255, 128, 64, ...],  // strip 1
          [0, 0, 255, 255, 128, 64, ...],  // strip 2
          [0, 0, 255, 255, 128, 64, ...],  // strip 3
          [0, 0, 255, 255, 128, 64, ...]   // strip 4
        ],
        "color": "#00ffff"
      },
      {
        "time": 33,
        "strips": [...],
        "color": "#00ffff"
      }
      // ... 5秒 × 30fps = 150フレーム
    ]
  }
}
```

### 1.2 フィールド説明

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `version` | string | データ形式のバージョン（現在は "1.0"） |
| `metadata.name` | string | ユーザーが設定するアニメーション名 |
| `metadata.pattern` | string | 元となったパターン名 |
| `metadata.createdAt` | string | 作成日時（ISO 8601形式） |
| `metadata.duration` | number | 総再生時間（秒） |
| `metadata.fps` | number | フレームレート（推奨: 30fps） |
| `hardware.stripCount` | number | LEDテープの本数 |
| `hardware.ledCount` | number | 1本あたりのLED数 |
| `hardware.height` | number | LEDテープの長さ（メートル） |
| `hardware.ledSpacing` | number | LED間隔（メートル） |
| `animation.frames[]` | array | フレームデータの配列 |
| `frames[].time` | number | フレームのタイムスタンプ（ミリ秒） |
| `frames[].strips[][]` | array | LED輝度値の2次元配列（0-255） |
| `frames[].color` | string | そのフレームの色（Hex形式） |

---

## 2. 機能要件

### 2.1 記録機能

#### 2.1.1 記録開始
- 「🔴 記録開始」ボタンを追加
- 再生中のアニメーションをフレーム単位で記録
- デフォルト: 30fps（約33msごとにキャプチャ）
- 記録時間: ユーザー指定（デフォルト5秒）

#### 2.1.2 記録中の表示
- 「⏺️ 記録中... 3/5秒」のように進行状況を表示
- 記録中は他の操作を制限

#### 2.1.3 記録停止
- 指定時間経過で自動停止
- または「⏹️ 停止」ボタンで手動停止

### 2.2 データ変換

現在のシミュレーターの内部状態（0.0-1.0）を、ハードウェア用の値（0-255）に変換：

```javascript
// 0.0-1.0 の輝度を 0-255 に変換
const brightness = Math.round(ledState * 255)

// カラー値を適用（Hex → RGB分解）
const r = parseInt(color.substr(1, 2), 16) * ledState
const g = parseInt(color.substr(3, 2), 16) * ledState
const b = parseInt(color.substr(5, 2), 16) * ledState
```

### 2.3 エクスポート機能

#### 2.3.1 ダウンロード
- 「💾 JSONダウンロード」ボタン
- ファイル名: `led_animation_{パターン名}_{日時}.json`
- 例: `led_animation_waterfall_20251018_143000.json`

#### 2.3.2 ファイルサイズ最適化
- 圧縮オプション（オプション機能）
  - 差分記録: 前フレームと変化のないLEDは省略
  - 間引き: 低速パターンは15fpsに削減

### 2.4 インポート/再生機能

#### 2.4.1 ファイル読み込み
- 「📂 JSONを読み込み」ボタン
- ドラッグ&ドロップ対応
- JSON形式のバリデーション

#### 2.4.2 データ検証
- 必須フィールドの存在確認
- LED数・テープ数の範囲チェック
- フレームデータの整合性確認

#### 2.4.3 再生
- 読み込んだデータをシミュレーター上で再生
- 記録されたタイミング通りに表示
- ループ再生対応

---

## 3. UI設計

### 3.1 新規コントロールパネル

既存のコントロールパネルに以下を追加：

```
┌─────────────────────────────────────┐
│ データ作成・エクスポート              │
├─────────────────────────────────────┤
│ アニメーション名: [入力欄]           │
│ 記録時間: [5秒] (1-30秒)            │
│                                     │
│ [🔴 記録開始]  [💾 JSONダウンロード] │
│                                     │
│ または                               │
│                                     │
│ [📂 JSONファイルを読み込み]          │
│ (ドラッグ&ドロップ対応)              │
└─────────────────────────────────────┘
```

### 3.2 記録中の表示

```
┌─────────────────────────────────────┐
│ ⏺️ 記録中...                         │
│                                     │
│ ████████░░░░ 3.2 / 5.0秒            │
│                                     │
│ フレーム: 96 / 150                   │
│                                     │
│ [⏹️ 停止]                            │
└─────────────────────────────────────┘
```

### 3.3 データプレビュー（オプション）

記録完了後、データのサマリーを表示：

```
┌─────────────────────────────────────┐
│ ✅ 記録完了                          │
├─────────────────────────────────────┤
│ アニメーション名: 滝パターン - 青色  │
│ パターン: waterfall                 │
│ 時間: 5.0秒                         │
│ フレーム数: 150                      │
│ ファイルサイズ: 約 45 KB            │
│                                     │
│ [💾 ダウンロード]  [🗑️ 破棄]        │
└─────────────────────────────────────┘
```

---

## 4. ハードウェア実装時の使用方法

### 4.1 Raspberry Pi での使用例

```python
import json
import time
from rpi_ws281x import PixelStrip, Color

# JSONファイル読み込み
with open('led_animation_waterfall.json', 'r') as f:
    data = json.load(f)

# LED設定
LED_COUNT = data['hardware']['ledCount']
STRIP_COUNT = data['hardware']['stripCount']
LED_PIN = 18
LED_FREQ_HZ = 800000
LED_DMA = 10
LED_BRIGHTNESS = 255

# PixelStripオブジェクト作成（テープごと）
strips = [PixelStrip(LED_COUNT, LED_PIN + i, LED_FREQ_HZ, LED_DMA, False, LED_BRIGHTNESS)
          for i in range(STRIP_COUNT)]

for strip in strips:
    strip.begin()

# アニメーション再生
fps = data['metadata']['fps']
frame_delay = 1.0 / fps

for frame in data['animation']['frames']:
    # カラー取得
    color_hex = frame['color']
    r = int(color_hex[1:3], 16)
    g = int(color_hex[3:5], 16)
    b = int(color_hex[5:7], 16)

    # 各テープに設定
    for strip_idx, strip_data in enumerate(frame['strips']):
        for led_idx, brightness in enumerate(strip_data):
            # 輝度を適用
            final_r = int(r * brightness / 255)
            final_g = int(g * brightness / 255)
            final_b = int(b * brightness / 255)
            strips[strip_idx].setPixelColor(led_idx, Color(final_r, final_g, final_b))

    # 表示更新
    for strip in strips:
        strip.show()

    time.sleep(frame_delay)
```

### 4.2 Arduino での使用例

```cpp
#include <ArduinoJson.h>
#include <FastLED.h>

#define NUM_STRIPS 5
#define NUM_LEDS 40

CRGB leds[NUM_STRIPS][NUM_LEDS];

void setup() {
  // LED初期化
  FastLED.addLeds<WS2812B, 2, GRB>(leds[0], NUM_LEDS);
  FastLED.addLeds<WS2812B, 3, GRB>(leds[1], NUM_LEDS);
  // ...

  // SDカードからJSON読み込み
  File file = SD.open("animation.json");
  DynamicJsonDocument doc(200000);
  deserializeJson(doc, file);

  JsonArray frames = doc["animation"]["frames"];
  int fps = doc["metadata"]["fps"];
  int delay_ms = 1000 / fps;

  // アニメーション再生
  for (JsonObject frame : frames) {
    String color = frame["color"];
    JsonArray strips = frame["strips"];

    for (int s = 0; s < NUM_STRIPS; s++) {
      JsonArray strip_data = strips[s];
      for (int l = 0; l < NUM_LEDS; l++) {
        int brightness = strip_data[l];
        leds[s][l] = CRGB(brightness, brightness, brightness);
      }
    }

    FastLED.show();
    delay(delay_ms);
  }
}
```

---

## 5. 実装の優先順位

### Phase 1: 基本機能（最初の実装）
1. ✅ 記録開始・停止ボタン
2. ✅ フレームデータのキャプチャ（30fps）
3. ✅ JSON形式への変換
4. ✅ ファイルダウンロード

### Phase 2: データ検証（次の実装）
5. ✅ JSONファイル読み込み
6. ✅ データバリデーション
7. ✅ 読み込んだデータの再生

### Phase 3: UX改善（オプション）
8. ⬜ 記録時間のプログレスバー
9. ⬜ データプレビュー表示
10. ⬜ ファイルサイズ最適化（差分記録）

---

## 6. 技術的な考慮事項

### 6.1 ファイルサイズ

- 5秒 × 30fps × 5本 × 40LED = 30,000データポイント
- JSON形式で約40-50KB（圧縮なし）
- 長時間記録の場合はファイルサイズに注意

### 6.2 パフォーマンス

- 記録中はrequestAnimationFrameと並行動作
- メモリ使用量の監視
- 大量のフレームデータの効率的な保存

### 6.3 互換性

- ハードウェア側でのJSONパース処理
- メモリ制約のあるマイコンでの対応
  - Arduino UNO: 2KB RAM → フレーム単位でストリーミング
  - ESP32: 520KB RAM → 全データ読み込み可能

---

## 7. 将来的な拡張機能

### 7.1 タイムラインエディター
- フレームごとの手動編集
- キーフレーム設定
- イージング機能

### 7.2 複数パターンの組み合わせ
- パターンAを3秒 → パターンBを5秒
- クロスフェード対応

### 7.3 リアルタイムプレビュー
- Raspberry Pi と WebSocket接続
- Web UIから直接ハードウェアを制御

---

## 8. まとめ

この仕様により、以下が実現できます：

1. ✅ Webシミュレーターで視覚的にパターンを確認
2. ✅ 気に入ったパターンをJSONデータとして保存
3. ✅ Raspberry Pi / Arduino で実際のLEDを制御
4. ✅ データの互換性・再利用性

**最初の実装ターゲット**: Phase 1（記録・エクスポート・ダウンロード）

この仕様でよろしいでしょうか？修正点があればお知らせください。
