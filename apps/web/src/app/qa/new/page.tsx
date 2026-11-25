import { PageHeader } from "@/components/page-header";
import { QaForm } from "@/components/qa-form";

export default function NewQuestionPage() {
  return (
    <div>
      <PageHeader
        eyebrow="New question"
        title="提一个问题"
        description="先搜一下信息库，没有答案再提问。标题写具体，别人才知道怎么帮你。"
      />
      <QaForm />
    </div>
  );
}
