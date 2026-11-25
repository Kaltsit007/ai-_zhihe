import Link from "next/link";
import { Icon } from "@/components/icon";
import { InfoExplorer } from "@/components/info-explorer";
import { PageHeader } from "@/components/page-header";
import { listSchoolInfo } from "@/lib/data/info";

export const dynamic = "force-dynamic";

export default async function InfoPage() {
  const items = await listSchoolInfo();

  return (
    <div>
      <PageHeader
        eyebrow="Knowledge base"
        title="学校信息库"
        description="把办事流程、开放时间、申请材料从群聊里捞出来，变成能搜索的条目。"
        actions={
          <Link
            href="/qa"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Icon name="qa" className="h-4 w-4" />
            没搜到？去提问
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.65fr]">
        <InfoExplorer items={items} />

        <aside className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="shield" className="h-4 w-4 text-emerald-700" />
              数据来源
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              当前是演示 seed。P0 接 1 个公开数据源的最小爬虫，按 source_url 去重，保留来源链接。
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">
              只抓公开信息，不登录、不绕验证码、不抓个人信息。页面会加来源和“仅供参考”提示。
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold">信息分类</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["教务", "生活", "场馆", "奖助", "就业", "其他"].map((item) => (
                <span
                  key={item}
                  className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="card bg-gradient-to-br from-amber-50 to-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="spark" className="h-4 w-4 text-amber-700" />
              P0 目标
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              50 条以上可搜索数据，至少 1 个公开源能重复跑。先求“搜得到”，再求“搜得准”。
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
