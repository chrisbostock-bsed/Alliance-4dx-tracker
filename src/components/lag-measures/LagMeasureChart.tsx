"use client";

import { AreaChart, Area, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer } from "recharts";
import { formatDate } from "@/lib/utils";

interface Entry {
  recordedAt: Date | string;
  value: number;
}

interface Props {
  entries: Entry[];
  target: number;
  unit: string;
}

export function LagMeasureChart({ entries, target, unit }: Props) {
  const data = entries.map(e => ({
    date: formatDate(e.recordedAt),
    value: e.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={100}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="lagGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#003366" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#003366" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          formatter={(v) => [`${v} ${unit}`, "Value"]}
        />
        <ReferenceLine y={target} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1.5} />
        <Area type="monotone" dataKey="value" stroke="#003366" strokeWidth={2} fill="url(#lagGrad)" dot={{ r: 3, fill: "#003366" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
