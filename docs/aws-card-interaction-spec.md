# AWS 精确复刻 — 卡片交互效果功能开发文档 v2.0

## 1. 概述

### 1.1 目标

在芯师爷首页各区块卡片上，实现与 AWS 首页 (aws.amazon.com) **完全一致** 的卡片 hover 交互效果。

### 1.2 效果清单

| # | 效果 | 交互行为 | 触发方式 |
|---|---|---|---|
| 1 | 卡片 hover lift | `translateY(-4px)` + 0.3s ease-out | hover |
| 2 | 多色混合 box-shadow | 多层彩色阴影叠加（暖橙+冷蓝+白），不同边缘方向 | hover |
| 3 | 多光源 ::before 辉光 | 3 个径向渐变从不同方向打光，超低透明度 | hover |
| 4 | 底部 accent bar | 2px 彩色条从左到右 scaleX(0→1) | hover |
| 5 | 鼠标追踪 glow | 单色光晕圆心跟随鼠标 | hover + mousemove |
| 6 | 白色扫光 shimmer | 120deg 斜角光从左上扫到右下 | hover 一次完成 |

### 1.3 范围

| 区块 | 卡片类型 | 效果组合 |
|---|---|---|
| 头条 Featured | 大图轮播 | 1 + 2 + 3 + 5 + 6 |
| 资讯 Stories | 图文网格 | 1 + 2 + 3 + 4 |
| 企业 Directory | 企业名片 | 1 + 2 + 3 + 4 + 6 |
| 活动 Events | 活动卡片 | 1 + 2 + 3 + 4 |
| 专题 Topics | 专题导航 | 1 + 2 + 3 + 4 |

---

## 2. AWS 多色混合辉光 精确渲染分析

### 2.1 核心发现：多色混合，非单一颜色

AWS 卡片 hover 时的彩色光晕**不是单一颜色**，而是**多色分层混合**的效果：

```
卡片 hover 时的光晕色彩分布（俯视图）：

     ┌─────────────────────────┐
     │    ◇ 淡蓝/紫            │  ← 冷光源 (左上)
     │                         │
     │       卡片内容            │
     │                         │
     │          ◆ 暖橙/粉       │  ← 暖光源 (右下)
     │    ◇ 白/淡黄            │  ← 光泽光源 (中上)
     └─────────────────────────┘
```

**色彩组成：**

