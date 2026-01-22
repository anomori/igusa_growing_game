# 🌱 い草育成ゲーム

「い草ちゃん」を育てながら、畳・い草の知識を学ぶ教育ゲームです。熊本県八代市のい草栽培を30日間で体験しよう！

## 🎮 ゲーム概要

- **育成要素**: たまごっち風のお世話システム
- **教育要素**: ステージごとの畳クイズで知識が身につく
- **8つのステージ**: 株分け → 植え付け → 先刈り → 成長期 → 収穫 → 泥染め → 製織 → 検査

## 🚀 プレイ方法

### オンラインでプレイ

GitHub Pagesでプレイできます:  
👉 https://anomori.github.io/igusa_growing_game/

### ローカルで実行

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173 を開く
``` 

## 📚 学べる知識

- い草は種ではなく**株分け**で増やす
- 熊本県八代市は国内い草生産の**85%以上**を占める
- 畳の香りは**フィトンチッド**によるリラックス効果
- 高級畳は1畳に約**8000本**のい草を使用

## 🛠️ 技術スタック

- **React 18** + **TypeScript**
- **Vite** (ビルドツール)
- **GitHub Pages** (デプロイ)

## 📁 プロジェクト構造

```
src/
├── components/     # UIコンポーネント
├── stages/         # 各ステージのゲーム画面
├── context/        # 状態管理
├── data/           # クイズ・ヒントデータ
├── types/          # TypeScript型定義
└── utils/          # ユーティリティ関数
```

## 🔧 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run preview  # ビルドプレビュー
npm run deploy   # GitHub Pagesにデプロイ
```

## Google Analytics 設定

本番環境でアクセス解析を有効にするには、`.env` ファイルを作成してください。

```bash
# .env.example をコピー
cp .env.example .env

# .env を編集して測定IDを設定
# VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

##�🐛 デバッグモード

開発・テスト用に、任意のステージへジャンプできる機能があります。

### 有効化する方法

1. `src/utils/debug.ts` を開く
2. `DEBUG_MODE = false` を `DEBUG_MODE = true` に変更

```typescript
// src/utils/debug.ts
export const DEBUG_MODE = true; // ← trueに変更
```

3. 画面左上に赤い「🔧 デバッグ」ボタンが表示される
4. ボタンをクリックするとパネルが開く
   - ステージアイコン（🌱, 🌿, ✂️ 等）で任意のステージにジャンプ
   - 「🏠 ホームへ戻る」でタイトル画面に戻る

> ⚠️ **注意**: 本番環境・デプロイ前には必ず `DEBUG_MODE = false` に戻してください

## 📄 ライセンス

MIT License
