import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CvTemplateProps } from "@/types/cv-template";

/**
 * VERSION PDF (@react-pdf/renderer)
 */
const pdfStyles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1f2937',
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'light',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  summary: {
    fontSize: 9,
    fontWeight: 'light',
    color: '#6b7280',
    textAlign: 'justify',
  },
  section: {
    marginBottom: 35,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#9ca3af',
    marginBottom: 15,
  },
  experienceItem: {
    marginBottom: 25,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 5,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  itemDate: {
    fontSize: 7,
    color: '#9ca3af',
  },
  itemCompany: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 8,
    color: '#4b5563',
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 40,
  },
  infoCol: {
    flex: 1,
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    marginRight: 12,
    marginBottom: 5,
  }
});

export const MinimalistTemplatePDF = ({ content }: CvTemplateProps) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.headerTitle}>Curriculum Vitae</Text>
        <Text style={pdfStyles.summary}>{content.summary}</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionLabel}>Experiencia</Text>
        {content.experience.map((exp, i) => (
          <View key={i} style={pdfStyles.experienceItem}>
            <View style={pdfStyles.itemHeader}>
              <Text style={pdfStyles.itemTitle}>{exp.position}</Text>
              <Text style={pdfStyles.itemDate}>{exp.startDate} / {exp.endDate}</Text>
            </View>
            <Text style={pdfStyles.itemCompany}>{exp.company}</Text>
            <Text style={pdfStyles.itemDescription}>{exp.description}</Text>
          </View>
        ))}
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionLabel}>Educación</Text>
        {content.education.map((edu, i) => (
          <View key={i} style={{ marginBottom: 15 }}>
            <View style={pdfStyles.itemHeader}>
              <Text style={pdfStyles.itemTitle}>{edu.degree}</Text>
              <Text style={pdfStyles.itemDate}>{edu.startDate} / {edu.endDate}</Text>
            </View>
            <Text style={pdfStyles.itemCompany}>{edu.institution}</Text>
          </View>
        ))}
      </View>

      <View style={pdfStyles.infoContainer}>
        <View style={pdfStyles.infoCol}>
          <Text style={pdfStyles.sectionLabel}>Habilidades</Text>
          <View style={pdfStyles.skillList}>
            {content.technicalSkills.map((skill, i) => (
              <Text key={i} style={pdfStyles.skillItem}>• {skill}</Text>
            ))}
            {content.softSkills.map((skill, i) => (
              <Text key={i} style={pdfStyles.skillItem}>• {skill}</Text>
            ))}
          </View>
        </View>
        <View style={pdfStyles.infoCol}>
          <Text style={pdfStyles.sectionLabel}>Idiomas</Text>
          {content.languages.map((lang, i) => (
            <Text key={i} style={{ marginBottom: 4 }}>
              <Text style={{ fontWeight: 'bold' }}>{lang.name}</Text> — {lang.level}
            </Text>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

/**
 * VERSION HTML (Tailwind para Preview)
 */
export const MinimalistTemplate = ({ content }: CvTemplateProps) => {
  return (
    <div className="mx-auto bg-white p-[50pt] text-[9pt] leading-loose text-gray-700 shadow-sm" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-2xl font-light tracking-[0.2em] text-gray-900 uppercase">Curriculum Vitae</h1>
        <p className="mt-4 text-[9pt] font-light text-gray-500 text-justify">{content.summary}</p>
      </header>

      {/* Experience */}
      <section className="mb-10">
        <h2 className="mb-6 text-[8pt] font-bold tracking-widest text-gray-400 uppercase">Experiencia</h2>
        <div className="space-y-8">
          {content.experience.map((exp, i) => (
            <div key={i}>
              <div className="mb-2 flex items-baseline justify-between border-b border-gray-100 pb-1">
                <h3 className="text-[10pt] font-bold uppercase tracking-tight text-gray-800">{exp.position}</h3>
                <span className="text-[7pt] text-gray-400 uppercase">{exp.startDate} / {exp.endDate || 'Presente'}</span>
              </div>
              <div className="mb-2 text-[8pt] font-medium text-gray-500 uppercase">{exp.company}</div>
              <p className="text-[8pt] leading-relaxed text-gray-600">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-10">
        <h2 className="mb-6 text-[8pt] font-bold tracking-widest text-gray-400 uppercase">Educación</h2>
        <div className="space-y-6">
          {content.education.map((edu, i) => (
            <div key={i}>
              <div className="mb-2 flex items-baseline justify-between border-b border-gray-100 pb-1">
                <h3 className="text-[10pt] font-bold uppercase tracking-tight text-gray-800">{edu.degree}</h3>
                <span className="text-[7pt] text-gray-400 uppercase">{edu.startDate} / {edu.endDate || 'Presente'}</span>
              </div>
              <div className="text-[8pt] font-medium text-gray-500 uppercase">{edu.institution}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-16">
        {/* Skills */}
        <div className="flex-1">
          <h2 className="mb-6 text-[8pt] font-bold tracking-widest text-gray-400 uppercase">Habilidades</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[8pt]">
            {[...content.technicalSkills, ...content.softSkills].map((skill, i) => (
              <span key={i}>• {skill}</span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="flex-1">
          <h2 className="mb-6 text-[8pt] font-bold tracking-widest text-gray-400 uppercase">Idiomas</h2>
          <div className="space-y-2">
            {content.languages.map((lang, i) => (
              <div key={i} className="text-[8pt]">
                <span className="font-bold text-gray-900">{lang.name}</span> — {lang.level}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
