import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link, Svg, Circle, Rect, Path } from '@react-pdf/renderer';
import { ResumeData } from '../../utils/resumeGenerator';

// Register fonts for creative typography
Font.register({
  family: 'Poppins',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2' },
    { src: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2', fontWeight: 700 },
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    fontFamily: 'Poppins',
    fontSize: 10,
  },
  sidebar: {
    width: '35%',
    backgroundColor: '#1e293b',
    padding: 30,
    color: '#ffffff',
  },
  mainContent: {
    width: '65%',
    padding: 30,
    backgroundColor: '#ffffff',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 24,
    fontWeight: 700,
    color: '#ffffff',
  },
  sidebarName: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 5,
    color: '#ffffff',
  },
  sidebarProfession: {
    fontSize: 12,
    textAlign: 'center',
    color: '#94a3b8',
    marginBottom: 20,
  },
  sidebarSection: {
    marginBottom: 25,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#3b82f6',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    width: 12,
    height: 12,
    marginRight: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  contactText: {
    fontSize: 9,
    color: '#cbd5e1',
    flex: 1,
  },
  skillItem: {
    marginBottom: 12,
  },
  skillName: {
    fontSize: 10,
    color: '#ffffff',
    marginBottom: 4,
  },
  skillBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillProgress: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  mainHeader: {
    marginBottom: 30,
    position: 'relative',
  },
  mainName: {
    fontSize: 32,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 8,
  },
  mainProfession: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: 600,
  },
  decorativeElement: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 60,
    height: 60,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 15,
    position: 'relative',
    paddingLeft: 20,
  },
  sectionIcon: {
    position: 'absolute',
    left: 0,
    top: 2,
    width: 12,
    height: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  aboutText: {
    color: '#475569',
    lineHeight: 1.6,
    textAlign: 'justify',
    fontSize: 11,
  },
  experienceItem: {
    marginBottom: 20,
    position: 'relative',
    paddingLeft: 20,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 5,
    width: 8,
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 3,
    top: 13,
    width: 2,
    height: '100%',
    backgroundColor: '#e2e8f0',
  },
  jobHeader: {
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 2,
  },
  companyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  company: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: 500,
  },
  dateRange: {
    fontSize: 9,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '2 8',
    borderRadius: 10,
  },
  description: {
    color: '#475569',
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  techTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  techTag: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '2 6',
    borderRadius: 8,
    fontSize: 8,
    fontWeight: 500,
  },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  projectCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    borderLeft: 3,
    borderLeftColor: '#3b82f6',
  },
  projectName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 5,
  },
  projectDate: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
  brandingWatermark: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    fontSize: 8,
    color: '#e2e8f0',
    transform: 'rotate(-45deg)',
    transformOrigin: 'center',
  },
});

interface CreativeTemplateProps {
  data: ResumeData;
  metadata: {
    generatedDate: string;
    version: string;
  };
}

const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ data, metadata }) => {
  const getSkillLevel = (skill: string): number => {
    // Simulate skill proficiency based on position in array (more important skills first)
    const index = data.skills.technical.indexOf(skill);
    if (index === -1) return 80;
    return Math.max(70, 95 - (index * 5));
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>
                {getInitials(data.personal.fullName)}
              </Text>
            </View>
            <Text style={styles.sidebarName}>{data.personal.fullName}</Text>
            <Text style={styles.sidebarProfession}>{data.personal.profession}</Text>
          </View>

          {/* Contact Information */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Contact</Text>
            <View style={styles.contactItem}>
              <View style={styles.contactIcon} />
              <Text style={styles.contactText}>{data.personal.location}</Text>
            </View>
            <View style={styles.contactItem}>
              <View style={styles.contactIcon} />
              <Text style={styles.contactText}>{data.personal.email}</Text>
            </View>
            {data.personal.website && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon} />
                <Link src={data.personal.website}>
                  <Text style={styles.contactText}>Portfolio</Text>
                </Link>
              </View>
            )}
            {data.personal.github && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon} />
                <Link src={data.personal.github}>
                  <Text style={styles.contactText}>GitHub</Text>
                </Link>
              </View>
            )}
          </View>

          {/* Top Skills */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Core Skills</Text>
            {data.skills.technical.slice(0, 8).map((skill, index) => (
              <View key={index} style={styles.skillItem}>
                <Text style={styles.skillName}>{skill}</Text>
                <View style={styles.skillBar}>
                  <View 
                    style={[
                      styles.skillProgress, 
                      { width: `${getSkillLevel(skill)}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Tools */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Tools</Text>
            {data.skills.tools.slice(0, 6).map((tool, index) => (
              <Text key={index} style={[styles.contactText, { marginBottom: 4 }]}>
                • {tool}
              </Text>
            ))}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.mainHeader}>
            <Text style={styles.mainName}>{data.personal.fullName}</Text>
            <Text style={styles.mainProfession}>{data.personal.profession}</Text>
            
            {/* Decorative SVG Element */}
            <View style={styles.decorativeElement}>
              <Svg width="60" height="60" viewBox="0 0 60 60">
                <Circle cx="30" cy="30" r="25" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                <Circle cx="30" cy="30" r="15" fill="#3b82f6" opacity="0.1" />
                <Circle cx="30" cy="30" r="5" fill="#3b82f6" />
              </Svg>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <View style={styles.sectionIcon} />
              Professional Summary
            </Text>
            <Text style={styles.aboutText}>{data.personal.about}</Text>
          </View>

          {/* Experience */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <View style={styles.sectionIcon} />
              Experience
            </Text>
            {data.experience.slice(0, 3).map((job, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.timelineDot} />
                {index < data.experience.length - 1 && <View style={styles.timelineLine} />}
                
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.position}</Text>
                  <View style={styles.companyInfo}>
                    <Text style={styles.company}>{job.company}</Text>
                    <Text style={styles.dateRange}>
                      {job.startDate} - {job.endDate}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.description}>
                  {job.description.substring(0, 200)}...
                </Text>
                
                <View style={styles.techTags}>
                  {job.technologies.slice(0, 6).map((tech, idx) => (
                    <Text key={idx} style={styles.techTag}>{tech}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Featured Projects */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <View style={styles.sectionIcon} />
              Featured Projects
            </Text>
            <View style={styles.projectGrid}>
              {data.projects.slice(0, 4).map((project, index) => (
                <View key={index} style={styles.projectCard}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectDate}>{project.date}</Text>
                  <Text style={styles.projectDescription}>
                    {project.description.substring(0, 120)}...
                  </Text>
                  <View style={styles.techTags}>
                    {project.technologies.slice(0, 4).map((tech, idx) => (
                      <Text key={idx} style={styles.techTag}>{tech}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>
              Creative Resume • Generated {metadata.generatedDate} • {metadata.version}
            </Text>
          </View>

          {/* Branding Watermark */}
          <View style={styles.brandingWatermark}>
            <Text>RETIFIER.DEV</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CreativeTemplate;
