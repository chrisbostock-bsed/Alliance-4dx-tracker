import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatDateTime } from "@/lib/utils";
import { WIG_CATEGORY_LABELS, WIG_CATEGORY_COLORS, COMMITMENT_STATUS_LABELS, COMMITMENT_STATUS_COLORS } from "@/lib/constants";
import { SessionStatusManager } from "@/components/wig-sessions/SessionStatusManager";
import { CommitmentManager } from "@/components/wig-sessions/CommitmentManager";
import { Calendar, Target, ArrowLeft, School, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WigSessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;

  const session = await prisma.wigSession.findUnique({
    where: { id: sessionId },
    include: {
      wig: {
        include: {
          school: true,
          leadMeasures: {
            where: { isActive: true },
            include: { entries: { orderBy: { recordedAt: "desc" }, take: 4 } },
          },
        },
      },
      school: true,
      commitments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!session) notFound();

  const keptCount = session.commitments.filter(c => c.status === "KEPT").length;
  const totalCount = session.commitments.filter(c => c.status !== "PENDING").length;

  return (
    <div className="p-8">
      <div className="mb-2">
        <Link href="/wig-sessions" className="text-sm text-[#003366] hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> WIG Sessions
        </Link>
      </div>

      <PageHeader
        title={session.title ?? "WIG Session"}
        subtitle={`${session.school.shortName} · ${formatDateTime(session.scheduledAt)}`}
        action={<SessionStatusManager sessionId={session.id} currentStatus={session.status} />}
      />

      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${WIG_CATEGORY_COLORS[session.wig.category]}`}>
          {WIG_CATEGORY_LABELS[session.wig.category]}
        </span>
        <span className="text-sm text-slate-500 flex items-center gap-1.5">
          <Target size={14} />
          <Link href={`/wigs/${session.wig.id}`} className="hover:text-[#003366] hover:underline truncate max-w-xs">
            {session.wig.title}
          </Link>
        </span>
        {session.conductedAt && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar size={12} /> Conducted: {formatDate(session.conductedAt)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {/* Accountability scoreboard */}
          {totalCount > 0 && (
            <Card className="mb-4 bg-[#003366] text-white border-0">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-[#c9a84c]" />
                    <span className="font-semibold">Accountability Score</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{keptCount}/{totalCount}</p>
                    <p className="text-xs text-blue-200">commitments kept</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c9a84c] rounded-full transition-all"
                    style={{ width: `${totalCount > 0 ? (keptCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Commitments */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Users size={16} className="text-[#003366]" />
                Commitments
              </h2>
            </CardHeader>
            <CardContent className="pt-0">
              <CommitmentManager
                sessionId={session.id}
                commitments={session.commitments}
                sessionStatus={session.status}
              />
            </CardContent>
          </Card>
        </div>

        {/* Lead Measures snapshot */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Lead Measure Snapshot</h2>
          <Card>
            {session.wig.leadMeasures.length === 0 ? (
              <EmptyState title="No lead measures" description="Add lead measures to the WIG to track here." />
            ) : (
              <div className="divide-y divide-slate-100">
                {session.wig.leadMeasures.map((lm) => {
                  const recent = lm.entries.slice(0, 4).reverse();
                  return (
                    <div key={lm.id} className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800 mb-1">{lm.title}</p>
                      <p className="text-xs text-slate-500 mb-2">Target: {lm.targetValue} {lm.unit}</p>
                      {recent.length > 0 ? (
                        <div className="flex gap-1.5">
                          {recent.map((entry, i) => (
                            <div key={i} className={`flex-1 text-center rounded py-1 text-xs font-medium ${
                              entry.value >= lm.targetValue ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {entry.value}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No entries yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {session.notes && (
            <Card className="mt-4">
              <CardContent className="py-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Session Notes</p>
                <p className="text-sm text-slate-700">{session.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
