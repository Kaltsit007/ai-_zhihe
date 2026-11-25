import Link from "next/link";
import { CampusMap } from "@/components/campus-map";
import { Icon } from "@/components/icon";
import { StatCard } from "@/components/stat-card";
import { TaskCard } from "@/components/task-card";
import { getStats } from "@/lib/data/stats";
import { listLostFound } from "@/lib/data/lost-found";
import { listTasks } from "@/lib/data/tasks";
import { categoryMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const quickLinks = [
  {
    href: "/tasks",
    label: "委托广场",
    description: "组队、拼车、搬运、志愿",
    icon: "tasks" as const,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    href: "/map",
    label: "地图找活",
    description: "按地点和分类看任务",
    icon: "map" as const,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/qa",
    label: "答疑",
    description: "提问、回答、搜经验",
    icon: "qa" as const,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    href: "/lost-found",
    label: "失物招领",
    description: "丢了、捡到都发这里",
    icon: "lost" as const,
    tone: "bg-rose-50 text-rose-700",
  },
];

export default async function HomePage() {
  const [tasks, stats, lostFound] = await Promise.all([
    listTasks(),
    getStats(),
    listLostFound(),
  ]);
  const latestTasks = tasks.filter((task) => task.status !== "archived").slice(0, 3);
  const openLost = lostFound.filter((item) => item.status === "open");

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              D0 · 框架已搭好，准备接 P0
            </div>
            <h1 className="mt-5 max-w-2xl text-balance text-3xl font-semibold leading-[1.15] tracking-tight text-slate-950 sm:text-5xl">
              把校园里的求助，
              <span className="text-[#0f5132]">放到一张地图上。</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-[15px]">
              委托、组队、拼车、失物和学校信息，不再沉在群聊里。
              发一条委托，地图上就会出现一个点；完成后自动归档，不让旧信息淹没新信息。
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/tasks/new"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0f5132] px-5 text-sm font-medium text-white shadow-sm shadow-emerald-900/20 transition hover:bg-[#0b3f27]"
              >
                <Icon name="plus" className="h-4 w-4" />
                发布一条委托
              </Link>
              <Link
                href="/map"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <Icon name="map" className="h-4 w-4 text-emerald-700" />
                打开地图
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Icon name="users" className="h-3.5 w-3.5" />
                5 人团队
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="calendar" className="h-3.5 w-3.5" />
                6 天冲刺
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="shield" className="h-3.5 w-3.5" />
                P0 已锁定
              </span>
            </div>
          </div>

          <div className="relative rounded-[1.75rem] bg-[#0f5132] p-5 text-white shadow-xl shadow-emerald-950/20 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                  P0 progress
                </p>
                <p className="mt-1 text-lg font-semibold">先把闭环跑通</p>
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-emerald-100">
                4 / 7
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { label: "前端骨架", value: 100 },
                { label: "委托闭环", value: 55 },
                { label: "答疑和学校信息", value: 30 },
                { label: "失物招领和机器人", value: 20 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-50/90">{item.label}</span>
                    <span className="text-emerald-200/70">{item.value}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-300"
                      style={{ width: item.value + "%" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-white/10 p-3.5 text-[11px] leading-5 text-emerald-50/90">
              <span className="font-medium text-white">D3 中午硬节点：</span>
              委托、答疑、学校信息、失物招领都能演示；真爬虫和群机器人先跑最小实现。
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="进行中的委托"
          value={String(stats.activeTasks)}
          note="待接单 + 进行中，地图上实时展示"
          icon="tasks"
          tone="amber"
        />
        <StatCard
          label="已完成的互助"
          value={String(stats.solvedTasks)}
          note="完成后自动归档，默认不打扰列表"
          icon="check"
          tone="emerald"
        />
        <StatCard
          label="学校信息条目"
          value={String(stats.infoCount)}
          note="办事流程、场馆、奖助、就业"
          icon="info"
          tone="sky"
        />
        <StatCard
          label="待认领失物"
          value={String(stats.lostOpen)}
          note="每天 20:00 机器人汇总到测试群"
          icon="lost"
          tone="rose"
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
        <section className="card p-4 sm:p-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Campus map
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">校园互助地图</h2>
              <p className="mt-1 text-xs text-slate-400">
                点位是演示数据，下一步接 Leaflet 和真实坐标。
              </p>
            </div>
            <Link
              href="/map"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              查看全部
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>
          <CampusMap tasks={tasks} heightClass="h-[400px] sm:h-[440px]" />
        </section>

        <aside className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">今日速览</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700">
                {latestTasks.length} 条新委托
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {latestTasks.map((task) => (
                <Link
                  key={task.id}
                  href={"/tasks/" + task.id}
                  className="group flex items-start gap-3 rounded-xl p-2 transition hover:bg-emerald-50/60"
                >
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      categoryMeta[task.category].dot
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium text-slate-700 group-hover:text-emerald-800">
                      {task.title}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-slate-400">
                      {task.location} · {task.deadline}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/tasks"
              className="mt-4 flex items-center justify-center rounded-xl border border-slate-200 py-2.5 text-[11px] font-medium text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              去委托广场
            </Link>
          </section>

          <section className="card overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-50 to-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="info" className="h-4 w-4 text-emerald-700" />
                学校信息库
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                办事流程、开放时间、奖助材料，先搜一下再问人。
              </p>
              <Link
                href="/info"
                className="mt-4 flex h-10 items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 text-xs text-slate-400 shadow-sm transition hover:border-emerald-200"
              >
                <Icon name="search" className="h-4 w-4" />
                搜“补办校园卡”
                <Icon name="arrow" className="ml-auto h-3.5 w-3.5 text-emerald-600" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5 px-5 pb-5">
              {["教务", "生活", "场馆", "奖助", "就业"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="bot" className="h-4 w-4 text-emerald-700" />
                失物招领
              </div>
              <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] text-rose-600">
                {openLost.length} 条待认领
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {openLost.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-[11px]">
                  <span className={cn("h-1.5 w-1.5 rounded-full", item.type === "lost" ? "bg-rose-500" : "bg-emerald-500")} />
                  <span className="truncate text-slate-600">{item.title}</span>
                  <span className="ml-auto shrink-0 text-slate-400">{item.location}</span>
                </div>
              ))}
            </div>
            <Link
              href="/lost-found"
              className="mt-4 flex items-center justify-center rounded-xl bg-slate-900 py-2.5 text-[11px] font-medium text-white transition hover:bg-slate-800"
            >
              查看失物招领
            </Link>
          </section>
        </aside>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Categories
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">你想发什么？</h2>
          </div>
          <Link href="/tasks" className="text-xs font-medium text-emerald-700">
            全部委托
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card group p-4 transition hover:-translate-y-0.5 hover:border-emerald-900/15"
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", item.tone)}>
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-800 group-hover:text-emerald-800">
                {item.label}
              </p>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Latest
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">最新委托</h2>
          </div>
          <Link href="/tasks" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            查看更多
            <Icon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {latestTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </section>

      <section className="card flex flex-col items-start justify-between gap-4 overflow-hidden bg-gradient-to-r from-emerald-50/80 to-white p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0f5132] text-white">
            <Icon name="spark" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">先跑通一条委托，再谈其他。</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              发布 → 地图出现 → 接单 → 完成 → 归档。这条闭环跑通，P0 就立住了。
            </p>
          </div>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#0f5132] px-4 text-xs font-medium text-white transition hover:bg-[#0b3f27]"
        >
          <Icon name="plus" className="h-4 w-4" />
          去发布
        </Link>
      </section>
    </div>
  );
}
