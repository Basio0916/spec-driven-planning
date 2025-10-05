# Jira Issues Export Implementation Guide

This document provides detailed implementation instructions for exporting tasks to Jira Issues.

## Pre-Check for Jira Mode

Claude Code will check:
- If required Jira configuration is present in `.sdp/config/export.yml`:
  - `jira.url`: Jira instance URL
  - `jira.email`: User email for authentication
  - `jira.project`: Project key (also called "space key" in Jira UI)
- If Jira API token is available:
  - Check if `jira.api_token` is set in config, OR
  - Check if `JIRA_API_TOKEN` environment variable is set

If required configuration is missing, provide appropriate error messages to guide the user.

**Note**: This implementation uses Jira REST API v3 with Basic Authentication (email + API token).

**Important**: All Jira issue descriptions must use **Atlassian Document Format (ADF)**, not plain text or Wiki Markup. ADF is a JSON-based format that properly renders:
- Headings (h1-h6)
- Task lists with checkboxes (taskItem nodes with state: "TODO" or "DONE")
- Bullet lists and numbered lists
- Paragraphs, bold, italic, links
- Code blocks, horizontal rules, and more

The templates in `.sdp/templates/{lang}/jira-*.md` are stored in Wiki Markup for human readability, but must be converted to ADF before sending to the API.

## Step 1: Load Jira Configuration

Read Jira settings from `.sdp/config/export.yml`:
- `jira.url`: Jira instance URL (e.g., "https://your-domain.atlassian.net")
- `jira.email`: User email for authentication
- `jira.api_token`: API token (optional if using environment variable)
- `jira.project`: Jira project key / space key (e.g., "PROJ", "DEV", "SCRUM")
  - In Jira UI this may be displayed as "space key", but it's the project key in the API
- `jira.issue_mode`: Export mode ("sub_tasks", "linked_issues", or "single_issue")
- `jira.main_issue_type`: Issue type for main requirement (e.g., "Story", "Epic")
- `jira.task_issue_type`: Issue type for tasks (e.g., "Sub-task", "Task")
- `jira.component`: Optional component name
- `jira.labels`: Default labels to apply to all issues

Get API token:
```bash
# Priority 1: From config file
API_TOKEN="${JIRA_API_TOKEN_FROM_CONFIG}"

# Priority 2: From environment variable
if [ -z "$API_TOKEN" ]; then
  API_TOKEN="${JIRA_API_TOKEN}"
fi
```

## Step 2: Create Main Issue

The content and structure depend on `jira.issue_mode`.

### Issue Summary (Title)
Format: `[<slug>] <requirement title>`

### Issue Description Template

**For `issue_mode: single_issue`**:

Read the comprehensive single-issue template:
- **English**: `.sdp/templates/en/jira-single.md`
- **Japanese**: `.sdp/templates/ja/jira-single.md`

Replace placeholders (same as GitHub single_issue mode):
- `{{requirement_summary}}`: Brief summary from requirement
- `{{task_count}}`: Total number of tasks
- `{{expected_hours}}`: Expected hours from rollup
- `{{stddev_hours}}`: Standard deviation from rollup
- `{{confidence}}`: Confidence level from rollup
- `{{critical_path}}`: Critical path from rollup
- `{{task_list}}`: Checklist of all tasks with checkboxes
- `{{task_details}}`: Detailed breakdown of each task

**For `issue_mode: sub_tasks` or `issue_mode: linked_issues`**:

Read the main issue template (without task details):
- **English**: `.sdp/templates/en/jira-main.md`
- **Japanese**: `.sdp/templates/ja/jira-main.md`

Replace placeholders (same as GitHub mode).

**Important**: Jira templates use Wiki Markup format (h2., *, [ ]) for readability, but the actual API requests must use Atlassian Document Format (ADF). When implementing:
1. Load the template file (Wiki Markup)
2. Replace all placeholders with actual values
3. Convert the entire content from Wiki Markup to ADF JSON structure
4. Send the ADF structure to Jira REST API

This ensures proper rendering of headings, checkboxes, lists, and other formatting in Jira issues.

### ADF Conversion Guidelines

**ADF Structure Guidelines**:
- Use proper ADF nodes: `heading`, `paragraph`, `bulletList`, `listItem`, `taskList`, `taskItem`
- Headings: `{"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Heading"}]}`
- Checkboxes: `{"type": "taskList", "content": [{"type": "taskItem", "attrs": {"state": "TODO"}, "content": [{"type": "text", "text": "Task"}]}]}`
- Bullet lists: `{"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Item"}]}]}]}`

