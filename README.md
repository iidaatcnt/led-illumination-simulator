# LEDイルミネーション シミュレーター

建物から垂直に垂らすLEDテープによるイルミネーション効果を事前確認するためのWebシミュレーター。

## 特徴

- **21種類のアニメーションパターン**（滝、雨、雪、流星、波、きらめきなど）
- **リアルタイムプレビュー**
- **パラメータ調整**（高さ、テープ本数、速度、色）
- **レスポンシブデザイン**（PC・スマホ対応）
- **カラーピッカー + プリセットカラー**

## デモ

このシミュレーターは大学の先生への提案用に開発されました。

## 開発環境のセットアップ

### 必要な環境

- Node.js 16.x 以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーが起動したら、ブラウザで `http://localhost:5173` を開いてください。

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview
```

## デプロイ方法

### Vercel へのデプロイ（推奨）

#### 1. GitHubリポジトリの準備

```bash
# Gitリポジトリの初期化（まだの場合）
git init

# ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: LED Illumination Simulator"

# GitHubに新しいリポジトリを作成後
git remote add origin https://github.com/YOUR_USERNAME/led-illumination-simulator.git
git branch -M main
git push -u origin main
```

#### 2. Vercelでデプロイ

1. [Vercel](https://vercel.com) にアクセスしてアカウントを作成
2. 「New Project」をクリック
3. GitHubリポジトリを接続
4. プロジェクトを選択
5. 設定はデフォルトのまま（Viteが自動検出されます）
6. 「Deploy」をクリック

数分で `https://プロジェクト名.vercel.app` で公開されます。

#### 3. カスタムドメイン設定（オプション）

Vercelのダッシュボードから独自ドメインを設定できます。

### GitHub Pages へのデプロイ

#### 1. vite.config.js の調整

リポジトリ名に合わせて `base` を設定してください：

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/led-illumination-simulator/', // リポジトリ名を入れる
})
```

#### 2. デプロイスクリプトの追加

`package.json` に以下を追加：

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

`gh-pages` パッケージをインストール：

```bash
npm install --save-dev gh-pages
```

#### 3. デプロイの実行

```bash
npm run deploy
```

GitHubリポジトリの Settings → Pages で `gh-pages` ブランチを選択すると、
`https://YOUR_USERNAME.github.io/led-illumination-simulator/` で公開されます。

## 技術スタック

- **React 18**: UIフレームワーク
- **Vite**: ビルドツール
- **Tailwind CSS**: スタイリング
- **requestAnimationFrame**: アニメーション

## 使い方

1. **パターン選択**: 21種類の中から好きなアニメーションを選択
2. **パラメータ調整**: 高さ、テープ本数、速度をスライダーで調整
3. **カラー変更**: カラーピッカーまたはプリセットから色を選択
4. **再生/一時停止**: ボタンでアニメーションを制御

## パターン一覧

### 自然現象系
- 滝、逆滝、雨、雪、流星、雷、炎

### 波・動き系
- 波、スキャナー、チェイス、シアターチェイス、矢印（下/上）

### パターン系
- ストライプ、ドット、グラデーション

### 光の効果系
- きらめき、トゥインクル、フラッシュ、鼓動

### テキスト系
- テキスト表示（"LED"）

## カスタマイズ

### 新しいパターンの追加

`src/App.jsx` の `switch(pattern)` に新しいケースを追加してください：

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

パターン選択に追加：

```jsx
<option value="new_pattern">🎨 新パターン</option>
```

## ライセンス

MIT License

## サポート

問題や質問がある場合は、GitHubのIssuesで報告してください。

---

**開発**: 2025年10月
**バージョン**: 1.0.0
**用途**: 大学先生向け提案用シミュレーター
