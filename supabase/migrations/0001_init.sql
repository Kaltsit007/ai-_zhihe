-- 校园综合互助平台初始 schema
-- 只在本地/dev 先跑，确认后再上 prod。

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  contact text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('team', 'carpool', 'moving', 'volunteer', 'club', 'other')),
  title text not null,
  description text not null default '',
  location_name text not null default '',
  lat double precision,
  lng double precision,
  deadline timestamptz,
  contact text,
  images text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled', 'archived')),
  creator_id uuid references public.profiles(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  tags text[] not null default '{}',
  author_id uuid references public.profiles(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'solved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  body text not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.school_info (
  id uuid primary key default gen_random_uuid(),
  category text not null default '其他',
  title text not null,
  summary text not null default '',
  content text not null default '',
  source_url text,
  tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.lost_found (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('lost', 'found')),
  title text not null,
  description text not null default '',
  location_name text not null default '',
  lat double precision,
  lng double precision,
  happened_at timestamptz,
  images text[] not null default '{}',
  contact text,
  status text not null default 'open' check (status in ('open', 'claimed', 'closed')),
  creator_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.bot_digests (
  id uuid primary key default gen_random_uuid(),
  period_start timestamptz not null,
  period_end timestamptz not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_category_idx on public.tasks(category);
create index if not exists tasks_created_at_idx on public.tasks(created_at desc);
create index if not exists tasks_deadline_idx on public.tasks(deadline);
create index if not exists questions_created_at_idx on public.questions(created_at desc);
create index if not exists answers_question_id_idx on public.answers(question_id);
create index if not exists school_info_category_idx on public.school_info(category);
create index if not exists lost_found_type_idx on public.lost_found(type);
create index if not exists lost_found_status_idx on public.lost_found(status);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at
before update on public.tasks
for each row execute function public.touch_updated_at();

drop trigger if exists questions_touch_updated_at on public.questions;
create trigger questions_touch_updated_at
before update on public.questions
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.school_info enable row level security;
alter table public.lost_found enable row level security;
alter table public.bot_digests enable row level security;

drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone"
on public.profiles for select using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles for insert to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "tasks are viewable by everyone" on public.tasks;
create policy "tasks are viewable by everyone"
on public.tasks for select using (true);

drop policy if exists "authenticated users can create tasks" on public.tasks;
create policy "authenticated users can create tasks"
on public.tasks for insert to authenticated
with check (auth.uid() = creator_id);

drop policy if exists "creators and assignees can update tasks" on public.tasks;
create policy "creators and assignees can update tasks"
on public.tasks for update to authenticated
using (auth.uid() = creator_id or auth.uid() = assignee_id)
with check (auth.uid() = creator_id or auth.uid() = assignee_id);

drop policy if exists "questions are viewable by everyone" on public.questions;
create policy "questions are viewable by everyone"
on public.questions for select using (true);

drop policy if exists "authenticated users can create questions" on public.questions;
create policy "authenticated users can create questions"
on public.questions for insert to authenticated
with check (auth.uid() = author_id);

drop policy if exists "authors can update questions" on public.questions;
create policy "authors can update questions"
on public.questions for update to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "answers are viewable by everyone" on public.answers;
create policy "answers are viewable by everyone"
on public.answers for select using (true);

drop policy if exists "authenticated users can create answers" on public.answers;
create policy "authenticated users can create answers"
on public.answers for insert to authenticated
with check (auth.uid() = author_id);

drop policy if exists "school info is viewable by everyone" on public.school_info;
create policy "school info is viewable by everyone"
on public.school_info for select using (true);

drop policy if exists "lost found is viewable by everyone" on public.lost_found;
create policy "lost found is viewable by everyone"
on public.lost_found for select using (true);

drop policy if exists "authenticated users can create lost found" on public.lost_found;
create policy "authenticated users can create lost found"
on public.lost_found for insert to authenticated
with check (auth.uid() = creator_id);

drop policy if exists "creators can update lost found" on public.lost_found;
create policy "creators can update lost found"
on public.lost_found for update to authenticated
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

-- school_info 和 bot_digests 的写操作只走 service_role，不开放前端写策略。
