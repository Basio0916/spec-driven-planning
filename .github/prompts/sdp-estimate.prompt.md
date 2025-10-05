---
description: Generate tasks and estimates grounded in this repository using PERT method
mode: agent
---

# SDP Task Estimation

Generate tasks and estimates for the given requirement using PERT method.

## Inputs

- **slug**: An existing requirement folder at `.sdp/specs/<slug>/`
- **Usage Example**: `/sdp-estimate add-user-authentication`
- **Estimation config**: `.sdp/config/estimate.yml` (T-shirt sizing, PERT constraints, buffers)
- **Schema**: `.sdp/templates/<lang>/tasks.schema.yml` (Task structure definition)

## Language Configuration

Read `.sdp/config/language.yml` to determine the output language:
- If `language: en`, generate all content in **English**
- If `language: ja`, generate all content in **Japanese**

## Context Files

Read these for context:
- `.sdp/specs/${input:slug}/requirement.md` - The requirement to decompose
- `.sdp/specs/${input:slug}/design.md` - The design document (if exists)
- `.sdp/tech.md` - Technical constraints affecting estimates
- `.sdp/structure.md` - Existing modules and directories

## Pre-Check

Before starting, verify that:
- `.sdp/specs/${input:slug}/` directory exists
- `.sdp/specs/${input:slug}/requirement.md` file exists
- `.sdp/specs/${input:slug}/design.md` file exists (optional, but recommended)

Report errors if requirements are missing.

## Task Decomposition Rules

**Important**: If a design document exists (`.sdp/specs/${input:slug}/design.md`), use it as the primary source for task decomposition. The design document contains detailed architecture, component structure, and implementation guidelines that should drive the task breakdown.

### Task Structure

Decompose into **5–12 tasks** when possible. Each task must include:

1. **Basic Info**:
   - `id`: T-001, T-002, etc.
   - `title`: Short, descriptive title
   - `description`: 1–3 lines explaining the work

2. **Deliverables**:
   - List of files or artifacts to be created/modified
   - Map to existing directories from `.sdp/structure.md`

3. **Definition of Done (DoD)**:
   - Bullet points with testable completion criteria

4. **Dependencies**:
   - `depends_on`: Array of task IDs that must complete first

5. **Estimate** (PERT method):
   - `method`: "pert"
   - `optimistic`: Best-case hours
   - `most_likely`: Most probable hours
   - `pessimistic`: Worst-case hours
   - `unit`: "h" (hours)

6. **Risk Notes** (optional):
   - Highlight technical risks or uncertainties

### Critical Path Analysis

- Identify the `critical_path`: Array of task IDs representing the longest dependency chain
- This determines minimum project duration

### Rollup Section

Calculate project-level metrics:
- `expected_hours`: Sum of PERT means ((optimistic + 4*most_likely + pessimistic) / 6)
- `stddev_hours`: Propagated standard deviation (sqrt of sum of variances)
- `confidence`: `low` | `med` | `high` with 1-line rationale
- `rationale`: Brief explanation of confidence level

### Estimation Guidelines

Reference `.sdp/config/estimate.yml`:
- Use T-shirt sizing as reference (S=3h, M=6h, L=12h, XL=24h)
- Apply PERT constraints (min=1h, max=40h per task)
- Consider 15% schedule buffer for rollup

## Output Format

### 1. Write YAML File

Create `.sdp/specs/${input:slug}/tasks.yml` following the schema exactly.

### 2. Console Output

Print a summary in the configured language (`.sdp/config/language.yml`):

```
【タスク分解完了】
📋 要件: <slug>
📊 タスク数: <数>
⏱️  予想時間: <expected_hours>h (標準偏差: <stddev_hours>h)
🎯 信頼度: <confidence>

タスク一覧:
| ID    | タイトル              | 見積時間 |
|-------|----------------------|----------|
| T-001 | <title>              | <mean>h  |
| T-002 | <title>              | <mean>h  |
...

🔗 クリティカルパス: T-001 → T-003 → T-007

💡 次のステップ: /sdp-show-plan でプロジェクト計画を生成してください
```

## Allowed Tools

Read, Write, Edit, File Search, Grep only