| 光源 | 色相 | 出现位置 | 视觉占比 | 作用 |
|---|---|---|---|---|
| 暖色光 | 橙/粉/珊瑚色 (#FF7A6E ~ #FF9A8A) | 卡片中下/右下区域 | ~50% | 主色彩基调 |
| 冷色光 | 淡蓝/淡紫 (#8EC5FC ~ #A8BFFF) | 卡片左上/右上区域 | ~30% | 冷暖对比，增加层次 |
| 光泽光 | 白/淡黄 (rgba(255,255,255,0.4)) | 卡片中上区域 | ~20% | 光泽感，模拟光照 |

### 2.2 实现原理

AWS 使用 **两个独立机制** 叠加产生多色辉光：

#### 机制 A：多层 box-shadow（彩色阴影的主要来源）

```css
box-shadow:
  /* 暖色 — 主要来自底部方向 */
  0 8px 28px rgba(255, 107, 107, 0.10),    /* 远层大范围暖光 */
  0 2px 8px rgba(255, 107, 107, 0.06),     /* 近层小范围暖光 */
  /* 冷色 — 来自左右两侧 */
  -4px 0 16px rgba(130, 170, 255, 0.05),   /* 左侧冷光 */
  4px 0 16px rgba(130, 170, 255, 0.04);    /* 右侧冷光 */
```

多层阴影从不同方向产生光晕，暖色偏下/中，冷色偏两侧，混合后产生高级的多色感。

#### 机制 B：::before 多光源径向渐变（光晕的底色补充）

```css
.card-root::before {
  background:
    /* 暖光源 — 从右下角打光 */
    radial-gradient(350px circle at 70% 80%,
      rgba(255, 107, 107, 0.05), transparent 50%),
    /* 冷光源 — 从左上角打光 */
    radial-gradient(300px circle at 25% 20%,
      rgba(130, 170, 255, 0.04), transparent 50%),
    /* 光泽光 — 从正上方打光 */
    radial-gradient(200px circle at 50% 10%,
      rgba(255, 255, 255, 0.06), transparent 40%);
}
```

三个径向渐变的圆心固定在卡片的不同位置（不跟随鼠标），叠加后产生**多光源照射**的视觉效果。

### 2.3 与鼠标跟踪 glow 的关系

鼠标跟踪的 glow 是**独立的单色光晕**（白色或极淡的 accent 色），叠加在 ::before 的多色辉光之上：

```
卡片 hover 时的层叠顺序 (从底层到顶层)：

  ① ::before 多光源辉光 (暖+冷+白，固定位置)
  ② box-shadow 多层彩色阴影 (暖+冷，从边缘发散)
  ③ 卡片内容 (文本、图片等)
  ④ 鼠标追踪 glow (单色，跟随鼠标)
  ⑤ 白色扫光 shimmer (hover 时一次性扫过)
```

### 2.4 关键：所有卡片使用同一组光源

AWS 的**所有卡片**（金融服务、医疗、政府、游戏等行业卡片）使用的都是**同一组光源配置**（暖橙+冷蓝+白），而非按行业分类换颜色。

行业分类的视觉差异是通过卡片内容和图标色传达的，辉光本身是统一的多色光源。

---

## 3. 精确复刻方案

### 3.1 组件架构

```
CardRoot (wrapper)
├── <div> children (卡片内容, z-index 保持在上层)
├── CardGlow (独立 <span>, 鼠标追踪单色光晕)
├── CardShine (独立 <span>, 白色扫光)
├── ::before (多光源辉光 — z-index: -1, 位于卡片背景之下)
│     └── 3 层 radial-gradient (暖色+冷色+光泽)
└── ::after (底部 accent bar — 使用 theme accent 色)
```

### 3.2 CSS 变量体系

| 变量 | 用途 | 默认值 |
|---|---|---|
| `--shadow-warm` | 暖色阴影 rgba | `rgba(255,107,107,0.10)` |
| `--shadow-cool` | 冷色阴影 rgba | `rgba(130,170,255,0.05)` |
| `--accent-bar` | 底部条颜色 | `var(--accent)` |

不再需要按区块传递不同颜色，因为**所有卡片共享同一组多色光源**。

### 3.3 精确 CSS 实现

#### 3.3.1 box-shadow（彩色阴影的主要来源）

```css
.card-root {
  transition: box-shadow 0.3s cubic-bezier(0.2, 0, 0, 1),
              transform 0.3s cubic-bezier(0.2, 0, 0, 1),
              border-color 0.3s cubic-bezier(0.2, 0, 0, 1);
}
.card-root:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow:
    /* 暖色主光 — 底部 */
    0 8px 28px rgba(255, 107, 107, 0.10),
    0 2px 8px rgba(255, 107, 107, 0.06),
    /* 冷色辅光 — 两侧 */
    -4px 0 16px rgba(130, 170, 255, 0.05),
    4px 0 16px rgba(130, 170, 255, 0.04),
    /* 底部边缘强调 */
    0 1px 4px rgba(255, 107, 107, 0.04);
}
```

#### 3.3.2 ::before 多光源辉光

```css
.card-root::before {
  content: "";
  position: absolute;
  inset: -8px;
  z-index: -1;
  pointer-events: none;
  border-radius: 18px; /* inherit + 2px 补偿 */
  background:
    /* 暖光源 — 右下角 */
    radial-gradient(350px circle at 70% 85%,
      rgba(255, 107, 107, 0.05), transparent 50%),
    /* 冷光源 — 左上角 */
    radial-gradient(300px circle at 25% 15%,
      rgba(130, 170, 255, 0.04), transparent 50%),
    /* 光泽光 — 正上方 */
    radial-gradient(200px circle at 50% 5%,
      rgba(255, 255, 255, 0.06), transparent 40%);
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.2, 0, 0, 1);
}
.card-root:hover::before {
  opacity: 1;
}
```

#### 3.3.3 ::after 底部 accent bar

```css
.card-root::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 2px;
  pointer-events: none;
  background: var(--accent-bar, var(--accent));
  transform-origin: left;
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
}
.card-root:hover::after {
  transform: scaleX(1);
}
```

#### 3.3.4 鼠标追踪 glow（独立 DOM 元素）

```html
<span class="card-glow" aria-hidden="true" />
```

```css
.card-glow {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  border-radius: inherit;
  background: radial-gradient(
    400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.08) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.5s ease;
}
.card-root:hover .card-glow {
  opacity: 1;
}
```

#### 3.3.5 白色扫光 shimmer（独立 DOM 元素）

```html
<span class="card-shine" aria-hidden="true" />
```

```css
.card-shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  border-radius: inherit;
  overflow: hidden;
}
.card-shine::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 20%,
    rgba(255, 255, 255, 0.20) 40%,
    rgba(255, 255, 255, 0.30) 45%,
    rgba(255, 255, 255, 0.20) 50%,
    transparent 70%
  );
  background-size: 200% 100%;
  background-position: -200% 0;
  opacity: 0;
  transition: opacity 0.35s ease, background-position 0.6s ease;
}
.card-root:hover .card-shine::after {
  opacity: 1;
  background-position: 200% 0;
}
```

### 3.4 效果组合矩阵

| 变体 | lift | 多色 box-shadow | ::before 多光源 | ::after bar | 鼠标 glow | 扫光 |
|---|---|---|---|---|---|---|
| `default` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `glow` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `none` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. 实施步骤

### Step 1: 重写 card.tsx

- 删除 useId() + \<style\> 注入方案（不再需要动态颜色）
- 所有多色光源使用固定 CSS 值（所有卡片共享同一组色值）
- ::before 改为 3 层径向渐变（暖色+冷色+光泽），z-index: -1
- ::after 保持底部 accent bar（默认蓝色，glow variant 关闭）
- 新增 CardGlow 组件 — 白色光晕，鼠标追踪
- 新增 CardShine 组件 — 白色扫光

### Step 2: 更新首页各区块

- 所有区块统一使用同一组光源，不再传 accentColor
- Featured carousel 使用 glow variant
- 资讯、企业、活动、专题使用 default variant

### Step 3: 编译验证

- tsc --noEmit

### Step 4: 浏览器验证

- 所有卡片 hover 时是多色混合辉光（暖橙+冷蓝）
- 鼠标追踪 glow 跟随
- 底部 bar 展开，扫光可见

---

## 5. 验收标准

| # | 检查项 | 预期 | 实测 |
|---|---|---|---|
| 1 | hover lift | -4px transform | |
| 2 | 彩色 box-shadow | 非灰色，暖色偏下冷色偏两侧 | |
| 3 | ::before 多光源辉光 | 不可见单独彩色圆，整体产生多色感 | |
| 4 | 底部 accent bar | 2px 从左到右展开 | |
| 5 | 鼠标追踪 glow | 白色光晕跟随鼠标 | |
| 6 | 白色扫光 | 120deg 从左上到右下 | |
| 7 | 统一光源 | 所有卡片同一组颜色 | |
| 8 | motion-reduce | 全部禁用 | |
| 9 | TypeScript | 零报错 | |
| 10 | Console | 无 hydration 报错 | |

---

## 6. 文件变更清单

| 文件 | 变更 | 说明 |
|---|---|---|
| `web/src/components/ui/card.tsx` | **重写** | 多色 ::before 辉光 + new CardGlow + new CardShine |
| `web/src/components/home/home-companies.tsx` | 修改 | 移除 accentColor，改用统一光源 |
| `web/src/components/home/home-events.tsx` | 修改 | 同上 |
| `web/src/components/home/home-topics.tsx` | 修改 | 同上 |
| `web/src/components/home/home-feed.tsx` | 修改 | 同上；Featured 用 glow variant |
| `web/src/app/globals.css` | 修改 | 清理未用动画 |

---

*文档版本: v2.0*
*日期: 2026-05-14*
*核心变化: 从单一 accent 颜色改为多色混合光源方案*
