# Code Structure

## High-level

<システム全体の構造を俯瞰>

### Entrypoints
<アプリケーションの起動ポイント>

例：
- **Backend**: `backend/cmd/server/main.go` - GraphQL server entry point
- **Frontend**: `frontend/pages/index.vue` - Nuxt 3 application root
- **CLI**: `.claude/commands/sdp/*` - Claude Code custom commands
- **Worker**: `backend/cmd/worker/main.go` - Background job processor (if any)

### Modules / Packages
<主要なモジュール・パッケージとその責務>

例：
#### Backend (Go)
- `graph/` - GraphQL schema and resolvers
  - `schema.graphqls` - GraphQL type definitions
  - `resolver.go` - Main resolver implementation
  - `model/` - Generated GraphQL models
- `internal/` - Private application code
  - `requirement/` - Requirement domain logic
  - `estimation/` - PERT estimation engine
  - `github/` - GitHub API integration
  - `repository/` - Data access layer
- `pkg/` - Public reusable packages
  - `logger/` - Structured logging utilities
  - `validator/` - Input validation helpers

#### Frontend (Vue/Nuxt)
- `pages/` - File-based routing (Nuxt convention)
  - `index.vue` - Home page
  - `requirements/` - Requirement management pages
  - `tasks/` - Task breakdown pages
- `components/` - Reusable Vue components
  - `RequirementForm.vue`
  - `TaskTable.vue`
  - `MermaidGantt.vue`
- `composables/` - Vue Composition API utilities
  - `useRequirement.ts` - Requirement CRUD operations
  - `useEstimation.ts` - Task estimation logic
- `stores/` - Pinia state management
  - `requirement.ts` - Requirement store
  - `auth.ts` - Authentication store

#### SDP (Spec-Driven Planning)
- `.claude/commands/sdp/` - Custom slash commands
  - `steering.md` - Project context generation
  - `requirement.md` - Requirement refinement
  - `estimate.md` - Task estimation
  - `show-plan.md` - Plan visualization
  - `export-issues.md` - GitHub Issues export
- `.claude/templates/` - Document templates
- `.claude/config/` - Configuration files

### Data Flow
<データがシステム内をどのように流れるか>

例：
```
1. Requirement Definition Flow:
   User Input (natural language)
   → /sdp:requirement command
   → Claude API (refinement)
   → .sdp/<slug>/requirement.md

2. Estimation Flow:
   Requirement (<slug>/requirement.md)
   → /sdp:estimate command
   → PERT calculation engine
   → .sdp/<slug>/tasks.yml

3. Export Flow:
   Tasks (<slug>/tasks.yml)
   → /sdp:export-issues command
   → GitHub API (gh CLI)
   → GitHub Issues

4. Web Application Flow (if any):
   Browser
   → Nuxt Frontend (SSR/CSR)
   → GraphQL API (backend)
   → MySQL Database
   → Response to browser
```

### Architectural Patterns
<採用しているアーキテクチャパターン>

例：
- **Backend**: Layered Architecture (Handler → Service → Repository)
- **Frontend**: Component-based architecture with Composition API
- **State Management**: Centralized store pattern (Pinia)
- **API Design**: GraphQL with schema-first approach
- **Error Handling**: Centralized error middleware + custom error types
- **Dependency Injection**: Interface-based DI in Go

## Directory Map

<ディレクトリ構造と各ディレクトリの役割>

