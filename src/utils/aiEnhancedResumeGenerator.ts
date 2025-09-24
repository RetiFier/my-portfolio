import { format } from 'date-fns';

// AI Enhancement Service
class AIResumeEnhancer {
  private static readonly API_BASE = 'https://openrouter.ai/api/v1';
  
  static async enhanceResumeContent(portfolioData: any): Promise<any> {
    try {
      const prompt = this.buildEnhancementPrompt(portfolioData);
      
      const response = await fetch(`${this.API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GATSBY_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://retifier.dev',
          'X-Title': 'Retifier Portfolio Resume Generator'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume writer and career consultant. Your task is to enhance resume content to be more impactful, quantifiable, and recruiter-friendly while maintaining accuracy and authenticity.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`AI enhancement failed: ${response.statusText}`);
      }

      const data = await response.json();
      const enhancedContent = JSON.parse(data.choices[0].message.content);
      
      return {
        ...portfolioData,
        enhanced: true,
        ...enhancedContent
      };
    } catch (error) {
      console.warn('AI enhancement failed, using original content:', error);
      return portfolioData;
    }
  }

  private static buildEnhancementPrompt(portfolioData: any): string {
    const { profile, jobs, projects } = portfolioData;
    
    return `
Please enhance the following portfolio data for a professional resume. Focus on making descriptions more impactful, quantifiable, and recruiter-friendly. Return the response as valid JSON with the same structure but enhanced content.

PORTFOLIO DATA:
${JSON.stringify({ profile, jobs: jobs?.slice(0, 5), projects: projects?.slice(0, 6) }, null, 2)}

ENHANCEMENT REQUIREMENTS:
1. **Professional Summary**: Rewrite to be more compelling, include years of experience, key technologies, and value proposition
2. **Job Descriptions**: 
   - Add quantifiable achievements where possible
   - Use strong action verbs
   - Highlight impact and results
   - Keep technical accuracy
3. **Project Descriptions**:
   - Emphasize technical challenges solved
   - Add estimated impact or scale
   - Highlight innovative approaches
4. **Skills**: Organize by proficiency and relevance
5. **Overall**: Ensure ATS-friendly language and recruiter appeal

Return JSON format:
{
  "profile": {
    "enhancedAbout": "enhanced professional summary",
    "keyAchievements": ["achievement 1", "achievement 2", "achievement 3"],
    "skills": ["organized skills array"],
    "tools": ["organized tools array"]
  },
  "jobs": [
    {
      "enhancedDescription": "enhanced job description",
      "keyAchievements": ["quantified achievement 1", "quantified achievement 2"],
      "impactMetrics": "estimated impact or scale"
    }
  ],
  "projects": [
    {
      "enhancedDescription": "enhanced project description", 
      "technicalHighlights": ["technical challenge 1", "technical challenge 2"],
      "estimatedImpact": "scale or impact description"
    }
  ]
}`;
  }
}

export interface EnhancedResumeData {
  personal: {
    fullName: string;
    profession: string;
    location: string;
    email: string;
    website?: string;
    github?: string;
    linkedin?: string;
    about: string;
    keyAchievements: string[];
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    enhancedDescription?: string;
    keyAchievements: string[];
    impactMetrics?: string;
    technologies: string[];
  }>;
  projects: Array<{
    name: string;
    date: string;
    technologies: string[];
    description: string;
    enhancedDescription?: string;
    technicalHighlights: string[];
    estimatedImpact?: string;
    url?: string;
  }>;
  skills: {
    technical: string[];
    tools: string[];
  };
  metadata: {
    generatedDate: string;
    version: string;
    aiEnhanced: boolean;
  };
}

export class AIEnhancedResumeGenerator {
  static async processPortfolioData(portfolioData: any): Promise<EnhancedResumeData> {
    // First enhance with AI
    const enhancedData = await AIResumeEnhancer.enhanceResumeContent(portfolioData);
    
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
        about: enhancedData.profile?.enhancedAbout || this.enhanceAboutSection(profile.about, totalExperience),
        keyAchievements: enhancedData.profile?.keyAchievements || this.extractKeyAchievements(jobs, projects),
      },
      experience: this.processExperience(jobs, enhancedData.jobs || []),
      projects: this.processProjects(projects, enhancedData.projects || []),
      skills: {
        technical: enhancedData.profile?.skills || profile.skills || [],
        tools: enhancedData.profile?.tools || profile.tools || [],
      },
      metadata: this.getResumeMetadata(enhancedData.enhanced || false),
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
    return `${originalAbout.replace(/hands-on experience/g, `${experience}+ years of hands-on experience`)} 
    
Specialized in building scalable web applications with modern technologies, delivering high-quality solutions that drive business growth. Proven track record of collaborating with cross-functional teams and adapting to emerging technologies. As of ${format(new Date(), 'MMMM yyyy')}, I continue to stay current with industry best practices and cutting-edge development methodologies.`;
  }

  private static extractKeyAchievements(jobs: any[], projects: any[]): string[] {
    const achievements = [
      `${jobs.length}+ professional roles across diverse technology stacks`,
      `${projects.length}+ completed projects showcasing full-stack capabilities`,
      'Expertise in modern web technologies including React, Node.js, and TypeScript',
      'Experience with both startup environments and established companies'
    ];
    
    return achievements;
  }

  private static processExperience(jobs: any[], enhancedJobs: any[]) {
    return jobs
      .sort((a, b) => {
        const dateA = a.toDate === 'Present' ? new Date() : new Date(a.toDate);
        const dateB = b.toDate === 'Present' ? new Date() : new Date(b.toDate);
        return dateB.getTime() - dateA.getTime();
      })
      .map((job, index) => {
        const enhanced = enhancedJobs[index] || {};
        return {
          company: job.company.name,
          position: job.jobTitle,
          startDate: job.fromDate,
          endDate: job.toDate,
          description: job.description,
          enhancedDescription: enhanced.enhancedDescription,
          keyAchievements: enhanced.keyAchievements || this.extractJobAchievements(job.description),
          impactMetrics: enhanced.impactMetrics,
          technologies: job.technologies || [],
        };
      });
  }

  private static processProjects(projects: any[], enhancedProjects: any[]) {
    return projects
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
      .map((project, index) => {
        const enhanced = enhancedProjects[index] || {};
        return {
          name: project.name || project.project?.name,
          date: project.date,
          technologies: project.technologies || [],
          description: project.description,
          enhancedDescription: enhanced.enhancedDescription,
          technicalHighlights: enhanced.technicalHighlights || this.extractTechnicalHighlights(project.description),
          estimatedImpact: enhanced.estimatedImpact,
          url: project.url || project.project?.url,
        };
      });
  }

  private static extractJobAchievements(description: string): string[] {
    const achievements: string[] = [];
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach(sentence => {
      if (sentence.match(/(developed|built|created|implemented|improved|increased|reduced)/i)) {
        achievements.push(sentence.trim());
      }
    });
    
    return achievements.slice(0, 3);
  }

  private static extractTechnicalHighlights(description: string): string[] {
    const highlights: string[] = [];
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach(sentence => {
      if (sentence.match(/(architecture|scalable|performance|optimization|integration)/i)) {
        highlights.push(sentence.trim());
      }
    });
    
    return highlights.slice(0, 2);
  }

  static generateEnhancedHTML(data: EnhancedResumeData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personal.fullName} - AI-Enhanced Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2d3748; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        .ai-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255,255,255,0.2);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            backdrop-filter: blur(10px);
        }
        .name { 
            font-size: 36px; 
            font-weight: 700; 
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .profession { 
            font-size: 18px; 
            opacity: 0.9;
            margin-bottom: 20px;
            font-weight: 500;
        }
        .contact-info { 
            display: flex; 
            justify-content: center; 
            gap: 30px; 
            flex-wrap: wrap; 
            font-size: 14px;
            opacity: 0.9;
        }
        .content { padding: 40px; }
        .section { margin-bottom: 35px; }
        .section-title { 
            font-size: 20px; 
            font-weight: 700; 
            color: #2d3748;
            margin-bottom: 20px;
            position: relative;
            padding-left: 25px;
        }
        .section-title::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 20px;
            background: linear-gradient(135deg, #4299e1, #3182ce);
            border-radius: 2px;
        }
        .about-text { 
            font-size: 16px;
            line-height: 1.7;
            color: #4a5568;
            margin-bottom: 20px;
        }
        .achievements-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .achievement-item {
            background: #f7fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #4299e1;
            font-size: 14px;
            color: #4a5568;
        }
        .experience-item { 
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 4px solid #4299e1;
        }
        .job-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .job-title { 
            font-size: 18px; 
            font-weight: 700; 
            color: #2d3748;
        }
        .company { 
            font-size: 16px; 
            color: #4299e1; 
            font-weight: 600;
            margin-bottom: 5px;
        }
        .date-range { 
            font-size: 14px; 
            color: #718096;
            background: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-weight: 500;
        }
        .description { 
            color: #4a5568; 
            margin-bottom: 15px;
            font-size: 15px;
            line-height: 1.6;
        }
        .enhanced-content {
            background: #e6fffa;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 3px solid #38b2ac;
        }
        .key-achievements {
            margin-top: 15px;
        }
        .achievement-list {
            list-style: none;
            padding: 0;
        }
        .achievement-list li {
            background: white;
            margin: 8px 0;
            padding: 10px 15px;
            border-radius: 6px;
            border-left: 3px solid #38b2ac;
            font-size: 14px;
            color: #2d3748;
        }
        .achievement-list li::before {
            content: '✓';
            color: #38b2ac;
            font-weight: bold;
            margin-right: 10px;
        }
        .technologies { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 8px; 
            margin-top: 15px;
        }
        .tech-item { 
            background: linear-gradient(135deg, #4299e1, #3182ce);
            color: white;
            padding: 6px 12px; 
            border-radius: 20px; 
            font-size: 12px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .project-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-top: 4px solid #4299e1;
            transition: transform 0.2s ease;
        }
        .project-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .project-name { 
            font-size: 16px; 
            font-weight: 700; 
            color: #2d3748;
            margin-bottom: 8px;
        }
        .project-date { 
            font-size: 12px; 
            color: #718096;
            margin-bottom: 12px;
            font-weight: 500;
        }
        .skills-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        .skill-category h4 { 
            font-size: 16px; 
            font-weight: 700; 
            color: #2d3748;
            margin-bottom: 15px;
        }
        .skills-list { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 8px;
        }
        .skill-item { 
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 8px 14px; 
            border-radius: 20px; 
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .footer { 
            background: #2d3748;
            color: white;
            text-align: center; 
            padding: 20px;
            font-size: 12px;
            opacity: 0.8;
        }
        .ai-enhanced-label {
            color: #38b2ac;
            font-weight: 600;
        }
        @media print {
            body { 
                background: white; 
                padding: 0;
            }
            .container { 
                box-shadow: none; 
                border-radius: 0;
            }
            .project-card:hover {
                transform: none;
                box-shadow: none;
            }
        }
        @media (max-width: 768px) {
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .name { font-size: 28px; }
            .contact-info { gap: 15px; }
            .skills-section { grid-template-columns: 1fr; gap: 20px; }
            .job-header { flex-direction: column; align-items: flex-start; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            ${data.metadata.aiEnhanced ? '<div class="ai-badge">🤖 AI Enhanced</div>' : ''}
            <h1 class="name">${data.personal.fullName}</h1>
            <h2 class="profession">${data.personal.profession}</h2>
            <div class="contact-info">
                <span>📍 ${data.personal.location}</span>
                <span>📧 ${data.personal.email}</span>
                ${data.personal.website ? `<span>🌐 Portfolio</span>` : ''}
                ${data.personal.github ? `<span>💻 GitHub</span>` : ''}
                ${data.personal.linkedin ? `<span>💼 LinkedIn</span>` : ''}
            </div>
        </header>

        <div class="content">
            <section class="section">
                <h3 class="section-title">Professional Summary</h3>
                <p class="about-text">${data.personal.about}</p>
                
                <div class="achievements-grid">
                    ${data.personal.keyAchievements.map(achievement => `
                        <div class="achievement-item">${achievement}</div>
                    `).join('')}
                </div>
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
                        
                        ${job.enhancedDescription ? `
                            <div class="enhanced-content">
                                <strong class="ai-enhanced-label">AI Enhanced Description:</strong>
                                <p style="margin-top: 8px;">${job.enhancedDescription}</p>
                            </div>
                        ` : `<p class="description">${job.description}</p>`}
                        
                        ${job.impactMetrics ? `
                            <div style="background: #fff5f5; padding: 10px; border-radius: 6px; margin: 10px 0; border-left: 3px solid #f56565;">
                                <strong>Impact:</strong> ${job.impactMetrics}
                            </div>
                        ` : ''}
                        
                        ${job.keyAchievements.length > 0 ? `
                            <div class="key-achievements">
                                <strong>Key Achievements:</strong>
                                <ul class="achievement-list">
                                    ${job.keyAchievements.map(achievement => `<li>${achievement}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        <div class="technologies">
                            ${job.technologies.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </section>

            <section class="section">
                <h3 class="section-title">Featured Projects</h3>
                <div class="projects-grid">
                    ${data.projects.slice(0, 4).map(project => `
                        <div class="project-card">
                            <div class="project-name">${project.name}</div>
                            <div class="project-date">${project.date}</div>
                            
                            ${project.enhancedDescription ? `
                                <div class="enhanced-content">
                                    <strong class="ai-enhanced-label">Enhanced:</strong>
                                    <p style="margin-top: 5px; font-size: 14px;">${project.enhancedDescription}</p>
                                </div>
                            ` : `<p class="description" style="font-size: 14px;">${project.description}</p>`}
                            
                            ${project.technicalHighlights.length > 0 ? `
                                <div style="margin: 10px 0;">
                                    <strong style="font-size: 13px;">Technical Highlights:</strong>
                                    <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                                        ${project.technicalHighlights.map(highlight => `<li>${highlight}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${project.estimatedImpact ? `
                                <div style="background: #f0fff4; padding: 8px; border-radius: 4px; margin: 8px 0; font-size: 12px;">
                                    <strong>Impact:</strong> ${project.estimatedImpact}
                                </div>
                            ` : ''}
                            
                            <div class="technologies">
                                ${project.technologies.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <section class="section">
                <h3 class="section-title">Technical Skills</h3>
                <div class="skills-section">
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
        </div>

        <footer class="footer">
            <p>
                ${data.metadata.aiEnhanced ? '🤖 AI-Enhanced Resume' : 'Professional Resume'} • 
                Generated ${data.metadata.generatedDate} • 
                ${data.metadata.version} • 
                Powered by retifier.dev
            </p>
        </footer>
    </div>
</body>
</html>`;
  }

  static getResumeMetadata(aiEnhanced: boolean = false) {
    const now = new Date();
    return {
      generatedDate: format(now, 'MMMM dd, yyyy'),
      version: `v${format(now, 'yyyy.MM.dd')}`,
      lastUpdated: format(now, 'yyyy-MM-dd HH:mm:ss'),
      aiEnhanced,
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

export default AIEnhancedResumeGenerator;
