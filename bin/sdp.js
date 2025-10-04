#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VERSION = '1.1.0';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function warn(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      // Skip .git directory
      if (entry === '.git') continue;

      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function showHelp() {
  log('\n📋 Spec-Driven Planning (SDP) CLI', colors.bright + colors.cyan);
  log(`Version: ${VERSION}\n`, colors.cyan);
  log('Usage:', colors.bright);
  log('  npx spec-driven-planning init    Initialize SDP in current directory\n');
  log('  npx spec-driven-planning --help  Show this help message\n');
  log('  npx spec-driven-planning -v      Show version\n');
}

function showVersion() {
  log(`spec-driven-planning version ${VERSION}`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Handle version flag
  if (command === '-v' || command === '--version') {
    showVersion();
    process.exit(0);
  }

  // Handle help flag
  if (command === '-h' || command === '--help' || !command) {
    showHelp();
    process.exit(0);
  }

  // Handle init command
  if (command === 'init') {
    log('\n╔═══════════════════════════════════════════════════════════╗', colors.bright + colors.cyan);
    log('║                                                           ║', colors.bright + colors.cyan);
    log('║   📋 Spec-Driven Planning (SDP) Setup                    ║', colors.bright + colors.cyan);
    log('║   Claude Code custom commands for requirements planning  ║', colors.bright + colors.cyan);
    log('║                                                           ║', colors.bright + colors.cyan);
    log('╚═══════════════════════════════════════════════════════════╝', colors.bright + colors.cyan);
    log(`   Version: ${VERSION}\n`, colors.cyan);

    const targetDir = process.cwd();
    const claudeDir = path.join(targetDir, '.claude');

    // Check if .claude already exists
    if (fs.existsSync(claudeDir)) {
      warn('.claude directory already exists in the current directory.');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Do you want to overwrite it? (y/N): ', (answer) => {
        readline.close();

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          info('Removing existing .claude directory...');
          fs.rmSync(claudeDir, { recursive: true, force: true });
          setupSDP(targetDir);
        } else {
          info('Setup cancelled. No changes were made.');
          process.exit(0);
        }
      });
    } else {
      setupSDP(targetDir);
    }
  } else {
    error(`Unknown command: ${command}`);
    log('Run "npx spec-driven-planning --help" for usage information.\n');
    process.exit(1);
  }
}

function setupSDP(targetDir) {
  const sourceDir = path.join(__dirname, '..');
  const claudeSourceDir = path.join(sourceDir, '.claude');
  const claudeTargetDir = path.join(targetDir, '.claude');
  const sdpSourceDir = path.join(sourceDir, '.sdp');
  const sdpTargetDir = path.join(targetDir, '.sdp');

  info('Setting up Spec-Driven Planning structure...\n');

  try {
    // Copy .claude directory
    info('📁 Copying .claude/ directory...');
    copyRecursive(claudeSourceDir, claudeTargetDir);
    success('.claude/ directory created');

    // Copy .sdp directory (config and templates)
    info('📁 Copying .sdp/ directory...');
    copyRecursive(sdpSourceDir, sdpTargetDir);
    success('.sdp/ directory created');

    // Copy CLAUDE.md
    info('📄 Copying CLAUDE.md...');
    const claudeMdSource = path.join(sourceDir, 'CLAUDE.md');
    const claudeMdTarget = path.join(targetDir, 'CLAUDE.md');

    if (fs.existsSync(claudeMdTarget)) {
      warn('CLAUDE.md already exists, backing up to CLAUDE.md.backup');
      fs.copyFileSync(claudeMdTarget, path.join(targetDir, 'CLAUDE.md.backup'));
    }

    fs.copyFileSync(claudeMdSource, claudeMdTarget);
    success('CLAUDE.md created');

    // Create additional .sdp directory structure
    info('📁 Creating additional .sdp/ subdirectories...');
    const sdpDirs = [
      '.sdp/specs',
      '.sdp/out'
    ];

    sdpDirs.forEach(dir => {
      const dirPath = path.join(targetDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    success('.sdp/ directory structure created');

    // Add .gitignore for .sdp if it doesn't exist
    const gitignorePath = path.join(targetDir, '.gitignore');
    let gitignoreContent = '';

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    if (!gitignoreContent.includes('.sdp/')) {
      info('📝 Updating .gitignore...');
      const sdpIgnore = '\n# Spec-Driven Planning outputs\n.sdp/\n';
      fs.appendFileSync(gitignorePath, sdpIgnore);
      success('.gitignore updated');
    }

    log('\n╔═══════════════════════════════════════════════════════════╗', colors.bright + colors.green);
    log('║                                                           ║', colors.bright + colors.green);
    log('║   🎉 Setup Complete!                                     ║', colors.bright + colors.green);
    log('║                                                           ║', colors.bright + colors.green);
    log('╚═══════════════════════════════════════════════════════════╝', colors.bright + colors.green);

    log('\n📚 What was created:', colors.bright);
    log('   .claude/commands/sdp/    - Custom slash commands');
    log('   .sdp/config/             - Configuration files');
    log('   .sdp/templates/          - Document templates');
    log('   .sdp/specs/              - Requirements directory');
    log('   .sdp/out/                - Output directory (gitignored)');
    log('   CLAUDE.md                - Claude Code guidance\n');

    log('🚀 Next Steps:', colors.bright + colors.cyan);
    log('   1. Review and customize .sdp/config/*.yml files');
    log('   2. Update repository settings in .sdp/config/export.yml');
    log('   3. Run: /steering to initialize project context');
    log('   4. Start with: /requirement "Your requirement description"\n');

    log('📖 Available Commands:', colors.bright + colors.cyan);
    log('   /steering              - Generate project context');
    log('   /requirement <text>    - Refine requirement specification');
    log('   /design <slug>         - Generate detailed design with alternatives');
    log('   /estimate <slug>       - Generate task breakdown & estimates');
    log('   /show-plan <slug>      - Create visual project plan');
    log('   /export-issues <slug>  - Export to GitHub Issues\n');

    log('📚 Documentation:', colors.bright + colors.cyan);
    log('   Read CLAUDE.md for detailed usage instructions\n');

  } catch (err) {
    error(`Failed to setup SDP: ${err.message}`);
    process.exit(1);
  }
}

main();
