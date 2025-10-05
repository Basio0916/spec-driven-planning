# /export-issues <slug>
You are Claude Code. Convert task breakdown into GitHub Issues ### Step 2A: Load GitHub Configuration

Read repository and mode from `.sdp/config/export.yml`:
- `github.repo`: Target repository (format: "owner/repo")
  - If not specified, gh CLI will auto-detect from current git repository
- `github.sub_issue_mode`: Use sub-issue feature (true/false, default: true)cal markdown files.

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
  issue_mode: sub_issues    # "sub_issues", "linked_issues", or "single_issue"
  labels:                   # Default labels for all issues
    - sdp
    - enhancement
  main_issue_labels:        # Optional: Additional labels for main requirement issues
    - epic                  # (if not set, no additional labels beyond "labels")
  task_labels:              # Optional: Additional labels for task sub-issues
    - implementation        # (if not set, no additional labels beyond "labels")

local:
  out_dir: .sdp/out         # Local output directory
```

### Determine Export Mode

Based on `destination` field:
- **`github`**: Export to GitHub Issues (requires `gh` CLI)
- **`local`**: Export to local markdown files (no GitHub required)

### Issue Mode (GitHub only)

The `github.issue_mode` setting determines how tasks are exported:
- **`sub_issues`**: Creates 1 main issue + N sub-issues (requires `gh sub-issue` extension)
- **`linked_issues`**: Creates 1 main issue + N regular issues (linked manually)
- **`single_issue`**: Creates 1 comprehensive issue with all tasks as checkboxes

## Export Mode: GitHub

### Pre-Check for GitHub Mode

Claude Code will check:
- If `gh` CLI is available in the system
- If GitHub authentication is valid (if `gh` is available)
- If `github.issue_mode` is `sub_issues`, check if `gh sub-issue` extension is installed

If `gh` CLI is not found or not authenticated, provide appropriate error messages to guide the user.

If `github.issue_mode` is `sub_issues` and `gh sub-issue` extension is not installed, provide installation instructions:
```bash
gh extension install yahsan2/gh-sub-issue
```

### Step 2A: Load GitHub Configuration

Read repository, issue mode, and labels from `.sdp/config/export.yml`:
- `github.repo`: Target repository (format: "owner/repo")
  - If not specified, gh CLI will auto-detect from current git repository
- `github.issue_mode`: Export mode ("sub_issues", "linked_issues", or "single_issue")
- `github.labels`: Default labels to apply to all issues
- `github.main_issue_labels`: Optional labels specifically for main requirement issues (if not set, omit)
- `github.task_labels`: Optional labels specifically for task sub-issues (if not set, omit; not used in single_issue mode)

### Step 3A: Create Main Issue (GitHub Mode)

The content and structure depend on `github.issue_mode`.

#### Issue Title
Format: `[<slug>] <requirement title>`

#### Issue Body Template

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

#### Execution

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

**If `issue_mode: single_issue`**: This is the only issue created. Skip to Step 5A.

**If `issue_mode: sub_issues` or `issue_mode: linked_issues`**: Collect the main issue number for use in creating task issues (proceed to Step 4A).

### Step 4A: Create Task Issues (GitHub Mode)

**Note**: This step is only executed if `issue_mode` is `sub_issues` or `linked_issues`. Skip this step if `issue_mode: single_issue`.

For each task in `.sdp/specs/<slug>/tasks.yml`, create an issue.

**If `issue_mode: sub_issues`**, use `gh sub-issue` extension to create sub-issues with automatic parent-child relationship.

#### Sub-Issue Title
Format: `[<slug>][T-xxx] <task.title>`

#### Sub-Issue Body Template

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

#### Execution

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

### Step 5A: Finalize and Collect Results (GitHub Mode)

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

## Export Mode: Local

### Step 2B: Prepare Local Output Directory

Read the output directory from `.sdp/config/export.yml` under `local.out_dir` (default: `out`).
Create the output directory if it doesn't exist using Claude Code's file operations.

Also read `github.issue_mode` to determine the output format (even for local mode):
- `single_issue`: Generate a single comprehensive issue draft
- `sub_issues` or `linked_issues`: Generate main issue + task issues drafts

### Step 3B: Generate Issue Drafts (Local Mode)

Create a markdown file at `${OUT_DIR}/<slug>-issues.md` with localized content based on `.sdp/config/language.yml`.

**If `issue_mode: single_issue`**:

Read the single issue draft template:
- **English**: `.sdp/templates/en/issue-draft-single.md`
- **Japanese**: `.sdp/templates/ja/issue-draft-single.md`

Replace placeholders:
- `{{slug}}`: Requirement slug
- `{{requirement_title}}`: Requirement title
- `{{issue_body}}`: Complete issue body (generated from `.sdp/templates/{lang}/issue-single.md`)

**If `issue_mode: sub_issues` or `issue_mode: linked_issues`**:

Read the multi-issue draft template:
- **English**: `.sdp/templates/en/issue-draft.md`
- **Japanese**: `.sdp/templates/ja/issue-draft.md`

Replace placeholders:
- `{{slug}}`: Requirement slug
- `{{requirement_title}}`: Requirement title
- `{{main_issue_body}}`: Main issue body (generated from `.sdp/templates/{lang}/issue-main.md`)
- `{{task_issues}}`: Task issues section (generated from `.sdp/templates/{lang}/issue-task.md` for each task)

For each task, generate a task issue section using the task template (`.sdp/templates/{lang}/issue-task.md`) with the following format:

```
### Sub-Issue N: [T-XXX] <task title>

**Title**: [T-XXX] <task.title>

**Body**:
```markdown
<content from issue-task.md template with placeholders replaced>
```

---
```

## Instructions for Manual Issue Creation

### Prerequisites

**If using sub-issue mode (`issue_mode: sub_issues`)**, install the `gh sub-issue` extension:
```bash
gh extension install yahsan2/gh-sub-issue
```

### Step-by-Step Process

#### Option A: Single Issue Mode (issue_mode: single_issue)

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

#### Option B: Sub-Issue Mode (issue_mode: sub_issues)

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

#### Option C: Linked Issues Mode (issue_mode: linked_issues)

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
```

## Output Format

Generate console output in the configured language (`.sdp/config/language.yml`) based on export mode:

### For GitHub Mode (destination: github)

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

#### GitHub Mode: gh sub-issue extension not installed (only when issue_mode is sub_issues)
```
【エラー: gh sub-issue 拡張未インストール】
📋 要件: <slug>
🎯 設定モード: GitHub Issues (Sub-Issue)
❌ gh sub-issue 拡張がインストールされていません

💡 対処方法:
   1. gh sub-issue 拡張をインストール: gh extension install yahsan2/gh-sub-issue
   2. または export.yml の "issue_mode" を "linked_issues" または "single_issue" に変更
   3. または export.yml の "destination" を "local" に変更してローカル出力を使用
   4. コマンド実行: /sdp:export-issues <slug>
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