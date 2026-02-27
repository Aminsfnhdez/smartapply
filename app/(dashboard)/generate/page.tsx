"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { AtsScoreBar } from "@/components/dashboard/AtsScoreBar";
import { FileText, Layout, Type, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CvPreview } from "@/components/dashboard/CvPreview";
import type { GeneratedCvContent, AtsScoreResponse } from "@/types/cv";

export default function GeneratePage() {
  const t = useTranslations("generate");
  const [jobDescription, setJobDescription] = useState("");
  const [template, setTemplate] = useState<"classic" | "modern" | "minimalist">("classic");
  const [loading, setLoading] = useState(false);
  const [generatedCv, setGeneratedCv] = useState<GeneratedCvContent | null>(null);
  const [atsScore, setAtsScore] = useState<AtsScoreResponse | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (jobDescription.length < 50) {
      toast.error(t("errors.tooShort"));
      return;
    }

    const toastId = toast.loading(t("loading"));
    setLoading(true);
    setGeneratedCv(null);
    setAtsScore(null);
    setCvId(null);

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
      setCvId(data.cvId);

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
            <div className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {[
                { id: "classic", icon: FileText },
                { id: "modern", icon: Layout },
                { id: "minimalist", icon: Type },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = template === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTemplate(item.id as any)}
                    className={cn(
                      "relative flex min-w-[200px] flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all sm:min-w-0",
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600/20"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
                    )}
                  >
                    <div className={cn(
                      "rounded-lg p-2.5",
                      isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className={cn(
                        "font-bold",
                        isSelected ? "text-blue-900" : "text-gray-900"
                      )}>
                        {t(`template${item.id.charAt(0).toUpperCase() + item.id.slice(1)}`)}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        {t(`template${item.id.charAt(0).toUpperCase() + item.id.slice(1)}Desc`)}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-blue-600" />
                    )}
                  </button>
                );
              })}
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
            <CvPreview 
              content={generatedCv} 
              template={template} 
              language="es" 
              cvId={cvId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
