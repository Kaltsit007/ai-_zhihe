"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import { apiCreateTask } from "@/lib/api-client";
import { categoryMeta } from "@/lib/meta";
import type { Task, TaskCategory } from "@/lib/types";

export function TaskForm() {
  const router = useRouter();
  const [category, setCategory] = useState<TaskCategory>("team");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [contact, setContact] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Task | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setCreated(null);

    const result = await apiCreateTask({
      title,
      description,
      category,
      location,
      deadline: deadline || "长期有效",
      contact,
      urgent,
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
              New task
            </p>
            <h2 className="mt-1 text-lg font-semibold">发布一条委托</h2>
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
              委托已进入列表和地图（演示环境存内存，重启后恢复 seed）。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={"/tasks/" + created.id}
                className="inline-flex h-9 items-center rounded-xl bg-emerald-700 px-3 text-xs font-medium text-white transition hover:bg-emerald-800"
              >
                查看详情
              </Link>
              <Link
                href="/tasks"
                className="inline-flex h-9 items-center rounded-xl border border-emerald-200 bg-white px-3 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                去委托广场
              </Link>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">标题</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="例如：周六早上拼车去高铁站"
            />
          </label>

          <label>
            <span className="text-xs font-medium text-slate-700">分类</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as TaskCategory)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {Object.entries(categoryMeta).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-xs font-medium text-slate-700">地点</span>
            <input
              required
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={100}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="例如：南门 / 图书馆一楼"
            />
          </label>

          <label>
            <span className="text-xs font-medium text-slate-700">截止时间</span>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label>
            <span className="text-xs font-medium text-slate-700">联系方式</span>
            <input
              required
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              maxLength={100}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="微信 / QQ / 手机号"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">详细说明</span>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="写清楚时间、人数、要求和注意事项。"
            />
          </label>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(event) => setUrgent(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-100"
            />
            <span className="text-xs text-slate-600">比较急，帮我标个急</span>
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/tasks"
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
            {pending ? "发布中…" : "发布委托"}
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="map" className="h-4 w-4 text-emerald-700" />
            地图选点
          </div>
          <div className="map-surface mt-3 flex h-48 items-center justify-center rounded-2xl border border-emerald-950/10">
            <div className="rounded-2xl bg-white/80 px-4 py-3 text-center shadow-sm backdrop-blur">
              <Icon name="pin" className="mx-auto h-6 w-6 text-emerald-700" />
              <p className="mt-1 text-xs font-medium text-slate-700">先放在地图中心</p>
              <p className="mt-0.5 text-[10px] text-slate-400">接 Leaflet 后换成真实选点</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="shield" className="h-4 w-4 text-emerald-700" />
            发布前检查
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
            <li>联系方式只给接单同学看，不公开在列表。</li>
            <li>不要填写身份证号、住址等敏感信息。</li>
            <li>图片先压缩，单张建议小于 1 MB。</li>
            <li>过期或完成的委托会进入归档，不会一直挂着。</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
