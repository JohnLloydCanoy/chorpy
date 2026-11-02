#!/usr/bin/env node

/**
 * audit-rn-standards.js
 *
 * Automated auditor for Expo & React Native engineering standards and lag prevention.
 * Inspects:
 *   - mobile/src/ (code cleanliness, thread performance, design tokens)
 *   - mobile/app.json & native directories (Expo CNG compliance)
 *   - mobile/package.json (dependency hygiene)
 *
 * References:
 *   - Expo Guides: https://docs.expo.dev/guides/overview/
 *   - Neha Sharma Clean Code: https://dev.to/hellonehha/react-native-code-practices-6dl
 *   - Expo Lag Reduction: https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps
 */

const fs = require('fs');
const path = require('path');

// ANSI Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Parse CLI Flags
const args = process.argv.slice(2);
let customDir = null;
let jsonOutput = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' && args[i + 1]) {
    customDir = args[i + 1];
    i++;
  } else if (args[i] === '--json') {
    jsonOutput = true;
  }
}

// Resolve mobile directory
let mobileDir = '';
if (customDir) {
  mobileDir = path.resolve(process.cwd(), customDir);
} else {
  const possiblePaths = [
    path.resolve(process.cwd(), 'mobile'),
    process.cwd(),
    path.resolve(__dirname, '../../../../mobile'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(path.join(p, 'app.json')) || fs.existsSync(path.join(p, 'package.json'))) {
      mobileDir = p;
      break;
    }
  }
}

if (!mobileDir || !fs.existsSync(mobileDir)) {
  console.error(`${colors.red}Error:${colors.reset} Could not locate 'mobile' directory. Use --dir <path> to specify.`);
  process.exit(1);
}

let srcDir = path.join(mobileDir, 'src');
if (!fs.existsSync(srcDir) && fs.existsSync(mobileDir) && path.basename(mobileDir) === 'src') {
  srcDir = mobileDir;
  mobileDir = path.dirname(mobileDir);
}
const appJsonPath = path.join(mobileDir, 'app.json');
const packageJsonPath = path.join(mobileDir, 'package.json');

// Results structure
const report = {
  timestamp: new Date().toISOString(),
  targetDir: mobileDir,
  scannedFiles: 0,
  summary: {
    errors: 0,
    warnings: 0,
    passedChecks: 0,
  },
  violations: [],
  cngStatus: 'CLEAN',
};

function addViolation(file, line, ruleId, severity, message, recommendation) {
  if (severity === 'error') {
    report.summary.errors++;
  } else {
    report.summary.warnings++;
  }
  report.violations.push({
    file: path.relative(process.cwd(), file),
    line: line || null,
    ruleId,
    severity,
    message,
    recommendation,
  });
}

// 1. Recursive file collection
function getSourceFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.expo') {
        getSourceFiles(fullPath, fileList);
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// 2. CNG Compliance Check
function checkCNGCompliance() {
  const projectRoot = fs.existsSync(path.join(mobileDir, '..', 'package.json'))
    ? path.join(mobileDir, '..')
    : mobileDir;

  const androidPaths = [path.join(mobileDir, 'android'), path.join(projectRoot, 'android')];
  const iosPaths = [path.join(mobileDir, 'ios'), path.join(projectRoot, 'ios')];

  const gitignorePath = fs.existsSync(path.join(mobileDir, '.gitignore'))
    ? path.join(mobileDir, '.gitignore')
    : fs.existsSync(path.join(projectRoot, '.gitignore'))
    ? path.join(projectRoot, '.gitignore')
    : null;

  let gitignoreContent = '';
  if (gitignorePath && fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }

  const isAndroidIgnored = gitignoreContent.includes('android/') || gitignoreContent.includes('/android');
  const isIosIgnored = gitignoreContent.includes('ios/') || gitignoreContent.includes('/ios');

  let hasUnmanagedNative = false;

  for (const aPath of androidPaths) {
    if (fs.existsSync(aPath) && fs.readdirSync(aPath).length > 0) {
      if (!isAndroidIgnored) {
        addViolation(
          aPath,
          null,
          'CNG001',
          'error',
          'Unmanaged "android/" directory detected without gitignore entry.',
          'Expo CNG mandates managing native configuration via app.json config plugins. Add android/ to .gitignore or remove manual modifications.'
        );
        hasUnmanagedNative = true;
      }
    }
  }

  for (const iPath of iosPaths) {
    if (fs.existsSync(iPath) && fs.readdirSync(iPath).length > 0) {
      if (!isIosIgnored) {
        addViolation(
          iPath,
          null,
          'CNG001',
          'error',
          'Unmanaged "ios/" directory detected without gitignore entry.',
          'Expo CNG mandates managing native configuration via app.json config plugins. Add ios/ to .gitignore or remove manual modifications.'
        );
        hasUnmanagedNative = true;
      }
    }
  }

  if (hasUnmanagedNative) {
    report.cngStatus = 'UNMANAGED_NATIVE_DETECTED';
  } else {
    report.summary.passedChecks++;
  }
}

