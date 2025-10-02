# Spec-Driven Planning (SDP)

A structured workflow system for transforming natural-language requirements into refined specifications, task decompositions, estimates, and GitHub Issues using Claude Code custom commands.

## Features

- 📋 **Requirement Refinement**: Transform natural language into structured specifications
- 📊 **PERT Estimation**: Generate accurate task breakdowns with PERT-based estimates
- 🗺️ **Visual Planning**: Create Gantt charts and critical path analysis
- 🔗 **GitHub Integration**: Export tasks to GitHub Issues with sub-issue structure
- 🏗️ **Smart Context**: Auto-generate project context (product, tech, structure)

## Quick Start

### Installation

Use `npx` to scaffold the SDP structure in your project:

```bash
npx create-spec-driven-planning
```

This will create:
- `.claude/` - Custom commands, configs, and templates
- `.sdp/` - Output directory for generated documents
- `CLAUDE.md` - Guidance for Claude Code

### Configuration

1. **Update repository settings** in `.claude/config/export.yml`:
   ```yaml
   to: github  # or "local"
   github:
     repo: your-org/your-repo
   ```

2. **Configure default labels** in `.claude/config/github.yml`:
   ```yaml
   default_repo: your-org/your-repo
   labels:
     - Tasks
     - AutoGen
   ```

3. **Adjust estimation parameters** in `.claude/config/estimate.yml`:
   ```yaml
   tshirt_hours:
     S: 3
     M: 6
     L: 12
     XL: 24
   ```

## Workflow

### 1. Initialize Project Context

Generate project context documents:

```bash
/steering
```

This creates:
- `.sdp/product.md` - Business goals and KPIs
- `.sdp/tech.md` - Technology stack and constraints
- `.sdp/structure.md` - Code organization

### 2. Define Requirements

Refine a natural-language requirement:

```bash
/requirement "Add user authentication feature"
```

Creates `.sdp/requirements/REQ-001.md` with:
- Goal
- Done Criteria
- Acceptance Scenarios (Gherkin)
- Dependencies
- Non-Functional Requirements
- Risks

### 3. Generate Task Breakdown

Create task decomposition with PERT estimates:

```bash
/estimate REQ-001
```

Creates `.sdp/tasks/REQ-001.yml` with:
- 5-12 tasks with dependencies
- PERT estimates (optimistic, most likely, pessimistic)
- Critical path analysis
- Rollup metrics (expected hours, standard deviation, confidence)

### 4. Visualize Plan

Generate human-readable project plan:

```bash
/show-plan REQ-001
```

Creates `.sdp/plans/REQ-001.md` with:
- Overview
- Gantt-like Mermaid diagram
- Risk register (top 3)
- Critical path and buffer recommendations

### 5. Export to GitHub

Export tasks to GitHub Issues:

```bash
/export-issues REQ-001
```

**GitHub Mode** (requires `gh` CLI):
- Creates 1 main requirement issue
- Creates N task sub-issues
- Sub-issues reference main issue
- Main issue updated with task checklist

**Local Mode** (no GitHub required):
- Generates `.sdp/out/REQ-001-issues.md`
- Creates `.sdp/out/REQ-001-import.sh` for batch import

## Issue Structure

When exporting to GitHub, SDP creates a hierarchical structure:

```
📌 Main Issue: [REQ-001] User Authentication Feature
   ├─ 🎫 Sub-Issue: [REQ-001][T-001] Setup authentication module
   ├─ 🎫 Sub-Issue: [REQ-001][T-002] Implement JWT token service
   ├─ 🎫 Sub-Issue: [REQ-001][T-003] Create login/logout endpoints
   └─ 🎫 Sub-Issue: [REQ-001][T-004] Add authentication tests
```

Each sub-issue includes:
- Parent issue reference
- Description and deliverables
- Definition of Done (checklist)
- Dependencies
- PERT estimate
- Risk notes

## Custom Commands

All commands are located in `.claude/commands/sdp/`:

| Command | Description |
|---------|-------------|
| `/steering` | Generate project context (product, tech, structure) |
| `/requirement <text-or-path>` | Refine and normalize requirements |
| `/estimate <REQ-ID>` | Generate task breakdown with PERT estimates |
| `/show-plan <REQ-ID>` | Create visual project plan with Gantt chart |
| `/export-issues <REQ-ID>` | Export to GitHub Issues or local files |

## Templates

All templates are in `.claude/templates/`:

- `product.md` - Product overview template
- `tech.md` - Technical stack template
- `structure.md` - Code structure template
- `requirement.md` - Requirement specification template
- `tasks.schema.yml` - Task YAML schema

Each template includes detailed examples and guidance.

## Directory Structure

```
.claude/
├── commands/sdp/       # Custom slash commands
├── config/             # Configuration files
│   ├── estimate.yml    # Estimation parameters
│   ├── export.yml      # Export destination settings
│   └── github.yml      # GitHub integration config
└── templates/          # Document templates

.sdp/                   # Output directory (gitignored)
├── product.md          # Business context
├── tech.md             # Technical context
├── structure.md        # Code structure
├── requirements/       # Refined requirements (REQ-xxx.md)
├── tasks/              # Task breakdowns (REQ-xxx.yml)
├── plans/              # Project plans (REQ-xxx.md)
└── out/                # Issue drafts and import scripts
```

## Language

- **Command definitions**: English
- **Generated content**: Japanese (requirements, plans, descriptions)
- **Console output**: Japanese

## Requirements

- **Node.js**: 14.0.0 or higher (for `npx` installation)
- **Claude Code**: Required to run custom commands
- **GitHub CLI** (`gh`): Optional, only needed for GitHub Mode export

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

- **Documentation**: See `CLAUDE.md` for detailed usage
- **Issues**: Report bugs or request features via GitHub Issues
- **Claude Code Docs**: https://docs.claude.com/claude-code

---

**Made with ❤️ for Claude Code**
