/** 失物招领数据接口。C 负责换成 Supabase。 */
import type { LostFound, LostFoundStatus, LostFoundType } from "@/lib/types";
import { store } from "./store";

export interface LostFoundFilters {
  type?: LostFoundType;
  status?: LostFoundStatus;
}

export interface CreateLostFoundInput {
  type: LostFoundType;
  title: string;
  location: string;
  time: string;
  description: string;
  contact: string;
}

export async function listLostFound(
  filters: LostFoundFilters = {}
): Promise<LostFound[]> {
  let result = [...store.lostFound];
  if (filters.type) {
    result = result.filter((item) => item.type === filters.type);
  }
  if (filters.status) {
    result = result.filter((item) => item.status === filters.status);
  }
  return result;
}

export async function createLostFound(
  input: CreateLostFoundInput
): Promise<LostFound> {
  const item: LostFound = {
    id: "l" + Date.now().toString(36),
    type: input.type,
    title: input.title,
    location: input.location,
    time: input.time || "刚刚",
    status: "open",
    description: input.description,
    contact: input.contact,
    color:
      input.type === "lost"
        ? "from-rose-500 to-orange-400"
        : "from-emerald-600 to-teal-400",
  };
  store.lostFound = [item, ...store.lostFound];
  return item;
}

/** 供 /api/internal/digest 调用：生成今日汇总文本。 */
export async function buildLostFoundDigest(): Promise<{
  open: LostFound[];
  addedToday: number;
  text: string;
}> {
  const open = store.lostFound.filter((item) => item.status === "open");
  const lost = open.filter((item) => item.type === "lost");
  const found = open.filter((item) => item.type === "found");

  const lines = [
    "【失物招领汇总】",
    "- 待寻回 " + lost.length + " 条：",
    ...lost.map((item) => "  · " + item.title + "（" + item.location + "）"),
    "- 待认领 " + found.length + " 条：",
    ...found.map((item) => "  · " + item.title + "（" + item.location + "）"),
    "",
    "认领请到平台详情页核对信息，联系方式不公开在群里。",
  ];
  return { open, addedToday: store.lostFound.length, text: lines.join("\n") };
}
