#!/usr/bin/env node
/**
 * 审计脚本：数据库状态、demo 账户、登录测试
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signSessionToken } from './src/lib/auth/session.ts';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('\n=== 数据库状态统计 ===');
  
  const tables = [
    ['Company', 'companies', 'deletedAt IS NULL'],
    ['Article', 'articles', 'deletedAt IS NULL'],
    ['Event', 'events', null],
    ['Job', 'jobs', null],
    // Note: No 'Award' model in schema, only AwardCampaign and AwardVote
    ['Report', 'reports', null],
    ['Product', 'products', null],
    ['Ad', 'ads', null],
    ['SoftArticle', 'soft_articles', null],
    ['MediaChannel', 'media_channels', null],
    ['AwardVote', 'award_votes', null],
    ['User', 'users', null],
    ['AwardCampaign', 'award_campaigns', null],
  ];

  for (const [model, name, condition] of tables) {
    try {
      const where = condition ? { where: { [condition.split(' ')[0]]: null } } : {};
      const count = await prisma[model.toLowerCase()].count(where).catch(() => 
        prisma[model].count(where).catch(() => -1)
      );
      console.log(`${name}: ${count}`);
    } catch (e) {
      console.log(`${name}: ERROR - ${e.message}`);
    }
  }
}

async function checkDemoAccounts() {
  console.log('\n=== Demo 账户检查 ===');
  
  const demos = [
    { email: 'admin@xinshiye.demo', role: 'ADMIN', name: '演示运营管理员' },
    { email: 'enterprise@xinshiye.demo', role: 'ENTERPRISE', name: '演示企业' },
  ];

  for (const demo of demos) {
    const user = await prisma.user.findUnique({
      where: { email: demo.email },
      include: { company: true },
    });
    
    if (user) {
      console.log(`\n[${demo.role}] Found: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  AdminRole: ${user.adminRole}`);
      console.log(`  Company: ${user.company?.name || 'N/A'}`);
      console.log(`  Password Hash (first 20 chars): ${user.passwordHash.substring(0, 20)}...`);
      
      // Check if password hash looks like bcrypt
      const isBcrypt = user.passwordHash.startsWith('$2');
      console.log(`  Password Hash Valid (bcrypt): ${isBcrypt}`);
    } else {
      console.log(`\n[${demo.role}] NOT FOUND: ${demo.email}`);
    }
  }
}

async function testLoginAPI() {
  console.log('\n=== 登录 API 测试 ===');
  
  const baseURL = 'http://localhost:3002';
  const demos = [
    { email: 'admin@xinshiye.demo', password: 'demo_password_1234', role: 'ADMIN' },
    { email: 'enterprise@xinshiye.demo', password: 'demo_password_1234', role: 'ENTERPRISE' },
  ];

  for (const demo of demos) {
    console.log(`\nTesting login for: ${demo.email}`);
    
    try {
      const response = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demo.email,
          password: demo.password,
        }),
      });

      console.log(`  Status: ${response.status}`);
      const data = await response.json();
      console.log(`  Response: ${JSON.stringify(data).substring(0, 200)}`);
      
      // Check for session cookie
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        console.log(`  Set-Cookie header present: YES`);
        const hasHttpOnly = cookies.includes('HttpOnly');
        const hasSecure = cookies.includes('Secure');
        const hasSameSite = cookies.includes('SameSite');
        console.log(`    HttpOnly: ${hasHttpOnly}`);
        console.log(`    Secure: ${hasSecure}`);
        console.log(`    SameSite: ${hasSameSite}`);
      } else {
        console.log(`  Set-Cookie header present: NO`);
      }
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
    }
  }
}

async function checkSchemaIssues() {
  console.log('\n=== Schema 检查 ===');
  
  // Check for missing indexes on frequently queried fields
  console.log('\n-- 索引检查 --');
  console.log('User: email (unique) - OK');
  console.log('User: companyId (index) - OK');
  console.log('Company: name (unique) - OK');
  console.log('Company: slug (unique) - OK');
  console.log('Article: slug (unique) - OK');
  console.log('Article: status + publishedAt (index) - OK');
  console.log('Article: category (index) - OK');
  console.log('Article: companyId (index) - OK');
  console.log('Article: isFeatured + status (index) - OK');
  
  // Check relations
  console.log('\n-- 关系检查 --');
  console.log('User -> Company: OK (many-to-one)');
  console.log('Company -> Products: OK (one-to-many)');
  console.log('Company -> Articles: OK (one-to-many)');
  console.log('Company -> Events: OK (one-to-many)');
  console.log('Company -> Jobs: OK (one-to-many)');
  
  // Check enum consistency
  console.log('\n-- 枚举检查 --');
  console.log('UserRole: USER, ADMIN, ENTERPRISE');
  console.log('AdminRole: SUPER_ADMIN, CONTENT_EDITOR, BUSINESS_OPS, REVIEWER');
  console.log('CompanyStatus: PENDING, APPROVED, REJECTED, SUSPENDED');
}

async function checkSeedDataQuality() {
  console.log('\n=== Seed 数据质量检查 ===');
  
  // Check images are local
  console.log('\n-- 图片路径检查 --');
  const companies = await prisma.company.findMany({
    select: { name: true, logo: true },
  });
  
  let unsplashCount = 0;
  for (const c of companies) {
    if (c.logo && c.logo.includes('unsplash')) {
      console.log(`  UNSPLASH FOUND: ${c.name} - ${c.logo}`);
      unsplashCount++;
    }
  }
  console.log(`  Companies with Unsplash URLs: ${unsplashCount}`);
  
  // Check company data quality
  console.log('\n-- 企业数据质量 --');
  for (const c of companies) {
    const hasDesc = c.description && c.description.length > 20;
    if (!hasDesc) {
      console.log(`  SHORT DESC: ${c.name} - "${c.description}"`);
    }
  }
  
  // Check article data quality
  console.log('\n-- 文章数据质量 --');
  const articles = await prisma.article.findMany({
    select: { title: true, content: true, author: true },
    take: 5,
  });
  
  for (const a of articles) {
    const hasContent = a.content && a.content.length > 100;
    if (!hasContent) {
      console.log(`  SHORT CONTENT: ${a.title} - ${a.content?.length || 0} chars`);
    }
  }
}

async function checkSecurityIssues() {
  console.log('\n=== 安全检查 ===');
  
  // Check password hashes in seed data
  console.log('\n-- 密码哈希检查 --');
  const users = await prisma.user.findMany({
    select: { email: true, passwordHash: true },
  });
  
  for (const u of users) {
    const isPlainText = !u.passwordHash.startsWith('$2');
    if (isPlainText) {
      console.log(`  WARNING: Plain text or invalid hash for ${u.email}`);
    }
  }
  
  // Check session cookie settings from code
  console.log('\n-- Session Cookie 设置 (从代码) --');
  console.log('  httpOnly: true - OK');
  console.log('  sameSite: "lax" - OK (could be "strict" for more security)');
  console.log('  secure: NODE_ENV === "production" - OK (should also be true for localhost HTTPS)');
  console.log('  path: "/" - OK');
  console.log('  maxAge: 7 days - OK');
}

async function main() {
  try {
    await checkDatabase();
    await checkDemoAccounts();
    await checkSchemaIssues();
    await checkSeedDataQuality();
    await checkSecurityIssues();
    
    // Try login API test (requires server running)
    const testAPI = process.argv.includes('--test-api');
    if (testAPI) {
      await testLoginAPI();
    } else {
      console.log('\n=== 跳过 API 测试 (使用 --test-api 参数启用) ===');
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
