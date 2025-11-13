---
description: Export task breakdown to GitHub Issues, Jira Issues, or local markdown files
mode: agent
---

# SDP Export Issues

Export task breakdown to GitHub Issues, Jira Issues, or local markdown files.

## Inputs

- **slug**: An existing requirement folder at `.sdp/specs/<slug>/` containing `tasks.yml`
- **Usage Example**: `/sdp-export-issues add-user-authentication`
- **Export Config**: `.sdp/config/export.yml` (output destination, repository, labels)

## Language Configuration

Read `.sdp/config/language.yml` to determine the output language:
- If `language: en`, generate all content in **English**
- If `language: ja`, generate all content in **Japanese**

Console output should also be in the configured language.

## Context Files

Read these for context:
- `.sdp/specs/${input:slug}/tasks.yml` - Task breakdown to export
- `.sdp/specs/${input:slug}/requirement.md` - Original requirement
- `.sdp/config/export.yml` - Export configuration (destination, repo, labels)

## Pre-Check

Before starting, verify that:
- `.sdp/specs/${input:slug}/` directory exists
- `.sdp/specs/${input:slug}/tasks.yml` file exists
- `.sdp/config/export.yml` file exists

Report errors if files are missing.

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

Read `.sdp/config/export.yml` to determine:
- `destination`: Export target (`github`, `jira`, or `local`)
- Destination-specific settings (repository, project, labels, etc.)
- `issue_mode`: How to organize tasks
  - `sub_issues` / `sub_tasks`: Create parent-child relationships
  - `linked_issues`: Create separate issues with links
  - `single_issue`: Create one comprehensive issue with all tasks

## Step 2: Determine Export Destination

Based on the `destination` field in export.yml:
- **`github`**: Export to GitHub Issues (requires `gh` CLI)
- **`jira`**: Export to Jira Issues (uses REST API v3)
- **`backlog`**: Export to Backlog Issues (uses REST API v2)
- **`local`**: Export to local markdown files (no external tools required)

### Implementation Details

For detailed implementation instructions, refer to:
- **GitHub mode**: `.sdp/docs/export-github.md`
- **Jira mode**: `.sdp/docs/export-jira.md`
- **Backlog mode**: `.sdp/docs/export-backlog.md`
- **Local mode**: `.sdp/docs/export-local.md`

## Step 3: Execute Export

### GitHub Export

If `destination: github`, read `.sdp/docs/export-github.md` for complete implementation details.

**Summary**:
1. Check `gh` CLI availability and authentication
2. Check `gh sub-issue` extension if needed
3. Create main issue using appropriate template
4. Create task issues if using sub_issues or linked_issues mode
5. Generate console output with issue URLs

### Jira Export

If `destination: jira`, read `.sdp/docs/export-jira.md` for complete implementation details.

**Summary**:
1. Check Jira configuration (url, email, project, API token)
2. Load templates and convert Wiki Markup to ADF
3. Create main issue via REST API
4. Create task issues if using sub_tasks or linked_issues mode
5. Generate console output with issue URLs

### Backlog Export

If `destination: backlog`, read `.sdp/docs/export-backlog.md` for complete implementation details.

**Summary**:
1. Check Backlog configuration (space_key, project_key, API key)
2. Get project ID and issue type IDs via REST API
3. Create main issue with Markdown description
4. Create task issues if using sub_tasks or linked_issues mode
5. Generate console output with issue URLs

### Local Export

If `destination: local`, read `.sdp/docs/export-local.md` for complete implementation details.

**Summary**:
1. Create output directory if needed
2. Generate markdown file with issue drafts
3. Generate console output with file path

## Issue Templates

### Issue Title Format
- Main issue: `[<slug>] <requirement title>`
- Task issue: `[<slug>][T-xxx] <task.title>`

### Issue Body Templates

Use templates from `.sdp/templates/<lang>/`:
- `issue-single.md` - For single issue mode
- `issue-main.md` - For main requirement issue
- `issue-task.md` - For individual task issues

Replace placeholders with actual values from requirement and tasks files.

## Console Output Format

After export completes, print a summary:

```
【エクスポート完了】
📋 要件: <slug>
🎯 エクスポート先: <destination>
📊 作成されたIssue数: <count>

Issue URL:
- メインIssue: <main_issue_url>
- タスクIssue:
  - T-001: <task_issue_url>
  - T-002: <task_issue_url>
  ...

💡 次のステップ:
  - Issueボードで進捗を管理してください
  - 必要に応じてタスクの優先順位を調整してください
```

## Allowed Tools

Read, Write, Terminal, File Search, Grep
