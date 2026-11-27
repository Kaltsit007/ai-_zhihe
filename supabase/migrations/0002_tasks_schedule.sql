-- D3：委托补充字段（定时发布、原始截止时间、紧急标记、标签）
-- 对应 apps/web/src/lib/types.ts 里 Task 的可选字段。

alter table public.tasks add column if not exists tags text[] not null default '{}';
alter table public.tasks add column if not exists urgent boolean not null default false;
alter table public.tasks add column if not exists scheduled_at timestamptz;
alter table public.tasks add column if not exists raw_deadline timestamptz;

create index if not exists tasks_scheduled_at_idx on public.tasks(scheduled_at);
