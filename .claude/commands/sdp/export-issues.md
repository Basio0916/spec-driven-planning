# /export-issues <slug>
You are Claude Code. Convert task breakdown into GitHub Issues or local markdown files.

## Inputs
- **slug**: An existing requirement folder at `.sdp/specs/<slug>/` containing `tasks.yml`
- **Export Config**: `.sdp/config/export.yml` (output destination, repository, labels)

## Language Configuration

Read `.sdp/config/language.yml` to determine the output language:
- If `language: en`, generate all content in **English**
- If `language: ja`, generate all content in **Japanese**

Console output should also be in the configured language.

## Context Files
Read these for context:
- `.sdp/specs/<slug>/tasks.yml` - Task breakdown to export
- `.sdp/specs/<slug>/requirement.md` - Original requirement
- `.sdp/config/export.yml` - Export configuration (destination, repo, labels)

## Pre-Check

Before starting, verify that:
- `.sdp/specs/<slug>/` directory exists
- `.sdp/specs/<slug>/tasks.yml` file exists
- `.sdp/config/export.yml` file exists

Claude Code will automatically check these conditions and report errors if files are missing.

## Important: Configure Before Running

**Before running this command, you MUST configure `.sdp/config/export.yml`**:

1. **Set export destination**: Choose `destination: github` or `destination: local`
2. **Configure GitHub settings** (if using GitHub mode):
   - Set `github.repo` to your repository (e.g., "owner/repo")
   - Customize `github.labels` as needed
3. **Configure local settings** (if using local mode):
   - Set `local.out_dir` if different from default

**User should review and edit `.sdp/config/export.yml` before proceeding.**

## Step 1: Load Export Configuration

Read `.sdp/config/export.yml`:

```yaml
destination: github | local   # Determines export destination

github:
  repo: owner/repo          # Target GitHub repository
  labels:                   # Default labels for all issues
    - sdp
    - enhancement
  main_issue_labels:        # Optional: Additional labels for main requirement issues
    - epic                  # (if not set, no additional labels beyond "labels")
  task_labels:              # Optional: Additional labels for task sub-issues
    - implementation        # (if not set, no additional labels beyond "labels")

local:
  out_dir: out       # Local output directory
```

### Determine Export Mode

Based on `destination` field:
- **`github`**: Export to GitHub Issues (requires `gh` CLI)
- **`local`**: Export to local markdown files (no GitHub required)

## Export Mode: GitHub

### Pre-Check for GitHub Mode

Claude Code will check:
- If `gh` CLI is available in the system
- If GitHub authentication is valid (if `gh` is available)
- If `gh sub-issue` extension is installed (required for creating sub-issues)

If `gh` CLI is not found or not authenticated, provide appropriate error messages to guide the user.

If `gh sub-issue` extension is not installed, provide installation instructions:
```bash
gh extension install yahsan2/gh-sub-issue
```

### Step 2A: Load GitHub Configuration

Read repository and labels from `.sdp/config/export.yml`:
- `github.repo`: Target repository (format: "owner/repo")
  - If not specified, gh CLI will auto-detect from current git repository
- `github.labels`: Default labels to apply to all issues
- `github.main_issue_labels`: Optional labels specifically for main requirement issues (if not set, omit)
- `github.task_labels`: Optional labels specifically for task sub-issues (if not set, omit)

### Step 3A: Create Main Requirement Issue (GitHub Mode)

First, create a single main issue for the requirement:

#### Issue Title
Format: `[<slug>] <requirement title>`

#### Issue Body Template

**For English (language: en)**:
```markdown
## Requirement Overview
<brief summary from .sdp/<slug>/requirement.md Goal section>

## Rollup Estimate
- Total Tasks: <count>
- Expected Hours: <expected_hours>h
- Standard Deviation: <stddev_hours>h
- Confidence: <confidence>

## Critical Path
<critical_path from rollup> (e.g., T-001 → T-003 → T-007)

## Task Breakdown
See sub-issues below for detailed task breakdown.

## Progress Tracking
- [ ] Requirements finalized
- [ ] Implementation started
- [ ] Testing complete
- [ ] Deployment ready
```

