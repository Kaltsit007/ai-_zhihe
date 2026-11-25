import { notImplemented } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

/**
 * 预留接口：回答列表。
 * 实现人：C，D2。返回 Answer[]，字段见 src/lib/types.ts。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return notImplemented("回答列表", "C", "D2");
}

/**
 * 预留接口：提交回答。
 * 实现人：C，D2。请求体：{ content: string, author?: string }，成功返回 201。
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return notImplemented("提交回答", "C", "D2");
}
