# /show-plan <slug>
You are Claude Code. Transform a task breakdown into a human-readable project plan.

## Input
- **slug**: An existing requirement folder at `.sdp/specs/<slug>/` containing `tasks.yml`

## Context Files
Read these for context:
- `.sdp/specs/<slug>/tasks.yml` - Task breakdown and estimates
- `.sdp/specs/<slug>/requirement.md` - Original requirement
- `.sdp/product.md` - Business context

## Pre-Check

Before starting, verify that:
- `.sdp/specs/<slug>/` directory exists
- `.sdp/specs/<slug>/tasks.yml` file exists

Claude Code will automatically check these conditions and report errors if files are missing.

## Plan Structure

Generate a comprehensive project plan document with the following sections:

### 1. Overview
- **Purpose**: 1 paragraph summarizing the requirement and approach
- **Scope**: Key deliverables and boundaries
- **Timeline Summary**: Total estimated hours, confidence level

### 2. Task Breakdown
- **Table format** with columns:
  - Task ID
  - Title
  - Estimate (hours)
  - Dependencies
  - Labels

### 3. Project Timeline (Mermaid Gantt)
Generate a Gantt-like Mermaid diagram:
```mermaid
gantt
    title <slug> Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
    T-001 Task Title :t001, 2024-01-01, 3d
    T-002 Task Title :t002, after t001, 5d
    ...
```

Use task IDs and dependencies to show:
- Sequential vs. parallel work
- Critical path highlighted
- Milestone markers

### 4. Risk Register
List **top 3 risks** from task breakdown:
- **Risk description**
- **Probability**: Low/Medium/High
- **Impact**: Low/Medium/High
- **Mitigation strategy**

### 5. Critical Path Analysis
- **Critical path**: List of task IDs (e.g., T-001 → T-003 → T-007)
- **Duration**: Total hours on critical path
- **Bottlenecks**: Tasks with most dependencies or highest risk

### 6. Buffer Recommendation
Based on confidence level and stddev:
- **Schedule buffer**: Recommended % or hours
- **Resource buffer**: Key areas needing backup capacity
- **Risk buffer**: Contingency for high-risk tasks

### 7. Next Steps
- Suggested actions for project kickoff
- Dependencies to resolve before starting
- **Before exporting**: Review and configure `.sdp/config/export.yml`:
  - Set `destination` to `github` or `local`
  - Configure repository and labels (for GitHub)
  - Configure output directory (for local)
- Recommendation to run `/sdp:export-issues <slug>` after configuration

## Output Format

### 1. Write Plan File
Create `.sdp/specs/<slug>/plan.md` with all sections above in **Japanese language**.

### 2. Console Output
Print a summary in **Japanese**:

```
【プロジェクト計画生成完了】
📋 要件: <slug>
📁 ファイル: .sdp/specs/<slug>/plan.md

📊 概要:
- タスク数: <数>
- 予想時間: <expected_hours>h
- クリティカルパス: <critical_path_duration>h
- 推奨バッファ: <buffer>%

⚠️  主要リスク: <top_risk_summary>

💡 次のステップ:
   1. .sdp/config/export.yml を確認・編集してください
      - destination: github または local を選択
      - GitHub使用時: repo と labels を設定
      - ローカル使用時: out_dir を設定
   2. /sdp:export-issues <slug> でタスクをエクスポートしてください
```

## Cross-Platform Compatibility

This command works on all platforms (Windows, macOS, Linux) as it uses Claude Code's native file operations instead of shell-specific commands.

## Allowed Tools
Read, Write, Edit, File Search, Grep only