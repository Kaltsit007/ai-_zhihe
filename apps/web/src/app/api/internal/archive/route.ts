import { requireCronSecret, ok } from "@/lib/api/respond";
import { runScheduledTaskMaintenance } from "@/lib/data/tasks";

export const dynamic = "force-dynamic";

/**
 * 内部定时任务入口：
 * 1. 激活已到达 scheduledAt 的预约定时委托；
 * 2. 自动归档已完成（completed）及截止时间已过期仍未接单（pending）的委托。
 */
export async function POST(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  const { activated, archived, archivedCompleted, archivedExpired } =
    await runScheduledTaskMaintenance();

  const parts: string[] = [];
  if (activated > 0) {
    parts.push(`已自动上架 ${activated} 条到点定时委托`);
  }
  if (archived > 0) {
    parts.push(
      `已归档 ${archived} 条委托（已完成 ${archivedCompleted} 条，过期未接单 ${archivedExpired} 条）`
    );
  }

  return ok({
    activated,
    archived,
    archivedCompleted,
    archivedExpired,
    message:
      parts.length > 0
        ? parts.join("；")
        : "调度完成：暂无到点定时委托或待归档委托",
  });
}
