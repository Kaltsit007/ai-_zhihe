# 互助地图 · Web

Next.js 16 + React 19 + TypeScript + Tailwind CSS 4。

## 开发

~~~powershell
npm install
Copy-Item ..\..\.env.example .env.local
npm run dev
~~~

打开 http://localhost:3000。

## 脚本

- npm run dev：本地开发
- npm run build：生产构建
- npm run start：启动构建产物
- npm run lint：ESLint
- npm run typecheck：TypeScript 检查

## 结构

~~~text
src/
├─ app/           页面路由
│  ├─ tasks/      委托列表、发布、详情
│  ├─ map/        地图
│  ├─ qa/         答疑
│  ├─ info/       学校信息
│  ├─ lost-found/ 失物招领
│  └─ admin/      管理
├─ components/    共用组件
└─ lib/           mock 数据、类型、工具
~~~

当前数据来自 src/lib/mock-data.ts。接 Supabase 后，把页面里的 mock 替换成查询，组件接口不变。
