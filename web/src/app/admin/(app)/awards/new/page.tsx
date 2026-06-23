import PageHeader from "@/components/admin/page-header";
import AwardForm from "@/components/admin/forms/award-form";

export default async function NewAwardPage() {
  return (
    <div>
      <PageHeader title="新建评选活动" description="创建新的评选活动/奖项" />
      <AwardForm />
    </div>
  );
}
