# Spec-Driven Planning (SDP)

自然言語の要件を、洗練された仕様書、タスク分解、見積もり、GitHub Issueに変換する、Claude Code カスタムコマンドを使用した構造化ワークフローシステムです。

## 機能

- 📋 **要件の洗練化**: 自然言語を構造化された仕様書に変換
- 📊 **PERT見積もり**: PERTベースの見積もりによる正確なタスク分解
- 🗺️ **ビジュアル計画**: ガントチャートとクリティカルパス分析の作成
- 🔗 **マルチプラットフォーム連携**: GitHub Issues、Jira、Backlog、またはローカルファイルへタスクをエクスポート
- 🏗️ **スマートコンテキスト**: プロジェクトコンテキスト（プロダクト、技術、構造）の自動生成

## クイックスタート

### インストール

`npx`を使用してプロジェクトにSDPを初期化します:

```bash
# Claude Code用に初期化（デフォルト）
npx spec-driven-planning init

# GitHub Copilot用に初期化
npx spec-driven-planning init --github-copilot

# 日本語で初期化
npx spec-driven-planning init --lang ja

# GitHub Copilot用で日本語で初期化
npx spec-driven-planning init --github-copilot --lang ja
```

以下のファイル・ディレクトリが作成されます:
- `.claude/commands/sdp/` - カスタムスラッシュコマンド（Claude Code）
- `.github/prompts/` - プロンプトファイル（GitHub Copilot）
- `.sdp/config/` - 設定ファイル（言語設定を含む）
- `.sdp/templates/en/` - 英語ドキュメントテンプレート
- `.sdp/templates/ja/` - 日本語ドキュメントテンプレート
- `.sdp/specs/` - 要件ディレクトリ（オンデマンドで作成）
- `.sdp/out/` - エクスポート用の出力ディレクトリ

### 設定

#### 言語設定

`.sdp/config/language.yml`で出力言語を設定します:

```yaml
# サポートされている言語: en (英語), ja (日本語)
language: en  # または ja
```

生成されるすべてのドキュメント（requirement.md、design.md、plan.mdなど）が指定された言語で作成されます。

#### エクスポート設定

**エクスポート設定の更新** (`.sdp/config/export.yml`):
   ```yaml
   destination: github  # "github"、"jira"、"backlog"、または "local"
   github:
     repo: your-org/your-repo
     issue_mode: sub_issues  # sub_issues、linked_issues、または single_issue
     labels:
       - sdp
       - enhancement
   jira:
     url: https://your-domain.atlassian.net
     project: PROJ
     email: your-email@example.com
     issue_mode: sub_tasks
   backlog:
     space_key: myspace
     domain: backlog.com
     project_key: PROJ
     issue_mode: sub_tasks
   local:
     out_dir: out
   ```

#### 見積もり設定

**見積もりパラメータの調整** (`.sdp/config/estimate.yml`):
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

### 3. 設計代替案の評価

設計の代替案を比較検討（軽量・200-400行）:

```bash
/sdp:design-alternatives add-user-authentication
```

以下の内容を含む `.sdp/specs/add-user-authentication/design-alternatives.md` が作成されます:
- 設計の代替案（2〜4つのアプローチと利点・欠点）
- 比較マトリクス
- 根拠を含む推奨ソリューション
- 主要なトレードオフ

**メリット**: 1000行超の大量ドキュメントではなく、軽量な比較で方向性を決定できます。

### 4. 詳細設計の作成

選択した代替案を実装可能レベルまで詳細化（500-800行）:

```bash
# 推奨案を採用する場合
/sdp:design-detail add-user-authentication

# 別の代替案（例: 代替案2）を選択する場合
/sdp:design-detail add-user-authentication 2
```

以下の内容を含む `.sdp/specs/add-user-authentication/design.md` が作成されます:
- 採用した設計案の要約
- 詳細設計（アーキテクチャ、データモデル、API）
- セキュリティ対策
- パフォーマンス最適化
- トレードオフとリスク
- 実装ガイドライン
- ファイル構成と実装順序

**メリット**: 選択した案のみ詳細化するため、不要な設計作業を削減できます。

**既存の /sdp:design コマンドについて**: 後方互換性のため、既存の `/sdp:design` コマンドも引き続き使用できます（代替案評価と詳細設計を一度に実行）。ただし、段階的な設計には新しい2段階フローの使用を推奨します。

### 5. タスク分解の生成

PERT見積もり付きのタスク分解を作成:

```bash
/sdp:estimate add-user-authentication
```

以下の内容を含む `.sdp/specs/add-user-authentication/tasks.yml` が作成されます:
- 依存関係を持つ5〜12のタスク
- PERT見積もり（楽観値、最頻値、悲観値）
- クリティカルパス分析
- ロールアップメトリクス（予想時間、標準偏差、信頼度）

### 6. 計画の可視化

人間が読みやすいプロジェクト計画を生成:

```bash
/sdp:show-plan add-user-authentication
```

以下の内容を含む `.sdp/specs/add-user-authentication/plan.md` が作成されます:
- 概要
- ガント図風のMermaidダイアグラム
- リスク台帳（上位3つ）
- クリティカルパスとバッファ推奨事項

