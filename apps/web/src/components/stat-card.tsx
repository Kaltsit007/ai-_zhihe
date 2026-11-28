import { Icon, type IconName } from "./icon";
import { cn } from "@/lib/utils";

const tones = {
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-700",
  rose: "bg-rose-50 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
};

export function StatCard({
  label,
  value,
  note,
  icon,
  tone = "emerald",
}: {
  label: string;
  value: string;
  note: string;
  icon: IconName;
  tone?: keyof typeof tones;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tones[tone])}>
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <span className="rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-400">P0</span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-xs leading-4 text-slate-400">{note}</p>
    </div>
  );
}