**For Japanese (language: ja)**:
```markdown
## 要件概要
<brief summary from .sdp/<slug>/requirement.md Goal section>

## 見積もりサマリー
- 総タスク数: <count>
- 予想時間: <expected_hours>h
- 標準偏差: <stddev_hours>h
- 信頼度: <confidence>

## クリティカルパス
<critical_path from rollup> (例: T-001 → T-003 → T-007)

## タスク分解
詳細なタスク分解はサブIssueを参照してください。

## 進捗管理
- [ ] 要件確定
- [ ] 実装開始
- [ ] テスト完了
- [ ] デプロイ準備完了
```

#### Labels
Combine the following (only if set in export.yml):
- `github.labels` (default labels for all issues)
- `github.main_issue_labels` (if set, additional labels for main issues)

**Note**: Do NOT add "requirement" or any hardcoded label automatically. Only use labels from export.yml configuration.

#### Execution
```bash
# Combine labels from export.yml (labels + main_issue_labels if set)
MAIN_ISSUE=$(gh issue create \
  --title "[<slug>] <requirement title>" \
  --body "<formatted body>" \
  --label "<combined_labels_from_config>" \
  --repo <owner/repo> | grep -oE '#[0-9]+' | tr -d '#')
```

Collect the main issue number for use in sub-issues.

### Step 4A: Create Task Sub-Issues (GitHub Mode)

For each task in `.sdp/specs/<slug>/tasks.yml`, create a sub-issue using the `gh sub-issue` extension:

#### Sub-Issue Title
Format: `[<slug>][T-xxx] <task.title>`

#### Sub-Issue Body Template

**For English (language: en)**:
```markdown
## Description
<task.description>

## Deliverables
<list of task.deliverables>

## Definition of Done
<checklist from task.dod>

## Dependencies
<list of task.depends_on with issue references if available>

## Estimate
- Method: PERT
- Optimistic: <optimistic>h
- Most Likely: <most_likely>h
- Pessimistic: <pessimistic>h
- Expected: <mean>h

## Risk Notes
<task.risks if present>
```

**For Japanese (language: ja)**:
```markdown
## 説明
<task.description>

## 成果物
<list of task.deliverables>

## 完了の定義
<checklist from task.dod>

## 依存関係
<list of task.depends_on with issue references if available>

## 見積もり
- 手法: PERT
- 楽観値: <optimistic>h
- 最頻値: <most_likely>h
- 悲観値: <pessimistic>h
- 期待値: <mean>h

## リスクメモ
<task.risks if present>
```

#### Labels
Combine the following (only if set):
- `github.labels` (default labels for all issues)
- `github.task_labels` (if set, additional labels for task sub-issues)

**Note**: Do NOT add "task" or any hardcoded label automatically. Only use labels from export.yml configuration.

#### Execution
Use `gh sub-issue create` to create sub-issues that are automatically linked to the parent:

```bash
# Combine labels from export.yml (labels + task_labels if set)
# If labels are set, add --label flag; otherwise omit it
if [ -n "$TASK_LABELS" ]; then
  SUB_ISSUE=$(gh sub-issue create --parent ${MAIN_ISSUE} \
    --repo <owner/repo> \
    --title "[T-001] <task.title>" \
    --body "<formatted body>" \
    --label "$TASK_LABELS")
else
  SUB_ISSUE=$(gh sub-issue create --parent ${MAIN_ISSUE} \
    --repo <owner/repo> \
    --title "[T-001] <task.title>" \
    --body "<formatted body>")
fi
```

Collect the returned sub-issue number and URL for each task.

### Step 5A: Collect Results (GitHub Mode)

The `gh sub-issue` extension automatically creates a proper parent-child relationship between issues.
The task checklist is automatically maintained in the parent issue by GitHub's sub-issue feature.

Create a mapping table of task ID → sub-issue number/URL and main issue for the console output.

## Export Mode: Local

### Step 2B: Prepare Local Output Directory

Read the output directory from `.sdp/config/export.yml` under `local.out_dir` (default: `out`).
Create the output directory if it doesn't exist using Claude Code's file operations.

### Step 3B: Generate Issue Drafts (Local Mode)

Create a markdown file at `${OUT_DIR}/<slug>-issues.md` with localized content based on `.sdp/config/language.yml`.

**For English (language: en)**:
```markdown
# GitHub Issues Draft for <slug>

This file contains issue drafts for requirement <slug>.
Structure: 1 main issue + N sub-issues (tasks)

---

## Main Requirement Issue

**Title**: [<slug>] <requirement title>

**Body**:
```markdown
## Requirement Overview
<brief summary from .sdp/specs/<slug>/requirement.md Goal section>

