# Installation Guide

## For End Users

### Quick Start with npx (Recommended)

The easiest way to use Spec-Driven Planning is with `npx`:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Run the scaffolding tool
npx create-spec-driven-planning
```

This will:
1. Create `.claude/` directory with commands, configs, and templates
2. Create `.sdp/` directory for outputs (automatically gitignored)
3. Copy `CLAUDE.md` for Claude Code guidance
4. Update `.gitignore` to exclude `.sdp/`

### Manual Installation

If you prefer to set up manually:

1. **Clone or download** this repository
2. **Copy files** to your project:
   ```bash
   # Copy .claude directory
   cp -r /path/to/spec-driven-planning/.claude /path/to/your/project/

   # Copy CLAUDE.md
   cp /path/to/spec-driven-planning/CLAUDE.md /path/to/your/project/

   # Create .sdp directory structure
   mkdir -p /path/to/your/project/.sdp/{requirements,tasks,plans,out}

   # Add .sdp to .gitignore
   echo "" >> /path/to/your/project/.gitignore
   echo "# Spec-Driven Planning outputs" >> /path/to/your/project/.gitignore
   echo ".sdp/" >> /path/to/your/project/.gitignore
   ```

3. **Configure** settings in `.claude/config/`:
   - Update `export.yml` with your GitHub repository
   - Customize `github.yml` labels
   - Adjust `estimate.yml` parameters if needed

## For Package Maintainers

### Publishing to npm

To publish this package to npm:

1. **Update package.json**:
   ```json
   {
     "name": "create-spec-driven-planning",
     "version": "1.0.0",
     "repository": {
       "type": "git",
       "url": "https://github.com/your-org/spec-driven-planning"
     },
     "author": "Your Name"
   }
   ```

2. **Test locally**:
   ```bash
   # In this repository
   npm link

   # In a test project
   cd /path/to/test/project
   npm link create-spec-driven-planning
   create-sdp

   # Or test with npx
   npm pack
   npx create-spec-driven-planning-1.0.0.tgz
   ```

3. **Publish**:
   ```bash
   # Login to npm (first time only)
   npm login

   # Publish package
   npm publish --access public
   ```

4. **Verify**:
   ```bash
   # Test installation from npm
   mkdir test-install
   cd test-install
   npx create-spec-driven-planning
   ```

### Package Contents

The npm package includes:
- `bin/create-sdp.js` - CLI executable
- `.claude/` - Commands, configs, templates
- `CLAUDE.md` - Usage documentation
- `README.md` - Package overview
- `LICENSE` - Apache 2.0 license

Excluded from package (via `.npmignore`):
- `.git/` - Git metadata
- `.sdp/` - Example outputs
- `node_modules/` - Dependencies
- Development files

### Version Management

Follow semantic versioning:
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes

Update version in:
1. `package.json` - `"version": "x.y.z"`
2. `bin/create-sdp.js` - `const VERSION = 'x.y.z'`

## Configuration After Installation

### 1. Export Configuration (`.claude/config/export.yml`)

```yaml
to: github  # or "local"
github:
  repo: your-org/your-repo  # Update this!
local:
  out_dir: .sdp/out
```

### 2. GitHub Configuration (`.claude/config/github.yml`)

```yaml
default_repo: your-org/your-repo  # Update this!
labels:
  - Tasks
  - AutoGen
```

### 3. Estimation Parameters (`.claude/config/estimate.yml`)

```yaml
tshirt_hours:
  S: 3    # Adjust these based on your team
  M: 6
  L: 12
  XL: 24
default_buffers:
  schedule: 0.15  # 15% buffer
```

## Troubleshooting

### `npx` fails with "command not found"

Ensure Node.js is installed:
```bash
node --version  # Should be 14.0.0 or higher
npm --version
```

### `.claude` directory already exists

The script will prompt you to overwrite. Choose `y` to replace or `N` to cancel.

### GitHub CLI not available

If you don't have `gh` CLI:
1. Set `to: local` in `.claude/config/export.yml`
2. Or install GitHub CLI: https://cli.github.com/

### Permission denied when running script

Make sure the script is executable:
```bash
chmod +x node_modules/.bin/create-sdp
```

## Next Steps

After installation:

1. **Initialize project context**:
   ```bash
   /steering
   ```

2. **Define your first requirement**:
   ```bash
   /requirement "Add user authentication feature"
   ```

3. **Generate task breakdown**:
   ```bash
   /estimate REQ-001
   ```

4. **Review the plan**:
   ```bash
   /show-plan REQ-001
   ```

5. **Export to GitHub**:
   ```bash
   /export-issues REQ-001
   ```

See `CLAUDE.md` and `README.md` for detailed usage instructions.