**Template Conversion**:
When loading Jira templates (jira-single.md, jira-main.md, jira-task.md), convert from Wiki Markup to ADF:
1. `h2. Title` → heading level 2 node
2. `* [ ] Item` → taskItem node with state "TODO"
3. `* Item` → bulletList with listItem nodes
4. Plain text → paragraph nodes
5. `----` → rule node (horizontal line)

**Example ADF Conversion**:
```
Wiki Markup:
h2. 要件概要
{{requirement_summary}}

h2. タスク分解
* [ ] T-001: Task 1
* [ ] T-002: Task 2
```

Converts to ADF:
```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "heading",
      "attrs": {"level": 2},
      "content": [{"type": "text", "text": "要件概要"}]
    },
    {
      "type": "paragraph",
      "content": [{"type": "text", "text": "{{requirement_summary}}"}]
    },
    {
      "type": "heading",
      "attrs": {"level": 2},
      "content": [{"type": "text", "text": "タスク分解"}]
    },
    {
      "type": "taskList",
      "attrs": {"localId": "task-list-1"},
      "content": [
        {
          "type": "taskItem",
          "attrs": {"localId": "task-1", "state": "TODO"},
          "content": [
            {
              "type": "text",
              "text": "T-001: Task 1"
            }
          ]
        },
        {
          "type": "taskItem",
          "attrs": {"localId": "task-2", "state": "TODO"},
          "content": [
            {
              "type": "text",
              "text": "T-002: Task 2"
            }
          ]
        }
      ]
    }
  ]
}
```

### Execution

```bash
# Prepare authentication (Base64 encode email:api_token)
AUTH=$(echo -n "${JIRA_EMAIL}:${API_TOKEN}" | base64)

# Load and convert template to ADF
# Read template file (e.g., .sdp/templates/ja/jira-single.md)
# Replace placeholders with actual values
# Convert Wiki Markup to ADF structure

# Prepare JSON payload for main issue with ADF description
JSON_PAYLOAD=$(cat <<EOF
{
  "fields": {
    "project": {
      "key": "${JIRA_PROJECT}"
    },
    "summary": "[<slug>] <requirement title>",
    "description": <ADF_JSON_STRUCTURE>,
    "issuetype": {
      "name": "${MAIN_ISSUE_TYPE}"
    }$(if [ -n "$LABELS" ]; then echo ',
    "labels": ['"$(echo "$LABELS" | sed 's/,/", "/g')"']'; fi)$(if [ -n "$COMPONENT" ]; then echo ',
    "components": [{"name": "'"$COMPONENT"'"}]'; fi)
  }
}
EOF
)

# Create main issue via REST API
RESPONSE=$(curl -s -X POST "${JIRA_URL}/rest/api/3/issue" \
  -H "Authorization: Basic ${AUTH}" \
  -H "Content-Type: application/json" \
  -d "${JSON_PAYLOAD}")

# Extract issue key from response
MAIN_ISSUE=$(echo "${RESPONSE}" | grep -oE '"key":"[A-Z]+-[0-9]+"' | cut -d'"' -f4)
```

**If `issue_mode: single_issue`**: This is the only issue created. Skip to Step 4.

**If `issue_mode: sub_tasks` or `issue_mode: linked_issues`**: Collect the main issue key for use in creating task issues (proceed to Step 3).

## Step 3: Create Task Issues

**Note**: This step is only executed if `issue_mode` is `sub_tasks` or `linked_issues`. Skip this step if `issue_mode: single_issue`.

For each task in `.sdp/specs/<slug>/tasks.yml`, create an issue.

### Task Issue Summary (Title)
Format: `[T-xxx] <task.title>`

### Task Issue Description Template

Read the appropriate template based on language configuration:
- **English**: `.sdp/templates/en/jira-task.md`
- **Japanese**: `.sdp/templates/ja/jira-task.md`

Replace placeholders (same as GitHub mode).

**Note**: Jira templates use Wiki Markup format for human readability, but must be converted to Atlassian Document Format (ADF) when creating issues via REST API. The conversion process:
1. Load the template file
2. Replace all placeholders with actual values
3. Convert Wiki Markup syntax to ADF JSON structure
4. Use the ADF structure in the API request

### Execution

**If `issue_mode: sub_tasks`**:
Use Jira REST API to create sub-tasks with parent relationship:

