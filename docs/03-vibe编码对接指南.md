# 03 · vibe coding 对接指南

> 回答一个问题：**用 AI 写代码的同学，能不能不踩坏这个项目？**
> 能。靠的不是自觉，是下面四道护栏：类型接口、唯一数据入口、文件所有权、CI 检查。

## 一、已经留好的三层接口

### 第 1 层：类型（AI 必须先读）

`src/lib/types.ts` 是全项目的“词汇表”：

- 委托 `Task`：category（team/carpool/moving/volunteer/club/other）、status（pending/in_progress/completed/cancelled/archived）
- 答疑 `Question`、学校信息 `SchoolInfo`、失物 `LostFound`

**给 AI 的第一条指令永远是：先读这个文件，枚举名一个字不许改。**

### 第 2 层：数据函数（页面取数的唯一入口）

| 函数 | 所在文件 | 归属 | 现状 |
| --- | --- | --- | --- |
| `listTasks / getTask / createTask / updateTaskStatus` | src/lib/data/tasks.ts | A/D | 内存版已通，D2 换 Supabase |
| `listQuestions / createQuestion` | src/lib/data/qa.ts | C | 内存版已通 |
| `listSchoolInfo / refreshSchoolInfo` | src/lib/data/info.ts | B | 内存版已通，D3 接爬虫 |
| `listLostFound / createLostFound / buildLostFoundDigest` | src/lib/data/lost-found.ts | C | 内存版已通 |
| `getStats` | src/lib/data/stats.ts | A | 内存版已通 |

规则：**页面只 import 这些函数，不许直接 import mock-data。**
接 Supabase 时只改这些文件的内部实现，函数签名冻结，页面一行不动。

### 第 3 层：HTTP 接口（和契约一一对应）

全部可用 curl 直接测（内存版）：

~~~powershell
# 列表（支持 q / category / status 筛选）
curl "http://localhost:3000/api/tasks?category=carpool"
# 发布
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d "{"title":"测试","description":"测试","category":"team","location":"南门","contact":"微信"}"
# 改状态
curl -X PATCH http://localhost:3000/api/tasks/t1/status -H "Content-Type: application/json" -d "{"status":"in_progress"}"
# 内部任务（演示环境没配 CRON_SECRET 时直接放行）
curl -X POST http://localhost:3000/api/internal/archive
~~~

前端组件不许手写 fetch，统一走 `src/lib/api-client.ts`。

## 二、每个人的领地

| 人 | 只许改这些 | 要调的函数 | 绝对不碰 |
| --- | --- | --- | --- |
| A（你，架构） | src/lib/data/、src/lib/api-client.ts、src/app/api/、next.config.ts、CI | 全部 | — |
| B（信息库） | src/lib/data/info.ts 内部、crawler/、data/seed/school-info.csv | listSchoolInfo | 别人的 data 文件、types.ts |
| C（答疑/失物） | src/lib/data/qa.ts、lost-found.ts 内部、bot/、失物相关页面文案 | listQuestions、listLostFound | tasks.ts、info.ts |
| D（委托前端/地图） | src/components/ 委托和地图相关、src/app/tasks、map 页面 | listTasks + TaskExplorer 等 props 组件 | src/lib/data/ 内部实现、api-client |
| E（内容，不写代码） | docs/content/、data/seed/*.csv、docs/devlog/ | 不写代码 | 一切 .ts/.tsx |

冲突处理：越界改动由 A 在 PR 里打回，CODEOWNERS 会自动要求对应负责人审核。

## 三、给 AI 的提示词模板（直接复制）

~~~text
你在帮“校园互助平台”的 D 同学写前端。项目规则：

1. 技术栈：Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4。
   Next 16 的页面 params 是 Promise，必须 await；
   Tailwind 4 在 globals.css 里用 @import "tailwindcss"。
2. 只允许修改这些文件：<列出 D 的领地>
3. 数据一律从 props 或 src/lib/api-client.ts 的函数拿，不许 import mock-data，不许手写 fetch。
4. 类型用 src/lib/types.ts 里现成的，枚举值不许改、不许新增。
5. 写完必须跑：npm run lint 和 npm run typecheck，两个都过才算完成。
~~~

## 四、怎么加一个新页面（照抄五步）

1. `src/app/xxx/page.tsx`，顶部写 `export const dynamic = "force-dynamic"`
2. `const data = await listXxx()`（从 src/lib/data 取）
3. 把数据当 props 传给客户端组件，客户端组件加 `"use client"`
4. 样式复用 `card` 类和现有配色，别引新 UI 库
5. `npm run lint && npm run typecheck` 都绿再提交

## 五、红线（CI 和 A 会拦）

- 改 types.ts 的枚举名 → 拦
- 改 data 函数签名 → 拦
- 页面直接 import mock-data → 拦
- 改别人领地的文件 → CODEOWNERS 要求对应人审核
- 提交 .env.local / node_modules / .next → .gitignore 已挡
- 跳过 lint/typecheck 直接 push main → 分支保护已挡

## 六、当前环境的如实说明

- 数据存内存：重启 dev 恢复 seed，多人各开各的 dev 互不影响；D2 接 Supabase 后共享。
- 内部接口在没配 CRON_SECRET 时放行（方便演示）；上线前必须配好。
- 演示时如果 AI 生成的行为怪异，先检查它有没有 await params（Next 16 最常见的坑）。
