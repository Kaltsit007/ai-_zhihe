import Link from "next/link";
import { Icon } from "@/components/icon";
import { LostFoundBoard } from "@/components/lost-found-board";
import { LostFoundDigestCard } from "@/components/lost-found-digest-card";
import { PageHeader } from "@/components/page-header";
import { getLostFoundStats, listLostFound } from "@/lib/data/lost-found";

export const dynamic = "force-dynamic";

export default async function LostFoundPage() {
  const [items, stats] = await Promise.all([
    listLostFound(),
    getLostFoundStats(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Lost & found"
        title="失物招领"
        description="丢了、捡到都发这里。站内直接查看联系方式核对物品，每天 20:00 机器人汇总未解决条目到校园群。"
        actions={
          <Link
            href="/lost-found/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f5132] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b3f27]"
          >
            <Icon name="plus" className="h-4 w-4" />
            提交失物/拾物
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.65fr]">
        <LostFoundBoard items={items} />

        <aside className="space-y-4">
          <LostFoundDigestCard stats={stats} />

          <section className="card p-5">
            <h2 className="text-sm font-semibold text-slate-900">发布建议</h2>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
              <li>写清楚物品特征，但证件号等敏感字段请先打码或留待当面核对。</li>
              <li>地点写到具体楼栋或门口（如博学楼、竹园、图书馆），方便同学判断。</li>
              <li>捡到校园卡可只描述卡套特征，认领时核对本人信息。</li>
              <li>认领完成后在详情页点击「标为已认领」，自动移出每日未解决汇总。</li>
            </ul>
          </section>

          <section className="card bg-gradient-to-br from-rose-50 to-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Icon name="shield" className="h-4 w-4 text-rose-600" />
              隐私与群汇总提醒
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              群机器人每日汇总不公开联系方式，请在站内查看并核对物品特征。图片上传前请先压缩并将敏感信息打码。
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
