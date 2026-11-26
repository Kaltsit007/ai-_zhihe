import { notFound } from "next/navigation";
import { QaDetail } from "@/components/qa-detail";
import { getQuestionWithAnswers } from "@/lib/data/qa";

export const dynamic = "force-dynamic";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getQuestionWithAnswers(id, { incrementView: true });

  if (!detail) {
    notFound();
  }

  return (
    <QaDetail
      initialQuestion={detail.question}
      initialAnswers={detail.answers}
    />
  );
}
