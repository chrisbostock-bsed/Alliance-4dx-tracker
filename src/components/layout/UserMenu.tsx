"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, ChevronDown } from "lucide-react";

interface Props {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}

export function UserMenu({ name, email, image }: Props) {
  const [open, setOpen] = useState(false);
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
      >
        {image ? (
          <img src={image} alt={name ?? ""} className="w-7 h-7 rounded-full flex-shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center flex-shrink-0 text-[#003366] text-xs font-bold">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">{name ?? email}</p>
          {name && <p className="text-blue-300 text-xs truncate">{email}</p>}
        </div>
        <ChevronDown size={14} className={`text-blue-300 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
              <p className="text-xs text-slate-500 truncate">{email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
