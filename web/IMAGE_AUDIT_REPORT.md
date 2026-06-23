# 芯师爷 Web - 图片资源审计报告

**审计时间**: 2026-06-23  
**审计范围**: `/Users/lirundong/Code/work/芯师爷/web/public/images/`  
**触发原因**: 用户执行 AIGC 水印移除脚本（裁剪底部 140px）后报告"很多图片消失了"

---

## 执行摘要

| 项目 | 结果 |
|------|------|
| PNG 文件总数 | 49 |
| 文件存在性 | ✅ 全部存在 |
| 文件有效性 (PIL) | ✅ 全部有效 |
| 尺寸异常 | ⚠️ 全部被裁剪 |
| 底部纯色（可能过度裁剪） | ⚠️ 14 张 |
| Dev Server (localhost:3002) | ❌ 未运行 |

---

## 1. 文件统计

### 1.1 按目录分布
```
ads/          3 个文件
covers/      20 个文件
cta/          2 个文件
hero/         3 个文件
logos/       10 个文件
testimonials  5 个文件
topics/       6 个文件
------------------------
总计         49 个文件
```

### 1.2 尺寸对比（裁剪前后）

| 目录 | 原始尺寸 (推测) | 当前尺寸 | 裁剪量 |
|------|-----------------|----------|--------|
| logos/, testimonials/, topics/ | 1024x1024 | 1024x884 | 140px ✓ |
| covers/, ads/, cta/, hero/ | 1280x720 | 1280x580 | 140px ✓ |

**结论**: 裁剪脚本成功执行，所有图片都被裁剪了 140px。

---

## 2. 图片质量分析 (Python PIL)

### 2.1 有效图片
✅ **全部 49 张图片都是有效的 PNG 文件**，可以被 PIL 正常打开。

### 2.2 过度裁剪检测

脚本检测底部 20px 是否接近纯色（标准差 < 12.75，即 255 的 5%）：

**⚠️ 疑似过度裁剪（14 张）**:

```
ads/ad-01-tech-grid.png          底部颜色: [0, 14, 33], 标准差: 5.73
logos/logo-01-chip.png           底部颜色: [232, 232, 231], 标准差: 3.77
logos/logo-02-crystal.png        底部颜色: [209, 213, 209], 标准差: 9.34
logos/logo-03-processor.png      底部颜色: [249, 249, 249], 标准差: 0.53 ⚠️ 极度纯色
logos/logo-04-pcb.png           底部颜色: [182, 182, 179], 标准差: 5.13
logos/logo-05-cleanroom.png      底部颜色: [254, 254, 254], 标准差: 0.64 ⚠️ 极度纯色
logos/logo-06-wave.png          底部颜色: [254, 254, 254], 标准差: 0.59 ⚠️ 极度纯色
logos/logo-07-power.png         底部颜色: [237, 238, 237], 标准差: 0.73 ⚠️ 极度纯色
logos/logo-08-eda.png           底部颜色: [245, 246, 246], 标准差: 0.53 ⚠️ 极度纯色
logos/logo-09-memory.png        底部颜色: [251, 252, 252], 标准差: 0.70 ⚠️ 极度纯色
logos/logo-10-rf.png            底部颜色: [192, 195, 194], 标准差: 3.56
topics/topic-02-manufacturing.png  底部颜色: [4, 20, 42], 标准差: 4.89
topics/topic-05-storage.png        底部颜色: [6, 16, 38], 标准差: 4.41
topics/topic-06-rf.png             底部颜色: [5, 6, 10], 标准差: 2.71
```

**分析**:
- `logos/` 目录最严重的 - 10 张中有 8 张底部极度纯色（标准差 < 1.0）
- 这说明原图的 AIGC 水印位于纯色背景区域，裁剪后留下了纯色底边
- **这可能不是"过度裁剪"**，而是原图底部本来就是纯色背景

### 2.3 正常图片（底部有内容）

以下图片底部 20px 标准差正常，说明裁剪没有移除重要视觉内容：
- 全部 `covers/` (20 张)
- 全部 `hero/` (3 张)
- 全部 `cta/` (2 张)
- 全部 `testimonials/` (5 张)
- `ads/ad-02-wafer.png`, `ads/ad-03-factory.png`
- `topics/topic-01-ic-design.png`, `topic-03-automotive.png`, `topic-04-ai-chip.png`

---

## 3. HTTP 可访问性测试

### 3.1 Dev Server 状态
❌ **Dev server 未在 localhost:3002 运行**

多次尝试连接均失败：
- `curl http://localhost:3002/` → HTTP 000 (连接失败)
- Node.js HTTP HEAD 请求 → 全部失败

### 3.2 无法完成的测试
由于 dev server 未运行，无法验证：
- 图片是否可以通过 HTTP 200 访问
- Content-Type 是否正确 (`image/png`)
- Next.js Image 优化是否正常工作

---

## 4. 代码中的图片引用

