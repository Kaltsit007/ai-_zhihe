import Link from "next/link";
import { Icon } from "@/components/icon";
import { LostFoundBoard } from "@/components/lost-found-board";
import { PageHeader } from "@/components/page-header";
import { listLostFound } from "@/lib/data/lost-found";

export const dynamic = "force-dynamic";

export default async function LostFoundPage() {
  const items = await listLostFound();

  return (
    <div>
      <PageHeader
        eyebrow="Lost & found"
        title="失物招领"
        description="丢了、捡到都发这里。每天 20:00 机器人把新增和未解决条目汇总到测试群。"
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
          <section className="card overflow-hidden">
            <div className="bg-[#0f5132] p-5 text-white">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="bot" className="h-4 w-4" />
                机器人汇总
              </div>
              <p className="mt-2 text-[11px] leading-5 text-emerald-50/80">
                每天 20:00 自动发送；失败写入 bot_digests，管理页可以复制重发。
              </p>
            </div>
            <div className="space-y-3 p-5">
              {[
                { label: "今日新增", value: "3 条" },
                { label: "未解决", value: "5 条" },
                { label: "下次发送", value: "20:00" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-medium text-white transition hover:bg-slate-800"
              >
                <Icon name="message" className="h-4 w-4" />
                立即发送测试
              </button>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold">发布建议</h2>
            <ul className="mt-3 space-y-2 text-[11px] leading-5 text-slate-500">
              <li>写清楚物品特征，但不要公开全部隐私。</li>
              <li>地点写到楼栋/门口，方便别人判断。</li>
              <li>捡到校园卡只写姓氏，认领时核对信息。</li>
              <li>已解决就改成已认领/已关闭，减少打扰。</li>
            </ul>
          </section>

          <section className="card bg-gradient-to-br from-rose-50 to-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="shield" className="h-4 w-4 text-rose-600" />
              隐私提醒
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              联系方式只在详情里展示，不直接进公开群。图片上传前先压缩，敏感信息打码。
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
