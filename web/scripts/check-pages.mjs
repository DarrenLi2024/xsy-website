import http from 'http';

const BASE = 'http://localhost:3002';

async function check(path) {
  return new Promise((resolve) => {
    const req = http.get(BASE + path, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ path, code: res.statusCode, size: data.length }));
    });
    req.on('error', (e) => resolve({ path, code: 'ERR', error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ path, code: 'TIMEOUT' }); });
  });
}

async function main() {
  const marketing = ['/', '/about', '/companies', '/search', '/articles', '/events', '/awards', '/jobs', '/reports'];
  const auth = ['/admin/login', '/enterprise/login', '/enterprise/register'];
  const adminRedirect = ['/admin', '/admin/dashboard', '/admin/companies', '/admin/articles', '/admin/events', '/admin/awards', '/admin/jobs', '/admin/products', '/admin/reports'];

  console.log('=== Marketing Pages ===');
  for (const p of marketing) {
    const r = await check(p);
    const icon = r.code === 200 ? '✅' : r.code === 404 ? '❌' : r.code === 302 ? '🔄' : '⚠️';
    console.log(`  ${icon} ${p} → ${r.code} (${(r.size/1024).toFixed(1)}KB)`);
  }

  console.log('\n=== Auth Pages ===');
  for (const p of auth) {
    const r = await check(p);
    const icon = r.code === 200 ? '✅' : '⚠️';
    console.log(`  ${icon} ${p} → ${r.code} (${(r.size/1024).toFixed(1)}KB)`);
  }

  console.log('\n=== Admin Pages (redirect check) ===');
  for (const p of adminRedirect) {
    const r = await check(p);
    const icon = r.code === 200 ? '✅' : r.code === 302 ? '🔄' : '⚠️';
    console.log(`  ${icon} ${p} → ${r.code}`);
  }

  // Sample detail pages
  console.log('\n=== Detail Pages (sample) ===');
  const details = ['/companies/huahong-semiconductor', '/articles/1', '/events/1', '/jobs/1'];
  for (const p of details) {
    const r = await check(p);
    const icon = r.code === 200 ? '✅' : r.code === 404 ? '❌' : '⚠️';
    console.log(`  ${icon} ${p} → ${r.code} (${(r.size/1024).toFixed(1)}KB)`);
  }
}

main().catch(console.error);
