"use client";

import dynamic from "next/dynamic";

import { categoryMeta } from "@/lib/meta";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

// Leaflet 要碰 window，只能在浏览器里跑，所以这里关掉服务端渲染。
const MapCanvas = dynamic(
  () => import("./map-canvas").then((module) => module.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 animate-pulse bg-[#e7efe4]">
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] text-slate-500">
          地图加载中…
        </span>
      </div>
    ),
  }
);

export function CampusMap({
  tasks,
  heightClass = "h-[420px]",
  limit,
  showLegend = true,
}: {
  tasks: Task[];
  heightClass?: string;
  limit?: number;
  showLegend?: boolean;
}) {
  const pins = typeof limit === "number" ? tasks.slice(0, limit) : tasks;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-emerald-950/10 bg-[#e7efe4]",
        heightClass
      )}
    >
      <MapCanvas tasks={pins} className="leaflet-map absolute inset-0 z-0" />

      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[10px] font-medium text-slate-500 shadow-sm backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        南湖校区 · 真实底图
      </div>

      <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[10px] text-slate-500 shadow-sm backdrop-blur">
        点开点位看详情
      </div>

      {pins.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="rounded-2xl border border-white/70 bg-white/85 px-5 py-4 text-center shadow-sm backdrop-blur">
            <p className="text-sm font-medium text-slate-700">当前没有可显示的委托</p>
            <p className="mt-1 text-[11px] text-slate-500">
              待接单和进行中的委托才会出现在地图上
            </p>
          </div>
        </div>
      ) : null}

      {showLegend ? (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex max-w-[80%] flex-wrap gap-1.5 rounded-2xl border border-white/70 bg-white/85 p-2 shadow-sm backdrop-blur">
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] text-slate-600"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
              {meta.short}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
