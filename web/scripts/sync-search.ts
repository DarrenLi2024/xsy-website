#!/usr/bin/env node

import { prisma } from "../src/lib/prisma";
import { getSearchClient, ensureIndexes } from "../src/lib/search";
import { ArticleStatus, CompanyStatus } from "@prisma/client";

async function main() {
  console.log("🔍 开始同步搜索引擎索引...\n");

  const client = getSearchClient();

  // Ensure indexes exist with correct settings
  await ensureIndexes();

  // --- Index Companies ---
  console.log("📦 同步企业数据...");
  const companies = await prisma.company.findMany({
    where: { status: CompanyStatus.APPROVED, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      industry: true,
      city: true,
      status: true,
      createdAt: true,
    },
  });
  await client.index("companies").addDocuments(companies);
  console.log(`   ✓ 已索引 ${companies.length} 家企业`);

  // --- Index Articles ---
  console.log("📄 同步文章数据...");
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED, deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      content: true,
      category: true,
      status: true,
      publishedAt: true,
      createdAt: true,
    },
  });
  await client.index("articles").addDocuments(articles);
  console.log(`   ✓ 已索引 ${articles.length} 篇文章`);

  // --- Index Products ---
  console.log("📋 同步产品数据...");
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      companyId: true,
      createdAt: true,
    },
  });
  await client.index("products").addDocuments(products);
  console.log(`   ✓ 已索引 ${products.length} 个产品`);

  console.log("\n✅ 搜索索引同步完成！");
}

main()
  .catch((e) => {
    console.error("❌ 索引同步失败:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
