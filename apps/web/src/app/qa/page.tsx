import Link from "next/link";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/page-header";
import { QaExplorer } from "@/components/qa-explorer";
import { listQuestions } from "@/lib/data/qa";

export const dynamic = "force-dynamic";

export default async function QaPage() {
  const questions = await listQuestions();

  return (
    <div>
      <PageHeader
        eyebrow="Questions"
        title="答疑"
        description="先搜一下，可能已经有人问过；搜不到再提问，回答完可以标为已解决。"
        actions={
          <Link
            href="/qa/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f5132] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b3f27]"
          >
            <Icon name="plus" className="h-4 w-4" />
            我要提问
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.65fr]">
        <QaExplorer questions={questions} />

        <aside className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="info" className="h-4 w-4 text-emerald-700" />
              学校信息库
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              办事流程、开放时间、奖助材料，先搜信息库，比在群里等回答快。
            </p>
            <Link
              href="/info"
              className="mt-4 flex h-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              去搜学校信息
            </Link>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold">热门标签</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["校园卡", "图书馆", "奖学金", "校医院", "成绩单", "空教室", "就业"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] text-slate-500 ring-1 ring-inset ring-slate-200/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="spark" className="h-4 w-4 text-emerald-700" />
              提问前检查
            </div>
            <ul className="mt-3 space-y-2 text-[11px] leading-5 text-slate-500">
              <li>标题写清楚具体问题，不要只写“求助”。</li>
              <li>附上时间、地点、已经试过的方法。</li>
              <li>不要发身份证号、手机号等敏感信息。</li>
              <li>得到答案后，记得标为已解决。</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
