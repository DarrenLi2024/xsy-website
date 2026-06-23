/**
 * 高质量演示数据：全部配图为 AIGC 生成的专业半导体产业视觉素材
 * 图片存储在 public/images/ 目录下，按类别组织（hero|logos|covers|topics|testimonials|cta|ads）
 * 仅用于本地 / 演示环境 seed，勿将虚构企业当作真实商业主体。
 */

/** 本地 AIGC 图片路径映射（忽略宽度参数，本地图片无需 resize） */
export function unsplash(localPath: string, _w?: number) {
  return localPath;
}

/** 企业 Logo 方形图 */
export function logo(localPath: string) {
  return localPath;
}

/** AIGC 局部图片路径索引（所有图片均为 AI 生成，位于 public/images/ 下） */
export const PH = {
  /** 无尘室 - hero-fab */
  lab: "/images/hero/hero-fab.png",
  /** PCB 电路板特写 */
  board: "/images/covers/cover-06-pcb-dense.png",
  /** 工厂/生产线 */
  factory: "/images/covers/cover-19-factory.png",
  /** 发布会/会议场景 */
  meeting: "/images/covers/cover-18-keynote.png",
  /** 团队协作 / 人物肖像 */
  team: "/images/testimonials/test-01-executive.png",
  /** 电路板互连 */
  collab: "/images/cta/cta-01-factory.png",
  /** 芯片微距 */
  chip: "/images/covers/cover-01-chip-macro.png",
  /** 晶圆抽象 */
  abstract: "/images/covers/cover-04-wafer.png",
  /** 数据中心 */
  space: "/images/covers/cover-03-datacenter.png",
  /** 数据中心服务器 */
  server: "/images/covers/cover-03-datacenter.png",
  /** 电路板 / PCB */
  weld: "/images/covers/cover-02-pcb-line.png",
  /** 程序员 / EDA */
  code: "/images/covers/cover-11-eda.png",
  /** 办公空间 */
  office: "/images/covers/cover-14-office.png",
  /** 晶圆表面微距 */
  waferTone: "/images/covers/cover-04-wafer.png",
  /** 精密加工 */
  precision: "/images/covers/cover-13-soldering.png",
  /** 发布会演讲台 */
  keynote: "/images/covers/cover-18-keynote.png",
  /** 自动化生产线 / 供应链 */
  supply: "/images/covers/cover-19-factory.png",
  /** 无尘室操作 */
  cleanroom: "/images/covers/cover-05-cleanroom.png",
  /** 射频电路 */
  circuit: "/images/covers/cover-17-rf-chamber.png",
  /** 多芯片 3D 封装 */
  multiChip: "/images/covers/cover-20-3d-chip.png",
  /** 内存条特写 */
  memory: "/images/covers/cover-16-memory.png",
  /** 处理器微距 */
  processor: "/images/hero/hero-processor.png",
  /** RAM 内存特写 */
  ram: "/images/covers/cover-16-memory.png",
  /** 电子设备/测试微距 */
  deviceMacro: "/images/covers/cover-09-probe.png",
} as const;

export const companies = [
  {
    name: "华芯精密微电子",
    slug: "huaxin-precision",
    logo: logo("/images/logos/logo-01-chip.png"),
    description:
      "高性能模拟与混合信号芯片设计公司，聚焦工业自动化、仪器仪表与能源基础设施。以可验证的噪声指标与长期供货承诺服务头部客户。",
    website: "https://www.huaxin-precision.example",
    industry: "IC设计",
    scale: "500-2000",
    city: "上海",
    approved: true,
  },
  {
    name: "澜川光电",
    slug: "lanchuan-optics",
    logo: logo("/images/logos/logo-02-crystal.png"),
    description:
      "硅光与相干光模块团队，面向数据中心互联与电信骨干网升级。强调封装热管理与量产一致性。",
    website: "https://www.lanchuan-optics.example",
    industry: "光通信",
    scale: "200-500",
    city: "武汉",
    approved: true,
  },
  {
    name: "衡石计算",
    slug: "hengshi-compute",
    logo: logo("/images/logos/logo-03-processor.png"),
    description:
      "面向云端与边缘的 AI 推理加速卡与软件栈，提供从算子融合到集群调度的一体化交付。",
    website: "https://www.hengshi-compute.example",
    industry: "AI芯片",
    scale: "200-1000",
    city: "北京",
    approved: true,
  },
  {
    name: "启宸车联",
    slug: "qichen-automotive",
    logo: logo("/images/logos/logo-04-pcb.png"),
    description:
      "车规 MCU、电源与传感融合方案，服务主机厂与 Tier1。功能安全团队具备 ASIL-D 项目落地经验。",
    website: "https://www.qichen-auto.example",
    industry: "汽车电子",
    scale: "100-500",
    city: "苏州",
    approved: true,
  },
  {
    name: "极栈先进封装",
    slug: "jizhan-advanced-package",
    logo: logo("/images/logos/logo-05-cleanroom.png"),
    description:
      "2.5D/3D 封装与系统级集成服务，覆盖 HBM 贴装、凸点工艺与可靠性验证闭环。",
    website: "https://www.jizhan-ap.example",
    industry: "封测",
    scale: "1000+",
    city: "无锡",
    approved: true,
  },
  {
    name: "星河传感",
    slug: "xinghe-sensing",
    logo: logo("/images/logos/logo-06-wave.png"),
    description:
      "毫米波雷达与 ToF 传感 SoC，面向车载与工业安全场景，提供从算法参考设计到产测规范的完整包。",
    website: "https://www.xinghe-sensing.example",
    industry: "IC设计",
    scale: "50-200",
    city: "深圳",
    approved: true,
  },
  {
    name: "铸界功率半导体",
    slug: "zhujie-power",
    logo: logo("/images/logos/logo-07-power.png"),
    description:
      "SiC/GaN 功率器件与模块，布局主驱逆变器、充电桩与工业电源。与材料厂共建缺陷图谱数据库。",
    website: "https://www.zhujie-power.example",
    industry: "功率器件",
    scale: "500-2000",
    city: "珠海",
    approved: true,
  },
  {
    name: "云枢 EDA",
    slug: "yunsu-eda",
    logo: logo("/images/logos/logo-08-eda.png"),
    description:
      "数字实现与签核工具链新锐，强调与主流 PDK 的兼容性与本地化支持响应。",
    website: "https://www.yunsu-eda.example",
    industry: "EDA",
    scale: "50-200",
    city: "上海",
    approved: true,
  },
  {
    name: "北溟半导体设备",
    slug: "beiming-equipment",
    logo: logo("/images/logos/logo-09-memory.png"),
    description:
      "刻蚀与薄膜设备的子系统供应商，以模块化交付帮助设备厂缩短集成周期。",
    website: "https://www.beiming-equip.example",
    industry: "半导体设备",
    scale: "200-500",
    city: "合肥",
    approved: true,
  },
  {
    name: "微脉医疗电子",
    slug: "weimai-medtech",
    logo: logo("/images/logos/logo-10-rf.png"),
    description:
      "医疗影像前端 ASIC 与低噪声采集链，服务高端影像设备制造商。",
    website: "https://www.weimai-med.example",
    industry: "医疗电子",
    scale: "50-200",
    city: "杭州",
    approved: true,
  },
  {
    name: "杉川电子材料",
    slug: "shanchuan-materials",
    logo: logo("/images/logos/logo-11-materials.png"),
    description:
      "高纯试剂与 CMP 耗材，面向 12 英寸产线提供批次追溯与一致性报告。",
    website: "https://www.shanchuan-mat.example",
    industry: "材料",
    scale: "500-2000",
    city: "宁波",
    approved: true,
  },
  {
    name: "岸汀互连科技",
    slug: "anting-interconnect",
    logo: logo("/images/logos/logo-13-interconnect.png"),
    description:
      "高速线缆、连接器与信号完整性实验室服务，参与多家头部云厂商的定制规格共研。",
    website: "https://www.anting-ix.example",
    industry: "互连",
    scale: "100-500",
    city: "东莞",
    approved: true,
  },
  {
    name: "赤霄存储科技",
    slug: "chixiao-memory",
    logo: logo("/images/logos/logo-16-storage.png"),
    description:
      "面向企业级与车载场景的控制器与固件团队，聚焦高温稳定性、掉电保护与一致性验证。",
    website: "https://www.chixiao-memory.example",
    industry: "存储控制",
    scale: "200-500",
    city: "西安",
    approved: true,
  },
  {
    name: "曜石射频",
    slug: "yaoshi-rf",
    logo: logo("/images/logos/logo-17-rf-frontend.png"),
    description:
      "提供 5G/卫星通信前端与 PA/LNA 模组，长期服务工业与专网终端厂商。",
    website: "https://www.yaoshi-rf.example",
    industry: "射频前端",
    scale: "100-500",
    city: "成都",
    approved: true,
  },
  {
    name: "沧澜晶圆制造",
    slug: "canglan-foundry",
    logo: logo("/images/logos/logo-15-foundry.png"),
    description:
      "专注特色工艺与成熟节点代工，覆盖 BCD、CIS 与功率器件平台，强调交付可预测性。",
    website: "https://www.canglan-foundry.example",
    industry: "制造与封测",
    scale: "2000-10000",
    city: "厦门",
    approved: true,
  },
  {
    name: "九章测试系统",
    slug: "jiuzhang-test",
    logo: logo("/images/logos/logo-14-test.png"),
    description:
      "半导体测试软硬件平台公司，提供 ATE 程序开发、治具设计与量产测试数据治理服务。",
    website: "https://www.jiuzhang-test.example",
    industry: "半导体设备",
    scale: "200-500",
    city: "南京",
    approved: true,
  },
  /** 待审核：用于后台演示 */
  {
    name: "穹顶量子科技（演示待审）",
    slug: "qiongding-quantum-pending",
    logo: logo("/images/logos/logo-12-quantum.png"),
    description: "量子测控与低温电子（演示数据，企业尚未通过审核）。",
    website: null,
    industry: "前沿探索",
    scale: "<50",
    city: "上海",
    approved: false,
  },
] as const;

