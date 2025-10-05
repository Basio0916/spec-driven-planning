# Backlog Export Implementation Guide

Complete implementation guide for exporting task breakdowns to Backlog Issues using REST API v2.

## Overview

This guide covers:
- Pre-check requirements for Backlog mode
- Configuration loading
- Main issue creation via REST API
- Task issue creation (sub-tasks or linked issues)
- Error handling and output format

## Pre-Check for Backlog Mode

Claude Code will check:
- If required Backlog configuration is present in `.sdp/config/export.yml`:
  - `backlog.space_key`: Backlog space key (e.g., "MYSPACE")
  - `backlog.project_key`: Project key (e.g., "PROJ")
  - `backlog.api_key`: API key for authentication
- If API key is available:
  - Check if `backlog.api_key` is set in config, OR
  - Check if `BACKLOG_API_KEY` environment variable is set

If required configuration is missing, display an error with setup instructions.

**Note**: This implementation uses Backlog REST API v2 with API key authentication.

**API Documentation**: https://developer.nulab.com/docs/backlog/

## Step 1: Load Backlog Configuration

Read Backlog settings from `.sdp/config/export.yml`:

```yaml
backlog:
  space_key: myspace                    # Backlog space key (subdomain)
  project_key: PROJ                     # Project key
  api_key: your-api-key                 # API key (or use environment variable)
  issue_mode: sub_tasks                 # "sub_tasks", "linked_issues", or "single_issue"
  main_issue_type: Task                 # Issue type for main issue (Task, Bug, etc.)
  task_issue_type: Task                 # Issue type for task issues
```

Get API key:
```bash
# Priority 1: From config file
API_KEY="${BACKLOG_API_KEY_FROM_CONFIG}"

# Priority 2: From environment variable
if [ -z "$API_KEY" ]; then
  API_KEY="${BACKLOG_API_KEY}"
fi
```

Construct base URL:
```bash
BACKLOG_URL="https://${SPACE_KEY}.backlog.com"
# or for jp domain:
BACKLOG_URL="https://${SPACE_KEY}.backlog.jp"
```

## Step 2: Get Project ID and Issue Type IDs

Before creating issues, retrieve the project ID and issue type IDs:

### Get Project ID

```bash
# Get project information
PROJECT_RESPONSE=$(curl -s -X GET \
  "${BACKLOG_URL}/api/v2/projects/${PROJECT_KEY}?apiKey=${API_KEY}")

# Extract project ID
PROJECT_ID=$(echo "${PROJECT_RESPONSE}" | jq -r '.id')
```

### Get Issue Type IDs

```bash
# Get issue types for the project
ISSUE_TYPES_RESPONSE=$(curl -s -X GET \
  "${BACKLOG_URL}/api/v2/projects/${PROJECT_ID}/issueTypes?apiKey=${API_KEY}")

# Extract main issue type ID
MAIN_ISSUE_TYPE_ID=$(echo "${ISSUE_TYPES_RESPONSE}" | jq -r ".[] | select(.name==\"${MAIN_ISSUE_TYPE}\") | .id")

# Extract task issue type ID
TASK_ISSUE_TYPE_ID=$(echo "${ISSUE_TYPES_RESPONSE}" | jq -r ".[] | select(.name==\"${TASK_ISSUE_TYPE}\") | .id")
```

## Step 3: Create Main Issue (Backlog Mode)

The content and structure depend on `backlog.issue_mode`.

### Issue Summary (Title)
Format: `[<slug>] <requirement title>`

### Issue Description Template

**For all modes**, use the same template structure as GitHub/Jira but with Backlog Markdown syntax.

Backlog supports Markdown with some extensions:
- Headings: `# H1`, `## H2`, etc.
- Bold: `**bold**` or `__bold__`
- Lists: `- item` or `* item`
- Checkboxes: `- [ ] unchecked` or `- [x] checked`
- Links: `[text](url)`
- Code blocks: ` ```language ... ``` `

**Template Structure**:

```markdown
## 要件概要

{{requirement_summary}}

---

## タスク分解

{{task_list}}

---

## 見積もり

- **タスク数**: {{task_count}}
- **期待工数**: {{expected_hours}}h
- **標準偏差**: ±{{stddev_hours}}h
- **信頼度**: {{confidence}}

---

## クリティカルパス

{{critical_path}}
```

