# /export-issues <slug>
You are Claude Code. Convert task breakdown into GitHub Issues or local markdown files.

## Inputs
- **slug**: An existing requirement folder at `.sdp/<slug>/` containing `tasks.yml`
- **Export Config**: `.claude/config/export.yml` (output destination)
- **GitHub Config**: `.claude/config/github.yml` (GitHub-specific settings)

## Context Files
Read these for context:
- `.sdp/<slug>/tasks.yml` - Task breakdown to export
- `.sdp/<slug>/requirement.md` - Original requirement
- `.claude/config/export.yml` - Export destination configuration
- `.claude/config/github.yml` - GitHub integration config (if exporting to GitHub)

## Pre-Check

```bash
# Verify requirement folder and task file exist
[ -d ".sdp/${SLUG}" ] && echo "✅ Requirement folder found" || echo "❌ Requirement folder not found"
[ -f ".sdp/${SLUG}/tasks.yml" ] && echo "✅ Task file found" || echo "❌ Task file not found"

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

### Step 3A: Create Main Requirement Issue (GitHub Mode)

First, create a single main issue for the requirement:

#### Issue Title
Format: `[<slug>] <requirement title>`

#### Issue Body
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

#### Labels
- `github.yml` `labels` (default labels)
- `["<slug>"]` (requirement identifier)
- `["requirement"]` (issue type marker)

#### Execution
```bash
MAIN_ISSUE=$(gh issue create \
  --title "[<slug>] <requirement title>" \
  --body "<formatted body>" \
  --label "<slug>,requirement,<labels>" \
  --repo <owner/repo> | grep -oE '#[0-9]+' | tr -d '#')
```

Collect the main issue number for use in sub-issues.

### Step 4A: Create Task Sub-Issues (GitHub Mode)

For each task in `.sdp/<slug>/tasks.yml`, create a sub-issue:

#### Sub-Issue Title
Format: `[<slug>][T-xxx] <task.title>`

#### Sub-Issue Body
Include the following sections in markdown:
```markdown
## Parent Issue
Relates to #<main_issue>

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

#### Labels
Combine:
- `github.yml` `labels` (default labels)
- `["<slug>"]` (requirement identifier)
- `task.labels` (from task definition)
- `["task"]` (sub-issue marker)

#### Execution
```bash
gh issue create \
  --title "[<slug>][T-001] <task.title>" \
  --body "<formatted body with #${MAIN_ISSUE} reference>" \
  --label "<slug>,task,<labels>" \
  --repo <owner/repo>
```

Collect the returned sub-issue number and URL for each task.

### Step 5A: Update Main Issue with Task Checklist (GitHub Mode)

After all sub-issues are created, update the main issue body to include task checklist:

#### Updated Body Section
Add a "Tasks" section to the main issue:

```markdown
## Tasks
- [ ] #<sub-issue1> T-001: <task title> (<estimate>h)
- [ ] #<sub-issue2> T-002: <task title> (<estimate>h)
- [ ] #<sub-issue3> T-003: <task title> (<estimate>h)
...
```

#### Execution
```bash
# Get current body
CURRENT_BODY=$(gh issue view ${MAIN_ISSUE} --json body -q .body)

# Append task checklist
NEW_BODY="${CURRENT_BODY}

## Tasks
- [ ] #${SUB_ISSUE_1} T-001: <task title> (<estimate>h)
- [ ] #${SUB_ISSUE_2} T-002: <task title> (<estimate>h)
...
"

# Update main issue
gh issue edit ${MAIN_ISSUE} --body "$NEW_BODY" --repo <owner/repo>
```

### Step 6A: Collect Results (GitHub Mode)
Create a mapping table of task ID → sub-issue number/URL and main issue.

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

Create a markdown file at `${OUT_DIR}/<slug>-issues.md` with the following structure:

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

## Tasks
(This section will be populated after sub-issues are created)
- [ ] #<sub-issue1> T-001: <task title> (<estimate>h)
- [ ] #<sub-issue2> T-002: <task title> (<estimate>h)
...
```

**Labels**: `<slug>`, `requirement`, <labels from github.yml>

---

## Task Sub-Issues

### Sub-Issue 1: [<slug>][T-001] <task title>

**Title**: [<slug>][T-001] <task.title>

**Body**:
```markdown
## Parent Issue
Relates to #<main_issue> (create main issue first, then reference here)

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

**Labels**: `<slug>`, `task`, <task.labels>, <labels from github.yml>

---

(Repeat for each task)

---

## Instructions for Manual Issue Creation

### Step-by-Step Process

1. **Create Main Requirement Issue First**:
   ```bash
   MAIN_ISSUE=$(gh issue create \
     --title "[<slug>] <title>" \
     --body "$(cat main-issue-body.md)" \
     --label "<slug>,requirement,..." \
     --repo <owner/repo> | grep -oE '#[0-9]+' | tr -d '#')
   echo "Main issue created: #${MAIN_ISSUE}"
   ```

