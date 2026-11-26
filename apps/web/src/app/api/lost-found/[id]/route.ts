import { getLostFound, updateLostFoundStatus } from "@/lib/data/lost-found";
import { oneOf } from "@/lib/data/validation";
import { fail, ok } from "@/lib/api/respond";
import type { LostFoundStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: readonly LostFoundStatus[] = ["open", "claimed", "closed"];

/**
 * 获取单条失物/拾物详情。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await getLostFound(id);
  if (!item) {
    return fail("LOST_FOUND_NOT_FOUND", "失物招领条目不存在", 404);
  }
  return ok(item);
}

/**
 * 更新失物/拾物状态（认领 / 关闭 / 重新打开）。
 * 业务口径：普通登录用户即可操作认领；接 Supabase 后在验登录后通过 service_role 仅更新 status。
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
    return fail("BAD_STATUS", "状态只支持 open、claimed 或 closed");
  }

  const updated = await updateLostFoundStatus(id, status);
  if (!updated) {
    return fail("LOST_FOUND_NOT_FOUND", "失物招领条目不存在", 404);
  }

  return ok(updated);
}
