import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { WigStatusBadge } from "@/components/wigs/WigStatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { calcProgress, formatValue, formatDate } from "@/lib/utils";
import { WIG_CATEGORY_LABELS, WIG_CATEGORY_COLORS, TRACKING_PERIOD_LABELS } from "@/lib/constants";
import { WigCurrentValueEditor } from "@/components/wigs/WigCurrentValueEditor";
import { AddLeadMeasureButton } from "@/components/lead-measures/AddLeadMeasureButton";
import { AddLagMeasureButton } from "@/components/lag-measures/AddLagMeasureButton";
import { AddLeadEntryButton } from "@/components/lead-measures/AddLeadEntryButton";
import { ScheduleSessionButton } from "@/components/wig-sessions/ScheduleSessionButton";
import { LagMeasureChart } from "@/components/lag-measures/LagMeasureChart";
import { LeadMeasureChart } from "@/components/lead-measures/LeadMeasureChart";
import { Target, Calendar, TrendingUp, TrendingDown, Plus, School, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WigDetailPage({ params }: { params: Promise<{ wigId: string }> }) {
  const { wigId } = await params;
  const wig = await prisma.wIG.findUnique({
    where: { id: wigId },
    include: {
      school: true,
      team: true,
      leadMeasures: {
        where: { isActive: true },
        include: { entries: { orderBy: { recordedAt: "asc" } } },
        orderBy: { createdAt: "asc" },
      },
      lagMeasures: {
        include: { entries: { orderBy: { recordedAt: "asc" } } },
        orderBy: { createdAt: "asc" },
      },
      wigSessions: {
        include: {
          commitments: true,
          _count: { select: { commitments: true } },
        },
        orderBy: { scheduledAt: "desc" },
        take: 5,
      },
    },
  });

  if (!wig) notFound();

  const progress = calcProgress(wig.baselineValue, wig.currentValue, wig.targetValue);

  return (
    <div className="p-8">
      <div className="mb-2">
        <Link href="/wigs" className="text-sm text-[#003366] hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> WIGs
        </Link>
      </div>
      <PageHeader
        title={wig.title}
        subtitle={`${wig.school.shortName}${wig.team ? ` · ${wig.team.name}` : ""}`}
        action={
          <div className="flex items-center gap-2">
            <ScheduleSessionButton wigId={wig.id} schoolId={wig.schoolId} />
          </div>
        }
      />

      {/* Status bar */}
      <div className="flex items-center gap-3 mb-8">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${WIG_CATEGORY_COLORS[wig.category]}`}>
          {WIG_CATEGORY_LABELS[wig.category]}
        </span>
        <WigStatusBadge baseline={wig.baselineValue} current={wig.currentValue} target={wig.targetValue} />
        <span className="text-sm text-slate-500">Target: {formatDate(wig.targetDate)}</span>
      </div>

      {/* Scoreboard */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Target size={14} /> Scoreboard
          </h2>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Baseline</p>
              <p className="text-2xl font-bold text-slate-500">{formatValue(wig.baselineValue, wig.unit)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current</p>
              <p className="text-3xl font-bold text-[#003366]">{formatValue(wig.currentValue, wig.unit)}</p>
              <WigCurrentValueEditor wigId={wig.id} currentValue={wig.currentValue} unit={wig.unit} />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Target</p>
              <p className="text-2xl font-bold text-green-600">{formatValue(wig.targetValue, wig.unit)}</p>
            </div>
          </div>
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress: {progress}%</span>
              <span>{formatValue(wig.targetValue - wig.currentValue, wig.unit)} remaining</span>
            </div>
            <ProgressBar value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Lead Measures */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#003366]" />
              Lead Measures
            </h2>
            <AddLeadMeasureButton wigId={wig.id} />
          </div>
          {wig.leadMeasures.length === 0 ? (
            <Card>
              <EmptyState
                title="No lead measures"
                description="Add the behaviors that will drive this WIG."
                icon={<TrendingUp size={40} />}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {wig.leadMeasures.map((lm) => {
                const latest = lm.entries[lm.entries.length - 1];
                const pct = latest ? Math.min(100, (latest.value / lm.targetValue) * 100) : 0;
                return (
                  <Card key={lm.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <p className="text-sm font-medium text-slate-800 flex-1">{lm.title}</p>
                        <AddLeadEntryButton measureId={lm.id} />
                      </div>
                      <div className="flex items-center gap-3 mb-2 text-xs text-slate-500">
                        <span>Target: <strong className="text-slate-700">{formatValue(lm.targetValue, lm.unit)}</strong></span>
                        <span>{TRACKING_PERIOD_LABELS[lm.trackingPeriod]}</span>
                        {latest && <span>Latest: <strong className="text-slate-700">{formatValue(latest.value, lm.unit)}</strong></span>}
                      </div>
                      <ProgressBar value={pct} showLabel />
                      {lm.entries.length > 1 && (
                        <div className="mt-3">
                          <LeadMeasureChart entries={lm.entries} target={lm.targetValue} unit={lm.unit} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Lag Measures */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <TrendingDown size={18} className="text-slate-500" />
              Lag Measures
            </h2>
            <AddLagMeasureButton wigId={wig.id} />
          </div>
          {wig.lagMeasures.length === 0 ? (
            <Card>
              <EmptyState
                title="No lag measures"
                description="Track outcome data for this WIG."
                icon={<TrendingDown size={40} />}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {wig.lagMeasures.map((lm) => {
                const latest = lm.entries[lm.entries.length - 1];
                return (
                  <Card key={lm.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-slate-800">{lm.title}</p>
                        {latest && (
                          <span className="text-lg font-bold text-[#003366]">{formatValue(latest.value, lm.unit)}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        Target: {formatValue(lm.targetValue, lm.unit)} · {TRACKING_PERIOD_LABELS[lm.trackingPeriod]}
                      </p>
                      {lm.entries.length > 0 && (
                        <LagMeasureChart entries={lm.entries} target={lm.targetValue} unit={lm.unit} />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* WIG Sessions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-[#003366]" />
          WIG Sessions
        </h2>
        <Card>
          {wig.wigSessions.length === 0 ? (
            <EmptyState
              title="No sessions yet"
              description="Schedule a weekly WIG session for accountability."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {wig.wigSessions.map((session) => {
                const keptCount = session.commitments.filter(c => c.status === "KEPT").length;
                return (
                  <Link key={session.id} href={`/wig-sessions/${session.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#003366]/10 flex items-center justify-center flex-shrink-0">
                      <Calendar size={16} className="text-[#003366]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{session.title ?? "WIG Session"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(session.scheduledAt)} · {keptCount}/{session._count.commitments} commitments kept
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      session.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      session.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                      session.status === "SCHEDULED" ? "bg-slate-100 text-slate-600" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {session.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
