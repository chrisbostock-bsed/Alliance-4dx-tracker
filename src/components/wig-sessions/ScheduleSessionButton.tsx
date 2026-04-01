"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Select";

export function ScheduleSessionButton({ wigId, schoolId }: { wigId: string; schoolId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", scheduledAt: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/wig-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, wigId, schoolId }),
    });
    if (res.ok) {
      const session = await res.json();
      setOpen(false);
      router.push(`/wig-sessions/${session.id}`);
    }
    setSaving(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-[#003366] text-[#003366] px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#003366]/5 transition-colors"
      >
        <Calendar size={15} />
        Schedule Session
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Schedule WIG Session">
        <div className="space-y-4">
          <Input label="Session Title (optional)" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Week 12 WIG Session" />
          <Input label="Date & Time *" type="datetime-local" value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} required />
          <Input label="Notes (optional)" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Agenda or context..." />
          <div className="flex gap-3">
            <Button onClick={save} disabled={saving || !form.scheduledAt} className="flex-1">{saving ? "Scheduling..." : "Schedule Session"}</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
