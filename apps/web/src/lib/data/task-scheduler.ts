/**
 * 定时委托与自动归档独立调度模块（任务 C）。
 *
 * 设计目标：
 * 1. 不修改 TaskStatus 现有枚举值，通过可选字段 scheduledAt / rawDeadline 实现预约定时上架与精确过期归档；
 * 2. 与 tasks.ts / map 解耦，后续接入 Supabase 时可直接迁移为 SQL 条件更新 + Cron 调用。
 */
import type { Task } from "@/lib/types";

export interface TaskScheduleTickResult {
  activated: number;
  archived: number;
  archivedCompleted: number;
  archivedExpired: number;
}

/**
 * 将 ISO 时间、datetime-local 字符串、YYYY-MM-DD HH:mm 或 seed 中的 MM-DD HH:mm
 * 解析为 Date 对象；非时间文本（如 "长期有效"）返回 null。
 */
export function parseTaskDateTime(
  value?: string | null,
  referenceNow: Date = new Date()
): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "长期有效") return null;

  // 1. 匹配 MM-DD HH:mm（兼容现有 mock-data.ts 格式）
  const shortMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})$/);
  if (shortMatch) {
    const year = referenceNow.getFullYear();
    const month = Number(shortMatch[1]) - 1;
    const day = Number(shortMatch[2]);
    const hour = Number(shortMatch[3]);
    const minute = Number(shortMatch[4]);
    const parsed = new Date(year, month, day, hour, minute, 0, 0);
    if (
      !Number.isNaN(parsed.getTime()) &&
      parsed.getMonth() === month &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
    return null;
  }

  // 2. 匹配 YYYY-MM-DD[T ]HH:mm(:ss)?（无时区后缀按本地时间解析）
  const localMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (localMatch) {
    const year = Number(localMatch[1]);
    const month = Number(localMatch[2]) - 1;
    const day = Number(localMatch[3]);
    const hour = Number(localMatch[4]);
    const minute = Number(localMatch[5]);
    const second = localMatch[6] ? Number(localMatch[6]) : 0;
    const parsed = new Date(year, month, day, hour, minute, second, 0);
    if (
      !Number.isNaN(parsed.getTime()) &&
      parsed.getFullYear() === year &&
      parsed.getMonth() === month &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
    return null;
  }

  // 3. 标准 ISO 8601（带 Z 或时区偏移）
  const isoParsed = new Date(trimmed);
  if (!Number.isNaN(isoParsed.getTime())) {
    return isoParsed;
  }

  return null;
}

/** 格式化预约时间为简洁可读文案（MM-DD HH:mm）。 */
export function formatScheduleLabel(
  value?: string | null,
  referenceNow: Date = new Date()
): string {
  const parsed = parseTaskDateTime(value, referenceNow);
  if (!parsed) return value ?? "";
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hour = String(parsed.getHours()).padStart(2, "0");
  const minute = String(parsed.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

/** 判断委托是否仍处于“定时待发布（未到预约时间）”阻塞状态。 */
export function isTaskScheduledPending(
  task: Task,
  now: Date = new Date()
): boolean {
  if (!task.scheduledAt) return false;
  if (task.status !== "pending") return false;
  const scheduled = parseTaskDateTime(task.scheduledAt, now);
  if (!scheduled) return false;
  return scheduled.getTime() > now.getTime();
}

/**
 * 扫描并激活已到达或超过预约时间的定时委托：
 * 清除 scheduledAt 使其立刻公开到委托广场与地图，返回本次激活条数。
 */
export function activateDueScheduledTasks(
  tasks: Task[],
  now: Date = new Date()
): number {
  let activated = 0;
  const nowMs = now.getTime();

  for (const task of tasks) {
    if (!task.scheduledAt) continue;
    const scheduled = parseTaskDateTime(task.scheduledAt, now);
    if (!scheduled || scheduled.getTime() <= nowMs) {
      const activatedLabel = scheduled
        ? `定时上架于 ${formatScheduleLabel(task.scheduledAt, now)}`
        : task.createdAt;
      delete task.scheduledAt;
      if (task.status === "pending") {
        task.createdAt = activatedLabel;
        activated += 1;
      }
    }
  }

  return activated;
}

/**
 * 判断待接单委托是否已超过截止时间（仅限已公开生效且 status === "pending" 的委托）。
 * 进行中（in_progress）委托不会被误归档。
 */
export function isTaskExpiredPending(
  task: Task,
  now: Date = new Date()
): boolean {
  if (task.status !== "pending") return false;
  if (isTaskScheduledPending(task, now)) return false;

  const deadlineDate =
    parseTaskDateTime(task.rawDeadline, now) ??
    parseTaskDateTime(task.deadline, now);
  if (!deadlineDate) return false;

  return deadlineDate.getTime() < now.getTime();
}

/**
 * 执行一次完整的定时调度周期：
 * 1. 激活所有已到预约时间的定时委托；
 * 2. 将所有已完成（completed）及截止时间已过期且仍未接单（pending）的委托自动流转为 archived（不删除数据）。
 */
export function runTaskScheduleTick(
  tasks: Task[],
  now: Date = new Date()
): TaskScheduleTickResult {
  const activated = activateDueScheduledTasks(tasks, now);

  let archivedCompleted = 0;
  let archivedExpired = 0;

  for (const task of tasks) {
    if (task.status === "completed") {
      task.status = "archived";
      archivedCompleted += 1;
    } else if (isTaskExpiredPending(task, now)) {
      task.status = "archived";
      archivedExpired += 1;
    }
  }

  return {
    activated,
    archived: archivedCompleted + archivedExpired,
    archivedCompleted,
    archivedExpired,
  };
}
