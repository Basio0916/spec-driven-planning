# /steering
You are Claude Code operating on this repository. Perform an intelligent "project steering" pass that creates or updates steering documents based on project state.

## Pre-Analysis: Detect Existing Files

Before starting, check which steering documents already exist:

```bash
# Create .sdp directory if it doesn't exist
mkdir -p .sdp

# Check for existing steering documents
[ -f ".sdp/product.md" ] && echo "✅ product.md exists - UPDATE mode" || echo "📝 product.md not found - CREATE mode"
[ -f ".sdp/tech.md" ] && echo "✅ tech.md exists - UPDATE mode" || echo "📝 tech.md not found - CREATE mode"
[ -f ".sdp/structure.md" ] && echo "✅ structure.md exists - UPDATE mode" || echo "📝 structure.md not found - CREATE mode"
```

Also check recent changes if this is an update:
```bash
# If git repository, check commits since last steering update
git log -1 --oneline -- .sdp/product.md .sdp/tech.md .sdp/structure.md 2>/dev/null || echo "First time creation"
git log --oneline $(git log -1 --format=%H -- .sdp/product.md .sdp/tech.md .sdp/structure.md 2>/dev/null)..HEAD --max-count=10 2>/dev/null || echo "No change history"
```

## Goals

Create or update three steering documents in `.sdp/` directory:
- **product.md**: Business goals, user stories, KPIs
- **tech.md**: Stack, services, contracts, constraints, risks
- **structure.md**: Folders, modules, entry points, data flows

## Smart Update Strategy

### For NEW files (CREATE mode):
Generate comprehensive initial content covering all aspects of the project.

### For EXISTING files (UPDATE mode):
1. **Always Read existing file first** - Understand current content
2. **Preserve user customizations** - Maintain manual edits and custom sections
3. **Update factual information only** - Dependencies, file structures, commands
4. **Add new sections only when significant** - Only for major feature additions
5. **Mark deprecation instead of deletion** - Use ~~strikethrough~~ or [DEPRECATED] tags
6. **Maintain existing format** - Respect markdown style choices

## Repository Scanning Steps

### 1. Project Analysis

Use native tools to scan the codebase:

```bash
# Find source files
find . -path ./node_modules -prune -o -path ./.git -prune -o -type f \( -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.go" \) -print

# Find configuration files
find . -maxdepth 3 \( -name "package.json" -o -name "requirements.txt" -o -name "go.mod" -o -name "Cargo.toml" \)

# Find documentation
find . -maxdepth 3 -name "README*" -o -name "CHANGELOG*" -o -name "*.md"
```

Extract information from:
- **Product signals**: README, docs/, package.json, go.mod, etc.
- **Tech/infra**: Dockerfile, docker-compose, Terraform, CI files, Makefile, schema (OpenAPI/GraphQL)
- **Structure**: Directories, domains, entrypoints, major modules

### 2. Generate/Update Each File

Use templates at `.claude/templates/*.md` as the structural guide. Keep sections even if empty.

#### product.md Content (if CREATE mode):
- **Vision**: Product's raison d'être (1-2 sentences)
- **Target Users / JTBD**: User types and problems to solve
- **Core Value / KPIs**: Key metrics and targets (table format)
- **Top User Stories (MVP)**: High-priority user stories
- **Out of Scope (MVP)**: Explicitly out-of-scope items
- **Business Constraints**: License, cost, deadline constraints

#### product.md Updates (if UPDATE mode):
Update only if these changes occurred:
- New features added
- Deprecated/removed features
- Changed use cases or target users
- Updated value propositions

#### tech.md Content (if CREATE mode):
- **Stack & Services**:
  - Backend: Language/Framework
  - Frontend: Framework/Libraries
  - DB: Database type/service
  - Infra: Cloud/CI/CD environment
- **Interfaces/Contracts**: GraphQL/OpenAPI schema, Events/Queues
- **Observability & Quality**:
  - Logging/Tracing/Metrics
  - Testing strategy (unit/integration/e2e)
  - Security baseline
- **Constraints & Risks**: Major technical constraints and risks

#### tech.md Updates (if UPDATE mode):
Check for these changes:
- New dependencies added
- Removed libraries/frameworks
- Major version upgrades
- New development tools or build processes
- Changed environment variables or configuration
- Modified port assignments or service architecture

#### structure.md Content (if CREATE mode):
- **High-level**:
  - Entrypoints: Application entry points
  - Modules / Packages: Major modules/packages
  - Data flow: Data flow and processing patterns
- **Directory Map**: Directory structure and role of each directory

#### structure.md Updates (if UPDATE mode):
Check for these changes:
- New directories or major reorganization
- Changed file organization patterns
- New or modified naming conventions
- Updated architectural patterns or principles
- Refactored code structure or module boundaries

### 3. Write Files

- **Location**: `.sdp/` directory (.sdp/product.md, .sdp/tech.md, .sdp/structure.md)
- **Overwrite**: In UPDATE mode, respect existing content but allow overwrite
- **Template compliance**: Follow `.claude/templates/*.md` structure

### 4. Console Summary

Generate a concise summary in **Japanese**:
```
【Steering更新完了】
✅ product.md: [作成/更新] - <変更概要>
✅ tech.md: [作成/更新] - <変更概要>
✅ structure.md: [作成/更新] - <変更概要>

📚 参照ファイル: <使用したファイルパスのリスト>

💡 次のステップ: /sdp:requirement コマンドで要件定義を開始してください
```

## Important Principles

### Security Guidelines
- **No sensitive data**: Never include API keys, passwords, database credentials, or personal information
- **Review before commit**: Always review content before version control
- **Team sharing consideration**: Steering files are shared with all project collaborators

### Content Quality Guidelines
- **Single domain focus**: Each file should cover one specific area
- **Clear and specific**: Provide concrete examples and rationale, not abstract principles
- **Regular maintenance**: Review after major project changes
- **Actionable guidance**: Write specific, implementable guidelines

### Preservation Strategy (UPDATE mode)
- **User sections**: Preserve sections not in standard template
- **Custom examples**: Maintain user-added examples
- **Comments**: Keep inline comments and notes
- **Formatting preferences**: Respect existing markdown style choices

### Update Philosophy (UPDATE mode)
- **Additive by default**: Add rather than replace
- **Mark deprecation**: Use ~~strikethrough~~ or [DEPRECATED] tags
- **Date significant changes**: Add update timestamps for major changes
- **Explain changes**: Brief notes on why something was updated

## Output Language
Generate all console output in **Japanese**.

## Allowed Tools
Bash, Read, Write, Edit, Glob, Grep only