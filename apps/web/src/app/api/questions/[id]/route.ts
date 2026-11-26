import {
  getQuestionWithAnswers,
  updateQuestionStatus,
} from "@/lib/data/qa";
import { oneOf } from "@/lib/data/validation";
import { fail, ok } from "@/lib/api/respond";
import type { QuestionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: readonly QuestionStatus[] = ["open", "solved"];

/**
 * 答疑详情（含回答列表）。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const detail = await getQuestionWithAnswers(id, { incrementView: true });
  if (!detail) {
    return fail("QUESTION_NOT_FOUND", "问题不存在", 404);
  }
  return ok(detail);
}

/**
 * 更新问题状态（标为已解决 / 重新打开）。
 */
export async function PATCH(
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

  const status = oneOf(body.status, STATUSES);
  if (!status) {
    return fail("BAD_STATUS", "状态只支持 open 或 solved");
  }

  const updated = await updateQuestionStatus(id, status);
  if (!updated) {
    return fail("QUESTION_NOT_FOUND", "问题不存在", 404);
  }

  return ok(updated);
}