export type CompanySlug = (typeof companies)[number]["slug"];

export const products: {
  companySlug: CompanySlug;
  name: string;
  category: string;
  description: string;
  sort: number;
}[] = [
  {
    companySlug: "huaxin-precision",
    name: "HX-AFE9200",
    category: "模拟前端",
    description: "24bit Σ-Δ 多通道 AFE，面向精密采集与电网谐波分析。",
    sort: 0,
  },
  {
    companySlug: "huaxin-precision",
    name: "HX-LDO-ULN",
    category: "电源管理",
    description: "亚微安静态电流 LDO，适用于电池供电传感器节点。",
    sort: 1,
  },
  {
    companySlug: "lanchuan-optics",
    name: "LC-COH800",
    category: "光模块",
    description: "800G OSFP 相干模块样片，重点优化 DSP 温漂补偿。",
    sort: 0,
  },
  {
    companySlug: "hengshi-compute",
    name: "HS-Infer M2",
    category: "推理卡",
    description: "INT8/FP8 混合精度，配套 Kubernetes 设备插件与弹性切片。",
    sort: 0,
  },
  {
    companySlug: "qichen-automotive",
    name: "QC-AUTOSAR Kit",
    category: "软件栈",
    description: "MCAL/BSW 集成包，内置安全监控与日志脱敏模板。",
    sort: 0,
  },
  {
    companySlug: "jizhan-advanced-package",
    name: "JZ-Interposer 55",
    category: "2.5D",
    description: "55μm 线宽硅中介层试产服务，含翘曲仿真与回流曲线建议。",
    sort: 0,
  },
  {
    companySlug: "xinghe-sensing",
    name: "XH-77G SoC",
    category: "毫米波",
    description: "级联架构雷达前端，支持角雷达与舱内活体检测双模式。",
    sort: 0,
  },
  {
    companySlug: "zhujie-power",
    name: "ZJ-SiC HM3",
    category: "功率模块",
    description: "1200V 半桥模块，银烧结工艺，面向电驱主逆变器。",
    sort: 0,
  },
  {
    companySlug: "yunsu-eda",
    name: "YS-PnR One",
    category: "布局布线",
    description: "支持 5nm 主流 PDK，内置拥塞热图与并行签核接口。",
    sort: 0,
  },
  {
    companySlug: "beiming-equipment",
    name: "BM-RF Match",
    category: "射频子系统",
    description: "等离子体阻抗匹配网络，支持快速recipe切换。",
    sort: 0,
  },
  {
    companySlug: "chixiao-memory",
    name: "CX-PCIe5 Controller",
    category: "存储控制器",
    description: "面向企业级 SSD 的 PCIe 5.0 控制器，强化掉电保护与 QoS 隔离。",
    sort: 0,
  },
  {
    companySlug: "yaoshi-rf",
    name: "YS-FEM 3.5G",
    category: "射频前端模组",
    description: "集成 PA/LNA/开关的前端模组，兼顾效率与散热，适配工业专网终端。",
    sort: 0,
  },
  {
    companySlug: "canglan-foundry",
    name: "CL-BCD180 Platform",
    category: "特色工艺平台",
    description: "面向电源管理与车规模拟的 BCD180 工艺平台，支持快速 MPW。",
    sort: 0,
  },
  {
    companySlug: "jiuzhang-test",
    name: "JZ-ATE Insight",
    category: "测试数据平台",
    description: "连接产测与良率分析流程，提供站点偏移检测与异常批次回溯。",
    sort: 0,
  },
];

export type ArticleDef = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover: string;
  category: string;
  tags: string[];
  author: string;
  source: string;
  companySlug?: CompanySlug;
  isFeatured: boolean;
  daysAgo: number;
};

