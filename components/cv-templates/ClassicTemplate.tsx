import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CvTemplateProps } from "@/types/cv-template";

/** 
 * VERSION PDF (@react-pdf/renderer)
 */
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  summary: {
    marginTop: 8,
    fontSize: 9,
    color: '#4b5563',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 4,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
  },
  entryCompany: {
    fontStyle: 'italic',
    color: '#374151',
    marginBottom: 4,
  },
  description: {
    fontSize: 9,
    textAlign: 'justify',
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    marginRight: 10,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageItem: {
    marginRight: 20,
  },
  bold: {
    fontWeight: 'bold',
  }
});

export const ClassicTemplatePDF = ({ content }: CvTemplateProps) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>RESUMEN PROFESIONAL</Text>
        <Text style={pdfStyles.summary}>{content.summary}</Text>
      </View>

      {/* Experience */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Experiencia Profesional</Text>
        {content.experience.map((exp, i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <View style={pdfStyles.entryHeader}>
              <Text style={pdfStyles.bold}>{exp.position}</Text>
              <Text>{exp.startDate} - {exp.endDate}</Text>
            </View>
            <Text style={pdfStyles.entryCompany}>{exp.company}</Text>
            <Text style={pdfStyles.description}>{exp.description}</Text>
          </View>
        ))}
      </View>

      {/* Education */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Educación</Text>
        {content.education.map((edu, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <View style={pdfStyles.entryHeader}>
              <Text style={pdfStyles.bold}>{edu.degree}</Text>
              <Text>{edu.startDate} - {edu.endDate}</Text>
            </View>
            <Text style={{ color: '#374151' }}>{edu.institution}</Text>
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Habilidades</Text>
        <View style={pdfStyles.skillList}>
          {content.technicalSkills.map((skill, i) => (
            <Text key={i} style={pdfStyles.skillItem}>• {skill}</Text>
          ))}
          {content.softSkills.map((skill, i) => (
            <Text key={i} style={pdfStyles.skillItem}>• {skill}</Text>
          ))}
        </View>
      </View>

      {/* Languages */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Idiomas</Text>
        <View style={pdfStyles.languageGrid}>
          {content.languages.map((lang, i) => (
            <Text key={i} style={pdfStyles.languageItem}>
              <Text style={pdfStyles.bold}>{lang.name}:</Text> {lang.level}
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
export const ClassicTemplate = ({ content }: CvTemplateProps) => {
  return (
    <div className="mx-auto bg-white p-[40pt] text-[10pt] leading-relaxed text-gray-900 shadow-sm" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <header className="mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-tight">RESUMEN PROFESIONAL</h1>
        <p className="mt-2 text-[9pt] text-gray-600">{content.summary}</p>
      </header>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="mb-4 border-b border-gray-300 pb-1 text-sm font-bold uppercase tracking-wide">Experiencia Profesional</h2>
        <div className="space-y-4">
          {content.experience.map((exp, i) => (
            <div key={i}>
              <div className="flex justify-between font-bold">
                <span>{exp.position}</span>
                <span className="text-[9pt] font-normal">{exp.startDate} - {exp.endDate || 'Presente'}</span>
              </div>
              <div className="italic text-gray-700">{exp.company}</div>
              <p className="mt-1 text-justify text-[9pt] text-gray-600">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="mb-4 border-b border-gray-300 pb-1 text-sm font-bold uppercase tracking-wide">Educación</h2>
        <div className="space-y-3">
          {content.education.map((edu, i) => (
            <div key={i} className="flex justify-between">
              <div>
                <div className="font-bold">{edu.degree}</div>
                <div className="text-gray-700">{edu.institution}</div>
              </div>
              <span className="text-[9pt]">{edu.startDate} - {edu.endDate || 'Presente'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h2 className="mb-4 border-b border-gray-300 pb-1 text-sm font-bold uppercase tracking-wide">Habilidades</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9pt]">
          {[...content.technicalSkills, ...content.softSkills].map((skill, i) => (
            <span key={i}>• {skill}</span>
          ))}
        </div>
      </section>

      {/* Complementary Education */}
      {content.complementaryEducation && content.complementaryEducation.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 border-b border-gray-300 pb-1 text-sm font-bold uppercase tracking-wide">Educación Complementaria</h2>
          <div className="space-y-2">
            {content.complementaryEducation.map((item, i) => (
              <div key={i} className="flex justify-between text-[9pt]">
                <div>
                  <span className="font-bold">{item.program}</span> • {item.institution}
                </div>
                <span>{item.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      <section>
        <h2 className="mb-4 border-b border-gray-300 pb-1 text-sm font-bold uppercase tracking-wide">Idiomas</h2>
        <div className="flex flex-wrap gap-x-6 text-[9pt]">
          {content.languages.map((lang, i) => (
            <div key={i}>
              <span className="font-bold">{lang.name}:</span> {lang.level}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
