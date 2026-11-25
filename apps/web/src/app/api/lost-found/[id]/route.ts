import { notImplemented } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

/**
 * 预留接口：失物/拾物详情。
 * 实现人：C，D3。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return notImplemented("失物详情", "C", "D3");
}

/**
 * 预留接口：认领 / 关闭。
 * 实现人：C，D3。请求体：{ status: "claimed" | "closed" }。
 */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return notImplemented("认领/关闭失物", "C", "D3");
}