export const articles: ArticleDef[] = [
  {
    title: "先进封装：当互连变成主战场，TCO 如何重写 AI 芯片经济学",
    slug: "advanced-packaging-tco-ai-economics",
    summary:
      "从 bump pitch 到热阻叠层，封装不再是「后端工序」，而是算力扩张的定价中枢。本文用三个工程指标拆解总拥有成本。",
    cover: unsplash(PH.chip, 1800),
    category: "制造",
    tags: ["先进封装", "Chiplet", "AI基础设施"],
    author: "芯师爷编辑部",
    source: "芯师爷深度",
    isFeatured: true,
    daysAgo: 1,
    content: `## 编者按

当晶体管微缩的收益递减，**互连带宽、热阻与良率**三件事，开始决定一张加速卡能否在机房里「跑得久、换得少」。

### 1. 互连：从「能连上」到「能撑住训练波峰」

先进封装把存储与计算的距离压到毫米级以内，但代价是工艺窗口变窄：任何一次凸点空洞，都会在 HBM 堆叠里被指数放大。

### 2. 热：算力的隐形税

同样 TDP 下，模块热阻差异会直接转化为风扇策略与机柜密度——这不仅是散热工程师的 KPI，更是 CFO 表里的折旧项。

### 3. 供应链：共研比「招标比价」更重要

头部云厂更倾向与 OSAT、硅厂、EDA 共建 **缺陷图谱与测试切片**，把良率学习曲线前置到设计阶段。

> 结论：封装正在从成本中心，变成产品定义的一部分。`,
  },
  {
    title: "车规功能安全落地清单：从需求库到产线追溯的 14 个检查点",
    slug: "functional-safety-checklist-oem-tier1",
    summary:
      "面向主机厂与芯片厂的协同框架：把「文档合规」转成「流程可执行」，并能在审计中被快速举证。",
    cover: unsplash(PH.weld, 1800),
    category: "汽车电子",
    tags: ["ISO26262", "车规", "供应链"],
    author: "特约观察",
    source: "芯师爷原创",
    companySlug: "qichen-automotive",
    isFeatured: true,
    daysAgo: 3,
    content: `## 为什么「有证书」不等于「能上车」

功能安全的难点不在条款本身，而在 **需求—设计—验证—生产** 四段链条是否同源、可追溯。

### 检查点（节选）

1. 危害分析与场景库是否与 ODD 更新同步版本号  
2. 安全需求是否映射到具体模块与测试用例 ID  
3. 产线烧录与密钥注入是否有双人复核与日志留存  

### 给芯片厂的一句话

把「安全机制」写进数据手册只是第一步；**把失效模式讲成客户能跑的 FMEA 表**，才是长期订单的门票。`,
  },
  {
    title: "工业 MCU 的「确定性」：边缘实时性的五个硬指标",
    slug: "industrial-mcu-determinism-five-metrics",
    summary:
      "峰值主频往往骗人；真正决定 PLC 与运动控制体验的，是中断延迟分布、DMA 与总线仲裁策略。",
    cover: unsplash(PH.factory, 1800),
    category: "IC设计",
    tags: ["MCU", "工业控制", "实时系统"],
    author: "程远",
    source: "企业特约",
    companySlug: "huaxin-precision",
    isFeatured: true,
    daysAgo: 5,
    content: `## 边缘现场最在意什么？

不是「跑分」，而是 **最坏情况是否仍可控**。

### 五个硬指标

- **WCRT**：最坏-case 中断响应  
- **抖动分布**：P99 与 P999 是否收敛  
- **DMA 与 cache 一致性**：是否会在双缓冲采集里埋雷  
- **温漂与时钟树**：-40℃~125℃ 是否仍满足通信时序  
- **供货与替代料策略**：工业客户的时间尺度以十年计  

> 建议：用「波形 + 日志」说话，比用形容词更有说服力。`,
  },
  {
    title: "2026 资本开支分化：设备订单仍在，材料议价开始",
    slug: "2026-semiconductor-capex-materials-pricing",
    summary:
      "晶圆厂资本开支增速放缓并不等于「寒冬」——结构性迁移正在发生：先进产能挤占成熟线预算，材料环节进入长单重谈窗口。",
    cover: unsplash(PH.supply, 1800),
    category: "市场分析",
    tags: ["资本开支", "材料", "晶圆厂"],
    author: "芯师爷研究组",
    source: "芯师爷研究",
    isFeatured: true,
    daysAgo: 7,
    content: `## 三个宏观信号

1. **区域化产能**带来的 duplicate fab，推高了设备折旧曲线  
2. **先进封装资本化**占比提升，传统 front-end capex 口径需要更新  
3. 材料厂正在用 **指数条款** 对冲能源与纯度成本波动  

### 对投资与采购的启示

把「景气」拆成「哪一段工序的景气」，比看总量数字更接近真相。`,
  },
  {
    title: "存算一体：论文热度之外，量产还要跨过的六道坎",
    slug: "compute-in-memory-six-gaps-to-volume",
    summary:
      "器件、阵列良率、编译器、软件栈、测试与生态伙伴分工——任何一环掉链子，都会在客户 POC 里被放大成「不可交付」。",
    cover: unsplash(PH.abstract, 1800),
    category: "AI芯片",
    tags: ["存算一体", "架构", "软件栈"],
    author: "芯师爷编辑部",
    source: "芯师爷深度",
    isFeatured: true,
    daysAgo: 9,
    content: `## 现实检查

CIM 在特定算子与功耗约束下非常漂亮，但要进入 **可维护、可测试、可替换** 的商业产品，还有长路要走。

### 六道坎（简述）

1. 阵列缺陷映射与冗余策略  
2. 温度与漂移下的精度闭环  
3. 编译器能否承接动态 shape  
4. 与现有推理框架的算子对齐成本  
5. ATE 与系统级测试方法学是否成熟  
6. **谁为「不确定性」买单** 的合同条款  

> 对创业团队：先把一个垂直场景做到「可签单」，再谈平台化。`,
  },
  {
    title: "碳化硅模块上车主逆变器：渗透率背后的成本曲线与封装选择",
    slug: "sic-main-inverter-penetration-cost-curve",
    summary:
      "银烧结、铜线键合与双面冷却结构正在改写模块 BOM；主机厂的 KPI 从「效率」扩展到「重量与装配节拍」。",
    cover: unsplash(PH.weld, 1800),
    category: "汽车电子",
    tags: ["碳化硅", "电驱", "封装"],
    author: "陆衡",
    source: "芯师爷原创",
    companySlug: "zhujie-power",
    isFeatured: false,
    daysAgo: 11,
    content: `## 电驱集成度继续上升

逆变器与减速器共壳体、800V 平台推广，都在逼迫功率模块 **更薄、更轻、更易自动化装配**。

### 封装路线观察

- 烧结层热阻 vs 工艺节拍  
- 铜夹焊点疲劳与温度循环  
- 双面冷却对系统流道设计的约束  

> 结论：SiC 的故事一半在材料，一半在 **热—机—电耦合工程**。`,
  },
  {
    title: "硅光模块进入「可制造性」竞赛：DSP 温漂只是第一关",
    slug: "silicon-photonics-manufacturability-race",
    summary:
      "800G 放量前夕，良率爬坡的关键从「芯片性能」转向「封装应力、透镜耦合与测试分级策略」。",
    cover: unsplash(PH.board, 1800),
    category: "光通信",
    tags: ["硅光", "800G", "封测"],
    author: "芯师爷现场",
    source: "芯师爷现场",
    companySlug: "lanchuan-optics",
    isFeatured: false,
    daysAgo: 13,
    content: `## 现场笔记

在武汉一家模块厂，工程团队把「耦合损耗分布」做成了和 **MES 工单** 绑定的可视化面板——这意味着硅光正在从研发样机走向 **可审计的制造系统**。

### 三个被低估的细节

1. 透镜座公差对 PMD 的长期漂移  
2. 贴片应力与芯片裂纹筛查节拍  
3. 客户验收脚本与厂内测试项的对齐成本`,
  },
  {
    title: "EDA 本地化：不是替代，而是把「响应时间」做成竞争力",
    slug: "eda-localization-response-time-moat",
    summary:
      "在先进节点签核压力之下，工具链能否与 PDK 更新同频迭代，正在成为国产 EDA 的第二张名片。",
    cover: unsplash(PH.code, 1800),
    category: "EDA",
    tags: ["EDA", "签核", "生态"],
    author: "苏简",
    source: "芯师爷人物",
    companySlug: "yunsu-eda",
    isFeatured: false,
    daysAgo: 15,
    content: `## 访谈摘录

> 「客户不是要你『全都能做』，而是要你在他 deadline 前夜，**有人能接电话**。」

### 观察

本地化竞争正在从 **license 价格** 转向 **问题定位速度与知识库密度**。`,
  },
  {
    title: "设备子系统供应商的生死线：接口冻结与版本兼容",
    slug: "equipment-subsystem-api-freeze-compatibility",
    summary:
      "射频匹配、气体输送、温控模组……「藏在机台里的创新」如何不被集成商的接口冻结拖死？",
    cover: unsplash(PH.lab, 1800),
    category: "半导体设备",
    tags: ["设备", "系统集成", "版本管理"],
    author: "芯师爷编辑部",
    source: "芯师爷深度",
    companySlug: "beiming-equipment",
    isFeatured: false,
    daysAgo: 17,
    content: `## 工程现实

设备厂最怕的是：**子系统升级牵一发而动全身**。

### 建议框架

- 在合同里明确 **接口语义版本** 与灰度窗口  
- 把回归测试切片化，避免「全量重跑两周」  
- 共建缺陷样本库，而不是只交付硬件盒子`,
  },
  {
    title: "医疗影像前端 ASIC：低噪声之外，还有「临床可解释性」",
    slug: "medical-imaging-asic-beyond-low-noise",
    summary:
      "高端影像设备客户会追问：噪声模型是否可映射到临床重建链路？数据手册里的曲线能否对应到具体扫描协议？",
    cover: unsplash(PH.office, 1800),
    category: "医疗电子",
    tags: ["医疗电子", "模拟", "合规"],
    author: "周牧",
    source: "芯师爷原创",
    companySlug: "weimai-medtech",
    isFeatured: false,
    daysAgo: 19,
    content: `## 设计哲学

医疗电子的护城河，一半是 **噪声与功耗指标**，另一半是 **与影像算法团队的共同语言**。

### 三个关键词

可验证、可追溯、可沟通。`,
  },
  {
    title: "高速互连：信号完整性实验室如何变成「规格共研」中枢",
    slug: "signal-integrity-lab-as-co-dev-hub",
    summary:
      "当数据中心定制规格越来越激进，互连厂的价值从「卖线缆」转向「卖可重复的证据包」。",
    cover: unsplash(PH.server, 1800),
    category: "互连",
    tags: ["高速互连", "测试", "云厂商"],
    author: "芯师爷编辑部",
    source: "芯师爷现场",
    companySlug: "anting-interconnect",
    isFeatured: false,
    daysAgo: 21,
    content: `## 东莞实验室见闻

示波器墙、误码仪矩阵与一整面墙的 **「失败样本陈列」**——这是互连头部厂商正在讲的新故事。

### 趋势

把测试能力产品化：客户买的不是线，而是 **风险被量化之后的确定性**。`,
  },
  {
    title: "材料纯度之外：批次一致性如何进入晶圆厂采购 KPI",
    slug: "material-batch-consistency-wafer-fab-kpi",
    summary:
      "高纯试剂与 CMP 耗材的第二张成绩单，是批次间金属离子分布的方差，而不是单一检测报告。",
    cover: unsplash(PH.factory, 1800),
    category: "材料",
    tags: ["材料", "晶圆制造", "质量"],
    author: "芯师爷研究组",
    source: "芯师爷研究",
    companySlug: "shanchuan-materials",
    isFeatured: false,
    daysAgo: 23,
    content: `## 采购视角

当先进制程窗口变窄，材料从「消耗品」变成 **工艺稳定性的放大器**。

### 建议

用数据接口把 COA 与机台参数闭环，而不是停留在邮件附件里。`,
  },
  {
    title: "推理卡集群：内存墙、互联与功耗的三体问题",
    slug: "inference-cluster-memory-wall-interconnect-power",
    summary:
      "当模型结构趋于稳定，竞争焦点回到系统工程：如何把每一瓦电换成可计费的 token。",
    cover: unsplash(PH.keynote, 1800),
    category: "AI芯片",
    tags: ["推理", "集群", "互联"],
    author: "贺星",
    source: "芯师爷深度",
    companySlug: "hengshi-compute",
    isFeatured: false,
    daysAgo: 26,
    content: `## 一个朴素公式

> 有效吞吐 ≈ min(算力, 内存带宽, 互联带宽) ÷ 功耗

### 工程抓手

- KV cache 分层与压缩策略  
- NCCL / 自定义集合通信的拓扑亲和  
- 液冷与供电母线的联合仿真`,
  },
  {
    title: "毫米波雷达上车：从「能探测」到「敢托付」还有多远？",
    slug: "mmwave-radar-trust-path-to-production",
    summary:
      "角雷达、舱内雷达与 L2+ 行泊一体方案并行推进，算法、射频与功能安全团队必须在同一节奏上对话。",
    cover: unsplash(PH.meeting, 1800),
    category: "汽车电子",
    tags: ["雷达", "传感", "功能安全"],
    author: "芯师爷编辑部",
    source: "芯师爷原创",
    companySlug: "xinghe-sensing",
    isFeatured: false,
    daysAgo: 29,
    content: `## 产业侧写

雷达芯片的故事，正在从 **SNR 数字** 迁移到 **场景库覆盖度与误报率曲线**。

### 给读者的判断题

你更相信「单次演示视频」，还是「可复现实验室报告 + 产线抽检数据」？`,
  },
  {
    title: "先进封装产线的「节拍器」：如何用数据把良率爬坡变成可预测过程",
    slug: "advanced-packaging-takt-yield-ramp-data",
    summary:
      "把设备状态、材料批次与缺陷图像映射到同一时间轴，是 OSAT 从经验驱动走向模型驱动的第一步。",
    cover: unsplash(PH.collab, 1800),
    category: "制造",
    tags: ["OSAT", "数据", "良率"],
    author: "芯师爷现场",
    source: "芯师爷现场",
    companySlug: "jizhan-advanced-package",
    isFeatured: false,
    daysAgo: 32,
    content: `## 现场

在无锡某封装厂，工程团队用一张 **「缺陷—工位—批次」** 三维热力图组织晨会——这比任何口号都更接近「工业 4.0」。

### 一句话

数据不是大屏，是 **决策节拍器**。`,
  },
];

