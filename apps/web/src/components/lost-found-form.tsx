"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import { apiCreateLostFound } from "@/lib/api-client";
import type { LostFound, LostFoundType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LostFoundForm() {
  const router = useRouter();
  const [type, setType] = useState<LostFoundType>("lost");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<LostFound | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setCreated(null);

    const result = await apiCreateLostFound({
      type,
      title,
      location,
      time: time || "刚刚",
      description,
      contact,
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
              Lost & found
            </p>
            <h2 className="mt-1 text-lg font-semibold">提交失物 / 拾物</h2>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-700">
            写入内存演示库
          </span>
        </div>

        {created ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-center gap-2 font-medium">
              <Icon name="check" className="h-4 w-4" />
              提交成功
            </div>
            <p className="mt-1.5 text-xs leading-5 text-emerald-700">
              已进入失物招领列表，并会进入 20:00 的机器人汇总（演示环境存内存，重启后恢复 seed）。
            </p>
            <Link
              href="/lost-found"
              className="mt-3 inline-flex h-9 items-center rounded-xl bg-emerald-700 px-3 text-xs font-medium text-white transition hover:bg-emerald-800"
            >
              去失物招领
            </Link>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            { key: "lost", label: "我丢了", icon: "search" as const },
            { key: "found", label: "我捡到", icon: "check" as const },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setType(item.key as LostFoundType)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition",
                type === item.key
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">物品名称</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="例如：黑色耳机盒 / 校园卡"
            />
          </label>

          <label>
            <span className="text-xs font-medium text-slate-700">地点</span>
            <input
              required
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={100}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="例如：图书馆二楼"
            />
          </label>

          <label>
            <span className="text-xs font-medium text-slate-700">时间</span>
            <input
              type="datetime-local"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">描述</span>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="写清楚颜色、特征、有没有贴纸，但不要公开全部隐私。"
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
              placeholder="微信 / QQ"
            />
          </label>

          <label>
            <span className="text-xs font-medium text-slate-700">照片</span>
            <div className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-400">
              <Icon name="plus" className="h-4 w-4" />
              上传图片（待接 Storage）
            </div>
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/lost-found"
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
            {pending ? "提交中…" : "提交"}
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="bot" className="h-4 w-4 text-emerald-700" />
            会进入机器人汇总
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            每天 20:00，机器人会把当天新增和未解决条目发到测试群。已认领/已关闭的不会重复打扰。
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="shield" className="h-4 w-4 text-emerald-700" />
            隐私提醒
          </div>
          <ul className="mt-3 space-y-2 text-[11px] leading-5 text-slate-500">
            <li>联系方式只在详情里展示，不直接进公开群。</li>
            <li>校园卡只写姓氏，认领时核对信息。</li>
            <li>图片先压缩，敏感信息打码。</li>
            <li>已解决就改成已认领/已关闭。</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
