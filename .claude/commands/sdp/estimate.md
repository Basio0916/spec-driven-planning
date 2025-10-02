# /estimate <REQ-ID>
You are Claude Code. For the given requirement, generate tasks and estimates grounded in this repo.

## Inputs
- REQ-ID: an existing file at ./requirements/REQ-xxx.md
- Estimation config: ./.claude/config/estimate.yml
- Schema: ./.claude/templates/tasks.schema.yml

## Tasking Rules
- Produce a YAML file at `./tasks/REQ-xxx.yml` following the schema strictly.
- Decompose into 5–12 tasks when possible; each task:
  - title, description (1–3 lines), deliverables (files), DoD (bullet), risk notes (optional)
  - depends_on (ids), labels (e.g., backend, frontend, infra, tests, docs)
  - estimate: use PERT (optimistic, most_likely, pessimistic, unit=h)
- Map tasks to existing directories from structure.md.
- Include a `critical_path` array.
- Include a `rollup` section with:
  - expected_hours (PERT mean sum)
  - stddev_hours (propagated)
  - confidence (low/med/high with 1-line rationale)

## Output
- Write the YAML file and print a compact table to console (task id, title, mean hours).
- Japanese language.