"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "./icon";
import { lostStatusMeta, lostTypeMeta } from "@/lib/meta";
import type {
  LostFound,
  LostFoundStatus,
  LostFoundType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type TypeFilter = "all" | LostFoundType;
type StatusFilter = "all" | LostFoundStatus;

export function LostFoundBoard({ items }: { items: LostFound[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!keyword) return true;
      return [item.title, item.location, item.description, item.contact]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [items, query, statusFilter, typeFilter]);

  function resetFilters() {
    setQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3 p-4 sm:p-5">
        <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 text-slate-400 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
          <Icon name="search" className="h-4 w-4 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="搜物品名称、地点、特征描述（如：校园卡、博学楼、耳机）"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="清空搜索词"
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <Icon name="close" className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "全部类型" },
            { key: "lost", label: "我丢了" },
            { key: "found", label: "我捡到" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTypeFilter(item.key as TypeFilter)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                typeFilter === item.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {item.label}
            </button>
          ))}

          <span className="hidden h-4 w-px bg-slate-200 sm:inline-block" />

          {[
            { key: "all", label: "全部状态" },
            { key: "open", label: "待处理" },
            { key: "claimed", label: "已认领" },
            { key: "closed", label: "已关闭" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key as StatusFilter)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                statusFilter === item.key
                  ? "bg-[#0f5132] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {item.label}
            </button>
          ))}

          <span className="ml-auto text-xs text-slate-400">
            共 {filtered.length} 条
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => {
          const type = lostTypeMeta[item.type];
          const status = lostStatusMeta[item.status];
          const images = item.images ?? [];
          const coverImage = images[0];

          return (
            <article
              key={item.id}
              className="card flex flex-col overflow-hidden transition hover:border-emerald-900/20 hover:shadow-md"
            >
              {coverImage ? (
                <Link
                  href={`/lost-found/${item.id}`}
                  className="relative block h-40 overflow-hidden bg-slate-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/20" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                    {type.label}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-slate-950/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                    共 {images.length} 张
                  </span>
                </Link>
              ) : (
                <Link
                  href={`/lost-found/${item.id}`}
                  className={cn("block h-28 bg-gradient-to-br", item.color)}
                >
                  <div className="flex h-full items-end justify-between p-4 text-white">
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur">
                      {type.label}
                    </span>
                    <Icon
                      name={item.type === "lost" ? "search" : "check"}
                      className="h-8 w-8 opacity-60"
                    />
                  </div>
                </Link>
              )}

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    <Link
                      href={`/lost-found/${item.id}`}
                      className="transition hover:text-emerald-700"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                      status.className
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Icon name="pin" className="h-3.5 w-3.5 text-slate-400" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="clock" className="h-3.5 w-3.5 text-slate-400" />
                    {item.time}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <span className="truncate text-xs text-slate-600">
                    联系方式：{item.contact}
                  </span>
                  <Link
                    href={`/lost-found/${item.id}`}
                    className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-700">
            没有找到匹配的失物或招领信息
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            可以清空筛选条件，或者直接发布一条新的失物/拾物登记。
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-9 items-center rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              清空筛选
            </button>
            <Link
              href="/lost-found/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0f5132] px-3.5 text-xs font-medium text-white transition hover:bg-[#0b3f27]"
            >
              <Icon name="plus" className="h-3.5 w-3.5" />
              去发布
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