// 3. Scan Source Files
function scanSourceFiles() {
  const sourceFiles = getSourceFiles(srcDir);
  // Also check App.tsx if present at mobile root
  const rootApp = path.join(mobileDir, 'App.tsx');
  if (fs.existsSync(rootApp)) {
    sourceFiles.push(rootApp);
  }

  report.scannedFiles = sourceFiles.length;

  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relPath = path.relative(mobileDir, filePath).replace(/\\/g, '/');
    const isThemeFile = relPath.startsWith('src/theme') || relPath.startsWith('theme');
    const hasThemeImport = /from\s+['"][^'"]*theme[^'"]*['"]/.test(content);

    // Rule: CC002 - MAX_FILE_LINE_COUNT (250 lines)
    if (lines.length > 250) {
      addViolation(
        filePath,
        lines.length,
        'CC002',
        'warning',
        `File length (${lines.length} lines) exceeds the 250-line modularity threshold.`,
        'Decompose into smaller subcomponents, custom hooks (src/hooks/), or isolated services (src/services/).'
      );
    }

    // Rule: TP001 - NO_PAN_RESPONDER (error)
    if (
      /\bimport\s+[^;]*\bPanResponder\b[^;]*from\s+['"]react-native['"]/.test(content) ||
      /\bPanResponder\.create\s*\(/.test(content)
    ) {
      const matchLine = lines.findIndex((l) => l.includes('PanResponder')) + 1;
      addViolation(
        filePath,
        matchLine,
        'TP001',
        'error',
        'PanResponder detected. Touch events block the JavaScript thread.',
        'Replace with react-native-gesture-handler and react-native-reanimated for native 60/120 FPS UI-thread gestures.'
      );
    }

    // Scan line by line
    let insideMapBlock = 0;
    let mapParenDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const line = lines[i];
      const trimmed = line.trim();

      // Skip commented lines
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        continue;
      }

      // Rule: CC001 - NO_CONSOLE_LOG (warning)
      if (/\bconsole\.(log|debug)\s*\(/.test(line)) {
        addViolation(
          filePath,
          lineNum,
          'CC001',
          'warning',
          'console.log or console.debug found.',
          'Remove console logging or wrap in __DEV__ / dedicated logging utility before production.'
        );
      }

      // Rule: UI001 - NO_HARDCODED_HEX_COLORS
      // Check if hex color is used in components/screens without importing src/theme
      if (!isThemeFile && !hasThemeImport) {
        const hexMatch = line.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b|#[0-9a-fA-F]{8}\b/g);
        if (hexMatch) {
          // Verify it's within a style or JSX context
          if (
            line.includes('Color') ||
            line.includes('color') ||
            line.includes('background') ||
            line.includes('border') ||
            line.includes('tint') ||
            line.includes('placeholderTextColor') ||
            line.includes('style=')
          ) {
            addViolation(
              filePath,
              lineNum,
              'UI001',
              'warning',
              `Hardcoded hex color(s) [${hexMatch.join(', ')}] without importing from 'src/theme'.`,
              "Import design tokens from 'src/theme' (e.g. colors.primary, colors.background) instead of raw hex values."
            );
          }
        }
      }

      // Track .map( blocks for inline styles & unbounded rendering
      if (line.includes('.map(') || line.includes('.map (')) {
        insideMapBlock = 25; // look ahead up to 25 lines within the map callback
      }

      if (insideMapBlock > 0) {
        // Rule: TP002 - AVOID_INLINE_STYLES_IN_MAP
        if (/style\s*=\s*\{\{/.test(line)) {
          addViolation(
            filePath,
            lineNum,
            'TP002',
            'warning',
            'Inline style object (style={{ ... }}) inside .map() render callback.',
            'Inline object creation in loops triggers unnecessary GC allocation and re-renders. Hoist styles to StyleSheet.create.'
          );
        }

        // Rule: TP003 - UNBOUNDED_MAP_RENDERING
        if (
          /\.map\s*\(\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>\s*(?:\(\s*)?<[A-Z][a-zA-Z0-9]*(?:View|Card|Container|Item|Row|List)\b/.test(
            line
          )
        ) {
          addViolation(
            filePath,
            lineNum,
            'TP003',
            'warning',
            'Unbounded .map() rendering JSX container elements.',
            'For dynamic or unbounded lists, use virtualized FlatList or @shopify/flash-list with getItemLayout to eliminate UI lag.'
          );
        }

        insideMapBlock--;
      }
    }
  }
}

// 4. Dependency checks
function checkPackageJson() {
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      // Check if reanimated is present when gesture handler is used
      if (deps['react-native-gesture-handler'] && !deps['react-native-reanimated']) {
        addViolation(
          packageJsonPath,
          null,
          'TP001',
          'warning',
          'react-native-gesture-handler is installed without react-native-reanimated.',
          'Install react-native-reanimated with "npx expo install react-native-reanimated" for native thread gesture-animation worklets.'
        );
      }
    } catch (e) {
      addViolation(packageJsonPath, null, 'PKG001', 'error', 'Malformed package.json: ' + e.message, 'Fix JSON syntax.');
    }
  }
}

// Execute Audit
checkCNGCompliance();
scanSourceFiles();
checkPackageJson();

// Format and Output Results
if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('\n' + colors.bold + colors.cyan + '===================================================' + colors.reset);
  console.log(colors.bold + colors.cyan + '  EXPO & REACT NATIVE STANDARDS AUDIT REPORT' + colors.reset);
  console.log(colors.bold + colors.cyan + '===================================================' + colors.reset);
  console.log(`${colors.dim}Target:${colors.reset}   ${mobileDir}`);
  console.log(`${colors.dim}Scanned:${colors.reset}  ${report.scannedFiles} source files`);
  console.log(`${colors.dim}CNG:${colors.reset}      ${report.cngStatus === 'CLEAN' ? colors.green + 'MANAGED (Pure CNG compliant)' : colors.red + report.cngStatus}${colors.reset}\n`);

  if (report.violations.length === 0) {
    console.log(colors.bold + colors.green + '✓ ALL STANDARDS PASSED: Zero errors or warnings detected.' + colors.reset + '\n');
  } else {
    // Group violations by category/file
    for (const v of report.violations) {
      const badge =
        v.severity === 'error'
          ? colors.bold + colors.red + '[ERROR]' + colors.reset
          : colors.bold + colors.yellow + '[WARN] ' + colors.reset;
      const loc = v.line ? `:${v.line}` : '';
      console.log(`${badge} ${colors.bold}${v.ruleId}${colors.reset} in ${colors.cyan}${v.file}${loc}${colors.reset}`);
      console.log(`       ${v.message}`);
      console.log(`       ${colors.dim}Fix: ${v.recommendation}${colors.reset}\n`);
    }

    console.log(colors.bold + 'Summary:' + colors.reset);
    const errColor = report.summary.errors > 0 ? colors.red : colors.green;
    const warnColor = report.summary.warnings > 0 ? colors.yellow : colors.green;
    console.log(`  ${errColor}Errors:   ${report.summary.errors}${colors.reset}`);
    console.log(`  ${warnColor}Warnings: ${report.summary.warnings}${colors.reset}\n`);
  }
}

// Exit code logic: fail only if errors > 0
if (report.summary.errors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
