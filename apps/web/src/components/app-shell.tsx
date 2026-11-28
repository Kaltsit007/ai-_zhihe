"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Icon, type IconName } from "./icon";
import { cn } from "@/lib/utils";
import { AuthStatus } from "./auth-status";

const navItems: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/", label: "总览", icon: "home" },
  { href: "/tasks", label: "委托", icon: "tasks" },
  { href: "/map", label: "地图", icon: "map" },
  { href: "/qa", label: "答疑", icon: "qa" },
  { href: "/info", label: "学校信息", icon: "info" },
  { href: "/lost-found", label: "失物招领", icon: "lost" },
  { href: "/admin", label: "管理", icon: "admin" },
];

function getTitle(pathname: string) {
  if (pathname === "/") return "总览";
  if (pathname.startsWith("/tasks/new")) return "发布委托";
  if (pathname.startsWith("/tasks/")) return "委托详情";
  if (pathname.startsWith("/tasks")) return "委托广场";
  if (pathname.startsWith("/map")) return "地图可视化";
  if (pathname.startsWith("/qa")) return "答疑";
  if (pathname.startsWith("/info")) return "学校信息";
  if (pathname.startsWith("/lost-found")) return "失物招领";
  if (pathname.startsWith("/admin")) return "管理";
  return "互助地图";
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function HeaderSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const searchRef = useRef<HTMLInputElement>(null);

  // 桌面端按 / 聚焦搜索框；在输入框、文本域里不抢键。
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (!searchRef.current) return;
      event.preventDefault();
      searchRef.current.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = query.trim();
    router.push(keyword ? "/tasks?q=" + encodeURIComponent(keyword) : "/tasks");
  }

  return (
    <form onSubmit={submitSearch} className="hidden md:block">
      <label className="flex h-10 w-64 items-center gap-2 rounded-xl border border-emerald-950/10 bg-white/70 px-3 text-slate-400 shadow-sm">
        <Icon name="search" className="h-4 w-4" />
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="搜索委托标题、地点、标签"
          aria-label="搜索委托"
        />
        <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-400">
          /
        </kbd>
      </label>
    </form>
  );
}

function HeaderSearchSlot() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  return <HeaderSearch key={initialQuery} initialQuery={initialQuery} />;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <div className="min-h-screen text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-emerald-950/5 bg-white/60 backdrop-blur-xl lg:flex">
        <Link href="/" className="flex items-center gap-3 px-6 py-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f5132] text-white shadow-lg shadow-emerald-900/20">
            <Icon name="pin" className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-base font-semibold tracking-tight">
              互助地图
            </span>
            <span className="block text-xs text-slate-500">
              校园综合互助平台
            </span>
          </span>
        </Link>

        <div className="px-4">
          <div className="mb-3 flex items-center justify-between px-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            <span>工作台</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs tracking-normal text-emerald-700">
              P0
            </span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-[#0f5132] text-white shadow-sm shadow-emerald-900/20"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                  )}
                >
                  <Icon name={item.icon} className="h-[18px] w-[18px]" />
                  <span className="font-medium">{item.label}</span>
                  {item.href === "/lost-found" ? (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-xs",
                        active
                          ? "bg-white/15 text-white"
                          : "bg-rose-50 text-rose-600"
                      )}
                    >
                      7
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-emerald-900/5 bg-gradient-to-br from-emerald-50 to-white p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
              <Icon name="spark" className="h-4 w-4" />
              P0 目标
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              先跑通委托闭环，再接答疑、失物招领和机器人。
            </p>
          </div>
          <AuthStatus />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-emerald-950/5 bg-[#f4f6f2]/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f5132] text-white">
                <Icon name="pin" className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold">互助地图</span>
            </Link>

            <div className="hidden min-w-0 lg:block">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                互助地图 / {title}
              </p>
              <p className="truncate text-sm font-medium text-slate-700">
                校园综合互助平台
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Suspense
                fallback={
                  <div className="hidden h-10 w-64 rounded-xl bg-white/50 md:block" aria-hidden />
                }
              >
                <HeaderSearchSlot />
              </Suspense>
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-950/10 bg-white/70 text-slate-500 shadow-sm transition hover:text-emerald-700"
                aria-label="通知"
              >
                <Icon name="bell" className="h-[18px] w-[18px]" />
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
              </button>
              <Link
                href="/tasks/new"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f5132] px-4 text-sm font-medium text-white shadow-sm shadow-emerald-900/20 transition hover:bg-[#0b3f27]"
              >
                <Icon name="plus" className="h-4 w-4" />
                <span className="hidden sm:inline">发布委托</span>
              </Link>
            </div>
          </div>

          <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-2 text-xs font-medium transition",
                    active
                      ? "bg-[#0f5132] text-white"
                      : "bg-white/70 text-slate-500"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}