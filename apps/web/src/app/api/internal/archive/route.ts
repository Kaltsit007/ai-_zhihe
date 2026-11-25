import { requireCronSecret, ok } from "@/lib/api/respond";
import { archiveCompletedTasks } from "@/lib/data/tasks";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  const archived = await archiveCompletedTasks();
  return ok({
    archived,
    message:
      archived > 0
        ? "已归档 " + archived + " 条已完成委托"
        : "没有需要归档的委托",
  });
}
