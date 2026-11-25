/**
 * 委托数据接口。A/D 负责在 D2 把内部实现换成 Supabase 查询，
 * 函数签名不许改，改了要先更新 docs/api/接口契约.md 并通知全员。
 */
import type { Task, TaskCategory, TaskStatus } from "@/lib/types";
import { store } from "./store";

export interface TaskFilters {
  keyword?: string;
  category?: TaskCategory;
  status?: TaskStatus;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  deadline: string;
  contact: string;
  urgent?: boolean;
}

function formatDeadline(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return value || "长期有效";
  return match[2] + "-" + match[3] + " " + match[4] + ":" + match[5];
}

export async function listTasks(filters: TaskFilters = {}): Promise<Task[]> {
  let result = [...store.tasks];
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

export async function getTask(id: string): Promise<Task | undefined> {
  return store.tasks.find((task) => task.id === id);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const task: Task = {
    id: "t" + Date.now().toString(36),
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
    createdAt: "刚刚",
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

/** 供 /api/internal/archive 调用：把已完成的委托归档。 */
export async function archiveCompletedTasks(): Promise<number> {
  let count = 0;
  for (const task of store.tasks) {
    if (task.status === "completed") {
      task.status = "archived";
      count += 1;
    }
  }
  return count;
}
