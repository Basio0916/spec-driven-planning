# /export-issues <slug>
You are Claude Code. Convert task breakdown into GitHub Issues or local markdown files.

## Inputs
- **slug**: An existing requirement folder at `.sdp/specs/<slug>/` containing `tasks.yml`
- **Export Config**: `.sdp/config/export.yml` (output destination, repository, labels)

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
  repo: owner/repo   # Target GitHub repository
  labels:            # Default labels for all issues
    - sdp
    - enhancement

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

If `gh` CLI is not found or not authenticated, provide appropriate error messages to guide the user.

### Step 2A: Load GitHub Configuration

Read repository and labels from `.sdp/config/export.yml`:
- `github.repo`: Target repository (format: "owner/repo")
  - If not specified, gh CLI will auto-detect from current git repository
- `github.labels`: Default labels to apply to all issues

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
- `export.yml` `github.labels` (default labels from config)
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

For each task in `.sdp/specs/<slug>/tasks.yml`, create a sub-issue:

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
- `export.yml` `github.labels` (default labels from config)
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

Read the output directory from `.sdp/config/export.yml` under `local.out_dir` (default: `out`).
Create the output directory if it doesn't exist using Claude Code's file operations.

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

## Tasks
(This section will be populated after sub-issues are created)
- [ ] #<sub-issue1> T-001: <task title> (<estimate>h)
- [ ] #<sub-issue2> T-002: <task title> (<estimate>h)
...
```

**Labels**: `<slug>`, `requirement`, <labels from export.yml github.labels>

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

**Labels**: `<slug>`, `task`, <task.labels>, <labels from export.yml github.labels>

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

### Step 4B: Generate Import Scripts (Local Mode, Optional)

Create both Bash and PowerShell scripts to support all platforms:

#### Bash Script (for macOS/Linux/Git Bash)

Create a shell script at `${OUT_DIR}/<slug>-import.sh` to automate issue creation:

```bash
#!/bin/bash
# Auto-generated script to import issues for <slug>
# Structure: 1 main issue + N task sub-issues

set -e  # Exit on error

REPO="<from export.yml github.repo>"

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

#### PowerShell Script (for Windows)

Create a PowerShell script at `${OUT_DIR}/<slug>-import.ps1` with the same functionality:

```powershell
# Auto-generated script to import issues for <slug>
# Structure: 1 main issue + N task sub-issues

$ErrorActionPreference = "Stop"  # Exit on error

$REPO = "<from export.yml github.repo>"

Write-Host "🚀 Starting issue import for <slug>..." -ForegroundColor Green
Write-Host ""

# Step 1: Create main requirement issue
Write-Host "📋 Creating main requirement issue..." -ForegroundColor Cyan
$mainIssueOutput = gh issue create --repo $REPO `
  --title "[<slug>] <requirement title>" `
  --body "<main issue body>" `
  --label "<slug>,requirement,<labels>"
$MAIN_ISSUE = [regex]::Match($mainIssueOutput, '#(\d+)').Groups[1].Value
Write-Host "✅ Main issue created: #$MAIN_ISSUE" -ForegroundColor Green
Write-Host ""

# Step 2: Create task sub-issues
Write-Host "📝 Creating task sub-issues..." -ForegroundColor Cyan

$subIssueT001Output = gh issue create --repo $REPO `
  --title "[<slug>][T-001] <task title>" `
  --body "## Parent Issue`nRelates to #$MAIN_ISSUE`n`n<task body>" `
  --label "<slug>,task,<task labels>"
$SUB_ISSUE_T001 = [regex]::Match($subIssueT001Output, '#(\d+)').Groups[1].Value
Write-Host "  ✅ T-001 → #$SUB_ISSUE_T001" -ForegroundColor Green

$subIssueT002Output = gh issue create --repo $REPO `
  --title "[<slug>][T-002] <task title>" `
  --body "## Parent Issue`nRelates to #$MAIN_ISSUE`n`n<task body>" `
  --label "<slug>,task,<task labels>"
$SUB_ISSUE_T002 = [regex]::Match($subIssueT002Output, '#(\d+)').Groups[1].Value
Write-Host "  ✅ T-002 → #$SUB_ISSUE_T002" -ForegroundColor Green

# ... (repeat for each task)

Write-Host ""

# Step 3: Update main issue with task checklist
Write-Host "🔗 Updating main issue with task checklist..." -ForegroundColor Cyan
$currentBody = gh issue view $MAIN_ISSUE --repo $REPO --json body -q .body
$newBody = @"
$currentBody

## Tasks
- [ ] #$SUB_ISSUE_T001 T-001: <task title> (<estimate>h)
- [ ] #$SUB_ISSUE_T002 T-002: <task title> (<estimate>h)
...
"@

gh issue edit $MAIN_ISSUE --repo $REPO --body $newBody
Write-Host "✅ Main issue updated with task checklist" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "🎉 All issues created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "  Main Issue: #$MAIN_ISSUE"
Write-Host "  Sub-Issues:"
Write-Host "    T-001 → #$SUB_ISSUE_T001"
Write-Host "    T-002 → #$SUB_ISSUE_T002"
Write-Host "    ..."
Write-Host ""
Write-Host "🔗 Main issue URL: https://github.com/$REPO/issues/$MAIN_ISSUE" -ForegroundColor Cyan
```

## Output Format

Generate console output in **Japanese** based on export mode:

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
✅ <out_dir>/<slug>-issues.md     - Issue ドラフト (マニュアル用)
✅ <out_dir>/<slug>-import.sh     - 自動インポートスクリプト (Bash: macOS/Linux/Git Bash)
✅ <out_dir>/<slug>-import.ps1    - 自動インポートスクリプト (PowerShell: Windows)

📊 タスク数: <count>
⏱️  総見積時間: <expected_hours>h

💡 次のステップ:
   1. Issueドラフトをレビュー: cat <out_dir>/<slug>-issues.md
   2. GitHub CLI を使ってインポート:
      - macOS/Linux/Git Bash: bash <out_dir>/<slug>-import.sh
      - Windows PowerShell: ./<out_dir>/<slug>-import.ps1
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
- Generates both Bash (.sh) and PowerShell (.ps1) scripts for local mode
- Windows users can use PowerShell scripts or Git Bash
- macOS/Linux users can use Bash scripts

## Allowed Tools
Read, Write, Terminal (for gh CLI commands in GitHub mode), File Search, Grep only