export type TaskCategory =
  | "team"
  | "carpool"
  | "moving"
  | "volunteer"
  | "club"
  | "other";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "archived";

export type LostFoundType = "lost" | "found";
export type LostFoundStatus = "open" | "claimed" | "closed";
export type QuestionStatus = "open" | "solved";

export type InfoCategory =
  | "教务"
  | "生活"
  | "场馆"
  | "奖助"
  | "就业"
  | "其他";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  deadline: string;
  status: TaskStatus;
  author: string;
  contact: string;
  tags: string[];
  urgent?: boolean;
  pin: { x: number; y: number };
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  author: string;
  answers: number;
  views: number;
  status: QuestionStatus;
  time: string;
}

/** 回答：C 在 D2 实现 /api/questions/:id/answers 时启用 */
export interface Answer {
  id: string;
  questionId: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface SchoolInfo {
  id: string;
  title: string;
  category: InfoCategory;
  summary: string;
  source: string;
  updatedAt: string;
}

export interface LostFound {
  id: string;
  type: LostFoundType;
  title: string;
  location: string;
  time: string;
  status: LostFoundStatus;
  description: string;
  contact: string;
  color: string;
  images?: string[];
}
