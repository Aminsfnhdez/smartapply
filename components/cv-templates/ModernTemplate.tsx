import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CvTemplateProps } from "@/types/cv-template";

/**
 * VERSION PDF (@react-pdf/renderer)
 */
const pdfStyles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#0f172a',
    lineHeight: 1.4,
  },
  topBar: {
    height: 8,
    backgroundColor: '#2563eb',
  },
  content: {
    padding: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  summaryWrapper: {
    marginTop: 15,
    flexDirection: 'row',
  },
  summaryBar: {
    width: 3,
    backgroundColor: '#2563eb',
    marginRight: 10,
  },
  summary: {
    flex: 1,
    fontSize: 9,
    color: '#475569',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textTransform: 'uppercase',
    marginRight: 10,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  experienceItem: {
    marginBottom: 20,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#2563eb',
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  position: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 8,
    color: '#2563eb',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  company: {
    fontSize: 10,
    color: '#1d4ed8',
    marginBottom: 5,
  },
  description: {
    fontSize: 9,
    color: '#475569',
  },
  skillsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  skillsCol: {
    flex: 1,
  },
  skillSubTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillBadge: {
    backgroundColor: '#f1f5f9',
    padding: '2 4',
    borderRadius: 2,
    fontSize: 8,
  }
});

export const ModernTemplatePDF = ({ content }: CvTemplateProps) => (
  <Document>
    <Page size="A4" style={pdfStyles.page} wrap>
      <View style={pdfStyles.topBar} />
      <View style={pdfStyles.content}>
        {/* Personal Info Header */}
        {content.personalInfo && (
          <View style={pdfStyles.header}>
            {content.personalInfo.fullName && (
              <Text style={{ ...pdfStyles.title, marginBottom: 8 }}>{content.personalInfo.fullName}</Text>
            )}
            {content.personalInfo.jobTitle && (
              <Text style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{content.personalInfo.jobTitle}</Text>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {content.personalInfo.email && <Text style={{ fontSize: 8, color: '#2563eb' }}>{content.personalInfo.email}</Text>}
              {content.personalInfo.phone && <Text style={{ fontSize: 8, color: '#475569' }}>• {content.personalInfo.phone}</Text>}
              {content.personalInfo.city && <Text style={{ fontSize: 8, color: '#475569' }}>• {content.personalInfo.city}</Text>}
              {content.personalInfo.linkedin && <Text style={{ fontSize: 8, color: '#2563eb' }}>• {content.personalInfo.linkedin}</Text>}
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={pdfStyles.summaryWrapper}>
          <View style={pdfStyles.summaryBar} />
          <Text style={pdfStyles.summary}>{content.summary}</Text>
        </View>

        <View style={pdfStyles.section}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Experiencia</Text>
            <View style={pdfStyles.sectionDivider} />
          </View>
          {content.experience.map((exp, i) => (
            <View key={i} style={pdfStyles.experienceItem} wrap={false}>
              <View style={pdfStyles.experienceHeader}>
                <Text style={pdfStyles.position}>{exp.position}</Text>
                <Text style={pdfStyles.date}>{exp.startDate} - {exp.endDate}</Text>
              </View>
              <Text style={pdfStyles.company}>{exp.company}</Text>
              <Text style={pdfStyles.description}>{exp.description}</Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.section}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Educación</Text>
            <View style={pdfStyles.sectionDivider} />
          </View>
          {content.education.map((edu, i) => (
            <View key={i} style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }} wrap={false}>
              <View>
                <Text style={{ fontWeight: 'bold' }}>{edu.degree}</Text>
                <Text style={{ fontSize: 9, color: '#475569' }}>{edu.institution}</Text>
              </View>
              <Text style={pdfStyles.date}>{edu.startDate} - {edu.endDate}</Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.section} wrap={false}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Habilidades</Text>
            <View style={pdfStyles.sectionDivider} />
          </View>
          <View style={pdfStyles.skillsGrid}>
            <View style={pdfStyles.skillsCol}>
              <Text style={pdfStyles.skillSubTitle}>Técnicas</Text>
              <View style={pdfStyles.skillList}>
                {content.technicalSkills.map((skill, i) => (
                  <Text key={i} style={pdfStyles.skillBadge}>{skill}</Text>
                ))}
              </View>
            </View>
            <View style={pdfStyles.skillsCol}>
              <Text style={pdfStyles.skillSubTitle}>Idiomas</Text>
              {content.languages.map((lang, i) => (
                <Text key={i} style={{ fontSize: 8, marginBottom: 2 }}>
                  <Text style={{ fontWeight: 'bold' }}>{lang.name}</Text> • {lang.level}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

/**
 * VERSION HTML (Tailwind para Preview)
 */
export const ModernTemplate = ({ content }: CvTemplateProps) => {
  return (
    <div className="mx-auto flex bg-white text-[10pt] leading-snug text-slate-900 shadow-sm" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="flex w-full flex-col">
        <div className="h-2 w-full bg-blue-600" />
        <div className="flex flex-col p-[40pt]">
          {/* Personal Info Header */}
          {content.personalInfo && (
            <header className="mb-8">
              {content.personalInfo.fullName && (
                <h1 className="text-4xl font-bold tracking-tighter text-blue-800 uppercase mb-3">{content.personalInfo.fullName}</h1>
              )}
              {content.personalInfo.jobTitle && (
                <p className="mt-1 text-sm text-slate-500">{content.personalInfo.jobTitle}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-3 text-[8pt]">
                {content.personalInfo.email && <span className="text-blue-600">{content.personalInfo.email}</span>}
                {content.personalInfo.phone && <span className="text-slate-500">• {content.personalInfo.phone}</span>}
                {content.personalInfo.city && <span className="text-slate-500">• {content.personalInfo.city}</span>}
                {content.personalInfo.linkedin && <span className="text-blue-600">• {content.personalInfo.linkedin}</span>}
              </div>
            </header>
          )}

          {/* Summary */}
          <div className="mt-4 mb-8 flex">
            <div className="mr-3 w-1 bg-blue-600" />
            <p className="flex-1 text-[9pt] text-slate-600">{content.summary}</p>
          </div>

          {/* Experience */}
          <section className="mb-8">
            <div className="mb-4 flex items-center">
              <h2 className="text-base font-bold text-blue-900 uppercase">Experiencia</h2>
              <div className="ml-3 h-px flex-1 bg-slate-200" />
            </div>
            <div className="space-y-6">
              {content.experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-blue-600 pl-3">
                  <div className="flex justify-between font-bold">
                    <span className="text-[11pt]">{exp.position}</span>
                    <span className="text-[8pt] text-blue-600 uppercase">{exp.startDate} - {exp.endDate || 'Presente'}</span>
                  </div>
                  <div className="text-blue-700">{exp.company}</div>
                  <p className="mt-1 text-[9pt] text-slate-600">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="mb-8">
            <div className="mb-4 flex items-center">
              <h2 className="text-base font-bold text-blue-900 uppercase">Educación</h2>
              <div className="ml-3 h-px flex-1 bg-slate-200" />
            </div>
            <div className="space-y-3">
              {content.education.map((edu, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <div className="font-bold">{edu.degree}</div>
                    <div className="text-[9pt] text-slate-600">{edu.institution}</div>
                  </div>
                  <span className="text-[8pt] font-bold text-blue-600 uppercase">{edu.startDate} - {edu.endDate || 'Presente'}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Complementary Education */}
          {content.complementaryEducation && content.complementaryEducation.length > 0 && (
            <section className="mb-8">
              <div className="mb-4 flex items-center">
                <h2 className="text-base font-bold text-blue-900 uppercase text-nowrap">Educación Complementaria</h2>
                <div className="ml-3 h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {content.complementaryEducation.map((item, i) => (
                  <div key={i} className="text-[9pt]">
                    <div className="font-bold">{item.program}</div>
                    <div className="text-slate-600">{item.institution} • {item.year}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills & Languages */}
          <section>
            <div className="mb-4 flex items-center">
              <h2 className="text-base font-bold text-blue-900 uppercase text-nowrap">Habilidades e Idiomas</h2>
              <div className="ml-3 h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="mb-2 block text-[8pt] font-bold text-slate-400 uppercase">Técnicas</span>
                <div className="flex flex-wrap gap-1">
                  {content.technicalSkills.map((skill, i) => (
                    <span key={i} className="rounded-sm bg-slate-100 px-2 py-0.5 text-[8pt]">{skill}</span>
                  ))}
                </div>
                <span className="mt-3 mb-2 block text-[8pt] font-bold text-slate-400 uppercase">Blandas</span>
                <div className="flex flex-wrap gap-1">
                  {content.softSkills.map((skill, i) => (
                    <span key={i} className="rounded-sm bg-slate-50 px-2 py-0.5 text-[8pt] border border-slate-100 italic">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-2 block text-[8pt] font-bold text-slate-400 uppercase">Idiomas</span>
                <div className="space-y-1">
                  {content.languages.map((lang, i) => (
                    <div key={i} className="text-[9pt]">
                      <span className="font-bold">{lang.name}</span> • {lang.level}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
