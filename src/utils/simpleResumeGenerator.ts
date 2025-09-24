import { format } from 'date-fns';

export interface SimpleResumeData {
  personal: {
    fullName: string;
    profession: string;
    location: string;
    email: string;
    website?: string;
    github?: string;
    linkedin?: string;
    about: string;
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
  }>;
  projects: Array<{
    name: string;
    date: string;
    technologies: string[];
    description: string;
    url?: string;
  }>;
  skills: {
    technical: string[];
    tools: string[];
  };
}

export class SimpleResumeGenerator {
  static processPortfolioData(portfolioData: any): SimpleResumeData {
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
        email: 'dev.retifier@gmail.com',
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
    
    return Math.round(totalMonths / 12 * 10) / 10;
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
      }));
  }

  private static processProjects(projects: any[]) {
    return projects
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
      .map(project => ({
        name: project.name || project.project?.name,
        date: project.date,
        technologies: project.technologies || [],
        description: project.description,
        url: project.url || project.project?.url,
      }));
  }

  static generateProfessionalHTML(data: SimpleResumeData): string {
    const metadata = this.getResumeMetadata();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personal.fullName} - Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: white;
            font-size: 11px;
        }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #1f2937; 
            margin-bottom: 8px; 
        }
        .profession { 
            font-size: 16px; 
            color: #2563eb; 
            margin-bottom: 15px; 
        }
        .contact-info { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            flex-wrap: wrap; 
            font-size: 10px; 
            color: #6b7280; 
        }
        .section { margin-bottom: 25px; }
        .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #1f2937; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            border-bottom: 1px solid #e5e7eb; 
            padding-bottom: 5px; 
            margin-bottom: 15px; 
        }
        .experience-item, .project-item { margin-bottom: 20px; }
        .job-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 8px; 
        }
        .job-title { 
            font-size: 13px; 
            font-weight: bold; 
            color: #1f2937; 
        }
        .company { 
            font-size: 12px; 
            color: #2563eb; 
            margin-bottom: 3px; 
        }
        .date-range { 
            font-size: 10px; 
            color: #6b7280; 
            font-style: italic; 
        }
        .description { 
            color: #374151; 
            margin-bottom: 8px; 
            text-align: justify; 
        }
        .technologies { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 5px; 
            margin-top: 8px; 
        }
        .tech-item { 
            background: #f3f4f6; 
            color: #374151; 
            padding: 2px 8px; 
            border-radius: 4px; 
            font-size: 9px; 
        }
        .skills-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
        }
        .skill-category h4 { 
            font-size: 12px; 
            font-weight: bold; 
            color: #1f2937; 
            margin-bottom: 8px; 
        }
        .skills-list { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 5px; 
        }
        .skill-item { 
            background: #eff6ff; 
            color: #1d4ed8; 
            padding: 3px 8px; 
            border-radius: 6px; 
            font-size: 9px; 
            font-weight: 500; 
        }
        .footer { 
            text-align: center; 
            font-size: 9px; 
            color: #9ca3af; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 15px; 
            margin-top: 30px; 
        }
        @media print {
            body { font-size: 10px; }
            .container { padding: 15px; }
            .section { margin-bottom: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="name">${data.personal.fullName}</h1>
            <h2 class="profession">${data.personal.profession}</h2>
            <div class="contact-info">
                <span>${data.personal.location}</span>
                <span>${data.personal.email}</span>
                ${data.personal.website ? `<span>${data.personal.website}</span>` : ''}
                ${data.personal.github ? `<span>GitHub</span>` : ''}
                ${data.personal.linkedin ? `<span>LinkedIn</span>` : ''}
            </div>
        </header>

        <section class="section">
            <h3 class="section-title">Professional Summary</h3>
            <p class="description">${data.personal.about}</p>
        </section>

        <section class="section">
            <h3 class="section-title">Professional Experience</h3>
            ${data.experience.map(job => `
                <div class="experience-item">
                    <div class="job-header">
                        <div>
                            <div class="job-title">${job.position}</div>
                            <div class="company">${job.company}</div>
                        </div>
                        <div class="date-range">${job.startDate} - ${job.endDate}</div>
                    </div>
                    <p class="description">${job.description}</p>
                    <div class="technologies">
                        ${job.technologies.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        </section>

        <section class="section">
            <h3 class="section-title">Key Projects</h3>
            ${data.projects.slice(0, 4).map(project => `
                <div class="project-item">
                    <div class="job-header">
                        <div class="job-title">${project.name}</div>
                        <div class="date-range">${project.date}</div>
                    </div>
                    <p class="description">${project.description}</p>
                    <div class="technologies">
                        ${project.technologies.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        </section>

        <section class="section">
            <h3 class="section-title">Technical Skills</h3>
            <div class="skills-grid">
                <div class="skill-category">
                    <h4>Programming & Frameworks</h4>
                    <div class="skills-list">
                        ${data.skills.technical.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                    </div>
                </div>
                <div class="skill-category">
                    <h4>Tools & Technologies</h4>
                    <div class="skills-list">
                        ${data.skills.tools.map(tool => `<span class="skill-item">${tool}</span>`).join('')}
                    </div>
                </div>
            </div>
        </section>

        <footer class="footer">
            <p>Resume generated on ${metadata.generatedDate} • ${metadata.version} • Dynamically generated from retifier.dev</p>
        </footer>
    </div>
</body>
</html>`;
  }

  static generateCreativeHTML(data: SimpleResumeData): string {
    const metadata = this.getResumeMetadata();
    const initials = data.personal.fullName.split(' ').map(n => n[0]).join('');
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personal.fullName} - Creative Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.5; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-size: 11px;
        }
        .container { 
            display: flex; 
            max-width: 1000px; 
            margin: 0 auto; 
            background: white; 
            min-height: 100vh; 
        }
        .sidebar { 
            width: 35%; 
            background: #1e293b; 
            color: white; 
            padding: 30px; 
        }
        .main-content { 
            width: 65%; 
            padding: 30px; 
        }
        .avatar { 
            width: 80px; 
            height: 80px; 
            border-radius: 50%; 
            background: #3b82f6; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 24px; 
            font-weight: bold; 
            margin: 0 auto 20px; 
        }
        .sidebar-name { 
            font-size: 20px; 
            font-weight: bold; 
            text-align: center; 
            margin-bottom: 8px; 
        }
        .sidebar-profession { 
            font-size: 12px; 
            text-align: center; 
            color: #94a3b8; 
            margin-bottom: 25px; 
        }
        .sidebar-section { margin-bottom: 25px; }
        .sidebar-title { 
            font-size: 12px; 
            font-weight: bold; 
            color: #3b82f6; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            margin-bottom: 12px; 
        }
        .contact-item { 
            display: flex; 
            align-items: center; 
            margin-bottom: 8px; 
            font-size: 10px; 
        }
        .contact-icon { 
            width: 12px; 
            height: 12px; 
            background: #3b82f6; 
            border-radius: 50%; 
            margin-right: 8px; 
        }
        .skill-item { 
            margin-bottom: 12px; 
        }
        .skill-name { 
            font-size: 10px; 
            margin-bottom: 4px; 
        }
        .skill-bar { 
            height: 6px; 
            background: #334155; 
            border-radius: 3px; 
            overflow: hidden; 
        }
        .skill-progress { 
            height: 100%; 
            background: #3b82f6; 
            border-radius: 3px; 
        }
        .main-header { 
            margin-bottom: 30px; 
        }
        .main-name { 
            font-size: 32px; 
            font-weight: bold; 
            color: #1e293b; 
            margin-bottom: 8px; 
        }
        .main-profession { 
            font-size: 16px; 
            color: #3b82f6; 
            font-weight: 600; 
        }
        .section { margin-bottom: 25px; }
        .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #1e293b; 
            margin-bottom: 15px; 
            position: relative; 
            padding-left: 20px; 
        }
        .section-title::before { 
            content: ''; 
            position: absolute; 
            left: 0; 
            top: 4px; 
            width: 12px; 
            height: 12px; 
            background: #3b82f6; 
            border-radius: 50%; 
        }
        .about-text { 
            color: #475569; 
            line-height: 1.6; 
            text-align: justify; 
        }
        .experience-item { 
            margin-bottom: 20px; 
            position: relative; 
            padding-left: 20px; 
        }
        .timeline-dot { 
            position: absolute; 
            left: 0; 
            top: 5px; 
            width: 8px; 
            height: 8px; 
            background: #3b82f6; 
            border-radius: 50%; 
        }
        .job-header { 
            margin-bottom: 8px; 
        }
        .job-title { 
            font-size: 13px; 
            font-weight: bold; 
            color: #1e293b; 
            margin-bottom: 2px; 
        }
        .company-info { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .company { 
            font-size: 11px; 
            color: #3b82f6; 
            font-weight: 500; 
        }
        .date-range { 
            font-size: 9px; 
            color: #64748b; 
            background: #f1f5f9; 
            padding: 2px 8px; 
            border-radius: 10px; 
        }
        .description { 
            color: #475569; 
            font-size: 10px; 
            line-height: 1.5; 
            margin-bottom: 8px; 
        }
        .tech-tags { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 4px; 
        }
        .tech-tag { 
            background: #eff6ff; 
            color: #1d4ed8; 
            padding: 2px 6px; 
            border-radius: 8px; 
            font-size: 8px; 
            font-weight: 500; 
        }
        .project-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
        }
        .project-card { 
            background: #f8fafc; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 3px solid #3b82f6; 
        }
        .project-name { 
            font-size: 12px; 
            font-weight: bold; 
            color: #1e293b; 
            margin-bottom: 5px; 
        }
        .project-date { 
            font-size: 8px; 
            color: #64748b; 
            margin-bottom: 8px; 
        }
        .project-description { 
            font-size: 9px; 
            color: #475569; 
            line-height: 1.4; 
            margin-bottom: 8px; 
        }
        .footer { 
            text-align: center; 
            font-size: 8px; 
            color: #94a3b8; 
            margin-top: 20px; 
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <div class="avatar">${initials}</div>
            <h1 class="sidebar-name">${data.personal.fullName}</h1>
            <p class="sidebar-profession">${data.personal.profession}</p>
            
            <div class="sidebar-section">
                <h3 class="sidebar-title">Contact</h3>
                <div class="contact-item">
                    <div class="contact-icon"></div>
                    <span>${data.personal.location}</span>
                </div>
                <div class="contact-item">
                    <div class="contact-icon"></div>
                    <span>${data.personal.email}</span>
                </div>
                ${data.personal.website ? `
                <div class="contact-item">
                    <div class="contact-icon"></div>
                    <span>Portfolio</span>
                </div>` : ''}
                ${data.personal.github ? `
                <div class="contact-item">
                    <div class="contact-icon"></div>
                    <span>GitHub</span>
                </div>` : ''}
            </div>
            
            <div class="sidebar-section">
                <h3 class="sidebar-title">Core Skills</h3>
                ${data.skills.technical.slice(0, 8).map((skill, index) => {
                  const proficiency = Math.max(70, 95 - (index * 5));
                  return `
                    <div class="skill-item">
                        <div class="skill-name">${skill}</div>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: ${proficiency}%"></div>
                        </div>
                    </div>
                  `;
                }).join('')}
            </div>
            
            <div class="sidebar-section">
                <h3 class="sidebar-title">Tools</h3>
                ${data.skills.tools.slice(0, 6).map(tool => `
                    <div style="color: #cbd5e1; margin-bottom: 4px; font-size: 10px;">• ${tool}</div>
                `).join('')}
            </div>
        </div>
        
        <div class="main-content">
            <header class="main-header">
                <h1 class="main-name">${data.personal.fullName}</h1>
                <h2 class="main-profession">${data.personal.profession}</h2>
            </header>
            
            <section class="section">
                <h3 class="section-title">Professional Summary</h3>
                <p class="about-text">${data.personal.about}</p>
            </section>
            
            <section class="section">
                <h3 class="section-title">Experience</h3>
                ${data.experience.slice(0, 3).map(job => `
                    <div class="experience-item">
                        <div class="timeline-dot"></div>
                        <div class="job-header">
                            <div class="job-title">${job.position}</div>
                            <div class="company-info">
                                <div class="company">${job.company}</div>
                                <div class="date-range">${job.startDate} - ${job.endDate}</div>
                            </div>
                        </div>
                        <p class="description">${job.description.substring(0, 200)}...</p>
                        <div class="tech-tags">
                            ${job.technologies.slice(0, 6).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </section>
            
            <section class="section">
                <h3 class="section-title">Featured Projects</h3>
                <div class="project-grid">
                    ${data.projects.slice(0, 4).map(project => `
                        <div class="project-card">
                            <div class="project-name">${project.name}</div>
                            <div class="project-date">${project.date}</div>
                            <p class="project-description">${project.description.substring(0, 120)}...</p>
                            <div class="tech-tags">
                                ${project.technologies.slice(0, 4).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
            
            <footer class="footer">
                <p>Creative Resume • Generated ${metadata.generatedDate} • ${metadata.version}</p>
            </footer>
        </div>
    </div>
</body>
</html>`;
  }

  static getResumeMetadata() {
    const now = new Date();
    return {
      generatedDate: format(now, 'MMMM dd, yyyy'),
      version: `v${format(now, 'yyyy.MM.dd')}`,
      lastUpdated: format(now, 'yyyy-MM-dd HH:mm:ss'),
    };
  }

  static downloadHTML(htmlContent: string, filename: string) {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default SimpleResumeGenerator;
