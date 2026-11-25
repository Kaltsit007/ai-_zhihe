/** 学校信息数据接口。B 负责换成 Supabase + 爬虫写入。 */
import type { InfoCategory, SchoolInfo } from "@/lib/types";
import { store } from "./store";

export interface InfoFilters {
  keyword?: string;
  category?: InfoCategory;
}

export async function listSchoolInfo(filters: InfoFilters = {}): Promise<SchoolInfo[]> {
  let result = [...store.schoolInfo];
  if (filters.category) {
    result = result.filter((item) => item.category === filters.category);
  }
  if (filters.keyword) {
    const keyword = filters.keyword.trim().toLowerCase();
    result = result.filter((item) =>
      [item.title, item.summary, item.category, item.source]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }
  return result;
}

/**
 * 供 /api/internal/crawl 调用的最小实现：
 * 模拟抓 1 条公开信息，按 source 去重后入库。
 * D3 由 B 换成真实爬虫（Python 侧跑，写 Supabase），这里只保留触发入口。
 */
export async function refreshSchoolInfo(): Promise<number> {
  const demo: SchoolInfo = {
    id: "i" + Date.now().toString(36),
    title: "心理健康中心预约方式",
    category: "生活",
    summary: "工作日 09:00-17:00 可预约，支持线上表单和电话两种方式。",
    source: "学工部官网（演示抓取）",
    updatedAt: "刚刚",
  };
  const exists = store.schoolInfo.some(
    (item) => item.title === demo.title && item.source === demo.source
  );
  if (exists) return 0;
  store.schoolInfo = [demo, ...store.schoolInfo];
  return 1;
}
