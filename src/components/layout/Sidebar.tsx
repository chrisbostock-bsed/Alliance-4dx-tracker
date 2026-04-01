"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Users,
  School,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wigs", label: "WIGs", icon: Target },
  { href: "/lead-measures", label: "Lead Measures", icon: TrendingUp },
  { href: "/wig-sessions", label: "WIG Sessions", icon: Users },
  { href: "/schools", label: "Schools", icon: School },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#003366] text-white flex flex-col shadow-xl">
      {/* Logo / Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#c9a84c] flex items-center justify-center font-bold text-[#003366] text-sm flex-shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight">Alliance CRPS</p>
            <p className="text-xs text-blue-200 leading-tight mt-0.5">4DX Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} className={cn(isActive ? "text-[#c9a84c]" : "text-blue-200 group-hover:text-white")} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight size={14} className="text-[#c9a84c]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-blue-300 leading-relaxed">
          Four Disciplines of<br />Execution
        </p>
        <div className="mt-2 space-y-1">
          {["1. Focus on WIGs", "2. Lead Measures", "3. Scoreboard", "4. Accountability"].map((d) => (
            <p key={d} className="text-xs text-blue-400">{d}</p>
          ))}
        </div>
      </div>
    </aside>
  );
}
