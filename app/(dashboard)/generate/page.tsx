"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { AtsScoreBar } from "@/components/dashboard/AtsScoreBar";
import type { GeneratedCvContent, AtsScoreResponse } from "@/types/cv";

export default function GeneratePage() {
  const t = useTranslations("generate");
  const [jobDescription, setJobDescription] = useState("");
  const [template, setTemplate] = useState<"classic" | "modern" | "minimalist">("classic");
  const [loading, setLoading] = useState(false);
  const [generatedCv, setGeneratedCv] = useState<GeneratedCvContent | null>(null);
  const [atsScore, setAtsScore] = useState<AtsScoreResponse | null>(null);

  const handleGenerate = async () => {
    if (jobDescription.length < 50) {
      toast.error(t("errors.tooShort"));
      return;
    }

    const toastId = toast.loading(t("loading"));
    setLoading(true);
    setGeneratedCv(null);
    setAtsScore(null);

    try {
      const res = await fetch("/api/cv/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, template }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("errors.api"));
      }

      toast.success(t("success_generation"), { id: toastId });

      setGeneratedCv(data.cv);

      // Una vez generado el CV, pedimos el score ATS
      const scoreRes = await fetch("/api/cv/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvContent: data.cv, jobDescription }),
      });

      const scoreData = await scoreRes.json();
      if (scoreRes.ok) {
        setAtsScore(scoreData);
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-wider text-gray-700">
              {t("vacancyLabel")}
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t("vacancyPlaceholder")}
              rows={12}
              className="w-full rounded-2xl border-gray-300 p-6 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-wider text-gray-700">
              {t("templateLabel")}
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["classic", "modern", "minimalist"].map((tKey) => (
                <button
                  key={tKey}
                  onClick={() => setTemplate(tKey as any)}
                  className={`rounded-xl border-2 p-4 text-sm font-semibold transition-all ${
                    template === tKey
                      ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md"
                      : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                  }`}
                >
                  {t(`template${tKey.charAt(0).toUpperCase() + tKey.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>



          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 text-lg"
          >
            {loading ? t("loading") : t("button")}
          </Button>
        </div>

        <div className="space-y-8">
          {atsScore && (
            <AtsScoreBar
              score={atsScore.score}
              suggestions={atsScore.suggestions}
              matchedKeywords={atsScore.matchedKeywords}
              missingKeywords={atsScore.missingKeywords}
            />
          )}

          {generatedCv && (
            <div className="rounded-2xl border bg-gray-50 p-8 shadow-inner">
               {/* Aquí irá el componente Preview del CV en la siguiente iteración */}
               <h3 className="mb-4 text-center font-bold text-gray-400">PREVIEW DEL CV GENERADO</h3>
               <pre className="overflow-auto text-[10px] text-gray-500">
                 {JSON.stringify(generatedCv, null, 2)}
               </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
