import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/page-header";
import { QaExplorer } from "@/components/qa-explorer";
import { getQuestionAnswerCorpus, listQuestions } from "@/lib/data/qa";

export const dynamic = "force-dynamic";

export default async function QaPage() {
  const [questions, answerCorpus] = await Promise.all([
    listQuestions(),
    getQuestionAnswerCorpus(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="CUMT Campus Wiki & Q&A"
        title="矿大校园 Wiki 与答疑"
        description="面向中国矿业大学（徐州）南湖与文昌校区：支持标题、标签与回答正文一键检索；查不到再提问，欢迎同学共同补充纠错。"
        actions={
          <Link
            href="/qa/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f5132] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b3f27]"
          >
            <Icon name="plus" className="h-4 w-4" />
            提问 / 贡献词条
          </Link>
        }
      />

      <QaExplorer questions={questions} answerCorpus={answerCorpus} />
    </div>
  );
}
