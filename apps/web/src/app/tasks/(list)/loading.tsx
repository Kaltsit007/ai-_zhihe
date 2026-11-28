export default function TasksLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="委托列表加载中">
      <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200/70" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded-lg bg-slate-100" />
      <div className="grid gap-2 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card h-[62px] animate-pulse bg-slate-100/70" />
        ))}
      </div>
      <div className="card h-[92px] animate-pulse bg-slate-100/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card h-64 animate-pulse bg-slate-100/70" />
        ))}
      </div>
    </div>
  );
}
