import Link from "next/link";
import { CampusMap } from "@/components/campus-map";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/page-header";
import { listTasks } from "@/lib/data/tasks";
import { categoryMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const nextSteps = [
  "接 Leaflet，替换演示底图",
  "统一 GCJ-02 / WGS84 坐标",
  "点位按分类和状态筛选",
  "点击点位打开任务详情",
];

export default async function MapPage() {
  const tasks = await listTasks();
  const active = tasks.filter((task) => task.status !== "archived");
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
        description="先看清楚“哪里有人需要帮忙”。当前是演示地图，下一步接 Leaflet 和真实坐标。"
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
                Live demo
              </p>
              <h2 className="mt-1 text-lg font-semibold">校园互助点位</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {active.length} 个活跃点
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                已归档默认隐藏
              </span>
            </div>
          </div>
          <CampusMap tasks={active} heightClass="h-[560px]" limit={8} />
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
              地图接入计划
            </div>
            <ul className="mt-3 space-y-2.5">
              {nextSteps.map((step, index) => (
                <li key={step} className="flex gap-2 text-[11px] leading-5 text-slate-500">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </section>

          <section className="card bg-gradient-to-br from-emerald-50 to-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="shield" className="h-4 w-4 text-emerald-700" />
              坐标提醒
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              高德瓦片用 GCJ-02，OSM 用 WGS84。seed 数据和用户选点必须统一一种，否则点位会整体偏移。
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
