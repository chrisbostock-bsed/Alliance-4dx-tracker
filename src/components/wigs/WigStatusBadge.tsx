import { calcProgress, getStatusLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WigStatusBadgeProps {
  baseline: number;
  current: number;
  target: number;
  className?: string;
}

export function WigStatusBadge({ baseline, current, target, className }: WigStatusBadgeProps) {
  const progress = calcProgress(baseline, current, target);
  const label = getStatusLabel(progress);

  const styles =
    progress >= 80 ? "bg-green-100 text-green-800 border-green-200" :
    progress >= 50 ? "bg-amber-100 text-amber-800 border-amber-200" :
    "bg-red-100 text-red-800 border-red-200";

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles, className)}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full mr-1.5",
        progress >= 80 ? "bg-green-500" : progress >= 50 ? "bg-amber-500" : "bg-red-500"
      )} />
      {label}
    </span>
  );
}
