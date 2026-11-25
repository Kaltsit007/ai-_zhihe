# src/lib/data —— 全项目唯一的数据入口

## 给 vibe coding 同学的三条规则

1. **取数只 import 这里的函数**，不许直接 import mock-data。
2. **函数名和参数是冻结接口**，要改先改 docs/api/接口契约.md，再通知 A。
3. 接 Supabase 时只改这里的内部实现，页面组件一行不动。

## 文件归属

| 文件 | 归属 | 换 Supabase 时改什么 |
| --- | --- | --- |
| tasks.ts | A / D | listTasks / createTask / updateTaskStatus 内部 |
| qa.ts | C | listQuestions / createQuestion 内部 |
| info.ts | B | listSchoolInfo 内部；refreshSchoolInfo 换成触发真实爬虫 |
| lost-found.ts | C | listLostFound / createLostFound 内部 |
| stats.ts | A | 换成 count 查询 |
| store.ts | A | 直接删除（mock 数组不再需要） |
| validation.ts | A | 可换成 zod，调用方不变 |

## 当前实现的限制（要如实写进演示说明）

- 数据存在内存里：重启 npm run dev 会恢复 seed。
- 多人同时开 dev 各看各的内存，互不影响；接 Supabase 后才是共享数据。
