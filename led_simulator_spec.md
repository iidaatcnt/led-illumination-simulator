# LEDイルミネーションシミュレーター 仕様書

## プロジェクト概要

建物から垂直に垂らすLEDテープによるイルミネーション効果を事前確認するためのWebシミュレーター。
大学の先生との初期相談用に開発された、視覚的にイメージを確認できるツール。

### 目的
- LEDイルミネーションの視覚効果を実際の設置前に確認
- 様々なパターン・色・設定を試して最適な演出を検討
- スマホ・PC両対応で、いつでもどこでも確認可能

---

## 現在の実装状況

### ファイル
- **メインファイル**: `led-waterfall-simple.jsx`
- **フレームワーク**: React (関数コンポーネント + Hooks)
- **スタイリング**: Tailwind CSS

### 主要機能

#### 1. パターン選択（全21種類）

**自然現象系（7種類）**
- `waterfall`: 滝（上から下へ流れる）
- `reverse`: 逆滝（下から上へ）
- `rain`: 雨（複数の水滴が落ちる）
- `snow`: 雪（ゆっくり落ちる雪の結晶）
- `meteor`: 流星（長い尾を引く）
- `lightning`: 雷（ランダムフラッシュ）
- `fire`: 炎（ゆらゆら揺れる）

**波・動き系（6種類）**
- `wave`: 波（サインカーブで上下）
- `scanner`: スキャナー（行ったり来たり）
- `chase`: チェイス（順番に点灯）
- `theater`: シアターチェイス（3つおきに移動）
- `arrow_down`: 矢印（下向き）
- `arrow_up`: 矢印（上向き）

**パターン系（3種類）**
- `stripe`: ストライプ（横縞スクロール）
- `dot`: ドット（点滅パターン）
- `gradient`: グラデーション（波打つ）

**光の効果系（4種類）**
- `sparkle`: きらめき（ランダム点灯）
- `twinkle`: ゆっくり点滅
- `flash`: フラッシュ（全体点滅）
- `heartbeat`: 鼓動（ドクンドクン）

**テキスト系（1種類）**
- `text`: テキスト表示（"LED"の文字スクロール）

#### 2. パラメーター調整

| パラメーター | 範囲 | 初期値 | 説明 |
|------------|------|--------|------|
| 高さ | 1-10m | 3m | LEDテープの長さ |
| テープ本数 | 3-15本 | 5本 | 並べるテープの数 |
| 速度 | 10-100 | 50 | アニメーション速度 |
| 色 | 任意 | #00ffff (シアン) | LED発光色 |