export const events = [
  {
    companySlug: "huaxin-precision" as const,
    title: "芯师爷 · 精密模拟与电源设计闭门沙龙（上海）",
    description:
      "限额 40 人。议题：超低噪声前端、LDO 温漂补偿与车规文档协同。含小型 demo 评测台。",
    type: "SALON" as const,
    daysStart: 12,
    hoursDuration: 5,
    location: "上海 · 徐汇滨江（定向通知具体地址）",
    featured: true,
    cover: unsplash(PH.meeting, 1400),
  },
  {
    companySlug: null,
    title: "线上峰会：物理 AI 时代的数据中心电力与冷却",
    description:
      "邀请云厂基础设施架构师、设备与材料厂技术委员会联合讨论：当机柜功率密度继续上升，「可交付的 PUE」如何定义。",
    type: "WEBINAR" as const,
    daysStart: 6,
    hoursDuration: 3,
    location: "芯师爷 Live · 报名后邮件发送链接",
    featured: true,
    cover: unsplash(PH.server, 1400),
  },
  {
    companySlug: "hengshi-compute" as const,
    title: "衡石计算 · 推理软件栈开放日（北京）",
    description:
      "面向 ISV 与集成商：Runtime、算子融合与集群调度实战演练，提供参考集群环境。",
    type: "WORKSHOP" as const,
    daysStart: 18,
    hoursDuration: 8,
    location: "北京 · 中关村软件园",
    featured: false,
    cover: unsplash(PH.code, 1400),
  },
  {
    companySlug: null,
    title: "Semicon China 同期 · 媒体与投资人参观路线（演示）",
    description:
      "定向邀请制：覆盖材料、封测与设备代表性展台，提供统一讲解词与数据口径建议。",
    type: "EXHIBITION" as const,
    daysStart: 45,
    hoursDuration: 10,
    location: "上海新国际博览中心",
    featured: false,
    cover: unsplash(PH.factory, 1400),
  },
  {
    companySlug: "qichen-automotive" as const,
    title: "车规软件与功能安全：从需求到测试用例工作坊",
    description:
      "小班授课，含案例拆解与分组演练；适合芯片厂安全经理与系统架构师。",
    type: "WORKSHOP" as const,
    daysStart: 24,
    hoursDuration: 6,
    location: "苏州 · 工业园区",
    featured: false,
    cover: unsplash(PH.weld, 1400),
  },
  {
    companySlug: "lanchuan-optics" as const,
    title: "硅光模块量产爬坡：良率与测试策略圆桌",
    description:
      "闭门圆桌，Chatham House Rule。邀请模块厂、设备厂与云厂网络架构代表。",
    type: "SALON" as const,
    daysStart: 33,
    hoursDuration: 4,
    location: "武汉 · 光谷",
    featured: false,
    cover: unsplash(PH.board, 1400),
  },
  {
    companySlug: null,
    title: "「互连与信号完整性」年度白皮书发布会",
    description:
      "联合岸汀互连发布：800G 系统误码预算分配与测试复现指南（演示数据）。",
    type: "CONFERENCE" as const,
    /** 已开始、尚未结束 — 用于首页「进行中」统计 */
    daysStart: -2,
    hoursDuration: 120,
    location: "深圳 · 南山（线下 + 线上同步）",
    featured: true,
    status: "ONGOING" as const,
    cover: unsplash(PH.keynote, 1400),
  },
  {
    companySlug: "jizhan-advanced-package" as const,
    title: "先进封装热仿真与翘曲控制实战营",
    description:
      "两天密集课程：材料参数标定、回流曲线设计与 DOE 案例复盘。",
    type: "WORKSHOP" as const,
    daysStart: 55,
    hoursDuration: 16,
    location: "无锡 · 滨湖区",
    featured: false,
    cover: unsplash(PH.precision, 1400),
  },
  {
    companySlug: "chixiao-memory" as const,
    title: "企业级 SSD 控制器可靠性论坛：从掉电到尾延迟",
    description:
      "围绕企业级存储的稳定性指标展开，分享控制器固件、测试验证与现场回归方法。",
    type: "CONFERENCE" as const,
    daysStart: 21,
    hoursDuration: 6,
    location: "西安 · 高新区",
    featured: false,
    cover: unsplash(PH.memory, 1400),
  },
  {
    companySlug: "yaoshi-rf" as const,
    title: "卫星通信终端射频前端设计沙龙",
    description:
      "讨论宽温、效率与认证周期对射频模组定义的影响，含实测案例拆解。",
    type: "SALON" as const,
    daysStart: 30,
    hoursDuration: 4,
    location: "成都 · 天府新区",
    featured: false,
    cover: unsplash(PH.circuit, 1400),
  },
  {
    companySlug: "canglan-foundry" as const,
    title: "特色工艺开放日：BCD/CIS 平台联合路演",
    description:
      "面向 Fabless 与系统厂，介绍特色工艺平台 roadmap、MPW 节奏与量产支持机制。",
    type: "EXHIBITION" as const,
    daysStart: 40,
    hoursDuration: 8,
    location: "厦门 · 火炬高新区",
    featured: false,
    cover: unsplash(PH.cleanroom, 1400),
  },
  {
    companySlug: "jiuzhang-test" as const,
    title: "量产测试数据治理工作坊",
    description:
      "针对 ATE 程序、站点偏移与良率爬坡阶段的跨团队协作流程进行实操演练。",
    type: "WORKSHOP" as const,
    daysStart: 27,
    hoursDuration: 7,
    location: "南京 · 江北新区",
    featured: false,
    cover: unsplash(PH.deviceMacro, 1400),
  },
];

