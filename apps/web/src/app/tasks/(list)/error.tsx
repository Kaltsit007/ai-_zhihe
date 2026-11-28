"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";

export default function TasksError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        <Icon name="close" className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-medium text-slate-700">委托列表加载失败</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        可能是网络波动或数据服务暂时不可用，重试一次；还不行就先回总览。
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center rounded-xl bg-[#0f5132] px-4 text-xs font-medium text-white transition hover:bg-[#0b3f27]"
        >
          重新加载
        </button>
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-xl border border-slate-200 px-4 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          回总览
        </Link>
      </div>
    </div>
  );
}
