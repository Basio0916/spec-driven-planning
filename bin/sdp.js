#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VERSION = '1.4.1';

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
  log('  npx spec-driven-planning init [--lang <en|ja>]    Initialize SDP in current directory\n');
  log('  npx spec-driven-planning --help                    Show this help message\n');
  log('  npx spec-driven-planning -v                        Show version\n');
  log('Options:', colors.bright);
  log('  --lang <en|ja>    Set output language (default: en)\n');
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
    // Parse language option
    let lang = 'en'; // Default language
    const langIndex = args.indexOf('--lang');
    if (langIndex !== -1 && args[langIndex + 1]) {
      const specifiedLang = args[langIndex + 1].toLowerCase();
      if (specifiedLang === 'en' || specifiedLang === 'ja') {
        lang = specifiedLang;
      } else {
        error(`Invalid language: ${args[langIndex + 1]}. Supported languages: en, ja`);
        process.exit(1);
      }
    }

    log('\n╔═══════════════════════════════════════════════════════════╗', colors.bright + colors.cyan);
    log('║                                                           ║', colors.bright + colors.cyan);
    log('║   📋 Spec-Driven Planning (SDP) Setup                    ║', colors.bright + colors.cyan);
    log('║   Claude Code custom commands for requirements planning  ║', colors.bright + colors.cyan);
    log('║                                                           ║', colors.bright + colors.cyan);
    log('╚═══════════════════════════════════════════════════════════╝', colors.bright + colors.cyan);
    log(`   Version: ${VERSION}`, colors.cyan);
    log(`   Language: ${lang === 'en' ? 'English' : '日本語'}\n`, colors.cyan);

    const targetDir = process.cwd();
    const sdpCommandsDir = path.join(targetDir, '.claude', 'commands', 'sdp');

    // Check if .claude/commands/sdp already exists
    if (fs.existsSync(sdpCommandsDir)) {
      warn('.claude/commands/sdp/ directory already exists.');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Do you want to overwrite SDP commands? (y/N): ', (answer) => {
        readline.close();

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          info('Removing existing .claude/commands/sdp/ directory...');
          fs.rmSync(sdpCommandsDir, { recursive: true, force: true });
          setupSDP(targetDir, lang);
        } else {
          info('Setup cancelled. No changes were made.');
          process.exit(0);
        }
      });
    } else {
      setupSDP(targetDir, lang);
    }
  } else {
    error(`Unknown command: ${command}`);
    log('Run "npx spec-driven-planning --help" for usage information.\n');
    process.exit(1);
  }
}

function setupSDP(targetDir, lang = 'en') {
  const sourceDir = path.join(__dirname, '..');
  const claudeCommandsSdpSource = path.join(sourceDir, '.claude', 'commands', 'sdp');
  const claudeCommandsSdpTarget = path.join(targetDir, '.claude', 'commands', 'sdp');
  const sdpSourceDir = path.join(sourceDir, '.sdp');
  const sdpTargetDir = path.join(targetDir, '.sdp');

  info('Setting up Spec-Driven Planning structure...\n');

  try {
    // Copy .claude/commands/sdp directory only
    info('📁 Copying .claude/commands/sdp/ directory...');
    copyRecursive(claudeCommandsSdpSource, claudeCommandsSdpTarget);
    success('.claude/commands/sdp/ directory created');

    // Copy .sdp directory (config and templates)
    info('📁 Copying .sdp/ directory...');
    copyRecursive(sdpSourceDir, sdpTargetDir);
    success('.sdp/ directory created');

    // Create language configuration file
    info('📝 Creating language configuration...');
    const languageConfigPath = path.join(targetDir, '.sdp', 'config', 'language.yml');
    const languageConfig = `# Language Configuration for Spec-Driven Planning
# Supported languages: en (English), ja (Japanese)

language: ${lang}
`;
    fs.writeFileSync(languageConfigPath, languageConfig, 'utf8');
    success(`Language configuration created (${lang})`);

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
    log('   .sdp/out/                - Output directory (gitignored)\n');

    log('🚀 Next Steps:', colors.bright + colors.cyan);
    log('   1. Review and customize .sdp/config/*.yml files');
    log('   2. Update repository settings in .sdp/config/export.yml');
    log('   3. Run: /sdp:steering to initialize project context');
    log('   4. Start with: /sdp:requirement "Your requirement description"\n');

    log('📖 Available Commands:', colors.bright + colors.cyan);
    log('   /sdp:steering              - Generate project context');
    log('   /sdp:requirement <text>    - Refine requirement specification');
    log('   /sdp:design <slug>         - Generate detailed design with alternatives');
    log('   /sdp:estimate <slug>       - Generate task breakdown & estimates');
    log('   /sdp:show-plan <slug>      - Create visual project plan');
    log('   /sdp:export-issues <slug>  - Export to GitHub Issues\n');

    log('📚 Documentation:', colors.bright + colors.cyan);
    log('   For detailed usage, see: https://github.com/Basio0916/spec-driven-planning\n');

  } catch (err) {
    error(`Failed to setup SDP: ${err.message}`);
    process.exit(1);
  }
}

main();
