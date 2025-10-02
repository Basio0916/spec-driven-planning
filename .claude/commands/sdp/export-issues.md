# /export-issues <REQ-ID>
You are Claude Code. Convert task breakdown into GitHub Issues or local markdown files.

## Inputs
- **REQ-ID**: An existing file at `.sdp/tasks/REQ-xxx.yml`
- **Export Config**: `.claude/config/export.yml` (output destination)
- **GitHub Config**: `.claude/config/github.yml` (GitHub-specific settings)

## Context Files
Read these for context:
- `.sdp/tasks/REQ-xxx.yml` - Task breakdown to export
- `.sdp/requirements/REQ-xxx.md` - Original requirement
- `.claude/config/export.yml` - Export destination configuration
- `.claude/config/github.yml` - GitHub integration config (if exporting to GitHub)

## Pre-Check

```bash
# Verify task file exists
[ -f ".sdp/tasks/${REQ_ID}.yml" ] && echo "✅ Task file found" || echo "❌ Task file not found"

# Read export configuration to determine output destination
# Expected: export.yml contains "to: github" or "to: local"
```

## Step 1: Load Export Configuration

Read `.claude/config/export.yml`:

```yaml
to: github | local   # Determines export destination

github:
  repo: owner/repo   # Target GitHub repository

local:
  out_dir: ./out     # Local output directory
```

### Determine Export Mode

Based on `to` field:
- **`github`**: Export to GitHub Issues (requires `gh` CLI)
- **`local`**: Export to local markdown files (no GitHub required)

## Export Mode: GitHub

### Pre-Check for GitHub Mode

```bash
# Check if gh CLI is available
command -v gh >/dev/null 2>&1 && echo "✅ GitHub CLI available" || echo "❌ GitHub CLI not found - cannot use GitHub mode"

# Verify GitHub authentication (if gh available)
gh auth status 2>/dev/null && echo "✅ GitHub authenticated" || echo "⚠️  Not authenticated"
```

### Step 2A: Load GitHub Configuration

Read `.claude/config/github.yml`:
- `default_repo`: Target repository (format: "owner/repo")
  - **Priority**: Use `export.yml` `github.repo` if present, otherwise fall back to `github.yml` `default_repo`
- `labels`: Default labels to apply to all issues

### Step 3A: Create Individual Task Issues (GitHub Mode)

For each task in `.sdp/tasks/REQ-xxx.yml`:

#### Issue Title
Format: `[REQ-xxx] <task.title>`

#### Issue Body
Include the following sections in markdown:
```markdown
## Description
<task.description>

## Deliverables
<list of task.deliverables>

## Definition of Done
<checklist from task.dod>

## Dependencies
<list of task.depends_on>

## Estimate
- Method: PERT
- Optimistic: <optimistic>h
- Most Likely: <most_likely>h
- Pessimistic: <pessimistic>h
- Expected: <mean>h

## Risk Notes
<task.risks if present>
```

#### Labels
Combine:
- `github.yml` `labels` (default labels)
- `["REQ-xxx"]` (requirement identifier)
- `task.labels` (from task definition)

#### Execution
```bash
gh issue create \
  --title "[REQ-xxx] <task.title>" \
  --body "<formatted body>" \
  --label "label1,label2,label3" \
  --repo <owner/repo>  # from export.yml github.repo or github.yml default_repo
```

Collect the returned issue number and URL for each task.

### Step 4A: Create Parent Tracking Issue (GitHub Mode)

After all task issues are created, create a parent tracking issue:

#### Title
Format: `[REQ-xxx] Tracking: <requirement title>`

#### Body
```markdown
## Requirement Overview
<brief summary from requirement>

## Task Checklist
- [ ] #<issue1> T-001: <task title> (<estimate>h)
- [ ] #<issue2> T-002: <task title> (<estimate>h)
...

## Critical Path
<critical_path from rollup> (e.g., T-001 → T-003 → T-007)

## Rollup Estimate
- Total Tasks: <count>
- Expected Hours: <expected_hours>h
- Standard Deviation: <stddev_hours>h
- Confidence: <confidence>

## Progress
- [ ] Requirements finalized
- [ ] Implementation started
- [ ] Testing complete
- [ ] Deployment ready
```

