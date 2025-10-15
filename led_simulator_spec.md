# LEDイルミネーションシミュレーター 開発仕様書

## プロジェクト概要

建物から垂直に垂らすLEDテープによるイルミネーション効果を事前確認するためのWebシミュレーター。
大学の先生への提案用に開発された、視覚的にイメージを確認できるツール。

### 目的
- LEDイルミネーションの視覚効果を実際の設置前に確認
- 様々なパターン・色・設定を試して最適な演出を検討
- スマホ・PC両対応で、いつでもどこでも確認可能
- 大学の先生へのプレゼンテーション・提案資料として活用

---

## 技術スタック

### フロントエンド
- **React**: 18.2.0（関数コンポーネント + Hooks）
- **Vite**: 4.5.14（ビルドツール）
- **Tailwind CSS**: 3.3.0（スタイリング）
- **JavaScript**: ES6+

### デプロイ
- **Vercel**: メインデプロイ先
- **GitHub Pages**: 代替デプロイ先

### リポジトリ
- **GitHub**: https://github.com/iidaatcnt/led-illumination-simulator

---

## ファイル構成

```
led-illumination-concept/
├── src/
│   ├── App.jsx           # メインコンポーネント（21パターン実装）
│   ├── main.jsx          # Reactエントリーポイント
│   └── index.css         # Tailwind CSS + カスタムスタイル
├── package.json          # 依存関係
├── vite.config.js        # Vite設定
├── tailwind.config.js    # Tailwind CSS設定
├── postcss.config.js     # PostCSS設定
├── index.html            # HTMLテンプレート
├── README.md             # 利用者向けドキュメント
├── led_simulator_spec.md # 開発仕様書（本ファイル）
└── .gitignore
```

---

## 主要機能

### 1. パターン選択（全21種類）

#### 自然現象系（7種類）

**waterfall - 滝**
- 連続的に大量の水が流れる表現
- 8つの水の流れを重ねて途切れない滝を再現
- 実装: 複数のflowループで連続的な流れを生成

**reverse - 逆滝**
- 下から上へ水が流れる逆再生効果
- 滝の逆方向バージョン

**rain - 雨**
- 複数の水滴が落ちる
- 各テープに3つの水滴が異なるタイミングで落下

**snow - 雪**
- ゆっくり落ちる雪の結晶
- 中心が明るく（1.0）、周辺が少し光る（0.3）
- 4つの雪の結晶が異なる速度で落下

**meteor - 流星**
- ポツリポツリと流れ星が流れる
- 長い間隔（ledCountの3倍の周期）で流星が現れる
- 長い尾を引き、先端が明るく尾に向かって暗くなる
- グラデーション計算: `1 - Math.pow(distance / 30, 1.5)`

**lightning - 雷**
- ランダムフラッシュ
- 95%の確率で待機、5%で全体が激しく点滅

**fire - 炎**
- ゆらゆら揺れる炎の表現
- サインカーブと位置によるグラデーション

#### 波・動き系（6種類）

**wave - 波**
- サインカーブで上下に波打つ
- 各テープで位相をずらして立体感を表現

**scanner - スキャナー**
- 上下に行ったり来たりするスキャン
- サインカーブで滑らかな往復運動

**chase - チェイス**
- LEDが順番に点灯して追いかける
- 各テープで5LEDずつオフセット

**theater - シアターチェイス**
- 3つおきにLEDが点灯して移動
- 映画館の看板のような効果

**arrow_down - 矢印（下向き）**
- 下向き矢印が移動
- 中央のテープで左右に広がるパターン

**arrow_up - 矢印（上向き）**
- 上向き矢印が移動
- arrow_downの逆方向

#### パターン系（3種類）

**stripe - ストライプ**
- 横縞がスクロール
- 10LED周期の縞模様

**dot - ドット**
- 点滅パターン
- 4LED間隔で交互に点滅

**gradient - グラデーション**
- 波打つグラデーション
- サインカーブで滑らかに変化

#### 光の効果系（4種類）

**sparkle - きらめき**
- ランダムに点灯
- 5%の確率で各LEDが点灯

**twinkle - トゥインクル**
- ゆっくり点滅
- サインカーブで明るさが変化

**flash - フラッシュ**
- 全体が点滅
- 10フレーム周期でON/OFF

**heartbeat - 鼓動**
- ドクンドクンと脈打つ
- 二重サインカーブで鼓動を表現

#### テキスト系（1種類）

**text - テキスト表示**
- 「LED」の文字が上から下にスクロール
- 縦のLEDテープに適した設計
- L、E、Dの各文字が10LEDの高さで表示

