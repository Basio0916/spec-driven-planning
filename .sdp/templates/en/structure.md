# Code Structure

## High-level

<Overview of the overall system structure>

### Entrypoints
<Application startup points>

Example:
- **Backend**: `backend/cmd/server/main.go` - GraphQL server entry point
- **Frontend**: `frontend/pages/index.vue` - Nuxt 3 application root
- **CLI**: `.claude/commands/sdp/*` - Claude Code custom commands
- **Worker**: `backend/cmd/worker/main.go` - Background job processor (if any)

### Modules / Packages
<Major modules/packages and their responsibilities>

Example:
#### Backend (Go/Node.js/Python)
- `graph/` or `routes/` - API layer (GraphQL resolvers or REST routes)
  - `schema.graphqls` - GraphQL type definitions (if using GraphQL)
  - `resolver.go` or `controller.ts` - Main handler implementation
  - `model/` - Data models
- `internal/` or `src/` - Private application code
  - `requirement/` - Requirement domain logic
  - `estimation/` - PERT estimation engine
  - `github/` - GitHub API integration
  - `repository/` - Data access layer
- `pkg/` or `lib/` - Public reusable packages
  - `logger/` - Structured logging utilities
  - `validator/` - Input validation helpers

#### Frontend (React/Vue/Nuxt)
- `pages/` - File-based routing (Next.js/Nuxt convention) or `src/pages/` (React)
  - `index.tsx` or `index.vue` - Home page
  - `requirements/` - Requirement management pages
  - `tasks/` - Task breakdown pages
- `components/` - Reusable UI components
  - `RequirementForm` - Requirement input form
  - `TaskTable` - Task list table
  - `MermaidGantt` - Gantt chart visualization
- `hooks/` or `composables/` - Custom hooks/composables
  - `useRequirement` - Requirement CRUD operations
  - `useEstimation` - Task estimation logic
- `store/` or `stores/` - State management (Redux/Pinia/Zustand)
  - `requirement` - Requirement store
  - `auth` - Authentication store

#### SDP (Spec-Driven Planning)
- `.claude/commands/sdp/` - Custom slash commands
  - `steering.md` - Project context generation
  - `requirement.md` - Requirement refinement
  - `design.md` - Design generation
  - `estimate.md` - Task breakdown & estimation
  - `show-plan.md` - Project plan visualization
  - `export-issues.md` - GitHub Issues export

### Data Flow
<Data flow and processing patterns>

Example:
```
User Input (Natural Language)
  ↓
/sdp:requirement command
  ↓
Parse & Validate Input
  ↓
Generate Structured Spec (requirement.md)
  ↓
/sdp:design command
  ↓
Evaluate Design Alternatives
  ↓
Generate Design Document (design.md)
  ↓
/sdp:estimate command
  ↓
PERT Estimation Engine
  ↓
Generate Task Breakdown (tasks.yml)
  ↓
/sdp:export-issues command
  ↓
GitHub API Integration
  ↓
Create Issues on GitHub
```

## Directory Map

<Directory structure and the role of each directory>

### Backend (Example)
```
backend/
├── cmd/                    # Application entry points
│   ├── server/             # API server
│   └── worker/             # Background worker (optional)
├── internal/               # Private application code
│   ├── requirement/        # Requirement domain
│   ├── estimation/         # Estimation logic
│   ├── github/             # GitHub integration
│   └── repository/         # Data access
├── pkg/                    # Public packages
│   ├── logger/             # Logging utilities
│   └── validator/          # Validation helpers
├── migrations/             # Database migrations
├── config/                 # Configuration files
└── tests/                  # Test files
```

### Frontend (Example)
```
frontend/
├── pages/                  # Route pages
│   ├── index.vue           # Home page
│   ├── requirements/       # Requirement pages
│   └── tasks/              # Task pages
├── components/             # UI components
│   ├── RequirementForm.vue
│   ├── TaskTable.vue
│   └── common/             # Common components
├── composables/            # Composition API utilities
│   ├── useRequirement.ts
│   └── useEstimation.ts
├── stores/                 # State management
│   ├── requirement.ts
│   └── auth.ts
├── assets/                 # Static assets (images, styles)
├── plugins/                # Vue/Nuxt plugins
└── tests/                  # Test files
```

### SDP (Spec-Driven Planning)
```
.claude/
└── commands/
    └── sdp/                # Custom slash commands
        ├── steering.md     # Project context
        ├── requirement.md  # Requirement definition
        ├── design.md       # Design generation
        ├── estimate.md     # Task estimation
        ├── show-plan.md    # Plan visualization
        └── export-issues.md # GitHub export

.sdp/                       # SDP working directory
├── config/                 # Configuration files
│   ├── estimate.yml        # Estimation parameters
│   ├── export.yml          # Export settings
│   └── language.yml        # Language settings
├── templates/              # Document templates
│   ├── en/                 # English templates
│   └── ja/                 # Japanese templates
├── product.md              # Product context
├── tech.md                 # Technical context
├── structure.md            # Code structure
├── specs/                  # Requirements directory
│   └── <slug>/             # Requirement folder
│       ├── requirement.md  # Requirement spec
│       ├── design.md       # Design document
│       ├── tasks.yml       # Task breakdown
│       └── plan.md         # Project plan
└── out/                    # Export output
```

## Architectural Patterns

<Architectural patterns and principles used in the codebase>

Example:
- **Backend**: Clean Architecture / Hexagonal Architecture / MVC
- **Frontend**: Component-Based Architecture / Atomic Design
- **Data Flow**: Unidirectional Data Flow (Redux/Flux pattern)
- **Error Handling**: Centralized error handling with custom error classes
- **Dependency Injection**: Constructor-based DI (backend)

## Naming Conventions

<Naming conventions for files, directories, variables, functions, etc.>

Example:
- **Files**: kebab-case for files (`requirement-service.ts`)
- **Directories**: kebab-case for directories (`user-management/`)
- **Components**: PascalCase for React/Vue components (`RequirementForm.tsx`)
- **Variables/Functions**: camelCase (`getUserRequirement`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces/Types**: PascalCase with `I` prefix or no prefix (`IUser` or `User`)

---
*Last updated: YYYY-MM-DD*
