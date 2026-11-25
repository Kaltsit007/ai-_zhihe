import { LostFoundForm } from "@/components/lost-found-form";
import { PageHeader } from "@/components/page-header";

export default function NewLostFoundPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Lost & found"
        title="提交失物 / 拾物"
        description="写清楚物品特征、地点和时间。捡到校园卡只写姓氏，认领时再核对。"
      />
      <LostFoundForm />
    </div>
  );
}
