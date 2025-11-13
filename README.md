# Spec-Driven Planning (SDP)

[日本語版はこちら / Japanese version](./README.ja.md)

A structured workflow system for transforming natural-language requirements into refined specifications, task decompositions, estimates, and GitHub Issues using Claude Code custom commands.

## Features

- 📋 **Requirement Refinement**: Transform natural language into structured specifications
- 📊 **PERT Estimation**: Generate accurate task breakdowns with PERT-based estimates
- 🗺️ **Visual Planning**: Create Gantt charts and critical path analysis
- 🔗 **Multi-Platform Integration**: Export tasks to GitHub Issues, Jira, Backlog, or local files
- 🏗️ **Smart Context**: Auto-generate project context (product, tech, structure)

## Quick Start

### Installation

Use `npx` to initialize SDP in your project:

```bash
# Initialize for Claude Code (default)
npx spec-driven-planning init

# Initialize for GitHub Copilot
npx spec-driven-planning init --github-copilot

# Initialize for Windsurf
npx spec-driven-planning init --windsurf

# Initialize for Codex
npx spec-driven-planning init --codex

# Initialize with Japanese
npx spec-driven-planning init --lang ja

# Initialize for GitHub Copilot with Japanese
npx spec-driven-planning init --github-copilot --lang ja
```

This will create:
- `.claude/commands/sdp/` - Custom slash commands (Claude Code)
- `.github/prompts/` - Prompt files (GitHub Copilot)
- `.windsurf/workflows/` - Workflow files (Windsurf)
- `.codex/prompts/` - Prompt files (Codex)
- `.sdp/config/` - Configuration files (including language settings)
- `.sdp/templates/en/` - English document templates
- `.sdp/templates/ja/` - Japanese document templates
- `.sdp/specs/` - Requirements directory (created on demand)
- `.sdp/out/` - Output directory for exports

### Configuration

#### Language Settings

Set the output language in `.sdp/config/language.yml`:

```yaml
# Supported languages: en (English), ja (Japanese)
language: en  # or ja
```

All generated documents (requirement.md, design.md, plan.md, etc.) will be created in the specified language.

#### Export Settings

**Update export settings** in `.sdp/config/export.yml`:
   ```yaml
   destination: github  # "github", "jira", "backlog", or "local"
   github:
     repo: your-org/your-repo
     issue_mode: sub_issues  # sub_issues, linked_issues, or single_issue
     labels:
       - sdp
       - enhancement
   jira:
     url: https://your-domain.atlassian.net
     project: PROJ
     email: your-email@example.com
     issue_mode: sub_tasks
   backlog:
     space_key: myspace
     domain: backlog.com
     project_key: PROJ
     issue_mode: sub_tasks
   local:
     out_dir: out
   ```

#### Estimation Settings

**Adjust estimation parameters** in `.sdp/config/estimate.yml`:
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

### 3. Pre-Design (Evaluate Design Options)

Compare design options (lightweight, 200-400 lines):

```bash
/sdp:pre-design add-user-authentication
```

Creates `.sdp/specs/add-user-authentication/pre-design.md` with:
- Design Alternatives (2-4 approaches with pros/cons)
- Comparison Matrix
- Recommended Solution with rationale
- Key Trade-offs

**Benefits**: Make direction decisions with lightweight comparisons instead of 1000+ line documents.

### 4. Design (Create Detailed Design)

Elaborate the selected option to implementation-ready level (500-800 lines):

```bash
# To proceed with recommended option
/sdp:design add-user-authentication

# To select a different option (e.g., Option 2)
/sdp:design add-user-authentication 2
```

Creates `.sdp/specs/add-user-authentication/design.md` with:
- Selected design summary
- Detailed Design (architecture, data models, APIs)
- Security Measures
- Performance Optimization
- Trade-offs & Risks
- Implementation Guidelines
- File structure and implementation order

**Benefits**: Detail only the selected approach, avoiding unnecessary design work.

**About /sdp:design-legacy command**: For backward compatibility, the `/sdp:design-legacy` command is still available (performs pre-design and detailed design in one step). However, the new two-stage flow (pre-design → design) is recommended for iterative design.

### 5. Generate Task Breakdown

Create task decomposition with PERT estimates:

```bash
/sdp:estimate add-user-authentication
```

Creates `.sdp/specs/add-user-authentication/tasks.yml` with:
- 5-12 tasks with dependencies
- PERT estimates (optimistic, most likely, pessimistic)
- Critical path analysis
- Rollup metrics (expected hours, standard deviation, confidence)

### 6. Visualize Plan

Generate human-readable project plan:

```bash
/sdp:show-plan add-user-authentication
```

Creates `.sdp/specs/add-user-authentication/plan.md` with:
- Overview
- Gantt-like Mermaid diagram
- Risk register (top 3)
- Critical path and buffer recommendations