### Execution

Use Backlog REST API v2 to create the issue:

```bash
# Prepare issue data
ISSUE_DATA=$(cat <<EOF
{
  "projectId": ${PROJECT_ID},
  "summary": "[${SLUG}] ${REQUIREMENT_TITLE}",
  "description": "${DESCRIPTION}",
  "issueTypeId": ${MAIN_ISSUE_TYPE_ID},
  "priorityId": 3
}
EOF
)

# Create main issue
RESPONSE=$(curl -s -X POST \
  "${BACKLOG_URL}/api/v2/issues?apiKey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${ISSUE_DATA}")

# Extract issue ID and issue key
MAIN_ISSUE_ID=$(echo "${RESPONSE}" | jq -r '.id')
MAIN_ISSUE_KEY=$(echo "${RESPONSE}" | jq -r '.issueKey')
```

**If `issue_mode: single_issue`**: This is the only issue created. Skip to Step 5.

**If `issue_mode: sub_tasks` or `issue_mode: linked_issues`**: Collect the main issue ID for use in creating task issues (proceed to Step 4).

## Step 4: Create Task Issues (Backlog Mode)

**Note**: This step is only executed if `issue_mode` is `sub_tasks` or `linked_issues`. Skip this step if `issue_mode: single_issue`.

For each task in `.sdp/specs/<slug>/tasks.yml`, create an issue.

### Task Issue Summary (Title)
Format: `[T-xxx] <task.title>`

### Task Issue Description

```markdown
## タスク詳細

- **タスクID**: {{task.id}}
- **見積もり**: {{task.estimate.optimistic}}h / {{task.estimate.most_likely}}h / {{task.estimate.pessimistic}}h (期待値: {{task.estimate.mean}}h)

---

## 説明

{{task.description}}

---

## 成果物

{{#task.deliverables}}
- {{deliverable}}
{{/task.deliverables}}

---

## 完了条件 (DoD)

{{#task.dod}}
- [ ] {{item}}
{{/task.dod}}

---

## 依存関係

{{#task.dependencies}}
- {{dependency}}
{{/task.dependencies}}
```

### Execution

**If `issue_mode: sub_tasks`**:

Backlog supports parent-child relationships natively:

```bash
# Prepare task data with parent issue
TASK_DATA=$(cat <<EOF
{
  "projectId": ${PROJECT_ID},
  "summary": "[${TASK_ID}] ${TASK_TITLE}",
  "description": "${TASK_DESCRIPTION}",
  "issueTypeId": ${TASK_ISSUE_TYPE_ID},
  "priorityId": 3,
  "parentIssueId": ${MAIN_ISSUE_ID}
}
EOF
)

# Create sub-task
RESPONSE=$(curl -s -X POST \
  "${BACKLOG_URL}/api/v2/issues?apiKey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${TASK_DATA}")

# Extract task issue ID and key
TASK_ISSUE_ID=$(echo "${RESPONSE}" | jq -r '.id')
TASK_ISSUE_KEY=$(echo "${RESPONSE}" | jq -r '.issueKey')
```

**If `issue_mode: linked_issues`**:

Create regular issues without parent, then add a comment to link them:

```bash
# Create regular task issue (without parentIssueId)
TASK_DATA=$(cat <<EOF
{
  "projectId": ${PROJECT_ID},
  "summary": "[${TASK_ID}] ${TASK_TITLE}",
  "description": "${TASK_DESCRIPTION}",
  "issueTypeId": ${TASK_ISSUE_TYPE_ID},
  "priorityId": 3
}
EOF
)

RESPONSE=$(curl -s -X POST \
  "${BACKLOG_URL}/api/v2/issues?apiKey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${TASK_DATA}")

TASK_ISSUE_ID=$(echo "${RESPONSE}" | jq -r '.id')
TASK_ISSUE_KEY=$(echo "${RESPONSE}" | jq -r '.issueKey')

# Add a comment to the main issue linking to this task
COMMENT_DATA=$(cat <<EOF
{
  "content": "関連タスク: ${TASK_ISSUE_KEY} - ${TASK_TITLE}"
}
EOF
)

curl -s -X POST \
  "${BACKLOG_URL}/api/v2/issues/${MAIN_ISSUE_ID}/comments?apiKey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${COMMENT_DATA}"
```