```bash
# Load and convert task template to ADF
# Read template file (e.g., .sdp/templates/ja/jira-task.md)
# Replace placeholders with actual task values
# Convert Wiki Markup to ADF structure

# Prepare JSON payload for sub-task with ADF description
TASK_JSON=$(cat <<EOF
{
  "fields": {
    "project": {
      "key": "${JIRA_PROJECT}"
    },
    "parent": {
      "key": "${MAIN_ISSUE}"
    },
    "summary": "[T-001] <task.title>",
    "description": <ADF_JSON_STRUCTURE>,
    "issuetype": {
      "name": "${TASK_ISSUE_TYPE}"
    }$(if [ -n "$LABELS" ]; then echo ',
    "labels": ['"$(echo "$LABELS" | sed 's/,/", "/g')"']'; fi)
  }
}
EOF
)

# Create sub-task via REST API
RESPONSE=$(curl -s -X POST "${JIRA_URL}/rest/api/3/issue" \
  -H "Authorization: Basic ${AUTH}" \
  -H "Content-Type: application/json" \
  -d "${TASK_JSON}")

# Extract issue key
TASK_ISSUE=$(echo "${RESPONSE}" | grep -oE '"key":"[A-Z]+-[0-9]+"' | cut -d'"' -f4)
```

**If `issue_mode: linked_issues`**:
Use Jira REST API to create regular issues and link them:

```bash
# Load and convert task template to ADF (same as sub_tasks)

# Create regular issue (without parent field)
TASK_JSON=$(cat <<EOF
{
  "fields": {
    "project": {
      "key": "${JIRA_PROJECT}"
    },
    "summary": "[T-001] <task.title>",
    "description": <ADF_JSON_STRUCTURE>,
    "issuetype": {
      "name": "${TASK_ISSUE_TYPE}"
    }$(if [ -n "$LABELS" ]; then echo ',
    "labels": ['"$(echo "$LABELS" | sed 's/,/", "/g')"']'; fi)
  }
}
EOF
)

RESPONSE=$(curl -s -X POST "${JIRA_URL}/rest/api/3/issue" \
  -H "Authorization: Basic ${AUTH}" \
  -H "Content-Type: application/json" \
  -d "${TASK_JSON}")

TASK_ISSUE=$(echo "${RESPONSE}" | grep -oE '"key":"[A-Z]+-[0-9]+"' | cut -d'"' -f4)

# Link to parent issue (Relates link type)
LINK_JSON=$(cat <<EOF
{
  "type": {
    "name": "Relates"
  },
  "inwardIssue": {
    "key": "${TASK_ISSUE}"
  },
  "outwardIssue": {
    "key": "${MAIN_ISSUE}"
  }
}
EOF
)

curl -s -X POST "${JIRA_URL}/rest/api/3/issueLink" \
  -H "Authorization: Basic ${AUTH}" \
  -H "Content-Type: application/json" \
  -d "${LINK_JSON}"
```

Collect the returned issue key and URL for each task.

## Step 4: Finalize and Collect Results

**If `issue_mode: single_issue`**:
- All tasks are already included in the single issue as checkboxes
- No additional updates needed
- Create a summary for console output showing the single issue URL

**If `issue_mode: sub_tasks`**:
- Jira automatically maintains the parent-child relationship
- Sub-tasks are visible in the parent issue
- No manual update needed

**If `issue_mode: linked_issues`**:
- Issues are linked via "relates to" relationship
- You can optionally add a task checklist to the parent issue description

Create a mapping table of task ID → issue key/URL and main issue for the console output.

## Output Format

Generate console output in the configured language (`.sdp/config/language.yml`):

**If `issue_mode: single_issue`**:
```
【Jira Issues エクスポート完了】
📋 要件: <slug>
🎯 モード: Jira (単一Issue)
📦 プロジェクト: <project>

作成されたIssue:
📌 Issue: <ISSUE-KEY>
   https://<your-domain>.atlassian.net/browse/<ISSUE-KEY>

📊 含まれるタスク: <count>個
⏱️  総見積時間: <expected_hours>h

✅ 全タスクを含む1つのIssueを作成しました
💡 次のステップ: Issue <ISSUE-KEY> のチェックボックスで進捗を管理してください
```

**If `issue_mode: sub_tasks` or `issue_mode: linked_issues`**:
```
【Jira Issues エクスポート完了】
📋 要件: <slug>
🎯 モード: Jira (<sub_tasks/linked_issues>)
📦 プロジェクト: <project>

作成されたIssue:
📌 メインIssue: <MAIN-ISSUE-KEY>
   https://<your-domain>.atlassian.net/browse/<MAIN-ISSUE-KEY>

🎫 タスクIssue: <count>個

タスクIssueマッピング:
| Task ID | Issue Key | URL                                                    |
|---------|-----------|--------------------------------------------------------|
| T-001   | PROJ-124  | https://<your-domain>.atlassian.net/browse/PROJ-124 |
| T-002   | PROJ-125  | https://<your-domain>.atlassian.net/browse/PROJ-125 |
| T-003   | PROJ-126  | https://<your-domain>.atlassian.net/browse/PROJ-126 |
...

✅ 1つのメインIssueと<count>個のタスクIssueを作成しました
💡 次のステップ: メインIssue <MAIN-ISSUE-KEY> から各タスクの進捗を管理してください
```

