import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { ResumeData } from '../../utils/resumeGenerator';

// Register fonts for better typography
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfAZhrib2Bg-4.woff2', fontWeight: 600 },
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 5,
  },
  profession: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    fontSize: 9,
    color: '#6b7280',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 3,
  },
  aboutText: {
    textAlign: 'justify',
    color: '#374151',
    lineHeight: 1.5,
  },
  experienceItem: {
    marginBottom: 15,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1f2937',
  },
  company: {
    fontSize: 11,
    color: '#2563eb',
    marginBottom: 2,
  },
  dateRange: {
    fontSize: 9,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  description: {
    color: '#374151',
    marginBottom: 5,
    textAlign: 'justify',
  },
  technologies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
  },
  techItem: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '2 6',
    borderRadius: 3,
    fontSize: 8,
  },
  projectItem: {
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  projectName: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1f2937',
  },
  projectDate: {
    fontSize: 9,
    color: '#6b7280',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillCategory: {
    marginBottom: 10,
  },
  skillCategoryTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 5,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skillItem: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '3 8',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 500,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  achievements: {
    marginTop: 5,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563eb',
    marginRight: 6,
    marginTop: 3,
  },
  achievementText: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
  },
});

interface ProfessionalTemplateProps {
  data: ResumeData;
  metadata: {
    generatedDate: string;
    version: string;
  };
}

const ProfessionalTemplate: React.FC<ProfessionalTemplateProps> = ({ data, metadata }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.personal.fullName}</Text>
          <Text style={styles.profession}>{data.personal.profession}</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Text>{data.personal.location}</Text>
            </View>
            <View style={styles.contactItem}>
              <Text>{data.personal.email}</Text>
            </View>
            {data.personal.website && (
              <View style={styles.contactItem}>
                <Link src={data.personal.website}>
                  <Text>{data.personal.website}</Text>
                </Link>
              </View>
            )}
            {data.personal.github && (
              <View style={styles.contactItem}>
                <Link src={data.personal.github}>
                  <Text>GitHub</Text>
                </Link>
              </View>
            )}
            {data.personal.linkedin && (
              <View style={styles.contactItem}>
                <Link src={data.personal.linkedin}>
                  <Text>LinkedIn</Text>
                </Link>
              </View>
            )}
          </View>
        </View>

        {/* Professional Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.aboutText}>{data.personal.about}</Text>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {data.experience.map((job, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.jobTitle}>{job.position}</Text>
                  <Text style={styles.company}>{job.company}</Text>
                </View>
                <Text style={styles.dateRange}>
                  {job.startDate} - {job.endDate}
                </Text>
              </View>
              <Text style={styles.description}>{job.description}</Text>
              
              {job.achievements && job.achievements.length > 0 && (
                <View style={styles.achievements}>
                  {job.achievements.map((achievement, idx) => (
                    <View key={idx} style={styles.achievementItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.achievementText}>{achievement}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.technologies}>
                {job.technologies.map((tech, idx) => (
                  <Text key={idx} style={styles.techItem}>{tech}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Key Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Projects</Text>
          {data.projects.slice(0, 4).map((project, index) => (
            <View key={index} style={styles.projectItem}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectDate}>{project.date}</Text>
              </View>
              <Text style={styles.description}>{project.description}</Text>
              <View style={styles.technologies}>
                {project.technologies.map((tech, idx) => (
                  <Text key={idx} style={styles.techItem}>{tech}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Technical Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          <View style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>Programming & Frameworks</Text>
            <View style={styles.skillsList}>
              {data.skills.technical.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>{skill}</Text>
              ))}
            </View>
          </View>
          <View style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>Tools & Technologies</Text>
            <View style={styles.skillsList}>
              {data.skills.tools.map((tool, index) => (
                <Text key={index} style={styles.skillItem}>{tool}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Resume generated on {metadata.generatedDate} • {metadata.version} • 
            This document was dynamically generated from retifier.dev
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProfessionalTemplate;
