import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CvTemplateProps } from "@/types/cv-template";

const styles = StyleSheet.create({
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

export const ModernTemplate = ({ content }: CvTemplateProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.topBar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil Profesional</Text>
          <View style={styles.summaryWrapper}>
            <View style={styles.summaryBar} />
            <Text style={styles.summary}>{content.summary}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Experiencia</Text>
            <View style={styles.sectionDivider} />
          </View>
          {content.experience.map((exp, i) => (
            <View key={i} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <Text style={styles.position}>{exp.position}</Text>
                <Text style={styles.date}>{exp.startDate} - {exp.endDate}</Text>
              </View>
              <Text style={styles.company}>{exp.company}</Text>
              <Text style={styles.description}>{exp.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Educación</Text>
            <View style={styles.sectionDivider} />
          </View>
          {content.education.map((edu, i) => (
            <View key={i} style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontWeight: 'bold' }}>{edu.degree}</Text>
                <Text style={{ fontSize: 9, color: '#475569' }}>{edu.institution}</Text>
              </View>
              <Text style={styles.date}>{edu.startDate} - {edu.endDate}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <View style={styles.sectionDivider} />
          </View>
          <View style={styles.skillsGrid}>
            <View style={styles.skillsCol}>
              <Text style={styles.skillSubTitle}>Técnicas</Text>
              <View style={styles.skillList}>
                {content.skills.map((skill, i) => (
                  <Text key={i} style={styles.skillBadge}>{skill}</Text>
                ))}
              </View>
            </View>
            <View style={styles.skillsCol}>
              <Text style={styles.skillSubTitle}>Idiomas</Text>
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
