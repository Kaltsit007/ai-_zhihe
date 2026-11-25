"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import { apiCreateQuestion } from "@/lib/api-client";
import type { Question } from "@/lib/types";

export function QaForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Question | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setCreated(null);

    const result = await apiCreateQuestion({
      title,
      excerpt,
      tags: tags
        .split(/[,，、]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    setPending(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    setCreated(result.data);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              New question
            </p>
            <h2 className="mt-1 text-lg font-semibold">提一个问题</h2>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-700">
            写入内存演示库
          </span>
        </div>

        {created ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-center gap-2 font-medium">
              <Icon name="check" className="h-4 w-4" />
              发布成功
            </div>
            <p className="mt-1.5 text-xs leading-5 text-emerald-700">
              问题已进入答疑列表（演示环境存内存，重启后恢复 seed）。
            </p>
            <Link
              href="/qa"
              className="mt-3 inline-flex h-9 items-center rounded-xl bg-emerald-700 px-3 text-xs font-medium text-white transition hover:bg-emerald-800"
            >
              去答疑列表
            </Link>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-700">标题</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="例如：补办校园卡需要带什么材料？"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700">详细描述</span>
            <textarea
              required
              rows={7}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              maxLength={2000}
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="写清楚你已经试过什么、卡在哪一步、希望得到什么帮助。"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700">标签</span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="用逗号分隔，例如：校园卡, 生活"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/qa"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0f5132] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b3f27] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="plus" className="h-4 w-4" />
            {pending ? "发布中…" : "发布问题"}
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="search" className="h-4 w-4 text-emerald-700" />
            先搜一下
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            很多问题信息库已经有答案。先搜“补办校园卡”“图书馆开放时间”，没有再来提问。
          </p>
          <Link
            href="/info"
            className="mt-4 flex h-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            去学校信息库
          </Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="shield" className="h-4 w-4 text-emerald-700" />
            提问礼仪
          </div>
          <ul className="mt-3 space-y-2 text-[11px] leading-5 text-slate-500">
            <li>标题写具体问题，不要只写“求助”。</li>
            <li>附上时间、地点、已经试过的方法。</li>
            <li>不要发身份证号、手机号等敏感信息。</li>
            <li>得到答案后，记得标为已解决。</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}