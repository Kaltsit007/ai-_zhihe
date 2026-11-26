/**
 * 委托数据接口。A/D 负责在 D2 把内部实现换成 Supabase 查询，
 * 函数签名不许改，改了要先更新 docs/api/接口契约.md 并通知全员。
 */
import type { Task, TaskCategory, TaskStatus } from "@/lib/types";
import { store } from "./store";
import {
  activateDueScheduledTasks,
  isTaskScheduledPending,
  parseTaskDateTime,
  runTaskScheduleTick,
  type TaskScheduleTickResult,
} from "./task-scheduler";

export interface TaskFilters {
  keyword?: string;
  category?: TaskCategory;
  status?: TaskStatus;
  includeScheduled?: boolean;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  deadline: string;
  contact: string;
  urgent?: boolean;
  scheduledAt?: string;
}

function formatDeadline(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return value || "长期有效";
  return match[2] + "-" + match[3] + " " + match[4] + ":" + match[5];
}

export async function listTasks(filters: TaskFilters = {}): Promise<Task[]> {
  activateDueScheduledTasks(store.tasks);

  let result = [...store.tasks];
  if (!filters.includeScheduled) {
    result = result.filter((task) => !isTaskScheduledPending(task));
  }
  if (filters.category) {
    result = result.filter((task) => task.category === filters.category);
  }
  if (filters.status) {
    result = result.filter((task) => task.status === filters.status);
  }
  if (filters.keyword) {
    const keyword = filters.keyword.trim().toLowerCase();
    result = result.filter((task) =>
      [task.title, task.description, task.location, task.author, ...task.tags]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }
  return result;
}

/** 查询当前尚未到达预约时间的定时委托队列。 */
export async function listScheduledPendingTasks(): Promise<Task[]> {
  activateDueScheduledTasks(store.tasks);
  return store.tasks.filter((task) => isTaskScheduledPending(task));
}

export async function getTask(id: string): Promise<Task | undefined> {
  activateDueScheduledTasks(store.tasks);
  return store.tasks.find((task) => task.id === id);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const now = new Date();
  const parsedSchedule = parseTaskDateTime(input.scheduledAt, now);
  const isFutureSchedule =
    parsedSchedule !== null && parsedSchedule.getTime() > now.getTime();
  const parsedDeadline = parseTaskDateTime(input.deadline, now);

  const task: Task = {
    id: "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    title: input.title,
    description: input.description,
    category: input.category,
    location: input.location,
    deadline: formatDeadline(input.deadline),
    status: "pending",
    author: "当前用户",
    contact: input.contact,
    tags: [],
    urgent: input.urgent ?? false,
    pin: { x: 50, y: 50 },
    createdAt: isFutureSchedule ? "定时待发布" : "刚刚",
    ...(isFutureSchedule && parsedSchedule
      ? { scheduledAt: parsedSchedule.toISOString() }
      : {}),
    ...(parsedDeadline ? { rawDeadline: parsedDeadline.toISOString() } : {}),
  };
  store.tasks = [task, ...store.tasks];
  return task;
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<Task | undefined> {
  const task = store.tasks.find((item) => item.id === id);
  if (task) task.status = status;
  return task;
}

/** 供 /api/internal/archive 调用：执行到点预约激活 + 已完成/已过期委托自动归档。 */
export async function runScheduledTaskMaintenance(
  now: Date = new Date()
): Promise<TaskScheduleTickResult> {
  return runTaskScheduleTick(store.tasks, now);
}

/** 兼容原导出签名：返回本次归档总条数。 */
export async function archiveCompletedTasks(): Promise<number> {
  const result = runTaskScheduleTick(store.tasks);
  return result.archived;
}
