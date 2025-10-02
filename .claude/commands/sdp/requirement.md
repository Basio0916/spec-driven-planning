# /requirement <text-or-path>
You are Claude Code. Refine a requirement and normalize it for task generation.

## Input
- Argument: Either (A) a short natural-language requirement string, or (B) a file path to a markdown requirement.
- If a path is given, read it. Otherwise, take the argument string as the base requirement.

## Context Files
Read these steering documents for context:
- `.sdp/product.md` - Business context and goals
- `.sdp/tech.md` - Technical stack and constraints
- `.sdp/structure.md` - Code structure and organization

## Pre-Check: Detect Existing Requirements

```bash
# Create .sdp/requirements directory if it doesn't exist
mkdir -p .sdp/requirements

# Find the next REQ-ID
ls .sdp/requirements/REQ-*.md 2>/dev/null | tail -1 || echo "No existing requirements"
```

## Deliverable
- Create or update a file at `.sdp/requirements/REQ-xxx.md` with the refined spec.
- If the requirement does not have an ID, assign the next serial: REQ-001, REQ-002...
- The file must follow `.claude/templates/requirement.md` sections exactly.

## Refinement Rules

### Content Alignment
- **Product alignment**: Align with `.sdp/product.md` (goals/KPIs)
- **Technical feasibility**: Consider constraints from `.sdp/tech.md`
- **Structure awareness**: Reference existing modules from `.sdp/structure.md`

### Required Sections (from template)
1. **Goal**: Business/user goal statement
2. **Done Criteria**: Granular, testable completion criteria (checklist format)
3. **Acceptance Scenarios**: Gherkin-style scenarios (Given/When/Then)
4. **Dependencies**: Other requirements, external services, or prerequisites
5. **Non-Functional Requirements**:
   - Security considerations
   - Observability requirements
   - Performance targets
   - Accessibility standards
6. **Risks**: Probability/Impact/Mitigation strategy
7. **Notes**: Additional context or supplementary information

### Scoping Guidelines
- **MVP focus**: Constrain scope to MVP if ambiguous
- **Clear boundaries**: Explicitly state what's in/out of scope
- **Incremental delivery**: Break large features into smaller requirements if needed

## Output Format

Generate all content in **Japanese language**.

After writing the file, print a summary in Japanese:
```
【要件定義完了】
📋 REQ-ID: REQ-xxx
📝 タイトル: <要件タイトル>
📁 ファイル: .sdp/requirements/REQ-xxx.md

💡 次のステップ: /sdp:estimate REQ-xxx でタスク分解と見積もりを実行してください
```

## Allowed Tools
Bash, Read, Write, Edit, Glob, Grep only