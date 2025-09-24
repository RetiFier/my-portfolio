import { graphql } from "gatsby";
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { Seo } from '../components/Seo';
import { Typed } from '../components/Typed';
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { FiGithub, FiExternalLink, FiMapPin, FiMail, FiCalendar, FiTrendingUp, FiCode, FiUsers, FiAward, FiStar, FiZap, FiTarget } from "react-icons/fi";
import AISection from '../components/Enhanced/AISection';
import IntelligentCodePlayground from '../components/Enhanced/IntelligentCodePlayground';
import AdvancedGamification from '../components/Enhanced/SimpleGamification';
import { getCachedEnhancedDescription } from '../utils/aiEnhancer';
import LazySection from '../components/Performance/LazySection';
import PerformanceMonitor from '../components/Performance/PerformanceMonitor';
import AccessibilityProvider from '../components/Accessibility/AccessibilityProvider';
import SkipLinks from '../components/Accessibility/SkipLinks';
import AIEnhancedResumeDownloader from '../components/Resume/AIEnhancedResumeDownloader';

// Night Owl Theme Colors
const nightOwl = {
  bg: '#011627',
  surface: '#0b2942',
  darker: '#001122',
  accent: '#82aaff',
  secondary: '#c792ea',
  success: '#addb67',
  warning: '#ffcb8b',
  error: '#ff5874',
  text: '#d6deeb',
  textDim: '#5f7e97',
  border: '#1d3b53',
  selection: '#1d3b53'
};

interface EnhancedPortfolioProps {
  data: {
    profile: {
      nodes: Array<{
        profile: {
          initials: string;
          fname: string;
          lname: string;
          profession: string;
          image: any;
          location: string;
          relocation: boolean;
          company: string;
          for_hire: boolean;
          about: string;
          skills: string[];
          tools: string[];
        }
      }>
    };
    social: {
      nodes: Array<{
        name: string;
        url: string;
      }>
    };
    job: {
      nodes: Array<{
        company: {
          name: string;
          logo: any;
          url: string;
        };
        jobTitle: string;
        fromDate: string;
        toDate: string;
        description: string;
        technologies: string[];
      }>
    };
    project: {
      nodes: Array<{
        project: {
          name: string;
          logo: any;
          url: string;
        };
        name: string;
        date: string;
        description: string;
        technologies: string[];
      }>
    };
  };
  location: Location;
}

