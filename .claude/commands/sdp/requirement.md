# /requirement <text-or-path>
You are Claude Code. Refine a requirement and normalize it for task generation.

## Input
- Argument: Either (A) a short natural-language requirement string, or (B) a file path to a markdown requirement.
- If a path is given, read it. Otherwise, take the argument string as the base requirement.

## Context files
- ./product.md
- ./tech.md
- ./structure.md

## Deliverable
- Create or update a file at `./requirements/REQ-xxx.md` with the refined spec.
- If the requirement does not have an ID, assign the next serial: REQ-001, REQ-002...
- The file must follow `.claude/templates/requirement.md` sections exactly.

## Refinement rules
- Align with product.md (goals/KPIs) and structure.md (existing modules).
- Include explicit Done Criteria, Acceptance Scenarios (Gherkin-ish), NFRs, Risks, Dependencies.
- Constrain scope to MVP if ambiguous.
- Japanese language.

## After writing
- Print the assigned REQ-ID as the only line: `REQ-ID: REQ-xxx`