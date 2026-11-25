import { listSchoolInfo } from "@/lib/data/info";
import { oneOf } from "@/lib/data/validation";
import { ok } from "@/lib/api/respond";
import type { InfoCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES: readonly InfoCategory[] = [
  "教务",
  "生活",
  "场馆",
  "奖助",
  "就业",
  "其他",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const items = await listSchoolInfo({
    keyword: searchParams.get("q") ?? undefined,
    category: oneOf(searchParams.get("category"), CATEGORIES) ?? undefined,
  });
  return ok(items);
}