```
.
├── .claude/                    # Claude Code configuration
│   ├── commands/sdp/           # Custom slash commands
│   │   ├── steering.md         # Context generation command
│   │   ├── requirement.md      # Requirement refinement command
│   │   ├── estimate.md         # Task estimation command
│   │   ├── show-plan.md        # Plan visualization command
│   │   └── export-issues.md    # GitHub export command
│   ├── config/                 # Configuration files
│   │   ├── estimate.yml        # Estimation parameters
│   │   └── github.yml          # GitHub integration config
│   └── templates/              # Document templates
│       ├── product.md          # Product overview template
│       ├── tech.md             # Tech stack template
│       ├── structure.md        # Code structure template
│       ├── requirement.md      # Requirement template
│       └── tasks.schema.yml    # Task YAML schema
│
├── .sdp/                       # Spec-Driven Planning outputs
│   ├── product.md              # Business context (from /steering)
│   ├── tech.md                 # Technical context (from /steering)
│   ├── structure.md            # Code structure (from /steering)
│   ├── <slug>/                 # Requirement folder (e.g., add-user-auth/)
│   │   ├── requirement.md      # Requirement spec
│   │   ├── design.md           # Design document
│   │   ├── tasks.yml           # Task breakdown
│   │   └── plan.md             # Project plan
│   └── out/                    # Fallback outputs
│       └── <slug>-issues.md    # Issue drafts (if gh unavailable)
│
├── backend/                    # Backend application (if any)
│   ├── cmd/                    # Executable commands
│   │   ├── server/             # API server
│   │   │   └── main.go
│   │   └── worker/             # Background worker (optional)
│   │       └── main.go
│   ├── internal/               # Private application code
│   │   ├── requirement/        # Requirement domain
│   │   ├── estimation/         # Estimation logic
│   │   ├── github/             # GitHub integration
│   │   └── repository/         # Data access
│   ├── pkg/                    # Public packages
│   │   ├── logger/
│   │   └── validator/
│   ├── graph/                  # GraphQL layer
│   │   ├── schema.graphqls
│   │   ├── resolver.go
│   │   └── model/
│   ├── migrations/             # Database migrations
│   ├── go.mod
│   └── go.sum
│
├── frontend/                   # Frontend application (if any)
│   ├── pages/                  # File-based routing (Nuxt)
│   │   ├── index.vue
│   │   ├── requirements/
│   │   └── tasks/
│   ├── components/             # Vue components
│   │   ├── RequirementForm.vue
│   │   └── TaskTable.vue
│   ├── composables/            # Composition API utilities
│   │   ├── useRequirement.ts
│   │   └── useEstimation.ts
│   ├── stores/                 # Pinia stores
│   │   ├── requirement.ts
│   │   └── auth.ts
│   ├── public/                 # Static assets
│   ├── nuxt.config.ts          # Nuxt configuration
│   ├── package.json
│   └── tsconfig.json
│
├── terraform/                  # Infrastructure as Code (if any)
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── docs/                       # Documentation (if any)
│   ├── api/                    # API documentation
│   ├── architecture/           # Architecture diagrams
│   └── guides/                 # User guides
│
├── docker-compose.yml          # Local development environment
├── Dockerfile                  # Container image definition
├── Makefile                    # Common tasks automation
├── README.md                   # Project overview
├── CLAUDE.md                   # Claude Code guidance
└── LICENSE                     # License file
```

## File Naming Conventions

<ファイルやディレクトリの命名規則>

例：
- **Requirements**: Organized by slug folders (e.g., `add-user-auth/`)
- **Requirement files**: `<slug>/requirement.md`
- **Design files**: `<slug>/design.md`
- **Tasks**: `<slug>/tasks.yml`
- **Plans**: `<slug>/plan.md`
- **Go files**: `snake_case.go` (Go convention)
- **Vue components**: `PascalCase.vue` (Vue convention)
- **TypeScript files**: `camelCase.ts` (TypeScript convention)
- **Config files**: `kebab-case.yml` or `camelCase.json`

## Import Organization

<インポート・依存関係の構成規則>

例：
### Go
```go
import (
    // 1. Standard library
    "context"
    "fmt"

    // 2. External dependencies
    "github.com/99designs/gqlgen/graphql"

    // 3. Internal packages (absolute path from module root)
    "github.com/myorg/myapp/internal/requirement"
    "github.com/myorg/myapp/pkg/logger"
)
```

### TypeScript/Vue
```typescript
// 1. Vue core
import { ref, computed } from 'vue'

// 2. External libraries
import { useQuery } from '@vue/apollo-composable'

// 3. Local composables/stores
import { useRequirement } from '~/composables/useRequirement'

// 4. Components
import RequirementForm from '~/components/RequirementForm.vue'
```

## Key Architectural Principles

<コード構造の設計原則>

例：
1. **Separation of Concerns**: Domain logic, data access, and presentation are clearly separated
2. **Dependency Direction**: Dependencies point inward (internal packages don't depend on external layers)
3. **Interface Segregation**: Use interfaces for testability and loose coupling (especially in Go)
4. **Single Responsibility**: Each module/package has one well-defined responsibility
5. **Convention over Configuration**: Follow framework conventions (Nuxt file-based routing, Go project layout)
6. **Explicit over Implicit**: Prefer explicit type definitions and clear function signatures
7. **Schema-First**: GraphQL schema defines the contract, code is generated from schema
8. **Immutability**: Prefer immutable data structures in frontend state management

---
*Last updated: YYYY-MM-DD*
*Sources: Directory tree analysis, source code inspection, configuration files*