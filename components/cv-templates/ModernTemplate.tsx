import type { CvTemplateProps } from "@/types/cv-template";

export const ModernTemplate = ({ content }: CvTemplateProps) => {
  return (
    <div className="bg-white p-8 font-sans leading-relaxed text-slate-900 border-t-8 border-blue-600">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-blue-800 uppercase">PERFIL PROFESIONAL</h1>
        <div className="mt-6 flex gap-4">
          <div className="h-full w-1 bg-blue-600" />
          <p className="text-sm font-medium leading-relaxed text-slate-600">{content.summary}</p>
        </div>
      </header>

      {/* Experience */}
      <section className="mb-10">
        <div className="mb-6 flex items-center gap-4">
          <h2 className="text-xl font-black uppercase text-blue-900">Experiencia</h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="space-y-8">
          {content.experience.map((exp, i) => (
            <div key={i} className="relative pl-6">
              <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-600" />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                <h3 className="font-bold text-lg text-slate-800">{exp.position}</h3>
                <span className="text-xs font-bold uppercase text-blue-600">{exp.startDate} — {exp.endDate}</span>
              </div>
              <div className="font-semibold text-blue-700 mb-2">{exp.company}</div>
              <p className="text-sm text-slate-600 leading-normal">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-10">
        {/* Education */}
        <section>
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-xl font-black uppercase text-blue-900">Educación</h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="space-y-6">
            {content.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                  <div className="text-sm text-slate-600">{edu.institution}</div>
                </div>
                <span className="text-xs font-bold text-blue-600">{edu.startDate} — {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Skills & Skills */}
        <section>
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-xl font-black uppercase text-blue-900">Habilidades</h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Técnicas</h3>
              <div className="flex flex-wrap gap-2">
                {content.skills.map((skill, i) => (
                  <span key={i} className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">{skill}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Idiomas</h3>
              <div className="space-y-1">
                {content.languages.map((lang, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-bold">{lang.name}</span> <span className="text-slate-500">• {lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
