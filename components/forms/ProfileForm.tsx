"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ProfileFormData, Experience, Education, Language } from "@/types/profile";

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
}

export const ProfileForm = ({ initialData }: ProfileFormProps) => {
  const t = useTranslations("profile");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    summary: initialData?.summary || "",
    experience: initialData?.experience || [],
    education: initialData?.education || [],
    skills: initialData?.skills || [],
    languages: initialData?.languages || [],
    certifications: initialData?.certifications || [],
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(t("messages.success"));
        router.push("/dashboard");
      } else {
        toast.error(t("messages.error"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("messages.error"));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ProfileFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex justify-between border-b pb-4">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-all",
              step === s
                ? "border-blue-600 bg-blue-600 text-white"
                : step > s
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-gray-300 text-gray-400"
            )}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-8 shadow-sm ring-1 ring-gray-100">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-bold text-gray-900">{t("steps.personal")}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("fields.summary")}</label>
              <textarea
                value={formData.summary || ""}
                onChange={(e) => updateField("summary", e.target.value)}
                rows={6}
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>{t("actions.next")}</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{t("steps.experience")}</h2>
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                {t("orderNote")}
              </p>
            </div>
            {formData.experience.map((exp, index) => (
              <div key={index} className="relative space-y-4 rounded-xl border bg-gray-50 p-6">
                <button
                  onClick={() => updateField("experience", formData.experience.filter((_, i) => i !== index))}
                  className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
                >
                  {t("actions.remove")}
                </button>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium uppercase text-gray-500">{t("fields.company")}</label>
                    <input
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[index].company = e.target.value;
                        updateField("experience", newExp);
                      }}
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase text-gray-500">{t("fields.position")}</label>
                    <input
                      value={exp.position}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[index].position = e.target.value;
                        updateField("experience", newExp);
                      }}
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium uppercase text-gray-500">{t("fields.startDate")}</label>
                    <input
                      placeholder={t("fields.datePlaceholder")}
                      value={exp.startDate}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[index].startDate = e.target.value;
                        updateField("experience", newExp);
                      }}
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium uppercase text-gray-500">{t("fields.endDate")}</label>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.isCurrent}
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[index].isCurrent = e.target.checked;
                            if (e.target.checked) newExp[index].endDate = "";
                            updateField("experience", newExp);
                          }}
                          className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {t("fields.isCurrent")}
                      </label>
                    </div>
                    <input
                      placeholder={t("fields.datePlaceholder")}
                      value={exp.endDate}
                      disabled={exp.isCurrent}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[index].endDate = e.target.value;
                        updateField("experience", newExp);
                      }}
                      className={cn(
                        "mt-1 block w-full rounded-lg border-gray-300 bg-white",
                        exp.isCurrent && "bg-gray-100 cursor-not-allowed opacity-60"
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase text-gray-500">{t("fields.description")}</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => {
                      const newExp = [...formData.experience];
                      newExp[index].description = e.target.value;
                      updateField("experience", newExp);
                    }}
                    rows={3}
                    className="mt-1 block w-full rounded-lg border-gray-300 bg-white"
                  />
                </div>
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={() => updateField("experience", [...formData.experience, { company: "", position: "", startDate: "", endDate: "", description: "" }])}
            >
              {t("actions.addExperience")}
            </Button>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>{t("actions.prev")}</Button>
              <Button onClick={() => setStep(3)}>{t("actions.next")}</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{t("steps.education")}</h2>
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                {t("orderNote")}
              </p>
            </div>
            {formData.education.map((edu, index) => (
              <div key={index} className="relative space-y-4 rounded-xl border bg-gray-50 p-6">
                <button
                  onClick={() => updateField("education", formData.education.filter((_, i) => i !== index))}
                  className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
                >
                  {t("actions.remove")}
                </button>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium uppercase text-gray-500">{t("fields.institution")}</label>
                    <input
                      value={edu.institution}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[index].institution = e.target.value;
                        updateField("education", newEdu);
                      }}
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase text-gray-500">{t("fields.degree")}</label>
                    <input
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...formData.education];
                        newEdu[index].degree = e.target.value;
                        updateField("education", newEdu);
                      }}
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium uppercase text-gray-500">{t("fields.startDate")}</label>
                      <input
                        placeholder={t("fields.datePlaceholder")}
                        value={edu.startDate}
                        onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[index].startDate = e.target.value;
                          updateField("education", newEdu);
                        }}
                        className="mt-1 block w-full rounded-lg border-gray-300 bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium uppercase text-gray-500">{t("fields.endDate")}</label>
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase cursor-pointer">
                          <input
                            type="checkbox"
                            checked={edu.isOngoing}
                            onChange={(e) => {
                              const newEdu = [...formData.education];
                              newEdu[index].isOngoing = e.target.checked;
                              if (e.target.checked) newEdu[index].endDate = "";
                              updateField("education", newEdu);
                            }}
                            className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          {t("fields.isOngoing")}
                        </label>
                      </div>
                      <input
                        placeholder={t("fields.datePlaceholder")}
                        value={edu.endDate}
                        disabled={edu.isOngoing}
                        onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[index].endDate = e.target.value;
                          updateField("education", newEdu);
                        }}
                        className={cn(
                          "mt-1 block w-full rounded-lg border-gray-300 bg-white",
                          edu.isOngoing && "bg-gray-100 cursor-not-allowed opacity-60"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={() => updateField("education", [...formData.education, { institution: "", degree: "", startDate: "", endDate: "" }])}
            >
              {t("actions.addEducation")}
            </Button>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>{t("actions.prev")}</Button>
              <Button onClick={() => setStep(4)}>{t("actions.next")}</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-bold text-gray-900">{t("steps.skills")}</h2>
            <div>
              <label className="text-xs font-medium uppercase text-gray-500">{t("fields.skills")}</label>
              <input
                value={formData.skills.join(", ")}
                onChange={(e) => updateField("skills", e.target.value.split(",").map(s => s.trim()))}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-medium uppercase text-gray-500">{t("addLanguage")}</label>
              {formData.languages.map((lang, index) => (
                <div key={index} className="flex gap-4">
                  <input
                    placeholder={t("fields.languageName")}
                    value={lang.name}
                    onChange={(e) => {
                      const newLang = [...formData.languages];
                      newLang[index].name = e.target.value;
                      updateField("languages", newLang);
                    }}
                    className="flex-1 rounded-lg border-gray-300"
                  />
                  <input
                    placeholder={t("fields.languageLevel")}
                    value={lang.level}
                    onChange={(e) => {
                      const newLang = [...formData.languages];
                      newLang[index].level = e.target.value;
                      updateField("languages", newLang);
                    }}
                    className="flex-1 rounded-lg border-gray-300"
                  />
                  <button
                    onClick={() => updateField("languages", formData.languages.filter((_, i) => i !== index))}
                    className="text-gray-400 hover:text-red-500"
                  >
                    {t("actions.remove")}
                  </button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateField("languages", [...formData.languages, { name: "", level: "" }])}
              >
                {t("actions.addLanguage")}
              </Button>
            </div>

            <div>
              <label className="text-xs font-medium uppercase text-gray-500">{t("fields.certifications")}</label>
              <input
                value={formData.certifications.join(", ")}
                onChange={(e) => updateField("certifications", e.target.value.split(",").map(s => s.trim()))}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(3)}>{t("actions.prev")}</Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? t("actions.adding") : t("actions.save")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
