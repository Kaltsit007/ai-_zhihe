/**
 * 委托数据接口。
 *
 * 两种后端：
 * - 配置了 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY：读写 public.tasks（真实持久化）。
 * - 未配置：退回内存演示库（重启重置）。
 *
 * 函数签名是对外契约，不许改；换实现只改本文件内部。
 */
import type { Task, TaskCategory, TaskStatus } from "@/lib/types";
import { store } from "./store";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
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
  /** GCJ-02 坐标，必须成对出现；不选点就不传。 */
  lat?: number;
  lng?: number;
}

function formatDeadline(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return value || "长期有效";
  return match[2] + "-" + match[3] + " " + match[4] + ":" + match[5];
}

interface TaskRow {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  location_name: string;
  deadline: string | null;
  raw_deadline: string | null;
  scheduled_at: string | null;
  status: TaskStatus;
  contact: string | null;
  tags: string[] | null;
  urgent: boolean | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  profiles?: { nickname: string } | null;
}

const TASK_SELECT = "*, profiles:creator_id(nickname)";

function mapRow(row: TaskRow): Task {
  const raw = row.raw_deadline || row.deadline || "";
  const lat = typeof row.lat === "number" && Number.isFinite(row.lat) ? row.lat : undefined;
  const lng = typeof row.lng === "number" && Number.isFinite(row.lng) ? row.lng : undefined;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location_name,
    deadline: raw ? formatDeadline(raw) : "长期有效",
    status: row.status,
    author: row.profiles?.nickname || "矿大同学",
    contact: row.contact || "",
    tags: row.tags ?? [],
    urgent: row.urgent ?? false,
    ...(lat !== undefined && lng !== undefined ? { lat, lng } : {}),
    pin: { x: 50, y: 50 },
    createdAt: row.created_at ? row.created_at.slice(5, 16).replace("T", " ") : "刚刚",
    scheduledAt: row.scheduled_at ?? undefined,
    rawDeadline: raw || undefined,
  };
}

/* ------------------------------- 内存实现 ------------------------------- */

function memoryListTasks(filters: TaskFilters): Task[] {
  activateDueScheduledTasks(store.tasks);
  let result = [...store.tasks];
  if (!filters.includeScheduled) {
    result = result.filter((task) => !isTaskScheduledPending(task));
  }
  if (filters.category) result = result.filter((task) => task.category === filters.category);
  if (filters.status) result = result.filter((task) => task.status === filters.status);
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

/* -------------------------------- 对外接口 ------------------------------- */

export async function listTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return memoryListTasks(filters);

  let query = supabase
    .from("tasks")
    .select(TASK_SELECT)
    .order("created_at", { ascending: false });

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.status) query = query.eq("status", filters.status);
  if (!filters.includeScheduled) {
    query = query.or("scheduled_at.is.null,scheduled_at.lte." + new Date().toISOString());
  }
  if (filters.keyword) {
    const kw = filters.keyword.trim();
    query = query.or(
      "title.ilike.%" + kw + "%,description.ilike.%" + kw + "%,location_name.ilike.%" + kw + "%"
    );
  }

  const { data, error } = await query;
  if (error || !data) return memoryListTasks(filters);
  return (data as TaskRow[]).map(mapRow);
}

export async function listScheduledPendingTasks(): Promise<Task[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    activateDueScheduledTasks(store.tasks);
    return store.tasks.filter((task) => isTaskScheduledPending(task));
  }
  const { data } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("status", "pending")
    .gt("scheduled_at", new Date().toISOString());
  return ((data as TaskRow[] | null) ?? []).map(mapRow);
}

export async function getTask(id: string): Promise<Task | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    activateDueScheduledTasks(store.tasks);
    return store.tasks.find((task) => task.id === id);
  }
  const { data } = await supabase.from("tasks").select(TASK_SELECT).eq("id", id).maybeSingle();
  return data ? mapRow(data as TaskRow) : undefined;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const parsedSchedule = parseTaskDateTime(input.scheduledAt, now);
  const isFutureSchedule = parsedSchedule !== null && parsedSchedule.getTime() > now.getTime();
  const parsedDeadline = parseTaskDateTime(input.deadline, now);

  if (!supabase) {
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
      ...(input.lat !== undefined && input.lng !== undefined
        ? { lat: input.lat, lng: input.lng }
        : {}),
      pin: { x: 50, y: 50 },
      createdAt: isFutureSchedule ? "定时待发布" : "刚刚",
      ...(isFutureSchedule && parsedSchedule ? { scheduledAt: parsedSchedule.toISOString() } : {}),
      ...(parsedDeadline ? { rawDeadline: parsedDeadline.toISOString() } : {}),
    };
    store.tasks = [task, ...store.tasks];
    return task;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("请先登录后再发布委托");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description,
      category: input.category,
      location_name: input.location,
      deadline: parsedDeadline ? parsedDeadline.toISOString() : null,
      raw_deadline: parsedDeadline ? parsedDeadline.toISOString() : null,
      scheduled_at: isFutureSchedule && parsedSchedule ? parsedSchedule.toISOString() : null,
      contact: input.contact,
      urgent: input.urgent ?? false,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      creator_id: user.id,
      status: "pending",
    })
    .select(TASK_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as TaskRow);
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<Task | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const task = store.tasks.find((item) => item.id === id);
    if (task) task.status = status;
    return task;
  }
  const { data } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .select(TASK_SELECT)
    .maybeSingle();
  return data ? mapRow(data as TaskRow) : undefined;
}

/** 执行到点预约激活 + 已完成/已过期委托自动归档。 */
export async function runScheduledTaskMaintenance(
  now: Date = new Date()
): Promise<TaskScheduleTickResult> {
  const supabase = await createSupabaseAdminClient();
  if (!supabase) {
    const memoryClient = await createSupabaseServerClient();
    if (!memoryClient) return runTaskScheduleTick(store.tasks, now);
  }
  if (!supabase) return runTaskScheduleTick(store.tasks, now);

  const nowIso = now.toISOString();
  const result: TaskScheduleTickResult = {
    activated: 0,
    archived: 0,
    archivedCompleted: 0,
    archivedExpired: 0,
  };

  const activated = await supabase
    .from("tasks")
    .update({ scheduled_at: null })
    .lte("scheduled_at", nowIso)
    .eq("status", "pending")
    .select("id");
  result.activated = activated.data?.length ?? 0;

  const completed = await supabase
    .from("tasks")
    .update({ status: "archived", archived_at: nowIso })
    .eq("status", "completed")
    .select("id");
  result.archivedCompleted = completed.data?.length ?? 0;

  const expired = await supabase
    .from("tasks")
    .update({ status: "archived", archived_at: nowIso })
    .eq("status", "pending")
    .lt("deadline", nowIso)
    .select("id");
  result.archivedExpired = expired.data?.length ?? 0;

  result.archived = result.archivedCompleted + result.archivedExpired;
  return result;
}

/** 兼容原导出签名：返回本次归档总条数。 */
export async function archiveCompletedTasks(): Promise<number> {
  const result = await runScheduledTaskMaintenance();
  return result.archived;
}
