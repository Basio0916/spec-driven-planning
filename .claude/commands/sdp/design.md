# /design <REQ-ID>
You are Claude Code. Generate a detailed design document with decision rationale for a given requirement.

## Input
- **REQ-ID**: An existing requirement file at `.sdp/requirements/REQ-xxx.md`

## Context Files
Read these for context:
- `.sdp/requirements/REQ-xxx.md` - The requirement to design
- `.sdp/tech.md` - Technical stack and constraints
- `.sdp/structure.md` - Code structure and architecture
- `.sdp/product.md` - Business context and goals

## Pre-Check

```bash
# Create .sdp/designs directory if it doesn't exist
mkdir -p .sdp/designs

# Verify requirement exists
[ -f ".sdp/requirements/${REQ_ID}.md" ] && echo "✅ Requirement found" || echo "❌ Requirement not found"
```

## Design Process

### 1. Understand the Requirement
- Read and analyze the requirement thoroughly
- Extract key constraints from NFRs (security, performance, etc.)
- Identify technical boundaries from `.sdp/tech.md`

### 2. Generate Design Alternatives
Propose **2-4 alternative design approaches**. For each alternative:

- **Overview**: High-level description (2-3 sentences)
- **Architecture**: Component diagram, data flow, or module structure
- **Pros**: Key advantages (3-5 bullet points)
- **Cons**: Drawbacks and limitations (3-5 bullet points)
- **Complexity**: Estimated implementation complexity (Low/Med/High)
- **Risk**: Primary technical risks

### 3. Comparative Analysis
Create a comparison table covering:
- Implementation effort
- Maintainability
- Performance characteristics
- Scalability
- Team familiarity
- Technical debt implications

### 4. Recommended Solution
- **Selection rationale**: Why this design was chosen (1-2 paragraphs)
- **Trade-offs**: What we're sacrificing and why it's acceptable
- **Detailed design**: Architecture, data models, APIs, integration points
- **Implementation notes**: Key technical decisions and guidelines

## Deliverable
Create `.sdp/designs/REQ-xxx.md` following `.claude/templates/design.md` structure.

## Design Document Structure

The output must include:

1. **Overview**: Summary of what's being designed
2. **Design Alternatives**: 2-4 alternative approaches with pros/cons
3. **Comparison Matrix**: Side-by-side comparison table
4. **Recommended Solution**: Selected design with rationale
5. **Detailed Design**: Architecture, data models, APIs, etc.
6. **Trade-offs & Risks**: What we're accepting and why
7. **Implementation Guidelines**: Technical decisions and conventions
8. **Open Questions**: Unresolved items requiring user input (if any)

## Output Format

Generate all content in **Japanese language**.

After writing the file, print a summary in Japanese:

```
【設計完了】
📐 REQ-ID: REQ-xxx
📝 タイトル: <設計タイトル>
📁 ファイル: .sdp/designs/REQ-xxx.md

📊 検討した代替案: <数>
✅ 採用案: <採用した設計名>
📌 主要な判断理由: <1行要約>

💡 次のステップ:
  - 設計内容を確認し、修正が必要な場合は自然言語で指示してください
  - 設計が確定したら /sdp:estimate REQ-xxx でタスク分解を実行してください
```

## User Iteration Support

After generating the design:
- User can provide natural language feedback
- Update the design document based on feedback
- Maintain version notes in the document
- Re-evaluate alternatives if requested

## Allowed Tools
Bash, Read, Write, Edit, Glob, Grep only