## Error Cases

### Missing configuration
```
【エラー: Jira 設定不足】
📋 要件: <slug>
🎯 設定モード: Jira Issues
❌ 必要な設定が不足しています

💡 対処方法:
   .sdp/config/export.yml に以下の設定を追加してください:
   
   jira:
     url: https://your-domain.atlassian.net
     email: your-email@example.com
     project: YOUR-PROJECT
     issue_mode: single_issue
     main_issue_type: Story
     task_issue_type: Sub-task
   
   設定完了後、再度実行してください: /sdp:export-issues <slug>
```

### Missing API token
```
【エラー: Jira API トークン未設定】
📋 要件: <slug>
🎯 設定モード: Jira Issues
❌ API トークンが設定されていません

💡 対処方法:
   1. Jira API トークンを作成: https://id.atlassian.com/manage-profile/security/api-tokens
   2. 以下のいずれかの方法で設定:
      
      Option A: 環境変数に設定 (推奨)
        export JIRA_API_TOKEN=your-api-token-here
      
      Option B: export.yml に直接記載
        jira:
          api_token: your-api-token-here
   
   設定完了後、再度実行してください: /sdp:export-issues <slug>
```

## Manual Issue Creation Instructions

### Prerequisites

- Create Jira API token: https://id.atlassian.com/manage-profile/security/api-tokens
- Configure `.sdp/config/export.yml`:
  - Set `jira.url` (your Jira instance URL)
  - Set `jira.email` (your email)
  - Set `jira.project` (project key / space key shown in Jira settings)
- Set API token as environment variable: `export JIRA_API_TOKEN=your-token`

### Option A: Single Issue Mode (issue_mode: single_issue)

1. **Set up authentication**:
   ```bash
   export JIRA_URL="https://your-domain.atlassian.net"
   export JIRA_EMAIL="your-email@example.com"
   export JIRA_API_TOKEN="your-api-token"
   export JIRA_PROJECT="PROJ"
   AUTH=$(echo -n "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64)
   ```

2. **Create One Comprehensive Issue with ADF**:
   ```bash
   # Load template and convert to ADF
   # The description must use Atlassian Document Format (ADF)
   # Example ADF structure with headings, task lists, and paragraphs:
   
   JSON=$(cat <<'EOF'
   {
     "fields": {
       "project": {"key": "PROJ"},
       "summary": "[slug] Title",
       "description": {
         "type": "doc",
         "version": 1,
         "content": [
           {
             "type": "heading",
             "attrs": {"level": 2},
             "content": [{"type": "text", "text": "要件概要"}]
           },
           {
             "type": "paragraph",
             "content": [{"type": "text", "text": "Requirement summary text here"}]
           },
           {
             "type": "heading",
             "attrs": {"level": 2},
             "content": [{"type": "text", "text": "タスク分解"}]
           },
           {
             "type": "taskList",
             "attrs": {"localId": "tasks"},
             "content": [
               {
                 "type": "taskItem",
                 "attrs": {"localId": "task-1", "state": "TODO"},
                 "content": [{"type": "text", "text": "T-001: Task 1 (Expected: 2h)"}]
               },
               {
                 "type": "taskItem",
                 "attrs": {"localId": "task-2", "state": "TODO"},
                 "content": [{"type": "text", "text": "T-002: Task 2 (Expected: 3h)"}]
               }
             ]
           }
         ]
       },
       "issuetype": {"name": "Story"}
     }
   }
   EOF
   )
   
   RESPONSE=$(curl -s -X POST "${JIRA_URL}/rest/api/3/issue" \
     -H "Authorization: Basic ${AUTH}" \
     -H "Content-Type: application/json" \
     -d "${JSON}")
   
   ISSUE=$(echo "${RESPONSE}" | grep -oE '"key":"[A-Z]+-[0-9]+"' | cut -d'"' -f4)
   echo "Issue created: ${ISSUE}"
   echo "URL: ${JIRA_URL}/browse/${ISSUE}"
   ```

3. **Note**: All tasks are included as checkboxes (taskItem nodes) in the issue description. Check them off as you complete each task.

### Option B: Sub-Task Mode (issue_mode: sub_tasks)