---

## State管理

### React State

```javascript
const [height, setHeight] = useState(3)           // 高さ（1-10m）
const [stripCount, setStripCount] = useState(5)   // テープ本数（3-15本）
const [pattern, setPattern] = useState('waterfall') // パターン
const [color, setColor] = useState('#00ffff')     // 色（HEX）
const [speed, setSpeed] = useState(50)            // 速度（10-100）
const [isPlaying, setIsPlaying] = useState(false) // 再生状態（初期は停止）
const [ledStates, setLedStates] = useState([])    // LED状態（2次元配列）
```

### Ref管理

```javascript
const frameRef = useRef(0)           // フレームカウンター
const animationRef = useRef(null)    // requestAnimationFrameのID
```

### 定数

```javascript
const ledCount = 60  // 1テープあたりのLED数（固定）
```

---

## アニメーションシステム

### フレームレート制御

```javascript
frameRef.current += speed / 100
```

- 速度パラメータ: 10-100
- 実際の増加量: 0.1 〜 1.0 per frame
- 調整経緯:
  - 初期: `speed / 10` （速すぎる）
  - 1回目修正: `speed / 20` （まだ速い）
  - 最終: `speed / 100` （適切な速度）

### LED状態の計算

- 各フレームで全LEDの状態を再計算
- 明るさ: 0.0（消灯）〜 1.0（最大輝度）
- 2次元配列: `ledStates[stripIndex][ledIndex]`

### レンダリング

```javascript
backgroundColor: intensity > 0 ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'transparent'
opacity: intensity > 0 ? intensity : 1
border: '1px solid rgba(255, 255, 255, 0.1)'
boxShadow: intensity > 0.5 ? `0 0 10px rgba(...)` : 'none'
```

- 点灯時: 選択した色で表示、opacityで明るさ調整
- 消灯時: 透明、薄い枠線で位置を表示
- Glow効果: 明るさ0.5以上でbox-shadowを追加

---

## カラーシステム

### プリセットカラー（6色）

| 名前 | HEXコード | RGB |
|------|-----------|-----|
| シアン | #00ffff | (0, 255, 255) |
| マゼンタ | #ff0080 | (255, 0, 128) |
| グリーン | #00ff00 | (0, 255, 0) |
| イエロー | #ffff00 | (255, 255, 0) |
| オレンジ | #ff8800 | (255, 136, 0) |
| パープル | #8800ff | (136, 0, 255) |

### カスタムカラー
- HTML5 Color Picker対応
- HEX形式の入力フィールド
- リアルタイムプレビュー

---

## パラメータ仕様

| パラメータ | 範囲 | 初期値 | 説明 |
|-----------|------|--------|------|
| 高さ | 1-10m | 3m | LEDテープの長さ |
| テープ本数 | 3-15本 | 5本 | 並べるテープの数 |
| 速度 | 10-100 | 50 | アニメーション速度 |
| 色 | 任意 | #00ffff | LED発光色 |

### LED密度計算

```javascript
LED密度 = Math.floor(ledCount / height) // 個/m
```

例:
- 3m, 60LED → 20個/m
- 5m, 60LED → 12個/m
- 10m, 60LED → 6個/m

---

## UI/UXデザイン

### カラースキーム
- **背景**: グラデーション（gray-900 → blue-900 → gray-900）
- **パネル**: gray-800（不透明度調整）
- **アクセントカラー**: cyan-600
- **テキスト**: white

### レスポンシブデザイン
- **PC**: 3カラムレイアウト（コントロール1列 + プレビュー2列）
- **タブレット**: 2カラムレイアウト
- **スマホ**: 1カラムレイアウト（縦スクロール）

### アクセシビリティ
- コントラスト比を考慮
- キーボード操作対応
- タッチ操作対応

---

## パフォーマンス最適化

### アニメーション
- `requestAnimationFrame` 使用
- 一時停止時はanimationをキャンセル
- 不要な再計算を避ける

### State更新
- `useEffect` の依存配列を最適化
- LED状態の初期化は必要な時のみ

### レンダリング
- 仮想DOM差分レンダリング（React）
- CSS transitionで滑らかな変化

---

## デプロイ

### Vercel（メイン）

**URL**: https://led-illumination-simulator.vercel.app

**自動デプロイ**:
- GitHubのmainブランチへpushで自動デプロイ
- ビルド時間: 約30-60秒
- プレビューURL: PRごとに自動生成

### GitHub Pages（代替）

**手順**:
1. `vite.config.js`で`base`を設定
2. `npm run build`
3. `gh-pages -d dist`

---