2. **Create Each Task Sub-Issue** (referencing main issue):
   ```bash
   SUB_ISSUE_1=$(gh issue create \
     --title "[<slug>][T-001] <task title>" \
     --body "Relates to #${MAIN_ISSUE}

   $(cat task-001-body.md)" \
     --label "<slug>,task,backend,..." \
     --repo <owner/repo> | grep -oE '#[0-9]+' | tr -d '#')
   echo "Sub-issue T-001 created: #${SUB_ISSUE_1}"
   ```

3. **Update Main Issue** with task checklist:
   ```bash
   gh issue edit ${MAIN_ISSUE} --body "$(gh issue view ${MAIN_ISSUE} --json body -q .body)

## Tasks
- [ ] #${SUB_ISSUE_1} T-001: <task title> (<estimate>h)
- [ ] #${SUB_ISSUE_2} T-002: <task title> (<estimate>h)
..." --repo <owner/repo>
   ```
```

### Step 4B: Generate Import Script (Local Mode, Optional)

Create a shell script at `${OUT_DIR}/<slug>-import.sh` to automate issue creation:

```bash
#!/bin/bash
# Auto-generated script to import issues for <slug>
# Structure: 1 main issue + N task sub-issues

set -e  # Exit on error

REPO="<from export.yml or github.yml>"

echo "🚀 Starting issue import for <slug>..."
echo ""

# Step 1: Create main requirement issue
echo "📋 Creating main requirement issue..."
MAIN_ISSUE=$(gh issue create --repo "$REPO" \
  --title "[<slug>] <requirement title>" \
  --body "<main issue body>" \
  --label "<slug>,requirement,<labels>" | grep -oE '#[0-9]+' | tr -d '#')
echo "✅ Main issue created: #${MAIN_ISSUE}"
echo ""

# Step 2: Create task sub-issues
echo "📝 Creating task sub-issues..."

SUB_ISSUE_T001=$(gh issue create --repo "$REPO" \
  --title "[<slug>][T-001] <task title>" \
  --body "## Parent Issue
Relates to #${MAIN_ISSUE}

<task body>" \
  --label "<slug>,task,<task labels>" | grep -oE '#[0-9]+' | tr -d '#')
echo "  ✅ T-001 → #${SUB_ISSUE_T001}"

SUB_ISSUE_T002=$(gh issue create --repo "$REPO" \
  --title "[<slug>][T-002] <task title>" \
  --body "## Parent Issue
Relates to #${MAIN_ISSUE}

<task body>" \
  --label "<slug>,task,<task labels>" | grep -oE '#[0-9]+' | tr -d '#')
echo "  ✅ T-002 → #${SUB_ISSUE_T002}"

# ... (repeat for each task)

echo ""

# Step 3: Update main issue with task checklist
echo "🔗 Updating main issue with task checklist..."
CURRENT_BODY=$(gh issue view ${MAIN_ISSUE} --repo "$REPO" --json body -q .body)
NEW_BODY="${CURRENT_BODY}

## Tasks
- [ ] #${SUB_ISSUE_T001} T-001: <task title> (<estimate>h)
- [ ] #${SUB_ISSUE_T002} T-002: <task title> (<estimate>h)
...
"

gh issue edit ${MAIN_ISSUE} --repo "$REPO" --body "$NEW_BODY"
echo "✅ Main issue updated with task checklist"
echo ""

# Summary
echo "🎉 All issues created successfully!"
echo ""
echo "📊 Summary:"
echo "  Main Issue: #${MAIN_ISSUE}"
echo "  Sub-Issues:"
echo "    T-001 → #${SUB_ISSUE_T001}"
echo "    T-002 → #${SUB_ISSUE_T002}"
echo "    ..."
echo ""
echo "🔗 Main issue URL: https://github.com/${REPO}/issues/${MAIN_ISSUE}"
```

Make the script executable:
```bash
chmod +x ${OUT_DIR}/<slug>-import.sh
```

## Output Format

Generate console output in **Japanese** based on export mode:

### For GitHub Mode (to: github)

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

### For Local Mode (to: local)

```
【GitHub Issues エクスポート（ローカル出力）】
📋 要件: <slug>
🎯 モード: ローカルファイル
📁 出力ディレクトリ: <out_dir>

生成ファイル:
✅ <out_dir>/<slug>-issues.md   - Issue ドラフト (マニュアル用)
✅ <out_dir>/<slug>-import.sh   - 自動インポートスクリプト (gh CLI用)

📊 タスク数: <count>
⏱️  総見積時間: <expected_hours>h

💡 次のステップ:
   1. Issueドラフトをレビュー: cat <out_dir>/<slug>-issues.md
   2. GitHub CLI を使ってインポート: bash <out_dir>/<slug>-import.sh
   3. または手動でGitHubにIssueを作成してください
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
   2. または export.yml の "to" を "local" に変更してローカル出力を使用
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
   2. または export.yml の "to" を "local" に変更してローカル出力を使用
   3. コマンド実行: /sdp:export-issues <slug>
```

#### Task file not found
```
【エラー: タスクファイル未検出】
📋 要件: <slug>
❌ .sdp/<slug>/tasks.yml が見つかりません

💡 対処方法:
   1. 要件が存在するか確認: ls -d .sdp/*/
   2. タスク分解を実行: /sdp:estimate <slug>
   3. その後再実行: /sdp:export-issues <slug>
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