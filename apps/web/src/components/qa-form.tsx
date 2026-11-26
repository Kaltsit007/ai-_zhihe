"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import { apiCreateQuestion } from "@/lib/api-client";
import type { Question } from "@/lib/types";

const SUGGESTED_TAGS = [
  "南湖校区",
  "文昌校区",
  "博学楼",
  "图书馆",
  "校园网",
  "校园卡",
  "校车通勤",
  "快递站",
  "体育打卡",
  "成绩单",
  "矿大Wiki",
];

export function QaForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Question | null>(null);

  function appendSuggestedTag(tag: string) {
    const current = tags
      .split(/[,，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (current.includes(tag) || current.length >= 6) return;
    setTags([...current, tag].join(", "));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setCreated(null);

    const parsedTags = tags
      .split(/[,，、]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 6);

    const result = await apiCreateQuestion({
      title,
      excerpt,
      tags: parsedTags,
      author: author.trim() || undefined,
    });
    setPending(false);

    if (result.error || !result.data) {
      setError(result.error?.message ?? "发布失败，请稍后重试");
      return;
    }

    setCreated(result.data);
    setTitle("");
    setExcerpt("");
    setTags("");
    setAuthor("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]"
    >
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              CUMT Wiki & Q&A
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              发布问题或贡献校园词条
            </h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            徐州矿大专区
          </span>
        </div>

        {created ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-center gap-2 font-medium">
              <Icon name="check" className="h-4 w-4" />
              发布成功：{created.title}
            </div>
            <p className="mt-1.5 text-xs leading-5 text-emerald-700">
              你的问题已进入矿大校园 Wiki 与答疑列表，可以立即前往详情页补充首条经验或等待同学解答。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/qa/${created.id}`}
                className="inline-flex h-9 items-center rounded-xl bg-[#0f5132] px-3.5 text-xs font-medium text-white transition hover:bg-[#0b3f27]"
              >
                查看详情页
              </Link>
              <Link
                href="/qa"
                className="inline-flex h-9 items-center rounded-xl border border-emerald-200 bg-white px-3.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                返回 Wiki 列表
              </Link>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-700">
              标题（必填）
            </span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="例如：南湖校区博学楼晚上几点清楼？"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-700">
              详细说明 / 词条背景（必填）
            </span>
            <textarea
              required
              rows={7}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              maxLength={2000}
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="注明涉及的校区（南湖/文昌）、具体楼宇或已经尝试过的方法，方便同学精准回答。"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-700">
                标签（逗号分隔，最多 6 个）
              </span>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="例如：南湖校区, 校园卡"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate-700">
                你的昵称（选填）
              </span>
              <input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                maxLength={40}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="留空默认显示“矿大同学”"
              />
            </label>
          </div>

          <div>
            <p className="text-xs text-slate-500">点选添加矿大常用标签：</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => appendSuggestedTag(tag)}
                  className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-200/80 transition hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
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
            {pending ? "发布中…" : "发布问题 / 词条"}
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Icon name="search" className="h-4 w-4 text-emerald-700" />
            发帖前先搜一下
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            矿大 Wiki 已整理校车通勤、校园网断网、图书馆研讨间、空教室与快递站等高频词条，先检索能省去等待时间。
          </p>
          <div className="mt-4 space-y-2">
            <Link
              href="/qa"
              className="flex h-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              回到矿大 Wiki 检索
            </Link>
            <Link
              href="/info"
              className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              去官方学校信息库
            </Link>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Icon name="shield" className="h-4 w-4 text-emerald-700" />
            提问与词条规范
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
            <li>标题尽量写清具体校区和问题，不要只写“求助”。</li>
            <li>附上时间、地点和已尝试过的步骤。</li>
            <li>不要发布身份证号、手机号、学号密码等敏感隐私。</li>
            <li>得到准确答案后，可在详情页点击「标为已解决」。</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
