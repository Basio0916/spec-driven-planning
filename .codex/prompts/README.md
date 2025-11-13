# GitHub Copilot Prompt Files

This directory contains prompt files for GitHub Copilot to support Spec-Driven Planning (SDP) workflow.

## Setup

To use these prompt files with GitHub Copilot:

1. Initialize your project with the `--github-copilot` flag:
   ```bash
   npx spec-driven-planning init --github-copilot
   ```

2. Enable prompt files in VS Code:
   - Open Settings (Cmd+, or Ctrl+,)
   - Search for `chat.promptFiles`
   - Enable the setting

3. Reload VS Code to activate the prompt files

## Available Commands

| Command | Description |
|---------|-------------|
| `/sdp-steering` | Generate project context (product, tech, structure) |
| `/sdp-requirement` | Refine and normalize requirements |
| `/sdp-design` | Generate detailed design with alternatives |
| `/sdp-estimate` | Generate task breakdown with PERT estimates |
| `/sdp-show-plan` | Create visual project plan with Gantt chart |
| `/sdp-export-issues` | Export tasks to GitHub Issues, Jira, Backlog, or local files |

## Usage

In the GitHub Copilot Chat view:

1. Type `/` followed by the command name
2. Add arguments as needed
3. Press Enter to execute

### Examples

```
/sdp-requirement Add user authentication feature
/sdp-design add-user-authentication
/sdp-estimate add-user-authentication
/sdp-show-plan add-user-authentication
/sdp-export-issues add-user-authentication
```

## Files

- `sdp-requirement.prompt.md` - Requirement refinement prompt
- `sdp-design.prompt.md` - Design generation prompt
- `sdp-estimate.prompt.md` - Task estimation prompt
- `sdp-show-plan.prompt.md` - Project plan generation prompt
- `sdp-steering.prompt.md` - Project context generation prompt
- `sdp-export-issues.prompt.md` - Issue export prompt

## Documentation

For more information, see the [main documentation](https://github.com/Basio0916/spec-driven-planning).