## Rollup Estimate
- Total Tasks: <count>
- Expected Hours: <expected_hours>h
- Standard Deviation: <stddev_hours>h
- Confidence: <confidence>

## Critical Path
<critical_path from rollup> (e.g., T-001 → T-003 → T-007)

## Task Breakdown
See sub-issues below for detailed task breakdown.

## Progress Tracking
- [ ] Requirements finalized
- [ ] Implementation started
- [ ] Testing complete
- [ ] Deployment ready
```

**Labels**: <labels from export.yml github.labels + github.main_issue_labels (if set)>

---

## Task Sub-Issues

### Sub-Issue 1: [T-001] <task title>

**Title**: [T-001] <task.title>

**Body**:
```markdown
## Description
<task.description>

## Deliverables
- <deliverable 1>
- <deliverable 2>

## Definition of Done
- [ ] <dod 1>
- [ ] <dod 2>

## Dependencies
- <depends_on with issue references>

## Estimate
- Method: PERT
- Optimistic: <optimistic>h
- Most Likely: <most_likely>h
- Pessimistic: <pessimistic>h
- Expected: <mean>h

## Risk Notes
<task.risks if present>
```

**Labels**: <labels from export.yml github.labels + github.task_labels (if set)>

---

(Repeat for each task)

---
```

**For Japanese (language: ja)**:
```markdown
# <slug> GitHub Issues ドラフト

この要件 <slug> のIssueドラフトです。
構造: 1つのメインIssue + N個のサブIssue (タスク)

---

## メイン要件Issue

**タイトル**: [<slug>] <requirement title>

**本文**:
```markdown
## 要件概要
<brief summary from .sdp/specs/<slug>/requirement.md Goal section>

## 見積もりサマリー
- 総タスク数: <count>
- 予想時間: <expected_hours>h
- 標準偏差: <stddev_hours>h
- 信頼度: <confidence>

## クリティカルパス
<critical_path from rollup> (例: T-001 → T-003 → T-007)

## タスク分解
詳細なタスク分解はサブIssueを参照してください。

## 進捗管理
- [ ] 要件確定
- [ ] 実装開始
- [ ] テスト完了
- [ ] デプロイ準備完了
```

**ラベル**: <labels from export.yml github.labels + github.main_issue_labels (if set)>

---

## タスクサブIssue

### サブIssue 1: [T-001] <task title>

**タイトル**: [T-001] <task.title>

**本文**:
```markdown
## 説明
<task.description>

## 成果物
- <deliverable 1>
- <deliverable 2>

## 完了の定義
- [ ] <dod 1>
- [ ] <dod 2>

## 依存関係
- <depends_on with issue references>

## 見積もり
- 手法: PERT
- 楽観値: <optimistic>h
- 最頻値: <most_likely>h
- 悲観値: <pessimistic>h
- 期待値: <mean>h

## リスクメモ
<task.risks if present>
```

**ラベル**: <labels from export.yml github.labels + github.task_labels (if set)>

---

(各タスクについて繰り返し)

---
```

## Instructions for Manual Issue Creation

### Prerequisites

Install the `gh sub-issue` extension:
```bash
gh extension install yahsan2/gh-sub-issue
```

### Step-by-Step Process

1. **Create Main Requirement Issue First**:
   ```bash
   MAIN_ISSUE=$(gh issue create \
     --title "[<slug>] <title>" \
     --body "$(cat main-issue-body.md)" \
     --label "<combined_labels>" \
     --repo <owner/repo> | grep -oE '#[0-9]+' | tr -d '#')
   echo "Main issue created: #${MAIN_ISSUE}"
   ```

2. **Create Each Task as Sub-Issue** (automatically linked to parent):
   ```bash
   # If labels are configured
   SUB_ISSUE_1=$(gh sub-issue create --parent ${MAIN_ISSUE} \
     --repo <owner/repo> \
     --title "[T-001] <task title>" \
     --body "$(cat task-001-body.md)" \
     --label "<combined_labels>")
   echo "Sub-issue T-001 created: ${SUB_ISSUE_1}"
   
   # If no labels
   SUB_ISSUE_2=$(gh sub-issue create --parent ${MAIN_ISSUE} \
     --repo <owner/repo> \
     --title "[T-002] <task title>" \
     --body "$(cat task-002-body.md)")
   echo "Sub-issue T-002 created: ${SUB_ISSUE_2}"
   ```

