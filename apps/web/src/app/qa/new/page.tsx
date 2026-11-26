import { PageHeader } from "@/components/page-header";
import { QaForm } from "@/components/qa-form";

export default function NewQuestionPage() {
  return (
    <div>
      <PageHeader
        eyebrow="CUMT Wiki & Q&A"
        title="提问 / 贡献矿大词条"
        description="先在矿大 Wiki 与学校信息库搜一下；查不到再发布问题，也可把实用校园经验整理成词条分享给同学。"
      />
      <QaForm />
    </div>
  );
}