#### Labels
Same as task issues but add `tracking` label.

### Step 5A: Collect Results (GitHub Mode)
Create a mapping table of task ID → issue number/URL.

## Export Mode: Local

### Step 2B: Prepare Local Output Directory

```bash
# Get output directory from export.yml local.out_dir (default: ./out)
OUT_DIR=$(grep -A1 "^local:" .claude/config/export.yml | grep "out_dir:" | awk '{print $2}')
OUT_DIR=${OUT_DIR:-.sdp/out}  # Fallback to .sdp/out if not specified

# Create output directory
mkdir -p "$OUT_DIR"
```

### Step 3B: Generate Issue Drafts (Local Mode)

Create a markdown file at `${OUT_DIR}/REQ-xxx-issues.md` with the following structure:

```markdown
# GitHub Issues Draft for REQ-xxx

This file contains issue drafts for requirement REQ-xxx.
You can manually create these issues in GitHub or use the `gh` CLI.

---

## Parent Tracking Issue

**Title**: [REQ-xxx] Tracking: <requirement title>

**Body**:
```markdown
## Requirement Overview
<brief summary from requirement>

## Task Checklist
- [ ] T-001: <task title> (<estimate>h)
- [ ] T-002: <task title> (<estimate>h)
...

## Critical Path
<critical_path from rollup>

## Rollup Estimate
- Total Tasks: <count>
- Expected Hours: <expected_hours>h
- Standard Deviation: <stddev_hours>h
- Confidence: <confidence>

## Progress
- [ ] Requirements finalized
- [ ] Implementation started
- [ ] Testing complete
- [ ] Deployment ready
```

**Labels**: `REQ-xxx`, `tracking`, <labels from github.yml>

---

## Task Issues

### Issue 1: [REQ-xxx] T-001: <task title>

**Title**: [REQ-xxx] <task.title>

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
- <depends_on>

## Estimate
- Method: PERT
- Optimistic: <optimistic>h
- Most Likely: <most_likely>h
- Pessimistic: <pessimistic>h
- Expected: <mean>h

## Risk Notes
<task.risks if present>
```

**Labels**: `REQ-xxx`, <task.labels>, <labels from github.yml>

---

(Repeat for each task)

---

## Instructions for Manual Issue Creation

If you want to create these issues manually:

1. **Create Parent Tracking Issue**:
   ```bash
   gh issue create --title "[REQ-xxx] Tracking: <title>" --body "$(cat tracking-body.md)" --label "REQ-xxx,tracking,..."
   ```

2. **Create Each Task Issue**:
   ```bash
   gh issue create --title "[REQ-xxx] T-001: <title>" --body "$(cat task-001-body.md)" --label "REQ-xxx,backend,..."
   ```

3. **Update Tracking Issue** with actual issue numbers after all issues are created.

## Batch Import (if using gh CLI later)

```bash
# This script can be generated to automate issue creation
# Save each issue body to separate files and use gh CLI in batch
```
```

### Step 4B: Generate Import Script (Local Mode, Optional)

Create a shell script at `${OUT_DIR}/REQ-xxx-import.sh` to automate issue creation:

```bash
#!/bin/bash
# Auto-generated script to import issues for REQ-xxx

REPO="<from export.yml or github.yml>"

# Create task issues
echo "Creating task issues..."
ISSUE_T001=$(gh issue create --repo "$REPO" --title "[REQ-xxx] T-001: <title>" --body "..." --label "..." | grep -oP '#\d+' | tr -d '#')
ISSUE_T002=$(gh issue create --repo "$REPO" --title "[REQ-xxx] T-002: <title>" --body "..." --label "..." | grep -oP '#\d+' | tr -d '#')
...

