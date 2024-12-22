import { graphql } from "gatsby";
import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { StaticImage } from 'gatsby-plugin-image';
import { AboutDataType } from "../@types/about";
import { Layout } from "../components/Layout";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { FiGithub, FiExternalLink, FiTerminal, FiCode, FiBriefcase, FiCommand, FiCpu, FiBox } from "react-icons/fi";

interface ProfileData {
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
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

const fadeInUp = {
  hidden: { y: 60, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

const scaleUp = {
  hidden: { scale: 0.8, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

const IndexPage = ({ data, location }: AboutDataType) => {
  const { profile, social, job, project } = data;
  const profileData = profile.nodes[0]?.profile; // Access the first profile item
  const profileImage = profileData?.image ? getImage(profileData.image) : null;
  const { scrollYProgress } = useScroll();
  const scale = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const mockData = {
    projects: [
      {
        id: 1,
        title: "Project 1",
        description: "A cool project",
        technologies: ["React", "Node.js", "TypeScript"],
        links: {
          github: "https://github.com",
          live: "https://demo.com"
        }
      }
    ]
  };

  return (
    <Layout social={social.nodes} location={location}>
      <motion.div 
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <motion.section className="mb-20">
          <div className="terminal-window w-full">
            <div className="terminal-header">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-[var(--terminal-red)]"></div>
                <div className="w-3 h-3 rounded-full bg-[var(--terminal-yellow)]"></div>
                <div className="w-3 h-3 rounded-full bg-[var(--terminal-green)]"></div>
              </div>
              <span className="ml-4 text-[var(--terminal-comment)] font-mono text-sm">node portfolio.js</span>
            </div>
            
            <div className="terminal-content">
              <motion.div variants={container} initial="hidden" animate="show">
                <div className="mb-4">
                  <span className="command-prompt">npm</span>
                  <span className="typing-effect">init developer</span>
                </div>
                
                <motion.div variants={item} className="pl-4 mb-6">
                  <p className="mb-2">
                    <span className="text-[var(--nodejs-green)]">name: </span>
                    <span>{profileData?.fname} {profileData?.lname}</span>
                  </p>
                  <p className="mb-2">
                    <span className="text-[var(--nodejs-green)]">version: </span>
                    <span>1.0.0</span>
                  </p>
                  <p className="mb-2">
                    <span className="text-[var(--nodejs-green)]">description: </span>
                    <span>{profileData?.profession}</span>
                  </p>
                  <p>
                    <span className="text-[var(--nodejs-green)]">status: </span>
                    <span className="text-[var(--terminal-green)]">ready for new projects</span>
                  </p>
                </motion.div>

                <div className="mb-4">
                  <span className="command-prompt">cat</span>
                  <span className="typing-effect">README.md</span>
                </div>
                
                <motion.p variants={item} className="pl-4 mb-6">
                  {profileData?.about}
                </motion.p>

                <div className="mb-4">
                  <span className="command-prompt">npm</span>
                  <span className="typing-effect">list --skills</span>
                </div>
                
                <motion.div variants={item} className="pl-4 flex flex-wrap gap-3">
                  {profileData?.skills?.map((skill: string, index: number) => (
                    <motion.span
                      key={skill}
                      className="skill-tag"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
                
                <div className="mb-4">
                  <span className="command-prompt">npm</span>
                  <span className="typing-effect">list --tools</span>
                </div>
                
                <motion.div variants={item} className="pl-4 flex flex-wrap gap-3">
                  {profileData?.tools?.map((tool: string, index: number) => (
                    <motion.span
                      key={tool}
                      className="skill-tag"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      {tool}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Experience Section */}
        <section className="mb-20">
          <div className="terminal-window">
            <div className="terminal-header">
              <span className="text-[var(--nodejs-green)] font-mono text-lg mb-4">
                <span className="text-[var(--terminal-comment)]">const</span> experience <span className="text-[var(--terminal-comment)]">= require('./career')</span>
              </span>
            </div>
            
            <div className="terminal-content">
              <div className="command-line">
                <span className="command-prompt">node</span>
                <span className="typing-effect">career.js</span>
              </div>
              
              <div className="process-bar" />
              
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {job.nodes.map((exp, index) => (
                  <motion.div
                    key={index}
                    variants={item}
                    className="experience-card mb-8 last:mb-0"
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-[var(--nodejs-green)] font-mono">module.exports = {`{`}</span>
                    </div>
                    <div className="pl-8">
                      <p className="mb-2">
                        <span className="text-[var(--terminal-purple)]">company:</span>
                        <span className="text-[var(--terminal-yellow)] ml-2">"{exp.company.name}",</span>
                      </p>
                      <p className="mb-2">
                        <span className="text-[var(--terminal-purple)]">role:</span>
                        <span className="text-[var(--terminal-yellow)] ml-2">"{exp.jobTitle}",</span>
                      </p>
                      <p className="mb-2">
                        <span className="text-[var(--terminal-purple)]">period:</span>
                        <span className="text-[var(--terminal-yellow)] ml-2">"{exp.fromDate} - {exp.toDate || 'Present'}",</span>
                      </p>
                      <p className="mb-4">
                        <span className="text-[var(--terminal-purple)]">description:</span>
                        <span className="text-[var(--terminal-text)] ml-2">"{exp.description}",</span>
                      </p>
                      {exp.technologies && (
                        <div className="mb-2">
                          <span className="text-[var(--terminal-purple)]">stack:</span>
                          <div className="pl-4 mt-2">
                            <div className="project-tech-stack">
                              {exp.technologies.map((tech, i) => (
                                <motion.span
                                  key={i}
                                  className="tech-tag"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.1 }}
                                >
                                  {tech}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-[var(--nodejs-green)] font-mono mt-4">{`}`}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-20">
          <div className="terminal-window">
            <div className="terminal-header">
              <span className="text-[var(--nodejs-green)] font-mono text-lg mb-4">
                <span className="text-[var(--terminal-comment)]">import</span> projects <span className="text-[var(--terminal-comment)]">from</span> './portfolio'
              </span>
            </div>
            
            <div className="terminal-content">
              <div className="command-line">
                <span className="command-prompt">node</span>
                <span className="typing-effect">portfolio.js</span>
              </div>
              
              <div className="process-bar" />
              
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
              >
                {project.nodes.map((proj, index) => (
                  <motion.div
                    key={index}
                    variants={item}
                    className="project-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      delay: index * 0.1
                    }}
                  >
                    <div className="project-card-header">
                      <h3 className="project-card-title">
                        {proj.project.name}
                      </h3>
                    </div>
                    
                    <motion.div 
                      className="project-card-content"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-[var(--terminal-text)] mb-4">
                        {proj.description}
                      </p>
                      
                      <div className="project-tech-stack">
                        {proj.technologies.map((tech, i) => (
                          <motion.span
                            key={i}
                            className="tech-tag"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 15,
                              delay: i * 0.1
                            }}
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                      
                      <div className="project-card-links mt-6">
                        {proj.project.url && (
                          <motion.a
                            href={proj.project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-link group"
                            whileHover={{ x: 5 }}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 15,
                              delay: 0.3
                            }}
                          >
                            <span>View Project</span>
                            <motion.svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-4 w-4"
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                              initial={{ x: 0 }}
                              animate={{ x: [0, 5, 0] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </motion.svg>
                          </motion.a>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </motion.div>
    </Layout>
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
        description
        technologies
      }
    }
  }
`;

export default IndexPage;
