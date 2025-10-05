# Local File Export Implementation Guide

This document provides detailed implementation instructions for exporting tasks to local markdown files.

## Step 1: Prepare Local Output Directory

Read the output directory from `.sdp/config/export.yml` under `local.out_dir` (default: `.sdp/out`).
Create the output directory if it doesn't exist using Claude Code's file operations.

Also read `github.issue_mode` (or `jira.issue_mode`) to determine the output format:
- `single_issue`: Generate a single comprehensive issue draft
- `sub_issues` or `linked_issues`: Generate main issue + task issues drafts

## Step 2: Generate Issue Drafts

Create a markdown file at `${OUT_DIR}/<slug>-issues.md` with localized content based on `.sdp/config/language.yml`.

### For Single Issue Mode

**If `issue_mode: single_issue`**:

Read the single issue draft template:
- **English**: `.sdp/templates/en/issue-draft-single.md`
- **Japanese**: `.sdp/templates/ja/issue-draft-single.md`

Replace placeholders:
- `{{slug}}`: Requirement slug
- `{{requirement_title}}`: Requirement title
- `{{issue_body}}`: Complete issue body (generated from `.sdp/templates/{lang}/issue-single.md`)

### For Multi-Issue Mode

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

## Output Format

Generate console output in the configured language (`.sdp/config/language.yml`):

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

## Manual Import Instructions

The generated markdown file contains all issue content ready for manual creation in GitHub or Jira.

### For GitHub Issues

Use the GitHub CLI or GitHub web interface to create issues manually from the generated content.

### For Jira Issues

Copy the content and create issues manually in Jira. Note that you'll need to adapt markdown to Jira's format (or ADF if using API).
