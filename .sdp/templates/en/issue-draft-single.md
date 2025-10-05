# GitHub Issue Draft for {{slug}}

This file contains a single comprehensive issue draft for requirement {{slug}}.
All tasks are included as checkboxes within this issue.

---

## Single Issue

**Title**: [{{slug}}] {{requirement_title}}

**Body**:
```markdown
{{issue_body}}
```

---

## Manual Creation Command

```bash
gh issue create \
  --title "[{{slug}}] {{requirement_title}}" \
  --body "$(cat <<'EOF'
{{issue_body}}
EOF
)" \
  --repo <owner/repo>
```
