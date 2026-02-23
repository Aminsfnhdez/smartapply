import type { CvTemplateProps } from "@/types/cv-template";

export const MinimalistTemplate = ({ content }: CvTemplateProps) => {
  return (
    <div className="bg-white p-12 font-sans leading-relaxed text-gray-800 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl font-light tracking-widest uppercase mb-4">Curriculum Vitae</h1>
        <p className="text-sm font-light leading-relaxed text-gray-500">{content.summary}</p>
      </div>

      {/* Experience */}
      <section className="mb-12">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 px-1">Experiencia</h2>
        <div className="space-y-10">
          {content.experience.map((exp, i) => (
            <div key={i} className="group">
              <div className="flex justify-between items-baseline mb-2 border-b border-gray-50 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-tight">{exp.position}</h3>
                <span className="text-[10px] font-medium tracking-wider text-gray-400">{exp.startDate} / {exp.endDate}</span>
              </div>
              <div className="text-xs font-medium text-gray-500 mb-3 tracking-wide">{exp.company}</div>
              <p className="text-xs leading-relaxed text-gray-600 font-light">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12">
        {/* Education */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 px-1">Educación</h2>
          <div className="space-y-6">
            {content.education.map((edu, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold uppercase tracking-tight">{edu.degree}</h3>
                  <span className="text-[10px] font-medium tracking-wider text-gray-400">{edu.startDate} / {edu.endDate}</span>
                </div>
                <div className="text-xs font-light text-gray-500 uppercase tracking-widest mt-1">{edu.institution}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills & Info */}
        <section className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 px-1">Habilidades</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {content.skills.map((skill, i) => (
                <span key={i} className="text-[11px] font-light tracking-wide">• {skill}</span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 px-1">Idiomas</h2>
            <div className="space-y-2">
              {content.languages.map((lang, i) => (
                <div key={i} className="text-[11px] font-light tracking-wide">
                  <span className="font-bold">{lang.name}</span> — {lang.level}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
