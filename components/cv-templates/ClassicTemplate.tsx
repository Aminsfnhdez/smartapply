import type { CvTemplateProps } from "@/types/cv-template";

export const ClassicTemplate = ({ content }: CvTemplateProps) => {
  return (
    <div className="bg-white p-8 font-sans leading-relaxed text-gray-900">
      {/* Header */}
      <div className="mb-8 border-b-2 border-gray-900 pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-tight">{content.experience[0]?.company ? "CANDIDATO" : "RESUMEN PRO"}</h1>
        <p className="mt-2 text-sm text-gray-600">{content.summary}</p>
      </div>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="mb-4 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">Experiencia Profesional</h2>
        <div className="space-y-6">
          {content.experience.map((exp, i) => (
            <div key={i}>
              <div className="flex justify-between font-bold">
                <span>{exp.position}</span>
                <span>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div className="italic text-gray-700">{exp.company}</div>
              <p className="mt-2 text-sm whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="mb-4 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">Educación</h2>
        <div className="space-y-4">
          {content.education.map((edu, i) => (
            <div key={i}>
              <div className="flex justify-between font-bold">
                <span>{edu.degree}</span>
                <span>{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className="text-gray-700">{edu.institution}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h2 className="mb-4 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">Habilidades</h2>
        <div className="flex flex-wrap gap-2">
          {content.skills.map((skill, i) => (
            <span key={i} className="text-sm">• {skill}</span>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section>
        <h2 className="mb-4 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">Idiomas</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {content.languages.map((lang, i) => (
            <div key={i} className="text-sm">
              <span className="font-bold">{lang.name}:</span> {lang.level}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
