import { getAdminUser } from "@/lib/admin-auth";
import PageHeader from "@/components/admin/page-header";
import AwardForm from "@/components/admin/forms/award-form";

export const dynamic = "force-dynamic";

export default async function NewAwardPage() {
  const user = await getAdminUser();
  if (!user) return null;

  return (
    <div>
      <PageHeader title="新建评选活动" description="创建新的评选活动/奖项" />
      <AwardForm />
    </div>
  );
}
