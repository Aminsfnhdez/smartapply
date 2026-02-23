import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CvTemplateProps } from "@/types/cv-template";

const styles = StyleSheet.create({
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

export const MinimalistTemplate = ({ content }: CvTemplateProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Curriculum Vitae</Text>
        <Text style={styles.summary}>{content.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Experiencia</Text>
        {content.experience.map((exp, i) => (
          <View key={i} style={styles.experienceItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{exp.position}</Text>
              <Text style={styles.itemDate}>{exp.startDate} / {exp.endDate}</Text>
            </View>
            <Text style={styles.itemCompany}>{exp.company}</Text>
            <Text style={styles.itemDescription}>{exp.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Educación</Text>
        {content.education.map((edu, i) => (
          <View key={i} style={{ marginBottom: 15 }}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{edu.degree}</Text>
              <Text style={styles.itemDate}>{edu.startDate} / {edu.endDate}</Text>
            </View>
            <Text style={styles.itemCompany}>{edu.institution}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoCol}>
          <Text style={styles.sectionLabel}>Habilidades</Text>
          <View style={styles.skillList}>
            {content.skills.map((skill, i) => (
              <Text key={i} style={styles.skillItem}>• {skill}</Text>
            ))}
          </View>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.sectionLabel}>Idiomas</Text>
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
