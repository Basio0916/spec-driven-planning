# /steering
You are Claude Code operating on this repository. Perform a "project steering" pass.

## Goals
- Read repo structure, code, ADRs, README, package manifests, schema (OpenAPI/GraphQL), docker files.
- Summarize the product and tech context.
- Materialize the summaries as Markdown files at repo root:
  - product.md  (business goals, user stories, KPIs)
  - tech.md     (stack, services, contracts, constraints, risks)
  - structure.md (folders, modules, key entry points, data flows)

## Steps
1) Scan repository. Extract:
   - product signals: README, docs/, issues, package.json, go.mod, etc.
   - tech/infra: Dockerfile, docker-compose, Terraform, CI, Makefile, package managers, gql/openapi schema.
   - structure: directories, domains, entrypoints, major modules.
2) Generate each file using the templates at `.claude/templates/*.md`. Keep sections even if empty.
3) Write files to repo root (overwrite allowed).
4) Also produce a short console summary: bullet list of what changed.

## Output constraints
- Use concise headings, bullets, and tables.
- Cite file paths you used at the bottom (list only).
- Japanese language.

## Files to write
- ./product.md
- ./tech.md
- ./structure.md