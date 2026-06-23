const http = require('http');

const baseUrl = 'http://localhost:3002/images';
const images = [
  // hero (3)
  '/hero/hero-fab.png',
  '/hero/hero-processor.png',
  '/hero/hero-wafer.png',
  // logos (10)
  '/logos/logo-01-chip.png',
  '/logos/logo-02-crystal.png',
  '/logos/logo-03-processor.png',
  '/logos/logo-04-pcb.png',
  '/logos/logo-05-cleanroom.png',
  '/logos/logo-06-wave.png',
  '/logos/logo-07-power.png',
  '/logos/logo-08-eda.png',
  '/logos/logo-09-memory.png',
  '/logos/logo-10-rf.png',
  // covers (sample 5)
  '/covers/cover-01-chip-macro.png',
  '/covers/cover-05-cleanroom.png',
  '/covers/cover-10-fiber.png',
  '/covers/cover-15-automotive.png',
  '/covers/cover-20-3d-chip.png',
  // topics (6)
  '/topics/topic-01-ic-design.png',
  '/topics/topic-02-manufacturing.png',
  '/topics/topic-03-automotive.png',
  '/topics/topic-04-ai-chip.png',
  '/topics/topic-05-storage.png',
  '/topics/topic-06-rf.png',
  // testimonials (5)
  '/testimonials/test-01-executive.png',
  '/testimonials/test-02-engineer-f.png',
  '/testimonials/test-03-investor.png',
  '/testimonials/test-04-brand-dir.png',
  '/testimonials/test-05-product-vp.png',
  // ads (3)
  '/ads/ad-01-tech-grid.png',
  '/ads/ad-02-wafer.png',
  '/ads/ad-03-factory.png',
  // cta (2)
  '/cta/cta-01-factory.png',
  '/cta/cta-02-chips.png',
];

function headRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        headers: res.headers,
      });
    });
    req.on('error', (err) => reject({ url, error: err.message }));
    req.setTimeout(5000, () => {
      req.destroy();
      reject({ url, error: 'timeout' });
    });
    req.end();
  });
}

async function main() {
  console.log(`Testing ${images.length} images via HTTP HEAD...\n`);
  console.log('='.repeat(80));
  
  const results = [];
  const errors = [];
  
  for (const img of images) {
    const url = baseUrl + img;
    try {
      const result = await headRequest(url);
      const contentType = result.headers['content-type'] || 'N/A';
      const contentLength = result.headers['content-length'] || 'N/A';
      const ok = result.status === 200 && contentType.includes('image/png');
      
      results.push({
        path: img,
        status: result.status,
        contentType,
        contentLength,
        ok,
      });
      
      console.log(`${ok ? '✓' : '✗'} ${img}`);
      console.log(`  Status: ${result.status}, Content-Type: ${contentType}, Length: ${contentLength}`);
    } catch (err) {
      errors.push({ path: img, error: err.error || String(err) });
      console.log(`✗ ${img}`);
      console.log(`  ERROR: ${err.error || String(err)}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\nSUMMARY:');
  console.log(`  Total tested: ${images.length}`);
  console.log(`  OK:           ${results.filter(r => r.ok).length}`);
  console.log(`  Failed:       ${results.filter(r => !r.ok).length + errors.length}`);
  
  const notOk = results.filter(r => !r.ok);
  if (notOk.length > 0) {
    console.log('\nFAILED IMAGES:');
    notOk.forEach(r => {
      console.log(`  ${r.path}: status=${r.status}, content-type=${r.contentType}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\nERROR IMAGES:');
    errors.forEach(e => {
      console.log(`  ${e.path}: ${e.error}`);
    });
  }
}

main().catch(console.error);
