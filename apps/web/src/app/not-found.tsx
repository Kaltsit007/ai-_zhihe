import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Icon name="search" className="h-6 w-6" />
      </span>
      <h1 className="mt-5 text-xl font-semibold">页面不存在</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        链接可能写错了，或者这条委托已经被归档。回到首页重新找一下。
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f5132] px-4 text-sm font-medium text-white"
      >
        返回首页
        <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </div>
  );
}