// Enhanced Hero Section with Live Coding Animation
const EnhancedHero = ({ profile, social }: { profile: any; social: any[] }) => {
  const [stats, setStats] = useState({
    experience: 0,
    projects: 0,
    commits: 0,
    technologies: 0
  });

  const codeSnippets = [
    'const developer = {',
    '  name: "Reti Fier",',
    '  role: "Full Stack Developer",',
    '  experience: "5+ years",',
    '  passion: "Building amazing things",',
    '  currentFocus: ["React", "Node.js", "TypeScript"],',
    '  motto: "Code with purpose, build with passion"',
    '};',
    '',
    '// Always learning, always growing...'
  ];

  useEffect(() => {
    // Animate stats counters
    const targetStats = {
      experience: 5,
      projects: 15,
      commits: 2847,
      technologies: profile.skills.length + profile.tools.length
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setStats({
        experience: Math.round(targetStats.experience * easedProgress),
        projects: Math.round(targetStats.projects * easedProgress),
        commits: Math.round(targetStats.commits * easedProgress),
        technologies: Math.round(targetStats.technologies * easedProgress)
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [profile]);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4 h-full animate-pulse">
          {Array.from({ length: 64 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-cyan-400 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: Math.random() * 0.5 }}
              transition={{ duration: 2, delay: i * 0.02, repeat: Infinity, repeatType: "reverse" }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left side - Profile & Stats */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <div className="flex flex-col sm:flex-row items-center lg:items-start mb-6">
            {profile.image && getImage(profile.image) && (
              <GatsbyImage
                image={getImage(profile.image)!}
                alt={`${profile.fname} ${profile.lname}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-4 sm:mb-0 sm:mr-6"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
                {profile.fname} {profile.lname}
              </h1>
              <p className="text-lg sm:text-xl text-cyan-400 mb-2">{profile.profession}</p>
              <div className="flex flex-col sm:flex-row items-center lg:items-start text-gray-300 text-sm gap-2 sm:gap-4">
                <div className="flex items-center">
                  <FiMapPin className="mr-1" />
                  {profile.location}
                </div>
                {profile.for_hire && (
                  <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                    Available for hire
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-300 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">{profile.about}</p>

          {/* Real-time Stats Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {[
              { label: 'Years Experience', value: stats.experience, suffix: '+', icon: FiTrendingUp },
              { label: 'Projects Built', value: stats.projects, suffix: '+', icon: FiCode },
              { label: 'GitHub Commits', value: stats.commits.toLocaleString(), suffix: '', icon: FiGithub },
              { label: 'Technologies', value: stats.technologies, suffix: '', icon: FiUsers }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start mb-2">
                  <stat.icon className="text-cyan-400 mb-1 sm:mb-0 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-lg sm:text-2xl font-bold text-white text-center sm:text-left">
                    {stat.value}{stat.suffix}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex justify-center lg:justify-start gap-3 sm:gap-4">
            {social.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 sm:p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiGithub className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Right side - Live Coding Animation */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-900 rounded-xl p-4 sm:p-6 font-mono text-xs sm:text-sm order-first lg:order-last"
        >
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-400 ml-2">developer-profile.js</span>
          </div>
          
          <div className="text-green-400 min-h-[200px] sm:min-h-[300px]">
            <Typed
              strings={codeSnippets}
              typeSpeed={50}
              backSpeed={30}
              backDelay={3000}
              loop={true}
              showCursor={true}
              cursorChar="_"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// AI-Enhanced Interactive Timeline
const InteractiveTimeline: React.FC<{ jobs: any[] }> = ({ jobs }) => {
  const [activeJob, setActiveJob] = useState(0);
  const [enhancedDescriptions, setEnhancedDescriptions] = useState<{[key: number]: string}>({});
  const [achievementBadges, setAchievementBadges] = useState<{[key: number]: string}>({});
  const sortedJobs = jobs.sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime());

  useEffect(() => {
    // Enhance job descriptions and generate achievement badges with AI
    const enhanceContent = async () => {
      const enhanced: {[key: number]: string} = {};
      const badges: {[key: number]: string} = {};
      
      for (let i = 0; i < sortedJobs.length; i++) {
        const job = sortedJobs[i];
        try {
          // Enhance job description
          const enhancedDesc = await getCachedEnhancedDescription(job.description, {
            type: 'job',
            title: job.jobTitle,
            company: job.company.name,
            technologies: job.technologies
          });
          enhanced[i] = enhancedDesc;

          // Generate AI achievement badge
          const achievementResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GATSBY_OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Achievement Badge Generator'
            },
            body: JSON.stringify({
              model: 'meta-llama/llama-3.2-3b-instruct:free',
              messages: [
                {
                  role: 'system',
                  content: 'You are a professional achievement writer. Create an impressive, detailed achievement statement (80-120 characters) based on the job role, company, and technologies. Focus on specific accomplishments, impact, and technical expertise. Use action words like "Successfully", "Led", "Delivered", "Built", "Architected", "Developed", etc. Make it sound professional and impactful for recruiters.'
                },
                {
                  role: 'user',
                  content: `Create a detailed achievement statement for:
                  
                  Job Title: ${job.jobTitle}
                  Company: ${job.company.name}
                  Key Technologies: ${job.technologies.join(', ')}
                  Job Description: ${job.description}
                  
                  Make it specific, impressive, and highlight technical accomplishments.`
                }
              ],
              max_tokens: 80,
              temperature: 0.7
            })
          });

          if (achievementResponse.ok) {
            const achievementData = await achievementResponse.json();
            const achievementText = achievementData.choices[0]?.message?.content;
            console.log(`AI Achievement for ${job.company.name}:`, achievementText);
            badges[i] = achievementText?.replace(/['"]/g, '').trim() || `Successfully delivered high-impact ${job.jobTitle.toLowerCase()} solutions at ${job.company.name} using ${job.technologies.slice(0, 3).join(', ')} and modern development practices`;
          } else {
            console.log(`AI Achievement API failed for ${job.company.name}:`, achievementResponse.status);
            badges[i] = `Successfully delivered high-impact ${job.jobTitle.toLowerCase()} solutions at ${job.company.name} using ${job.technologies.slice(0, 3).join(', ')} and modern development practices`;
          }
        } catch (error) {
          enhanced[i] = job.description;
          badges[i] = `Successfully delivered high-impact ${job.jobTitle.toLowerCase()} solutions at ${job.company.name} using ${job.technologies.slice(0, 3).join(', ')} and modern development practices`;
        }
      }
      
      setEnhancedDescriptions(enhanced);
      setAchievementBadges(badges);
    };

    enhanceContent();
  }, [sortedJobs]);

  return (
    <section className="py-20" style={{ backgroundColor: nightOwl.surface }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: nightOwl.text }}>
            Professional Journey
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base" style={{ color: nightOwl.textDim }}>
            AI-enhanced descriptions of my professional experience and key achievements
          </p>
        </motion.div>

        {/* Horizontal Timeline */}
        <div className="relative mb-8 sm:mb-12 lg:mb-16">
          <div className="flex justify-start sm:justify-between items-center mb-6 sm:mb-8 overflow-x-auto pb-4 gap-2 sm:gap-4">
            {sortedJobs.map((job, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveJob(index)}
                className={`flex-shrink-0 p-3 sm:p-4 rounded-xl transition-all min-w-[120px] sm:min-w-[140px] ${
                  activeJob === index 
                    ? 'bg-cyan-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  {job.company.logo && getImage(job.company.logo) && (
                    <GatsbyImage
                      image={getImage(job.company.logo)!}
                      alt={job.company.name}
                      className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg mx-auto mb-2"
                    />
                  )}
                  <div className="font-semibold text-xs sm:text-sm">{job.company.name}</div>
                  <div className="text-xs opacity-75 hidden sm:block">{job.fromDate} - {job.toDate}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Connection Line */}
          <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-30"></div>
        </div>

        {/* Job Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeJob}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8"
          >
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                  {sortedJobs[activeJob].company.logo && getImage(sortedJobs[activeJob].company.logo) && (
                    <GatsbyImage
                      image={getImage(sortedJobs[activeJob].company.logo)!}
                      alt={sortedJobs[activeJob].company.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg mb-3 sm:mb-0 sm:mr-4"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                      {sortedJobs[activeJob].jobTitle}
                    </h3>
                    <p className="text-cyan-600 font-semibold text-sm sm:text-base">
                      {sortedJobs[activeJob].company.name}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {sortedJobs[activeJob].fromDate} - {sortedJobs[activeJob].toDate}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  {sortedJobs[activeJob].description}
                </p>

                <a
                  href={sortedJobs[activeJob].company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-cyan-600 hover:text-cyan-700 font-semibold"
                >
                  Visit Company <FiExternalLink className="ml-1" />
                </a>
              </div>

              <div>
                <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: nightOwl.textDim }}>Technologies Used</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 sm:mb-6">
                  {sortedJobs[activeJob].technologies.map((tech: string, index: number) => (
                    <motion.div
                      key={tech}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-center border"
                      style={{
                        backgroundColor: nightOwl.surface,
                        borderColor: nightOwl.border,
                        color: nightOwl.text
                      }}
                    >
                      {tech}
                    </motion.div>
                  ))}
                </div>

                {/* AI-Generated Achievement Badge */}
                <div className="rounded-lg p-3 sm:p-4 border" style={{ 
                  backgroundColor: nightOwl.success + '20', 
                  borderColor: nightOwl.success 
                }}>
                  <div className="flex items-center mb-2">
                    <FiAward className="mr-2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: nightOwl.success }} />
                    <span className="font-semibold text-sm sm:text-base" style={{ color: nightOwl.success }}>Key Achievement</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: nightOwl.textDim }}>
                    {achievementBadges[activeJob] || 'Successfully delivered multiple projects using cutting-edge technologies'}
                  </p>
                  {achievementBadges[activeJob] && (
                    <p className="text-xs mt-2 italic" style={{ color: nightOwl.secondary }}>
                      ✨ AI-generated
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// AI-Enhanced Projects Showcase
const ProjectsShowcase: React.FC<{ projects: any[] }> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [enhancedDescriptions, setEnhancedDescriptions] = useState<{[key: number]: string}>({});

  useEffect(() => {
    // Enhance project descriptions with AI
    const enhanceDescriptions = async () => {
      const enhanced: {[key: number]: string} = {};
      
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        try {
          const enhancedDesc = await getCachedEnhancedDescription(project.description, {
            type: 'project',
            title: project.project.name,
            technologies: project.technologies
          });
          enhanced[i] = enhancedDesc;
        } catch (error) {
          enhanced[i] = project.description;
        }
      }
      
      setEnhancedDescriptions(enhanced);
    };

    enhanceDescriptions();
  }, [projects]);

  return (
    <section className="py-12 sm:py-16 lg:py-20" style={{ backgroundColor: nightOwl.bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: nightOwl.text }}>
            Featured Projects
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base" style={{ color: nightOwl.textDim }}>
            AI-enhanced project descriptions showcasing technical achievements and impact
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl overflow-hidden border hover:shadow-xl transition-shadow cursor-pointer"
              style={{
                backgroundColor: nightOwl.surface,
                borderColor: nightOwl.border
              }}
              onClick={() => setSelectedProject(selectedProject === index ? null : index)}
              whileHover={{ y: -5 }}
            >
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-0" style={{ color: nightOwl.text }}>{project.name}</h3>
                  <span className="text-xs sm:text-sm" style={{ color: nightOwl.textDim }}>{project.date}</span>
                </div>

                <div className="mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: nightOwl.text }}>
                    {enhancedDescriptions[index] || project.description}
                  </p>
                  {enhancedDescriptions[index] && enhancedDescriptions[index] !== project.description && (
                    <p className="text-xs mt-2 italic" style={{ color: nightOwl.secondary }}>
                      ✨ AI-enhanced description
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                  {project.technologies.slice(0, 6).map((tech: string) => (
                    <motion.span
                      key={tech}
                      className="px-2 py-1 rounded text-xs font-medium border"
                      style={{
                        backgroundColor: nightOwl.darker,
                        borderColor: nightOwl.border,
                        color: nightOwl.accent
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: project.technologies.indexOf(tech) * 0.05 }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                  {project.technologies.length > 6 && (
                    <span className="px-2 py-1 rounded text-xs font-medium border" style={{
                      backgroundColor: nightOwl.darker,
                      borderColor: nightOwl.border,
                      color: nightOwl.textDim
                    }}>
                      +{project.technologies.length - 6} more
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <a
                    href={project.project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center font-semibold text-sm hover:underline"
                    style={{ color: nightOwl.accent }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Project <FiExternalLink className="ml-1 w-4 h-4" />
                  </a>
                  
               
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedProject === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t"
                      style={{ borderColor: nightOwl.border }}
                    >
                      <h4 className="font-semibold mb-2" style={{ color: nightOwl.text }}>Project Details:</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech: string) => (
                          <span
                            key={tech}
                            className="px-2 py-1 rounded text-xs border"
                            style={{
                              backgroundColor: nightOwl.surface,
                              borderColor: nightOwl.border,
                              color: nightOwl.accent
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Skills Constellation (Non-3D Interactive Version)
const SkillsConstellation = ({ skills, tools }: { skills: string[]; tools: string[] }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const allSkills = [
    ...skills.map(skill => ({ name: skill, category: 'skills', proficiency: Math.floor(Math.random() * 30) + 70 })),
    ...tools.map(tool => ({ name: tool, category: 'tools', proficiency: Math.floor(Math.random() * 30) + 60 }))
  ];

  const filteredSkills = selectedCategory === 'all' ? allSkills : 
    allSkills.filter(skill => skill.category === selectedCategory);

  return (
    <section className="py-12 sm:py-16 lg:py-20" style={{ backgroundColor: nightOwl.surface }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: nightOwl.text }}>
            Technical Expertise
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base" style={{ color: nightOwl.textDim }}>
            A comprehensive overview of my technical skills and development tools
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8 sm:mb-10 lg:mb-12">
          <div className="flex rounded-lg p-1 border" style={{ backgroundColor: nightOwl.darker, borderColor: nightOwl.border }}>
            {['all', 'skills', 'tools'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-3 sm:px-4 lg:px-6 py-2 rounded-md font-medium transition-colors text-sm sm:text-base"
                style={{
                  backgroundColor: selectedCategory === category ? nightOwl.accent : 'transparent',
                  color: selectedCategory === category ? nightOwl.bg : nightOwl.text
                }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer"
              style={{
                backgroundColor: nightOwl.darker,
                borderColor: hoveredSkill === skill.name ? nightOwl.accent : nightOwl.border,
                transform: hoveredSkill === skill.name ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
              whileHover={{ y: -2 }}
            >
              <div className="text-center">
                <div className="font-semibold mb-2 text-xs sm:text-sm" style={{ color: nightOwl.text }}>{skill.name}</div>
                <div className="w-full rounded-full h-1.5 sm:h-2 mb-2" style={{ backgroundColor: nightOwl.surface }}>
                  <motion.div
                    className="h-1.5 sm:h-2 rounded-full"
                    style={{ backgroundColor: nightOwl.accent }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.proficiency}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                  />
                </div>
                <div className="text-xs" style={{ color: nightOwl.textDim }}>{skill.proficiency}%</div>
                <div className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full mt-1.5 sm:mt-2 border"
                     style={{
                       backgroundColor: nightOwl.surface,
                       borderColor: nightOwl.border,
                       color: skill.category === 'skills' ? nightOwl.accent : nightOwl.success
                     }}>
                  {skill.category}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact & CTA Section
const ContactSection = ({ profile, social, jobs, projects }: { profile: any; social: any[]; jobs: any[]; projects: any[] }) => {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden" style={{ backgroundColor: nightOwl.bg }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-20"
            style={{
              background: i % 2 === 0 ? nightOwl.accent : nightOwl.secondary,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${nightOwl.accent}, transparent)` }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${nightOwl.secondary}, transparent)` }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full border-2 border-dashed"
              style={{ borderColor: nightOwl.accent }}
            />
            <span className="text-sm font-medium tracking-wider uppercase" style={{ color: nightOwl.accent }}>
              Ready to Collaborate
            </span>
            <motion.div
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full border-2 border-dashed"
              style={{ borderColor: nightOwl.secondary }}
            />
          </motion.div>

          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6"
            style={{ color: nightOwl.text }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Let's{' '}
            <motion.span
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
              style={{ 
                background: `linear-gradient(135deg, ${nightOwl.accent}, ${nightOwl.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Build Something
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                style={{ background: `linear-gradient(135deg, ${nightOwl.accent}, ${nightOwl.secondary})` }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              />
            </motion.span>
            {' '}Amazing
          </motion.h2>

          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: nightOwl.textDim }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            I'm passionate about creating innovative solutions that make a difference. 
            Whether it's a cutting-edge web application, mobile experience, or complex system architecture,
            <motion.span
              className="font-semibold"
              style={{ color: nightOwl.success }}
              whileHover={{ scale: 1.05 }}
            >
              {' '}let's turn your vision into reality.
            </motion.span>
          </motion.p>
        </motion.div>

        {/* Enhanced Contact Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {[
            {
              icon: FiMail,
              title: "Drop me a line",
              subtitle: "Quick response guaranteed",
              color: nightOwl.accent,
              delay: 0.1,
              href: "mailto:dev.retifier@gmail.com"
            },
            {
              icon: FiCalendar,
              title: "Schedule a chat",
              subtitle: "Let's discuss your ideas",
              color: nightOwl.secondary,
              delay: 0.2,
              href: "#"
            },
            {
              icon: FiGithub,
              title: "Explore my code",
              subtitle: "See what I've been building",
              color: nightOwl.success,
              delay: 0.3,
              href: "https://github.com/RetiFier"
            }
          ].map((item, index) => (
            <motion.a
              key={index}
              href={item.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, duration: 0.6 }}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Card Background Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"
                style={{ background: `radial-gradient(circle at center, ${item.color}, transparent)` }}
              />
              
              {/* Icon */}
              <motion.div
                className="relative z-10 mb-4"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${item.color}20` }}
                >
                  <item.icon 
                    className="w-6 h-6 sm:w-7 sm:h-7" 
                    style={{ color: item.color }}
                  />
                </div>
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <h3 
                  className="text-lg sm:text-xl font-bold mb-2 group-hover:scale-105 transition-transform duration-200"
                  style={{ color: nightOwl.text }}
                >
                  {item.title}
                </h3>
                <p 
                  className="text-sm sm:text-base opacity-80"
                  style={{ color: nightOwl.textDim }}
                >
                  {item.subtitle}
                </p>
              </div>

              {/* Hover Arrow */}
              <motion.div
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiExternalLink 
                  className="w-5 h-5" 
                  style={{ color: item.color }}
                />
              </motion.div>
            </motion.a>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-12"
        >
          <motion.a
            href="mailto:dev.retifier@gmail.com"
            className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${nightOwl.accent}, ${nightOwl.secondary})`,
              color: nightOwl.bg,
              boxShadow: `0 10px 30px ${nightOwl.accent}30`
            }}
            whileHover={{ 
              scale: 1.05, 
              y: -2,
              boxShadow: `0 15px 40px ${nightOwl.accent}40`
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Button Background Animation */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: `linear-gradient(135deg, ${nightOwl.secondary}, ${nightOwl.success})`,
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Content */}
            <span className="relative z-10">Start a Conversation</span>
            <motion.div
              className="relative z-10"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <FiZap className="w-5 h-5" />
            </motion.div>
          </motion.a>
        </motion.div>
        
        {/* Enhanced Resume Download Section */}
        <motion.div 
          className="mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <AIEnhancedResumeDownloader 
            portfolioData={{
              profile,
              jobs,
              projects
            }}
            className="flex justify-center"
          />
        </motion.div>
      </div>
    </section>
  );
};

const EnhancedPortfolioPage: React.FC<EnhancedPortfolioProps> = ({ data, location }) => {
  const profile = data.profile.nodes[0].profile;
  const social = data.social.nodes;
  const jobs = data.job.nodes;
  const projects = data.project.nodes;

  // Ensure page starts at top
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Prevent scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && (window as any).portfolioGamification) {
          (window as any).portfolioGamification.trackSectionVisit(entry.target.id);
        }
      });
    }, { threshold: 0.3 });

    const sections = document.querySelectorAll('section[id], div[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <AccessibilityProvider>
      <Layout social={social} location={location}>
        <Seo
          title={`${profile.fname} ${profile.lname} - ${profile.profession} | AI-Enhanced Portfolio`}
          description={profile.about}
          keywords={`${profile.skills.join(', ')}, full-stack developer, ${profile.location}`}
        />
        
        {/* Skip Links for Accessibility */}
        <SkipLinks />
        
        {/* Performance Monitor - Mobile Friendly */}
        <PerformanceMonitor 
          showMetrics={process.env.NODE_ENV === 'development'} 
          position="bottom-right" 
          initialCompact={true} 
        />
        
        {/* Advanced Gamification System */}
        <AdvancedGamification />
        
        <main id="main-content" className="max-w-7xl mx-auto space-y-12 md:space-y-16 lg:space-y-24">
          <section id="hero" aria-label="Hero section" tabIndex={-1} className="py-8 md:py-12">
            <EnhancedHero profile={profile} social={social} />
          </section>
          
          <LazySection loadingText="Loading professional experience...">
            <section id="timeline" aria-label="Professional experience timeline" tabIndex={-1} className="py-8 md:py-12">
              <InteractiveTimeline jobs={jobs} />
            </section>
          </LazySection>
          
          <LazySection loadingText="Loading featured projects...">
            <section id="projects" aria-label="Featured projects showcase" tabIndex={-1} className="py-8 md:py-12">
              <ProjectsShowcase projects={projects} />
            </section>
          </LazySection>
          
          <LazySection loadingText="Loading code playground...">
            <section id="code" aria-label="Interactive code playground" tabIndex={-1} className="py-8 md:py-12">
              <IntelligentCodePlayground />
            </section>
          </LazySection>
          
          <LazySection loadingText="Loading technical skills...">
            <section id="skills" aria-label="Technical skills and expertise" tabIndex={-1} className="py-8 md:py-12">
              <SkillsConstellation skills={profile.skills} tools={profile.tools} />
            </section>
          </LazySection>
          
          <LazySection loadingText="Loading contact information...">
            <section id="contact" aria-label="Contact and collaboration" tabIndex={-1} className="py-8 md:py-12">
              <ContactSection profile={profile} social={social} jobs={jobs} projects={projects} />
            </section>
          </LazySection>

          {/* AI Assistant Section */}
          <LazySection loadingText="Loading AI assistant...">
            <section aria-label="AI-powered assistant" tabIndex={-1} className="py-8 md:py-12">
              <AISection profile={profile} projects={projects} jobs={jobs} />
            </section>
          </LazySection>
        </main>
      </Layout>
    </AccessibilityProvider>
  );
};

export const query = graphql`
  query {
    profile: allProfileYaml {
      nodes {
        profile {
          about
          company
          for_hire
          image {
            childImageSharp {
              gatsbyImageData(layout: FIXED, width: 128, height: 128, quality: 95)
            }
            publicURL
          }
          initials
          location
          fname
          lname
          profession
          relocation
          skills
          tools
        }
      }
    }
    social: allSocialYaml {
      nodes {
        name
        url
      }
    }
    job: allJobYaml {
      nodes {
        company {
          name
          logo {
            childImageSharp {
              gatsbyImageData(layout: FIXED, width: 64, height: 64, quality: 85)
            }
            publicURL
          }
          url
        }
        jobTitle
        fromDate
        toDate
        description
        technologies
      }
    }
    project: allProjectYaml {
      nodes {
        project {
          name
          logo {
            childImageSharp {
              gatsbyImageData(layout: FIXED, width: 64, height: 64, quality: 85)
            }
            publicURL
          }
          url
        }
        name
        date
        description
        technologies
      }
    }
  }
`;

export default EnhancedPortfolioPage;
