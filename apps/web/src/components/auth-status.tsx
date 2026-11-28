"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthStatus() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(!configured);

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    supabase.auth
      .getUser()
      .then((result: { data: { user: { email?: string | null } | null } }) => {
        if (!active) return;
        setEmail(result.data.user?.email ?? null);
        setReady(true);
      });

    const { data } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setEmail(session?.user?.email ?? null);
        setReady(true);
      }
    );

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [configured]);

  if (!configured) {
    return (
      <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-400">
        本地数据 · 未接 Supabase
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mt-4 h-10 animate-pulse rounded-xl bg-slate-100" aria-hidden />
    );
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className="mt-4 flex h-10 items-center justify-center rounded-xl bg-[#0f5132] text-xs font-medium text-white"
      >
        登录 / 注册
      </Link>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
        {email.slice(0, 1).toUpperCase()}
      </span>
      <p className="min-w-0 flex-1 truncate text-xs text-slate-600">{email}</p>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-white hover:text-slate-700"
        >
          退出
        </button>
      </form>
    </div>
  );
}
