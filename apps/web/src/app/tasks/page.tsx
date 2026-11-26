import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/page-header";
import { TaskExplorer } from "@/components/task-explorer";
import { listScheduledPendingTasks, listTasks } from "@/lib/data/tasks";
import { formatScheduleLabel } from "@/lib/data/task-scheduler";

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "发布",
    description: "选分类、写地点，支持预约定时上架",
    icon: "plus" as const,
  },
  {
    title: "接单",
    description: "地图或列表里找到、联系、完成",
    icon: "users" as const,
  },
  {
    title: "归档",
    description: "完成或过期后自动隐藏",
    icon: "archive" as const,
  },
];

export default async function TasksPage() {
  const [tasks, scheduledTasks] = await Promise.all([
    listTasks(),
    listScheduledPendingTasks(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Campus tasks"
        title="委托广场"
        description="组队、拼车、搬运行李、志愿招募、社团招新。先按分类筛，再去地图上看位置。"
        actions={
          <Link
            href="/tasks/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f5132] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b3f27]"
          >
            <Icon name="plus" className="h-4 w-4" />
            发布委托
          </Link>
        }
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="card flex items-center gap-3 p-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon name={step.icon} className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {index + 1}. {step.title}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {scheduledTasks.length > 0 ? (
        <section className="card mb-4 border-violet-200/80 bg-violet-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-900">
              <Icon name="clock" className="h-4 w-4 text-violet-600" />
              定时待发布队列（{scheduledTasks.length} 条，未到点前不会公开到列表与地图）
            </div>
            <span className="text-xs text-violet-700">到点自动上架</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {scheduledTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs text-slate-700 transition hover:border-violet-300 hover:bg-violet-50/40"
              >
                <span className="font-medium text-slate-900">{task.title}</span>
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                  将于 {formatScheduleLabel(task.scheduledAt)} 上架
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <TaskExplorer tasks={tasks} />
    </div>
  );
}
