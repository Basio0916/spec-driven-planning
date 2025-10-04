# Spec-Driven Planning (SDP)

自然言語の要件を、洗練された仕様書、タスク分解、見積もり、GitHub Issueに変換する、Claude Code カスタムコマンドを使用した構造化ワークフローシステムです。

## 機能

- 📋 **要件の洗練化**: 自然言語を構造化された仕様書に変換
- 📊 **PERT見積もり**: PERTベースの見積もりによる正確なタスク分解
- 🗺️ **ビジュアル計画**: ガントチャートとクリティカルパス分析の作成
- 🔗 **GitHub連携**: タスクをサブIssue構造でGitHub Issueにエクスポート
- 🏗️ **スマートコンテキスト**: プロジェクトコンテキスト（プロダクト、技術、構造）の自動生成

## クイックスタート

### インストール

`npx`を使用してプロジェクトにSDPを初期化します:

```bash
npx spec-driven-planning init
```

以下のファイル・ディレクトリが作成されます:
- `.claude/commands/sdp/` - カスタムスラッシュコマンド
- `.sdp/config/` - 設定ファイル
- `.sdp/templates/` - ドキュメントテンプレート
- `.sdp/specs/` - 要件ディレクトリ（オンデマンドで作成）
- `.sdp/out/` - エクスポート用の出力ディレクトリ

### 設定

1. **エクスポート設定の更新** (`.sdp/config/export.yml`):
   ```yaml
   destination: github  # または "local"
   github:
     repo: your-org/your-repo
     labels:
       - sdp
       - enhancement
   local:
     out_dir: out
   ```

2. **見積もりパラメータの調整** (`.sdp/config/estimate.yml`):
   ```yaml
   default_buffers:
      schedule: 0.15   # 15%のバッファ
   pert:
      clamp:
         min_h: 1
         max_h: 40
   ```

## ワークフロー

### 1. プロジェクトコンテキストの初期化

プロジェクトコンテキストドキュメントを生成:

```bash
/sdp:steering
```

以下のファイルが作成されます:
- `.sdp/product.md` - ビジネスゴールとKPI
- `.sdp/tech.md` - 技術スタックと制約
- `.sdp/structure.md` - コード構成

### 2. 要件の定義

自然言語の要件を洗練化:

```bash
/sdp:requirement "ユーザー認証機能を追加"
```

以下の内容を含む `.sdp/specs/add-user-authentication/requirement.md` が作成されます:
- 機能概要
- ユーザーストーリー
- 受け入れ基準付きの機能要件
- 非機能要件

### 3. 設計の作成

代替案を含む詳細設計を生成:

```bash
/sdp:design add-user-authentication
```

以下の内容を含む `.sdp/specs/add-user-authentication/design.md` が作成されます:
- 設計の代替案（2〜4つのアプローチと利点・欠点）
- 比較マトリクス
- 根拠を含む推奨ソリューション
- 詳細設計（アーキテクチャ、データモデル、API）
- トレードオフとリスク
- 実装ガイドライン

### 4. タスク分解の生成

PERT見積もり付きのタスク分解を作成:

```bash
/sdp:estimate add-user-authentication
```

以下の内容を含む `.sdp/specs/add-user-authentication/tasks.yml` が作成されます:
- 依存関係を持つ5〜12のタスク
- PERT見積もり（楽観値、最頻値、悲観値）
- クリティカルパス分析
- ロールアップメトリクス（予想時間、標準偏差、信頼度）

### 5. 計画の可視化

人間が読みやすいプロジェクト計画を生成:

```bash
/sdp:show-plan add-user-authentication
```

以下の内容を含む `.sdp/specs/add-user-authentication/plan.md` が作成されます:
- 概要
- ガント図風のMermaidダイアグラム
- リスク台帳（上位3つ）
- クリティカルパスとバッファ推奨事項

### 6. GitHubへのエクスポート

タスクをGitHub Issueにエクスポート:

```bash
/sdp:export-issues add-user-authentication
```

