import "dotenv/config";
import {
  Prisma,
  PrismaClient,
  ArticleStatus,
  CompanyStatus,
  UserRole,
  EventType,
  EventStatus,
  JobType,
  JobStatus,
  SoftArticleStatus,
  MediaChannelType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  articles,
  awardCampaigns,
  companies,
  events,
  jobs,
  products,
  reports,
  pageSections,
  pageSectionItems,
  mediaChannels,
  softArticles,
  unsplash,
  PH,
} from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  const seedPassword = process.env.SEED_DEMO_PASSWORD;
  if (!seedPassword || seedPassword.length < 12) {
    throw new Error("SEED_DEMO_PASSWORD must be set and at least 12 characters before running seed");
  }

  // In a fresh migration reset, some tables may not exist yet when deleteMany runs.
  // Use try/catch for each cleanup to handle fresh schema gracefully.
  const cleanups: Array<() => Promise<unknown>> = [
    () => prisma.auditLog.deleteMany(),
    () => prisma.setting.deleteMany(),
    () => prisma.pageSectionItem.deleteMany(),
    () => prisma.pageSection.deleteMany(),
    () => prisma.ad.deleteMany(),
    () => prisma.adSlot.deleteMany(),
    () => prisma.jobApplication.deleteMany(),
    () => prisma.job.deleteMany(),
    () => prisma.eventRegistration.deleteMany(),
    () => prisma.event.deleteMany(),
    () => prisma.article.deleteMany(),
    () => prisma.product.deleteMany(),
    () => prisma.softArticleChannel.deleteMany(),
    () => prisma.softArticleMetric.deleteMany(),
    () => prisma.softArticle.deleteMany(),
    () => prisma.mediaChannel.deleteMany(),
    () => prisma.session.deleteMany(),
    () => prisma.user.deleteMany(),
    () => prisma.awardCampaign.deleteMany(),
    () => prisma.report.deleteMany(),
    () => prisma.company.deleteMany(),
  ];
  for (const cleanup of cleanups) {
    try {
      await cleanup();
    } catch {
      // table may not exist yet on fresh schema — safe to ignore
    }
  }

  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const now = new Date();
  const bySlug = new Map<string, string>();

  for (const c of companies) {
    const row = await prisma.company.create({
      data: {
        name: c.name,
        slug: c.slug,
        logo: c.logo,
        description: c.description,
        website: c.website,
        industry: c.industry,
        scale: c.scale,
        city: c.city,
        status: c.approved ? CompanyStatus.APPROVED : CompanyStatus.PENDING,
      },
    });
    bySlug.set(c.slug, row.id);
  }

  const huaxinId = bySlug.get("huaxin-precision");
  if (!huaxinId) throw new Error("seed: missing huaxin-precision");

  for (const p of products) {
    const companyId = bySlug.get(p.companySlug);
    if (!companyId) continue;
    await prisma.product.create({
      data: {
        companyId,
        name: p.name,
        category: p.category,
        description: p.description,
        status: CompanyStatus.APPROVED,
        sort: p.sort,
      },
    });
  }

  for (const a of articles) {
    await prisma.article.create({
      data: {
        title: a.title,
        slug: a.slug,
        summary: a.summary,
        content: a.content,
        coverImage: a.cover,
        category: a.category,
        tags: [...a.tags],
        author: a.author,
        source: a.source,
        companyId: a.companySlug ? bySlug.get(a.companySlug) ?? null : null,
        isFeatured: a.isFeatured,
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(now.getTime() - a.daysAgo * 86400000),
        viewCount: Math.floor(800 + Math.random() * 12000),
      },
    });
  }

  /** 后台演示：草稿 / 待审 */
  await prisma.article.createMany({
    data: [
      {
        title: "【草稿】晶圆级键合界面缺陷：SEM 与超声扫描的对照方法",
        slug: "draft-wafer-bonding-defect-methods",
        summary: "产线工程师内参，整理中。",
        content: "## 待补充\n\n图表与样例图片整理中。",
        category: "制造",
        tags: ["封装", "检测"],
        author: "芯师爷编辑部",
        source: "内部",
        status: ArticleStatus.DRAFT,
        isFeatured: false,
      },
      {
        title: "【待审】RISC-V 安全扩展在车载网关中的落地评估",
        slug: "pending-riscv-security-vehicle-gateway",
        summary: "企业投稿，编辑审核中。",
        content: "## 摘要\n\n投稿正文略。",
        category: "汽车电子",
        tags: ["RISC-V", "安全"],
        author: "匿名投稿",
        source: "企业投稿",
        status: ArticleStatus.PENDING_REVIEW,
        isFeatured: false,
      },
      {
        title: "【归档】2025 年度半导体行业十大关键词回顾",
        slug: "archived-2025-top-10-keywords",
        summary: "2025 年度回顾文章，已归档。",
        content: "## 回顾\n\n内容已归档。",
        category: "市场分析",
        tags: ["年度回顾"],
        author: "芯师爷编辑部",
        source: "芯师爷原创",
        status: ArticleStatus.ARCHIVED,
        isFeatured: false,
        publishedAt: new Date(now.getTime() - 365 * 86400000),
      },
    ],
  });

  for (const e of events) {
    const start = new Date(now.getTime() + e.daysStart * 86400000);
    const end = new Date(start.getTime() + e.hoursDuration * 3600000);
    const status =
      "status" in e && e.status === "ONGOING" ? EventStatus.ONGOING : EventStatus.UPCOMING;
    await prisma.event.create({
      data: {
        companyId: e.companySlug ? bySlug.get(e.companySlug) ?? null : null,
        title: e.title,
        description: e.description,
        type: e.type as EventType,
        startDate: start,
        endDate: end,
        location: e.location,
        coverImage: e.cover,
        status,
        isFeatured: e.featured,
      },
    });
  }

  for (const j of jobs) {
    const companyId = bySlug.get(j.companySlug);
    if (!companyId) continue;
    await prisma.job.create({
      data: {
        companyId,
        title: j.title,
        city: j.city,
        type: j.type as JobType,
        experience: j.experience,
        education: j.education,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        description: j.description,
        requirements: j.requirements,
        status: JobStatus.PUBLISHED,
        viewCount: Math.floor(50 + Math.random() * 800),
      },
    });
  }

  for (const r of reports) {
    await prisma.report.create({
      data: {
        title: r.title,
        description: r.description,
        coverImage: r.cover,
        category: r.category,
        tags: [...r.tags],
        price: r.price,
        publishedAt: new Date(now.getTime() - r.daysAgo * 86400000),
        downloadCount: Math.floor(30 + Math.random() * 500),
      },
    });
  }

  for (const ac of awardCampaigns) {
    await prisma.awardCampaign.create({
      data: {
        slug: ac.slug,
        title: ac.title,
        summary: ac.summary,
        year: ac.year,
        startDate: new Date(now.getTime() + ac.daysStart * 86400000),
        endDate: new Date(now.getTime() + ac.daysEnd * 86400000),
        active: ac.active,
      },
    });
  }

  const slot = await prisma.adSlot.create({
    data: {
      code: "home_hero_banner",
      title: "首页首屏赞助位",
      active: true,
    },
  });

  await prisma.ad.createMany({
    data: [
      {
        slotId: slot.id,
        title: "与芯师爷共建「可验证的技术叙事」",
        image: "/images/ads/ad-01-tech-grid.png",
        link: "/about",
        sort: 0,
        startDate: new Date(now.getTime() - 86400000 * 14),
        endDate: new Date(now.getTime() + 86400000 * 350),
        active: true,
      },
      {
        slotId: slot.id,
        title: "半导体产业内容合作开放：专题、白皮书与活动联动",
        image: "/images/ads/ad-02-wafer.png",
        link: "/enterprise/login",
        sort: 1,
        startDate: new Date(now.getTime() - 86400000 * 7),
        endDate: new Date(now.getTime() + 86400000 * 220),
        active: true,
      },
      {
        slotId: slot.id,
        title: "把复杂技术讲清楚：品牌内容工程化交付方案",
        image: "/images/ads/ad-03-factory.png",
        link: "/reports",
        sort: 2,
        startDate: new Date(now.getTime() - 86400000 * 3),
        endDate: new Date(now.getTime() + 86400000 * 180),
        active: true,
      },
    ],
  });

  await prisma.user.create({
    data: {
      email: "admin@xinshiye.dev",
      passwordHash,
      name: "超级管理员",
      role: UserRole.ADMIN,
      adminRole: "SUPER_ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "editor@xinshiye.dev",
      passwordHash,
      name: "内容编辑",
      role: UserRole.ADMIN,
      adminRole: "CONTENT_EDITOR",
    },
  });

  await prisma.user.create({
    data: {
      email: "business@xinshiye.dev",
      passwordHash,
      name: "商务运营",
      role: UserRole.ADMIN,
      adminRole: "BUSINESS_OPS",
    },
  });

  await prisma.user.create({
    data: {
      email: "reviewer@xinshiye.dev",
      passwordHash,
      name: "审核员",
      role: UserRole.ADMIN,
      adminRole: "REVIEWER",
    },
  });

  await prisma.user.create({
    data: {
      email: "enterprise@xinshiye.dev",
      passwordHash,
      name: "企业演示账号",
      role: UserRole.ENTERPRISE,
      companyId: huaxinId,
    },
  });

  // 页面板块种子数据
  const sectionIdByCode = new Map<string, string>();
  for (const sec of pageSections) {
    const created = await prisma.pageSection.create({
      data: {
        type: sec.type,
        code: sec.code,
        title: sec.title,
        sort: sec.sort,
        active: sec.active,
        settings: Prisma.JsonNull,
      },
    });
    sectionIdByCode.set(sec.code, created.id);
  }

  for (const item of pageSectionItems) {
    const sectionId = sectionIdByCode.get(item.sectionCode);
    if (!sectionId) continue;
    await prisma.pageSectionItem.create({
      data: {
        sectionId,
        title: item.title,
        subtitle: item.subtitle ?? null,
        description: item.description ?? null,
        image: item.image ?? null,
        link: item.link ?? null,
        linkText: item.linkText ?? null,
        sort: item.sort,
        active: item.active,
        extra: item.extra as Prisma.InputJsonValue,
      },
    });
  }

  // 系统默认设置
  const settings = [
    { key: "site_name", value: { zh: "芯师爷" } },
    { key: "site_description", value: { zh: "面向半导体产业的编辑型媒体与企业服务入口" } },
    { key: "default_seo_title", value: { zh: "芯师爷 — 半导体产业垂直媒体与服务平台" } },
    { key: "article_categories", value: ["IC设计", "制造与封测", "汽车电子", "AI算力芯片", "光通信", "EDA", "半导体设备", "医疗电子", "互连", "材料", "市场分析"] },
    { key: "industry_options", value: ["IC设计", "制造与封测", "汽车电子", "AI算力芯片", "光通信", "EDA/IP", "半导体设备", "材料", "封测", "功率器件", "互连", "分销", "医疗电子", "前沿探索"] },
    { key: "company_scale_options", value: ["<50", "50-200", "200-500", "500-2000", "2000-10000", "10000+"] },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  // 媒体渠道种子数据
  const channelIdByName = new Map<string, string>();
  for (const mc of mediaChannels) {
    const row = await prisma.mediaChannel.create({
      data: {
        name: mc.name,
        type: mc.type as MediaChannelType,
        url: mc.url,
        description: mc.description,
        active: mc.active,
      },
    });
    channelIdByName.set(mc.name, row.id);
  }

  // 软文种子数据
  for (const sa of softArticles) {
    const companyId = bySlug.get(sa.companySlug);
    if (!companyId) continue;
    
    const publishedAt = sa.status === "PUBLISHED" ? new Date(now.getTime() - 7 * 86400000) : null;
    const article = await prisma.softArticle.create({
      data: {
        companyId,
        title: sa.title,
        content: sa.content,
        summary: sa.summary,
        coverImage: sa.coverImage,
        author: sa.author,
        seoKeywords: sa.seoKeywords,
        status: sa.status as SoftArticleStatus,
        publishedAt,
      },
    });

    // 为每篇软文关联 2-3 个渠道
    const channelNames = Array.from(channelIdByName.keys());
    const assignedChannels = channelNames.slice(0, Math.min(3, channelNames.length));
    for (const chName of assignedChannels) {
      const channelId = channelIdByName.get(chName);
      if (!channelId) continue;
      await prisma.softArticleChannel.create({
        data: {
          softArticleId: article.id,
          channelId,
          status: sa.status === "PUBLISHED" ? "published" : "pending",
          publishedUrl: sa.status === "PUBLISHED" ? `https://example.com/xinshiye/soft/${article.id}` : null,
          publishedAt: sa.status === "PUBLISHED" ? publishedAt : null,
        },
      });
    }

    // 为已发布软文添加一些指标数据
    if (sa.status === "PUBLISHED") {
      const channels = ["WECHAT_MP", "TOUTIAO", "ZHIHU"];
      for (const ch of channels) {
        await prisma.softArticleMetric.create({
          data: {
            softArticleId: article.id,
            channel: ch,
            views: Math.floor(500 + Math.random() * 5000),
            shares: Math.floor(10 + Math.random() * 200),
            comments: Math.floor(3 + Math.random() * 30),
            likes: Math.floor(20 + Math.random() * 300),
            date: new Date(now.getTime() - Math.floor(Math.random() * 7) * 86400000),
          },
        });
      }
    }
  }

  console.log(
    "Seed OK — 演示账号: admin@xinshiye.dev / editor@xinshiye.dev / business@xinshiye.dev / reviewer@xinshiye.dev / enterprise@xinshiye.dev（密码为 SEED_DEMO_PASSWORD）\n" +
      `企业 ${bySlug.size} 家 · 资讯 ${articles.length + 3} 篇（含草稿/待审/归档）· 活动 ${events.length} · 招聘 ${jobs.length} · 报告 ${reports.length} · 媒体渠道 ${mediaChannels.length} · 软文 ${softArticles.length} · 页面板块 ${pageSections.length} 个 · 条目 ${pageSectionItems.length} 个`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
