import { updateTaskStatus } from "@/lib/data/tasks";
import { oneOf } from "@/lib/data/validation";
import { fail, ok } from "@/lib/api/respond";
import type { TaskStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: readonly TaskStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
  "archived",
];

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
  if (!status) return fail("BAD_STATUS", "状态不合法");

  const task = await updateTaskStatus(id, status);
  if (!task) return fail("TASK_NOT_FOUND", "委托不存在", 404);
  return ok(task);
}
