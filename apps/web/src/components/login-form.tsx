"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "signin" | "signup";

export function LoginForm({
  configured,
  next,
  initialError,
}: {
  configured: boolean;
  next: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(
    initialError === "callback" ? "登录链接已失效，请重新登录。" : ""
  );
  const [pending, setPending] = useState(false);

  if (!configured) {
    return (
      <div className="card p-6">
        <p className="text-sm font-medium text-slate-700">当前是演示模式</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          还没有配置 Supabase 环境变量，登录功能不可用。页面仍可正常浏览和操作（数据存在内存里，重启会重置）。
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-[#0f5132] px-4 text-sm font-medium text-white"
        >
          返回首页
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setPending(true);
    setMessage("");

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setPending(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("注册成功，请到邮箱点击确认链接后再登录。");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={
            "flex-1 rounded-lg py-2 transition " +
            (mode === "signin" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500")
          }
        >
          登录
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={
            "flex-1 rounded-lg py-2 transition " +
            (mode === "signup" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500")
          }
        >
          注册
        </button>
      </div>

      <label className="block text-xs font-medium text-slate-600">
        邮箱
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@cumt.edu.cn"
          className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400"
        />
      </label>

      <label className="block text-xs font-medium text-slate-600">
        密码
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="至少 6 位"
          className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400"
        />
      </label>

      {message ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-xl bg-[#0f5132] text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "处理中…" : mode === "signin" ? "登录" : "注册"}
      </button>
    </form>
  );
}
