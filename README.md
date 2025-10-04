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

Use `npx` to initialize SDP in your project:

```bash
npx spec-driven-planning init
```

This will create:
- `.claude/commands/sdp/` - Custom slash commands
- `.sdp/config/` - Configuration files
- `.sdp/templates/` - Document templates
- `.sdp/specs/` - Requirements directory (created on demand)
- `.sdp/out/` - Output directory for exports

### Configuration

1. **Update export settings** in `.sdp/config/export.yml`:
   ```yaml
   destination: github  # or "local"
   github:
     repo: your-org/your-repo
     labels:
       - sdp
       - enhancement
   local:
     out_dir: out
   ```

2. **Adjust estimation parameters** in `.sdp/config/estimate.yml`:
   ```yaml
   default_buffers:
      schedule: 0.15   # 15% buffer
   pert:
      clamp:
         min_h: 1
         max_h: 40
   ```

## Workflow

### 1. Initialize Project Context

Generate project context documents:

```bash
/sdp:steering
```

This creates:
- `.sdp/product.md` - Business goals and KPIs
- `.sdp/tech.md` - Technology stack and constraints
- `.sdp/structure.md` - Code organization

### 2. Define Requirements

Refine a natural-language requirement:

```bash
/sdp:requirement "Add user authentication feature"
```

Creates `.sdp/specs/add-user-authentication/requirement.md` with:
- Feature Overview
- User Stories
- Functional Requirements with acceptance criteria
- Non-Functional Requirements

### 3. Create Design

Generate a detailed design with alternatives:

```bash
/sdp:design add-user-authentication
```

Creates `.sdp/specs/add-user-authentication/design.md` with:
- Design Alternatives (2-4 approaches with pros/cons)
- Comparison Matrix
- Recommended Solution with rationale
- Detailed Design (architecture, data models, APIs)
- Trade-offs & Risks
- Implementation Guidelines

### 4. Generate Task Breakdown

Create task decomposition with PERT estimates:

```bash
/sdp:estimate add-user-authentication
```

Creates `.sdp/specs/add-user-authentication/tasks.yml` with:
- 5-12 tasks with dependencies
- PERT estimates (optimistic, most likely, pessimistic)
- Critical path analysis
- Rollup metrics (expected hours, standard deviation, confidence)

### 5. Visualize Plan

Generate human-readable project plan:

```bash
/sdp:show-plan add-user-authentication
```

Creates `.sdp/specs/add-user-authentication/plan.md` with:
- Overview
- Gantt-like Mermaid diagram
- Risk register (top 3)
- Critical path and buffer recommendations

### 6. Export to GitHub

Export tasks to GitHub Issues:

```bash
/sdp:export-issues add-user-authentication
```

**GitHub Mode** (requires GitHub CLI):
- **Prerequisites**: Install and authenticate [GitHub CLI (`gh`)](https://cli.github.com/)
  ```bash
  # Install GitHub CLI (macOS)
  brew install gh
  
  # Authenticate
  gh auth login
  ```
- Creates 1 main requirement issue
- Creates N task sub-issues
- Sub-issues reference main issue
- Main issue updated with task checklist

**Local Mode** (no GitHub CLI required):
- Generates `.sdp/out/add-user-authentication-issues.md`
- Creates `.sdp/out/add-user-authentication-import.sh` for batch import
- Import script can be run later when `gh` CLI is available

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
| `/sdp:steering` | Generate project context (product, tech, structure) |
| `/sdp:requirement <text-or-path>` | Refine and normalize requirements |
| `/sdp:design <slug>` | Generate detailed design with alternatives and rationale |
| `/sdp:estimate <slug>` | Generate task breakdown with PERT estimates |
| `/sdp:show-plan <slug>` | Create visual project plan with Gantt chart |
| `/sdp:export-issues <slug>` | Export to GitHub Issues or local files |

## Templates

All templates are in `.sdp/templates/`:

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
└── commands/sdp/       # Custom slash commands

.sdp/                   # SDP working directory (gitignored)
├── config/             # Configuration files
│   ├── estimate.yml    # Estimation parameters
│   └── export.yml      # Export destination settings
├── templates/          # Document templates
├── product.md          # Business context
├── tech.md             # Technical context
├── structure.md        # Code structure
├── specs/              # Requirements directory
│   └── <slug>/         # Requirement folder (e.g., add-user-authentication/)
│       ├── requirement.md  # Requirement spec
│       ├── design.md       # Design document
│       ├── tasks.yml       # Task breakdown
│       └── plan.md         # Project plan
└── out/                # Issue drafts and import scripts
```

## Language

- **Command definitions**: English
- **Generated content**: Japanese (requirements, plans, descriptions)
- **Console output**: Japanese

## Requirements

- **Node.js**: 14.0.0 or higher (for `npx` installation)
- **Claude Code**: Required to run custom commands
- **GitHub CLI** (`gh`): Optional, required only for direct GitHub Issues export
  - Install: https://cli.github.com/
  - Not needed if using Local Mode (`.sdp/config/export.yml` with `destination: local`)

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Claude Code Docs**: https://docs.claude.com/claude-code

---

**Made with ❤️ for Claude Code**