export const jobs: {
  companySlug: CompanySlug;
  title: string;
  city: string;
  type: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
  experience: string;
  education: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string;
}[] = [
  {
    companySlug: "huaxin-precision",
    title: "高级模拟设计工程师（高精度 AFE）",
    city: "上海",
    type: "FULL_TIME",
    experience: "5 年以上",
    education: "硕士及以上",
    salaryMin: 45,
    salaryMax: 75,
    description:
      "负责多通道 Σ-Δ AFE 顶层架构与关键模块设计；与数字、验证、量产测试团队协同，推动设计到良率闭环。",
    requirements:
      "熟悉噪声、温漂与斩波稳定技术；有工业或车规项目经验优先；具备 Python/Matlab 建模能力加分。",
  },
  {
    companySlug: "huaxin-precision",
    title: "应用工程师（工业采集方向）",
    city: "上海",
    type: "FULL_TIME",
    experience: "3 年以上",
    education: "本科及以上",
    salaryMin: 25,
    salaryMax: 40,
    description:
      "面向重点客户提供参考设计、现场问题定位与数据手册迭代；参与新产品定义评审。",
    requirements:
      "有 ADC/DAC 或精密运放调试经验；能适应短期出差；沟通表达清晰。",
  },
  {
    companySlug: "lanchuan-optics",
    title: "光模块研发工程师（DSP 均衡）",
    city: "武汉",
    type: "FULL_TIME",
    experience: "4 年以上",
    education: "硕士及以上",
    salaryMin: 35,
    salaryMax: 60,
    description:
      "负责相干光 DSP 链路仿真与算法实现；与硬件团队联合优化功耗与温漂。",
    requirements:
      "熟悉 MATLAB/VPI；了解 CMOS 工艺限制；有 400G/800G 项目经验优先。",
  },
  {
    companySlug: "hengshi-compute",
    title: "推理框架开发工程师（C++/CUDA）",
    city: "北京",
    type: "FULL_TIME",
    experience: "3 年以上",
    education: "本科及以上",
    salaryMin: 40,
    salaryMax: 70,
    description:
      "构建与优化推理 Runtime、算子库与多卡通信插件；支持主流开源框架适配。",
    requirements:
      "扎实的 C++；熟悉 GPU 体系结构；有 NCCL/MPI 经验加分。",
  },
  {
    companySlug: "qichen-automotive",
    title: "嵌入式软件工程师（AUTOSAR BSW）",
    city: "苏州",
    type: "FULL_TIME",
    experience: "3 年以上",
    education: "本科及以上",
    salaryMin: 28,
    salaryMax: 48,
    description:
      "负责 BSW 配置、MCAL 集成与复杂驱动开发；支持客户项目功能安全文档交付。",
    requirements:
      "熟悉 AutoSAR 方法论；有瑞萨/NXP 平台经验优先；英语读写熟练。",
  },
  {
    companySlug: "jizhan-advanced-package",
    title: "先进封装工艺工程师（凸点 / 回流）",
    city: "无锡",
    type: "FULL_TIME",
    experience: "5 年以上",
    education: "本科及以上",
    salaryMin: 30,
    salaryMax: 50,
    description:
      "主导新产品导入工艺窗口开发；组织 DOE 与良率改善专项。",
    requirements:
      "熟悉 Flip-chip、TCB 或回流曲线设计；有 HBM/Cowos 经验优先。",
  },
  {
    companySlug: "xinghe-sensing",
    title: "毫米波射频 IC 设计工程师",
    city: "深圳",
    type: "FULL_TIME",
    experience: "4 年以上",
    education: "硕士及以上",
    salaryMin: 38,
    salaryMax: 65,
    description:
      "负责毫米波前端收发链路设计与电磁协同；参与封装与天线联合仿真。",
    requirements:
      "熟练使用 EM 仿真工具；有雷达或通信射频经验；具备芯片量产意识。",
  },
  {
    companySlug: "zhujie-power",
    title: "功率模块可靠性工程师",
    city: "珠海",
    type: "FULL_TIME",
    experience: "3 年以上",
    education: "本科及以上",
    salaryMin: 22,
    salaryMax: 38,
    description:
      "制定功率模块温度循环、功率循环与 HV-H3TRB 等测试计划；输出失效分析报告。",
    requirements:
      "熟悉 AEC-Q101/模块类标准；有材料与结构基础；细心、文档能力强。",
  },
  {
    companySlug: "yunsu-eda",
    title: "EDA 应用工程师（PnR / Signoff）",
    city: "上海",
    type: "FULL_TIME",
    experience: "2 年以上",
    education: "本科及以上",
    salaryMin: 25,
    salaryMax: 42,
    description:
      "支持重点客户工具部署、脚本开发与 signoff 收敛；反馈产品改进需求。",
    requirements:
      "熟悉 Tcl/Perl/Python；有 PnR 或 STA 经验；客户沟通能力强。",
  },
  {
    companySlug: "beiming-equipment",
    title: "射频系统工程师（等离子体匹配）",
    city: "合肥",
    type: "FULL_TIME",
    experience: "4 年以上",
    education: "硕士及以上",
    salaryMin: 32,
    salaryMax: 52,
    description:
      "负责阻抗匹配网络设计、调试与现场问题闭环；参与下一代平台规格定义。",
    requirements:
      "电磁场基础扎实；有真空或等离子体设备经验优先；能接受客户现场支持。",
  },
  {
    companySlug: "anting-interconnect",
    title: "信号完整性工程师（高速互连）",
    city: "东莞",
    type: "FULL_TIME",
    experience: "3 年以上",
    education: "本科及以上",
    salaryMin: 26,
    salaryMax: 45,
    description:
      "负责高速线缆/连接器 SI 仿真、测试夹具设计与客户联合调试。",
    requirements:
      "熟练使用 VNA/TDR；了解 PCIe/Ethernet 等协议物理层要求。",
  },
  {
    companySlug: "shanchuan-materials",
    title: "化学品应用技术工程师",
    city: "宁波",
    type: "FULL_TIME",
    experience: "3 年以上",
    education: "本科及以上",
    salaryMin: 20,
    salaryMax: 35,
    description:
      "对接晶圆厂工艺工程师，优化清洗与 CMP 药液配方；组织现场试验与数据复盘。",
    requirements:
      "化学/材料背景；有无尘室经验；数据敏感度高。",
  },
  {
    companySlug: "chixiao-memory",
    title: "存储固件工程师（FTL / QoS）",
    city: "西安",
    type: "FULL_TIME",
    experience: "4 年以上",
    education: "本科及以上",
    salaryMin: 32,
    salaryMax: 55,
    description:
      "负责 FTL、垃圾回收与尾延迟优化，支撑企业级 SSD 在复杂负载下的稳定表现。",
    requirements:
      "熟悉 C/C++ 与存储协议；有 NVMe/闪存控制器项目经验优先；具备性能分析能力。",
  },
  {
    companySlug: "chixiao-memory",
    title: "可靠性验证工程师（存储）",
    city: "西安",
    type: "FULL_TIME",
    experience: "3 年以上",
    education: "本科及以上",
    salaryMin: 24,
    salaryMax: 40,
    description:
      "制定并执行高温老化、掉电恢复与异常注入测试，维护验证自动化平台。",
    requirements:
      "熟悉 Python 自动化；有可靠性测试或系统验证经验；文档与问题复盘能力强。",
  },
  {
    companySlug: "yaoshi-rf",
    title: "射频前端设计工程师（PA/LNA）",
    city: "成都",
    type: "FULL_TIME",
    experience: "4 年以上",
    education: "硕士及以上",
    salaryMin: 35,
    salaryMax: 58,
    description:
      "负责专网与卫星终端前端模组设计，推进线性度、效率与热设计协同优化。",
    requirements:
      "有射频链路设计经验；熟悉 ADS/HFSS；理解量产一致性约束。",
  },
  {
    companySlug: "canglan-foundry",
    title: "工艺整合工程师（BCD 平台）",
    city: "厦门",
    type: "FULL_TIME",
    experience: "5 年以上",
    education: "本科及以上",
    salaryMin: 30,
    salaryMax: 48,
    description:
      "主导 BCD 工艺平台整合与 DOE 优化，推进 MPW 到量产的参数收敛。",
    requirements:
      "熟悉前段工艺与统计分析方法；有 foundry 平台化经验优先。",
  },
  {
    companySlug: "canglan-foundry",
    title: "客户工艺支持工程师（CIS）",
    city: "厦门",
    type: "FULL_TIME",
    experience: "3 年以上",
    education: "本科及以上",
    salaryMin: 22,
    salaryMax: 36,
    description:
      "对接 Fabless 客户做工艺问题定位、参数回归与量产导入支持。",
    requirements:
      "沟通能力强；有芯片量产导入或工艺支持背景优先。",
  },
  {
    companySlug: "jiuzhang-test",
    title: "测试开发工程师（ATE 程序）",
    city: "南京",
    type: "FULL_TIME",
    experience: "3 年以上",
    education: "本科及以上",
    salaryMin: 26,
    salaryMax: 42,
    description:
      "负责 ATE 程序开发、量产测试覆盖优化与 fail bin 分析。",
    requirements:
      "有 Teradyne/Advantest 相关经验优先；熟悉 Python 或 C# 脚本开发。",
  },
  {
    companySlug: "jiuzhang-test",
    title: "测试数据分析工程师",
    city: "南京",
    type: "FULL_TIME",
    experience: "2 年以上",
    education: "本科及以上",
    salaryMin: 20,
    salaryMax: 34,
    description:
      "建设测试数据看板，输出异常批次识别与良率趋势分析报告。",
    requirements:
      "熟悉 SQL/数据可视化；有制造数据分析经验优先。",
  },
];

