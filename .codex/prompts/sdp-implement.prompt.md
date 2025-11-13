---
description: Execute implementation tasks based on SDP design and task specifications
mode: agent
---

# SDP Implementation Executor

Implement repository changes for the specified requirement by executing the approved task plan.

## Command Usage
`sdp-implement <slug> [task-id ...]`
- `<slug>` corresponds to `.sdp/specs/<slug>/`
- Optional `task-id` arguments (e.g., `T-002`) restrict execution to those tasks
- When no task IDs are supplied, execute **all** tasks defined in `tasks.yml`

## Language Configuration
Read `.sdp/config/language.yml`:
- `language: en` → produce summaries in **English**
- `language: ja` → produce summaries in **Japanese**

Use templates from `.sdp/templates/<lang>/` to structure artifacts.

## Required Context Files
Read before starting:
- `.sdp/specs/<slug>/requirement.md`
- `.sdp/specs/<slug>/design.md`
- `.sdp/specs/<slug>/tasks.yml`
- `.sdp/product.md`
- `.sdp/tech.md`
- `.sdp/structure.md`
- `.sdp/specs/<slug>/implementation.md` (if present)

## Pre-Flight Checks
1. Ensure `.sdp/specs/<slug>/` exists.
2. Ensure `requirement.md` and `tasks.yml` exist; warn (but continue) if `design.md` is missing.
3. Validate provided task IDs; abort if any are unknown.
4. Confirm working tree status and surface existing uncommitted changes.
5. Respect task dependencies declared in `tasks.yml`; notify if the requested subset violates ordering.

## Implementation Loop
For each selected task:
1. **Intent Alignment**
   - Summarize task objective referencing design, steering docs, and task metadata.
2. **Plan**
   - Outline required code edits, new files, migrations, docs, and tests.
3. **Execute**
   - Modify repository files using native tools only.
   - Follow project conventions (style, naming, folder placement).
   - Update or add tests that satisfy the Definition of Done.
4. **Verify**
   - Run appropriate tests or commands tied to the task’s DoD.
   - Record failures, retries, and resolutions (or residual issues).
5. **Document**
   - Update `.sdp/specs/<slug>/implementation.md` using `.sdp/templates/<lang>/implementation.md`.
   - Append a new section per task run, capturing:
     - Date/time, task ID & title
     - Code change summary and rationale
     - Files touched (with purpose)
     - DoD verification steps
     - Test commands and outcomes
     - New risks or follow-up actions

## Implementation Log Handling
- **CREATE mode**: When `implementation.md` is absent, instantiate it from the template.
- **UPDATE mode**: Append a new iteration section while preserving existing history.
- Maintain chronological ordering and clearly separated task entries.

## Completion Summary
Output a localized summary:
```
【実装完了】 / 【Implementation Complete】
📐 Requirement: <slug>
🛠️ Tasks executed: <T-IDs>
📁 Files changed: <count>
✅ Test status: <pass/fail with notes>
⚠️ Follow-ups: <list or "None">

💡 Next steps:
  - Suggest review or subsequent commands (e.g., /sdp-show-plan <slug>)
```

## Principles
- Minimize scope creep—deliver only what the task requires.
- Surface assumptions and blockers transparently in the log.
- Never leave the repository broken; if unavoidable, document rollback steps.
- Do not use shell commands outside the supported toolset.

## Allowed Tools
Read, Write, Edit, File Search, Grep