Collect the returned issue key and URL for each task.

## Step 5: Finalize and Collect Results (Backlog Mode)

**If `issue_mode: single_issue`**:
- All tasks are already included in the single issue as checkboxes
- No additional updates needed
- Create a summary for console output showing the single issue URL

**If `issue_mode: sub_tasks`**:
- Backlog automatically maintains the parent-child relationship
- Sub-tasks are visible in the parent issue
- No manual update needed

**If `issue_mode: linked_issues`**:
- Issues are linked via comments
- You can optionally update the main issue description with a task list

Create a mapping table of task ID → issue key/URL and main issue for the console output.

## Output Format

The console output after successful export will display:

### Success Output (Japanese)

**Single Issue Mode**:
```
✓ Backlog Issueへのエクスポートが完了しました

作成されたIssue:
- Main Issue: PROJ-123 [US-001] User Registration Feature
  https://myspace.backlog.jp/view/PROJ-123

すべてのタスク (3件) は単一のIssue内にチェックボックスとして含まれています。
```

**Sub-Tasks Mode**:
```
✓ Backlog Issueへのエクスポートが完了しました

作成されたIssue:
- Main Issue: PROJ-123 [US-001] User Registration Feature
  https://myspace.backlog.jp/view/PROJ-123

タスクIssue (3件):
- PROJ-124 [T-001] Set up database schema (3h)
  https://myspace.backlog.jp/view/PROJ-124
- PROJ-125 [T-002] Implement authentication API (5h)
  https://myspace.backlog.jp/view/PROJ-125
- PROJ-126 [T-003] Create user registration UI (4h)
  https://myspace.backlog.jp/view/PROJ-126

タスクはMain Issueのsub-taskとして作成されています。
```

**Linked Issues Mode**:
```
✓ Backlog Issueへのエクスポートが完了しました

作成されたIssue:
- Main Issue: PROJ-123 [US-001] User Registration Feature
  https://myspace.backlog.jp/view/PROJ-123

タスクIssue (3件):
- PROJ-124 [T-001] Set up database schema (3h)
  https://myspace.backlog.jp/view/PROJ-124
- PROJ-125 [T-002] Implement authentication API (5h)
  https://myspace.backlog.jp/view/PROJ-125
- PROJ-126 [T-003] Create user registration UI (4h)
  https://myspace.backlog.jp/view/PROJ-126

タスクはコメントでMain Issueにリンクされています。
```

## Error Cases

### Backlog Configuration Incomplete

```
❌ エラー: Backlog設定が不完全です

以下の設定を `.sdp/config/export.yml` と環境変数で設定してください:

不足している設定:
- backlog.space_key (e.g., "myspace")
- backlog.project_key (e.g., "PROJ")
- BACKLOG_API_KEY (環境変数)

Backlog APIキーの取得方法:
  1. Backlogにログイン
  2. 個人設定 > APIを開く
  3. 「登録」をクリックしてAPIキーを生成
  https://support-ja.backlog.com/hc/ja/articles/115015420567-API%E3%81%AE%E8%A8%AD%E5%AE%9A

環境変数の設定:
  export BACKLOG_API_KEY=<your-api-key>

設定後、再度エクスポートを実行してください。
```

### Backlog API Key Not Set

```
❌ エラー: Backlog APIキーが設定されていません

環境変数 BACKLOG_API_KEY を設定してください。

Backlog APIキーの取得方法:
  1. Backlogにログイン
  2. 個人設定 > APIを開く
  3. 「登録」をクリックしてAPIキーを生成
  https://support-ja.backlog.com/hc/ja/articles/115015420567-API%E3%81%AE%E8%A8%AD%E5%AE%9A

環境変数の設定:
  export BACKLOG_API_KEY=<your-api-key>

設定後、再度エクスポートを実行してください。
```

### Project Not Found

```
❌ エラー: Backlog プロジェクトが見つかりません

プロジェクトキー "${PROJECT_KEY}" が存在しないか、アクセス権限がありません。

確認事項:
1. プロジェクトキーが正しいか確認してください
2. APIキーに該当プロジェクトへのアクセス権限があるか確認してください
3. space_keyが正しいか確認してください

設定を修正後、再度エクスポートを実行してください。
```

