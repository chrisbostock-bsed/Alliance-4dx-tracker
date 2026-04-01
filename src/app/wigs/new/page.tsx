"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Select";
import { Target } from "lucide-react";

function NewWigForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSchoolId = searchParams.get("schoolId") ?? "";

  const [schools, setSchools] = useState<{ id: string; name: string; shortName: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "ACADEMIC",
    baselineValue: "",
    targetValue: "",
    unit: "%",
    targetDate: "",
    schoolId: preselectedSchoolId,
    teamId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/schools").then(r => r.json()).then(setSchools);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/wigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create WIG");
        return;
      }
      const wig = await res.json();
      router.push(`/wigs/${wig.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-2">
        <Link href="/wigs" className="text-sm text-[#003366] hover:underline">← WIGs</Link>
      </div>
      <PageHeader
        title="Create New WIG"
        subtitle="Define a Wildly Important Goal using the From X to Y by When framework"
      />

      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* WIG statement helper */}
            <div className="bg-[#003366]/5 rounded-xl p-4 border border-[#003366]/10 mb-6">
              <div className="flex items-start gap-3">
                <Target size={18} className="text-[#003366] mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-[#003366]">WIG Formula</p>
                  <p className="text-slate-600 mt-0.5">
                    <em>"Move [measure] from X to Y by [date]"</em><br />
                    Example: <em>"Move ELA proficiency from 42% to 65% by June 2025"</em>
                  </p>
                </div>
              </div>
            </div>

            <Input
              label="WIG Title *"
              placeholder="Move ELA proficiency from 42% to 65% by June 2025"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              required
            />

            <Textarea
              label="Description"
              placeholder="Additional context about this goal..."
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={2}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="School *"
                value={form.schoolId}
                onChange={e => set("schoolId", e.target.value)}
                required
                options={[
                  { value: "", label: "Select a school..." },
                  ...schools.map(s => ({ value: s.id, label: s.shortName })),
                ]}
              />
              <Select
                label="Category *"
                value={form.category}
                onChange={e => set("category", e.target.value)}
                options={[
                  { value: "ACADEMIC", label: "Academic" },
                  { value: "ATTENDANCE", label: "Attendance" },
                  { value: "TEACHER", label: "Teacher / Staff" },
                  { value: "OPERATIONAL", label: "Operational" },
                ]}
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">From X → to Y</p>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Baseline (From)"
                  type="number"
                  step="any"
                  placeholder="42"
                  value={form.baselineValue}
                  onChange={e => set("baselineValue", e.target.value)}
                  required
                />
                <Input
                  label="Target (To)"
                  type="number"
                  step="any"
                  placeholder="65"
                  value={form.targetValue}
                  onChange={e => set("targetValue", e.target.value)}
                  required
                />
                <Input
                  label="Unit"
                  placeholder="% or students"
                  value={form.unit}
                  onChange={e => set("unit", e.target.value)}
                  required
                />
              </div>
            </div>

            <Input
              label="Target Date (By When) *"
              type="date"
              value={form.targetDate}
              onChange={e => set("targetDate", e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create WIG"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewWigPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading...</div>}>
      <NewWigForm />
    </Suspense>
  );
}
