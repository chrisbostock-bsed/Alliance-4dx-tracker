"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Select";

export function AddLeadEntryButton({ measureId }: { measureId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/lead-measures/${measureId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: parseFloat(value), notes }),
    });
    setSaving(false);
    setOpen(false);
    setValue("");
    setNotes("");
    router.refresh();
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-[#003366] border border-[#003366]/20 px-2 py-1 rounded-lg hover:bg-[#003366]/5 font-medium flex-shrink-0">
        <Plus size={12} /> Log
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Log Lead Measure Entry">
        <div className="space-y-4">
          <Input label="Value *" type="number" step="any" value={value} onChange={e => setValue(e.target.value)} placeholder="2.0" autoFocus />
          <Input label="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Context or explanation..." />
          <div className="flex gap-3">
            <Button onClick={save} disabled={saving || !value} className="flex-1">{saving ? "Saving..." : "Log Entry"}</Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
