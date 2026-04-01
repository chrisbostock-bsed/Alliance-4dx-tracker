"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Select";

export function AddLeadMeasureButton({ wigId }: { wigId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", targetValue: "", unit: "", trackingPeriod: "WEEKLY" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/lead-measures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, wigId }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed");
    } else {
      setOpen(false);
      setForm({ title: "", description: "", targetValue: "", unit: "", trackingPeriod: "WEEKLY" });
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-[#003366] hover:underline font-medium">
        <Plus size={13} /> Add
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Lead Measure">
        <div className="space-y-4">
          <Input label="Title *" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Teachers complete 2 coaching observations per week" />
          <Textarea label="Description" value={form.description} onChange={e => set("description", e.target.value)} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Target Value *" type="number" step="any" value={form.targetValue} onChange={e => set("targetValue", e.target.value)} placeholder="2" />
            <Input label="Unit *" value={form.unit} onChange={e => set("unit", e.target.value)} placeholder="observations/week" />
          </div>
          <Select
            label="Tracking Period *"
            value={form.trackingPeriod}
            onChange={e => set("trackingPeriod", e.target.value)}
            options={[
              { value: "DAILY", label: "Daily" },
              { value: "WEEKLY", label: "Weekly" },
              { value: "BIWEEKLY", label: "Biweekly" },
              { value: "MONTHLY", label: "Monthly" },
            ]}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button onClick={save} disabled={saving} className="flex-1">{saving ? "Saving..." : "Add Lead Measure"}</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