### 7. Export to Issue Trackers

Export tasks to your preferred issue tracker:

```bash
/sdp:export-issues add-user-authentication
```

SDP supports multiple export destinations (configured in `.sdp/config/export.yml`):

#### GitHub Mode (requires GitHub CLI)

- **Prerequisites**: Install and authenticate [GitHub CLI (`gh`)](https://cli.github.com/)
  ```bash
  # Install GitHub CLI (macOS)
  brew install gh
  
  # Authenticate
  gh auth login
  
  # Optional: Install sub-issue extension for sub_issues mode
  gh extension install yahsan2/gh-sub-issue
  ```
- Creates 1 main requirement issue
- Creates N task sub-issues (with `sub_issues` or `linked_issues` mode)
- Main issue includes task checklist

#### Jira Mode (REST API)

- **Prerequisites**: 
  - Jira API token from [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
  - Set environment variable: `export JIRA_API_TOKEN=your-token`
- Creates issues with Atlassian Document Format (ADF)
- Supports sub-tasks and linked issues
- Native parent-child relationships

#### Backlog Mode (REST API)

- **Prerequisites**:
  - Backlog API key from 個人設定 > API > 登録
  - Set environment variable: `export BACKLOG_API_KEY=your-key`
- Creates issues with Markdown formatting
- Supports sub-tasks and linked issues
- Native parent-child relationships

#### Local Mode (no external tools required)

- Generates `.sdp/out/add-user-authentication-issues.md`
- Creates `.sdp/out/add-user-authentication-import.sh` (Bash script for macOS/Linux/Git Bash)
- Creates `.sdp/out/add-user-authentication-import.ps1` (PowerShell script for Windows)
- Import scripts can be run later when tools are available

### 7. Optional: Execute Implementation

Once plans and issues are finalized, you can optionally execute the implementation:

```bash
/sdp:implement add-user-authentication
```

- Without additional arguments, all tasks defined in `tasks.yml` are executed sequentially.
- Provide one or more task IDs to scope execution (e.g., `/sdp:implement add-user-authentication T-002 T-004`).

Creates or updates `.sdp/specs/add-user-authentication/implementation.md` while applying the required code changes and recording test evidence.

## Issue Structure

When exporting to issue trackers, SDP creates a hierarchical structure:

```
📌 Main Issue: [add-user-authentication] User Authentication Feature
   ├─ 🎫 Sub-Issue: [T-001] Setup authentication module
   ├─ 🎫 Sub-Issue: [T-002] Implement JWT token service
   ├─ 🎫 Sub-Issue: [T-003] Create login/logout endpoints
   └─ 🎫 Sub-Issue: [T-004] Add authentication tests
```

### Issue Modes

SDP supports three issue organization modes:

1. **Sub-Issues / Sub-Tasks Mode** (`sub_issues` / `sub_tasks`)
   - Native parent-child relationships
   - Automatic task checklist in parent issue
   - Best for: GitHub (with extension), Jira, Backlog

2. **Linked Issues Mode** (`linked_issues`)
   - Separate issues with references
   - Manual task checklist with links
   - Best for: GitHub (without extension), cross-project tasks

3. **Single Issue Mode** (`single_issue`)
   - One comprehensive issue with all tasks as checkboxes
   - Simplest approach
   - Best for: Small features, quick prototypes

### Issue Content

Each sub-issue includes:
- Parent issue reference
- Description and deliverables
- Definition of Done (checklist)
- Dependencies
- PERT estimate (optimistic / most likely / pessimistic)
- Risk notes

## Custom Commands

All commands are located in `.claude/commands/sdp/`:

| Command | Description |
|---------|-------------|
| `/sdp:steering` | Generate project context (product, tech, structure) |
| `/sdp:requirement <text-or-path>` | Refine and normalize requirements |
| `/sdp:pre-design <slug>` | Generate lightweight pre-design (2-4 design options) |
| `/sdp:design <slug> [option-num]` | Generate detailed design from selected option |
| `/sdp:design-legacy <slug>` | (Legacy) Generate pre-design and design in one step |
| `/sdp:estimate <slug>` | Generate task breakdown with PERT estimates |
| `/sdp:show-plan <slug>` | Create visual project plan with Gantt chart |
| `/sdp:export-issues <slug>` | Export to GitHub Issues, Jira, Backlog, or local files |
| `/sdp:implement <slug> [task-id ...]` | (Optional) Execute implementation tasks and capture logs |

## Templates

All templates are in `.sdp/templates/`:

- `product.md` - Product overview template
- `tech.md` - Technical stack template
- `structure.md` - Code structure template
- `requirement.md` - Requirement specification template
- `design.md` - Design document template
- `implementation.md` - Implementation log template
- `tasks.schema.yml` - Task YAML schema

Each template includes detailed examples and guidance.

## Directory Structure

```
.claude/
└── commands/sdp/       # Custom slash commands (Claude Code)

.github/
└── prompts/            # Prompt files (GitHub Copilot)

.windsurf/
└── workflows/          # Workflow files (Windsurf)

.codex/
└── prompts/            # Prompt files (Codex)

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
│       ├── implementation.md # Implementation log and test evidence
│       └── plan.md         # Project plan
└── out/                # Issue drafts and import scripts
```

## Language Support

SDP supports multiple languages for generated content:

- **Supported Languages**: English (en), Japanese (ja)
- **Configuration**: Set in `.sdp/config/language.yml`
- **Default**: English
- **Command definitions**: English (always)
- **Generated content**: Based on language configuration (requirements, plans, descriptions)
- **Console output**: Based on language configuration

### Changing Language

To change the output language after initialization, edit `.sdp/config/language.yml`:

```yaml
language: ja  # Change to 'en' for English or 'ja' for Japanese
```

All subsequent commands will generate content in the specified language.

## Multi-Platform Support

SDP supports multiple AI coding assistants! Use the platform-specific flag during initialization.

### Supported Platforms

#### Claude Code (Default)
```bash
npx spec-driven-planning init
```
Custom slash commands in `.claude/commands/sdp/`

#### GitHub Copilot
```bash
npx spec-driven-planning init --github-copilot
```

Setup steps:
1. Enable prompt files in VS Code Settings (Cmd+, or Ctrl+,)
2. Search for `chat.promptFiles` and enable it
3. Reload VS Code to activate the prompt files

Prompt files in `.github/prompts/`

#### Windsurf
```bash
npx spec-driven-planning init --windsurf
```

Setup steps:
1. Restart Windsurf to activate workflow files
2. Access workflows via the Windsurf Cascade interface

Workflow files in `.windsurf/workflows/`

#### Codex
```bash
npx spec-driven-planning init --codex
```

Setup steps:
1. Restart Codex to activate prompt files
2. Access prompts via the Codex interface

Prompt files in `.codex/prompts/`

### Command Differences

| Claude Code | GitHub Copilot / Windsurf / Codex | Description |
|------------|-----------------------------------|-------------|
| `/sdp:steering` | `/sdp-steering` | Generate project context |
| `/sdp:requirement` | `/sdp-requirement` | Refine requirement specification |
| `/sdp:pre-design` | `/sdp-pre-design` | Generate pre-design |
| `/sdp:design` | `/sdp-design` | Generate detailed design |
| `/sdp:design-legacy` | `/sdp-design-legacy` | (Legacy) Pre-design and design in one step |
| `/sdp:estimate` | `/sdp-estimate` | Generate task breakdown |
| `/sdp:show-plan` | `/sdp-show-plan` | Create visual project plan |
| `/sdp:implement` | `/sdp-implement` | Execute implementation tasks |
| `/sdp:export-issues` | `/sdp-export-issues` | Export to issue trackers |

### Using Prompt Files

In GitHub Copilot / Windsurf / Codex:
1. Type `/` followed by the command name
2. Add arguments as needed (e.g., `/sdp-requirement Add user authentication`)
3. Press Enter to execute

All platforms generate the same structured outputs!

## Requirements

- **Node.js**: 14.0.0 or higher (for `npx` installation)
- **AI Assistant**: One of the following:
  - **Claude Code**: For `.claude/commands/sdp/` custom commands
  - **GitHub Copilot**: For `.github/prompts/` prompt files (requires VS Code with `chat.promptFiles` setting enabled)
  - **Windsurf**: For `.windsurf/workflows/` workflow files
  - **Codex**: For `.codex/prompts/` prompt files

### Optional (for issue export)

- **GitHub CLI** (`gh`): For GitHub Issues export
  - Install: https://cli.github.com/
  - Not needed if using Jira, Backlog, or Local Mode
  
- **Jira API Token**: For Jira Issues export
  - Create at: https://id.atlassian.com/manage-profile/security/api-tokens
  - Set as environment variable: `JIRA_API_TOKEN`
  
- **Backlog API Key**: For Backlog Issues export
  - Create at: 個人設定 > API > 登録
  - Set as environment variable: `BACKLOG_API_KEY`

## Platform Support

SDP works on all major platforms:
- ✅ **Windows**: Full support (PowerShell scripts included)
- ✅ **macOS**: Full support (Bash scripts)
- ✅ **Linux**: Full support (Bash scripts)

All commands use Claude Code's native file operations instead of platform-specific shell commands, ensuring consistent behavior across all platforms.

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Claude Code Docs**: https://docs.claude.com/claude-code

---

**Made with ❤️ for Claude Code**
