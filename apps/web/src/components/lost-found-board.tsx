"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icon";
import { lostStatusMeta, lostTypeMeta } from "@/lib/meta";
import type { LostFound, LostFoundType } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | LostFoundType;

export function LostFoundBoard({ items }: { items: LostFound[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.type === filter);
  }, [filter, items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: "全部" },
          { key: "lost", label: "我丢了" },
          { key: "found", label: "我捡到" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key as Filter)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium transition",
              filter === item.key
                ? "bg-slate-900 text-white"
                : "bg-white/70 text-slate-500 ring-1 ring-inset ring-slate-200/70 hover:bg-white"
            )}
          >
            {item.label}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-slate-400">
          共 {filtered.length} 条
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => {
          const type = lostTypeMeta[item.type];
          const status = lostStatusMeta[item.status];
          return (
            <article key={item.id} className="card overflow-hidden">
              <div className={cn("h-24 bg-gradient-to-br", item.color)}>
                <div className="flex h-full items-end justify-between p-4 text-white">
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
                    {type.label}
                  </span>
                  <Icon name={item.type === "lost" ? "search" : "check"} className="h-8 w-8 opacity-60" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ring-1 ring-inset",
                      status.className
                    )}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Icon name="pin" className="h-3.5 w-3.5" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    {item.time}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[11px] text-slate-400">联系方式：{item.contact}</span>
                  <button
                    type="button"
                    className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
