"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

const SECTION_TYPE_LABELS: Record<string, string> = {
  HERO_SLIDE: "Hero 轮播图",
  TOPIC_CARD: "专题卡片",
  TESTIMONIAL: "声音引语",
  NAV_LINK: "导航链接",
  FOOTER_COLUMN: "页脚列",
  CTA_SECTION: "CTA 区",
};

type Props = {
  sectionType: string;
  initialData?: {
    id?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    link?: string;
    linkText?: string;
    sort?: number;
    active?: boolean;
    startDate?: string;
    endDate?: string;
    extra?: Record<string, unknown>;
  };
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
};

export default function PageSectionItemForm({
  sectionType,
  initialData,
  onSave,
  onCancel,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [image, setImage] = useState(initialData?.image ?? "");
  const [link, setLink] = useState(initialData?.link ?? "");
  const [linkText, setLinkText] = useState(initialData?.linkText ?? "");
  const [sort, setSort] = useState(initialData?.sort ?? 0);
  const [active, setActive] = useState(initialData?.active ?? true);
  const [startDate] = useState(initialData?.startDate ?? "");
  const [endDate] = useState(initialData?.endDate ?? "");
  const [extra, setExtra] = useState(
    initialData?.extra ? JSON.stringify(initialData.extra, null, 2) : ""
  );
  const [saving, setSaving] = useState(false);

  const requiredFields = (() => {
    switch (sectionType) {
      case "HERO_SLIDE":
        return !!image;
      case "TOPIC_CARD":
        return !!title;
      case "TESTIMONIAL":
        return !!title;
      case "NAV_LINK":
        return !!title && !!link;
      default:
        return true;
    }
  })();

  const parseExtra = (): Record<string, unknown> | null => {
    if (!extra.trim()) return null;
    try {
      return JSON.parse(extra);
    } catch {
      return null;
    }
  };

  const save = async () => {
    if (sectionType === "FOOTER_COLUMN" || sectionType === "CTA_SECTION") {
      const parsed = parseExtra();
      if (extra.trim() && !parsed) {
        toast("error", "extra JSON 格式错误，请检查");
        return;
      }
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        sectionType,
        title: title || null,
        subtitle: subtitle || null,
        description: description || null,
        image: image || null,
        link: link || null,
        linkText: linkText || null,
        sort,
        active,
        startDate: startDate || null,
        endDate: endDate || null,
      };

      if (extra.trim()) {
        body.extra = parseExtra();
      }

      await onSave(body);
      router.refresh();
    } catch {
      toast("error", "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50";
  const textareaClass =
    "mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50";
  const sideInputClass =
    "mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none";
  const labelClass = "block text-sm font-medium text-slate-300";
  const sideLabelClass = "block text-xs font-medium text-slate-500";

  const sectionLabel =
    SECTION_TYPE_LABELS[sectionType] || sectionType;

  const renderExtraField = () => {
    if (sectionType !== "FOOTER_COLUMN" && sectionType !== "CTA_SECTION")
      return null;

    const label =
      sectionType === "FOOTER_COLUMN"
        ? "子链接 (extra JSON)"
        : "扩展配置 (extra JSON)";

    const placeholder =
      sectionType === "FOOTER_COLUMN"
        ? '[\n  {"label":"资讯","href":"/articles"},\n  {"label":"活动","href":"/events"}\n]'
        : '{\n  "button2Text": "合作与联系",\n  "button2Link": "/about",\n  "kicker": "Partnership"\n}';

    return (
      <div>
        <label className={labelClass}>{label}</label>
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          rows={6}
          className={textareaClass}
          placeholder={placeholder}
        />
      </div>
    );
  };

  const renderHeroFields = () => (
    <>
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className={labelClass}>
            图片 URL <span className="text-red-400">*</span>
          </label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={inputClass}
            placeholder="https://example.com/banner.jpg"
          />
        </div>
        <div>
          <label className={labelClass}>标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="主标题"
          />
        </div>
        <div>
          <label className={labelClass}>副标题</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={inputClass}
            placeholder="副标题 / 导语"
          />
        </div>
        <div>
          <label className={labelClass}>描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={textareaClass}
            placeholder="描述文字..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>链接 URL</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className={inputClass}
              placeholder="/articles"
            />
          </div>
          <div>
            <label className={labelClass}>按钮文字</label>
            <input
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className={inputClass}
              placeholder="了解更多"
            />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">轮播设置</h3>
          <div>
            <label className={sideLabelClass}>排序</label>
            <input
              type="number"
              value={sort}
              onChange={(e) => setSort(parseInt(e.target.value) || 0)}
              className={sideInputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-white/20 bg-white/5"
            />{" "}
            启用
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving || !requiredFields}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {saving ? "保存中..." : isEdit ? "保存更改" : "创建"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            取消
          </button>
        )}
      </div>
    </>
  );

  const renderTopicCardFields = () => (
    <>
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className={labelClass}>
            卡片标题 <span className="text-red-400">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder='例如: IC 设计'
          />
        </div>
        <div>
          <label className={labelClass}>描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={textareaClass}
            placeholder="卡片描述..."
          />
        </div>
        <div>
          <label className={labelClass}>图片 URL</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={inputClass}
            placeholder="https://example.com/card.jpg"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>链接 URL</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className={inputClass}
              placeholder='/articles?category=IC设计'
            />
          </div>
          <div>
            <label className={labelClass}>按钮文字</label>
            <input
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className={inputClass}
              placeholder="查看"
            />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">卡片设置</h3>
          <div>
            <label className={sideLabelClass}>排序</label>
            <input
              type="number"
              value={sort}
              onChange={(e) => setSort(parseInt(e.target.value) || 0)}
              className={sideInputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-white/20 bg-white/5"
            />{" "}
            启用
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving || !requiredFields}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {saving ? "保存中..." : isEdit ? "保存更改" : "创建"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            取消
          </button>
        )}
      </div>
    </>
  );

  const renderTestimonialFields = () => (
    <>
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className={labelClass}>
            引语内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={4}
            className={textareaClass}
            placeholder="引用内容..."
          />
        </div>
        <div>
          <label className={labelClass}>作者身份</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={inputClass}
            placeholder='某头部 Fabless 市场副总裁'
          />
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">引语设置</h3>
          <div>
            <label className={sideLabelClass}>排序</label>
            <input
              type="number"
              value={sort}
              onChange={(e) => setSort(parseInt(e.target.value) || 0)}
              className={sideInputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-white/20 bg-white/5"
            />{" "}
            启用
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving || !requiredFields}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {saving ? "保存中..." : isEdit ? "保存更改" : "创建"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            取消
          </button>
        )}
      </div>
    </>
  );

  const renderNavLinkFields = () => (
    <>
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className={labelClass}>
            链接名称 <span className="text-red-400">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="资讯"
          />
        </div>
        <div>
          <label className={labelClass}>
            链接 URL <span className="text-red-400">*</span>
          </label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={inputClass}
            placeholder="/articles"
          />
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">导航设置</h3>
          <div>
            <label className={sideLabelClass}>排序</label>
            <input
              type="number"
              value={sort}
              onChange={(e) => setSort(parseInt(e.target.value) || 0)}
              className={sideInputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-white/20 bg-white/5"
            />{" "}
            启用
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving || !requiredFields}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {saving ? "保存中..." : isEdit ? "保存更改" : "创建"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            取消
          </button>
        )}
      </div>
    </>
  );

  const renderFooterColumnFields = () => (
    <>
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className={labelClass}>列标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="内容"
          />
        </div>
        {renderExtraField()}
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">页脚设置</h3>
          <div>
            <label className={sideLabelClass}>排序</label>
            <input
              type="number"
              value={sort}
              onChange={(e) => setSort(parseInt(e.target.value) || 0)}
              className={sideInputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-white/20 bg-white/5"
            />{" "}
            启用
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {saving ? "保存中..." : isEdit ? "保存更改" : "创建"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            取消
          </button>
        )}
      </div>
    </>
  );

  const renderCtaSectionFields = () => (
    <>
      <div className="space-y-6 lg:col-span-2">
        <div>
          <label className={labelClass}>标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="标题"
          />
        </div>
        <div>
          <label className={labelClass}>描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={textareaClass}
            placeholder="描述文字..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>主按钮 URL</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className={inputClass}
              placeholder="/contact"
            />
          </div>
          <div>
            <label className={labelClass}>主按钮文字</label>
            <input
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className={inputClass}
              placeholder="立即报名"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>副标题 (kicker)</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={inputClass}
            placeholder="副标题 / 导语"
          />
        </div>
        {renderExtraField()}
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">CTA 设置</h3>
          <div>
            <label className={sideLabelClass}>排序</label>
            <input
              type="number"
              value={sort}
              onChange={(e) => setSort(parseInt(e.target.value) || 0)}
              className={sideInputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-white/20 bg-white/5"
            />{" "}
            启用
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {saving ? "保存中..." : isEdit ? "保存更改" : "创建"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            取消
          </button>
        )}
      </div>
    </>
  );

  const renderForm = () => {
    switch (sectionType) {
      case "HERO_SLIDE":
        return renderHeroFields();
      case "TOPIC_CARD":
        return renderTopicCardFields();
      case "TESTIMONIAL":
        return renderTestimonialFields();
      case "NAV_LINK":
        return renderNavLinkFields();
      case "FOOTER_COLUMN":
        return renderFooterColumnFields();
      case "CTA_SECTION":
        return renderCtaSectionFields();
      default:
        return (
          <p className="text-sm text-slate-400">
            未知的 SectionType: {sectionType}
          </p>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
        {sectionLabel}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">{renderForm()}</div>
    </div>
  );
}
