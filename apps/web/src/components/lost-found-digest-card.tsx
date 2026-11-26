"use client";

import { useState } from "react";
import { Icon } from "./icon";
import { apiRunInternal } from "@/lib/api-client";
import type { InternalResult } from "@/lib/api-client";
import type { LostFoundStats } from "@/lib/data/lost-found";

export function LostFoundDigestCard({ stats }: { stats: LostFoundStats }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<InternalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTestDigest() {
    setPending(true);
    setError(null);
    const res = await apiRunInternal("digest");
    setPending(false);

    if (res.error || !res.data) {
      setError(res.error?.message ?? "触发汇总失败，请稍后重试");
      return;
    }
    setResult(res.data);
  }

  return (
    <section className="card overflow-hidden">
      <div className="bg-[#0f5132] p-5 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="bot" className="h-4 w-4" />
          机器人每日汇总
        </div>
        <p className="mt-2 text-xs leading-5 text-emerald-50/85">
          每天 20:00 自动汇总未解决失物到测试群，已认领与已关闭条目自动排除。
        </p>
      </div>

      <div className="space-y-3 p-5">
        {[
          { label: "今日新增", value: `${stats.addedToday} 条` },
          { label: "待处理（未解决）", value: `${stats.openCount} 条` },
          { label: "已认领", value: `${stats.claimedCount} 条` },
          { label: "下次自动发送", value: "20:00" },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-slate-500">{row.label}</span>
            <span className="font-semibold text-slate-800">{row.value}</span>
          </div>
        ))}

        <button
          type="button"
          disabled={pending}
          onClick={handleTestDigest}
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="message" className="h-4 w-4" />
          {pending ? "生成汇总中…" : "立即生成汇总测试"}
        </button>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
            <p className="font-medium">
              {result.message}（未解决 {result.openCount ?? stats.openCount} 条）
            </p>
            {result.text ? (
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-white/90 p-2.5 font-sans text-xs leading-5 text-slate-700 ring-1 ring-emerald-100">
                {result.text}
              </pre>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
