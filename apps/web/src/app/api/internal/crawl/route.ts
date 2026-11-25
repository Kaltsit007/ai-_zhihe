import { requireCronSecret, ok } from "@/lib/api/respond";
import { refreshSchoolInfo } from "@/lib/data/info";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  const added = await refreshSchoolInfo();
  return ok({
    added,
    message:
      added > 0
        ? "爬取完成，新增 1 条（演示公开源，已按来源去重）"
        : "没有新数据（演示源按来源去重）",
  });
}
