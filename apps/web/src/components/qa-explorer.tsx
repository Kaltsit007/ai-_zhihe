"use client";

import { useMemo, useState } from "react";
import { Icon } from "./icon";
import type { Question } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

type Filter = "all" | "open" | "solved";

export function QaExplorer({ questions }: { questions: Question[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return questions.filter((question) => {
      if (filter !== "all" && question.status !== filter) return false;
      if (!keyword) return true;
      return [question.title, question.excerpt, ...question.tags]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [filter, query, questions]);

  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 text-slate-400 shadow-sm">
          <Icon name="search" className="h-4 w-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="搜问题、标签、关键词"
          />
        </label>
        <div className="mt-3 flex gap-1.5">
          {[
            { key: "all", label: "全部" },
            { key: "open", label: "待解答" },
            { key: "solved", label: "已解决" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key as Filter)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-medium transition",
                filter === item.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((question) => (
          <article key={question.id} className="card p-5 transition hover:border-emerald-900/15">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 ring-inset",
                  question.status === "solved"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-amber-50 text-amber-700 ring-amber-200"
                )}
              >
                {question.status === "solved" ? "已解决" : "待解答"}
              </span>
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-500"
                >
                  {tag}
                </span>
              ))}
              <span className="ml-auto text-[10px] text-slate-400">{question.time}</span>
            </div>
            <h3 className="mt-3 text-[15px] font-semibold text-slate-900">
              {question.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
              {question.excerpt}
            </p>
            <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700">
                  {initials(question.author)}
                </span>
                {question.author}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="message" className="h-3.5 w-3.5" />
                {question.answers} 个回答
              </span>
              <span>{question.views} 次浏览</span>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-16 text-center text-sm text-slate-500">
          没有找到匹配的问题。
        </div>
      ) : null}
    </div>
  );
}
