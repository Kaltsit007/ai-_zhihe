import Link from "next/link";
import { Icon } from "./icon";
import { StatusBadge } from "./status-badge";
import { categoryMeta } from "@/lib/meta";
import type { Task } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

export function TaskCard({ task }: { task: Task }) {
  const category = categoryMeta[task.category];

  return (
    <Link
      href={"/tasks/" + task.id}
      className="card group flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-900/20 hover:shadow-lg hover:shadow-emerald-900/5"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
            category.soft,
            category.text
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", category.dot)} />
          {category.label}
        </span>
        <StatusBadge status={task.status} />
      </div>

      <h3 className="mt-4 line-clamp-2 text-[15px] font-semibold leading-6 text-slate-900 group-hover:text-emerald-800">
        {task.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
        {task.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {task.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-slate-50 px-2 py-1 text-[10px] text-slate-500 ring-1 ring-inset ring-slate-200/70"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Icon name="pin" className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate">{task.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="clock" className="h-3.5 w-3.5 text-slate-400" />
          <span>{task.deadline}</span>
          {task.urgent ? (
            <span className="ml-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">
              急
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700">
            {initials(task.author)}
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-700">{task.author}</p>
            <p className="text-[10px] text-slate-400">{task.createdAt}</p>
          </div>
        </div>
        <Icon
          name="arrow"
          className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
        />
      </div>
    </Link>
  );
}