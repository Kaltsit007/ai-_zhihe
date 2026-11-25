import { getTask } from "@/lib/data/tasks";
import { fail, ok } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await getTask(id);
  if (!task) return fail("TASK_NOT_FOUND", "委托不存在", 404);
  return ok(task);
}
