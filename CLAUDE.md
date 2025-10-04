# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Spec-Driven Planning (SDP)** repository that implements a structured workflow for transforming natural-language requirements into refined specifications, task decompositions, estimates, and GitHub Issues. The workflow is entirely orchestrated through Claude Code custom slash commands.

## Installation

Users can scaffold this structure in their project using:

```bash
npx create-spec-driven-planning
```

This creates `.claude/`, `.sdp/`, and `CLAUDE.md` in the target directory.

## Custom Slash Commands

This repository provides six custom slash commands in `.claude/commands/sdp/`. All commands output files to the `.sdp/` directory and provide console output in Japanese.

**Design Philosophy:** The workflow separates requirements (WHAT) from design (HOW) to enable user review and iteration at each stage.

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
Refines a natural-language requirement (or reads from a file path) and creates/updates a normalized requirement document at `.sdp/<slug>/requirement.md`.

**Behavior:**
- Generates a slug from the requirement text (e.g., "add-user-authentication") instead of sequential IDs
- Creates a dedicated folder `.sdp/<slug>/` for the requirement
- Enforces the template structure from `.claude/templates/requirement.md`
- Aligns with `.sdp/product.md`, `.sdp/tech.md`, and `.sdp/structure.md` context
- **Focuses on business requirements only** (WHAT needs to be done, not HOW)
- Includes 機能概要 (Feature Overview), ユーザーストーリー (User Stories), 機能要件 (Functional Requirements with acceptance criteria), and 非機能要件 (Non-Functional Requirements)
- Content output in Japanese language
- **User can review and request changes in natural language**
- Prompts user to run `/sdp:design <slug>` next

### `/design <slug>`
Generates a detailed design document with decision rationale for a given requirement.

**Behavior:**
- Reads `.sdp/<slug>/requirement.md`
- **Proposes 2-4 alternative design approaches** with pros/cons
- Creates comparison matrix (effort, maintainability, performance, scalability, etc.)
- **Recommends one solution with clear rationale** explaining trade-offs
- Includes detailed architecture, data models, API design, and implementation guidelines
- **Explains WHY the recommended design was chosen** over alternatives
- Output: `.sdp/<slug>/design.md` following `.claude/templates/design.md`
- Content output in Japanese language
- **User can review and request changes in natural language**
- Prompts user to run `/sdp:estimate <slug>` next (after design approval)

### `/estimate <slug>`
Generates a task breakdown and PERT-based estimates for a given requirement.

**Behavior:**
- Reads `.sdp/<slug>/requirement.md`
- **Reads `.sdp/<slug>/design.md` if exists** (primary source for task decomposition)
- Produces `.sdp/<slug>/tasks.yml` following `.claude/templates/tasks.schema.yml`
- Decomposes into 5–12 tasks with dependencies, labels, deliverables, DoD, and PERT estimates (optimistic, most_likely, pessimistic)
- Uses estimation config from `.claude/config/estimate.yml`
- Calculates critical path, expected hours, and standard deviation
- Outputs a compact task table to console in Japanese
- Prompts user to run `/sdp:show-plan <slug>` next

### `/show-plan <slug>`
Converts a task file into a human-readable project plan at `.sdp/<slug>/plan.md`.

**Behavior:**
- Reads `.sdp/<slug>/tasks.yml`
- Generates: overview, Gantt-like Mermaid diagram, risk register (top 3), critical path, buffer recommendation
- Content output in Japanese language
- Prompts user to run `/sdp:export-issues <slug>` next

### `/export-issues <slug>`
Exports tasks from `.sdp/<slug>/tasks.yml` to GitHub Issues or local files based on configuration.

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
  - Sub-issues: Each task becomes a sub-issue (format: `[<slug>][T-xxx] <task title>`)
  - Sub-issues reference main issue with "Relates to #<main_issue>"
  - Main issue updated with task checklist linking all sub-issues
- Returns mapping table of task IDs to sub-issue URLs

**Local Mode:**
- Generates `.sdp/out/<slug>-issues.md` with all issue drafts
- Optionally creates `.sdp/out/<slug>-import.sh` for batch import
- Script automates: main issue creation → sub-issues → checklist update
- No GitHub authentication required
- Supports manual or automated issue creation later

**Error Handling:**
- Clear error messages for missing `gh` CLI or authentication
- Suggests switching to local mode if GitHub is unavailable
- Console output in Japanese language

## Typical Workflow

1. **Initialize context:** `/steering`
2. **Define requirement:** `/requirement "Add user authentication feature"`
   - Review output, request changes if needed in natural language
   - Creates `.sdp/add-user-authentication/requirement.md`
3. **Create design:** `/design add-user-authentication`
   - Review alternatives and rationale, request changes if needed
4. **Generate estimates:** `/estimate add-user-authentication`
5. **Review plan:** `/show-plan add-user-authentication`
6. **Export to GitHub:** `/export-issues add-user-authentication`

**Key Benefits:**
- **Separation of concerns:** Requirements (WHAT) vs Design (HOW)
- **User control:** Review and iterate at each stage before proceeding
- **Decision transparency:** Understand WHY each design choice was made
- **Alternative awareness:** Know what other options were considered

## Key Configuration Files

- `.claude/config/estimate.yml` - T-shirt sizing, PERT constraints, schedule buffers
- `.claude/config/export.yml` - **Export destination** (GitHub or local), repository settings
- `.claude/config/github.yml` - Default target repository and labels for GitHub Issues
- `.claude/settings.local.json` - Permission allowlist for automated commands
- `.claude/templates/requirement.md` - Requirement document structure (business-focused, with examples)
- `.claude/templates/design.md` - Design document structure (alternatives, comparison, rationale)
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
  <slug>/            # Requirement folder (e.g., add-user-authentication/)
    requirement.md   # Requirement spec (created by /requirement)
    design.md        # Design document (created by /design)
    tasks.yml        # Task breakdown (created by /estimate)
    plan.md          # Project plan (created by /show-plan)
  out/               # Fallback output for GitHub Issues (if gh CLI unavailable)
```

## Language

- **Command definitions**: Written in English
- **Generated content**: Japanese language (requirements, plans, task descriptions)
- **Console output**: Japanese language (summaries, progress messages)
