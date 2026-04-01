import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { WigStatusBadge } from "@/components/wigs/WigStatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { calcProgress, formatValue, formatDate } from "@/lib/utils";
import { WIG_CATEGORY_LABELS, WIG_CATEGORY_COLORS, SESSION_STATUS_LABELS } from "@/lib/constants";
import { Target, Calendar, Plus, MapPin, BookOpen, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function SchoolDetailPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await params;

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      wigs: {
        include: {
          leadMeasures: { where: { isActive: true } },
          _count: { select: { wigSessions: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      wigSessions: {
        include: {
          wig: { select: { title: true, category: true } },
          _count: { select: { commitments: true } },
        },
        orderBy: { scheduledAt: "desc" },
        take: 10,
      },
      teams: true,
    },
  });

  if (!school) notFound();

  const activeWigs = school.wigs.filter(w => w.status === "ACTIVE");

  return (
    <div className="p-8">
      <div className="mb-2">
        <Link href="/schools" className="text-sm text-[#003366] hover:underline">← Schools</Link>
      </div>
      <PageHeader
        title={school.shortName}
        subtitle={school.name}
        action={
          <Link
            href={`/wigs/new?schoolId=${school.id}`}
            className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002244] transition-colors"
          >
            <Plus size={16} />
            New WIG
          </Link>
        }
      />

      {/* School meta */}
      <div className="flex items-center gap-4 text-sm text-slate-500 mb-8">
        {school.location && (
          <span className="flex items-center gap-1.5"><MapPin size={14} /> {school.location}</span>
        )}
        {school.gradeSpan && (
          <span className="flex items-center gap-1.5"><BookOpen size={14} /> Grades {school.gradeSpan}</span>
        )}
        <span className="flex items-center gap-1.5"><Target size={14} /> {activeWigs.length} active WIG{activeWigs.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* WIGs */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">WIGs</h2>

          {school.wigs.length === 0 ? (
            <Card>
              <EmptyState
                title="No WIGs yet"
                description="Create the first Wildly Important Goal for this school."
                action={
                  <Link href={`/wigs/new?schoolId=${school.id}`} className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium">
                    <Plus size={16} /> Create WIG
                  </Link>
                }
                icon={<Target size={48} />}
              />
            </Card>
          ) : (
            school.wigs.map((wig) => {
              const progress = calcProgress(wig.baselineValue, wig.currentValue, wig.targetValue);
              return (
                <Link key={wig.id} href={`/wigs/${wig.id}`}>
                  <Card className="hover:shadow-md transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${WIG_CATEGORY_COLORS[wig.category]}`}>
                              {WIG_CATEGORY_LABELS[wig.category]}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${wig.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                              {wig.status}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-900 text-sm">{wig.title}</h3>
                        </div>
                        <WigStatusBadge baseline={wig.baselineValue} current={wig.currentValue} target={wig.targetValue} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-xs text-slate-500">{formatValue(wig.baselineValue, wig.unit)}</span>
                        <div className="flex-1">
                          <ProgressBar value={progress} showLabel />
                        </div>
                        <span className="text-xs text-slate-500">{formatValue(wig.targetValue, wig.unit)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Current: <strong className="text-slate-700">{formatValue(wig.currentValue, wig.unit)}</strong></span>
                        <span>Target: {formatDate(wig.targetDate)}</span>
                        <span>{wig.leadMeasures.length} lead measures</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        {/* Sessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800">Recent Sessions</h2>
            <Link href={`/wig-sessions/new?schoolId=${school.id}`} className="text-sm text-[#003366] hover:underline flex items-center gap-1">
              <Plus size={14} /> Schedule
            </Link>
          </div>
          <Card>
            {school.wigSessions.length === 0 ? (
              <EmptyState title="No sessions yet" description="Schedule your first WIG session." />
            ) : (
              <div className="divide-y divide-slate-100">
                {school.wigSessions.map((session) => (
                  <Link key={session.id} href={`/wig-sessions/${session.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#003366]/10 flex items-center justify-center flex-shrink-0">
                      <Calendar size={14} className="text-[#003366]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{session.title ?? "WIG Session"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(session.scheduledAt)} · {session._count.commitments} commitments
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      session.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      session.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {SESSION_STATUS_LABELS[session.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
