"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import {
  apiCreateAnswer,
  apiUpdateQuestionStatus,
} from "@/lib/api-client";
import type { Answer, Question, QuestionStatus } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

function formatAnswerTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

export function QaDetail({
  initialQuestion,
  initialAnswers,
}: {
  initialQuestion: Question;
  initialAnswers: Answer[];
}) {
  const router = useRouter();
  const [question, setQuestion] = useState<Question>(initialQuestion);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);

  const [statusPending, setStatusPending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitPending, setSubmitPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  async function handleToggleStatus() {
    const nextStatus: QuestionStatus =
      question.status === "solved" ? "open" : "solved";
    setStatusPending(true);
    setStatusFeedback(null);

    const res = await apiUpdateQuestionStatus(question.id, nextStatus);
    setStatusPending(false);

    if (res.error || !res.data) {
      setStatusFeedback(res.error?.message ?? "更新状态失败，请稍后重试");
      return;
    }

    setQuestion({
      ...res.data,
      answers: answers.length,
    });
    setStatusFeedback(
      nextStatus === "solved"
        ? "已标为「已解决」，词条状态已更新"
        : "已重新打开问题，欢迎继续补充回答"
    );
    router.refresh();
  }

  async function handleSubmitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setSubmitError("请先填写回答或词条补充内容");
      return;
    }

    setSubmitPending(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const res = await apiCreateAnswer(question.id, {
      content: trimmed,
      author: author.trim() || undefined,
    });
    setSubmitPending(false);

    if (res.error || !res.data) {
      setSubmitError(res.error?.message ?? "提交回答失败，请稍后再试");
      return;
    }

    const nextAnswers = [...answers, res.data];
    setAnswers(nextAnswers);
    setQuestion((prev) => ({ ...prev, answers: nextAnswers.length }));
    setContent("");
    setSubmitSuccess(true);
    router.refresh();
  }

  const isWiki = question.tags.includes("矿大Wiki");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/qa"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-emerald-700"
        >
          <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
          返回矿大 Wiki 与答疑
        </Link>
        <span className="text-xs text-slate-400">词条编号 · {question.id}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
        <div className="space-y-5">
          <section className="card overflow-hidden">
            <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50/70 to-white p-5 sm:p-7">
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
                    矿大精选 Wiki
                  </span>
                ) : null}
                {question.tags
                  .filter((tag) => tag !== "矿大Wiki")
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-2.5 py-0.5 text-xs text-slate-600 ring-1 ring-inset ring-slate-200/80"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">
                {question.title}
              </h1>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {question.excerpt}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                    {initials(question.author)}
                  </span>
                  {question.author}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="clock" className="h-3.5 w-3.5 text-slate-400" />
                  {question.time}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="message" className="h-3.5 w-3.5 text-slate-400" />
                  {answers.length} 条回答
                </span>
                <span>{question.views} 次浏览</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 sm:px-7">
              <p className="text-xs text-slate-500">
                {question.status === "solved"
                  ? "该问题已有可用解答；若学校规则更新，欢迎在下方继续补充。"
                  : "该问题仍在等待更多矿大同学补充经验，解决后可标记完成。"}
              </p>
              <button
                type="button"
                disabled={statusPending}
                onClick={handleToggleStatus}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
                  question.status === "solved"
                    ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    : "bg-[#0f5132] text-white shadow-sm hover:bg-[#0b3f27]"
                )}
              >
                <Icon name="check" className="h-3.5 w-3.5" />
                {statusPending
                  ? "更新中…"
                  : question.status === "solved"
                  ? "重新打开问题"
                  : "标为已解决"}
              </button>
            </div>

            {statusFeedback ? (
              <div className="border-t border-slate-100 bg-emerald-50/70 px-5 py-2.5 text-xs text-emerald-800 sm:px-7">
                {statusFeedback}
              </div>
            ) : null}
          </section>

          <section className="card p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                回答与词条补充（{answers.length}）
              </h2>
              <span className="text-xs text-slate-400">按时间顺序展示</span>
            </div>

            {answers.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  暂时还没有同学回答
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  如果你知道矿大相关办事流程或经验，欢迎在下方写出第一条解答。
                </p>
              </div>
            ) : (
              <ol className="mt-4 space-y-4">
                {answers.map((answer, index) => (
                  <li
                    key={answer.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                        {initials(answer.author)}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {answer.author}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-400 ring-1 ring-inset ring-slate-200/70">
                        #{index + 1}
                      </span>
                      <span className="ml-auto text-xs text-slate-400">
                        {formatAnswerTime(answer.createdAt)}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                      {answer.content}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="card p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  补充回答 / 词条纠错
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  分享你在南湖或文昌校区的最新实测经验，帮助更多同学少踩坑。
                </p>
              </div>
            </div>

            {submitSuccess ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
                <Icon name="check" className="h-4 w-4 shrink-0" />
                回答已发布，感谢共建矿大校园 Wiki！
              </div>
            ) : null}

            {submitError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                {submitError}
              </div>
            ) : null}

            <form onSubmit={handleSubmitAnswer} className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-700">
                  你的昵称（选填，留空显示“热心矿大同学”）
                </span>
                <input
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  maxLength={40}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:max-w-xs"
                  placeholder="例如：25信安同学 / 南湖学长"
                />
              </label>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">
                    回答内容（必填）
                  </span>
                  <span className="text-xs text-slate-400">
                    {content.length} / 2000
                  </span>
                </div>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  maxLength={2000}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="写清楚具体地点、办理步骤、开放时段或避坑提示；请勿填写个人手机号或敏感隐私。"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitPending}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f5132] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b3f27] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon name="message" className="h-4 w-4" />
                  {submitPending ? "提交中…" : "发布回答"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Icon name="shield" className="h-4 w-4 text-emerald-700" />
              词条校对提示
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
              <li>校车班次、开馆时间、奖助标准等可能随学期微调，请以中国矿业大学官方通知为准。</li>
              <li>如发现信息过期，直接在左侧提交最新补充即可。</li>
              <li>严禁在回答中泄露他人联系方式或个人证件号。</li>
            </ul>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Icon name="info" className="h-4 w-4 text-emerald-700" />
              相关入口
            </div>
            <div className="mt-3 space-y-2">
              <Link
                href="/qa/new"
                className="flex h-10 items-center justify-center rounded-xl bg-[#0f5132] text-xs font-medium text-white transition hover:bg-[#0b3f27]"
              >
                发布新问题 / 贡献词条
              </Link>
              <Link
                href="/info"
                className="flex h-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                查看官方学校信息库
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
