#!/usr/bin/env node
/**
 * API Audit Script for Next.js Project
 * Static analysis of API routes
 */

import fs from 'fs';
import path from 'path';

const API_DIR = '/Users/lirundong/Code/work/芯师爷/web/src/app/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Discover all route.ts files
function discoverRoutes() {
  const routes = [];
  
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === 'route.ts') {
        routes.push(fullPath);
      }
    }
  }
  
  walk(API_DIR);
  return routes;
}

// Convert file path to API route path
function filePathToRoute(filePath) {
  let relativePath = filePath.replace(API_DIR, '').replace('/route.ts', '');
  if (relativePath === '') relativePath = '/';
  
  // Replace dynamic segments with placeholders
  relativePath = relativePath.replace(/\[(\w+)\]/g, ':$1');
  
  return `/api${relativePath}`;
}

// Parse route file to detect HTTP methods
function getRouteMethods(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const methods = [];
  
  const methodPatterns = [
    { method: 'GET', pattern: /export\s+async\s+function\s+GET\s*\(/ },
    { method: 'POST', pattern: /export\s+async\s+function\s+POST\s*\(/ },
    { method: 'PUT', pattern: /export\s+async\s+function\s+PUT\s*\(/ },
    { method: 'PATCH', pattern: /export\s+async\s+function\s+PATCH\s*\(/ },
    { method: 'DELETE', pattern: /export\s+async\s+function\s+DELETE\s*\(/ },
  ];
  
  for (const { method, pattern } of methodPatterns) {
    if (pattern.test(content)) {
      methods.push(method);
    }
  }
  
  return methods;
}

// Better implementation check
function checkImplementation(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  const stats = {
    hasPrisma: /prisma\./.test(content),
    hasTryCatch: /try\s*{|catch\s*\(/.test(content),
    hasErrorReturn: /return\s+NextResponse\.json\(\s*\{[^}]*error/.test(content),
    hasNotFound: /notFound\(/.test(content),
    hasUnauthorized: /unauthorized\(/.test(content),
    hasOk: /return\s+ok\(/.test(content),
    hasNextResponse: /NextResponse/.test(content),
    hasStatus500: /status:\s*500/.test(content),
    hasStatus501: /status:\s*501/.test(content),
    lines: content.split('\n').length,
  };
  
  // Check for TODO/FIXME comments (case insensitive)
  const todoPattern = /\/\/\s*(TODO|FIXME|HACK|XXX|PLACEHOLDER)/gi;
  const todoMatches = content.match(todoPattern);
  if (todoMatches) {
    const lineNumbers = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (todoPattern.test(lines[i])) {
        lineNumbers.push(i + 1);
      }
      todoPattern.lastIndex = 0; // Reset regex
    }
    for (const lineNum of lineNumbers) {
      issues.push(`Line ${lineNum}: Contains TODO/FIXME comment`);
    }
  }
  
  // Check for 501 Not Implemented
  if (stats.hasStatus501) {
    issues.push('Returns 501 Not Implemented');
  }
  
  // Check for empty/minimal implementations
  // A file is minimal if it has very few lines and no prisma calls
  if (stats.lines < 20 && !stats.hasPrisma && !stats.hasOk) {
    issues.push(`Possibly minimal implementation (only ${stats.lines} lines)`);
  }
  
  // Check each method handler more carefully
  const methodPattern = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;
  let match;
  const methodChecks = [];
  
  while ((match = methodPattern.exec(content)) !== null) {
    const method = match[1];
    const startPos = match.index;
    
    // Find the opening brace
    let bracePos = content.indexOf('{', startPos);
    if (bracePos === -1) continue;
    
    // Count braces to find the end of the function
    let braceCount = 1;
    let endPos = bracePos + 1;
    
    while (endPos < content.length && braceCount > 0) {
      if (content[endPos] === '{') braceCount++;
      if (content[endPos] === '}') braceCount--;
      endPos++;
    }
    
    const funcBody = content.substring(bracePos + 1, endPos - 1);
    const bodyLines = funcBody.split('\n').length;
    const hasReturn = /return\s+/.test(funcBody);
    const hasPrismaInFunc = /prisma\./.test(funcBody);
    const hasOkInFunc = /return\s+ok\(/.test(funcBody);
    
    methodChecks.push({
      method,
      lines: bodyLines,
      hasReturn,
      hasPrisma: hasPrismaInFunc,
      hasOk: hasOkInFunc,
    });
    
    // A method is minimal if it has very few lines and no real implementation
    if (bodyLines < 5 && !hasPrismaInFunc && !hasOkInFunc && hasReturn) {
      // Check if it just returns a placeholder
      if (/return\s+NextResponse\.json\(\s*\{?\s*\}?\s*\)/.test(funcBody) ||
          /return\s+ok\(\s*\{?\s*\}?\s*\)/.test(funcBody)) {
        issues.push(`${method}: Appears to have empty/placeholder implementation`);
      }
    }
  }
  
  return { issues, stats, methodChecks };
}

// Check response format consistency
function checkResponseFormat(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const formats = {
    usesOkHelper: false,
    usesErrorFormat: false,
    usesMessageFormat: false,
    directDataReturn: false,
  };
  
  if (/return\s+ok\(/.test(content)) {
    formats.usesOkHelper = true;
  }
  
  if (/NextResponse\.json\(\s*\{[^}]*error:/.test(content)) {
    formats.usesErrorFormat = true;
  }
  
  if (/NextResponse\.json\(\s*\{[^}]*message:/.test(content)) {
    formats.usesMessageFormat = true;
  }
  
  // Check if admin APIs return data directly without ok() wrapper
  if (/NextResponse\.json\(/.test(content) && !/return\s+ok\(/.test(content)) {
    formats.directDataReturn = true;
  }
  
  return formats;
}

// Categorize route
function categorizeRoute(routePath) {
  if (routePath.includes('/admin/')) return 'admin';
  if (routePath.includes('/enterprise/')) return 'enterprise';
  if (routePath.includes('/auth/')) return 'auth';
  return 'public';
}

// Main audit function
async function runAudit() {
  log('blue', '=== API Endpoint Audit (Static Analysis) ===\n');
  log('gray', `API Directory: ${API_DIR}\n`);
  
  // Step 1: Discover all routes
  log('blue', 'Discovering routes...');
  const routeFiles = discoverRoutes();
  log('green', `Found ${routeFiles.length} route files\n`);
  
  // Step 2: Analyze each route
  const results = [];
  const summary = {
    total: 0,
    byCategory: { admin: 0, enterprise: 0, auth: 0, public: 0 },
    byMethod: { GET: 0, POST: 0, PUT: 0, PATCH: 0, DELETE: 0 },
    issues: {
      todoComments: 0,
      minimalImpl: 0,
      returns501: 0,
      noErrorHandling: 0,
      inconsistentFormat: 0,
    },
    implementation: {
      withPrisma: 0,
      withTryCatch: 0,
      withAuth: 0,
      usesOkHelper: 0,
    },
  };
  
  for (const filePath of routeFiles) {
    const routePath = filePathToRoute(filePath);
    const methods = getRouteMethods(filePath);
    const { issues, stats, methodChecks } = checkImplementation(filePath);
    const formats = checkResponseFormat(filePath);
    const category = categorizeRoute(routePath);
    
    summary.total++;
    summary.byCategory[category]++;
    methods.forEach(m => summary.byMethod[m]++);
    
    if (stats.hasPrisma) summary.implementation.withPrisma++;
    if (stats.hasTryCatch) summary.implementation.withTryCatch++;
    if (stats.hasUnauthorized || stats.hasNotFound) summary.implementation.withAuth++;
    if (formats.usesOkHelper) summary.implementation.usesOkHelper++;
    
    if (issues.length > 0) {
      results.push({
        path: routePath,
        category,
        methods,
        issues,
        stats,
        formats,
        file: filePath.replace(API_DIR, ''),
      });
    }
    
    // Track specific issues
    for (const issue of issues) {
      if (/TODO|FIXME/.test(issue)) summary.issues.todoComments++;
      if (/minimal|placeholder/.test(issue.toLowerCase())) summary.issues.minimalImpl++;
      if (/501/.test(issue)) summary.issues.returns501++;
    }
  }
  
  // Display results
  log('blue', '=== Route Categories ===\n');
  for (const [cat, count] of Object.entries(summary.byCategory)) {
    log('cyan', `  ${cat}: ${count} routes`);
  }
  
  log('\n' + 'blue', '=== HTTP Methods ===\n');
  for (const [method, count] of Object.entries(summary.byMethod)) {
    if (count > 0) log('cyan', `  ${method}: ${count} endpoints`);
  }
  
  log('\n' + 'blue', '=== Implementation Stats ===\n');
  log('cyan', `  With Prisma calls: ${summary.implementation.withPrisma}`);
  log('cyan', `  With try-catch: ${summary.implementation.withTryCatch}`);
  log('cyan', `  With auth checks: ${summary.implementation.withAuth}`);
  log('cyan', `  Using ok() helper: ${summary.implementation.usesOkHelper}`);
  
  // Show routes with issues
  if (results.length > 0) {
    log('\n' + 'yellow', '=== Routes with Issues ===\n');
    for (const result of results) {
      log('yellow', `${result.category.toUpperCase()}: ${result.path}`);
      log('gray', `  File: ${result.file}`);
      log('gray', `  Methods: ${result.methods.join(', ')}`);
      for (const issue of result.issues) {
        const color = /501|500|empty/.test(issue) ? 'red' : 'yellow';
        log(color, `  ⚠ ${issue}`);
      }
      log('gray', '');
    }
  } else {
    log('\n' + 'green', '✓ No implementation issues found!');
  }
  
  // Response format analysis
  log('\n' + 'blue', '=== Response Format Analysis ===\n');
  
  const formatCounts = {
    usesOkHelper: 0,
    usesErrorFormat: 0,
    usesMessageFormat: 0,
    directDataReturn: 0,
  };
  
  for (const filePath of routeFiles) {
    const formats = checkResponseFormat(filePath);
    if (formats.usesOkHelper) formatCounts.usesOkHelper++;
    if (formats.usesErrorFormat) formatCounts.usesErrorFormat++;
    if (formats.usesMessageFormat) formatCounts.usesMessageFormat++;
    if (formats.directDataReturn) formatCounts.directDataReturn++;
  }
  
  log('cyan', `Endpoints using ok() helper: ${formatCounts.usesOkHelper}`);
  log('cyan', `Endpoints using { error: ... } format: ${formatCounts.usesErrorFormat}`);
  log('cyan', `Endpoints using { message: ... } format: ${formatCounts.usesMessageFormat}`);
  log('cyan', `Endpoints with direct NextResponse.json: ${formatCounts.directDataReturn}`);
  
  // Check for inconsistent error formats
  if (formatCounts.usesErrorFormat > 0 && formatCounts.usesMessageFormat > 0) {
    log('yellow', '\n⚠ Inconsistent error response formats detected!');
    log('yellow', '  Some endpoints use { error: "..." } while others use { message: "..." }');
    summary.issues.inconsistentFormat++;
  }
  
  // Summary
  log('\n' + 'blue', '=== Audit Summary ===\n');
  log('cyan', `Total route files: ${summary.total}`);
  log('green', `Routes without issues: ${summary.total - results.length}`);
  log('yellow', `Routes with issues: ${results.length}`);
  log('red', `Critical issues: ${summary.issues.returns501}`);
  
  if (summary.issues.todoComments > 0) {
    log('yellow', `\nTODO/FIXME comments: ${summary.issues.todoComments}`);
  }
  if (summary.issues.minimalImpl > 0) {
    log('yellow', `Possible minimal implementations: ${summary.issues.minimalImpl}`);
  }
  
  // Write detailed report
  const reportPath = '/Users/lirundong/Code/work/芯师爷/web/scripts/api-audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({ summary, results }, null, 2));
  log('\n' + 'gray', `Detailed report written to: ${reportPath}`);
  
  // List all routes
  log('\n' + 'blue', '=== All API Routes ===\n');
  const allRoutes = routeFiles.map(f => ({
    path: filePathToRoute(f),
    methods: getRouteMethods(f),
    category: categorizeRoute(filePathToRoute(f)),
  }));
  
  allRoutes.sort((a, b) => a.path.localeCompare(b.path));
  
  let currentCategory = '';
  for (const route of allRoutes) {
    if (route.category !== currentCategory) {
      currentCategory = route.category;
      log('gray', `\n[${currentCategory.toUpperCase()}]`);
    }
    log('cyan', `  ${route.path}`);
    log('gray', `    Methods: ${route.methods.join(', ')}`);
  }
  
  return summary;
}

// Run the audit
runAudit()
  .then((summary) => {
    log('\n' + 'blue', '=== Audit Complete ===');
    process.exit(0);
  })
  .catch((error) => {
    log('red', `Audit failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
