import http from 'http';

const BASE = 'http://localhost:3002';

const HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'User-Agent': 'FullPageAudit/1.0',
};

async function fetch(path, { followRedirects = false } = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE);
    const req = http.get(
      url,
      { headers: HEADERS, timeout: 15000 },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const contentType = res.headers['content-type'] || '';
          const location = res.headers.location || '';
          if (followRedirects && (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308)) {
            if (location.startsWith('http')) {
              resolve({ path, code: res.statusCode, size: data.length, contentType, location, data });
            } else if (location.startsWith('/')) {
              fetch(location, { followRedirects: false }).then((r2) => {
                resolve({ path, code: res.statusCode, size: data.length, contentType, location, final: r2 });
              });
            } else {
              resolve({ path, code: res.statusCode, size: data.length, contentType, location, data });
            }
          } else {
            resolve({ path, code: res.statusCode, size: data.length, contentType, location, data });
          }
        });
      }
    );
    req.on('error', (e) => resolve({ path, code: 'ERR', error: e.message, size: 0, contentType: '' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ path, code: 'TIMEOUT', size: 0, contentType: '' });
    });
  });
}

function extractIds(html, patterns) {
  const ids = new Set();
  if (!html) return [];
  for (const pattern of patterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      ids.add(match[1]);
    }
  }
  return [...ids];
}

function formatKb(bytes) {
  return (bytes / 1024).toFixed(1);
}

function printResult(r, options = {}) {
  const { expectedRedirect } = options;
  const code = r.code;
  let icon = '⚠️';
  if (code === 200) icon = '✅';
  else if (code === 404) icon = '❌';
  else if (code === 302 || code === 307) icon = '🔄';
  else if (code === 'ERR' || code === 'TIMEOUT') icon = '🔥';

  const sizeKb = formatKb(r.size);
  const ct = r.contentType ? r.contentType.split(';')[0] : '-';
  const line = `  ${icon} ${r.path.padEnd(30)} → ${String(code).padEnd(5)} ${sizeKb.padStart(6)}KB  ${ct}`;
  if (expectedRedirect && (code === 302 || code === 307 || code === 301)) {
    const location = r.location || '';
    if (location.includes(expectedRedirect)) {
      console.log(`${line} → redirect to ${location}`);
      return 'ok';
    } else {
      console.log(`${line} → redirect to ${location} (expected ${expectedRedirect})`);
      return 'warn';
    }
  }
  console.log(line);
  return code === 200 ? 'ok' : code === 'ERR' || code === 'TIMEOUT' || code === 404 ? 'warn' : 'warn';
}

