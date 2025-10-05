# GitHub Issues Export Implementation Guide

This document provides detailed implementation instructions for exporting tasks to GitHub Issues.

## Pre-Check for GitHub Mode

Claude Code will check:
- If `gh` CLI is available in the system
- If GitHub authentication is valid (if `gh` is available)
- If `github.issue_mode` is `sub_issues`, check if `gh sub-issue` extension is installed

If `gh` CLI is not found or not authenticated, provide appropriate error messages to guide the user.

If `github.issue_mode` is `sub_issues` and `gh sub-issue` extension is not installed, provide installation instructions:
```bash
gh extension install yahsan2/gh-sub-issue
```

## Step 1: Load GitHub Configuration

Read repository, issue mode, and labels from `.sdp/config/export.yml`:
- `github.repo`: Target repository (format: "owner/repo")
  - If not specified, gh CLI will auto-detect from current git repository
- `github.issue_mode`: Export mode ("sub_issues", "linked_issues", or "single_issue")
- `github.labels`: Default labels to apply to all issues
- `github.main_issue_labels`: Optional labels specifically for main requirement issues (if not set, omit)
- `github.task_labels`: Optional labels specifically for task sub-issues (if not set, omit; not used in single_issue mode)

## Step 2: Create Main Issue

The content and structure depend on `github.issue_mode`.

### Issue Title
Format: `[<slug>] <requirement title>`

### Issue Body Template

**For `issue_mode: single_issue`**:

Read the comprehensive single-issue template:
- **English**: `.sdp/templates/en/issue-single.md`
- **Japanese**: `.sdp/templates/ja/issue-single.md`

Replace placeholders:
- `{{requirement_summary}}`: Brief summary from `.sdp/specs/<slug>/requirement.md` Goal section
- `{{task_count}}`: Total number of tasks
- `{{expected_hours}}`: Expected hours from rollup
- `{{stddev_hours}}`: Standard deviation from rollup
- `{{confidence}}`: Confidence level from rollup
- `{{critical_path}}`: Critical path from rollup (e.g., T-001 → T-003 → T-007)
- `{{task_list}}`: Checklist of all tasks with format:
  ```
  - [ ] **T-001**: <task.title> (Expected: <mean>h, Dependencies: <depends_on>)
  - [ ] **T-002**: <task.title> (Expected: <mean>h, Dependencies: <depends_on>)
  ...
  ```
- `{{task_details}}`: Detailed breakdown of each task with format:
  ```
  ### T-001: <task.title>
  
  **Estimate**: <optimistic>h / <most_likely>h / <pessimistic>h (Expected: <mean>h)  
  **Dependencies**: <depends_on>  
  **Deliverables**: <comma-separated deliverables>  
  **DoD**: <comma-separated DoD items>  
  **Risks**: <task.risks if present>
  
  ---
  ```

**For `issue_mode: sub_issues` or `issue_mode: linked_issues`**:

Read the main issue template (without task details):
- **English**: `.sdp/templates/en/issue-main.md`
- **Japanese**: `.sdp/templates/ja/issue-main.md`

Replace placeholders:
- `{{requirement_summary}}`: Brief summary from `.sdp/specs/<slug>/requirement.md` Goal section
- `{{task_count}}`: Total number of tasks
- `{{expected_hours}}`: Expected hours from rollup
- `{{stddev_hours}}`: Standard deviation from rollup
- `{{confidence}}`: Confidence level from rollup
- `{{critical_path}}`: Critical path from rollup (e.g., T-001 → T-003 → T-007)

### Execution

**Important**: Use `grep` and `tr` to extract issue number from output. Do NOT use `--json` flag as it may not be supported in older versions of GitHub CLI.

```bash
# Combine labels from export.yml (labels + main_issue_labels if set)
# Extract issue number from output using grep and tr (compatible with all gh versions)
MAIN_ISSUE=$(gh issue create \
  --title "[<slug>] <requirement title>" \
  --body "<formatted body>" \
  --label "<combined_labels_from_config>" \
  --repo <owner/repo> | grep -oE '#[0-9]+' | tr -d '#')
```

**If `issue_mode: single_issue`**: This is the only issue created. Skip to Step 4.

**If `issue_mode: sub_issues` or `issue_mode: linked_issues`**: Collect the main issue number for use in creating task issues (proceed to Step 3).

## Step 3: Create Task Issues

**Note**: This step is only executed if `issue_mode` is `sub_issues` or `linked_issues`. Skip this step if `issue_mode: single_issue`.

For each task in `.sdp/specs/<slug>/tasks.yml`, create an issue.

**If `issue_mode: sub_issues`**, use `gh sub-issue` extension to create sub-issues with automatic parent-child relationship.

### Sub-Issue Title
Format: `[<slug>][T-xxx] <task.title>`

### Sub-Issue Body Template

Read the appropriate template based on language configuration:
- **English**: `.sdp/templates/en/issue-task.md`
- **Japanese**: `.sdp/templates/ja/issue-task.md`

