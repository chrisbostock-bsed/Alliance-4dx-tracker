import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calcProgress, formatValue, formatDate, daysUntil } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { WigStatusBadge } from "@/components/wigs/WigStatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Target, Calendar, TrendingUp, ArrowRight, School } from "lucide-react";
import { WIG_CATEGORY_LABELS, WIG_CATEGORY_COLORS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [schools, wigs, upcomingSessions] = await Promise.all([
    prisma.school.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.wIG.findMany({
      where: { status: "ACTIVE" },
      include: {
        school: { select: { id: true, shortName: true } },
        leadMeasures: {
          where: { isActive: true },
          include: { entries: { orderBy: { recordedAt: "desc" }, take: 1 } },
        },
        _count: { select: { wigSessions: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.wigSession.findMany({
      where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      include: {
        wig: { select: { title: true, category: true } },
        school: { select: { shortName: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
  ]);

  const totalWigs = wigs.length;
  const onTrackWigs = wigs.filter(w => calcProgress(w.baselineValue, w.currentValue, w.targetValue) >= 80).length;
  const atRiskWigs = wigs.filter(w => {
    const p = calcProgress(w.baselineValue, w.currentValue, w.targetValue);
    return p >= 50 && p < 80;
  }).length;
  const behindWigs = wigs.filter(w => calcProgress(w.baselineValue, w.currentValue, w.targetValue) < 50).length;

  return (
    <div className="p-8">
      <PageHeader
        title="4DX Scoreboard"
        subtitle="Alliance College-Ready Public Schools — Discipline 3: Keep a Compelling Scoreboard"
        action={
          <Link
            href="/wigs/new"
            className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002244] transition-colors"
          >
            <Target size={16} />
            New WIG
          </Link>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active WIGs" value={totalWigs} icon={<Target size={20} />} color="text-[#003366]" bg="bg-blue-50" />
        <StatCard label="On Track" value={onTrackWigs} icon={<span className="text-lg">✓</span>} color="text-green-700" bg="bg-green-50" />
        <StatCard label="At Risk" value={atRiskWigs} icon={<span className="text-lg">!</span>} color="text-amber-700" bg="bg-amber-50" />
        <StatCard label="Behind" value={behindWigs} icon={<span className="text-lg">✗</span>} color="text-red-700" bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* WIG Cards */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Target size={18} className="text-[#003366]" />
            Active WIGs
          </h2>

          {wigs.length === 0 ? (
            <Card>
              <EmptyState
                title="No active WIGs"
                description="Create your first Wildly Important Goal to get started."
                action={
                  <Link href="/wigs/new" className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002244]">
                    <Target size={16} /> Create WIG
                  </Link>
                }
                icon={<Target size={48} />}
              />
            </Card>
          ) : (
            wigs.map((wig) => {
              const progress = calcProgress(wig.baselineValue, wig.currentValue, wig.targetValue);
              const daysLeft = daysUntil(wig.targetDate);
              const activeLeadMeasures = wig.leadMeasures.length;

              return (
                <Link key={wig.id} href={`/wigs/${wig.id}`}>
                  <Card className="hover:shadow-md transition-all hover:border-[#003366]/20 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${WIG_CATEGORY_COLORS[wig.category]}`}>
                              {WIG_CATEGORY_LABELS[wig.category]}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <School size={12} />
                              {wig.school.shortName}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-900 text-sm leading-snug">{wig.title}</h3>
                        </div>
                        <WigStatusBadge baseline={wig.baselineValue} current={wig.currentValue} target={wig.targetValue} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-center">
                          <p className="text-xs text-slate-400 mb-0.5">Baseline</p>
                          <p className="font-semibold text-slate-700 text-sm">{formatValue(wig.baselineValue, wig.unit)}</p>
                        </div>
                        <div className="flex-1">
                          <ProgressBar value={progress} showLabel />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-400 mb-0.5">Target</p>
                          <p className="font-semibold text-slate-700 text-sm">{formatValue(wig.targetValue, wig.unit)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          Current: <strong className="text-slate-700 ml-1">{formatValue(wig.currentValue, wig.unit)}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {daysLeft > 0 ? `${daysLeft} days left` : "Past due"} · {formatDate(wig.targetDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ArrowRight size={12} />
                          {activeLeadMeasures} lead measure{activeLeadMeasures !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        {/* Right panel: Sessions + Schools */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-[#003366]" />
              Upcoming Sessions
            </h2>
            <Card>
              {upcomingSessions.length === 0 ? (
                <EmptyState
                  title="No upcoming sessions"
                  description="Schedule a WIG session for your team."
                  action={
                    <Link href="/wig-sessions/new" className="text-sm text-[#003366] font-medium hover:underline">
                      Schedule session →
                    </Link>
                  }
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingSessions.map((session) => (
                    <Link key={session.id} href={`/wig-sessions/${session.id}`} className="block px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#003366]/10 flex items-center justify-center flex-shrink-0">
                          <Calendar size={14} className="text-[#003366]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {session.title ?? session.wig.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {session.school.shortName} · {formatDate(session.scheduledAt)}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          session.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {session.status === "IN_PROGRESS" ? "Live" : "Scheduled"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Schools */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <School size={18} className="text-[#003366]" />
              Schools
            </h2>
            <Card>
              <div className="divide-y divide-slate-100">
                {schools.map((school) => {
                  const schoolWigs = wigs.filter(w => w.school.id === school.id);
                  return (
                    <Link key={school.id} href={`/schools/${school.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-[#c9a84c]/15 flex items-center justify-center flex-shrink-0 font-bold text-[#c9a84c] text-xs">
                        {school.shortName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{school.shortName}</p>
                        <p className="text-xs text-slate-500">{schoolWigs.length} active WIG{schoolWigs.length !== 1 ? "s" : ""}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-300" />
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }: { label: string; value: number; icon: React.ReactNode; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
