import Link from "next/link";

import { CampusMap } from "@/components/campus-map";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/page-header";
import { listTasks } from "@/lib/data/tasks";
import { categoryMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** 只有还能接单 / 正在进行的委托才值得出现在地图上。 */
function isMapVisible(status: string): boolean {
  return status === "pending" || status === "in_progress";
}

const mapFacts = [
  { label: "底图", value: "高德栅格瓦片" },
  { label: "坐标系", value: "GCJ-02（与底图同口径）" },
  { label: "点位口径", value: "待接单 + 进行中" },
  { label: "点击行为", value: "打开委托详情" },
];

export default async function MapPage() {
  const tasks = await listTasks();
  const active = tasks.filter((task) => isMapVisible(task.status));
  const counts = Object.entries(categoryMeta).map(([key, meta]) => ({
    key,
    ...meta,
    count: active.filter((task) => task.category === key).length,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Campus map"
        title="地图可视化"
        description="真实校区底图，点位对应还能接的委托。已完成、已取消和归档的不上图。"
        actions={
          <Link
            href="/tasks/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f5132] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b3f27]"
          >
            <Icon name="plus" className="h-4 w-4" />
            发布到地图
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.55fr_0.65fr]">
        <section className="card p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Live map
              </p>
              <h2 className="mt-1 text-lg font-semibold">校园互助点位</h2>
              <p className="mt-1 text-[11px] text-slate-500">
                共 {tasks.length} 条委托，{active.length} 条可显示在地图上。
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {active.length} 个可接点位
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                已完成 / 已取消不上图
              </span>
            </div>
          </div>
          <CampusMap tasks={active} heightClass="h-[560px]" />
        </section>

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="text-sm font-semibold">点位统计</h2>
            <div className="mt-4 space-y-3">
              {counts.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", item.dot)} />
                  <span className="text-xs text-slate-600">{item.label}</span>
                  <span className="ml-auto text-xs font-semibold text-slate-800">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="map" className="h-4 w-4 text-emerald-700" />
              地图信息
            </div>
            <ul className="mt-3 space-y-2.5">
              {mapFacts.map((fact) => (
                <li key={fact.label} className="flex items-baseline justify-between gap-3">
                  <span className="shrink-0 text-[11px] text-slate-400">{fact.label}</span>
                  <span className="text-right text-[11px] font-medium text-slate-600">
                    {fact.value}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card bg-gradient-to-br from-emerald-50 to-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="shield" className="h-4 w-4 text-emerald-700" />
              坐标口径
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              高德瓦片用 GCJ-02，OSM 用 WGS84。现在点位和底图都走 GCJ-02，不会整体偏移。
              D3 做发布页选点时沿用同一口径，不要混用。
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
