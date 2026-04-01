import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { School, MapPin, BookOpen, ArrowRight, Plus } from "lucide-react";
import { calcProgress } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
  const schools = await prisma.school.findMany({
    where: { isActive: true },
    include: {
      wigs: {
        where: { status: "ACTIVE" },
        select: { id: true, baselineValue: true, currentValue: true, targetValue: true },
      },
      _count: { select: { wigSessions: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Schools"
        subtitle="All Alliance College-Ready Public Schools campuses"
        action={
          <Link
            href="/schools/new"
            className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002244] transition-colors"
          >
            <Plus size={16} />
            Add School
          </Link>
        }
      />

      {schools.length === 0 ? (
        <Card>
          <EmptyState title="No schools yet" description="Add your first Alliance school campus." icon={<School size={48} />} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school) => {
            const avgProgress = school.wigs.length > 0
              ? school.wigs.reduce((sum, w) => sum + calcProgress(w.baselineValue, w.currentValue, w.targetValue), 0) / school.wigs.length
              : 0;

            return (
              <Link key={school.id} href={`/schools/${school.id}`}>
                <Card className="hover:shadow-md transition-all hover:border-[#003366]/20 cursor-pointer h-full">
                  <CardContent className="py-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#003366] flex items-center justify-center flex-shrink-0 font-bold text-[#c9a84c] text-lg">
                        {school.shortName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug">{school.shortName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{school.name}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-500">
                      {school.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          <span>{school.location}</span>
                        </div>
                      )}
                      {school.gradeSpan && (
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={12} />
                          <span>Grades {school.gradeSpan}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-500">{school.wigs.length} Active WIG{school.wigs.length !== 1 ? "s" : ""}</span>
                        {school.wigs.length > 0 && (
                          <span className="font-medium text-slate-700">{Math.round(avgProgress)}% avg</span>
                        )}
                      </div>
                      {school.wigs.length > 0 && <ProgressBar value={avgProgress} />}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{school._count.wigSessions} WIG sessions</span>
                      <ArrowRight size={14} className="text-[#003366]" />
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