### 7. 課題トラッカーへのエクスポート

タスクをGitHub Issues、Jira、Backlog、またはローカルファイルにエクスポート:

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
- `export.yml`で`destination: github`に設定
- メインIssueを作成
- タスクIssueを作成（サブIssue/リンクIssue/単一Issue）
- サブIssueはメインIssueを参照
- メインIssueにタスクチェックリストを追加

**Jiraモード**（REST API使用）:
- **前提条件**: Jira API Token（[生成方法](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)）
- `export.yml`で`destination: jira`に設定
- Jiraプロジェクト、URL、メール、API Tokenを設定
- Jira REST API v3を使用
- Atlassian Document Format (ADF)で記述
- 説明フィールドに整形されたコンテンツを作成
- エピック、ストーリー、サブタスクの関係を自動作成

**Backlogモード**（REST API使用）:
- **前提条件**: Backlog API Key（スペース管理者権限が必要）
- `export.yml`で`destination: backlog`に設定
- Backlogスペース、プロジェクトキー、API Keyを設定
- Backlog REST API v2を使用
- Markdown形式で記述
- 親課題と子課題の関係を自動作成

**ローカルモード**（GitHub CLIは不要）:
- `export.yml`で`destination: local`に設定
- `.sdp/out/add-user-authentication-issues.md` を生成
- `.sdp/out/add-user-authentication-import.sh` を作成（macOS/Linux/Git Bash用Bashスクリプト）
- `.sdp/out/add-user-authentication-import.ps1` を作成（Windows用PowerShellスクリプト）
- インポートスクリプトは、後でCLIが利用可能になった際に実行可能

### 7. オプション: 実装の実行

計画と課題の準備が整ったら、必要に応じて実装を実行できます:

```bash
/sdp:implement add-user-authentication
```

- 引数を指定しない場合、`tasks.yml`に定義された全タスクを順番に実行します。
- 特定のタスクのみ実行したい場合は、タスクIDを指定します（例: `/sdp:implement add-user-authentication T-002 T-004`）。

`.sdp/specs/add-user-authentication/implementation.md` を生成または更新し、実施内容やテスト結果を記録しつつ必要なコード変更を反映します。

## Issue構造

課題トラッカーへのエクスポート時、SDPは階層構造を作成します。`issue_mode`設定により構造が変わります:

### 1. Sub-issues/Sub-tasks Mode (デフォルト)
親課題の下にサブ課題を作成:

```
📌 メイン課題: [add-user-authentication] ユーザー認証機能
   ├─ 🎫 サブ課題: [add-user-authentication][T-001] 認証モジュールのセットアップ
   ├─ 🎫 サブ課題: [add-user-authentication][T-002] JWTトークンサービスの実装
   ├─ 🎫 サブ課題: [add-user-authentication][T-003] ログイン/ログアウトエンドポイントの作成
   └─ 🎫 サブ課題: [add-user-authentication][T-004] 認証テストの追加
```

### 2. Linked Issues Mode
独立した課題を作成し、メインIssue本文にリンク:

```
📌 メインIssue: [add-user-authentication] ユーザー認証機能
   [本文にリンクリスト]
   
🎫 課題: [add-user-authentication][T-001] 認証モジュールのセットアップ
🎫 課題: [add-user-authentication][T-002] JWTトークンサービスの実装
🎫 課題: [add-user-authentication][T-003] ログイン/ログアウトエンドポイントの作成
🎫 課題: [add-user-authentication][T-004] 認証テストの追加
```

### 3. Single Issue Mode
すべてのタスクを1つのIssue内のチェックリストとして作成:

```
📌 単一Issue: [add-user-authentication] ユーザー認証機能
   - [ ] [T-001] 認証モジュールのセットアップ
   - [ ] [T-002] JWTトークンサービスの実装
   - [ ] [T-003] ログイン/ログアウトエンドポイントの作成
   - [ ] [T-004] 認証テストの追加
```

各サブ課題には以下が含まれます:
- 親課題参照
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
| `/sdp:design-alternatives <slug>` | 軽量な設計代替案の生成（2〜4つのアプローチ） |
| `/sdp:design-detail <slug> [alt-num]` | 選択した代替案から詳細設計を生成 |
| `/sdp:design <slug>` | （旧版）代替案と詳細設計を一度に生成 |
| `/sdp:estimate <slug>` | PERT見積もり付きのタスク分解の生成 |
| `/sdp:show-plan <slug>` | ガントチャート付きのビジュアルプロジェクト計画の作成 |
| `/sdp:export-issues <slug>` | GitHub Issues、Jira、Backlog、またはローカルファイルへのエクスポート |
| `/sdp:implement <slug> [task-id ...]` | （任意）実装タスクの実行とログの記録 |

## テンプレート

すべてのテンプレートは `.sdp/templates/` にあります:

