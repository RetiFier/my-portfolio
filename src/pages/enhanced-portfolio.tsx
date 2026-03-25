import { graphql } from "gatsby";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { Seo } from '../components/Seo';
import { FiExternalLink } from "react-icons/fi";
import SkipLinks from '../components/Accessibility/SkipLinks';
import { ProfileType, SocialType } from '../@types/about';
import { JobType } from '../@types/job';
import { ProjectType } from '../@types/project';
import { nightOwl } from '../theme/nightOwl';
import { getSocialIcon } from '../utils/socialIcons';

interface EnhancedPortfolioProps {
  data: {
    profile: {
      nodes: Array<{ profile: ProfileType }>;
    };
    social: {
      nodes: SocialType[];
    };
    job: {
      nodes: JobType[];
    };
    project: {
      nodes: ProjectType[];
    };
  };
  location: Location;
}

// Hero Section
const Hero = ({ profile, social }: { profile: ProfileType; social: SocialType[] }) => {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6 sm:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <p className="text-sm sm:text-base text-gray-500 mb-6 tracking-widest uppercase">{profile.location}</p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white mb-8 leading-tight">
            Systems that work.
            <br />
            <span className="text-gray-500">Code that stays.</span>
          </h1>

          <motion.p
            className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            I build software that survives reality.
            Not for demos, not for portfolios.
            For people who need things to work when it matters.
          </motion.p>

          <motion.div
            className="flex justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {social.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                aria-label={link.name}
              >
                {getSocialIcon(link.name)}
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// How I Think
const Philosophy = () => {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-8" style={{ backgroundColor: nightOwl.surface }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm text-gray-500 mb-8 tracking-widest uppercase">How I think</p>

          <div className="space-y-8">
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed">
              Most code gets written once and read hundreds of times.
              <br />
              I build for the readers.
            </p>

            <p className="text-gray-400 leading-relaxed">
              Problems have contexts, not solutions. Every project I touch starts with questions:
              What's actually broken? Who feels the pain? What happens if this fails in six months?
              The answers shape the architecture, not the other way around.
            </p>

            <p className="text-gray-400 leading-relaxed">
              Technology stacks change. The fundamentals don't.
              I've worked with React since it was new enough that people asked "why not jQuery?"
              But the stack is just a tool. The craft is understanding tradeoffs.
            </p>

            <p className="text-gray-400 leading-relaxed">
              I took a year off to dive deeper—not because I was lost, but because I wanted to understand
              what I was building at a level most people skip. That time changed how I approach everything.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Work That Matters
const Work = ({ projects }: { projects: ProjectType[] }) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section id="projects" className="py-24 sm:py-32 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm text-gray-500 mb-8 tracking-widest uppercase">Work that matters</p>
        </motion.div>

        <div className="space-y-16">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border-t pt-12"
              style={{ borderColor: nightOwl.border }}
            >
              <div
                className="cursor-pointer"
                onClick={() => setExpanded(expanded === index ? null : index)}
                role="button"
                aria-expanded={expanded === index}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(expanded === index ? null : index); }}}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl sm:text-3xl text-white font-normal">{project.name}</h3>
                  <span className="text-sm text-gray-500 mt-2">{project.date}</span>
                </div>

                <AnimatePresence>
                  <motion.div
                    initial={false}
                    animate={{ height: expanded === index ? "auto" : "0px", opacity: expanded === index ? 1 : 0.7 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
                      <p className="text-gray-400 leading-relaxed mb-6">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies.slice(0, 5).map((tech: string) => (
                          <span
                            key={tech}
                            className="text-xs text-gray-500 px-3 py-1 border"
                            style={{ borderColor: nightOwl.border }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <a
                        href={project.project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        See it in action <FiExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Where I've Been
const Experience = ({ jobs }: { jobs: JobType[] }) => {
  const [active, setActive] = useState(0);
  const sortedJobs = [...jobs].sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime());

  return (
    <section id="timeline" className="py-24 sm:py-32 px-6 sm:px-8" style={{ backgroundColor: nightOwl.surface }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm text-gray-500 mb-8 tracking-widest uppercase">Where I've been</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <div className="space-y-4">
              {sortedJobs.map((job, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  aria-pressed={active === index}
                  className={`w-full text-left p-4 transition-all ${
                    active === index
                      ? 'text-white border-l-2'
                      : 'text-gray-500 hover:text-gray-400 border-l border-transparent'
                  }`}
                  style={{
                    borderColor: active === index ? nightOwl.text : 'transparent',
                    backgroundColor: active === index ? nightOwl.darker : 'transparent'
                  }}
                >
                  <div className="text-sm mb-1">{job.company.name}</div>
                  <div className="text-xs text-gray-600">{job.fromDate}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl text-white mb-2">{sortedJobs[active].jobTitle}</h3>
                <p className="text-gray-500 mb-6">{sortedJobs[active].company.name}</p>

                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-400 leading-relaxed mb-6">
                    {sortedJobs[active].description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sortedJobs[active].technologies.map((tech: string) => (
                    <span
                      key={tech}
                      className="text-xs text-gray-500 px-3 py-1 border"
                      style={{ borderColor: nightOwl.border }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

// Things I Use
const Tools = ({ skills, tools }: { skills: string[]; tools: string[] }) => {
  return (
    <section id="skills" className="py-24 sm:py-32 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm text-gray-500 mb-8 tracking-widest uppercase">Things I use</p>

          <p className="text-gray-400 mb-12">
            Tools change. Principles don't. Here's what I reach for most days.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...skills, ...tools].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="text-sm text-gray-500 p-4 border"
              style={{ borderColor: nightOwl.border }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// What Drives Me
const Drive = () => {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-8" style={{ backgroundColor: nightOwl.surface }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-gray-500 mb-8 tracking-widest uppercase">What drives me</p>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl text-white mb-3">Curiosity over certainty</h3>
              <p className="text-gray-400 leading-relaxed">
                The best developers I know are the ones who admit what they don't know.
                I built a blockchain wallet app not because I was an expert, but because I wanted
                to understand how private keys actually work at the protocol level.
                That curiosity led to Web3 work that continues today.
              </p>
            </div>

            <div>
              <h3 className="text-xl text-white mb-3">Systems thinking</h3>
              <p className="text-gray-400 leading-relaxed">
                Every line of code exists in a system—infrastructure, team, timeline, users.
                At Mehr Capital, I scraped 10,000 company descriptions not because it was fun,
                but because the alternative was relying on incomplete APIs. Understanding the
                whole system means you can build better parts.
              </p>
            </div>

            <div>
              <h3 className="text-xl text-white mb-3">Long-term perspective</h3>
              <p className="text-gray-400 leading-relaxed">
                I've maintained relationships with companies long after projects ended.
                WunderTek hired me, then brought me back as a freelancer.
                That happens when you build trust, not just features.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Closing
const Closing = ({ profile, social }: { profile: ProfileType; social: SocialType[] }) => {
  return (
    <section id="contact" className="py-32 sm:py-48 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-8 leading-tight">
            If this resonates,<br />
            we'll probably get along.
          </h2>

          <p className="text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed">
            I'm currently building at {profile.company}, always interested in meaningful work with people
            who care about what they make.
          </p>

          <div className="flex justify-center gap-8">
            {social.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
                aria-label={link.name}
              >
                {getSocialIcon(link.name)}
              </a>
            ))}
          </div>

          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <a
              href={`mailto:${profile.email}`}
              className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              {profile.email}
            </a>
          </motion.div>
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

  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <Layout social={social} profile={profile} location={location}>
      <Seo
        title={`${profile.fname} ${profile.lname}`}
        description={profile.about}
        keywords={profile.skills.join(', ')}
      />

      <SkipLinks />

      <main id="main-content" className="min-h-screen">
        <Hero profile={profile} social={social} />
        <Philosophy />
        <Work projects={projects} />
        <Experience jobs={jobs} />
        <Tools skills={profile.skills} tools={profile.tools} />
        <Drive />
        <Closing profile={profile} social={social} />
      </main>
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
          email
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
