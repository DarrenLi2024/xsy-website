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
  console.log('=== Detail Pages with real slugs ===');
  const details = [
    '/companies/beiming-equipment',
    '/companies/zhujie-power',
    '/companies/jiuzhang-test',
  ];
  for (const p of details) {
    const r = await check(p);
    const icon = r.code === 200 ? '✅' : r.code === 404 ? '❌' : '⚠️';
    console.log(`  ${icon} ${p} → ${r.code} (${(r.size/1024).toFixed(1)}KB)`);
  }

  console.log('\n=== Enterprise Register (different path) ===');
  const r2 = await check('/enterprise/register');
  console.log(`  ⚠️ /enterprise/register → ${r2.code}`);

  // Check 404 page
  console.log('\n=== 404 & Error Pages ===');
  const r3 = await check('/nonexistent-page');
  console.log(`  Not Found → ${r3.code} (${(r3.size/1024).toFixed(1)}KB)`);
}

main().catch(console.error);
