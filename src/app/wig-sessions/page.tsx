import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { WIG_CATEGORY_COLORS, WIG_CATEGORY_LABELS, SESSION_STATUS_LABELS } from "@/lib/constants";
import { Calendar, Plus, Users, School } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WigSessionsPage() {
  const sessions = await prisma.wigSession.findMany({
    include: {
      wig: { select: { id: true, title: true, category: true } },
      school: { select: { id: true, shortName: true } },
      _count: { select: { commitments: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const upcoming = sessions.filter(s => s.status === "SCHEDULED" || s.status === "IN_PROGRESS");
  const past = sessions.filter(s => s.status === "COMPLETED" || s.status === "CANCELLED");

  return (
    <div className="p-8">
      <PageHeader
        title="WIG Sessions"
        subtitle="Discipline 4: Create a Cadence of Accountability — weekly meetings to review commitments"
        action={
          <Link
            href="/wig-sessions/new"
            className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002244] transition-colors"
          >
            <Plus size={16} />
            Schedule Session
          </Link>
        }
      />

      {sessions.length === 0 ? (
        <Card>
          <EmptyState
            title="No sessions yet"
            description="Schedule your first WIG session to start tracking accountability commitments."
            action={
              <Link href="/wig-sessions/new" className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Plus size={16} /> Schedule Session
              </Link>
            }
            icon={<Calendar size={48} />}
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h2>
              <div className="space-y-3">
                {upcoming.map(session => <SessionRow key={session.id} session={session} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Past ({past.length})</h2>
              <div className="space-y-3">
                {past.map(session => <SessionRow key={session.id} session={session} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function SessionRow({ session }: { session: any }) {
  const statusStyles: Record<string, string> = {
    SCHEDULED: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <Link href={`/wig-sessions/${session.id}`}>
      <Card className="hover:shadow-md transition-all cursor-pointer hover:border-[#003366]/20">
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-10 h-10 rounded-lg bg-[#003366]/10 flex items-center justify-center flex-shrink-0">
            <Calendar size={18} className="text-[#003366]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-slate-900 text-sm">{session.title ?? "WIG Session"}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[session.status]}`}>
                {SESSION_STATUS_LABELS[session.status]}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><School size={11} /> {session.school.shortName}</span>
              <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(session.scheduledAt)}</span>
              <span className="flex items-center gap-1"><Users size={11} /> {session._count.commitments} commitment{session._count.commitments !== 1 ? "s" : ""}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{session.wig.title}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${WIG_CATEGORY_COLORS[session.wig.category]}`}>
            {WIG_CATEGORY_LABELS[session.wig.category]}
          </span>
        </div>
      </Card>
    </Link>
  );
}