Replace placeholders:
- `{{description}}`: Task description
- `{{deliverables}}`: List of deliverables (bulleted list)
- `{{dod}}`: Definition of Done checklist items
- `{{dependencies}}`: List of dependencies with issue references
- `{{optimistic}}`: Optimistic estimate
- `{{most_likely}}`: Most likely estimate
- `{{pessimistic}}`: Pessimistic estimate
- `{{expected}}`: Expected (mean) estimate
- `{{risks}}`: Risk notes (if present)

### Execution

**If `issue_mode: sub_issues`**:
Use `gh sub-issue create` to create sub-issues that are automatically linked to the parent:

**Note**: The `gh sub-issue create` command returns the full issue URL, not just the number.

```bash
# Combine labels from export.yml (labels + task_labels if set)
# If labels are set, add --label flag; otherwise omit it
# gh sub-issue returns URL (e.g., https://github.com/owner/repo/issues/123)
if [ -n "$TASK_LABELS" ]; then
  SUB_ISSUE_URL=$(gh sub-issue create --parent ${MAIN_ISSUE} \
    --repo <owner/repo> \
    --title "[T-001] <task.title>" \
    --body "<formatted body>" \
    --label "$TASK_LABELS")
  SUB_ISSUE=$(echo "$SUB_ISSUE_URL" | grep -oE '[0-9]+$')
else
  SUB_ISSUE_URL=$(gh sub-issue create --parent ${MAIN_ISSUE} \
    --repo <owner/repo> \
    --title "[T-001] <task.title>" \
    --body "<formatted body>")
  SUB_ISSUE=$(echo "$SUB_ISSUE_URL" | grep -oE '[0-9]+$')
fi
```

**If `issue_mode: linked_issues`**:
Use regular `gh issue create` and manually reference the parent issue in the body:

**Important**: Extract issue number using `grep` and `tr` (do NOT use `--json` flag).

```bash
# Body includes reference to parent issue
BODY="**Parent Issue**: #${MAIN_ISSUE}

<formatted body>"

# Extract issue number from output using grep and tr (compatible with all gh versions)
if [ -n "$TASK_LABELS" ]; then
  SUB_ISSUE=$(gh issue create \
    --repo <owner/repo> \
    --title "[T-001] <task.title>" \
    --body "$BODY" \
    --label "$TASK_LABELS" | grep -oE '#[0-9]+' | tr -d '#')
else
  SUB_ISSUE=$(gh issue create \
    --repo <owner/repo> \
    --title "[T-001] <task.title>" \
    --body "$BODY" | grep -oE '#[0-9]+' | tr -d '#')
fi
```

Collect the returned issue number and URL for each task.

## Step 4: Finalize and Collect Results

**If `issue_mode: single_issue`**:
- All tasks are already included in the single issue as checkboxes
- No additional updates needed
- Create a summary for console output showing the single issue URL

**If `issue_mode: sub_issues`**:
- The `gh sub-issue` extension automatically creates a proper parent-child relationship
- The task checklist is automatically maintained in the parent issue by GitHub's sub-issue feature
- No manual update needed

**If `issue_mode: linked_issues`**:
- Update the main issue body to include a task checklist with links to child issues:

```bash
# Get current body
CURRENT_BODY=$(gh issue view ${MAIN_ISSUE} --json body -q .body --repo <owner/repo>)

# Append task checklist
TASK_LIST="

## Tasks
- [ ] #${SUB_ISSUE_1} T-001: <task title> (<estimate>h)
- [ ] #${SUB_ISSUE_2} T-002: <task title> (<estimate>h)
...
"

# Update main issue
gh issue edit ${MAIN_ISSUE} --body "${CURRENT_BODY}${TASK_LIST}" --repo <owner/repo>
```

Create a mapping table of task ID → issue number/URL and main issue for the console output.

## Output Format

Generate console output in the configured language (`.sdp/config/language.yml`):

**If `issue_mode: single_issue`**:
```
【GitHub Issues エクスポート完了】
📋 要件: <slug>
🎯 モード: GitHub Issues (単一Issue)
📦 リポジトリ: <owner/repo>

作成されたIssue:
📌 Issue: #<issue>
   https://github.com/owner/repo/issues/<issue>

📊 含まれるタスク: <count>個
⏱️  総見積時間: <expected_hours>h

✅ 全タスクを含む1つのIssueを作成しました
💡 次のステップ: Issue #<issue> のチェックボックスで進捗を管理してください
```

**If `issue_mode: sub_issues` or `issue_mode: linked_issues`**:
```
【GitHub Issues エクスポート完了】
📋 要件: <slug>
🎯 モード: GitHub Issues (<sub_issues/linked_issues>)
📦 リポジトリ: <owner/repo>

作成されたIssue:
📌 メインIssue: #<main_issue>
   https://github.com/owner/repo/issues/<main_issue>

🎫 タスクIssue: <count>個

タスクIssueマッピング:
| Task ID | Issue # | URL                                    |
|---------|---------|----------------------------------------|
| T-001   | #124    | https://github.com/owner/repo/issues/124 |
| T-002   | #125    | https://github.com/owner/repo/issues/125 |
| T-003   | #126    | https://github.com/owner/repo/issues/126 |
...

✅ 1つのメインIssueと<count>個のタスクIssueを作成しました
💡 次のステップ: メインIssue #<main_issue> から各タスクの進捗を管理してください
```

