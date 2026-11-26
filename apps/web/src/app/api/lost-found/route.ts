import {
  createLostFound,
  listLostFound,
  validateLostFoundImages,
} from "@/lib/data/lost-found";
import { oneOf, str } from "@/lib/data/validation";
import { fail, ok } from "@/lib/api/respond";
import type { LostFoundStatus, LostFoundType } from "@/lib/types";

export const dynamic = "force-dynamic";

const TYPES: readonly LostFoundType[] = ["lost", "found"];
const STATUSES: readonly LostFoundStatus[] = ["open", "claimed", "closed"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const items = await listLostFound({
    type: oneOf(searchParams.get("type"), TYPES) ?? undefined,
    status: oneOf(searchParams.get("status"), STATUSES) ?? undefined,
  });
  return ok(items);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("BAD_JSON", "请求体不是合法 JSON");
  }

  const type = oneOf(body.type, TYPES);
  if (!type) return fail("BAD_TYPE", "类型必须是 lost 或 found");

  const title = str(body.title, 100);
  if (!title) return fail("BAD_TITLE", "物品名称不能为空");

  const location = str(body.location, 100);
  if (!location) return fail("BAD_LOCATION", "地点不能为空");

  const description = str(body.description, 1000);
  if (!description) return fail("BAD_DESCRIPTION", "描述不能为空");

  const contact = str(body.contact, 100);
  if (!contact) return fail("BAD_CONTACT", "联系方式不能为空");

  const time = str(body.time, 40) ?? "刚刚";

  const imageCheck = validateLostFoundImages(body.images);
  if (imageCheck.errorCode && imageCheck.errorMessage) {
    return fail(imageCheck.errorCode, imageCheck.errorMessage);
  }

  const item = await createLostFound({
    type,
    title,
    location,
    time,
    description,
    contact,
    images: imageCheck.images,
  });
  return ok(item, 201);
}
