import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentCvs } from "@/components/dashboard/RecentCvs";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations("dashboard");

  // Fetch stats and latest CV
  const cvs = await prisma.cV.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalCvs = await prisma.cV.count({
    where: { userId: session?.user?.id },
  });

  const aggregate = await prisma.cV.aggregate({
    where: { userId: session?.user?.id },
    _avg: {
      atsScore: true,
    },
  });

  const averageScore = Math.round(aggregate._avg.atsScore || 0);
  const lastGeneratedDate = cvs.length > 0 ? new Date(cvs[0].createdAt).toLocaleDateString() : undefined;

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            {t("welcome")}, {session?.user?.name?.split(' ')[0]}! ✨
          </h1>
          <p className="mt-1 text-lg font-medium text-gray-500">
            {t("subtitle")}
          </p>
        </div>
        
        <Link href="/generate">
          <Button className="group flex items-center gap-2 px-6 py-6 text-lg shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95">
            <Sparkles className="h-5 w-5 fill-current text-yellow-300" />
            <span>{t("navigation.generate")}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <DashboardStats 
        totalCvs={totalCvs} 
        averageScore={averageScore} 
        lastGeneratedDate={lastGeneratedDate} 
      />

      {/* Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
            {t("recentActivity")}
          </h2>
          <Link href="/history" className="text-sm font-bold text-blue-600 hover:underline">
            {t("viewAll")}
          </Link>
        </div>

        <RecentCvs initialCvs={cvs} />
      </div>
    </div>
  );
}
