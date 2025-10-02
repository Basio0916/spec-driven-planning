# /show-plan <REQ-ID>
You are Claude Code. Transform a task breakdown into a human-readable project plan.

## Input
- **REQ-ID**: An existing file at `.sdp/tasks/REQ-xxx.yml`

## Context Files
Read these for context:
- `.sdp/tasks/REQ-xxx.yml` - Task breakdown and estimates
- `.sdp/requirements/REQ-xxx.md` - Original requirement
- `.sdp/product.md` - Business context

## Pre-Check

```bash
# Create .sdp/plans directory if it doesn't exist
mkdir -p .sdp/plans

# Verify task file exists
[ -f ".sdp/tasks/${REQ_ID}.yml" ] && echo "✅ Task file found" || echo "❌ Task file not found"
```

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
    title REQ-xxx Project Timeline
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
- Recommendation to run `/sdp:export-issues REQ-xxx`

## Output Format

### 1. Write Plan File
Create `.sdp/plans/REQ-xxx.md` with all sections above in **Japanese language**.

### 2. Console Output
Print a summary in **Japanese**:

```
【プロジェクト計画生成完了】
📋 要件: REQ-xxx
📁 ファイル: .sdp/plans/REQ-xxx.md

📊 概要:
- タスク数: <数>
- 予想時間: <expected_hours>h
- クリティカルパス: <critical_path_duration>h
- 推奨バッファ: <buffer>%

⚠️  主要リスク: <top_risk_summary>

💡 次のステップ: /sdp:export-issues REQ-xxx でGitHub Issuesにエクスポートしてください
```

## Allowed Tools
Bash, Read, Write, Edit, Glob, Grep only