---
description: Generate a detailed design document with decision rationale for a given requirement
mode: agent
---

# SDP Design Generation

Generate a detailed design document with decision rationale for a given requirement.

## Input

- **slug**: An existing requirement folder at `.sdp/specs/<slug>/` containing `requirement.md`
- **Usage Example**: `/sdp-design add-user-authentication`

## Language Configuration

Read `.sdp/config/language.yml` to determine the output language:
- If `language: en`, generate all content in **English**
- If `language: ja`, generate all content in **Japanese**

Use templates from `.sdp/templates/<lang>/` directory based on the configured language.

## Context Files

Read these for context:
- `.sdp/specs/${input:slug}/requirement.md` - The requirement to design
- `.sdp/tech.md` - Technical stack and constraints
- `.sdp/structure.md` - Code structure and architecture
- `.sdp/product.md` - Business context and goals

## Pre-Check

Before starting, verify that:
- `.sdp/specs/${input:slug}/` directory exists
- `.sdp/specs/${input:slug}/requirement.md` file exists

Report errors if requirements are missing.

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

Create `.sdp/specs/${input:slug}/design.md` following `.sdp/templates/<lang>/design.md` structure (use the language-specific template).

**IMPORTANT - Response Length Management:**
If the design document is expected to be very long and may exceed GitHub Copilot's response limit:
1. First, create the file with sections 1-4 (Overview through Recommended Solution)
2. Inform the user that detailed design sections will be added next
3. Wait for user confirmation, then append sections 5-8 (Detailed Design through Open Questions)
4. Use `replace_string_in_file` to append content, NOT rewrite the entire file

## Design Document Structure

The output must include:

**Phase 1 (Core Design):**
1. **Overview**: Summary of what's being designed
2. **Design Alternatives**: 2-4 alternative approaches with pros/cons
3. **Comparison Matrix**: Side-by-side comparison table
4. **Recommended Solution**: Selected design with rationale

**Phase 2 (Implementation Details):**
5. **Detailed Design**: Architecture, data models, APIs, etc.
6. **Trade-offs & Risks**: What we're accepting and why
7. **Implementation Guidelines**: Technical decisions and conventions
8. **Open Questions**: Unresolved items requiring user input (if any)

## Output Format

Generate all content based on the configured language (`.sdp/config/language.yml`).

**For Phase 1 (Core Design) - After creating the initial file:**

```
【設計（フェーズ1）完了】
📐 Slug: <slug>
📝 タイトル: <設計タイトル>
📁 ファイル: .sdp/specs/<slug>/design.md

📊 検討した代替案: <数>
✅ 採用案: <採用した設計名>
📌 主要な判断理由: <1行要約>

💡 次のステップ:
  - 続けて詳細設計セクション（データモデル、API設計など）を追加する場合は「続けてください」と入力
  - または設計内容を確認し、修正が必要な場合は自然言語で指示してください
```

**For Phase 2 (Implementation Details) - After completing all sections:**

```
【設計完了】
📐 Slug: <slug>
📝 タイトル: <設計タイトル>
📁 ファイル: .sdp/specs/<slug>/design.md

✅ すべてのセクションが完成しました

💡 次のステップ:
  - 設計内容を確認し、修正が必要な場合は自然言語で指示してください
  - 設計が確定したら /sdp-estimate でタスク分解を実行してください
```

## User Iteration Support

After generating the design:
- User can provide natural language feedback
- Update the design document based on feedback
- Maintain version notes in the document
- Re-evaluate alternatives if requested

## Allowed Tools

Read, Write, Edit, File Search, Grep only
