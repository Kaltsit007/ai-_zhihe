import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/page-header";
import { TaskExplorer } from "@/components/task-explorer";
import { listTasks } from "@/lib/data/tasks";

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "发布",
    description: "选分类、写地点、留联系方式",
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
  const tasks = await listTasks();

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
              <p className="mt-0.5 text-[10px] text-slate-400">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <TaskExplorer tasks={tasks} />
    </div>
  );
}
