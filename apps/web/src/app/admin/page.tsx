import { AdminActions } from "@/components/admin-actions";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/page-header";

const status = [
  { label: "Next.js", value: "已搭好", tone: "bg-emerald-50 text-emerald-700" },
  { label: "Supabase", value: "待连接", tone: "bg-amber-50 text-amber-700" },
  { label: "Vercel", value: "待部署", tone: "bg-sky-50 text-sky-700" },
  { label: "机器人", value: "待接 webhook", tone: "bg-rose-50 text-rose-700" },
];

export default function AdminPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="管理"
        description="比赛演示用的内部入口：手动归档、跑爬虫、发失物汇总。所有操作都要能在演示时一键触发。"
      />

      <AdminActions />

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="card p-5">
          <h2 className="text-sm font-semibold">系统状态</h2>
          <div className="mt-4 space-y-3">
            {status.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className={"rounded-full px-2.5 py-1 text-[10px] font-medium " + item.tone}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="shield" className="h-4 w-4 text-emerald-700" />
            内部接口约定
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
            {[
              ["POST", "/api/internal/archive", "归档已完成/过期委托"],
              ["POST", "/api/internal/crawl", "跑 1 个公开源爬虫"],
              ["POST", "/api/internal/digest", "生成并发送失物汇总"],
            ].map(([method, path, note]) => (
              <div
                key={path}
                className="flex flex-col gap-1 border-b border-slate-100 px-3 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-3"
              >
                <span className="w-12 rounded-md bg-slate-100 px-1.5 py-1 text-center text-[10px] font-semibold text-slate-500">
                  {method}
                </span>
                <span className="font-mono text-[11px] text-slate-700">{path}</span>
                <span className="text-[10px] text-slate-400 sm:ml-auto">{note}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-5 text-slate-400">
            所有内部接口必须带 CRON_SECRET，不暴露给前端。演示前用测试环境跑一遍。
          </p>
        </section>
      </div>
    </div>
  );
}
