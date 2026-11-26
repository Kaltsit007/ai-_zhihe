import { createQuestion, listQuestions } from "@/lib/data/qa";
import { oneOf, str, strOr, tags } from "@/lib/data/validation";
import { fail, ok } from "@/lib/api/respond";
import type { QuestionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: readonly QuestionStatus[] = ["open", "solved"];

function normalizeTags(value: unknown, max = 6): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, max);
  }
  return tags(value, max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = oneOf(searchParams.get("status"), STATUSES) ?? undefined;
  const questions = await listQuestions({
    keyword: searchParams.get("q") ?? undefined,
    status,
    tag: searchParams.get("tag") ?? undefined,
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

  const author = strOr(body.author, "矿大同学", 40);

  const question = await createQuestion({
    title,
    excerpt,
    tags: normalizeTags(body.tags),
    author,
  });
  return ok(question, 201);
}
