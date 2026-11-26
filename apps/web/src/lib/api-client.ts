/**
 * 前端组件专用 HTTP 客户端。
 * 组件不许手写 fetch，统一走这里；接口路径和 docs/api/接口契约.md 一一对应。
 */
import type { CreateLostFoundInput } from "./data/lost-found";
import type { CreateAnswerInput, CreateQuestionInput } from "./data/qa";
import type { CreateTaskInput } from "./data/tasks";
import type {
  Answer,
  LostFound,
  LostFoundStatus,
  Question,
  QuestionStatus,
  Task,
  TaskStatus,
} from "./types";

export interface ApiEnvelope<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

export interface UploadLostFoundImagesResult {
  urls: string[];
  storage: "supabase" | "demo";
}

async function parseEnvelope<T>(res: Response): Promise<ApiEnvelope<T>> {
  const text = await res.text();
  if (!text) {
    return {
      data: null,
      error: {
        code: `HTTP_${res.status}`,
        message: `服务返回空响应（${res.status}）`,
      },
    };
  }
  const parsed = JSON.parse(text) as ApiEnvelope<T>;
  if (!res.ok && !parsed.error) {
    return {
      data: null,
      error: {
        code: `HTTP_${res.status}`,
        message: `请求失败（${res.status}）`,
      },
    };
  }
  return parsed;
}

async function request<T>(
  url: string,
  method: "GET" | "POST" | "PATCH",
  body?: unknown
): Promise<ApiEnvelope<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return await parseEnvelope<T>(res);
  } catch {
    return {
      data: null,
      error: { code: "NETWORK", message: "网络请求失败，请稍后再试" },
    };
  }
}

export function apiCreateTask(input: CreateTaskInput) {
  return request<Task>("/api/tasks", "POST", input);
}

export function apiUpdateTaskStatus(id: string, status: TaskStatus) {
  return request<Task>("/api/tasks/" + encodeURIComponent(id) + "/status", "PATCH", {
    status,
  });
}

export function apiCreateQuestion(input: CreateQuestionInput) {
  return request<Question>("/api/questions", "POST", input);
}

export function apiUpdateQuestionStatus(id: string, status: QuestionStatus) {
  return request<Question>("/api/questions/" + encodeURIComponent(id), "PATCH", {
    status,
  });
}

export function apiCreateAnswer(questionId: string, input: CreateAnswerInput) {
  return request<Answer>(
    "/api/questions/" + encodeURIComponent(questionId) + "/answers",
    "POST",
    input
  );
}

export function apiCreateLostFound(input: CreateLostFoundInput) {
  return request<LostFound>("/api/lost-found", "POST", input);
}

export function apiUpdateLostFoundStatus(id: string, status: LostFoundStatus) {
  return request<LostFound>(
    "/api/lost-found/" + encodeURIComponent(id),
    "PATCH",
    { status }
  );
}

export async function apiUploadLostFoundImages(
  files: File[]
): Promise<ApiEnvelope<UploadLostFoundImagesResult>> {
  try {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    const res = await fetch("/api/uploads/lost-found", {
      method: "POST",
      body: formData,
    });
    return await parseEnvelope<UploadLostFoundImagesResult>(res);
  } catch {
    return {
      data: null,
      error: { code: "NETWORK", message: "图片上传失败，请检查网络后重试" },
    };
  }
}

export interface InternalResult {
  message: string;
  text?: string;
  sent?: boolean;
  openCount?: number;
  added?: number;
  archived?: number;
}

export function apiRunInternal(name: "archive" | "crawl" | "digest") {
  return request<InternalResult>("/api/internal/" + name, "POST", {});
}
