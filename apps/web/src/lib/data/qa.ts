/** 答疑数据接口。C 负责换成 Supabase。 */
import type { Question, QuestionStatus } from "@/lib/types";
import { store } from "./store";

export interface QuestionFilters {
  keyword?: string;
  status?: QuestionStatus;
}

export interface CreateQuestionInput {
  title: string;
  excerpt: string;
  tags: string[];
}

export async function listQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
  let result = [...store.questions];
  if (filters.status) {
    result = result.filter((question) => question.status === filters.status);
  }
  if (filters.keyword) {
    const keyword = filters.keyword.trim().toLowerCase();
    result = result.filter((question) =>
      [question.title, question.excerpt, ...question.tags]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }
  return result;
}

export async function getQuestion(id: string): Promise<Question | undefined> {
  return store.questions.find((question) => question.id === id);
}

export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  const question: Question = {
    id: "q" + Date.now().toString(36),
    title: input.title,
    excerpt: input.excerpt,
    tags: input.tags,
    author: "当前用户",
    answers: 0,
    views: 1,
    status: "open",
    time: "刚刚",
  };
  store.questions = [question, ...store.questions];
  return question;
}