3. **Note**: Task checklist is automatically maintained by GitHub's sub-issue feature. No manual update needed.
```

## Output Format

Generate console output in the configured language (`.sdp/config/language.yml`) based on export mode:

### For GitHub Mode (destination: github)

```
【GitHub Issues エクスポート完了】
📋 要件: <slug>
🎯 モード: GitHub Issues
📦 リポジトリ: <owner/repo>

作成されたIssue:
📌 メインIssue: #<main_issue>
   https://github.com/owner/repo/issues/<main_issue>

🎫 サブIssue (タスク): <count>個

タスクIssueマッピング:
| Task ID | Sub-Issue # | URL                                    |
|---------|-------------|----------------------------------------|
| T-001   | #124        | https://github.com/owner/repo/issues/124 |
| T-002   | #125        | https://github.com/owner/repo/issues/125 |
| T-003   | #126        | https://github.com/owner/repo/issues/126 |
...

✅ 1つのメインIssueと<count>個のサブIssueを作成しました
💡 次のステップ: メインIssue #<main_issue> から各タスクの進捗を管理してください
```

### For Local Mode (destination: local)

```
【GitHub Issues エクスポート（ローカル出力）】
📋 要件: <slug>
🎯 モード: ローカルファイル
📁 出力ディレクトリ: <out_dir>

生成ファイル:
✅ <out_dir>/<slug>-issues.md     - Issue ドラフト (マニュアルインポート用)

📊 タスク数: <count>
⏱️  総見積時間: <expected_hours>h

💡 次のステップ:
   1. Issueドラフトをレビュー: cat <out_dir>/<slug>-issues.md
   2. GitHub上で手動でIssueを作成してください
   3. または GitHub CLI (gh) を使って手動でインポートしてください
```

### Error Cases

#### GitHub Mode: gh CLI not available
```
【エラー: GitHub CLI 未検出】
📋 要件: <slug>
🎯 設定モード: GitHub Issues
❌ GitHub CLI (gh) がインストールされていません

💡 対処方法:
   1. GitHub CLI をインストール: https://cli.github.com/
   2. または export.yml の "destination" を "local" に変更してローカル出力を使用
   3. コマンド実行: /sdp:export-issues <slug>
```

#### GitHub Mode: gh sub-issue extension not installed
```
【エラー: gh sub-issue 拡張未インストール】
📋 要件: <slug>
🎯 設定モード: GitHub Issues
❌ gh sub-issue 拡張がインストールされていません

💡 対処方法:
   1. gh sub-issue 拡張をインストール: gh extension install yahsan2/gh-sub-issue
   2. または export.yml の "destination" を "local" に変更してローカル出力を使用
   3. コマンド実行: /sdp:export-issues <slug>
```

#### GitHub Mode: Not authenticated
```
【エラー: GitHub 認証未完了】
📋 要件: <slug>
🎯 設定モード: GitHub Issues
⚠️  GitHub CLI は利用可能ですが、認証されていません

💡 対処方法:
   1. GitHub認証を実行: gh auth login
   2. または export.yml の "destination" を "local" に変更してローカル出力を使用
   3. コマンド実行: /sdp:export-issues <slug>
```

#### Task file not found
```
【エラー: タスクファイル未検出】
📋 要件: <slug>
❌ .sdp/specs/<slug>/tasks.yml が見つかりません

💡 対処方法:
   1. 要件が存在するか確認: ls -d .sdp/specs/*/
   2. タスク分解を実行: /sdp:estimate <slug>
   3. その後再実行: /sdp:export-issues <slug>
```

## Configuration Priority

When determining the target repository:

1. **First priority**: `export.yml` → `github.repo`
2. **Fallback**: Let `gh` auto-detect from current git repository

Example decision tree:
```
IF export.yml has github.repo:
  USE export.yml github.repo
ELSE:
  OMIT --repo flag (gh auto-detects from current git repo)
```

**Note**: All configuration is now centralized in `.sdp/config/export.yml`.

## Cross-Platform Compatibility

This command works on all platforms (Windows, macOS, Linux):
- Uses Claude Code's native file operations instead of shell-specific commands
- Local mode generates markdown files that can be manually imported on any platform
- GitHub mode uses `gh` CLI which is available on all platforms

## Allowed Tools
Read, Write, Terminal (for gh CLI commands in GitHub mode), File Search, Grep only