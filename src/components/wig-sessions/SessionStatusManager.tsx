"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Play, CheckCircle, X } from "lucide-react";

interface Props {
  sessionId: string;
  currentStatus: string;
}

export function SessionStatusManager({ sessionId, currentStatus }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const updateStatus = async (status: string) => {
    setSaving(true);
    await fetch(`/api/wig-sessions/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    router.refresh();
  };

  if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED") return null;

  return (
    <div className="flex gap-2">
      {currentStatus === "SCHEDULED" && (
        <Button onClick={() => updateStatus("IN_PROGRESS")} disabled={saving} size="sm" variant="secondary">
          <Play size={14} /> Start Session
        </Button>
      )}
      {currentStatus === "IN_PROGRESS" && (
        <Button onClick={() => updateStatus("COMPLETED")} disabled={saving} size="sm">
          <CheckCircle size={14} /> Complete Session
        </Button>
      )}
      {currentStatus !== "CANCELLED" && (
        <Button onClick={() => updateStatus("CANCELLED")} disabled={saving} size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
          <X size={14} /> Cancel
        </Button>
      )}
    </div>
  );
}
