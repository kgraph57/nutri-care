# ICU NutriCare

ICU・PICU向け包括的栄養管理Webアプリケーション。重症患者の経腸栄養・静脈栄養を一元管理し、エビデンスに基づく栄養サポートを提供する。

**デモ:** https://kgraph57.github.io/nutri-care/

## 主な機能

### 臨床コア
- **栄養計算エンジン** — Harris-Benedict式によるエネルギー必要量・マクロ栄養素・電解質・微量元素の自動計算
- **379製品データベース** — 経腸栄養剤・静脈栄養剤の成分データを内蔵（97栄養成分）
- **栄養充足スコア** — マクロ栄養素・電解質・微量元素の充足度を100点満点で評価
- **薬剤-栄養相互作用チェック** — ワルファリン×VitK、利尿薬×K/Mgなど11ルールの自動検出
- **検査値履歴・トレンドチャート** — 検査値の時系列管理とグラフ表示、異常値の色分け
- **投与プロトコル生成** — 漸増スケジュール自動生成（refeeding syndrome対応）
- **アレルギーチェッカー** — 患者アレルギーと栄養製品の自動照合

### ワークフロー
- **メニュー作成・保存・編集** — 栄養メニューの作成からA4印刷まで一貫対応
- **クイックテンプレート** — 成人7種・小児2種の定型メニューをワンクリック適用
- **自動保存・下書き復元** — 30秒間隔の自動保存、ブラウザ閉じても復元可能
- **CSVエクスポート** — 患者一覧・メニューデータのCSV出力（Excel対応BOM付き）
- **PDF印刷** — 栄養指示書のA4印刷レイアウト（署名欄付き）
- **メニュー比較** — 2〜4メニューの栄養成分を横並び比較

### ダッシュボード
- **患者ステータス一覧** — 全患者の栄養状態・充足スコアをカードで俯瞰
- **週間エネルギーチャート** — 直近7日間のメニュー作成量をバーチャート表示
- **検査値アラート** — 全患者の異常検査値を重症度順に一覧表示

### UX
- **ダークモード** — システム設定連動 + 手動切替
- **レスポンシブデザイン** — デスクトップ・タブレット・スマートフォン対応
- **Supabase対応** — オプションでクラウド同期・認証（ローカルStorage単体でも動作）

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React 18 + TypeScript 5 |
| ビルド | Vite 4 |
| ルーティング | React Router 7 |
| チャート | Recharts 3 |
| アイコン | Lucide React |
| スタイリング | CSS Modules + CSS Custom Properties |
| バックエンド（任意） | Supabase (PostgreSQL + Auth) |
| テスト | Vitest |
| デプロイ | GitHub Pages (GitHub Actions) |

## セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/kgraph57/nutri-care.git
cd nutri-care

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

開発サーバーが `http://localhost:5173/nutri-care/` で起動します。

### Supabase連携（任意）

クラウド同期を使う場合は `.env` を作成:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Supabase設定なしでもローカルStorageのみで全機能が動作します。

## コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果プレビュー |
| `npm test` | テスト実行 |
| `npm run test:watch` | テストウォッチモード |

## プロジェクト構成

```
src/
├── components/
│   ├── dashboard/     # ダッシュボード用コンポーネント
│   ├── labs/          # 検査値チャート・テーブル
│   ├── layout/        # Sidebar, Header, BottomNav
│   ├── print/         # 印刷用レイアウト
│   ├── protocol/      # 投与プロトコル
│   ├── templates/     # クイックテンプレート
│   └── ui/            # 共通UIコンポーネント
├── data/              # 製品DB, テンプレート, ルール
├── hooks/             # カスタムフック
├── pages/             # ページコンポーネント
├── services/          # ビジネスロジック
├── styles/            # グローバルCSS
├── types/             # TypeScript型定義
└── utils/             # ユーティリティ
```

## ライセンス

Medical Use Only
