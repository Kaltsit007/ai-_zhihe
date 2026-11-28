"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "./icon";
import { TaskCard } from "./task-card";
import { categoryMeta, statusMeta } from "@/lib/meta";
import type { Task, TaskCategory, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | TaskCategory;
type StatusFilter = "all" | TaskStatus;

const statusOrder: StatusFilter[] = [
  "all",
  "pending",
  "in_progress",
  "completed",
  "cancelled",
  "archived",
];

export function TaskExplorer({
  tasks,
  initialQuery = "",
}: {
  tasks: Task[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return tasks.filter((task) => {
      if (category !== "all" && task.category !== category) return false;
      if (status === "all" && task.status === "archived") return false;
      if (status !== "all" && task.status !== status) return false;
      if (!keyword) return true;
      const haystack = [
        task.title,
        task.description,
        task.location,
        task.author,
        ...task.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [category, query, status, tasks]);

  const hasFilters = Boolean(query.trim()) || category !== "all" || status !== "all";

  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 text-slate-400 shadow-sm lg:max-w-md">
            <Icon name="search" className="h-4 w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="搜标题、地点、标签、发布人"
            />
          </label>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Icon name="filter" className="h-4 w-4 text-slate-400" />
            共 <span className="font-semibold text-slate-800">{filtered.length}</span> 条
            {query || category !== "all" || status !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setStatus("all");
                }}
                className="ml-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 transition hover:bg-slate-200"
              >
                重置
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              category === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            )}
          >
            全部
          </button>
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key as TaskCategory)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                category === key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
              {meta.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {statusOrder.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                status === item
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              {item === "all" ? "全部状态" : statusMeta[item].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Icon name="search" className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-medium text-slate-700">
            {hasFilters ? "没有找到匹配的委托" : "还没有委托"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {hasFilters
              ? "换个关键词，或清空筛选条件再试。"
              : "发布第一条委托，让同学在地图上看到你。"}
          </p>
          {hasFilters ? null : (
            <Link
              href="/tasks/new"
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0f5132] px-4 text-xs font-medium text-white transition hover:bg-[#0b3f27]"
            >
              <Icon name="plus" className="h-3.5 w-3.5" />
              发布委托
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
