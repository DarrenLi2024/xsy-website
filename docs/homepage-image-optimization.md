# 首页 AIGC 图片审计与优化方案

> 审计时间: 2026-06-23
> 范围: 首页 12 个组件 + public/images/ 全量 49 张图片

---

## 一、审计发现

### 1. 首页图片使用总览

| 区域 | 组件 | 渲染图片数 | 状态 |
|------|------|------------|------|
| Hero 轮播 | HomeHero | 3 张 (hero-01~03) | ✅ 正常 |
| 广告横幅 | HomeAdBanner | 3 张 (ad-01~03) | ✅ 正常 |
| 头条/资讯 | HomeTrending / HomeFeed | 20 张 (cover-01~20) | ✅ 正常 |
| 企业 Logo | HomeCompanies | 10 张 (logo-01~10) | ⚠️ 7对重复 |
| 活动 | HomeEvents | 复用 cover 系列 | ✅ 正常 |
| **专题** | **HomeTopics** | **0 张** (用Lucide图标) | ❌ 6张topic图未用 |
| **声音** | **HomeProof** | **0 张** (纯文字) | ❌ 5张testimonial图未用 |
| **CTA** | **HomeCta** | **0 张** (纯文字) | ❌ 2张cta图未用 |
| 报告 | HomeReports | 无图片 | ✅ 设计如此 |
| 评选 | HomeAwards | 无图片 | ✅ 设计如此 |
| 子导航 | HomeStickySubNav | 无图片 | ✅ 设计如此 |

### 2. 三大浪费位置

| 区域 | 磁盘图片 | DB存储 | 组件渲染 | 浪费 |
|------|----------|--------|----------|------|
| 专题 | topic-01~06 (6张, ~6.5MB) | ✅ pageSection image | ❌ 用Lucide图标代替 | 6 张完全未渲染 |
| 声音 | test-01~05 (5张, ~5.8MB) | ✅ pageSection image | ❌ 纯文字无头像 | 5 张完全未渲染 |
| CTA | cta-01~02 (2张, ~2.1MB) | ✅ pageSection image + extra.bgImage | ❌ 纯深色背景 | 2 张完全未渲染 |
| **合计** | **13 张, ~14.4MB** | | | **首页零可见** |

### 3. 企业 Logo 重复

10 张 Logo 被 17 家企业共用，7 对重复：

| Logo | 企业A | 企业B |
|------|-------|-------|
| logo-01-chip | 华芯精密微电子（IC设计·上海） | 杉川电子材料（材料·宁波） |
| logo-02-crystal | 澜川光电（光通信·武汉） | 穹顶量子科技（前沿探索·上海） |
| logo-03-processor | 衡石计算（AI芯片·北京） | 岸汀互连科技（互连·东莞） |
| logo-04-pcb | 启宸车联（汽车电子·苏州） | 九章测试系统（设备·南京） |
| logo-05-cleanroom | 极栈先进封装（封测·无锡） | 沧澜晶圆制造（制造·厦门） |
| logo-09-memory | 北溟半导体设备（设备·合肥） | 赤霄存储科技（存储·西安） |
| logo-10-rf | 微脉医疗电子（医疗·杭州） | 曜石射频（射频·成都） |

仅 3 家企业独享 Logo：星河传感(logo-06)、铸界功率(logo-07)、云枢EDA(logo-08)

### 4. PH 常量语义混乱

```typescript
// 同一张图，不同别名，语义冲突
cover-01-chip-macro.png   → PH.chip (芯片) + PH.meeting (会议)
cover-03-datacenter.png   → PH.server (服务器) + PH.space (空间)
cover-19-factory.png      → PH.factory (工厂) + PH.supply (供应链)
```

---

## 二、优化方案

### 方案A：组件激活（立即可做，消除浪费）

#### A1 — HomeTopics：用 AIGC 专题图替代 Lucide 图标

当前状态：6张专题图（每张~1MB）存储在DB但完全不可见，组件用 `Cpu/Factory/Car/Cctv` 图标占位。

优化后：每张专题卡片使用对应 AIGC 图片作为卡片顶部背景图（h-40），图标下沉或移除。

```
┌──────────────────────┐     ┌──────────────────────┐
│  ┌────────────────┐  │     │  ┌────────────────┐  │
│  │ topic-01 背景图 │  │     │  │ topic-02 背景图 │  │
│  └────────────────┘  │     │  └────────────────┘  │
│  IC 设计              │     │  制造与封测           │
│  最新工艺节点与...     │     │  产能扩张与良率...    │
└──────────────────────┘     └──────────────────────┘
```

文件修改：`src/components/home/home-topics.tsx`
- 接收 `image` 字段
- 在 CardBody 顶部添加 `Image` 组件
- 保留 Lucide 图标在图片左下角作为分类标识

#### A2 — HomeProof：添加专家头像

当前状态：5张人物头像静默存储，组件只渲染引语文字。

优化后：每个引用卡片顶部添加圆形头像（48x48），增强信任感。

```
┌──────────────────────────┐
│  ┌────┐                   │
│  │头像│  张工 · 某公司CTO  │
│  └────┘                   │
│  「工艺稳定性是我们选择    │
│    供应商的首要标准...」   │
└──────────────────────────┘
```

文件修改：`src/components/home/home-proof.tsx`
- 使用 `item.image` 渲染 Next.js Image 圆形头像
- 在 blockquote 之前插入 figure-header 区域

#### A3 — HomeCta：启用 CTA 背景图

当前状态：深色纯色背景，cta-01/02 两张图完全闲置。

优化后：整区使用 `bgImage` 做半透明叠加背景（opacity-15 + mix-blend-multiply），增强视觉层次。

文件修改：`src/components/home/home-cta.tsx`
- 读取 `extra.bgImage`，以绝对定位+低透明度叠加在深色背景上
- 保持文字可读性

### 方案B：Logo 去重（消除品牌混淆）

为 7 对共享 Logo 的企业中每家生成独立 Logo，共需 7 张新图：

| 新增 | 对应企业 | 行业 | 风格参考 |
|------|----------|------|----------|
| logo-11-materials.png | 杉川电子材料 | 材料 | 分子/晶格结构 |
| logo-12-quantum.png | 穹顶量子科技 | 前沿 | 量子态/叠加 |
| logo-13-interconnect.png | 岸汀互连科技 | 互连 | 信号波形/连接器 |
| logo-14-test.png | 九章测试系统 | 设备 | 探针卡/测试波形 |
| logo-15-foundry.png | 沧澜晶圆制造 | 制造 | 晶圆厂/光刻 |
| logo-16-storage.png | 赤霄存储科技 | 存储 | NAND/3D堆叠 |
| logo-17-rf-frontend.png | 曜石射频 | 射频 | 天线/频谱 |

### 方案C：PH 常量清理

合并语义重复的别名，保留单一语义：

```typescript
// 删除: meeting, space, supply, ram
// 保留: chip, server, factory, memory
```

---

## 三、执行建议

| 阶段 | 内容 | 工时 | 影响 |
|------|------|------|------|
| **P0 · 本日** | A1+A2: 激活13张专题/声音图片 | ~30min | 首页视觉丰富度+60% |
| **P0 · 本日** | B: 生成7张新Logo去重 | ~15min | 品牌辨识度归一化 |
| **P1 · 本日** | A3: 激活CTA背景图 | ~10min | CTA视觉层次+1 |
| **P2 · 后续** | C: PH常量清理 | ~5min | 代码可维护性 |