#### 3. カラー選択
- カラーピッカー（自由選択）
- プリセット6色
  - シアン (#00ffff)
  - マゼンタ (#ff0080)
  - グリーン (#00ff00)
  - イエロー (#ffff00)
  - オレンジ (#ff8800)
  - パープル (#8800ff)

#### 4. 再生コントロール
- 再生/一時停止ボタン
- リアルタイムアニメーション（requestAnimationFrame使用）

---

## 技術仕様

### 使用技術
- **React**: 18.x
- **JavaScript**: ES6+
- **CSS Framework**: Tailwind CSS
- **アニメーション**: requestAnimationFrame API

### State管理
```javascript
const [height, setHeight] = useState(3);           // 高さ（m）
const [stripCount, setStripCount] = useState(5);   // テープ本数
const [pattern, setPattern] = useState('waterfall'); // パターン
const [color, setColor] = useState('#00ffff');     // 色
const [speed, setSpeed] = useState(50);            // 速度
const [isPlaying, setIsPlaying] = useState(true);  // 再生状態
const [ledStates, setLedStates] = useState([]);    // LED状態（2次元配列）
```

### LED状態の管理
- **LEDカウント**: 60個/テープ（固定）
- **状態**: 各LEDの明るさを0.0-1.0で管理
- **データ構造**: `ledStates[stripIndex][ledIndex] = intensity`

### アニメーションループ
```javascript
useEffect(() => {
  const animate = () => {
    frameRef.current += speed / 10;
    // パターンごとの計算
    // 新しいLED状態を生成
    setLedStates(newStates);
    animationRef.current = requestAnimationFrame(animate);
  };
  animationRef.current = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(animationRef.current);
}, [dependencies]);
```

---

## パターン実装の詳細

### パターン追加方法

新しいパターンを追加する場合：

1. **switch文に新ケースを追加**
```javascript
case 'new_pattern':
  for (let strip = 0; strip < stripCount; strip++) {
    for (let i = 0; i < ledCount; i++) {
      // LED状態の計算
      newStates[strip][i] = intensity; // 0.0-1.0
    }
  }
  break;
```

2. **selectタグにoptionを追加**
```jsx
<option value="new_pattern">🎨 新パターン</option>
```

### パターン実装のヒント

**基本的な動き**
- `frameRef.current`: フレームカウンター（速度に応じて増加）
- `strip`: テープのインデックス（0 ~ stripCount-1）
- `i` or `ledIndex`: LED位置（0 ~ ledCount-1）

**下向きの動き**
```javascript
const position = (frameRef.current + offset) % (ledCount + trail);
```

**上向きの動き**
```javascript
const position = ledCount - 1 - ((frameRef.current + offset) % (ledCount + trail));
```

**波の動き**
```javascript
Math.sin((i / ledCount) * Math.PI * cycles - frameRef.current / divisor)
```

**ランダム**
```javascript
if (Math.random() > threshold) { /* 点灯 */ }
```

---

## デプロイ方法

### 推奨: Vercel

#### 必要なファイル構成
```
led-simulator/
├── package.json
├── vite.config.js (or next.config.js)
├── index.html
├── src/
│   ├── main.jsx
│   └── App.jsx (led-waterfall-simple.jsxの内容)
└── README.md
```

#### package.json例
```json
{
  "name": "led-illumination-simulator",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
```

#### Vercelデプロイ手順
1. GitHubにリポジトリを作成
2. コードをpush
3. Vercel.comでアカウント作成
4. 「New Project」→ GitHubリポジトリを選択
5. 「Deploy」ボタンをクリック
6. 数分で `https://プロジェクト名.vercel.app` で公開

### 代替: GitHub Pages

Viteビルド後の`dist`フォルダをGitHub Pagesにデプロイ可能。

---

## 今後の拡張案

### 機能追加案

#### 1. カスタムテキスト入力
- 任意の文字列を入力してスクロール表示
- 日本語対応（ビットマップフォント実装）

#### 2. 複数色対応
- レインボーパターン
- 色のグラデーション
- パターンごとに異なる色

#### 3. 音楽同期
- マイク入力から音量取得
- ビート検出
- 音楽に合わせて変化

#### 4. パターンエディタ
- GUIでパターンを作成
- タイムライン編集
- プリセット保存機能

#### 5. 実機連携
- ArduinoやESP32へコード出力
- リアルタイム制御
- Wi-Fi経由での同期

#### 6. 共有機能
- 設定のURL共有
- QRコード生成
- SNS共有

#### 7. 詳細設定
- LED密度選択（30/60/144 LED/m）
- テープ間隔調整
- 明るさ調整
- 軌跡の長さ調整

#### 8. プレビューモード
- 3D表示
- 建物モデルへの投影
- 実写写真への合成

#### 9. シーケンス機能
- 複数パターンの組み合わせ
- タイミング設定
- ループ再生

#### 10. エクスポート機能
- 動画出力（WebM/MP4）
- GIFアニメーション
- Arduino/ESP32用コード生成

---

## トラブルシューティング

### よくある問題

**問題**: アニメーションがカクつく
**解決**: 
- LED数を減らす
- テープ本数を減らす
- パターンの計算を最適化

**問題**: 色が表示されない
**解決**:
- カラーピッカーで有効な色を選択
- HEX形式が正しいか確認

**問題**: モバイルで表示が崩れる
**解決**:
- Tailwind CSSのレスポンシブクラスを使用
- `sm:`, `md:`, `lg:` プレフィックスで調整

---

## 実装時の注意点

### パフォーマンス
- `requestAnimationFrame`の使用を推奨
- 不要な再計算を避ける
- `useEffect`の依存配列を適切に設定

### ブラウザ互換性
- Chrome, Firefox, Safari, Edge対応
- iOS Safari対応済み
- IE11非対応（Reactの制約）

### アクセシビリティ
- カラーコントラスト比を考慮
- キーボード操作対応
- スクリーンリーダー対応は今後の課題

---

## 連絡先・リファレンス

### 参考資料
- **LEDテープ規格**: WS2812B (アドレサブルRGB LED)
- **LED密度**: 30LED/m (33mm間隔), 60LED/m (17mm間隔), 144LED/m (7mm間隔)
- **電源**: 5V, 各LED最大60mA消費
- **制御**: SPI通信, 800kHz信号

### 関連技術
- Arduino/ESP32でのLED制御
- FastLED ライブラリ
- NeoPixel ライブラリ

---

## バージョン履歴

### v1.0 (現在)
- 基本機能実装
- 21種類のパターン
- レスポンシブデザイン
- カラー選択機能

### 今後の予定
- v1.1: カスタムテキスト機能
- v1.2: 複数色・レインボー対応
- v2.0: 音楽同期機能

---

## ライセンス

MIT License

---

**作成日**: 2025年10月15日  
**最終更新**: 2025年10月15日  
**開発環境**: Claude.ai → Claude Code への移行用仕様書
