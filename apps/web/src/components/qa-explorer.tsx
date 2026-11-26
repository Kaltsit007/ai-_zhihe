"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "./icon";
import type { Question } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

type Filter = "all" | "wiki" | "open" | "solved";

const HOT_KEYWORDS = ["校车", "断网", "研讨间", "空教室", "成绩单", "快递"];

const CUMT_HOT_TAGS = [
  "矿大Wiki",
  "南湖校区",
  "文昌校区",
  "校车通勤",
  "博学楼",
  "图书馆",
  "校园网",
  "校园卡",
  "体育打卡",
  "成绩单",
  "校医院",
  "奖助学金",
  "快递站",
  "选课",
];

export function QaExplorer({
  questions,
  answerCorpus,
}: {
  questions: Question[];
  answerCorpus: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const stats = useMemo(() => {
    const wikiCount = questions.filter((q) => q.tags.includes("矿大Wiki")).length;
    const openCount = questions.filter((q) => q.status === "open").length;
    const solvedCount = questions.filter((q) => q.status === "solved").length;
    const totalAnswers = questions.reduce((sum, q) => sum + q.answers, 0);
    return { wikiCount, openCount, solvedCount, totalAnswers };
  }, [questions]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return questions
      .filter((question) => {
        if (filter === "open" && question.status !== "open") return false;
        if (filter === "solved" && question.status !== "solved") return false;
        if (filter === "wiki" && !question.tags.includes("矿大Wiki")) {
          return false;
        }
        if (activeTag && !question.tags.includes(activeTag)) return false;

        if (!keyword) return true;
        const baseText = [
          question.title,
          question.excerpt,
          question.author,
          ...question.tags,
        ]
          .join(" ")
          .toLowerCase();
        if (baseText.includes(keyword)) return true;

        const answersText = (answerCorpus[question.id] ?? "").toLowerCase();
        return answersText.includes(keyword);
      })
      .map((question) => {
        const keywordLower = query.trim().toLowerCase();
        const baseMatched =
          !keywordLower ||
          [question.title, question.excerpt, question.author, ...question.tags]
            .join(" ")
            .toLowerCase()
            .includes(keywordLower);
        return {
          question,
          matchedInAnswerOnly: Boolean(keywordLower) && !baseMatched,
        };
      });
  }, [activeTag, answerCorpus, filter, query, questions]);

  function toggleTag(tag: string) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  function resetFilters() {
    setQuery("");
    setFilter("all");
    setActiveTag(null);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.45fr_0.65fr]">
      <div className="space-y-4">
        <div className="card p-4 sm:p-5">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 text-slate-400 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
            <Icon name="search" className="h-4 w-4 shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="搜矿大 Wiki 词条、问题、标签或回答正文（如：断网、校车、研讨间）"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="清空搜索词"
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400">快捷热词：</span>
            {HOT_KEYWORDS.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => setQuery(word)}
                className="rounded-full bg-emerald-50/70 px-2.5 py-0.5 text-xs text-emerald-700 transition hover:bg-emerald-100"
              >
                {word}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
            {[
              { key: "all", label: `全部 (${questions.length})` },
              { key: "wiki", label: `精选词条 (${stats.wikiCount})` },
              { key: "open", label: `待解答 (${stats.openCount})` },
              { key: "solved", label: `已解决 (${stats.solvedCount})` },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key as Filter)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition",
                  filter === item.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.label}
              </button>
            ))}

            {activeTag ? (
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 transition hover:bg-emerald-100"
              >
                标签：{activeTag}
                <Icon name="close" className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(({ question, matchedInAnswerOnly }) => {
            const isWiki = question.tags.includes("矿大Wiki");
            return (
              <article
                key={question.id}
                className="card p-5 transition hover:border-emerald-900/20 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                      question.status === "solved"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-amber-50 text-amber-700 ring-amber-200"
                    )}
                  >
                    {question.status === "solved" ? "已解决" : "待解答"}
                  </span>
                  {isWiki ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-200">
                      <Icon name="spark" className="h-3 w-3" />
                      矿大 Wiki
                    </span>
                  ) : null}
                  {question.tags
                    .filter((tag) => tag !== "矿大Wiki")
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs transition",
                          activeTag === tag
                            ? "bg-emerald-700 text-white"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  <span className="ml-auto text-xs text-slate-400">
                    {question.time}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  <Link
                    href={`/qa/${question.id}`}
                    className="transition hover:text-emerald-700"
                  >
                    {question.title}
                  </Link>
                </h3>

                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-500">
                  {question.excerpt}
                </p>

                {matchedInAnswerOnly ? (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-50/70 px-2.5 py-1 text-xs text-emerald-700">
                    <Icon name="search" className="h-3 w-3" />
                    关键词命中该词条的回答正文，点击详情查看完整说明
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                      {initials(question.author)}
                    </span>
                    {question.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="message" className="h-3.5 w-3.5 text-slate-400" />
                    {question.answers} 条回答
                  </span>
                  <span>{question.views} 次浏览</span>
                  <Link
                    href={`/qa/${question.id}`}
                    className="ml-auto inline-flex items-center gap-1 font-medium text-emerald-700 transition hover:text-emerald-800"
                  >
                    查看详情与回答
                    <Icon name="arrow" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="card px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-700">
              没有找到匹配的矿大词条或问题
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              可以切换关键词/标签，或者直接发布一个新问题请矿大同学帮忙解答。
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center rounded-xl border border-slate-200 px-3.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                清空筛选
              </button>
              <Link
                href="/qa/new"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0f5132] px-3.5 text-xs font-medium text-white transition hover:bg-[#0b3f27]"
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
                去提问
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="space-y-4">
        <section className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Icon name="spark" className="h-4 w-4 text-emerald-700" />
            矿大 Wiki 概览
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">收录词条 / 问题</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {questions.length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50/70 p-3">
              <p className="text-xs text-emerald-700">累计同学回答</p>
              <p className="mt-1 text-xl font-semibold text-emerald-800">
                {stats.totalAnswers}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            覆盖南湖与文昌校区高频学习生活问题；涉及政策、时间与费用以学校官方最新公告为准。
          </p>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">矿大高频标签</h2>
            {activeTag ? (
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className="text-xs text-emerald-700 hover:underline"
              >
                清除
              </button>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CUMT_HOT_TAGS.map((tag) => {
              const selected = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs transition ring-1 ring-inset",
                    selected
                      ? "bg-[#0f5132] text-white ring-[#0f5132]"
                      : "bg-slate-50 text-slate-600 ring-slate-200/70 hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Icon name="info" className="h-4 w-4 text-emerald-700" />
            官方学校信息库
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            教务通知、开放时间、奖助公示等官方来源汇总，也可前往学校信息库交叉核对。
          </p>
          <Link
            href="/info"
            className="mt-4 flex h-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            去搜学校信息库
          </Link>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Icon name="shield" className="h-4 w-4 text-emerald-700" />
            提问与共建须知
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
            <li>先搜关键词，已有词条可直接点进详情补充最新情况。</li>
            <li>提问注明校区（南湖 / 文昌）与具体场景，方便学长精准解答。</li>
            <li>请勿公开身份证号、手机号、学号密码等个人隐私。</li>
            <li>问题解决后，记得在详情页点击「标为已解决」沉淀为校园 Wiki。</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
