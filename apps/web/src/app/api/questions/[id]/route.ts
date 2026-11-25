import { notImplemented } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

/**
 * 预留接口：答疑详情（含回答列表）。
 * 实现人：C，D2。契约见 docs/api/接口契约.md 「预留接口」。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return notImplemented("答疑详情", "C", "D2");
}
