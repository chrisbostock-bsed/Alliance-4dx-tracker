import { calcProgress, formatValue } from "@/lib/utils";

interface WigProgressGaugeProps {
  baseline: number;
  current: number;
  target: number;
  unit: string;
  size?: number;
}

export function WigProgressGauge({ baseline, current, target, unit, size = 120 }: WigProgressGaugeProps) {
  const progress = calcProgress(baseline, current, target);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  const color = progress >= 80 ? "#22c55e" : progress >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="text-center -mt-[calc(var(--s)/2)]" style={{ marginTop: -(size / 2 + 8) }}>
        <p className="text-xl font-bold text-slate-900" style={{ lineHeight: 1 }}>{progress}%</p>
        <p className="text-xs text-slate-500 mt-0.5">of goal</p>
      </div>
    </div>
  );
}
