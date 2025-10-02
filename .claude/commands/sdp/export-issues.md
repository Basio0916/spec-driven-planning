# /export-issues <REQ-ID>
You are Claude Code. Convert ./tasks/REQ-xxx.yml into GitHub Issues.

## Inputs
- REQ-ID: an existing file at ./tasks/REQ-xxx.yml
- Config: ./.claude/config/github.yml (YAML with default_repo and labels)

## Steps
1) Load `./tasks/REQ-xxx.yml`.
2) Load config. If `default_repo` is present:
   - Target repository = that repo (use `--repo` option).
   - Else, target = current repo (`gh` auto-detect).
3) For each task:
   - Title: "[REQ-xxx] <task title>"
   - Body: include Description, Deliverables, DoD, Risks, Depends_on, Estimate.
   - Labels: union of config.labels + ["REQ-xxx"] + task.labels
   - Execute:
     ```bash
     gh issue create \
       --title "<title>" \
       --body "<body>" \
       --label "<labels...>" \
       --repo <repo from config or omit if not set>
     ```
   - Collect issue number/URL.
4) Create a parent tracking issue "Tracking REQ-xxx":
   - Checklist of child issues
   - Critical path
   - Rollup estimate
5) Print mapping table (task id → issue URL) to console.

## Output constraints
- Japanese language.
- If `gh` CLI is not available, fall back to writing `./out/REQ-xxx-issues.md` with all Issue drafts.