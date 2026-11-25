import { fail, ok, requireCronSecret } from "@/lib/api/respond";
import { buildLostFoundDigest } from "@/lib/data/lost-found";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  const digest = await buildLostFoundDigest();
  const webhook = process.env.BOT_WEBHOOK_URL;

  // 演示模式：没配 webhook 就返回生成的文本，方便演示“机器人会发什么”。
  // C 接真实群时，按平台调整消息体（企业微信/钉钉格式不同）。
  if (!webhook) {
    return ok({
      sent: false,
      message: "未配置 BOT_WEBHOOK_URL，已生成汇总文本（演示模式）",
      text: digest.text,
      openCount: digest.open.length,
    });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msgtype: "text", text: { content: digest.text } }),
    });
    if (!res.ok) {
      return fail("BOT_FAILED", "webhook 返回 " + res.status, 502);
    }
    return ok({
      sent: true,
      message: "汇总已发送到测试群",
      openCount: digest.open.length,
    });
  } catch {
    return fail("BOT_FAILED", "无法连接 webhook", 502);
  }
}