# Create tracking issue
echo "Creating tracking issue..."
gh issue create --repo "$REPO" --title "[REQ-xxx] Tracking: <title>" --body "..." --label "tracking,REQ-xxx,..."

echo "✅ All issues created successfully"
echo "Task Mapping:"
echo "  T-001 → #$ISSUE_T001"
echo "  T-002 → #$ISSUE_T002"
...
```

Make the script executable:
```bash
chmod +x ${OUT_DIR}/REQ-xxx-import.sh
```

## Output Format

Generate console output in **Japanese** based on export mode:

### For GitHub Mode (to: github)

```
【GitHub Issues エクスポート完了】
📋 要件: REQ-xxx
🎯 モード: GitHub Issues
🎫 作成されたIssue数: <count + 1>
📦 リポジトリ: <owner/repo>

タスクIssueマッピング:
| Task ID | Issue # | URL                                    |
|---------|---------|----------------------------------------|
| T-001   | #123    | https://github.com/owner/repo/issues/123 |
| T-002   | #124    | https://github.com/owner/repo/issues/124 |
...

📌 トラッキングIssue: #<parent_issue>
   https://github.com/owner/repo/issues/<parent_issue>

✅ 全てのタスクがGitHub Issuesとして登録されました
💡 次のステップ: トラッキングIssueから各タスクの進捗を管理してください
```

### For Local Mode (to: local)

```
【GitHub Issues エクスポート（ローカル出力）】
📋 要件: REQ-xxx
🎯 モード: ローカルファイル
📁 出力ディレクトリ: <out_dir>

生成ファイル:
✅ <out_dir>/REQ-xxx-issues.md   - Issue ドラフト (マニュアル用)
✅ <out_dir>/REQ-xxx-import.sh   - 自動インポートスクリプト (gh CLI用)

📊 タスク数: <count>
⏱️  総見積時間: <expected_hours>h

💡 次のステップ:
   1. Issueドラフトをレビュー: cat <out_dir>/REQ-xxx-issues.md
   2. GitHub CLI を使ってインポート: bash <out_dir>/REQ-xxx-import.sh
   3. または手動でGitHubにIssueを作成してください
```

### Error Cases

#### GitHub Mode: gh CLI not available
```
【エラー: GitHub CLI 未検出】
📋 要件: REQ-xxx
🎯 設定モード: GitHub Issues
❌ GitHub CLI (gh) がインストールされていません

💡 対処方法:
   1. GitHub CLI をインストール: https://cli.github.com/
   2. または export.yml の "to" を "local" に変更してローカル出力を使用
   3. コマンド実行: /sdp:export-issues REQ-xxx
```

#### GitHub Mode: Not authenticated
```
【エラー: GitHub 認証未完了】
📋 要件: REQ-xxx
🎯 設定モード: GitHub Issues
⚠️  GitHub CLI は利用可能ですが、認証されていません

💡 対処方法:
   1. GitHub認証を実行: gh auth login
   2. または export.yml の "to" を "local" に変更してローカル出力を使用
   3. コマンド実行: /sdp:export-issues REQ-xxx
```

#### Task file not found
```
【エラー: タスクファイル未検出】
📋 要件: REQ-xxx
❌ .sdp/tasks/REQ-xxx.yml が見つかりません

💡 対処方法:
   1. 要件が存在するか確認: ls .sdp/requirements/
   2. タスク分解を実行: /sdp:estimate REQ-xxx
   3. その後再実行: /sdp:export-issues REQ-xxx
```

## Configuration Priority

When determining the target repository:

1. **First priority**: `export.yml` → `github.repo`
2. **Fallback**: `github.yml` → `default_repo`
3. **Final fallback**: Let `gh` auto-detect from current git repository

Example decision tree:
```
IF export.yml has github.repo:
  USE export.yml github.repo
ELSE IF github.yml has default_repo:
  USE github.yml default_repo
ELSE:
  OMIT --repo flag (gh auto-detects)
```

## Allowed Tools
Bash, Read, Write, Edit, Glob, Grep only