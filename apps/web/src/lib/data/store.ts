/**
 * 内存演示仓库。
 *
 * 规则（全员必须遵守）：
 * 1. 页面和组件一律通过 src/lib/data/* 里的函数取数，不许直接 import mock-data。
 * 2. 现在的实现是内存数组：发布、改状态在本次运行内有效，重启即重置。
 * 3. D2 接 Supabase 时，只改 src/lib/data/ 各文件的内部实现，
 *    函数名和参数保持不变，页面和组件一行都不用动。
 *
 * 注意：Next dev 下页面（RSC）和 API 路由可能是两份模块实例，
 * 内存状态必须挂在 globalThis 上，否则“API 写入 → 页面看到”会失效。
 */
import {
  answers,
  lostFound,
  questions,
  tasks,
} from "@/lib/mock-data";
import schoolInfoSeed from "./school-info.seed.json";
import type {
  Answer,
  LostFound,
  Question,
  SchoolInfo,
  Task,
} from "@/lib/types";

interface DemoStore {
  tasks: Task[];
  questions: Question[];
  answers: Answer[];
  schoolInfo: SchoolInfo[];
  lostFound: LostFound[];
}

function createStore(): DemoStore {
  return {
    tasks: [...tasks],
    questions: [...questions],
    answers: [...answers],
    // 学校信息库：310 条来自 crawler 抓取的公开数据（B 的 D2 交付），
    // 其余模块仍是 mock seed。
    schoolInfo: [...(schoolInfoSeed as unknown as SchoolInfo[])],
    lostFound: [...lostFound],
  };
}

const globalForStore = globalThis as unknown as { __aiZhiheStore?: DemoStore };

const existing = globalForStore.__aiZhiheStore;
if (existing && !Array.isArray(existing.answers)) {
  existing.answers = [...answers];
}

export const store: DemoStore = existing ?? createStore();
globalForStore.__aiZhiheStore = store;