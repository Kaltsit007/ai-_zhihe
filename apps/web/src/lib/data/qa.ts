/**
 * 答疑与徐州矿大校园 Wiki 数据接口。C 负责后续切换 Supabase。
 *
 * Supabase 迁移映射说明（对应 supabase/migrations/0001_init.sql）：
 * - public.questions:
 *     id -> Question.id
 *     title -> Question.title
 *     body -> Question.excerpt
 *     tags -> Question.tags
 *     author_id -> join public.profiles(nickname) -> Question.author
 *     status -> Question.status ('open' | 'solved')
 *     created_at -> Question.time
 * - public.answers:
 *     id -> Answer.id
 *     question_id -> Answer.questionId
 *     body -> Answer.content
 *     author_id -> join public.profiles(nickname) -> Answer.author
 *     created_at -> Answer.createdAt
 * - 权限注意：0001_init.sql 中 questions 的 update RLS 限制为 auth.uid() = author_id，
 *   接真库后 PATCH /api/questions/:id 需校验登录用户身份或按团队约定放行管理员/作者操作。
 */
import type { Answer, Question, QuestionStatus } from "@/lib/types";
import { store } from "./store";

export interface QuestionFilters {
  keyword?: string;
  status?: QuestionStatus;
  tag?: string;
}

export interface CreateQuestionInput {
  title: string;
  excerpt: string;
  tags: string[];
  author?: string;
}

export interface CreateAnswerInput {
  content: string;
  author?: string;
}

export interface QuestionDetailData {
  question: Question;
  answers: Answer[];
}

export async function listQuestions(
  filters: QuestionFilters = {}
): Promise<Question[]> {
  let result = [...store.questions];

  if (filters.status) {
    result = result.filter((question) => question.status === filters.status);
  }

  if (filters.tag) {
    const targetTag = filters.tag.trim().toLowerCase();
    if (targetTag) {
      result = result.filter((question) =>
        question.tags.some((tag) => tag.toLowerCase() === targetTag)
      );
    }
  }

  if (filters.keyword) {
    const keyword = filters.keyword.trim().toLowerCase();
    if (keyword) {
      result = result.filter((question) => {
        const relatedAnswers = store.answers
          .filter((answer) => answer.questionId === question.id)
          .map((answer) => `${answer.content} ${answer.author}`);

        return [
          question.title,
          question.excerpt,
          question.author,
          ...question.tags,
          ...relatedAnswers,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      });
    }
  }

  return result;
}

export async function getQuestion(id: string): Promise<Question | undefined> {
  return store.questions.find((question) => question.id === id);
}

export async function listAnswers(questionId: string): Promise<Answer[]> {
  return store.answers.filter((answer) => answer.questionId === questionId);
}

/**
 * 为前端实时检索提供“问题 ID -> 全部回答正文拼接”索引，
 * 保持 listQuestions 签名不变的同时，支持前端秒搜回答正文。
 */
export async function getQuestionAnswerCorpus(): Promise<
  Record<string, string>
> {
  const corpus: Record<string, string> = {};
  for (const answer of store.answers) {
    const snippet = `${answer.content} ${answer.author}`;
    corpus[answer.questionId] = corpus[answer.questionId]
      ? `${corpus[answer.questionId]}\n${snippet}`
      : snippet;
  }
  return corpus;
}

export async function getQuestionWithAnswers(
  id: string,
  options: { incrementView?: boolean } = {}
): Promise<QuestionDetailData | undefined> {
  const index = store.questions.findIndex((question) => question.id === id);
  if (index === -1) return undefined;

  let question = store.questions[index];
  if (options.incrementView) {
    question = { ...question, views: question.views + 1 };
    store.questions = store.questions.map((item, idx) =>
      idx === index ? question : item
    );
  }

  const questionAnswers = await listAnswers(id);
  return {
    question: {
      ...question,
      answers: questionAnswers.length,
    },
    answers: questionAnswers,
  };
}

export async function createQuestion(
  input: CreateQuestionInput
): Promise<Question> {
  const question: Question = {
    id: "q" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    title: input.title,
    excerpt: input.excerpt,
    tags: input.tags,
    author: input.author?.trim() || "矿大同学",
    answers: 0,
    views: 1,
    status: "open",
    time: "刚刚",
  };
  store.questions = [question, ...store.questions];
  return question;
}

export async function createAnswer(
  questionId: string,
  input: CreateAnswerInput
): Promise<Answer | undefined> {
  const exists = store.questions.some((question) => question.id === questionId);
  if (!exists) return undefined;

  const answer: Answer = {
    id: "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    questionId,
    content: input.content,
    author: input.author?.trim() || "热心矿大同学",
    createdAt: new Date().toISOString(),
  };

  store.answers = [...store.answers, answer];
  const answerCount = store.answers.filter(
    (item) => item.questionId === questionId
  ).length;
  store.questions = store.questions.map((question) =>
    question.id === questionId
      ? { ...question, answers: answerCount }
      : question
  );

  return answer;
}

export async function updateQuestionStatus(
  id: string,
  status: QuestionStatus
): Promise<Question | undefined> {
  let updated: Question | undefined;
  store.questions = store.questions.map((question) => {
    if (question.id !== id) return question;
    updated = { ...question, status };
    return updated;
  });
  return updated;
}