## 開発ワークフロー

### ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

### Git管理

```bash
# 変更をコミット
git add .
git commit -m "説明"

# GitHubにプッシュ（自動デプロイ）
git push origin main
```

---

## パターン追加方法

### 1. switch文に新ケースを追加

```javascript
case 'new_pattern': {
  // パターン名と説明コメント
  for (let strip = 0; strip < stripCount; strip++) {
    for (let i = 0; i < ledCount; i++) {
      // LED状態の計算
      const intensity = ... // 0.0-1.0
      newStates[strip][i] = intensity
    }
  }
  break
}
```

### 2. selectタグにoptionを追加

```jsx
<optgroup label="カテゴリ名">
  <option value="new_pattern">🎨 新パターン</option>
</optgroup>
```

### 3. パターン実装のヒント

**基本的な変数**:
- `frameRef.current`: フレームカウンター
- `strip`: テープのインデックス（0 ~ stripCount-1）
- `i` or `ledIndex`: LED位置（0 ~ ledCount-1）

**下向きの動き**:
```javascript
const position = (frameRef.current + offset) % (ledCount + trail)
```

**上向きの動き**:
```javascript
const position = ledCount - 1 - ((frameRef.current + offset) % (ledCount + trail))
```

**波の動き**:
```javascript
Math.sin((i / ledCount) * Math.PI * cycles - frameRef.current / divisor)
```

**ランダム**:
```javascript
if (Math.random() > threshold) { /* 点灯 */ }
```

---

## トラブルシューティング

### アニメーションがカクつく
**原因**: LED数が多すぎる、計算が重い
**解決策**:
- LED数を減らす（現在60個固定）
- テープ本数を減らす
- パターンの計算を最適化

### 色が表示されない
**原因**: カラーピッカーの値が不正
**解決策**:
- HEX形式が正しいか確認（#rrggbb）
- プリセットカラーを使用

### モバイルで表示が崩れる
**原因**: レスポンシブ対応不足
**解決策**:
- Tailwind CSSのレスポンシブクラスを使用
- `sm:`, `md:`, `lg:` プレフィックスで調整

### 速度が速すぎる/遅すぎる
**解決策**:
- 速度スライダーを調整（10-100）
- 必要に応じて `speed / 100` の分母を調整

---

## 今後の拡張案

### 優先度：高
- [ ] スマホ対応の強化（タッチUI最適化）
- [ ] パターンのプリセット保存機能
- [ ] URL共有機能（パラメータをURLに埋め込み）

### 優先度：中
- [ ] カスタムテキスト入力機能
- [ ] 複数色対応（レインボーパターン）
- [ ] 動画・GIF出力機能
- [ ] 3Dプレビュー

### 優先度：低
- [ ] 音楽同期機能
- [ ] パターンエディタ（GUI）
- [ ] Arduino/ESP32コード出力
- [ ] 実機連携（Wi-Fi制御）

---

## テスト環境

### ブラウザ対応
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ IE11（React 18の制約）

### デバイス対応
- ✅ PC（Windows/Mac/Linux）
- ✅ タブレット（iPad/Android）
- ✅ スマートフォン（iPhone/Android）

---

## 参考資料

### LEDテープ規格
- **WS2812B**: アドレサブルRGB LED
- **LED密度**: 30/60/144 LED/m
- **電源**: 5V, 各LED最大60mA
- **制御**: SPI通信, 800kHz信号

### 関連ライブラリ
- Arduino/ESP32: FastLED, NeoPixel
- JavaScript: requestAnimationFrame API
- CSS: Tailwind CSS

---

## バージョン履歴

### v1.0.0 (2025-10-15)
- ✅ 基本機能実装
- ✅ 21種類のパターン
- ✅ カラー選択機能
- ✅ レスポンシブデザイン
- ✅ Vercelデプロイ

**主要な修正**:
- 初期状態を一時停止に変更
- LEDプレビュー表示を改善（枠線追加）
- 雪とテキストパターンを改善
- アニメーション速度を20%に調整（speed/100）
- 滝と流星のパターンを明確に区別

### 今後の予定
- v1.1: スマホUI最適化
- v1.2: URL共有機能
- v1.3: プリセット保存機能
- v2.0: 複数色対応

---

## ライセンス

MIT License

---

## 連絡先

**開発**: iidaatcnt
**リポジトリ**: https://github.com/iidaatcnt/led-illumination-simulator
**デプロイURL**: https://led-illumination-simulator.vercel.app

---

**作成日**: 2025年10月15日
**最終更新**: 2025年10月15日
**ドキュメントバージョン**: 1.0.0
