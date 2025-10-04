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

Creates `.sdp/add-user-authentication/requirement.md` with:
- 機能概要 (Feature Overview)
- ユーザーストーリー (User Stories)
- 機能要件 (Functional Requirements with acceptance criteria)
- 非機能要件 (Non-Functional Requirements)

### 3. Create Design

Generate a detailed design with alternatives:

```bash
/design add-user-authentication
```

Creates `.sdp/add-user-authentication/design.md` with:
- Design Alternatives (2-4 approaches with pros/cons)
- Comparison Matrix
- Recommended Solution with rationale
- Detailed Design (architecture, data models, APIs)
- Trade-offs & Risks
- Implementation Guidelines

### 4. Generate Task Breakdown

Create task decomposition with PERT estimates:

```bash
/estimate add-user-authentication
```

Creates `.sdp/add-user-authentication/tasks.yml` with:
- 5-12 tasks with dependencies
- PERT estimates (optimistic, most likely, pessimistic)
- Critical path analysis
- Rollup metrics (expected hours, standard deviation, confidence)

### 5. Visualize Plan

Generate human-readable project plan:

```bash
/show-plan add-user-authentication
```

Creates `.sdp/add-user-authentication/plan.md` with:
- Overview
- Gantt-like Mermaid diagram
- Risk register (top 3)
- Critical path and buffer recommendations

### 6. Export to GitHub

Export tasks to GitHub Issues:

```bash
/export-issues add-user-authentication
```

**GitHub Mode** (requires `gh` CLI):
- Creates 1 main requirement issue
- Creates N task sub-issues
- Sub-issues reference main issue
- Main issue updated with task checklist

**Local Mode** (no GitHub required):
- Generates `.sdp/out/add-user-authentication-issues.md`
- Creates `.sdp/out/add-user-authentication-import.sh` for batch import

## Issue Structure

When exporting to GitHub, SDP creates a hierarchical structure:

```
📌 Main Issue: [add-user-authentication] User Authentication Feature
   ├─ 🎫 Sub-Issue: [add-user-authentication][T-001] Setup authentication module
   ├─ 🎫 Sub-Issue: [add-user-authentication][T-002] Implement JWT token service
   ├─ 🎫 Sub-Issue: [add-user-authentication][T-003] Create login/logout endpoints
   └─ 🎫 Sub-Issue: [add-user-authentication][T-004] Add authentication tests
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
| `/design <slug>` | Generate detailed design with alternatives and rationale |
| `/estimate <slug>` | Generate task breakdown with PERT estimates |
| `/show-plan <slug>` | Create visual project plan with Gantt chart |
| `/export-issues <slug>` | Export to GitHub Issues or local files |

## Templates

All templates are in `.claude/templates/`:

- `product.md` - Product overview template
- `tech.md` - Technical stack template
- `structure.md` - Code structure template
- `requirement.md` - Requirement specification template
- `design.md` - Design document template
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
├── <slug>/             # Requirement folder (e.g., add-user-authentication/)
│   ├── requirement.md  # Requirement spec
│   ├── design.md       # Design document
│   ├── tasks.yml       # Task breakdown
│   └── plan.md         # Project plan
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
