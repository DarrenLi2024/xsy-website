"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";
import PageHeader from "@/components/admin/page-header";
import PageSectionItemForm from "@/components/admin/forms/page-section-item-form";
import Link from "next/link";

export default function EditPageSectionItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.itemId as string;
  const { toast } = useToast();

  const [sectionId, setSectionId] = useState<string | null>(null);
  const [sectionType, setSectionType] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/page-sections/items/${itemId}`);
        if (!res.ok) {
          toast("error", "加载条目信息失败");
          return;
        }
        const data = await res.json();
        setSectionId(data.sectionId);
        setInitialData({
          id: data.id,
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          image: data.image || "",
          link: data.link || "",
          linkText: data.linkText || "",
          sort: data.sort,
          active: data.active,
          startDate: data.startDate ? data.startDate.slice(0, 10) : null,
          endDate: data.endDate ? data.endDate.slice(0, 10) : null,
          extra: data.extra || undefined,
        });

        const sectionRes = await fetch(`/api/admin/page-sections/${data.sectionId}`);
        if (sectionRes.ok) {
          const sectionData = await sectionRes.json();
          setSectionType(sectionData.type);
          setSectionTitle(sectionData.title || sectionData.code);
        }
      } catch {
        toast("error", "加载失败");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [itemId, toast]);

  const handleSave = async (data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/page-sections/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "更新失败");
    }
    toast("success", "条目已更新");
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

      <PageHeader title="编辑条目" description={`板块: ${sectionTitle}`} />

      {sectionType && initialData && (
        <PageSectionItemForm
          sectionType={sectionType}
          initialData={initialData}
          onSave={handleSave}
          onCancel={() => router.back()}
        />
      )}
    </div>
  );
}
