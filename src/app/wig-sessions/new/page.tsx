"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Select";

function NewWigSessionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSchoolId = searchParams.get("schoolId") ?? "";
  const preselectedWigId = searchParams.get("wigId") ?? "";

  const [schools, setSchools] = useState<{ id: string; shortName: string }[]>([]);
  const [wigs, setWigs] = useState<{ id: string; title: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    schoolId: preselectedSchoolId,
    wigId: preselectedWigId,
    scheduledAt: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/schools").then(r => r.json()).then(setSchools);
  }, []);

  useEffect(() => {
    if (form.schoolId) {
      fetch(`/api/wigs?schoolId=${form.schoolId}`).then(r => r.json()).then(setWigs);
    } else {
      fetch("/api/wigs").then(r => r.json()).then(setWigs);
    }
  }, [form.schoolId]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/wig-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed");
    } else {
      const session = await res.json();
      router.push(`/wig-sessions/${session.id}`);
    }
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-2">
        <Link href="/wig-sessions" className="text-sm text-[#003366] hover:underline">← WIG Sessions</Link>
      </div>
      <PageHeader title="Schedule WIG Session" subtitle="Set up a weekly accountability meeting" />
      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Session Title (optional)" placeholder="Week 12 WIG Session" value={form.title} onChange={e => set("title", e.target.value)} />
            <Select
              label="School *"
              value={form.schoolId}
              onChange={e => set("schoolId", e.target.value)}
              required
              options={[{ value: "", label: "Select school..." }, ...schools.map(s => ({ value: s.id, label: s.shortName }))]}
            />
            <Select
              label="WIG *"
              value={form.wigId}
              onChange={e => set("wigId", e.target.value)}
              required
              options={[{ value: "", label: "Select WIG..." }, ...wigs.map(w => ({ value: w.id, label: w.title.length > 60 ? w.title.slice(0, 60) + "…" : w.title }))]}
            />
            <Input label="Date & Time *" type="datetime-local" value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} required />
            <Input label="Notes (optional)" placeholder="Agenda or context..." value={form.notes} onChange={e => set("notes", e.target.value)} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">{saving ? "Scheduling..." : "Schedule Session"}</Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewWigSessionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading...</div>}>
      <NewWigSessionForm />
    </Suspense>
  );
}
