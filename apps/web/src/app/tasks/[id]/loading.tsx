export default function TaskDetailLoading() {
  return (
    <div className="space-y-5">
      <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200/70" />
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200/70" />
          <div className="mt-4 h-9 w-2/3 animate-pulse rounded-xl bg-slate-200/70" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="grid gap-5 p-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-3">
            <div className="h-5 w-24 animate-pulse rounded bg-slate-200/70" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-100" />
          </div>
          <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
