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
# Create .sdp directory if it doesn't exist
mkdir -p .sdp

# List existing requirement folders
ls -d .sdp/*/ 2>/dev/null | grep -v "out/$" | sed 's|.sdp/||g' | sed 's|/||g' || echo "No existing requirements"
```

## Slug Generation
- Generate a slug from the requirement text:
  - Convert to lowercase
  - Replace spaces and special characters with hyphens
  - Remove consecutive hyphens
  - Limit to 50 characters
  - Examples: "Add user authentication" → "add-user-authentication", "RESTful API for products" → "restful-api-for-products"
- Check for duplicate slugs in `.sdp/` directory
- If duplicate exists, append `-2`, `-3`, etc.

## Deliverable
- Create or update a file at `.sdp/<slug>/requirement.md` with the refined spec.
- Create the `.sdp/<slug>/` directory if it doesn't exist
- The file must follow `.claude/templates/requirement.md` sections exactly.

## Refinement Rules

### Content Alignment
- **Product alignment**: Align with `.sdp/product.md` (goals/KPIs)
- **Technical feasibility**: Consider constraints from `.sdp/tech.md`
- **Structure awareness**: Reference existing modules from `.sdp/structure.md`

### Required Sections (from template)
1. **機能概要**: Business goal and feature purpose statement
2. **ユーザーストーリー**: User stories in "Who/What/Why" format
3. **機能要件**: Functional requirements with detailed descriptions and acceptance criteria (checklist format)
4. **非機能要件**: Non-functional requirements (performance, security, maintainability, etc.) as needed

### Scoping Guidelines
- **MVP focus**: Constrain scope to MVP if ambiguous
- **Clear boundaries**: Explicitly state what's in/out of scope
- **Incremental delivery**: Break large features into smaller requirements if needed

## Output Format

Generate all content in **Japanese language**.

After writing the file, print a summary in Japanese:
```
【要件定義完了】
📋 Slug: <slug>
📝 タイトル: <要件タイトル>
📁 ファイル: .sdp/<slug>/requirement.md

💡 次のステップ:
  - 要件内容を確認し、修正が必要な場合は自然言語で指示してください
  - 要件が確定したら /sdp:design <slug> で設計を行ってください
```

## Allowed Tools
Bash, Read, Write, Edit, Glob, Grep only