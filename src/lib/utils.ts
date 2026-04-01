import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function calcProgress(baseline: number, current: number, target: number): number {
  const range = target - baseline;
  if (range === 0) return 100;
  const progress = ((current - baseline) / range) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

export function formatValue(value: number, unit: string): string {
  if (unit === "%") return `${value.toFixed(1)}%`;
  return `${value.toLocaleString()} ${unit}`;
}

export function getStatusColor(progress: number): { bg: string; text: string; border: string } {
  if (progress >= 80) return { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" };
  if (progress >= 50) return { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" };
  return { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" };
}

export function getStatusLabel(progress: number): string {
  if (progress >= 80) return "On Track";
  if (progress >= 50) return "At Risk";
  return "Behind";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function daysUntil(date: Date | string): number {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
