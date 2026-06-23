const http = require('http');

async function check(path) {
  return new Promise(resolve => {
    http.get('http://localhost:3002' + path, { timeout: 10000 }, res => {
      resolve({ path, code: res.statusCode, type: res.headers['content-type'], size: parseInt(res.headers['content-length'] || '0') });
    }).on('error', e => resolve({ path, code: 'ERR', error: e.message }));
  });
}

(async () => {
  const imgs = [
    '/images/hero/hero-fab.png', '/images/hero/hero-processor.png', '/images/hero/hero-wafer.png',
    '/images/logos/logo-01-chip.png', '/images/logos/logo-10-rf.png',
    '/images/covers/cover-01-chip-macro.png', '/images/covers/cover-10-fiber.png', '/images/covers/cover-20-3d-chip.png',
    '/images/topics/topic-01-ic-design.png', '/images/topics/topic-06-rf.png',
    '/images/testimonials/test-01-executive.png', '/images/testimonials/test-05-product-vp.png',
    '/images/ads/ad-01-tech-grid.png', '/images/ads/ad-03-factory.png',
    '/images/cta/cta-01-factory.png', '/images/cta/cta-02-chips.png'
  ];
  
  let ok = 0, fail = 0;
  for (const p of imgs) {
    const r = await check(p);
    if (r.code === 200 && (r.type || '').startsWith('image/')) {
      ok++;
      console.log(`  OK ${p} -> ${r.code} ${r.type} (${(r.size/1024).toFixed(1)}KB)`);
    } else {
      fail++;
      console.log(`  FAIL ${p} -> ${r.code} ${r.type || 'N/A'} ${r.error || ''}`);
    }
  }
  console.log(`\nResult: ${ok}/${ok+fail} images OK, ${fail} failures`);
})();
