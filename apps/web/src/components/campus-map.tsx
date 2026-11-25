import Link from "next/link";
import { Icon } from "./icon";
import { categoryMeta } from "@/lib/meta";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

const buildings = [
  { label: "图书馆", className: "left-[6%] top-[8%] h-[21%] w-[24%]" },
  { label: "一食堂", className: "left-[36%] top-[24%] h-[14%] w-[16%]" },
  { label: "二食堂", className: "left-[56%] top-[34%] h-[12%] w-[14%]" },
  { label: "博学楼", className: "left-[14%] top-[60%] h-[22%] w-[22%]" },
  { label: "竹园宿舍", className: "left-[42%] top-[54%] h-[25%] w-[20%]" },
  { label: "体育馆", className: "right-[7%] top-[48%] h-[26%] w-[22%]" },
];

export function CampusMap({
  tasks,
  heightClass = "h-[420px]",
  limit = 8,
  showLegend = true,
}: {
  tasks: Task[];
  heightClass?: string;
  limit?: number;
  showLegend?: boolean;
}) {
  const pins = tasks
    .filter((task) => task.status !== "archived")
    .slice(0, limit);

  return (
    <div
      className={cn(
        "map-surface relative overflow-hidden rounded-[1.75rem] border border-emerald-950/10",
        heightClass
      )}
    >
      <div className="absolute inset-x-0 top-[47%] h-3 bg-white/55" />
      <div className="absolute inset-y-0 left-[39%] w-3 bg-white/45" />
      <div className="absolute inset-y-0 right-[31%] w-2 bg-white/35" />
      <div className="absolute bottom-[12%] left-0 right-0 h-2 rotate-[-6deg] bg-white/40" />

      <div className="absolute right-[6%] top-[9%] h-[25%] w-[26%] rounded-[2rem] bg-emerald-100/70 ring-1 ring-emerald-700/10">
        <span className="absolute bottom-3 left-4 text-[11px] font-medium text-emerald-800/70">
          中心绿地
        </span>
      </div>

      {buildings.map((building) => (
        <div
          key={building.label}
          className={cn(
            "absolute rounded-2xl border border-white/80 bg-white/55 p-3 shadow-sm backdrop-blur-[2px]",
            building.className
          )}
        >
          <span className="text-[11px] font-medium text-slate-500">
            {building.label}
          </span>
        </div>
      ))}

      {pins.map((task) => {
        const category = categoryMeta[task.category];
        return (
          <Link
            key={task.id}
            href={"/tasks/" + task.id}
            className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: task.pin.x + "%", top: task.pin.y + "%" }}
            aria-label={task.title}
          >
            <span
              className={cn(
                "absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full opacity-20",
                category.dot
              )}
            />
            <span
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-white shadow-lg shadow-slate-900/20 transition group-hover:scale-110",
                category.dot
              )}
            >
              <Icon name="pin" className="h-4 w-4" />
            </span>
            <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-max max-w-[180px] -translate-x-1/2 rounded-xl bg-slate-900/90 px-3 py-2 text-[11px] leading-4 text-white shadow-xl group-hover:block">
              <span className="block font-medium">{task.title}</span>
              <span className="mt-0.5 block text-slate-300">{task.location}</span>
            </span>
          </Link>
        );
      })}

      <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[10px] font-medium text-slate-500 shadow-sm backdrop-blur">
        演示地图 · 待接 Leaflet
      </div>

      {showLegend ? (
        <div className="absolute bottom-4 left-4 flex max-w-[80%] flex-wrap gap-1.5 rounded-2xl border border-white/70 bg-white/80 p-2 shadow-sm backdrop-blur">
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
