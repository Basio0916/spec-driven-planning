# Tech Overview

## Stack & Services

<使用している技術スタックとサービスを具体的に記述>

### Backend
- **Language**: Go 1.21+
- **Framework**: gqlgen v0.17
- **API Layer**: GraphQL
- **Package Manager**: Go modules

### Frontend
- **Framework**: Nuxt 3.x
- **Build Tool**: Vite 4.x
- **UI Library**: Tailwind CSS 3.x
- **State Management**: Pinia

### Database
- **Primary DB**: MySQL 8.0
- **Hosting**: AWS Aurora Serverless v2
- **ORM/Query Builder**: sqlx
- **Migrations**: golang-migrate

### Infrastructure
- **Cloud Provider**: AWS
- **Compute**: ECS Fargate
- **CI/CD**: GitHub Actions
- **Container Registry**: Amazon ECR
- **IaC**: Terraform 1.5+

### Development Environment
- **Required Tools**:
  - Node.js 18+ (for frontend)
  - Go 1.21+ (for backend)
  - Docker & Docker Compose
  - AWS CLI v2
  - terraform CLI

## Interfaces/Contracts

<システム間のインターフェース定義とAPI契約>

### GraphQL Schema
- **Location**: `backend/graph/schema.graphqls`
- **Documentation**: GraphQL Playground at `/graphql`
- **Key Queries**: `getUser`, `listProjects`, `getRequirement`
- **Key Mutations**: `createRequirement`, `updateTask`, `exportIssues`
- **Subscriptions**: `taskProgressUpdated`, `requirementChanged`

### REST API (if any)
- **OpenAPI Spec**: `docs/openapi.yaml`
- **Base URL**: `/api/v1`
- **Authentication**: JWT Bearer token

### Events/Message Queues
- **Event Bus**: AWS EventBridge
- **Queue**: Amazon SQS
- **Event Types**: `requirement.created`, `task.estimated`, `issue.exported`

### External APIs
- **GitHub API**: v4 (GraphQL) via `gh` CLI
- **Claude API**: Anthropic API (via Claude Code environment)

## Observability & Quality

<監視、ロギング、テスト戦略>

### Logging
- **Backend**: structured JSON logs via `zap`
- **Frontend**: console logs + Sentry
- **Log Level**: INFO (production), DEBUG (development)
- **Retention**: 30 days in CloudWatch Logs

### Tracing
- **Tool**: AWS X-Ray
- **Coverage**: All GraphQL resolvers, database queries, external API calls
- **Sampling**: 10% in production, 100% in staging

### Metrics
- **Backend**: Prometheus metrics exposed at `/metrics`
- **Frontend**: Web Vitals (Core Web Vitals tracking)
- **Dashboards**: CloudWatch Dashboards
- **Alerts**: CloudWatch Alarms (error rate > 5%, latency > 2s)

### Testing Strategy

#### Unit Tests
- **Backend**: Go testing package + testify
- **Frontend**: Vitest + Vue Test Utils
- **Coverage Target**: 70%以上
- **Run**: `go test ./...` (backend), `npm test` (frontend)

#### Integration Tests
- **Tool**: Docker Compose + test containers
- **Scope**: API endpoints, database interactions
- **Run**: `make test-integration`

#### E2E Tests
- **Tool**: Playwright
- **Scope**: Critical user flows (requirement → estimate → export)
- **Run**: `npm run test:e2e`

### Security Baseline
- **Authentication**: JWT with 15min expiry, refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: All GraphQL inputs validated via schema + custom validators
- **SQL Injection**: Prevented by parameterized queries (sqlx)
- **XSS**: Prevented by Vue's template escaping
- **CORS**: Restricted to allowed origins only
- **Secrets Management**: AWS Secrets Manager
- **Dependencies**: Automated security scanning via Dependabot

## Common Commands

<開発でよく使うコマンド>

### Development
```bash
# Backend
cd backend && go run cmd/server/main.go

# Frontend
cd frontend && npm run dev

# Full stack with Docker Compose
docker-compose up -d
```

### Build
```bash
# Backend
cd backend && go build -o bin/server cmd/server/main.go

# Frontend
cd frontend && npm run build
```

### Testing
```bash
# Backend unit tests
cd backend && go test -v ./...

# Frontend unit tests
cd frontend && npm test

# Integration tests
make test-integration

# E2E tests
npm run test:e2e
```

### Database
```bash
# Run migrations
migrate -path db/migrations -database "mysql://..." up

# Rollback migration
migrate -path db/migrations -database "mysql://..." down 1
```

## Environment Variables

<重要な環境変数とその用途>

### Backend
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: JWT signing key
- `AWS_REGION`: AWS region (default: us-west-2)
- `LOG_LEVEL`: Logging level (debug/info/warn/error)
- `GITHUB_TOKEN`: GitHub API access token

### Frontend
- `VITE_API_URL`: Backend API URL
- `VITE_GRAPHQL_URL`: GraphQL endpoint URL
- `VITE_ENV`: Environment (development/staging/production)

## Port Configuration

<各サービスが使用するポート>

- **Backend API**: 8080
- **Frontend Dev Server**: 3000
- **GraphQL Playground**: 8080/graphql
- **MySQL**: 3306
- **Redis** (if used): 6379

## Constraints & Risks

<技術的な制約条件と主要リスク>

### Constraints
- **Performance**: GraphQL query depth limited to 5 levels
- **Rate Limiting**: 100 requests/minute per user
- **File Size**: Requirement files max 1MB
- **Concurrency**: Max 10 concurrent task estimations per user
- **Database**: Max 1000 requirements per project

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Claude API rate limit exceeded | Medium | High | Implement request queuing and retry logic |
| Database connection pool exhaustion | Low | High | Monitor connections, auto-scaling RDS |
| GraphQL N+1 query problem | Medium | Medium | Use DataLoader for batching |
| Frontend bundle size bloat | Medium | Low | Code splitting, lazy loading |
| GitHub API quota exceeded | Low | Medium | Cache results, batch operations |

### Known Technical Debt
- [ ] GraphQL schema lacks pagination on some list queries
- [ ] Frontend error handling needs improvement
- [ ] Missing integration tests for critical paths
- [ ] Database indexes optimization needed for large datasets

---
*Last updated: YYYY-MM-DD*
*Sources: package.json, go.mod, docker-compose.yml, terraform/*, .github/workflows/*, Dockerfile*