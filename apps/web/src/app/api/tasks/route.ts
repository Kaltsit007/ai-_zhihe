import { createTask, listTasks } from "@/lib/data/tasks";
import { parseTaskDateTime } from "@/lib/data/task-scheduler";
import { num, oneOf, str, strOr } from "@/lib/data/validation";
import { fail, ok } from "@/lib/api/respond";
import type { TaskCategory, TaskStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES: readonly TaskCategory[] = [
  "team",
  "carpool",
  "moving",
  "volunteer",
  "club",
  "other",
];

const STATUSES: readonly TaskStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
  "archived",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeScheduledParam = searchParams.get("includeScheduled");
  const includeScheduled =
    includeScheduledParam === "1" || includeScheduledParam === "true";

  const tasks = await listTasks({
    keyword: searchParams.get("q") ?? undefined,
    category: oneOf(searchParams.get("category"), CATEGORIES) ?? undefined,
    status: oneOf(searchParams.get("status"), STATUSES) ?? undefined,
    includeScheduled,
  });
  return ok(tasks);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("BAD_JSON", "请求体不是合法 JSON");
  }

  const title = str(body.title, 100);
  if (!title) return fail("BAD_TITLE", "标题不能为空，且不超过 100 字");

  const description = str(body.description, 2000);
  if (!description) return fail("BAD_DESCRIPTION", "详细说明不能为空");

  const category = oneOf(body.category, CATEGORIES);
  if (!category) return fail("BAD_CATEGORY", "分类不合法");

  const location = str(body.location, 100);
  if (!location) return fail("BAD_LOCATION", "地点不能为空");

  const contact = str(body.contact, 100);
  if (!contact) return fail("BAD_CONTACT", "联系方式不能为空");

  const deadline = strOr(body.deadline, "长期有效", 40);

  // 坐标可选，但必须成对出现；统一按 GCJ-02 存，和地图瓦片同口径。
  const hasLat = body.lat !== undefined && body.lat !== null && body.lat !== "";
  const hasLng = body.lng !== undefined && body.lng !== null && body.lng !== "";
  let lat: number | undefined;
  let lng: number | undefined;
  if (hasLat || hasLng) {
    const parsedLat = num(body.lat);
    const parsedLng = num(body.lng);
    if (
      parsedLat === null ||
      parsedLng === null ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      return fail("BAD_COORD", "坐标不合法，请同时提供有效的 lat 和 lng（GCJ-02）");
    }
    lat = parsedLat;
    lng = parsedLng;
  }

  let scheduledAt: string | undefined;
  if (body.scheduledAt !== undefined && body.scheduledAt !== null && body.scheduledAt !== "") {
    const rawSchedule = str(body.scheduledAt, 40);
    const parsedSchedule = parseTaskDateTime(rawSchedule);
    if (!rawSchedule || !parsedSchedule) {
      return fail("BAD_SCHEDULED_AT", "预约定时发布时间格式不合法");
    }

    const parsedDeadline = parseTaskDateTime(deadline);
    if (parsedDeadline && parsedSchedule.getTime() > parsedDeadline.getTime()) {
      return fail(
        "SCHEDULED_AFTER_DEADLINE",
        "预约上架时间不能晚于委托截止时间"
      );
    }

    scheduledAt = rawSchedule;
  }

  const task = await createTask({
    title,
    description,
    category,
    location,
    deadline,
    contact,
    urgent: body.urgent === true,
    scheduledAt,
    lat,
    lng,
  });
  return ok(task, 201);
}
