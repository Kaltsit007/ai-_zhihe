import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { resolveTaskCoord, type LatLng } from "@/components/campus-places";
import { TaskActions } from "@/components/task-actions";
import { getTask } from "@/lib/data/tasks";
import {
  formatScheduleLabel,
  isTaskScheduledPending,
} from "@/lib/data/task-scheduler";
import { categoryMeta, statusMeta } from "@/lib/meta";
import type { TaskStatus } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

const getTaskOnce = cache(getTask);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskOnce(id);
  if (!task) notFound();
  return { title: `${task.title} · 互助地图` };
}

const steps: Array<{ key: Exclude<TaskStatus, "cancelled">; label: string; description: string }> = [
  { key: "pending", label: "已发布", description: "等待同学接单" },
  { key: "in_progress", label: "进行中", description: "已有人接单" },
  { key: "completed", label: "已完成", description: "双方确认完成" },
  { key: "archived", label: "已归档", description: "默认从列表隐藏" },
];

const DETAIL_BOUNDS = {
  south: 34.2045,
  north: 34.2248,
  west: 117.1315,
  east: 117.1545,
};

function clampPercent(value: number): number {
  return Math.min(92, Math.max(8, value));
}

/** 兼容 D3 之后才有的可选 lat/lng；旧数据没有这两个字段就回落地名表。 */
function readCoord(input: unknown): LatLng | null {
  if (!input || typeof input !== "object") return null;
  const record = input as { lat?: unknown; lng?: unknown };
  const lat = typeof record.lat === "number" ? record.lat : Number(record.lat);
  const lng = typeof record.lng === "number" ? record.lng : Number(record.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;
  return { lat, lng };
}

function detailPoint(coord: LatLng) {
  return {
    x: clampPercent(
      ((coord.lng - DETAIL_BOUNDS.west) / (DETAIL_BOUNDS.east - DETAIL_BOUNDS.west)) * 100
    ),
    y: clampPercent(
      ((DETAIL_BOUNDS.north - coord.lat) / (DETAIL_BOUNDS.north - DETAIL_BOUNDS.south)) * 100
    ),
  };
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTaskOnce(id);

  if (!task) notFound();

  const category = categoryMeta[task.category];
  const status = statusMeta[task.status];
  const scheduledPending = isTaskScheduledPending(task);
  const storedCoord = readCoord(task);
  const resolved = resolveTaskCoord(task.location);
  const coord = storedCoord ?? resolved.coord;
  const point = detailPoint(coord);
  const coordLabel = storedCoord
    ? `GCJ-02 · ${storedCoord.lat.toFixed(4)}, ${storedCoord.lng.toFixed(4)}`
    : resolved.matched
      ? "按校园地标定位"
      : "校园示意位置";
  const currentIndex =
    task.status === "cancelled" ? -1 : steps.findIndex((step) => step.key === task.status);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-emerald-700"
        >
          <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
          返回委托广场
        </Link>
        <span className="text-xs text-slate-400">委托编号 · {task.id}</span>
      </div>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50/70 to-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                category.soft,
                category.text
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", category.dot)} />
              {category.label}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                status.className
              )}
            >
              {status.label}
            </span>
            {task.urgent ? (
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
                比较急
              </span>
            ) : null}
            {scheduledPending ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                <Icon name="clock" className="h-3 w-3" />
                定时待发布 · 将于 {formatScheduleLabel(task.scheduledAt)} 自动上架
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {task.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {task.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Icon name="pin" className="h-3.5 w-3.5 text-slate-400" />
              {task.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="clock" className="h-3.5 w-3.5 text-slate-400" />
              截止 {task.deadline}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="calendar" className="h-3.5 w-3.5 text-slate-400" />
              发布于 {task.createdAt}
            </span>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-semibold">任务进度</h2>
              {task.status === "cancelled" ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-rose-700">
                    <Icon name="close" className="h-4 w-4" />
                    委托已取消
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-rose-600">
                    这条委托已经终止，不会再进入接单或完成状态。
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {steps.map((step, index) => {
                    const done = index <= currentIndex;
                    return (
                      <div key={step.key} className="relative rounded-xl bg-slate-50 p-3">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                            done ? "bg-emerald-600 text-white" : "bg-white text-slate-400 ring-1 ring-slate-200"
                          )}
                        >
                          {done ? <Icon name="check" className="h-3.5 w-3.5" /> : index + 1}
                        </span>
                        <p className={cn("mt-2 text-xs font-medium", done ? "text-slate-800" : "text-slate-400")}>
                          {step.label}
                        </p>
                        <p className="mt-0.5 text-xs leading-4 text-slate-400">{step.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">位置</h2>
                <span className="truncate text-xs text-slate-400">{coordLabel}</span>
              </div>
              <div className="map-surface relative mt-3 h-56 overflow-hidden rounded-2xl border border-emerald-950/10">
                <div className="absolute left-[8%] top-[12%] h-20 w-28 rounded-2xl border border-white/80 bg-white/60 p-3 text-xs text-slate-500">
                  {task.location}
                </div>
                <div
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: point.x + "%", top: point.y + "%" }}
                >
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white shadow-lg", category.dot)}>
                    <Icon name="pin" className="h-5 w-5" />
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1.5 text-xs text-slate-500 backdrop-blur">
                  {task.location}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold">标签</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-500 ring-1 ring-inset ring-slate-200/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                  {initials(task.author)}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{task.author}</p>
                  <p className="text-xs text-slate-400">发布者</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                联系方式只在详情页展示，不直接进公开列表。
              </p>
            </div>

            <TaskActions taskId={task.id} initialStatus={task.status} contact={task.contact} />
          </aside>
        </div>
      </section>
    </div>
  );
}
