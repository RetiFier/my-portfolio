import { format } from 'date-fns';

export interface ResumeData {
  personal: {
    fullName: string;
    profession: string;
    location: string;
    email: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    about: string;
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
    achievements?: string[];
  }>;
  projects: Array<{
    name: string;
    date: string;
    technologies: string[];
    description: string;
    url?: string;
    github?: string;
  }>;
  skills: {
    technical: string[];
    tools: string[];
  };
  education?: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

export interface ResumeOptions {
  template: 'professional' | 'creative';
  includeProjects: boolean;
  maxProjects: number;
  includeAllSkills: boolean;
  customSections?: string[];
}

export class ResumeDataProcessor {
  static processPortfolioData(portfolioData: any): ResumeData {
    const profile = portfolioData.profile;
    const jobs = portfolioData.jobs || [];
    const projects = portfolioData.projects || [];

    // Calculate years of experience
    const totalExperience = this.calculateExperience(jobs);
    
    return {
      personal: {
        fullName: `${profile.fname} ${profile.lname}`,
        profession: profile.profession,
        location: profile.location,
        email: 'dev.retifier@gmail.com', // You might want to add this to profile.yaml
        website: 'https://retifier.dev',
        github: 'https://github.com/RetiFier',
        linkedin: 'https://linkedin.com/in/retifier',
        about: this.enhanceAboutSection(profile.about, totalExperience),
      },
      experience: this.processExperience(jobs),
      projects: this.processProjects(projects),
      skills: {
        technical: profile.skills || [],
        tools: profile.tools || [],
      },
    };
  }

  private static calculateExperience(jobs: any[]): number {
    if (!jobs.length) return 0;
    
    const totalMonths = jobs.reduce((total, job) => {
      const start = new Date(job.fromDate);
      const end = job.toDate === 'Present' ? new Date() : new Date(job.toDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
      return total + months;
    }, 0);
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
  }

  private static enhanceAboutSection(originalAbout: string, experience: number): string {
    const currentYear = new Date().getFullYear();
    const enhancedAbout = originalAbout
      .replace(/hands-on experience/g, `${experience}+ years of hands-on experience`)
      .replace(/\.$/, `. As of ${format(new Date(), 'MMMM yyyy')}, I continue to stay current with emerging technologies and best practices in full-stack development.`);
    
    return enhancedAbout;
  }

  private static processExperience(jobs: any[]) {
    return jobs
      .sort((a, b) => {
        const dateA = a.toDate === 'Present' ? new Date() : new Date(a.toDate);
        const dateB = b.toDate === 'Present' ? new Date() : new Date(b.toDate);
        return dateB.getTime() - dateA.getTime();
      })
      .map(job => ({
        company: job.company.name,
        position: job.jobTitle,
        startDate: job.fromDate,
        endDate: job.toDate,
        description: job.description,
        technologies: job.technologies || [],
        achievements: this.extractAchievements(job.description),
      }));
  }

  private static processProjects(projects: any[]) {
    return projects
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6) // Limit to most recent 6 projects
      .map(project => ({
        name: project.name || project.project?.name,
        date: project.date,
        technologies: project.technologies || [],
        description: project.description,
        url: project.url || project.project?.url,
        github: project.url?.includes('github') ? project.url : undefined,
      }));
  }

  private static extractAchievements(description: string): string[] {
    const achievements: string[] = [];
    
    // Look for quantifiable achievements
    const patterns = [
      /(\d+[,\d]*)\s*(applications?|projects?|websites?)/gi,
      /(\d+[,\d]*)\s*(users?|clients?|companies?)/gi,
      /(increased|improved|reduced|optimized|enhanced|developed|built|created|implemented)/gi,
    ];
    
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach(sentence => {
      patterns.forEach(pattern => {
        if (pattern.test(sentence.trim())) {
          achievements.push(sentence.trim());
        }
      });
    });
    
    return achievements.slice(0, 3); // Limit to top 3 achievements per role
  }

  static generateTimestampedContent(baseContent: string): string {
    const now = new Date();
    const timestamp = format(now, 'MMMM yyyy');
    
    return baseContent.replace(
      /\b(current|recent|latest|up-to-date)\b/gi,
      `$1 (as of ${timestamp})`
    );
  }

  static getResumeMetadata() {
    const now = new Date();
    return {
      generatedDate: format(now, 'MMMM dd, yyyy'),
      version: `v${format(now, 'yyyy.MM.dd')}`,
      lastUpdated: format(now, 'yyyy-MM-dd HH:mm:ss'),
    };
  }
}

export default ResumeDataProcessor;
