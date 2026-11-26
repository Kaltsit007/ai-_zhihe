"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import { apiCreateTask } from "@/lib/api-client";
import { formatScheduleLabel } from "@/lib/data/task-scheduler";
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
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Task | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreated(null);

    if (enableSchedule) {
      if (!scheduledAt) {
        setError("已开启定时发布，请选择预计自动上架时间");
        return;
      }
      if (deadline && new Date(scheduledAt).getTime() > new Date(deadline).getTime()) {
        setError("预约上架时间不能晚于委托截止时间");
        return;
      }
    }

    setPending(true);
    const result = await apiCreateTask({
      title,
      description,
      category,
      location,
      deadline: deadline || "长期有效",
      contact,
      urgent,
      scheduledAt: enableSchedule ? scheduledAt : undefined,
    });

    setPending(false);
    if (result.error || !result.data) {
      setError(result.error?.message ?? "发布失败，请稍后重试");
      return;
    }

    setCreated(result.data);
    setTitle("");
    setDescription("");
    setLocation("");
    setDeadline("");
    setContact("");
    setUrgent(false);
    setEnableSchedule(false);
    setScheduledAt("");
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
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            支持预约定时上架
          </span>
        </div>

        {created ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-center gap-2 font-medium">
              <Icon name="check" className="h-4 w-4" />
              {created.scheduledAt ? "定时委托已预约成功" : "发布成功"}
            </div>
            <p className="mt-1.5 text-xs leading-5 text-emerald-700">
              {created.scheduledAt
                ? `已进入待生效定时队列，将于 ${formatScheduleLabel(created.scheduledAt)} 自动上架到委托广场与校园地图。`
                : "委托已上架至委托广场与校园地图，同学现在即可查看并接单。"}
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

          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={enableSchedule}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setEnableSchedule(checked);
                  if (!checked) setScheduledAt("");
                }}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-100"
              />
              <span className="text-xs font-semibold text-slate-800">
                开启定时发布（可选）
              </span>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                到点自动上架
              </span>
            </label>

            {enableSchedule ? (
              <div className="space-y-2 pt-1">
                <label className="block">
                  <span className="text-xs font-medium text-slate-700">
                    预约上架时间
                  </span>
                  <input
                    type="datetime-local"
                    required={enableSchedule}
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:max-w-xs"
                  />
                </label>
                <p className="text-xs leading-5 text-slate-500">
                  委托将在指定时间自动上架到委托广场与地图，未到点前不会在公开列表中暴露。
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                适合提前预约明早拼车、宿舍搬运或次日组队，到点自动对外公开。
              </p>
            )}
          </div>

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
            {pending
              ? "提交中…"
              : enableSchedule
              ? "预约定时发布"
              : "发布委托"}
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="map" className="h-4 w-4 text-emerald-700" />
            地图定位说明
          </div>
          <div className="map-surface mt-3 flex h-48 items-center justify-center rounded-2xl border border-emerald-950/10">
            <div className="rounded-2xl bg-white/85 px-4 py-3 text-center shadow-sm backdrop-blur">
              <Icon name="pin" className="mx-auto h-6 w-6 text-emerald-700" />
              <p className="mt-1 text-xs font-medium text-slate-700">按校内地标自动落点</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                填写图书馆、博学楼、南门、竹园等会自动匹配矿大地图点位
              </p>
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
            <li>开启定时发布后，未到预约时间不会出现在广场和地图中。</li>
            <li>已完成或超过截止时间未接单的委托会自动进入归档，不会一直挂着。</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
