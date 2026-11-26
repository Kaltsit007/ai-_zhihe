/**
 * 失物招领数据接口。C 负责后续切换 Supabase。
 *
 * Supabase 迁移与 RLS 权限注意（对应 supabase/migrations/0001_init.sql）：
 * - public.lost_found 字段：
 *     id, type ('lost' | 'found'), title, description, location_name,
 *     happened_at, images text[], contact, status ('open' | 'claimed' | 'closed'),
 *     creator_id, created_at
 * - 认领权限冲突点（重点）：
 *     团队业务口径为「普通登录用户即可直接点击认领（不限制仅原发布者）」，
 *     而 0001_init.sql 中 lost_found 的 update RLS 策略限定为 auth.uid() = creator_id。
 *     接入 Supabase 真库后，PATCH /api/lost-found/:id 必须在服务端校验登录态（Supabase JWT）后，
 *     使用 SUPABASE_SERVICE_ROLE_KEY 仅放行 status 字段更新，禁止修改其他业务字段。
 */
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

export interface LostFoundStats {
  addedToday: number;
  openCount: number;
  claimedCount: number;
  closedCount: number;
  totalCount: number;
}

function isAddedToday(timeText: string): boolean {
  const normalized = timeText.trim();
  if (!normalized) return false;
  if (
    normalized.includes("刚刚") ||
    normalized.includes("分钟前") ||
    normalized.includes("小时前") ||
    normalized.includes("今天")
  ) {
    return true;
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const mmdd = `${month}-${day}`;
  const yyyymmdd = `${year}-${mmdd}`;

  return normalized.includes(yyyymmdd) || normalized.includes(mmdd);
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

export async function getLostFound(id: string): Promise<LostFound | undefined> {
  return store.lostFound.find((item) => item.id === id);
}

export async function createLostFound(
  input: CreateLostFoundInput
): Promise<LostFound> {
  const item: LostFound = {
    id: "l" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
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

/**
 * 更新失物招领状态（open -> claimed / closed，或误点后恢复 open）。
 * 接 Supabase 后需由服务端验登录并用 SUPABASE_SERVICE_ROLE_KEY 仅更新 status。
 */
export async function updateLostFoundStatus(
  id: string,
  status: LostFoundStatus
): Promise<LostFound | undefined> {
  let updated: LostFound | undefined;
  store.lostFound = store.lostFound.map((item) => {
    if (item.id !== id) return item;
    updated = { ...item, status };
    return updated;
  });
  return updated;
}

/** 统计失物招领真实概况，供侧边栏与每日汇总使用。 */
export async function getLostFoundStats(): Promise<LostFoundStats> {
  let addedToday = 0;
  let openCount = 0;
  let claimedCount = 0;
  let closedCount = 0;

  for (const item of store.lostFound) {
    if (isAddedToday(item.time)) addedToday += 1;
    if (item.status === "open") openCount += 1;
    else if (item.status === "claimed") claimedCount += 1;
    else if (item.status === "closed") closedCount += 1;
  }

  return {
    addedToday,
    openCount,
    claimedCount,
    closedCount,
    totalCount: store.lostFound.length,
  };
}

/**
 * 供 /api/internal/digest 与后续群机器人调用：生成未解决失物汇总文本。
 * 严格排除已认领（claimed）与已关闭（closed）条目，且不在群消息中公开联系方式。
 */
export async function buildLostFoundDigest(): Promise<{
  open: LostFound[];
  addedToday: number;
  text: string;
}> {
  const [open, stats] = await Promise.all([
    Promise.resolve(store.lostFound.filter((item) => item.status === "open")),
    getLostFoundStats(),
  ]);
  const lost = open.filter((item) => item.type === "lost");
  const found = open.filter((item) => item.type === "found");

  const lines = [
    "【失物招领汇总】",
    `今日新增 ${stats.addedToday} 条 · 当前未解决 ${open.length} 条`,
    "- 待寻回 " + lost.length + " 条：",
    ...(lost.length > 0
      ? lost.map((item) => "  · " + item.title + "（" + item.location + "）")
      : ["  · 暂无"]),
    "- 待认领 " + found.length + " 条：",
    ...(found.length > 0
      ? found.map((item) => "  · " + item.title + "（" + item.location + "）")
      : ["  · 暂无"]),
    "",
    "认领请到平台详情页核对信息，联系方式不公开在群里。",
  ];
  return { open, addedToday: stats.addedToday, text: lines.join("\n") };
}
