import { cn } from "@/lib/utils";
import { statusMeta } from "@/lib/meta";
import type { TaskStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        meta.className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}