1. **Set up authentication** (same as Option A)

2. **Create Main Requirement Issue First** (same as Option A, step 2)

3. **Create Each Task as Sub-Task with ADF** (automatically linked to parent):
   ```bash
   # Load task template and convert to ADF
   # The description must use Atlassian Document Format (ADF)
   
   TASK_JSON=$(cat <<'EOF'
   {
     "fields": {
       "project": {"key": "PROJ"},
       "parent": {"key": "PROJ-123"},
       "summary": "[T-001] Task title",
       "description": {
         "type": "doc",
         "version": 1,
         "content": [
           {
             "type": "heading",
             "attrs": {"level": 2},
             "content": [{"type": "text", "text": "説明"}]
           },
           {
             "type": "paragraph",
             "content": [{"type": "text", "text": "Task description here"}]
           },
           {
             "type": "heading",
             "attrs": {"level": 2},
             "content": [{"type": "text", "text": "見積もり"}]
           },
           {
             "type": "bulletList",
             "content": [
               {
                 "type": "listItem",
                 "content": [
                   {
                     "type": "paragraph",
                     "content": [{"type": "text", "text": "手法: PERT"}]
                   }
                 ]
               },
               {
                 "type": "listItem",
                 "content": [
                   {
                     "type": "paragraph",
                     "content": [{"type": "text", "text": "期待値: 2h"}]
                   }
                 ]
               }
             ]
           }
         ]
       },
       "issuetype": {"name": "Sub-task"}
     }
   }
   EOF
   )
   
   RESPONSE=$(curl -s -X POST "${JIRA_URL}/rest/api/3/issue" \
     -H "Authorization: Basic ${AUTH}" \
     -H "Content-Type: application/json" \
     -d "${TASK_JSON}")
   
   TASK_1=$(echo "${RESPONSE}" | grep -oE '"key":"[A-Z]+-[0-9]+"' | cut -d'"' -f4)
   echo "Sub-task T-001 created: ${TASK_1}"
   ```

4. **Note**: Sub-tasks are automatically visible in the parent issue. No manual update needed.

### Option C: Linked Issues Mode (issue_mode: linked_issues)

1. **Set up authentication** (same as Option A)

2. **Create Main Requirement Issue First** (same as Option B)

3. **Create Each Task as Regular Issue with ADF** (and link to parent):
   ```bash
   # Create task issue (without parent field) using ADF
   TASK_JSON=$(cat <<'EOF'
   {
     "fields": {
       "project": {"key": "PROJ"},
       "summary": "[T-001] Task title",
       "description": {
         "type": "doc",
         "version": 1,
         "content": [
           {
             "type": "heading",
             "attrs": {"level": 2},
             "content": [{"type": "text", "text": "説明"}]
           },
           {
             "type": "paragraph",
             "content": [{"type": "text", "text": "Task description here"}]
           },
           {
             "type": "heading",
             "attrs": {"level": 2},
             "content": [{"type": "text", "text": "見積もり"}]
           },
           {
             "type": "bulletList",
             "content": [
               {
                 "type": "listItem",
                 "content": [
                   {
                     "type": "paragraph",
                     "content": [{"type": "text", "text": "手法: PERT"}]
                   }
                 ]
               },
               {
                 "type": "listItem",
                 "content": [
                   {
                     "type": "paragraph",
                     "content": [{"type": "text", "text": "期待値: 2h"}]
                   }
                 ]
               }
             ]
           }
         ]
       },
       "issuetype": {"name": "Task"}
     }
   }
   EOF
   )
   
   RESPONSE=$(curl -s -X POST "${JIRA_URL}/rest/api/3/issue" \
     -H "Authorization: Basic ${AUTH}" \
     -H "Content-Type: application/json" \
     -d "${TASK_JSON}")
   
   TASK_1=$(echo "${RESPONSE}" | grep -oE '"key":"[A-Z]+-[0-9]+"' | cut -d'"' -f4)
   
   # Link to parent issue
   LINK_JSON=$(cat <<EOF
   {
     "type": {"name": "Relates"},
     "inwardIssue": {"key": "${TASK_1}"},
     "outwardIssue": {"key": "${MAIN_ISSUE}"}
   }
   EOF
   )
   
   curl -s -X POST "${JIRA_URL}/rest/api/3/issueLink" \
     -H "Authorization: Basic ${AUTH}" \
     -H "Content-Type: application/json" \
     -d "${LINK_JSON}"
   
   echo "Task issue T-001 created: ${TASK_1}"
   ```

4. **Note**: Issues are linked via "relates to" relationship and are visible in the parent issue's Links section.
