import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatValue, formatDate } from "@/lib/utils";
import { TRACKING_PERIOD_LABELS } from "@/lib/constants";
import { TrendingUp, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeadMeasuresPage() {
  const measures = await prisma.leadMeasure.findMany({
    where: { isActive: true },
    include: {
      wig: {
        include: { school: { select: { shortName: true } } },
      },
      entries: { orderBy: { recordedAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Lead Measures"
        subtitle="Discipline 2: Act on Lead Measures — the predictive, influenceable behaviors that drive WIGs"
      />

      {measures.length === 0 ? (
        <Card>
          <EmptyState
            title="No lead measures yet"
            description="Open a WIG and add lead measures to start tracking the behaviors that will drive your goals."
            icon={<TrendingUp size={48} />}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {measures.map((lm) => {
            const latest = lm.entries[0];
            const pct = latest ? Math.min(100, (latest.value / lm.targetValue) * 100) : 0;

            return (
              <Link key={lm.id} href={`/wigs/${lm.wigId}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer hover:border-[#003366]/20">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#003366]/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={18} className="text-[#003366]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm">{lm.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lm.wig.school.shortName} · {lm.wig.title.length > 60 ? lm.wig.title.slice(0, 60) + "…" : lm.wig.title}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1">
                            <ProgressBar value={pct} showLabel />
                          </div>
                          <div className="text-xs text-slate-500 flex-shrink-0">
                            Target: <strong className="text-slate-700">{formatValue(lm.targetValue, lm.unit)}</strong>
                            {" · "}{TRACKING_PERIOD_LABELS[lm.trackingPeriod]}
                          </div>
                        </div>
                        {latest && (
                          <p className="text-xs text-slate-400 mt-1">
                            Latest: <strong className="text-slate-600">{formatValue(latest.value, lm.unit)}</strong> on {formatDate(latest.recordedAt)}
                          </p>
                        )}
                      </div>
                      <ArrowRight size={16} className="text-slate-300 flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
