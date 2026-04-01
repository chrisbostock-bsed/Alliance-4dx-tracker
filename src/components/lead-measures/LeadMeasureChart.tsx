"use client";

import { LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer } from "recharts";
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

export function LeadMeasureChart({ entries, target, unit }: Props) {
  const data = entries.map(e => ({
    date: formatDate(e.recordedAt),
    value: e.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          formatter={(v) => [`${v} ${unit}`, "Value"]}
        />
        <ReferenceLine y={target} stroke="#22c55e" strokeDasharray="4 2" strokeWidth={1.5} />
        <Line type="monotone" dataKey="value" stroke="#003366" strokeWidth={2} dot={{ r: 3, fill: "#003366" }} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
