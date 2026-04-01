"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Select";

export function AddLagMeasureButton({ wigId }: { wigId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", targetValue: "", unit: "", trackingPeriod: "MONTHLY" });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    await fetch("/api/lag-measures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, wigId }),
    });
    setSaving(false);
    setOpen(false);
    setForm({ title: "", targetValue: "", unit: "", trackingPeriod: "MONTHLY" });
    router.refresh();
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-medium">
        <Plus size={13} /> Add
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Lag Measure">
        <div className="space-y-4">
          <Input label="Title *" value={form.title} onChange={e => set("title", e.target.value)} placeholder="ELA Proficiency Rate (Illuminate)" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Target Value *" type="number" step="any" value={form.targetValue} onChange={e => set("targetValue", e.target.value)} />
            <Input label="Unit *" value={form.unit} onChange={e => set("unit", e.target.value)} placeholder="%" />
          </div>
          <Select
            label="Tracking Period *"
            value={form.trackingPeriod}
            onChange={e => set("trackingPeriod", e.target.value)}
            options={[
              { value: "WEEKLY", label: "Weekly" },
              { value: "MONTHLY", label: "Monthly" },
              { value: "QUARTERLY", label: "Quarterly" },
            ]}
          />
          <div className="flex gap-3">
            <Button onClick={save} disabled={saving} className="flex-1">{saving ? "Saving..." : "Add Lag Measure"}</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
