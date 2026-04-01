"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Select";

export default function NewSchoolPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", shortName: "", location: "Los Angeles, CA", gradeSpan: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to create school");
    } else {
      const school = await res.json();
      router.push(`/schools/${school.id}`);
    }
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-2">
        <Link href="/schools" className="text-sm text-[#003366] hover:underline">← Schools</Link>
      </div>
      <PageHeader title="Add School" subtitle="Add a new Alliance campus" />
      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full School Name *" placeholder="Alliance Patti & Peter Neuwirth Leadership Academy" value={form.name} onChange={e => set("name", e.target.value)} required />
            <Input label="Short Name *" placeholder="Neuwirth" value={form.shortName} onChange={e => set("shortName", e.target.value)} required />
            <Input label="Location" placeholder="Los Angeles, CA" value={form.location} onChange={e => set("location", e.target.value)} />
            <Input label="Grade Span" placeholder="6-12 or 9-12" value={form.gradeSpan} onChange={e => set("gradeSpan", e.target.value)} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">{saving ? "Adding..." : "Add School"}</Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
