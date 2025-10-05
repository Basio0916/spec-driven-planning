# {{slug}} GitHub Issue ドラフト

この要件 {{slug}} の単一Issueドラフトです。
全てのタスクがチェックボックスとして含まれています。

---

## 単一Issue

**タイトル**: [{{slug}}] {{requirement_title}}

**本文**:
```markdown
{{issue_body}}
```

---

## 手動作成コマンド

```bash
gh issue create \
  --title "[{{slug}}] {{requirement_title}}" \
  --body "$(cat <<'EOF'
{{issue_body}}
EOF
)" \
  --repo <owner/repo>
```
