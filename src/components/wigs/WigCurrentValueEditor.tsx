"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  wigId: string;
  currentValue: number;
  unit: string;
}

export function WigCurrentValueEditor({ wigId, currentValue, unit }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentValue));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/wigs/${wigId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentValue: parseFloat(value) }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[#003366] transition-colors"
      >
        <Pencil size={11} /> Update value
      </button>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 justify-center">
      <input
        type="number"
        step="any"
        value={value}
        onChange={e => setValue(e.target.value)}
        className="w-24 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
        autoFocus
      />
      <span className="text-xs text-slate-500">{unit}</span>
      <button onClick={save} disabled={saving} className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
        <Check size={14} />
      </button>
      <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
        <X size={14} />
      </button>
    </div>
  );
}