## Manual Issue Creation Instructions

### Prerequisites

**For Backlog**:
- Create Backlog API key: 個人設定 > API > 登録
- Configure `.sdp/config/export.yml`:
  - Set `backlog.space_key` (your Backlog space subdomain)
  - Set `backlog.project_key` (project key shown in project settings)
- Set API key as environment variable: `export BACKLOG_API_KEY=your-key`

### Option A: Single Issue Mode

```bash
# Set up variables
BACKLOG_URL="https://myspace.backlog.jp"
PROJECT_KEY="PROJ"
API_KEY="${BACKLOG_API_KEY}"

# Get project ID
PROJECT_ID=$(curl -s "${BACKLOG_URL}/api/v2/projects/${PROJECT_KEY}?apiKey=${API_KEY}" | jq -r '.id')

# Get issue type ID
ISSUE_TYPE_ID=$(curl -s "${BACKLOG_URL}/api/v2/projects/${PROJECT_ID}/issueTypes?apiKey=${API_KEY}" | jq -r '.[0].id')

# Create issue
curl -X POST "${BACKLOG_URL}/api/v2/issues?apiKey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": '${PROJECT_ID}',
    "summary": "[slug] Title",
    "description": "## 要件概要\n...",
    "issueTypeId": '${ISSUE_TYPE_ID}',
    "priorityId": 3
  }'
```

### Option B: Sub-Task Mode

```bash
# Create main issue (same as Option A)
MAIN_ISSUE_ID=$(curl -s -X POST "${BACKLOG_URL}/api/v2/issues?apiKey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{...}' | jq -r '.id')

# Create sub-task with parent
curl -X POST "${BACKLOG_URL}/api/v2/issues?apiKey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": '${PROJECT_ID}',
    "summary": "[T-001] Task title",
    "description": "## タスク詳細\n...",
    "issueTypeId": '${ISSUE_TYPE_ID}',
    "priorityId": 3,
    "parentIssueId": '${MAIN_ISSUE_ID}'
  }'
```

### Option C: Linked Issues Mode

```bash
# Create main issue (same as Option A)

# Create task issue without parent
TASK_ISSUE_ID=$(curl -s -X POST "${BACKLOG_URL}/api/v2/issues?apiKey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": '${PROJECT_ID}',
    "summary": "[T-001] Task title",
    "description": "## タスク詳細\n...",
    "issueTypeId": '${ISSUE_TYPE_ID}',
    "priorityId": 3
  }' | jq -r '.id')

# Add comment to link
curl -X POST "${BACKLOG_URL}/api/v2/issues/${MAIN_ISSUE_ID}/comments?apiKey=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "関連タスク: PROJ-124 - Task title"
  }'
```

## API Reference

### Get Project

```
GET /api/v2/projects/:projectKey?apiKey=:apiKey
```

Returns project information including project ID.

### Get Issue Types

```
GET /api/v2/projects/:projectId/issueTypes?apiKey=:apiKey
```

Returns list of issue types for the project.

### Create Issue

```
POST /api/v2/issues?apiKey=:apiKey
Content-Type: application/json

{
  "projectId": 123,
  "summary": "Issue title",
  "description": "Issue description (Markdown)",
  "issueTypeId": 456,
  "priorityId": 3,
  "parentIssueId": 789  // Optional: for sub-tasks
}
```

Returns created issue with `id`, `issueKey`, and other properties.

### Add Comment

```
POST /api/v2/issues/:issueId/comments?apiKey=:apiKey
Content-Type: application/json

{
  "content": "Comment text (Markdown)"
}
```

Adds a comment to the specified issue.

## Notes

- **Markdown Support**: Backlog supports standard Markdown syntax including checkboxes
- **Priority IDs**: 2=High, 3=Normal, 4=Low (adjust as needed)
- **API Rate Limits**: Backlog has rate limits; check documentation for details
- **Domain**: Use `.backlog.jp` for Japanese instances or `.backlog.com` for international
- **Authentication**: API key is passed as query parameter `?apiKey=xxx`
