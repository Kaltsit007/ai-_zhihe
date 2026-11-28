"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import { apiUpdateTaskStatus } from "@/lib/api-client";
import { statusMeta } from "@/lib/meta";
import type { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskActions({
  taskId,
  initialStatus,
  contact,
}: {
  taskId: string;
  initialStatus: TaskStatus;
  contact: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const meta = statusMeta[status];

  async function move(next: TaskStatus, text: string) {
    setPending(true);
    setMessage("正在保存…");
    const result = await apiUpdateTaskStatus(taskId, next);
    setPending(false);

    if (result.error) {
      setMessage("保存失败：" + result.error.message);
      return;
    }
    setStatus(next);
    setMessage(text);
    router.refresh();
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
            meta.className
          )}
        >
          {meta.label}
        </span>
        <span className="text-xs text-slate-400">状态变更会立即保存</span>
      </div>

      <div className="mt-4 space-y-2">
        {status === "pending" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => move("in_progress", "已接单，记得联系发布人。")}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0f5132] text-xs font-medium text-white transition hover:bg-[#0b3f27] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="users" className="h-4 w-4" />
            我要接单
          </button>
        ) : null}

        {status === "in_progress" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => move("completed", "已标记完成，可以归档了。")}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="check" className="h-4 w-4" />
            标记完成
          </button>
        ) : null}

        {status === "completed" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => move("archived", "已归档，列表和地图不再显示。")}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="archive" className="h-4 w-4" />
            立即归档
          </button>
        ) : null}

        {status !== "cancelled" && status !== "archived" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => move("cancelled", "已取消这条委托。")}
            className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 text-xs font-medium text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            取消委托
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setShowContact(!showContact)}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
      >
        <Icon name="message" className="h-4 w-4" />
        {showContact ? contact : "查看联系方式"}
      </button>

      {message ? (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          {message}
        </p>
      ) : null}
    </div>
  );
}