## Error Cases

### gh CLI not available
```
【エラー: GitHub CLI 未検出】
📋 要件: <slug>
🎯 設定モード: GitHub Issues
❌ GitHub CLI (gh) がインストールされていません

💡 対処方法:
   GitHub CLI をインストールしてください:
   
   macOS (Homebrew):
     brew install gh
   
   Windows (WinGet):
     winget install --id GitHub.cli
   
   Linux (apt):
     sudo apt install gh
   
   その他のインストール方法: https://cli.github.com/
   
   インストール完了後、再度実行してください: /sdp:export-issues <slug>
```

### gh sub-issue extension not installed (only when issue_mode is sub_issues)
```
【エラー: gh sub-issue 拡張未インストール】
📋 要件: <slug>
🎯 設定モード: GitHub Issues (Sub-Issue)
❌ gh sub-issue 拡張がインストールされていません

💡 対処方法:
   以下のいずれかを実行してください:
   
   Option A: gh sub-issue 拡張をインストール
     gh extension install yahsan2/gh-sub-issue
   
   Option B: issue_mode を変更
     .sdp/config/export.yml で以下のように変更:
     github:
       issue_mode: linked_issues  # または single_issue
   
   対処完了後、再度実行してください: /sdp:export-issues <slug>
```

### Not authenticated
```
【エラー: GitHub 認証未完了】
📋 要件: <slug>
🎯 設定モード: GitHub Issues
⚠️  GitHub CLI は利用可能ですが、認証されていません

💡 対処方法:
   GitHub認証を実行してください:
   
   gh auth login
   
   認証完了後、再度実行してください: /sdp:export-issues <slug>
```

## Manual Issue Creation Instructions

### Prerequisites

**If using sub-issue mode (`issue_mode: sub_issues`)**, install the `gh sub-issue` extension:
```bash
gh extension install yahsan2/gh-sub-issue
```

### Option A: Single Issue Mode (issue_mode: single_issue)

1. **Create One Comprehensive Issue**:
   ```bash
   ISSUE=$(gh issue create \
     --title "[<slug>] <title>" \
     --body "$(cat single-issue-body.md)" \
     --label "<combined_labels>" \
     --repo <owner/repo> | grep -oE '#[0-9]+' | tr -d '#')
   echo "Issue created: #${ISSUE}"
   ```

2. **Note**: All tasks are included as checkboxes in the issue body. Check them off as you complete each task.

### Option B: Sub-Issue Mode (issue_mode: sub_issues)

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
   SUB_ISSUE_1=$(gh sub-issue create --parent ${MAIN_ISSUE} \
     --repo <owner/repo> \
     --title "[T-001] <task title>" \
     --body "$(cat task-001-body.md)")
   echo "Sub-issue T-001 created: ${SUB_ISSUE_1}"
   
   SUB_ISSUE_2=$(gh sub-issue create --parent ${MAIN_ISSUE} \
     --repo <owner/repo> \
     --title "[T-002] <task title>" \
     --body "$(cat task-002-body.md)")
   echo "Sub-issue T-002 created: ${SUB_ISSUE_2}"
   ```

3. **Note**: Task checklist is automatically maintained by GitHub's sub-issue feature. No manual update needed.

### Option C: Linked Issues Mode (issue_mode: linked_issues)

1. **Create Main Requirement Issue First** (same as above)

2. **Create Each Task as Regular Issue** (with parent reference in body):
   ```bash
   SUB_ISSUE_1=$(gh issue create \
     --repo <owner/repo> \
     --title "[T-001] <task title>" \
     --body "**Parent Issue**: #${MAIN_ISSUE}

   $(cat task-001-body.md)" | grep -oE '#[0-9]+' | tr -d '#')
   echo "Task issue T-001 created: #${SUB_ISSUE_1}"
   
   SUB_ISSUE_2=$(gh issue create \
     --repo <owner/repo> \
     --title "[T-002] <task title>" \
     --body "**Parent Issue**: #${MAIN_ISSUE}

   $(cat task-002-body.md)" | grep -oE '#[0-9]+' | tr -d '#')
   echo "Task issue T-002 created: #${SUB_ISSUE_2}"
   ```

3. **Update Main Issue** with task checklist:
   ```bash
   CURRENT_BODY=$(gh issue view ${MAIN_ISSUE} --json body -q .body --repo <owner/repo>)
   gh issue edit ${MAIN_ISSUE} --body "${CURRENT_BODY}

## Tasks
- [ ] #${SUB_ISSUE_1} T-001: <task title> (<estimate>h)
- [ ] #${SUB_ISSUE_2} T-002: <task title> (<estimate>h)" --repo <owner/repo>
   ```
