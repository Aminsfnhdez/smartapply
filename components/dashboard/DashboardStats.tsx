import { useTranslations } from "next-intl";
import { CheckCircle, FileText, TrendingUp, Clock } from "lucide-react";

/**
 * Props del componente DashboardStats.
 */
interface DashboardStatsProps {
  /** Número total de CVs generados por el usuario. */
  totalCvs: number;
  /** Score ATS promedio de todos los CVs del usuario (0–100). */
  averageScore: number;
  /**
   * Fecha del último CV generado en formato legible.
   * Si no hay CVs, se recibe `undefined` y se muestra "--".
   */
  lastGeneratedDate?: string;
}

/**
 * Grid de métricas del dashboard.
 *
 * Server Component — no requiere interactividad ni hooks de estado.
 * Recibe las métricas ya calculadas desde `dashboard/page.tsx` (Server Component)
 * que las obtiene directamente de la DB con Prisma, evitando fetch del cliente.
 *
 * Muestra 3 tarjetas con:
 * - Total de CVs generados (ícono azul).
 * - Score ATS promedio en porcentaje (ícono verde).
 * - Fecha del último CV generado (ícono morado).
 *
 * Los textos de las etiquetas están externalizados en `messages/` bajo
 * la clave `dashboard.stats` para soporte multiidioma.
 *
 * @see app/(dashboard)/dashboard/page.tsx — calcula y pasa estas props
 *
 * @example
 * <DashboardStats
 *   totalCvs={12}
 *   averageScore={84}
 *   lastGeneratedDate="28/02/2026"
 * />
 */
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