async function main() {
  const startTime = Date.now();
  const issues = [];
  const detailResults = [];

  // 1. Marketing pages
  const marketing = ['/', '/about', '/companies', '/search', '/articles', '/events', '/awards', '/jobs', '/reports'];
  console.log('\n=== Marketing Pages ===');
  for (const p of marketing) {
    const r = await fetch(p);
    const status = printResult(r);
    if (status === 'warn') issues.push({ section: 'Marketing', path: p, code: r.code });
  }

  // 2. Extract IDs from list pages
  console.log('\n=== Extracting IDs for detail pages ===');
  const companiesRes = await fetch('/companies');
  const companySlugs = extractIds(companiesRes.data, [
    /href="\/companies\/([^"]+)"/g,
    /href='\/companies\/([^']+)'/g,
  ]).filter((s) => s !== 'search' && s !== 'page' && !s.includes('?'));

  const articlesRes = await fetch('/articles');
  const articleSlugs = extractIds(articlesRes.data, [
    /href="\/articles\/([^"]+)"/g,
    /href='\/articles\/([^']+)'/g,
  ]).filter((s) => !s.startsWith('page') && !s.includes('?'));

  const eventsRes = await fetch('/events');
  const eventIds = extractIds(eventsRes.data, [
    /href="\/events\/([^"]+)"/g,
    /href='\/events\/([^']+)'/g,
  ]).filter((s) => s !== 'page' && !s.includes('?'));

  const jobsRes = await fetch('/jobs');
  const jobIds = extractIds(jobsRes.data, [
    /href="\/jobs\/([^"]+)"/g,
    /href='\/jobs\/([^']+)'/g,
  ]).filter((s) => s !== 'page' && !s.includes('?'));

  const reportsRes = await fetch('/reports');
  const reportIds = extractIds(reportsRes.data, [
    /href="\/reports\/([^"]+)"/g,
    /href='\/reports\/([^']+)'/g,
  ]).filter((s) => s !== 'page' && !s.includes('?'));

  const awardsRes = await fetch('/awards');
  const awardSlugs = extractIds(awardsRes.data, [
    /href="\/awards\/([^"]+)"/g,
    /href='\/awards\/([^']+)'/g,
  ]).filter((s) => !s.includes('?'));

  const detailPages = [
    ...companySlugs.slice(0, 3).map((s) => `/companies/${s}`),
    ...articleSlugs.slice(0, 3).map((s) => `/articles/${s}`),
    ...eventIds.slice(0, 3).map((s) => `/events/${s}`),
    ...jobIds.slice(0, 3).map((s) => `/jobs/${s}`),
    ...reportIds.slice(0, 3).map((s) => `/reports/${s}`),
    ...awardSlugs.slice(0, 3).map((s) => `/awards/${s}`),
  ];

  console.log(`  Found company slugs: ${companySlugs.slice(0, 3).join(', ') || 'none'}`);
  console.log(`  Found article slugs: ${articleSlugs.slice(0, 3).join(', ') || 'none'}`);
  console.log(`  Found event ids: ${eventIds.slice(0, 3).join(', ') || 'none'}`);
  console.log(`  Found job ids: ${jobIds.slice(0, 3).join(', ') || 'none'}`);
  console.log(`  Found report ids: ${reportIds.slice(0, 3).join(', ') || 'none'}`);
  console.log(`  Found award slugs: ${awardSlugs.slice(0, 3).join(', ') || 'none'}`);

  console.log('\n=== Marketing Detail Pages ===');
  for (const p of detailPages) {
    const r = await fetch(p);
    const status = printResult(r);
    detailResults.push({ path: p, code: r.code });
    if (status === 'warn') issues.push({ section: 'Marketing Detail', path: p, code: r.code });
  }

  // 3. Auth pages
  const auth = ['/admin/login', '/enterprise/login', '/enterprise/register'];
  console.log('\n=== Auth Pages ===');
  for (const p of auth) {
    const r = await fetch(p);
    const status = printResult(r);
    if (status === 'warn') issues.push({ section: 'Auth', path: p, code: r.code });
  }

  // 4. Admin protected pages
  const adminPages = ['/admin/dashboard', '/admin/companies', '/admin/articles', '/admin/events', '/admin/awards', '/admin/jobs', '/admin/products', '/admin/reports', '/admin/ads', '/admin/page-sections', '/admin/media', '/admin/users', '/admin/logs', '/admin/settings'];
  console.log('\n=== Admin Protected Pages (expect redirect to /admin/login) ===');
  for (const p of adminPages) {
    const r = await fetch(p);
    const status = printResult(r, { expectedRedirect: '/admin/login' });
    if (status === 'warn') issues.push({ section: 'Admin', path: p, code: r.code, location: r.location });
  }

  // 5. Enterprise protected pages
  const enterprisePages = ['/enterprise/dashboard', '/enterprise/profile', '/enterprise/products', '/enterprise/jobs', '/enterprise/articles', '/enterprise/soft-articles', '/enterprise/settings'];
  console.log('\n=== Enterprise Protected Pages (expect redirect to /enterprise/login) ===');
  for (const p of enterprisePages) {
    const r = await fetch(p);
    const status = printResult(r, { expectedRedirect: '/enterprise/login' });
    if (status === 'warn') issues.push({ section: 'Enterprise', path: p, code: r.code, location: r.location });
  }

  // 6. 404 test
  console.log('\n=== 404 Test (expected 404) ===');
  const notFoundRes = await fetch('/nonexistent-page-xyz');
  printResult(notFoundRes);
  if (notFoundRes.code !== 404) {
    issues.push({ section: '404', path: '/nonexistent-page-xyz', code: notFoundRes.code });
  }

  // Summary
  console.log('\n=== Summary ===');
  const totalChecked = marketing.length + detailPages.length + auth.length + adminPages.length + enterprisePages.length + 1;
  console.log(`  Total pages checked: ${totalChecked}`);
  console.log(`  Time elapsed: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  if (issues.length === 0) {
    console.log('  ✅ No unexpected issues found.');
  } else {
    console.log(`  ⚠️  ${issues.length} unexpected issue(s) found:`);
    for (const issue of issues) {
      const extra = issue.location ? ` (redirected to ${issue.location})` : '';
      console.log(`     - [${issue.section}] ${issue.path}: ${issue.code}${extra}`);
    }
  }
}

main().catch(console.error);
