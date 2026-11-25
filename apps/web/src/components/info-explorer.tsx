"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icon";
import { infoCategoryMeta } from "@/lib/meta";
import type { InfoCategory, SchoolInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryFilter = "全部" | InfoCategory;

const categories: CategoryFilter[] = [
  "全部",
  "教务",
  "生活",
  "场馆",
  "奖助",
  "就业",
  "其他",
];

export function InfoExplorer({ items }: { items: SchoolInfo[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("全部");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "全部" && item.category !== category) return false;
      if (!keyword) return true;
      return [item.title, item.summary, item.category, item.source]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [category, query, items]);

  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5">
        <label className="flex h-12 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 text-slate-400 shadow-sm">
          <Icon name="search" className="h-5 w-5" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="搜办事流程、开放时间、申请材料"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-medium transition",
                category === item
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((item) => {
          const meta = infoCategoryMeta[item.category];
          return (
            <article
              key={item.id}
              className="card group flex flex-col gap-3 p-5 transition hover:border-emerald-900/15 sm:flex-row sm:items-start"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon name="info" className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 ring-inset",
                      meta.className
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    更新于 {item.updatedAt}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-emerald-800">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.summary}
                </p>
                <p className="mt-2 text-[10px] text-slate-400">
                  来源：{item.source}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-emerald-700">
                查看
                <Icon name="chevron" className="h-3.5 w-3.5" />
              </span>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-16 text-center text-sm text-slate-500">
          没有找到相关信息，换个关键词试试。
        </div>
      ) : null}
    </div>
  );
}
