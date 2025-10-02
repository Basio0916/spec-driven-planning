# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Spec-Driven Planning** repository that implements a structured workflow for transforming natural-language requirements into refined specifications, task decompositions, estimates, and GitHub Issues. The workflow is entirely orchestrated through Claude Code custom slash commands.

## Custom Slash Commands

This repository provides five custom slash commands in `.claude/commands/sdp/`:

### `/steering`
Performs initial project context extraction and generates three foundational documents at the repository root:
- `product.md` - Business goals, user stories, and KPIs
- `tech.md` - Technology stack, services, contracts, and constraints
- `structure.md` - Directory structure, modules, and data flows

Run this command first when setting up a new project or after major architecture changes.

### `/requirement <text-or-path>`
Refines a natural-language requirement (or reads from a file path) and creates/updates a normalized requirement document at `./requirements/REQ-xxx.md`.

**Behavior:**
- Assigns sequential REQ-IDs (REQ-001, REQ-002, etc.)
- Enforces the template structure from `.claude/templates/requirement.md`
- Aligns with `product.md`, `tech.md`, and `structure.md` context
- Includes Done Criteria, Acceptance Scenarios (Gherkin-style), NFRs, Risks, Dependencies
- Outputs in Japanese language
- Returns only: `REQ-ID: REQ-xxx`

### `/estimate <REQ-ID>`
Generates a task breakdown and PERT-based estimates for a given requirement.

**Behavior:**
- Reads `./requirements/REQ-xxx.md`
- Produces `./tasks/REQ-xxx.yml` following `.claude/templates/tasks.schema.yml`
- Decomposes into 5–12 tasks with dependencies, labels, deliverables, DoD, and PERT estimates (optimistic, most_likely, pessimistic)
- Uses estimation config from `.claude/config/estimate.yml`
- Calculates critical path, expected hours, and standard deviation
- Outputs a compact task table to console
- Outputs in Japanese language

### `/show-plan <REQ-ID>`
Converts a task file into a human-readable project plan at `./plans/REQ-xxx.md`.

**Behavior:**
- Reads `./tasks/REQ-xxx.yml`
- Generates: overview, Gantt-like Mermaid diagram, risk register (top 3), critical path, buffer recommendation
- Outputs in Japanese language

### `/export-issues <REQ-ID>`
Exports tasks from `./tasks/REQ-xxx.yml` to GitHub Issues using the `gh` CLI.

**Behavior:**
- Reads configuration from `.claude/config/github.yml` (defines `default_repo` and default labels)
- For each task, creates an issue with:
  - Title: `[REQ-xxx] <task title>`
  - Body: Description, Deliverables, DoD, Risks, Depends_on, Estimate
  - Labels: union of config labels + `["REQ-xxx"]` + task labels
- Creates a parent tracking issue with checklist, critical path, and rollup estimate
- Falls back to writing `./out/REQ-xxx-issues.md` if `gh` CLI is unavailable
- Outputs in Japanese language

## Typical Workflow

1. **Initialize context:** `/steering`
2. **Refine requirement:** `/requirement "Add user authentication feature"`
3. **Generate estimates:** `/estimate REQ-001`
4. **Review plan:** `/show-plan REQ-001`
5. **Export to GitHub:** `/export-issues REQ-001`

## Key Configuration Files

- `.claude/config/estimate.yml` - T-shirt sizing, PERT constraints, schedule buffers
- `.claude/config/github.yml` - Default target repository and labels for GitHub Issues
- `.claude/settings.local.json` - Permission allowlist for automated commands
- `.claude/templates/requirement.md` - Requirement document structure
- `.claude/templates/tasks.schema.yml` - Task YAML schema definition
- `.claude/templates/product.md` - Product context template
- `.claude/templates/tech.md` - Technical context template
- `.claude/templates/structure.md` - Code structure template

## Directory Structure

```
.claude/
  commands/sdp/      # Custom slash commands
  config/            # Configuration files
  templates/         # Document templates
requirements/        # Refined requirement specs (created by /requirement)
tasks/               # Task decompositions (created by /estimate)
plans/               # Human-readable plans (created by /show-plan)
out/                 # Fallback output for GitHub Issues (if gh CLI unavailable)
```

## Language

All generated documentation and outputs are in **Japanese language** by default, as specified in the command definitions.