- `product.md` - プロダクト概要テンプレート
- `tech.md` - 技術スタックテンプレート
- `structure.md` - コード構造テンプレート
- `requirement.md` - 要件仕様テンプレート
- `design.md` - 設計ドキュメントテンプレート
- `implementation.md` - 実装ログテンプレート
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
│       ├── implementation.md # 実装ログおよびテスト記録
│       └── plan.md         # プロジェクト計画
└── out/                # Issue下書きとインポートスクリプト
```

## 言語サポート

SDPは生成コンテンツの多言語対応をサポートしています:

- **サポート言語**: 英語 (en)、日本語 (ja)
- **設定方法**: `.sdp/config/language.yml`で設定
- **デフォルト**: 英語
- **コマンド定義**: 英語（常に）
- **生成コンテンツ**: 言語設定に基づく（要件、計画、説明）
- **コンソール出力**: 言語設定に基づく

### 言語の変更

初期化後に出力言語を変更するには、`.sdp/config/language.yml`を編集します:

```yaml
language: ja  # 英語の場合は 'en'、日本語の場合は 'ja' に変更
```

その後のすべてのコマンドは指定された言語でコンテンツを生成します。

## GitHub Copilotサポート

SDPはClaude Codeに加えて、GitHub Copilotにも対応しました！初期化時に`--github-copilot`フラグを使用することで、GitHub Copilot用のプロンプトファイルをセットアップできます。

### GitHub Copilotのセットアップ

1. **GitHub Copilotサポートで初期化:**
   ```bash
   npx spec-driven-planning init --github-copilot
   ```

2. **VS Codeでプロンプトファイルを有効化:**
   - VS Code設定を開く（Cmd+, または Ctrl+,）
   - `chat.promptFiles`を検索
   - 設定を有効化

3. **VS Codeをリロード**してプロンプトファイルを有効化

### コマンドの違い

| Claude Code | GitHub Copilot | 説明 |
|------------|----------------|------|
| `/sdp:steering` | `/sdp-steering` | プロジェクトコンテキストを生成 |
| `/sdp:requirement` | `/sdp-requirement` | 要件仕様を洗練化 |
| `/sdp:design-alternatives` | `/sdp-design-alternatives` | 設計代替案を生成 |
| `/sdp:design-detail` | `/sdp-design-detail` | 詳細設計を生成 |
| `/sdp:design` | `/sdp-design` | （旧版）設計を一度に生成 |
| `/sdp:estimate` | `/sdp-estimate` | タスク分解を生成 |
| `/sdp:show-plan` | `/sdp-show-plan` | ビジュアルプロジェクト計画を作成 |
| `/sdp:implement` | `/sdp-implement` | 実装タスクを実行 |
| `/sdp:export-issues` | `/sdp-export-issues` | Issue Trackerへエクスポート |

### GitHub Copilotでのプロンプトファイル使用方法

GitHub Copilot Chatビューで:
1. `/`に続けてコマンド名を入力
2. 必要に応じて引数を追加（例: `/sdp-requirement ユーザー認証を追加`）
3. Enterキーを押して実行

GitHub Copilotはプロンプトファイルを使用し、Claude Codeと同じ構造化された出力を生成します！

## 必要要件

- **Node.js**: 14.0.0以上（`npx`によるインストールに必要）
- **AIアシスタント**: 以下のいずれか:
  - **Claude Code**: `.claude/commands/sdp/`カスタムコマンド用
  - **GitHub Copilot**: `.github/prompts/`プロンプトファイル用（VS Codeで`chat.promptFiles`設定を有効化する必要があります）

### オプション要件（エクスポート先に応じて）

- **GitHub CLI** (`gh`): GitHub Issueへの直接エクスポートに必要
  - インストール: https://cli.github.com/
  - ローカルモード（`.sdp/config/export.yml`で`destination: local`を設定）を使用する場合は不要

- **Jira API Token**: Jiraへのエクスポートに必要
  - Jira Cloud環境とプロジェクトへのアクセス
  - Jira API Token（[生成方法](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)）
  - `.sdp/config/export.yml`にURL、プロジェクト、メール、API Tokenを設定

- **Backlog API Key**: Backlogへのエクスポートに必要
  - Backlogスペースとプロジェクトへのアクセス
  - Backlog API Key（スペース管理者権限が必要）
  - `.sdp/config/export.yml`にspace_key、domain、project_key、API Keyを設定

## プラットフォームサポート

SDPは主要なすべてのプラットフォームで動作します:
- ✅ **Windows**: 完全サポート（PowerShellスクリプト対応）
- ✅ **macOS**: 完全サポート（Bashスクリプト）
- ✅ **Linux**: 完全サポート（Bashスクリプト）

すべてのコマンドは、プラットフォーム固有のシェルコマンドではなく、Claude Codeのネイティブなファイル操作を使用しているため、すべてのプラットフォームで一貫した動作を保証します。

## ライセンス

Apache-2.0

## コントリビューション

コントリビューションを歓迎します！バグ報告や機能リクエストは、GitHub Issueからお気軽にどうぞ。

## サポート

- **Issues**: GitHub Issueからバグ報告や機能リクエストをお願いします
- **Claude Codeドキュメント**: https://docs.claude.com/claude-code

---

**Claude Codeのために❤️を込めて作成**