**GitHubモード**（GitHub CLIが必要）:
- **前提条件**: [GitHub CLI (`gh`)](https://cli.github.com/)をインストールして認証
  ```bash
  # GitHub CLIのインストール（macOS）
  brew install gh
  
  # 認証
  gh auth login
  ```
- 1つのメインの要件Issueを作成
- N個のタスクサブIssueを作成
- サブIssueはメインIssueを参照
- メインIssueにタスクチェックリストを追加

**ローカルモード**（GitHub CLIは不要）:
- `.sdp/out/add-user-authentication-issues.md` を生成
- バッチインポート用の `.sdp/out/add-user-authentication-import.sh` を作成
- インポートスクリプトは、後で `gh` CLIが利用可能になった際に実行可能

## Issue構造

GitHubへのエクスポート時、SDPは階層構造を作成します:

```
📌 メインIssue: [add-user-authentication] ユーザー認証機能
   ├─ 🎫 サブIssue: [add-user-authentication][T-001] 認証モジュールのセットアップ
   ├─ 🎫 サブIssue: [add-user-authentication][T-002] JWTトークンサービスの実装
   ├─ 🎫 サブIssue: [add-user-authentication][T-003] ログイン/ログアウトエンドポイントの作成
   └─ 🎫 サブIssue: [add-user-authentication][T-004] 認証テストの追加
```

各サブIssueには以下が含まれます:
- 親Issue参照
- 説明と成果物
- 完了の定義（チェックリスト）
- 依存関係
- PERT見積もり
- リスクメモ

## カスタムコマンド

すべてのコマンドは `.claude/commands/sdp/` にあります:

| コマンド | 説明 |
|---------|-------------|
| `/sdp:steering` | プロジェクトコンテキストの生成（プロダクト、技術、構造） |
| `/sdp:requirement <text-or-path>` | 要件の洗練化と正規化 |
| `/sdp:design <slug>` | 代替案と根拠を含む詳細設計の生成 |
| `/sdp:estimate <slug>` | PERT見積もり付きのタスク分解の生成 |
| `/sdp:show-plan <slug>` | ガントチャート付きのビジュアルプロジェクト計画の作成 |
| `/sdp:export-issues <slug>` | GitHub Issueまたはローカルファイルへのエクスポート |

## テンプレート

すべてのテンプレートは `.sdp/templates/` にあります:

- `product.md` - プロダクト概要テンプレート
- `tech.md` - 技術スタックテンプレート
- `structure.md` - コード構造テンプレート
- `requirement.md` - 要件仕様テンプレート
- `design.md` - 設計ドキュメントテンプレート
- `tasks.schema.yml` - タスクYAMLスキーマ

各テンプレートには詳細な例とガイダンスが含まれています。

## ディレクトリ構造

```
.claude/
└── commands/sdp/       # カスタムスラッシュコマンド

.sdp/                   # SDP作業ディレクトリ（gitignore対象）
├── config/             # 設定ファイル
│   ├── estimate.yml    # 見積もりパラメータ
│   └── export.yml      # エクスポート先設定
├── templates/          # ドキュメントテンプレート
├── product.md          # ビジネスコンテキスト
├── tech.md             # 技術コンテキスト
├── structure.md        # コード構造
├── specs/              # 要件ディレクトリ
│   └── <slug>/         # 要件フォルダ（例: add-user-authentication/）
│       ├── requirement.md  # 要件仕様
│       ├── design.md       # 設計ドキュメント
│       ├── tasks.yml       # タスク分解
│       └── plan.md         # プロジェクト計画
└── out/                # Issue下書きとインポートスクリプト
```

## 言語設定

- **コマンド定義**: 英語
- **生成コンテンツ**: 日本語（要件、計画、説明）
- **コンソール出力**: 日本語

## 必要要件

- **Node.js**: 14.0.0以上（`npx`によるインストールに必要）
- **Claude Code**: カスタムコマンドの実行に必要
- **GitHub CLI** (`gh`): オプション、直接GitHub Issueへのエクスポートにのみ必要
  - インストール: https://cli.github.com/
  - ローカルモード（`.sdp/config/export.yml`で`destination: local`を設定）を使用する場合は不要

## ライセンス

Apache-2.0

## コントリビューション

コントリビューションを歓迎します！バグ報告や機能リクエストは、GitHub Issueからお気軽にどうぞ。

## サポート

- **Issues**: GitHub Issueからバグ報告や機能リクエストをお願いします
- **Claude Codeドキュメント**: https://docs.claude.com/claude-code

---

**Claude Codeのために❤️を込めて作成**
