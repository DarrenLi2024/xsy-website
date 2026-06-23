import { getAdminUser } from "@/lib/admin-auth";
import PageHeader from "@/components/admin/page-header";
import EventForm from "@/components/admin/forms/event-form";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const user = await getAdminUser();
  if (!user) return null;

  return (
    <div>
      <PageHeader title="新建活动" description="创建新的活动/展会/峰会信息" />
      <EventForm />
    </div>
  );
}
