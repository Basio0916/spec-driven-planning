---
description: Generate lightweight design alternatives document (2-4 approaches) for requirement
---

# SDP: Design Alternatives

You are GitHub Copilot. Generate a lightweight design alternatives document that compares 2-4 design approaches for a given requirement.

## Input
- **slug**: Provide the requirement slug (e.g., "add-user-authentication")

## Language Configuration

Read `.sdp/config/language.yml` to determine the output language:
- If `language: en`, generate all content in **English**
- If `language: ja`, generate all content in **Japanese**

Use templates from `.sdp/templates/<lang>/` directory based on the configured language.

## Context Files
Read these for context:
- `.sdp/specs/<slug>/requirement.md` - The requirement to design
- `.sdp/tech.md` - Technical stack and constraints
- `.sdp/structure.md` - Code structure and architecture
- `.sdp/product.md` - Business context and goals

## Pre-Check

Before starting, verify that:
- `.sdp/specs/<slug>/` directory exists
- `.sdp/specs/<slug>/requirement.md` file exists

Report errors if requirements are missing.

## Design Alternatives Process

### 1. Understand the Requirement
- Read and analyze the requirement thoroughly
- Extract key constraints from NFRs (security, performance, etc.)
- Identify technical boundaries from `.sdp/tech.md`

### 2. Generate 2-4 Design Alternatives

**IMPORTANT**: Keep this lightweight and focused on comparison. **DO NOT** include detailed specifications in this document. Save detailed design for the next step.

For each alternative (2-4 alternatives):

**Overview** (2-3 sentences)
- High-level description of the approach
- Key distinguishing characteristics

**Architecture** (Simple text diagram or brief description)
- Show key components and data flow
- Keep it simple - use ASCII diagrams or brief bullet points
- **NO** detailed class diagrams, **NO** detailed sequence diagrams

**Pros** (3-5 bullet points)
- Key advantages
- Be specific and concrete

**Cons** (3-5 bullet points)
- Drawbacks and limitations
- Be honest about trade-offs

**Implementation Complexity**: Low / Med / High
- Brief justification (1 sentence)

**Primary Risks** (1-2 sentences)
- Main technical risks associated with this approach

### 3. Comparative Analysis

Create a comparison table with criteria such as:
- Implementation effort (person-days estimate)
- Maintainability (High/Med/Low)
- Performance characteristics (concrete metrics when possible)
- Scalability (High/Med/Low)
- Team familiarity (High/Med/Low)
- Technical debt implications (Low/Med/High)
- Security (High/Med/Low)
- Cost (Low/Med/High)

**Adjust criteria based on the specific requirement and project context.**

### 4. Recommended Solution

**Selection rationale** (3-5 sentences)
- Why this design was chosen over alternatives
- What key factors drove the decision
- Reference to product.md business goals when applicable

**Key Trade-offs** (2-4 bullet points)
- What we're sacrificing and why it's acceptable
- Be explicit about what we're NOT optimizing for

## Document Length Guidelines

**Target length: 200-400 lines**

Keep it concise:
- ✅ Focus on comparison and decision-making
- ✅ Simple architecture diagrams (ASCII/text)
- ✅ Brief pros/cons lists
- ❌ NO detailed API specifications
- ❌ NO detailed database schemas
- ❌ NO detailed implementation code
- ❌ NO detailed security measures
- ❌ NO detailed file structures

**The goal is to help the user choose a direction, not to provide implementation details.**

## Deliverable

Create `.sdp/specs/<slug>/design-alternatives.md` following `.sdp/templates/<lang>/design-alternatives.md` structure (use the language-specific template).

## Design Alternatives Document Structure

The output must include:

1. **Overview**: Summary of what's being designed (2-3 sentences)
2. **Alternative 1**: First design approach
3. **Alternative 2**: Second design approach
4. **Alternative 3**: Third design approach (optional but recommended)
5. **Alternative 4**: Fourth design approach (optional)
6. **Comparison Matrix**: Side-by-side comparison table
7. **Recommended Solution**: Selected design with rationale and trade-offs
8. **Next Steps**: Instructions for proceeding to detailed design

## Output Format

Generate all content based on the configured language (`.sdp/config/language.yml`).

After writing the file, print a summary in the same language as the content:

For Japanese:
```
【設計代替案作成完了】
📐 Slug: <slug>
📝 タイトル: <設計タイトル>
📁 ファイル: .sdp/specs/<slug>/design-alternatives.md

📊 評価した代替案: <数>件
✅ 推奨案: <推奨する設計名>
📌 主要な選定理由: <1行要約>

💡 次のステップ:
  - 代替案を確認し、修正が必要な場合は自然言語で指示してください
  - 推奨案で進める場合: #sdp-design-detail を使用（slugを指定）
  - 別の案を選ぶ場合: #sdp-design-detail を使用（slug と代替案番号を指定）
```

For English:
```
【Design Alternatives Completed】
📐 Slug: <slug>
📝 Title: <design title>
📁 File: .sdp/specs/<slug>/design-alternatives.md

📊 Alternatives Evaluated: <number>
✅ Recommended: <recommended design name>
📌 Key Rationale: <one-line summary>

💡 Next Steps:
  - Review alternatives and provide feedback if changes needed
  - To proceed with recommended: Use #sdp-design-detail (specify slug)
  - To select different alternative: Use #sdp-design-detail (specify slug and alternative number)
```

## User Iteration Support

After generating the design alternatives:
- User can provide natural language feedback
- Update the alternatives document based on feedback
- Add new alternatives if requested
- Refine comparison matrix if needed
- Re-evaluate recommendation if requested

## Design Quality Guidelines

### Ensure Alternatives are Truly Different
- Each alternative should represent a fundamentally different approach
- Avoid alternatives that are just minor variations
- Consider different: architectures, technologies, paradigms, complexity levels

### Make Comparisons Objective
- Use concrete metrics when possible (e.g., "100ms response time" vs "fast")
- Provide evidence from tech.md or product.md
- Acknowledge uncertainty when estimating

### Align with Project Context
- Reference constraints from tech.md (stack, infrastructure, skills)
- Reference goals from product.md (KPIs, user needs)
- Reference existing patterns from structure.md
- Consider team's current skill level and learning curve

### Be Honest About Trade-offs
- Every design has trade-offs - make them explicit
- Don't oversell the recommended solution
- Acknowledge what you're NOT optimizing for
