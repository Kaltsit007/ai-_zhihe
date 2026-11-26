import { createAnswer, getQuestion, listAnswers } from "@/lib/data/qa";
import { str, strOr } from "@/lib/data/validation";
import { fail, ok } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

/**
 * 获取指定问题的回答列表。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const question = await getQuestion(id);
  if (!question) {
    return fail("QUESTION_NOT_FOUND", "问题不存在", 404);
  }
  const answers = await listAnswers(id);
  return ok(answers);
}

/**
 * 提交新回答 / 词条补充。
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("BAD_JSON", "请求体不是合法 JSON");
  }

  const content = str(body.content, 2000);
  if (!content) {
    return fail("BAD_CONTENT", "回答内容不能为空，且不超过 2000 字");
  }

  const author = strOr(body.author, "热心矿大同学", 40);
  const answer = await createAnswer(id, { content, author });
  if (!answer) {
    return fail("QUESTION_NOT_FOUND", "问题不存在", 404);
  }

  return ok(answer, 201);
}
