-- D3：委托经纬度（GCJ-02，与高德底图同口径）
-- 0001_init.sql 建表时已有 lat/lng；这里做幂等补丁，兼容只跑过部分迁移的库。

alter table public.tasks add column if not exists lat double precision;
alter table public.tasks add column if not exists lng double precision;

comment on column public.tasks.lat is 'GCJ-02 纬度，发布页选点写入；未选点为空';
comment on column public.tasks.lng is 'GCJ-02 经度，发布页选点写入；未选点为空';
