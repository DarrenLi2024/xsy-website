"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";
import PageHeader from "@/components/admin/page-header";
import PageSectionItemForm from "@/components/admin/forms/page-section-item-form";
import Link from "next/link";

export default function NewPageSectionItemPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = params.id as string;
  const { toast } = useToast();

  const [sectionType, setSectionType] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/page-sections/${sectionId}`);
        if (!res.ok) {
          toast("error", "加载板块信息失败");
          return;
        }
        const data = await res.json();
        setSectionType(data.type);
        setSectionTitle(data.title || data.code);
      } catch {
        toast("error", "加载失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sectionId, toast]);

  const handleSave = async (data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/page-sections/${sectionId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, sectionType }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "创建失败");
    }
    toast("success", "条目已创建");
    router.push(`/admin/page-sections/${sectionId}/items`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">
        <Link
          href="/admin/page-sections"
          className="text-sm text-cyan-400 hover:underline"
        >
          &larr; 返回板块列表
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <Link
          href={`/admin/page-sections/${sectionId}/items`}
          className="text-sm text-cyan-400 hover:underline"
        >
          条目管理
        </Link>
      </div>

      <PageHeader title="添加条目" description={`板块: ${sectionTitle}`} />

      {sectionType && (
        <PageSectionItemForm
          sectionType={sectionType}
          onSave={handleSave}
          onCancel={() => router.back()}
        />
      )}
    </div>
  );
}
