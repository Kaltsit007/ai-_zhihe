import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json(
    { data: null, error: { code, message } },
    { status }
  );
}

/**
 * 预留接口：路径已存在、契约已定，实现交给指定同学。
 * 前端可以现在就对接到这个路径，先按 501 做兜底提示。
 */
export function notImplemented(feature: string, owner: string, day: string) {
  return NextResponse.json(
    {
      data: null,
      error: {
        code: "NOT_IMPLEMENTED",
        message: `${feature} 接口已预留，由 ${owner} 在 ${day} 实现`,
      },
    },
    { status: 501 }
  );
}

/**
 * 内部接口鉴权：配置了 CRON_SECRET 才校验。
 * 演示环境（没配 secret）直接放行，方便管理页一键触发。
 * 上线前必须在 .env.local / Vercel 配好 CRON_SECRET。
 */
export function requireCronSecret(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  if (request.headers.get("x-cron-secret") === secret) return null;
  return fail("UNAUTHORIZED", "缺少或错误的 CRON_SECRET", 401);
}
