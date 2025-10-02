# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Spec-Driven Planning** repository that implements a structured workflow for transforming natural-language requirements into refined specifications, task decompositions, estimates, and GitHub Issues. The workflow is entirely orchestrated through Claude Code custom slash commands.

## Custom Slash Commands

This repository provides five custom slash commands in `.claude/commands/sdp/`. All commands output files to the `.sdp/` directory and provide console output in Japanese.

### `/steering`
Performs initial project context extraction and generates three foundational documents in `.sdp/`:
- `product.md` - Business goals, user stories, and KPIs
- `tech.md` - Technology stack, services, contracts, and constraints
- `structure.md` - Directory structure, modules, and data flows

**Smart Update Strategy:**
- Detects existing files and switches between CREATE/UPDATE mode
- In UPDATE mode: preserves user customizations while updating factual information
- Uses deprecation marks instead of deletion for outdated content

Run this command first when setting up a new project or after major architecture changes.

### `/requirement <text-or-path>`
Refines a natural-language requirement (or reads from a file path) and creates/updates a normalized requirement document at `.sdp/requirements/REQ-xxx.md`.

**Behavior:**
- Assigns sequential REQ-IDs (REQ-001, REQ-002, etc.)
- Enforces the template structure from `.claude/templates/requirement.md`
- Aligns with `.sdp/product.md`, `.sdp/tech.md`, and `.sdp/structure.md` context
- Includes Done Criteria, Acceptance Scenarios (Gherkin-style), NFRs, Risks, Dependencies
- Content output in Japanese language
- Prompts user to run `/sdp:estimate REQ-xxx` next

### `/estimate <REQ-ID>`
Generates a task breakdown and PERT-based estimates for a given requirement.

**Behavior:**
- Reads `.sdp/requirements/REQ-xxx.md`
- Produces `.sdp/tasks/REQ-xxx.yml` following `.claude/templates/tasks.schema.yml`
- Decomposes into 5–12 tasks with dependencies, labels, deliverables, DoD, and PERT estimates (optimistic, most_likely, pessimistic)
- Uses estimation config from `.claude/config/estimate.yml`
- Calculates critical path, expected hours, and standard deviation
- Outputs a compact task table to console in Japanese
- Prompts user to run `/sdp:show-plan REQ-xxx` next

### `/show-plan <REQ-ID>`
Converts a task file into a human-readable project plan at `.sdp/plans/REQ-xxx.md`.

**Behavior:**
- Reads `.sdp/tasks/REQ-xxx.yml`
- Generates: overview, Gantt-like Mermaid diagram, risk register (top 3), critical path, buffer recommendation
- Content output in Japanese language
- Prompts user to run `/sdp:export-issues REQ-xxx` next

### `/export-issues <REQ-ID>`
Exports tasks from `.sdp/tasks/REQ-xxx.yml` to GitHub Issues or local files based on configuration.

**Export Modes:**
- **GitHub Mode** (`to: github`): Creates issues directly in GitHub via `gh` CLI
- **Local Mode** (`to: local`): Generates markdown files and import scripts locally

**Behavior:**
- Reads export destination from `.claude/config/export.yml` (`to` field)
- Reads GitHub settings from `.claude/config/github.yml` (labels, default_repo)

**GitHub Mode:**
- Checks for `gh` CLI availability and authentication
- Repository priority: `export.yml` → `github.yml` → auto-detect
- **Issue Structure**: 1 main requirement issue + N task sub-issues
  - Main issue: Contains requirement overview, rollup estimate, critical path
  - Sub-issues: Each task becomes a sub-issue (format: `[REQ-xxx][T-xxx] <task title>`)
  - Sub-issues reference main issue with "Relates to #<main_issue>"
  - Main issue updated with task checklist linking all sub-issues
- Returns mapping table of task IDs to sub-issue URLs

**Local Mode:**
- Generates `.sdp/out/REQ-xxx-issues.md` with all issue drafts
- Optionally creates `.sdp/out/REQ-xxx-import.sh` for batch import
- Script automates: main issue creation → sub-issues → checklist update
- No GitHub authentication required
- Supports manual or automated issue creation later

**Error Handling:**
- Clear error messages for missing `gh` CLI or authentication
- Suggests switching to local mode if GitHub is unavailable
- Console output in Japanese language

## Typical Workflow

1. **Initialize context:** `/steering`
2. **Refine requirement:** `/requirement "Add user authentication feature"`
3. **Generate estimates:** `/estimate REQ-001`
4. **Review plan:** `/show-plan REQ-001`
5. **Export to GitHub:** `/export-issues REQ-001`

## Key Configuration Files

- `.claude/config/estimate.yml` - T-shirt sizing, PERT constraints, schedule buffers
- `.claude/config/export.yml` - **Export destination** (GitHub or local), repository settings
- `.claude/config/github.yml` - Default target repository and labels for GitHub Issues
- `.claude/settings.local.json` - Permission allowlist for automated commands
- `.claude/templates/requirement.md` - Requirement document structure (with examples)
- `.claude/templates/tasks.schema.yml` - Task YAML schema definition (with field descriptions)
- `.claude/templates/product.md` - Product context template (Vision, KPIs, User Stories)
- `.claude/templates/tech.md` - Technical context template (Stack, Testing, Risks)
- `.claude/templates/structure.md` - Code structure template (Architecture, Conventions)

## Directory Structure

```
.claude/
  commands/sdp/      # Custom slash commands
  config/            # Configuration files
  templates/         # Document templates
.sdp/                # All SDP outputs (created by commands)
  product.md         # Business context (created by /steering)
  tech.md            # Technical context (created by /steering)
  structure.md       # Code structure (created by /steering)
  requirements/      # Refined requirement specs (created by /requirement)
  tasks/             # Task decompositions (created by /estimate)
  plans/             # Human-readable plans (created by /show-plan)
  out/               # Fallback output for GitHub Issues (if gh CLI unavailable)
```

## Language

- **Command definitions**: Written in English
- **Generated content**: Japanese language (requirements, plans, task descriptions)
- **Console output**: Japanese language (summaries, progress messages)