export const reports = [
  {
    title: "2026 Q1 中国半导体设备招标与交付节奏观察",
    description: "样本覆盖主要晶圆厂与存储厂公开标段，附节奏指数与区域对比。",
    category: "MARKET_ANALYSIS" as const,
    tags: ["设备", "招标", "晶圆厂"],
    price: 0,
    cover: unsplash(PH.factory, 1200),
    daysAgo: 2,
  },
  {
    title: "车规功率半导体供应链图谱（2026 修订版）",
    description: "SiC/GaN 衬底—外延—器件—模块—主机厂映射，含产能与工艺路线备注。",
    category: "INDUSTRY_TREND" as const,
    tags: ["车规", "功率", "供应链"],
    price: 199,
    cover: unsplash(PH.weld, 1200),
    daysAgo: 8,
  },
  {
    title: "先进封装互连可靠性：测试方法学与失效案例汇编",
    description: "面向 OSAT 与设计厂联合团队的内部培训向整理（演示版）。",
    category: "TECHNOLOGY_REVIEW" as const,
    tags: ["封装", "可靠性", "测试"],
    price: 299,
    cover: unsplash(PH.chip, 1200),
    daysAgo: 14,
  },
  {
    title: "中国 EDA 工具链本地化渗透指数（2025–2026）",
    description: "以公开招投标与客户访谈样本估计，附敏感性分析说明。",
    category: "MARKET_ANALYSIS" as const,
    tags: ["EDA", "国产化", "指数"],
    price: 0,
    cover: unsplash(PH.code, 1200),
    daysAgo: 20,
  },
  {
    title: "医疗影像 ASIC 赛道：头部玩家与进入壁垒",
    description: "从认证周期、渠道结构与 reference design 生态拆解护城河。",
    category: "COMPANY_PROFILE" as const,
    tags: ["医疗电子", "ASIC", "竞争格局"],
    price: 159,
    cover: unsplash(PH.office, 1200),
    daysAgo: 27,
  },
  {
    title: "数据中心互连：800G 部署白皮书（简版）",
    description: "误码预算、光/铜选择与测试复现清单，供架构师内部评审使用。",
    category: "CUSTOM_REPORT" as const,
    tags: ["数据中心", "800G", "互连"],
    price: 0,
    cover: unsplash(PH.server, 1200),
    daysAgo: 35,
  },
  {
    title: "企业级 SSD 控制器稳定性评估方法（演示版）",
    description: "覆盖掉电一致性、尾延迟与高温负载场景，附测试模板与指标定义。",
    category: "TECHNOLOGY_REVIEW" as const,
    tags: ["存储", "可靠性", "控制器"],
    price: 99,
    cover: unsplash(PH.memory, 1200),
    daysAgo: 12,
  },
  {
    title: "特色工艺平台选型指南：BCD/CIS/功率器件",
    description: "面向中型 Fabless 团队的工艺平台决策框架，包含风险与资源评估清单。",
    category: "INDUSTRY_TREND" as const,
    tags: ["工艺平台", "代工", "决策模型"],
    price: 0,
    cover: unsplash(PH.cleanroom, 1200),
    daysAgo: 18,
  },
  {
    title: "量产测试数据治理实战：站点偏移与良率波动控制",
    description: "从数据采集到异常闭环，提供可执行的测试数据治理路径。",
    category: "CUSTOM_REPORT" as const,
    tags: ["ATE", "量产测试", "数据治理"],
    price: 129,
    cover: unsplash(PH.deviceMacro, 1200),
    daysAgo: 22,
  },
  {
    title: "卫星通信终端射频前端产业图谱（2026）",
    description: "聚焦专网与卫星终端市场，梳理关键器件、模组厂与认证链路。",
    category: "MARKET_ANALYSIS" as const,
    tags: ["射频前端", "卫星通信", "产业图谱"],
    price: 0,
    cover: unsplash(PH.circuit, 1200),
    daysAgo: 29,
  },
];

export const awardCampaigns = [
  {
    slug: "hardcore-chip-2026",
    title: "硬核芯 2026 年度评选",
    summary:
      "以「可验证的创新」与「可规模化的落地」为双轴，邀请产业评委团对参评产品进行盲评与现场答辩（演示流程）。",
    year: 2026,
    daysStart: -10,
    daysEnd: 80,
    active: true,
  },
  {
    slug: "silicon-pioneer-2025",
    title: "硅路先锋 · 2025 人物与团队榜",
    summary:
      "致敬在工艺、设计、软件与系统环节推动关键突破的一线团队（演示数据）。",
    year: 2025,
    daysStart: -400,
    daysEnd: -300,
    active: false,
  },
  {
    slug: "smart-manufacturing-chip-2026",
    title: "智造芯力 · 2026 测试与制造创新评选",
    summary:
      "聚焦量产测试、良率提升与制造数字化协同，采用案例答辩 + 评委复核的评审机制。",
    year: 2026,
    daysStart: -5,
    daysEnd: 95,
    active: true,
  },
  {
    slug: "automotive-chip-reliability-2024",
    title: "车芯可靠性榜 · 2024 年度案例",
    summary:
      "面向车规芯片与功率器件的可靠性实践案例集，关注失效闭环与工程方法沉淀。",
    year: 2024,
    daysStart: -760,
    daysEnd: -680,
    active: false,
  },
];

