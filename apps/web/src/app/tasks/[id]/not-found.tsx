import Link from "next/link";
import { Icon } from "@/components/icon";

export default function TaskNotFound() {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        <Icon name="search" className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-medium text-slate-700">委托不存在或已被删除</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        链接可能过期了，回委托广场看看还在招募的委托。
      </p>
      <Link
        href="/tasks"
        className="mt-5 inline-flex h-9 items-center rounded-xl bg-[#0f5132] px-4 text-xs font-medium text-white transition hover:bg-[#0b3f27]"
      >
        回委托广场
      </Link>
    </div>
  );
}
