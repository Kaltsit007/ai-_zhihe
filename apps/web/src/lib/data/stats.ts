/** 首页统计。换成 Supabase 后用 count 查询实现。 */
import { store } from "./store";

export interface Stats {
  activeTasks: number;
  solvedTasks: number;
  infoCount: number;
  lostOpen: number;
}

export async function getStats(): Promise<Stats> {
  return {
    activeTasks: store.tasks.filter(
      (task) => task.status === "pending" || task.status === "in_progress"
    ).length,
    solvedTasks: store.tasks.filter((task) => task.status === "completed").length,
    infoCount: store.schoolInfo.length,
    lostOpen: store.lostFound.filter((item) => item.status === "open").length,
  };
}
