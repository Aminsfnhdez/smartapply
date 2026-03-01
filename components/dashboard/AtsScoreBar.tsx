"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Props del componente AtsScoreBar.
 */
interface AtsScoreBarProps {
  /** Puntuación ATS de 0 a 100 retornada por Claude API. */
  score: number;
  /** Sugerencias de mejora (al menos 3 si score < 80). */
  suggestions: string[];
  /** Keywords de la vacante encontradas en el CV. */
  matchedKeywords: string[];
  /** Keywords relevantes de la vacante ausentes en el CV. */
  missingKeywords: string[];
  /** Clases adicionales para el contenedor raíz. */
  className?: string;
}

/**
 * Componente visual para mostrar el score de compatibilidad ATS.
 *
 * Client Component — usa `useTranslations` de next-intl para i18n.
 *
 * Muestra:
 * - Barra de progreso animada con color según el score:
 *   - ≥ 80 → verde (buen nivel de compatibilidad).
 *   - 50–79 → amarillo (compatibilidad media).
 *   - < 50 → rojo (baja compatibilidad).
 * - Advertencia si el score es menor a 80.
 * - Dos columnas de badges: keywords encontradas (verde) y faltantes (rojo).
 * - Lista de sugerencias de mejora (solo si `suggestions.length > 0`).
 *
 * La barra usa `transition-all duration-1000` para animar el llenado
 * al montar el componente, dando feedback visual inmediato al usuario.
 *
 * @see app/(dashboard)/generate/page.tsx — uso principal tras generación de CV
 * @see types/cv.ts — AtsScoreResponse que alimenta estas props
 *
 * @example
 * <AtsScoreBar
 *   score={atsData.score}
 *   suggestions={atsData.suggestions}
 *   matchedKeywords={atsData.matchedKeywords}
 *   missingKeywords={atsData.missingKeywords}
 * />
 */
const AtsScoreBar = ({
  score,
  suggestions,
  matchedKeywords,
  missingKeywords,
  className,
}: AtsScoreBarProps) => {
  const t = useTranslations("ats");

  const getScoreColor = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreTextColor = (s: number) => {
    if (s >= 80) return "text-green-700";
    if (s >= 50) return "text-yellow-700";
    return "text-red-700";
  };

  return (
    <div className={cn("space-y-6 rounded-2xl border bg-white p-6 shadow-sm", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{t("scoreTitle")}</h3>
          <span className={cn("text-2xl font-black", getScoreTextColor(score))}>
            {score}%
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn("h-full transition-all duration-1000 ease-out", getScoreColor(score))}
            style={{ width: `\${score}%` }}
          />
        </div>
      </div>

      {score < 80 && (
        <div className="rounded-xl bg-orange-50 p-4 text-sm text-orange-800">
          <p className="font-semibold">{t("lowScoreWarning")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            {t("matchedKeywords")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            {t("missingKeywords")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            {t("suggestionsTitle")}
          </h4>
          <ul className="list-inside list-disc space-y-2 text-sm text-gray-600">
            {suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export { AtsScoreBar };
