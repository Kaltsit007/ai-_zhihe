import { createQuestion, listQuestions } from "@/lib/data/qa";
import { oneOf, str, tags } from "@/lib/data/validation";
import { fail, ok } from "@/lib/api/respond";
import type { QuestionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: readonly QuestionStatus[] = ["open", "solved"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = oneOf(searchParams.get("status"), STATUSES) ?? undefined;
  const questions = await listQuestions({
    keyword: searchParams.get("q") ?? undefined,
    status,
  });
  return ok(questions);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("BAD_JSON", "请求体不是合法 JSON");
  }

  const title = str(body.title, 150);
  if (!title) return fail("BAD_TITLE", "标题不能为空，且不超过 150 字");

  const excerpt = str(body.excerpt, 2000);
  if (!excerpt) return fail("BAD_EXCERPT", "问题描述不能为空");

  const question = await createQuestion({
    title,
    excerpt,
    tags: tags(body.tags),
  });
  return ok(question, 201);
}