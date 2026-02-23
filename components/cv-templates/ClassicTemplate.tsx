import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { CvTemplateProps } from "@/types/cv-template";

// Registro de fuentes si fuera necesario (usaremos las estándar por ahora)

const styles = StyleSheet.create({
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

export const ClassicTemplate = ({ content }: CvTemplateProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RESUMEN PROFESIONAL</Text>
        <Text style={styles.summary}>{content.summary}</Text>
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experiencia Profesional</Text>
        {content.experience.map((exp, i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <View style={styles.entryHeader}>
              <Text style={styles.bold}>{exp.position}</Text>
              <Text>{exp.startDate} - {exp.endDate}</Text>
            </View>
            <Text style={styles.entryCompany}>{exp.company}</Text>
            <Text style={styles.description}>{exp.description}</Text>
          </View>
        ))}
      </View>

      {/* Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Educación</Text>
        {content.education.map((edu, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <View style={styles.entryHeader}>
              <Text style={styles.bold}>{edu.degree}</Text>
              <Text>{edu.startDate} - {edu.endDate}</Text>
            </View>
            <Text style={{ color: '#374151' }}>{edu.institution}</Text>
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habilidades</Text>
        <View style={styles.skillList}>
          {content.skills.map((skill, i) => (
            <Text key={i} style={styles.skillItem}>• {skill}</Text>
          ))}
        </View>
      </View>

      {/* Languages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Idiomas</Text>
        <View style={styles.languageGrid}>
          {content.languages.map((lang, i) => (
            <Text key={i} style={styles.languageItem}>
              <Text style={styles.bold}>{lang.name}:</Text> {lang.level}
            </Text>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