export const pageSections = [
  { type: "NAV_LINK" as const, code: "main-nav", title: "主导航", sort: 1, active: true },
  { type: "HERO_SLIDE" as const, code: "hero", title: "首页 Hero 轮播", sort: 2, active: true },
  { type: "TRENDING" as const, code: "trending", title: "热门资讯", sort: 4, active: true },
  { type: "ARTICLES_FEED" as const, code: "articles-feed", title: "最新资讯", sort: 5, active: true },
  { type: "COMPANIES" as const, code: "companies", title: "企业展示", sort: 6, active: true },
  { type: "EVENTS" as const, code: "events", title: "活动", sort: 7, active: true },
  { type: "REPORTS" as const, code: "reports", title: "报告", sort: 8, active: true },
  { type: "AWARDS" as const, code: "awards", title: "评选", sort: 9, active: true },
  { type: "TOPIC_CARD" as const, code: "topics", title: "专题卡片", sort: 10, active: true },
  { type: "TESTIMONIAL" as const, code: "testimonials", title: "声音引语", sort: 11, active: true },
  { type: "CTA_SECTION" as const, code: "cta", title: "CTA 合作区", sort: 12, active: true },
  { type: "FOOTER_COLUMN" as const, code: "footer", title: "页脚链接列", sort: 13, active: true },
];

export const pageSectionItems: {
  sectionCode: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  link?: string;
  linkText?: string;
  sort: number;
  active: boolean;
  extra?: Record<string, unknown>;
}[] = [
  // Hero slides (3 slides with carousel)
  {
    sectionCode: "hero",
    title: "把复杂产业链，讲成可被信任的故事。",
    subtitle: "Editorial · Semiconductor",
    description: "芯师爷以编辑标准组织现场、人物、产品与趋势判断。专业读者的注意力很贵，版式、节奏与事实密度，都是对内容的尊重。",
    image: "/images/hero/hero-fab.png",
    link: "/articles",
    linkText: "进入资讯",
    sort: 0,
    active: true,
  },
  {
    sectionCode: "hero",
    title: "从晶圆到系统，我们追踪每一个关键节点。",
    subtitle: "Coverage · Full Chain",
    description: "覆盖 IC 设计、制造、封测、终端应用的完整产业链报道体系。",
    image: "/images/hero/hero-processor.png",
    link: "/articles?category=%E5%88%B6%E9%80%A0",
    linkText: "查看制造报道",
    sort: 1,
    active: true,
  },
  {
    sectionCode: "hero",
    title: "AI 时代，算力芯片的架构歧路与生态抉择。",
    subtitle: "Deep Dive · AI Chips",
    description: "集群互联、内存墙与软件栈——谁在定义下一代 AI 基础设施的成本结构？",
    image: "/images/hero/hero-wafer.png",
    link: "/articles?category=AI%E8%8A%AF%E7%89%87",
    linkText: "AI 专题",
    sort: 2,
    active: true,
  },
  // Topics
  {
    sectionCode: "topics",
    title: "IC 设计",
    description: "从 RTL 到签核：架构取舍、验证闭环与先进节点下的功耗墙",
    image: "/images/topics/topic-01-ic-design.png",
    link: "/articles?category=IC%E8%AE%BE%E8%AE%A1",
    linkText: "查看",
    sort: 0,
    active: true,
  },
  {
    sectionCode: "topics",
    title: "制造与封测",
    description: "良率曲线背后的设备节拍、材料一致性与供应链韧性",
    image: "/images/topics/topic-02-manufacturing.png",
    link: "/articles?category=%E5%88%B6%E9%80%A0",
    linkText: "查看",
    sort: 1,
    active: true,
  },
  {
    sectionCode: "topics",
    title: "汽车电子",
    description: "功能安全、预期功能安全与车规物料的长期主义",
    image: "/images/topics/topic-03-automotive.png",
    link: "/articles?category=%E6%B1%BD%E8%BD%A6%E7%94%B5%E5%AD%90",
    linkText: "查看",
    sort: 2,
    active: true,
  },
  {
    sectionCode: "topics",
    title: "AI 算力芯片",
    description: "集群互联、内存墙与软件栈如何共同决定落地成本",
    image: "/images/topics/topic-04-ai-chip.png",
    link: "/articles?category=AI%E8%8A%AF%E7%89%87",
    linkText: "查看",
    sort: 3,
    active: true,
  },
  {
    sectionCode: "topics",
    title: "存储与控制器",
    description: "从介质管理到尾延迟优化，关注稳定性与企业级场景可交付",
    image: "/images/topics/topic-05-storage.png",
    link: "/articles?category=%E5%B8%82%E5%9C%BA%E5%88%86%E6%9E%90",
    linkText: "查看",
    sort: 4,
    active: true,
  },
  {
    sectionCode: "topics",
    title: "射频与通信",
    description: "专网、卫星与车载通信场景下的前端器件与系统协同",
    image: "/images/topics/topic-06-rf.png",
    link: "/articles?category=IC%E8%AE%BE%E8%AE%A1",
    linkText: "查看",
    sort: 5,
    active: true,
  },
  // Testimonials
  {
    sectionCode: "testimonials",
    title: "我们不需要更多「科技感」形容词；我们需要把工艺边界、验证证据与交付节奏讲清楚。",
    subtitle: "某头部 Fabless 市场副总裁",
    image: "/images/testimonials/test-01-executive.png",
    sort: 0,
    active: true,
  },
  {
    sectionCode: "testimonials",
    title: "好的产业媒体，会把复杂问题拆成可核对的结构——读者能带走判断，而不只是情绪。",
    subtitle: "人民币基金硬科技组投资总监",
    image: "/images/testimonials/test-02-engineer-f.png",
    sort: 1,
    active: true,
  },
  {
    sectionCode: "testimonials",
    title: "版式与信息层级，是对专业读者时间的尊重；这一点芯师爷做得很克制，也很少见。",
    subtitle: "设备企业中国区品牌负责人",
    image: "/images/testimonials/test-03-investor.png",
    sort: 2,
    active: true,
  },
  {
    sectionCode: "testimonials",
    title: "我们更愿意和能给出方法论与证据链的媒体合作，而不是只会转述发布会的渠道。",
    subtitle: "某存储控制器公司产品副总裁",
    image: "/images/testimonials/test-04-brand-dir.png",
    sort: 3,
    active: true,
  },
  {
    sectionCode: "testimonials",
    title: "把测试数据讲明白，才能让制造、设计、市场三方说同一种语言。",
    subtitle: "测试系统公司解决方案负责人",
    image: "/images/testimonials/test-05-product-vp.png",
    sort: 4,
    active: true,
  },
  // CTA section
  {
    sectionCode: "cta",
    title: "把品牌叙事，做成可被引用的事实密度",
    description: "企业主页、深度稿件、活动与白皮书在同一套视觉与信息架构中交付——让技术、产品与商业判断，以一致的节奏被看见。",
    link: "/enterprise/login",
    linkText: "企业入驻",
    sort: 0,
    active: true,
    image: "/images/cta/cta-01-factory.png",
    extra: { kicker: "Partnership", button2Text: "合作与联系", button2Link: "/about", bgImage: "/images/cta/cta-02-chips.png" },
  },
  // Main nav
  { sectionCode: "main-nav", title: "资讯", link: "/articles", sort: 0, active: true },
  { sectionCode: "main-nav", title: "企业", link: "/companies", sort: 1, active: true },
  { sectionCode: "main-nav", title: "活动", link: "/events", sort: 2, active: true },
  { sectionCode: "main-nav", title: "招聘", link: "/jobs", sort: 3, active: true },
  { sectionCode: "main-nav", title: "报告", link: "/reports", sort: 4, active: true },
  { sectionCode: "main-nav", title: "评选", link: "/awards", sort: 5, active: true },
  { sectionCode: "main-nav", title: "关于", link: "/about", sort: 6, active: true },
  // Footer columns (with sub-links in extra)
  {
    sectionCode: "footer",
    title: "内容",
    sort: 0,
    active: true,
    extra: { links: [{ label: "资讯", href: "/articles" }, { label: "报告", href: "/reports" }, { label: "评选", href: "/awards" }] },
  },
  {
    sectionCode: "footer",
    title: "服务",
    sort: 1,
    active: true,
    extra: { links: [{ label: "企业名录", href: "/companies" }, { label: "活动", href: "/events" }, { label: "招聘", href: "/jobs" }] },
  },
  {
    sectionCode: "footer",
    title: "管理",
    sort: 2,
    active: true,
    extra: { links: [{ label: "关于我们", href: "/about" }, { label: "运营登录", href: "/admin/login" }] },
  },
  {
    sectionCode: "footer",
    title: "产业专题",
    sort: 3,
    active: true,
    extra: {
      links: [
        { label: "先进封装", href: "/articles?category=%E5%88%B6%E9%80%A0" },
        { label: "车规芯片", href: "/articles?category=%E6%B1%BD%E8%BD%A6%E7%94%B5%E5%AD%90" },
        { label: "AI 算力", href: "/articles?category=AI%E8%8A%AF%E7%89%87" },
      ],
    },
  },
];

