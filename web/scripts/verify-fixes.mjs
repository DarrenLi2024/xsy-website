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
  });
}

async function main() {
  console.log('=== P0 Fix Verifications ===\n');

  // 1. Check enterprise/register now works
  const reg = await check('/enterprise/register');
  const regIcon = reg.code === 200 ? '✅' : '❌';
  console.log(`${regIcon} Enterprise Register: ${reg.code} (was 307, now should be 200)`);

  // 2. Check homepage still works (Hooks fix)
  const home = await check('/');
  const homeIcon = home.code === 200 ? '✅' : '❌';
  console.log(`${homeIcon} Homepage: ${home.code} (should be 200)`);

  // 3. Check admin login still works
  const adminLogin = await check('/admin/login');
  const alIcon = adminLogin.code === 200 ? '✅' : '❌';
  console.log(`${alIcon} Admin Login: ${adminLogin.code} (should be 200)`);

  // 4. Check enterprise login still works
  const entLogin = await check('/enterprise/login');
  const elIcon = entLogin.code === 200 ? '✅' : '❌';
  console.log(`${elIcon} Enterprise Login: ${entLogin.code} (should be 200)`);

  // 5. Admin pages should still redirect (not logged in)
  const adminDash = await check('/admin');
  const adIcon = adminDash.code === 307 ? '✅' : '❌';
  console.log(`${adIcon} Admin redirect: ${adminDash.code} (should be 307)`);

  console.log('\n=== All checks complete ===');
}

main().catch(console.error);
