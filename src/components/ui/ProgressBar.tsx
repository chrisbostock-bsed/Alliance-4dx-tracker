import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, className, color, showLabel = false }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const barColor = color ?? (pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-600 w-9 text-right">{Math.round(pct)}%</span>
      )}
    </div>
  );
}
