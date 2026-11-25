"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "./icon";
import { apiRunInternal } from "@/lib/api-client";

type ActionKey = "archive" | "crawl" | "digest";

const actions: Array<{
  key: ActionKey;
  title: string;
  description: string;
  icon: IconName;
  label: string;
  tone: string;
}> = [
  {
    key: "archive",
    title: "自动归档",
    description: "扫描已完成委托，写入 archived 状态，默认列表和地图隐藏。",
    icon: "archive",
    label: "立即归档",
    tone: "bg-amber-50 text-amber-700",
  },
  {
    key: "crawl",
    title: "学校信息爬虫",
    description: "抓取 1 个公开数据源（演示实现），按来源去重后写入信息库。",
    icon: "bot",
    label: "运行爬虫",
    tone: "bg-sky-50 text-sky-700",
  },
  {
    key: "digest",
    title: "失物招领汇总",
    description: "生成今日汇总；配置 BOT_WEBHOOK_URL 后真实发送到测试群。",
    icon: "message",
    label: "发送汇总",
    tone: "bg-emerald-50 text-emerald-700",
  },
];

export function AdminActions() {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<ActionKey | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [digestText, setDigestText] = useState<string | null>(null);

  async function run(key: ActionKey) {
    setPendingKey(key);
    setMessage(null);
    setDigestText(null);

    const result = await apiRunInternal(key);
    setPendingKey(null);

    if (result.error) {
      setMessage("执行失败：" + result.error.message);
      return;
    }
    setMessage(result.data ? result.data.message : "已完成");
    if (key === "digest") {
      setDigestText(result.data?.text ?? null);
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          {message}
        </div>
      ) : null}

      {digestText ? (
        <pre className="card overflow-x-auto whitespace-pre-wrap p-4 text-[11px] leading-5 text-slate-600">
{digestText}
        </pre>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <article key={action.key} className="card p-5">
            <span className={"flex h-10 w-10 items-center justify-center rounded-2xl " + action.tone}>
              <Icon name={action.icon} className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold">{action.title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{action.description}</p>
            <button
              type="button"
              disabled={pendingKey !== null}
              onClick={() => run(action.key)}
              className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 text-xs font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingKey === action.key ? "执行中…" : action.label}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}