/** 媒体渠道种子数据 */
export const mediaChannels = [
  { name: "芯师爷公众号", type: "WECHAT_MP" as const, url: "https://mp.weixin.qq.com/s/xinshiye", description: "企业首发与行业深度长文", active: true },
  { name: "芯师爷头条号", type: "TOUTIAO" as const, url: "https://www.toutiao.com/c/user/xinshiye", description: "资讯快报与热点解读", active: true },
  { name: "芯师爷知乎", type: "ZHIHU" as const, url: "https://zhihu.com/org/xinshiye", description: "技术问答与知识沉淀", active: true },
  { name: "芯师爷微博", type: "WEIBO" as const, url: "https://weibo.com/xinshiye", description: "行业动态与社会化互动", active: true },
  { name: "芯师爷领英", type: "LINKEDIN" as const, url: "https://linkedin.com/company/xinshiye", description: "英文内容与海外触达", active: true },
  { name: "B站-芯师爷", type: "BILIBILI" as const, url: "https://space.bilibili.com/xinshiye", description: "视频解读与直播回放", active: true },
];

/** 软文种子数据（企业提交的推广文章） */
export const softArticles = [
  {
    companySlug: "huaxin-precision",
    title: "深度解析：精密模拟芯片在工业4.0中的核心价值与应用生态",
    content: `## 前言\n\n工业 4.0 浪潮下，模拟芯片不再只是"配角"。从传感器信号调理到电机驱动控制，精密模拟集成电路正在重新定义工业自动化的边界。\n\n## 一、模拟芯片的不可替代性\n\n在数字技术狂飙突进的时代，一个常被忽视的事实是：**所有物理世界的信号本质上都是模拟的**。温度、压力、流量、电压——这些参数在被 ADC 转换成数字信号之前，必须经过精密的前端调理。\n\n华芯精密微电子在信号链领域积累了十余年的 IP 核，覆盖：\n- 低噪声放大器（LNA）\n- 高精度 Σ-Δ ADC\n- 隔离式栅极驱动器\n\n## 二、关键应用场景\n\n### 2.1 过程控制\n\n在石油化工和制药行业，4-20mA 环路仍是主流标准。我们的 XH-4200 系列将环路供电效率提升了 40%，同时将温漂控制在 ±5ppm/°C 以内。\n\n### 2.2 电机驱动\n\n伺服控制系统对电流采样精度要求极高。XH-8100 隔离式调制器在 100kHz 带宽下实现了 85dB 的信噪比。\n\n## 三、可靠性工程\n\n工业芯片的生命周期通常需要 15 年以上。我们建立了完整的 HTOL/HAST/THB 可靠性验证体系，确保每颗芯片都能在 -55°C 至 +175°C 的极端条件下稳定工作。\n\n## 结语\n\n精密模拟芯片是工业数字化的"最后一公里"。华芯精密将继续深耕这一领域，为全球客户提供值得信赖的信号链解决方案。`,
    summary: "从信号调理到电机驱动，精密模拟芯片正成为工业4.0的核心支柱。华芯精密解析关键技术路径与可靠性实践。",
    coverImage: "/images/covers/cover-06-pcb-dense.png",
    author: "华芯精密技术团队",
    seoKeywords: "模拟芯片,工业4.0,精密ADC,电机驱动,信号链",
    status: "APPROVED" as const,
  },
  {
    companySlug: "hengshi-compute",
    title: "AI 推理芯片的下一步：从云端到边缘的算力裂变",
    content: `## 引言\n\n大模型时代的算力焦虑正在推动推理芯片架构的根本性变革。衡石计算认为，**下一代推理芯片的核心不是更高的峰值算力，而是能效比和部署灵活性**。\n\n## 一、推理与训练的本质差异\n\n训练追求的是浮点精度和互联带宽，而推理更关注：\n- INT8/INT4 量化后的精度保持率\n- 批处理延迟（Batch Latency）\n- 每瓦特的 TOPS 指标\n\n衡石 HS-3000 系列在 INT8 推理时达到了 400 TOPS/W 的能效比，同时支持动态精度切换。\n\n## 二、边缘推理的实战挑战\n\n### 2.1 功耗预算\n\n边缘设备通常只有 10-30W 的功耗预算。我们通过稀疏化计算和存内计算技术，将 ViT 模型的端到端推理功耗控制在 8W 以内。\n\n### 2.2 模型压缩\n\n我们的工具链支持从 PyTorch/TensorFlow 模型到硬件指令集的端到端编译，自动完成量化、剪枝和算子融合。\n\n## 三、软件生态的护城河\n\n硬件只是冰山一角。真正的壁垒在于：\n- 算子库的完备性\n- 编译器优化的成熟度\n- 与主流框架的无缝集成\n\n衡石 HS-SDK 已适配 TensorFlow、PyTorch、ONNX Runtime 等主流框架，支持超过 200 种神经网络算子。\n\n## 展望\n\n从 GPT-4 级别的云端推理到智能门锁上的关键词唤醒，推理芯片正在经历前所未有的需求分化。衡石计算将坚持开放架构，与产业伙伴共建推理算力生态。`,
    summary: "大模型时代的推理芯片正经历从'算力军备竞赛'到'能效比和边缘适配'的关键转折。衡石计算分享技术策略与实践。",
    coverImage: "/images/covers/cover-03-datacenter.png",
    author: "衡石计算研究院",
    seoKeywords: "AI推理芯片,边缘计算,算力能效比,模型量化,存内计算",
    status: "PENDING_REVIEW" as const,
  },
  {
    companySlug: "xinghe-sensing",
    title: "毫米波雷达如何重塑智能座舱的人机交互体验",
    content: `## 简介\n\n当汽车从"交通工具"进化为"移动生活空间"，车内感知能力变得至关重要。星河传感的 60GHz 毫米波雷达 SoC 正在为智能座舱打开一扇全新的窗口。\n\n## 一、相比于摄像头的优势\n\n摄像头在车内场景下面临三大痛点：\n1. 隐私顾虑——用户不希望被一直"看着"\n2. 光线依赖——夜间、隧道等场景失效\n3. 遮挡问题——毯子、衣物等常见遮挡\n\n毫米波雷达天然避开了这些问题。它不捕捉图像，只感知距离、速度和角度。\n\n## 二、核心功能集成\n\n星河 XH-60 单芯片方案实现了：\n- 活体检测——区分真实乘客与重物\n- 生命体征监测——儿童遗留提醒的关键技术\n- 手势识别——非接触式控制天窗、空调\n\n### 2.1 活体检测精度\n\n在 500 次实车测试中，我们的算法对 0-12 岁儿童的检出率达到 99.7%，误报率低于 0.1%。\n\n## 三、量产准备\n\n目前 XH-60 已通过：\n- AEC-Q100 Grade 2 认证\n- ISO 26262 ASIL-B 功能安全评估\n- 三家头部主机厂的 DV 测试\n\n## 结语\n\n毫米波雷达不是摄像头的替代品，而是车内感知体系的必要补充。星河传感期待与 Tier1 和主机厂伙伴共同推动智能座舱感知的标准化进程。`,
    summary: "60GHz 毫米波雷达正在成为智能座舱不可或缺的感知手段。星河传感展示从活体检测到手势识别的量产实践。",
    coverImage: "/images/covers/cover-17-rf-chamber.png",
    author: "星河传感应用工程部",
    seoKeywords: "毫米波雷达,智能座舱,活体检测,儿童遗留,60GHz",
    status: "PUBLISHED" as const,
  },
];
