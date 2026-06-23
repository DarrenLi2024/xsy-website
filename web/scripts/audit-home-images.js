const http = require('http');

http.get('http://localhost:3002/', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    // Extract all image src
    const imgs = html.match(/src="([^"]*\.(?:png|jpg|jpeg|webp|svg))"/gi) || [];
    const deduped = [...new Set(imgs.map(s => s.replace(/^src="/, '').replace(/"$/, '')))];
    
    // Categorize
    const hero = deduped.filter(p => p.includes('/hero/'));
    const logos = deduped.filter(p => p.includes('/logos/'));
    const covers = deduped.filter(p => p.includes('/covers/'));
    const ads = deduped.filter(p => p.includes('/ads/'));
    const topics = deduped.filter(p => p.includes('/topics/'));
    const testimonials = deduped.filter(p => p.includes('/testimonials/'));
    const cta = deduped.filter(p => p.includes('/cta/'));
    
    console.log(`首页HTML大小: ${(html.length/1024).toFixed(1)}KB`);
    console.log(`渲染图片总数: ${deduped.length} (去重)`);
    console.log();
    
    if (hero.length) { console.log(`Hero (${hero.length}):`); hero.forEach(p => console.log(`  ${p}`)); }
    if (ads.length) { console.log(`Ads (${ads.length}):`); ads.forEach(p => console.log(`  ${p}`)); }
    if (covers.length) { console.log(`Covers (${covers.length}):`); covers.forEach(p => console.log(`  ${p}`)); }
    if (logos.length) { console.log(`Logos (${logos.length}):`); logos.forEach(p => console.log(`  ${p}`)); }
    if (topics.length) { console.log(`Topics (${topics.length}):`); topics.forEach(p => console.log(`  ${p}`)); }
    if (testimonials.length) { console.log(`Testimonials (${testimonials.length}):`); testimonials.forEach(p => console.log(`  ${p}`)); }
    if (cta.length) { console.log(`CTA (${cta.length}):`); cta.forEach(p => console.log(`  ${p}`)); }
    
    console.log();
    console.log('=== 未在首页渲染的图片类别 ===');
    if (!topics.length) console.log('  ❌ Topics: 0/6 渲染 (topic-01~06 完全未使用)');
    if (!testimonials.length) console.log('  ❌ Testimonials: 0/5 渲染 (test-01~05 完全未使用)');
    if (!cta.length) console.log('  ❌ CTA: 0/2 渲染 (cta-01~02 完全未使用)');
    
    // Check logo duplicates (same path appearing multiple times in HTML)
    const logoCounts = {};
    logos.forEach(p => { logoCounts[p] = (logoCounts[p] || 0) + 1; });
    const dups = Object.entries(logoCounts).filter(([_, c]) => c > 1);
    if (dups.length) {
      console.log(`\n=== 重复Logo (${dups.length}个): ===`);
      dups.forEach(([p, c]) => console.log(`  🔄 ${p} → ${c}次`));
    }
  });
}).on('error', e => console.error('Error:', e.message));
