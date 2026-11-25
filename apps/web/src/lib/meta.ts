import type {
  InfoCategory,
  LostFoundStatus,
  LostFoundType,
  TaskCategory,
  TaskStatus,
} from "./types";

export const categoryMeta: Record<
  TaskCategory,
  { label: string; short: string; dot: string; soft: string; text: string }
> = {
  team: {
    label: "竞赛组队",
    short: "组队",
    dot: "bg-violet-500",
    soft: "bg-violet-50",
    text: "text-violet-700",
  },
  carpool: {
    label: "拼车同行",
    short: "拼车",
    dot: "bg-sky-500",
    soft: "bg-sky-50",
    text: "text-sky-700",
  },
  moving: {
    label: "搬运行李",
    short: "搬运",
    dot: "bg-amber-500",
    soft: "bg-amber-50",
    text: "text-amber-700",
  },
  volunteer: {
    label: "志愿招募",
    short: "志愿",
    dot: "bg-emerald-500",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
  },
  club: {
    label: "社团招新",
    short: "社团",
    dot: "bg-rose-500",
    soft: "bg-rose-50",
    text: "text-rose-700",
  },
  other: {
    label: "其他互助",
    short: "其他",
    dot: "bg-slate-500",
    soft: "bg-slate-50",
    text: "text-slate-700",
  },
};

export const statusMeta: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "待接单",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  in_progress: {
    label: "进行中",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  completed: {
    label: "已完成",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  cancelled: {
    label: "已取消",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  archived: {
    label: "已归档",
    className: "bg-zinc-100 text-zinc-500 ring-zinc-200",
  },
};

export const lostTypeMeta: Record<
  LostFoundType,
  { label: string; className: string }
> = {
  lost: {
    label: "寻物",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  found: {
    label: "招领",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};

export const lostStatusMeta: Record<
  LostFoundStatus,
  { label: string; className: string }
> = {
  open: {
    label: "进行中",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  claimed: {
    label: "已认领",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  closed: {
    label: "已关闭",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

export const infoCategoryMeta: Record<
  InfoCategory,
  { className: string; dot: string }
> = {
  教务: {
    className: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
  },
  生活: {
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  场馆: {
    className: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
  },
  奖助: {
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  就业: {
    className: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
  其他: {
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-500",
  },
};
