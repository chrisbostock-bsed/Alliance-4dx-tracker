"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, AlertCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Select";
import { COMMITMENT_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Commitment {
  id: string;
  description: string;
  ownerName: string;
  status: string;
}

interface Props {
  sessionId: string;
  commitments: Commitment[];
  sessionStatus: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock size={14} className="text-slate-400" />,
  KEPT: <Check size={14} className="text-green-600" />,
  MODIFIED: <AlertCircle size={14} className="text-amber-600" />,
  NOT_DONE: <XCircle size={14} className="text-red-600" />,
};

const statusCycle = ["PENDING", "KEPT", "MODIFIED", "NOT_DONE"] as const;

export function CommitmentManager({ sessionId, commitments, sessionStatus }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canEdit = sessionStatus !== "COMPLETED" && sessionStatus !== "CANCELLED";

  const addCommitment = async () => {
    if (!newDesc || !newOwner) return;
    setSaving(true);
    await fetch("/api/commitments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDesc, ownerName: newOwner, sessionId }),
    });
    setSaving(false);
    setNewDesc("");
    setNewOwner("");
    setAdding(false);
    router.refresh();
  };

  const cycleStatus = async (commitment: Commitment) => {
    if (!canEdit) return;
    const current = statusCycle.indexOf(commitment.status as any);
    const next = statusCycle[(current + 1) % statusCycle.length];
    setUpdatingId(commitment.id);
    await fetch(`/api/commitments/${commitment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setUpdatingId(null);
    router.refresh();
  };

  return (
    <div>
      {commitments.length === 0 && !adding ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm mb-3">No commitments yet.</p>
          {canEdit && (
            <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
              <Plus size={14} /> Add Commitment
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {commitments.map((c) => (
            <div
              key={c.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                c.status === "KEPT" ? "bg-green-50 border-green-100" :
                c.status === "MODIFIED" ? "bg-amber-50 border-amber-100" :
                c.status === "NOT_DONE" ? "bg-red-50 border-red-100" :
                "bg-slate-50 border-slate-100"
              )}
            >
              <button
                onClick={() => cycleStatus(c)}
                disabled={!canEdit || updatingId === c.id}
                className={cn(
                  "mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  c.status === "KEPT" ? "border-green-400 bg-green-100" :
                  c.status === "MODIFIED" ? "border-amber-400 bg-amber-100" :
                  c.status === "NOT_DONE" ? "border-red-400 bg-red-100" :
                  "border-slate-200 bg-white",
                  canEdit && "cursor-pointer hover:opacity-80"
                )}
                title={canEdit ? "Click to cycle status" : undefined}
              >
                {statusIcons[c.status]}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800">{c.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-slate-500">{c.ownerName}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    c.status === "KEPT" ? "bg-green-100 text-green-700" :
                    c.status === "MODIFIED" ? "bg-amber-100 text-amber-700" :
                    c.status === "NOT_DONE" ? "bg-red-100 text-red-700" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {COMMITMENT_STATUS_LABELS[c.status]}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {adding && (
            <div className="p-3 rounded-xl border-2 border-dashed border-[#003366]/30 bg-[#003366]/5 space-y-2">
              <Input
                placeholder="Commitment description *"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                autoFocus
              />
              <Input
                placeholder="Owner name *"
                value={newOwner}
                onChange={e => setNewOwner(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addCommitment} disabled={saving || !newDesc || !newOwner}>
                  {saving ? "Adding..." : "Add"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewDesc(""); setNewOwner(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {canEdit && !adding && (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400 hover:border-[#003366]/30 hover:text-[#003366] transition-colors"
            >
              <Plus size={14} /> Add Commitment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
