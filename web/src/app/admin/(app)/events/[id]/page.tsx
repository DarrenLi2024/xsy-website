import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import EventForm from "@/components/admin/forms/event-form";
import StatusBadge from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";

export default async function EditEventPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const event = await prisma.event.findUnique({
      where: { id },
      include: { company: { select: { name: true } } },
    });

  if (!event) notFound();

  const typeLabels: Record<string, string> = {
    EXHIBITION: "展会",
    CONFERENCE: "峰会",
    WEBINAR: "线上",
    SALON: "沙龙",
    WORKSHOP: "培训",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <PageHeader title={`编辑: ${event.title}`} />
        <StatusBadge status={event.status} />
      </div>
      <div className="mb-6 text-xs text-slate-500">
        ID: {event.id} · 类型: {typeLabels[event.type] || event.type} · 创建于{" "}
        {new Date(event.createdAt).toLocaleDateString("zh-CN")}
      </div>
      <EventForm
        initialData={{
          id: event.id,
          title: event.title,
          description: event.description || "",
          type: event.type,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate.toISOString(),
          location: event.location || "",
          coverImage: event.coverImage || "",
          capacity: event.capacity ?? null,
          registrationDeadline: event.registrationDeadline?.toISOString() || null,
          status: event.status,
          isFeatured: event.isFeatured,
        }}
      />
    </div>
  );
}
