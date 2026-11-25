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
import { lostFound, questions, schoolInfo, tasks } from "@/lib/mock-data";
import type { LostFound, Question, SchoolInfo, Task } from "@/lib/types";

interface DemoStore {
  tasks: Task[];
  questions: Question[];
  schoolInfo: SchoolInfo[];
  lostFound: LostFound[];
}

function createStore(): DemoStore {
  return {
    tasks: [...tasks],
    questions: [...questions],
    schoolInfo: [...schoolInfo],
    lostFound: [...lostFound],
  };
}

const globalForStore = globalThis as unknown as { __aiZhiheStore?: DemoStore };

export const store: DemoStore = globalForStore.__aiZhiheStore ?? createStore();
globalForStore.__aiZhiheStore = store;
