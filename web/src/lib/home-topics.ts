/** 首页「专题」入口 — 可由后续 CMS 替换 */
export const HOME_TOPICS = [
  {
    slug: "design",
    title: "IC 设计",
    description: "从 RTL 到签核：架构取舍、验证闭环与先进节点下的功耗墙",
    href: "/articles?category=IC%E8%AE%BE%E8%AE%A1",
  },
  {
    slug: "manufacturing",
    title: "制造与封测",
    description: "良率曲线背后的设备节拍、材料一致性与供应链韧性",
    href: "/articles?category=%E5%88%B6%E9%80%A0",
  },
  {
    slug: "auto",
    title: "汽车电子",
    description: "功能安全、预期功能安全与车规物料的长期主义",
    href: "/articles?category=%E6%B1%BD%E8%BD%A6%E7%94%B5%E5%AD%90",
  },
  {
    slug: "ai-chip",
    title: "AI 算力芯片",
    description: "集群互联、内存墙与软件栈如何共同决定落地成本",
    href: "/articles?category=AI%E8%8A%AF%E7%89%87",
  },
] as const;