### 4.1 引用路径格式
代码中图片引用使用绝对路径：
```typescript
"/images/hero/hero-fab.png"
"/images/logos/logo-01-chip.png"
```

这些路径正确映射到 `public/images/` 目录。

### 4.2 Next.js 配置
`next.config.ts` 中的图片配置：
```typescript
images: {
  unoptimized: !isProd,  // 开发环境不优化
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" }
  ],
}
```

✅ 配置正确，无外部 Unsplash 引用。

### 4.3 潜在问题
1. **Next.js 可能缓存了旧尺寸** - 如果之前构建了 `.next`，可能需要清除缓存
2. **Image 组件的 width/height 可能不匹配** - 如果组件硬编码了旧尺寸 (720px 高)，图片会被拉伸/压缩

---

## 5. "图片消失"原因分析

基于审计结果，"很多图片消失了"最可能的成因：

### 假设 1: 视觉问题（最可能）
裁剪后图片底部留下纯色/白色区域，使图片看起来"不完整"或"破损"：
- `logos/` 图片底部是纯白/浅灰色（原图水印在浅色背景上）
- 用户可能误以为图片加载失败或显示异常

### 假设 2: Next.js 缓存问题
`.next` 目录可能缓存了旧图片尺寸，导致：
- Image 组件使用错误的 aspect ratio
- 图片显示时被拉伸/压缩变形

### 假设 3: Dev Server 未运行
如果用户在 dev server 停止后访问页面，图片将无法加载。

---

## 6. 建议修复步骤

### 步骤 1: 清除 Next.js 缓存
```bash
cd /Users/lirundong/Code/work/芯师爷/web
rm -rf .next
```

### 步骤 2: 重启 Dev Server
```bash
npm run dev
# 等待完全启动后访问 http://localhost:3002
```

### 步骤 3: 验证图片加载
在浏览器中打开 http://localhost:3002 并检查：
1. 打开 DevTools → Network → Img
2. 刷新页面，查看图片是否 200 OK
3. 检查图片视觉效果是否正常

### 步骤 4: 如果图片仍然显示异常
对于底部纯色的图片（`logos/` 等），考虑：
1. **重新生成这些图片**（如果原始提示词可用）
2. **或接受当前状态** - 底部纯色可能不影响视觉效果

### 步骤 5: 长期修复
如果 AIGC 水印总是在底部：
1. 在生成图片时预留底部边距
2. 或使用 AI 工具（如 inpaint）移除水印而非裁剪

---

## 7. 后续验证清单

- [ ] 启动 dev server 并验证 HTTP 200 访问
- [ ] 检查浏览器 DevTools 中的图片加载情况
- [ ] 验证所有 49 张图片在页面上正确显示
- [ ] 检查是否有 Next.js Image 尺寸警告（mismatch）
- [ ] 清除 `.next` 缓存后重新测试

---

## 8. 审计脚本

已创建以下审计脚本供后续使用：
- `audit_images_pil.py` - Python PIL 图片质量分析
- `audit_crop_boundary.py` - 裁剪边界检测
- `audit_images_http.js` - Node.js HTTP HEAD 请求测试（需要 dev server 运行）

---

## 附录: 完整图片列表

<details>
<summary>点击展开 49 张图片完整清单</summary>

### ads/ (3)
- ad-01-tech-grid.png
- ad-02-wafer.png
- ad-03-factory.png

### covers/ (20)
- cover-01-chip-macro.png
- cover-02-pcb-line.png
- cover-03-datacenter.png
- cover-04-wafer.png
- cover-05-cleanroom.png
- cover-06-pcb-dense.png
- cover-07-fab-auto.png
- cover-08-bonding.png
- cover-09-probe.png
- cover-10-fiber.png
- cover-11-eda.png
- cover-12-cooling.png
- cover-13-soldering.png
- cover-14-office.png
- cover-15-automotive.png
- cover-16-memory.png
- cover-17-rf-chamber.png
- cover-18-keynote.png
- cover-19-factory.png
- cover-20-3d-chip.png

### cta/ (2)
- cta-01-factory.png
- cta-02-chips.png

### hero/ (3)
- hero-fab.png
- hero-processor.png
- hero-wafer.png

### logos/ (10)
- logo-01-chip.png
- logo-02-crystal.png
- logo-03-processor.png
- logo-04-pcb.png
- logo-05-cleanroom.png
- logo-06-wave.png
- logo-07-power.png
- logo-08-eda.png
- logo-09-memory.png
- logo-10-rf.png

### testimonials/ (5)
- test-01-executive.png
- test-02-engineer-f.png
- test-03-investor.png
- test-04-brand-dir.png
- test-05-product-vp.png

### topics/ (6)
- topic-01-ic-design.png
- topic-02-manufacturing.png
- topic-03-automotive.png
- topic-04-ai-chip.png
- topic-05-storage.png
- topic-06-rf.png

</details>

---

**审计完成时间**: 2026-06-23
**审计工具**: Python PIL, Node.js, Next.js
**下一步**: 请启动 dev server 并重新验证图片加载
