import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next || "/";
  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-700">
          Campus mutual help
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">登录互助地图</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          登录后可以发布委托、接单、提问和认领失物。未登录也可以浏览。
        </p>
      </div>
      <LoginForm configured={isSupabaseConfigured()} next={next} initialError={params.error} />
    </main>
  );
}
