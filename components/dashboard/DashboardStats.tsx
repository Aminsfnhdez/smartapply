import { useTranslations } from "next-intl";
import { CheckCircle, FileText, TrendingUp, Clock } from "lucide-react";

interface DashboardStatsProps {
  totalCvs: number;
  averageScore: number;
  lastGeneratedDate?: string;
}

export const DashboardStats = ({ totalCvs, averageScore, lastGeneratedDate }: DashboardStatsProps) => {
  const t = useTranslations("dashboard.stats");

  const stats = [
    {
      label: t("totalCvs"),
      value: totalCvs,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: t("averageScore"),
      value: `${averageScore}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: t("lastCv"),
      value: lastGeneratedDate || "--",
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
            <stat.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-500">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-gray-900">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
