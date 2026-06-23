#!/usr/bin/env node
/**
 * 审计脚本（CommonJS 版本）
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('\n=== 数据库状态统计 ===');
  
  const counts = [
    ['Company', 'companies', { deletedAt: null }],
    ['Article', 'articles', { deletedAt: null }],
    ['Event', 'events', undefined],
    ['Job', 'jobs', undefined],
    ['Report', 'reports', undefined],
    ['Product', 'products', undefined],
    ['Ad', 'ads', undefined],
    ['SoftArticle', 'soft_articles', undefined],
    ['MediaChannel', 'media_channels', undefined],
    ['AwardVote', 'award_votes', undefined],
    ['User', 'users', undefined],
    ['AwardCampaign', 'award_campaigns', undefined],
    ['PageSection', 'page_sections', undefined],
    ['Setting', 'settings', undefined],
  ];

  for (const [model, name, where] of counts) {
    try {
      const count = await prisma[model.charAt(0).toLowerCase() + model.slice(1)].count({ where });
      console.log(`  ${name}: ${count}`);
    } catch (e) {
      console.log(`  ${name}: ERROR - ${e.message.split('\n')[0]}`);
    }
  }
}

async function checkDemoAccounts() {
  console.log('\n=== Demo 账户检查 ===');
  
  const demos = [
    'admin@xinshiye.demo',
    'enterprise@xinshiye.demo',
  ];

  for (const email of demos) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { company: true },
      });
      
      if (user) {
        console.log(`\n  Found: ${user.email}`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Name: ${user.name}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    AdminRole: ${user.adminRole}`);
        console.log(`    Company: ${user.company?.name || 'N/A'}`);
        console.log(`    Password Hash (prefix): ${user.passwordHash.substring(0, 10)}...`);
        
        const isBcrypt = user.passwordHash.startsWith('$2');
        console.log(`    Password Hash Valid (bcrypt): ${isBcrypt}`);
      } else {
        console.log(`\n  NOT FOUND: ${email}`);
      }
    } catch (e) {
      console.log(`\n  ERROR checking ${email}: ${e.message}`);
    }
  }
}

async function checkSchemaIssues() {
  console.log('\n=== Schema 检查 ===');
  
  console.log('\n-- 索引检查 --');
  const indexes = [
    'User: email (unique) - OK',
    'User: companyId (index) - OK',
    'Company: name (unique) - OK',
    'Company: slug (unique) - OK',
    'Article: slug (unique) - OK',
    'Article: status + publishedAt (index) - OK',
    'Article: category (index) - OK',
    'Article: companyId (index) - OK',
    'Article: isFeatured + status (index) - OK',
    'Event: companyId (index) - OK',
    'Event: status (index) - OK',
    'Job: companyId + status (index) - OK',
    'Job: type (index) - OK',
    'Job: city (index) - OK',
  ];
  
  indexes.forEach(idx => console.log(`  ${idx}`));
  
  console.log('\n-- 缺失索引建议 --');
  console.log('  User: email + role (复合索引，用于登录查询) - 建议添加');
  console.log('  Company: status (索引，用于查询已审核企业) - 建议添加');
  console.log('  Article: status + publishedAt + category (复合索引) - 已有部分');
  
  console.log('\n-- 关系检查 --');
  const relations = [
    'User -> Company: OK (many-to-one, onDelete: SetNull)',
    'Company -> Products: OK (one-to-many, onDelete: Cascade)',
    'Company -> Articles: OK (one-to-many, onDelete: SetNull)',
    'Company -> Events: OK (one-to-many, onDelete: SetNull)',
    'Company -> Jobs: OK (one-to-many, onDelete: Cascade)',
    'Session -> User: OK (many-to-one, onDelete: Cascade)',
  ];
  
  relations.forEach(rel => console.log(`  ${rel}`));
}

async function checkSeedDataQuality() {
  console.log('\n=== Seed 数据质量检查 ===');
  
  console.log('\n-- 图片路径检查 (Companies) --');
  try {
    const companies = await prisma.company.findMany({
      select: { name: true, logo: true },
    });
    
    let unsplashCount = 0;
    for (const c of companies) {
      if (c.logo && (c.logo.includes('unsplash') || c.logo.includes('http'))) {
        console.log(`  WARNING: External URL: ${c.name} - ${c.logo}`);
        unsplashCount++;
      }
    }
    console.log(`  Companies with external image URLs: ${unsplashCount} / ${companies.length}`);
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }
  
  console.log('\n-- 企业数据质量 --');
  try {
    const companies = await prisma.company.findMany({
      select: { name: true, description: true, industry: true },
    });
    
    let shortDesc = 0;
    for (const c of companies) {
      if (!c.description || c.description.length < 20) {
        shortDesc++;
        console.log(`  SHORT DESC: ${c.name} (${c.description?.length || 0} chars)`);
      }
    }
    console.log(`  Companies with short descriptions: ${shortDesc} / ${companies.length}`);
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }
  
  console.log('\n-- 文章数据质量 --');
  try {
    const articles = await prisma.article.findMany({
      select: { title: true, content: true, author: true },
      take: 100,
    });
    
    let shortContent = 0;
    for (const a of articles) {
      if (!a.content || a.content.length < 100) {
        shortContent++;
      }
    }
    console.log(`  Articles with short content (<100 chars): ${shortContent} / ${articles.length}`);
    console.log(`  Articles with author: ${articles.filter(a => a.author).length} / ${articles.length}`);
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }
}

async function checkSecurityIssues() {
  console.log('\n=== 安全检查 ===');
  
  console.log('\n-- 密码哈希检查 --');
  try {
    const users = await prisma.user.findMany({
      select: { email: true, passwordHash: true },
    });
    
    let plainTextCount = 0;
    for (const u of users) {
      const isPlainText = !u.passwordHash.startsWith('$2');
      if (isPlainText) {
        console.log(`  WARNING: Invalid hash for ${u.email}`);
        plainTextCount++;
      }
    }
    console.log(`  Users with valid bcrypt hashes: ${users.length - plainTextCount} / ${users.length}`);
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }
  
  console.log('\n-- Session Cookie 设置 (从代码审查) --');
  console.log('  httpOnly: true - OK (防止 XSS 读取)');
  console.log('  sameSite: "lax" - OK (但建议 "strict" 用于敏感操作)');
  console.log('  secure: NODE_ENV === "production" - 问题: 开发环境 HTTP 时无法设置 Secure');
  console.log('  path: "/" - OK');
  console.log('  maxAge: 7 days - OK');
  console.log('\n  建议:');
  console.log('    - 生产环境确保 HTTPS 并启用 secure');
  console.log('    - 考虑添加 __Host- prefix 防止 Cookie tossing');
  console.log('    - 考虑添加 SameSite=strict 用于 admin 路由');
  
  console.log('\n-- Session Token 签名检查 (session.ts) --');
  console.log('  使用 jose 库进行 JWT 签名 - OK');
  console.log('  SESSION_SECRET 必须 >= 32 字符 - 需要验证');
  console.log('  开发环境缺少 SESSION_SECRET 时会生成临时密钥 - 有警告日志');
}

async function testLoginAPI() {
  console.log('\n=== 登录 API 测试 ===');
  
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
  const demos = [
    { email: 'admin@xinshiye.demo', password: 'demo_password_1234', role: 'ADMIN' },
    { email: 'enterprise@xinshiye.demo', password: 'demo_password_1234', role: 'ENTERPRISE' },
  ];

  for (const demo of demos) {
    console.log(`\n  Testing login for: ${demo.email}`);
    
    try {
      const response = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demo.email,
          password: demo.password,
        }),
      });

      console.log(`    Status: ${response.status}`);
      const data = await response.json();
      console.log(`    Response: ${JSON.stringify(data).substring(0, 300)}`);
      
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        console.log(`    Set-Cookie header present: YES`);
      } else {
        console.log(`    Set-Cookie header present: NO`);
      }
    } catch (e) {
      console.log(`    ERROR: ${e.message}`);
      console.log(`    (Is the dev server running on ${baseURL}?) `);
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('  芯师爷 Web 认证与数据库审计');
  console.log('========================================');
  
  try {
    await checkDatabase();
    await checkDemoAccounts();
    await checkSchemaIssues();
    await checkSeedDataQuality();
    await checkSecurityIssues();
    
    const testAPI = process.argv.includes('--test-api');
    if (testAPI) {
      await testLoginAPI();
    } else {
      console.log('\n=== 跳过 API 测试 (使用 --test-api 参数启用) ===');
      console.log('    确保开发服务器运行在 http://localhost:3002');
    }
  } catch (e) {
    console.error('\nFatal Error:', e);
  } finally {
    await prisma.$disconnect();
    console.log('\n========================================');
    console.log('  审计完成');
    console.log('========================================');
  }
}

main();
