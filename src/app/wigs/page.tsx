import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { WigStatusBadge } from "@/components/wigs/WigStatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { calcProgress, formatValue, formatDate } from "@/lib/utils";
import { WIG_CATEGORY_LABELS, WIG_CATEGORY_COLORS } from "@/lib/constants";
import { Target, Plus, School } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WigsPage() {
  const wigs = await prisma.wIG.findMany({
    include: {
      school: { select: { id: true, shortName: true } },
      leadMeasures: { where: { isActive: true } },
      _count: { select: { wigSessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeWigs = wigs.filter(w => w.status === "ACTIVE");
  const otherWigs = wigs.filter(w => w.status !== "ACTIVE");

  return (
    <div className="p-8">
      <PageHeader
        title="Wildly Important Goals"
        subtitle="Discipline 1: Focus on the WIG — all schools"
        action={
          <Link
            href="/wigs/new"
            className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002244] transition-colors"
          >
            <Plus size={16} />
            New WIG
          </Link>
        }
      />

      {wigs.length === 0 ? (
        <Card>
          <EmptyState
            title="No WIGs yet"
            description="Create your first Wildly Important Goal to start tracking progress."
            action={
              <Link href="/wigs/new" className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Plus size={16} /> Create WIG
              </Link>
            }
            icon={<Target size={48} />}
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {activeWigs.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Active ({activeWigs.length})</h2>
              <div className="space-y-3">
                {activeWigs.map((wig) => <WigRow key={wig.id} wig={wig} />)}
              </div>
            </section>
          )}
          {otherWigs.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Other ({otherWigs.length})</h2>
              <div className="space-y-3">
                {otherWigs.map((wig) => <WigRow key={wig.id} wig={wig} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function WigRow({ wig }: { wig: any }) {
  const progress = calcProgress(wig.baselineValue, wig.currentValue, wig.targetValue);
  return (
    <Link href={`/wigs/${wig.id}`}>
      <Card className="hover:shadow-md transition-all cursor-pointer hover:border-[#003366]/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${WIG_CATEGORY_COLORS[wig.category]}`}>
                  {WIG_CATEGORY_LABELS[wig.category]}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <School size={11} /> {wig.school.shortName}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900">{wig.title}</h3>
            </div>
            <WigStatusBadge baseline={wig.baselineValue} current={wig.currentValue} target={wig.targetValue} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{formatValue(wig.baselineValue, wig.unit)}</span>
                <span>Current: <strong className="text-slate-700">{formatValue(wig.currentValue, wig.unit)}</strong></span>
                <span>{formatValue(wig.targetValue, wig.unit)}</span>
              </div>
              <ProgressBar value={progress} />
            </div>
            <div className="text-right text-xs text-slate-500 flex-shrink-0">
              <p>By {formatDate(wig.targetDate)}</p>
              <p className="mt-0.5">{wig.leadMeasures.length} lead measures</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
