"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import { apiUpdateLostFoundStatus } from "@/lib/api-client";
import { lostStatusMeta, lostTypeMeta } from "@/lib/meta";
import type { LostFound, LostFoundStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_MESSAGES: Record<LostFoundStatus, string> = {
  open: "条目已重新打开，已重新计入待处理列表与每日汇总。",
  claimed: "已标记为「已认领」，该条目将自动移出每日未解决失物汇总。",
  closed: "已标记为「已关闭」，该条目将自动移出每日未解决失物汇总。",
};

export function LostFoundDetail({ initialItem }: { initialItem: LostFound }) {
  const router = useRouter();
  const [item, setItem] = useState<LostFound>(initialItem);
  const [pendingStatus, setPendingStatus] = useState<LostFoundStatus | null>(
    null
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const type = lostTypeMeta[item.type];
  const status = lostStatusMeta[item.status];

  async function handleUpdateStatus(nextStatus: LostFoundStatus) {
    setPendingStatus(nextStatus);
    setFeedback(null);
    setError(null);

    const res = await apiUpdateLostFoundStatus(item.id, nextStatus);
    setPendingStatus(null);

    if (res.error || !res.data) {
      setError(res.error?.message ?? "更新状态失败，请稍后再试");
      return;
    }

    setItem(res.data);
    setFeedback(STATUS_MESSAGES[nextStatus]);
    router.refresh();
  }

  async function handleCopyContact() {
    try {
      await navigator.clipboard.writeText(item.contact);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/lost-found"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-emerald-700"
        >
          <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
          返回失物招领列表
        </Link>
        <span className="text-xs text-slate-400">编号 · {item.id}</span>
      </div>

      <section className="card overflow-hidden">
        <div className={cn("h-40 bg-gradient-to-br sm:h-48", item.color)}>
          <div className="flex h-full flex-col justify-between p-5 text-white sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                {type.label}
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                {item.title}
              </h1>
              <Icon
                name={item.type === "lost" ? "search" : "check"}
                className="hidden h-10 w-10 shrink-0 opacity-60 sm:block"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.4fr_0.65fr]">
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon name="pin" className="h-3.5 w-3.5 text-emerald-700" />
                  {item.type === "lost" ? "丢失地点" : "拾得地点"}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-slate-900">
                  {item.location}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon name="clock" className="h-3.5 w-3.5 text-emerald-700" />
                  {item.type === "lost" ? "丢失时间" : "拾得时间"}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-slate-900">
                  {item.time}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">物品特征与详细说明</h2>
              <p className="mt-2.5 whitespace-pre-line text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-emerald-800">
                    站内联系方式（请核对物品特征后再交接）
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {item.contact}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyContact}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                >
                  <Icon name="check" className="h-3.5 w-3.5" />
                  {copied ? "已复制联系方式" : "复制联系方式"}
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">认领与状态操作</h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                普通登录同学在核对物品并完成认领后，可直接点击下方按钮更新状态，避免继续打扰发布者。
              </p>

              {feedback ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs leading-5 text-emerald-800">
                  {feedback}
                </div>
              ) : null}

              {error ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs leading-5 text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-4 space-y-2.5">
                {item.status === "open" ? (
                  <>
                    <button
                      type="button"
                      disabled={pendingStatus !== null}
                      onClick={() => handleUpdateStatus("claimed")}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0f5132] text-sm font-medium text-white shadow-sm transition hover:bg-[#0b3f27] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Icon name="check" className="h-4 w-4" />
                      {pendingStatus === "claimed"
                        ? "提交中…"
                        : "我已认领 / 标为已认领"}
                    </button>
                    <button
                      type="button"
                      disabled={pendingStatus !== null}
                      onClick={() => handleUpdateStatus("closed")}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Icon name="archive" className="h-4 w-4" />
                      {pendingStatus === "closed" ? "关闭中…" : "关闭发布"}
                    </button>
                  </>
                ) : (
                  <>
                    {item.status === "claimed" ? (
                      <button
                        type="button"
                        disabled={pendingStatus !== null}
                        onClick={() => handleUpdateStatus("closed")}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Icon name="archive" className="h-4 w-4" />
                        {pendingStatus === "closed" ? "关闭中…" : "归档关闭条目"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={pendingStatus !== null}
                      onClick={() => handleUpdateStatus("open")}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Icon name="clock" className="h-4 w-4" />
                      {pendingStatus === "open"
                        ? "恢复中…"
                        : "误操作？重新打开条目"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 to-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Icon name="shield" className="h-4 w-4 text-rose-600" />
                核对与安全提示
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-slate-600">
                <li>交接贵重物品或证件时，建议在宿舍楼下、教学楼大厅等公共区域当面核对。</li>
                <li>群机器人每日汇总不公开联系方式，仅展示标题与地点引导到站内核对。</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
