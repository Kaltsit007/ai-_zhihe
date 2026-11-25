import { createTask, listTasks } from "@/lib/data/tasks";
import { oneOf, str, strOr } from "@/lib/data/validation";
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
  const tasks = await listTasks({
    keyword: searchParams.get("q") ?? undefined,
    category: oneOf(searchParams.get("category"), CATEGORIES) ?? undefined,
    status: oneOf(searchParams.get("status"), STATUSES) ?? undefined,
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

  const task = await createTask({
    title,
    description,
    category,
    location,
    deadline: strOr(body.deadline, "长期有效", 40),
    contact,
    urgent: body.urgent === true,
  });
  return ok(task, 201);
}
