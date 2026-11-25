# Supabase

## 初始化

1. 建一个 Supabase 项目。
2. 把 URL、anon key、service_role key 填到 apps/web/.env.local。
3. 在 SQL Editor 里执行 migrations/0001_init.sql。
4. 导入 data/seed 下的 CSV，或写一个导入脚本。
5. 确认 RLS 已开启。

## 本地 CLI（可选）

~~~powershell
supabase login
supabase link --project-ref <project-ref>
supabase db push
~~~

## 注意

- service_role key 只放服务端，不能进前端。
- 本地和 preview 用 dev 项目，main 用 prod 项目。
- 已应用的 migration 不再修改，只新增。
- 演示前重置 prod seed，保证数据稳定。
