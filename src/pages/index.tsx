import { graphql } from "gatsby";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { Seo } from '../components/Seo';
import SkipLinks from '../components/Accessibility/SkipLinks';
import { FiArrowRight, FiMail } from "react-icons/fi";
import { getImage, GatsbyImage } from 'gatsby-plugin-image';
import { ProfileType, SocialType } from '../@types/about';
import { JobType } from '../@types/job';
import { ProjectType } from '../@types/project';
import { nightOwl } from '../theme/nightOwl';
import { getSocialIcon } from '../utils/socialIcons';
import { fadeIn, fadeInUp, staggerContainer } from '../utils/animations';

interface IndexPageProps {
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

// Text scramble decode effect
const ScrambleText = ({
  text,
  className,
  startDelay = 0,
}: {
  text: string;
  className: string;
  startDelay?: number;
}) => {
  const [display, setDisplay] = useState(text);
  const [running, setRunning] = useState(false);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const timeoutsRef = useRef<number[]>([]);

  const scramble = useCallback(() => {
    const len = text.length;
    let revealed = 0;
    const revealSpeed = 80; // ms per character reveal

    const reveal = () => {
      revealed++;
      const result = text.split('').map((ch, i) => {
        if (i < revealed) return ch;
        if (ch === ' ') return ' ';
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      setDisplay(result);

      if (revealed < len) {
        const id = window.setTimeout(reveal, revealSpeed);
        timeoutsRef.current.push(id);
      }
    };
    reveal();
  }, [text]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRunning(true);
      scramble();
    }, startDelay);
    timeoutsRef.current.push(timer);
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [startDelay, scramble]);

  return (
    <span
      className={className}
      style={{ opacity: running ? 1 : 0, transition: 'opacity 0.2s' }}
      aria-label={text}
    >
      {display}
    </span>
  );
};

// Cinematic Opening
const Opening = ({ profile, onStart }: { profile: ProfileType; onStart: () => void }) => {
  const [phase, setPhase] = useState<'lines' | 'name'>('lines');
  const [activeLine, setActiveLine] = useState(0);
  const [exiting, setExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const firstName = profile.fname.toUpperCase();
  const lastName = profile.lname.toUpperCase();
  const profession = profile.profession;

  const lines = [
    "SYSTEMS THAT WORK.",
    "CODE THAT STAYS.",
    "SOFTWARE THAT SURVIVES REALITY.",
  ];

  // Cycle through intro lines one at a time
  useEffect(() => {
    if (phase !== 'lines') return;
    const interval = setInterval(() => {
      setActiveLine(prev => {
        const next = prev + 1;
        if (next >= lines.length) {
          clearInterval(interval);
          setTimeout(() => setPhase('name'), 600);
          return prev;
        }
        return next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [phase]);

  // Canvas: star field with drifting glow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars: Array<{ x: number; y: number; r: number; a: number; speed: number }> = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.35 + 0.05,
        speed: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ox = Math.sin(time * 1.5) * 30;
      const oy = Math.cos(time * 1.2) * 20;
      const grd = ctx.createRadialGradient(
        canvas.width / 2 + ox, canvas.height / 2 + oy, 0,
        canvas.width / 2 + ox, canvas.height / 2 + oy, canvas.width * 0.5
      );
      grd.addColorStop(0, 'rgba(59, 130, 246, 0.045)');
      grd.addColorStop(0.4, 'rgba(59, 130, 246, 0.02)');
      grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(s => {
        const flicker = Math.sin(time * 3 * s.speed + s.x * 0.005) * 0.12;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, s.a + flicker)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };
    draw();

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else draw();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const handleEnter = () => {
    localStorage.setItem('portfolio-opening-seen', '1');
    setExiting(true);
    setTimeout(onStart, 800);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#0f0f0f] flex items-center justify-center overflow-hidden"
      animate={exiting ? { opacity: 0, scale: 1.03 } : { opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Top accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3b82f6]/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
      />

      <div className="relative z-10 w-full flex flex-col items-center justify-center px-5" style={{ minHeight: '100vh' }}>

        {/* Intro lines — scramble decode in Orbitron */}
        <div className="h-28 sm:h-32 md:h-36 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'lines' && (
              <ScrambleText
                key={activeLine}
                text={lines[activeLine]}
                className="text-[1.8rem] sm:text-3xl md:text-4xl lg:text-5xl text-white/80 font-display font-semibold leading-snug text-center px-4 sm:px-6 tracking-[0.06em]"
                startDelay={0}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Orbital progress indicator */}
        <AnimatePresence>
          {phase === 'lines' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.6 } }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
              className="mt-6 sm:mt-8"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Outer orbit ring */}
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#1e1e2e" strokeWidth="0.5" strokeDasharray="3 5" />
                  {/* Middle orbit ring */}
                  <circle cx="50" cy="50" r="32" fill="none" stroke="#1e1e2e" strokeWidth="0.5" strokeDasharray="2 4" />
                  {/* Inner orbit ring */}
                  <circle cx="50" cy="50" r="20" fill="none" stroke="#1e1e2e" strokeWidth="0.5" />
                  {/* Progress arcs on each ring */}
                  <motion.circle
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={2 * Math.PI * 44}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 44 * (1 - (activeLine + 1) / lines.length),
                    }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="origin-center -rotate-90"
                  />
                  <motion.circle
                    cx="50" cy="50" r="32"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    opacity="0.6"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={2 * Math.PI * 32}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 32 * (1 - (activeLine + 1) / lines.length),
                    }}
                    transition={{ duration: 1.2, delay: 0.15, ease: 'easeOut' }}
                    className="origin-center -rotate-45"
                  />
                  {/* Center dot */}
                  <circle cx="50" cy="50" r="2" fill="#3b82f6" opacity="0.5">
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                </svg>
                {/* Orbiting dots */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '50% 50%' }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[3px] w-[6px] h-[6px] rounded-full bg-[#3b82f6]" style={{ boxShadow: '0 0 8px rgba(59,130,246,0.7), 0 0 2px rgba(59,130,246,0.9)' }} />
                </motion.div>
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '50% 50%' }}
                >
                  <div className="absolute top-1/2 left-1/2 translate-y-[calc(50%*0.64)] translate-x-1/2 -translate-y-[3px] w-[4px] h-[4px] rounded-full bg-[#6366f1]" style={{ boxShadow: '0 0 6px rgba(99,102,241,0.5)' }} />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name + profession + enter button — all one block */}
        <AnimatePresence>
          {phase === 'name' && (
            <motion.div
              key="name-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* First name — scramble decode */}
              <div className="mb-2 sm:mb-3">
                <ScrambleText
                  text={firstName}
                  className="text-[3.5rem] sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[10rem] text-white font-display font-semibold leading-none inline-block tracking-[0.06em]"
                  startDelay={0}
                />
              </div>

              {/* Last name — scramble decode, slightly delayed */}
              <div className="mb-6 sm:mb-8">
                <ScrambleText
                  text={lastName}
                  className="text-[3.5rem] sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[10rem] text-[#3b82f6] font-display font-semibold leading-none inline-block tracking-[0.06em]"
                  startDelay={500}
                />
              </div>

              {/* Profession */}
              <motion.p
                className="text-[9px] sm:text-[10px] md:text-xs text-[#6b7280] tracking-[0.3em] uppercase mb-8 sm:mb-10 font-display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.8 }}
              >
                {profession}
              </motion.p>

              {/* Enter button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 2.3 }}
                onClick={handleEnter}
                className="group px-7 sm:px-10 py-3 sm:py-3.5 bg-transparent border border-[#1e1e1e] text-[#6b7280] hover:text-white hover:border-[#3b82f6] transition-colors duration-300 text-[11px] sm:text-xs tracking-[0.25em] uppercase"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Enter portfolio"
              >
                <span className="flex items-center gap-2.5 sm:gap-3">
                  Enter
                  <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Hero with Smooth Parallax
const Hero = ({ profile }: { profile: ProfileType }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const bgText = profile.fname.toUpperCase();

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Large background text with parallax */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10"
        style={{ y: y1 }}
      >
        <div className="text-[15vw] sm:text-[18vw] md:text-[20vw] lg:text-[22vw] text-[#1e1e1e] font-bold leading-none select-none whitespace-nowrap">
          {bgText}
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto"
        style={{ y: y2, opacity }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp}>
          <motion.p
            className="text-[9px] sm:text-[10px] tracking-[0.4em] text-[#6b7280] uppercase mb-10 sm:mb-12"
            variants={fadeIn}
          >
            Selected Works
          </motion.p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-normal leading-[0.95] mb-8 sm:mb-10 tracking-tight">
            Systems that<br />
            <span className="text-[#3b82f6]">work.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#6b7280] max-w-xl sm:max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-14">
            I build software that survives reality.
            <br className="hidden sm:block" /><br className="hidden sm:block" />
            Not for demos. Not for portfolios.
            <br className="hidden sm:block" /><br className="hidden sm:block" />
            For people who need things to work when it matters.
          </p>

          {/* Animated divider */}
          <div className="flex justify-center">
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent"
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-16 sm:top-20 right-10 sm:right-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#3b82f6]/8 to-transparent blur-2xl sm:blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-16 sm:bottom-20 left-10 sm:left-20 w-16 h-16 sm:w-20 sm:h-24 rounded-full bg-gradient-to-tr from-[#6b7280]/8 to-transparent blur-2xl sm:blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </section>
  );
};

// Statement Section
const Statement = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center py-20 sm:py-32 bg-[#141416] relative overflow-hidden">
      {/* Parallax glow */}
      <motion.div
        className="absolute top-1/3 right-0 w-[50vw] h-[50vw] rounded-full bg-[#3b82f6] opacity-[0.015] blur-3xl pointer-events-none"
        style={{ y: bgY }}
      />

      <div className="max-w-4xl sm:max-w-5xl md:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 1 }}
        >
          <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-[#6b7280] uppercase mb-10 sm:mb-14">
            How I Think
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-[1.1] mb-6 sm:mb-8">
            Most code gets written once<br />
            and read hundreds of times.
          </h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-16 h-px bg-[#3b82f6] mb-10 sm:mb-14 origin-left"
          />

          <div className="space-y-8 sm:space-y-10 max-w-3xl">
            <p className="text-xl sm:text-2xl md:text-3xl text-[#6b7280]">
              I build for readers.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <p className="text-base sm:text-lg text-[#6b7280] leading-relaxed">
                Problems have contexts, not solutions. Every project starts with questions:
                What's actually broken? Who feels the pain? What happens if this fails in six months?
                The answers shape the architecture, not the other way around.
              </p>
              <p className="text-base sm:text-lg text-[#6b7280] leading-relaxed">
                Technology stacks change. The fundamentals don't.
                The stack is just a tool. The craft is understanding tradeoffs.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Philosophy Section
const Philosophy = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const items = [
    {
      number: "01",
      title: "Problems have contexts",
      subtitle: "Not solutions"
    },
    {
      number: "02",
      title: "Technology changes",
      subtitle: "Fundamentals don't"
    },
    {
      number: "03",
      title: "Craft over tools",
      subtitle: "Understanding tradeoffs"
    }
  ];

  return (
    <section ref={sectionRef} className="min-h-[70vh] flex items-center py-20 sm:py-28 relative overflow-hidden">
      {/* Parallax glow */}
      <motion.div
        className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-[#3b82f6] opacity-[0.015] blur-3xl pointer-events-none"
        style={{ y: bgY }}
      />

      <div className="max-w-5xl sm:max-w-6xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 1 }}
          className="mb-10 sm:mb-12"
        >
          <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-[#6b7280] uppercase">
            The Philosophy
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
          {items.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="group relative border-t border-[#1e1e1e] p-8 sm:p-10 md:p-12 hover:bg-[#0f0f0f] transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-0 group-hover:w-full h-px bg-gradient-to-r from-[#3b82f6] via-[#6b7280] to-[#3b82f6] transition-all duration-700" />

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-[9px] sm:text-[10px] tracking-[0.4em] text-[#6b7280] mb-6 sm:mb-8 group-hover:text-[#f0f0f0] transition-colors"
              >
                {item.number}
              </motion.p>

              <motion.h3
                className="text-xl sm:text-2xl md:text-3xl text-white font-normal mb-3 sm:mb-4 leading-tight"
                whileHover={{ scale: 1.05 }}
              >
                {item.title}
              </motion.h3>

              <p className="text-sm sm:text-base text-[#6b7280] group-hover:text-[#3b82f6] transition-colors">
                {item.subtitle}
              </p>

              <motion.div
                className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 md:right-10 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
              >
                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6]" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Section Divider
const SectionDivider = () => {
  return (
    <motion.div
      className="flex justify-center items-center py-4 sm:py-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1 }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-8 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#1e1e1e]" />
        <div className="w-1.5 h-1.5 rounded-full border border-[#3b82f6]/40" />
        <div className="w-8 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#1e1e1e]" />
      </div>
    </motion.div>
  );
};

// Project Thumbnail
const ProjectThumbnail = ({ project }: { project: ProjectType }) => {
  const imageData = project.project.logo?.childImageSharp?.gatsbyImageData
    ? getImage(project.project.logo.childImageSharp.gatsbyImageData)
    : undefined;

  if (imageData) {
    return (
      <GatsbyImage
        image={imageData}
        alt={`${project.name} logo`}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm"
        imgClassName="rounded-sm"
      />
    );
  }

  const initial = project.name?.[0] || '?';
  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-[#1e1e1e] text-xs sm:text-sm text-[#6b7280] rounded-sm">
      {initial}
    </div>
  );
};

// Projects Section
const Projects = ({ projects }: { projects: ProjectType[] }) => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="projects" className="min-h-[70vh] py-20 sm:py-28 bg-[#0f0f0f] relative overflow-hidden">
      <div className="max-w-5xl sm:max-w-6xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 1 }}
          className="mb-10 sm:mb-12"
        >
          <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-[#6b7280] uppercase">
            Selected Works
          </p>
        </motion.div>

        <div className="space-y-0">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`relative border-t border-[#1e1e1e] py-8 sm:py-10 md:py-12 px-6 sm:px-8 md:px-10 cursor-pointer transition-all duration-500 ${active === index ? 'bg-[#141416]' : ''}`}
              onClick={() => setActive(active === index ? null : index)}
              role="button"
              aria-expanded={active === index}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(active === index ? null : index); }}}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6 sm:gap-8 md:gap-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.25 }}
                      className="text-[9px] sm:text-[10px] tracking-[0.3em] text-[#6b7280] w-10 sm:w-12"
                    >
                      {(index + 1).toString().padStart(2, '0')}
                    </motion.span>
                    <ProjectThumbnail project={project} />
                    <h3 className="text-2xl sm:text-3xl md:text-4xl text-white font-normal group-hover:text-[#f0f0f0] transition-colors">
                      {project.name}
                    </h3>
                  </div>

                  <AnimatePresence mode="wait">
                    {active === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="lg:pl-16 md:pl-24 pt-6 sm:pt-8"
                      >
                        <p className="text-base sm:text-lg text-[#6b7280] leading-relaxed mb-6 sm:mb-8 max-w-2xl sm:max-w-xl">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                          {project.technologies.slice(0, 5).map((tech: string, i: number) => (
                            <motion.span
                              key={tech}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.06 }}
                              className="text-[10px] sm:text-xs text-[#6b7280] px-4 py-2 border border-[#1e1e1e] hover:border-[#3b82f6] transition-colors"
                            >
                              {tech}
                            </motion.span>
                          ))}
                        </div>

                        <motion.a
                          href={project.project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 sm:gap-3 text-sm text-[#3b82f6] hover:text-white transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ x: 8 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View project <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <span className="text-[9px] sm:text-[10px] text-[#6b7280] lg:text-right self-start lg:self-center">
                  {project.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Experience Section with Timeline
const Experience = ({ jobs }: { jobs: JobType[] }) => {
  const sortedJobs = [...jobs].sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime());

  return (
    <section id="timeline" className="min-h-[70vh] py-20 sm:py-28 bg-[#141416] relative overflow-hidden">
      <div className="max-w-4xl sm:max-w-5xl mx-auto px-4 sm:px-6 md:px-8 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 1 }}
          className="mb-10 sm:mb-12"
        >
          <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-[#6b7280] uppercase">
            Where I've Been
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line with glow */}
          <motion.div
            className="absolute left-[20px] sm:left-[24px] top-0 bottom-0 w-px bg-[#1e1e1e]"
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
            }}
          />

          {sortedJobs.map((job, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.12 }}
              className="relative pl-8 sm:pl-12 md:pl-16 pb-16 sm:pb-20 md:pb-24 last:pb-0"
            >
              {/* Timeline dot */}
              <motion.div
                className="absolute left-[14px] sm:left-[18px] w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                style={{
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)'
                }}
              />

              <p className="text-[9px] sm:text-[10px] tracking-[0.3em] text-[#6b7280] mb-2 sm:mb-3">{job.fromDate}</p>

              <h3 className="text-xl sm:text-2xl md:text-3xl text-white font-normal mb-1 sm:mb-2">
                {job.company.name}
              </h3>

              <p className="text-sm sm:text-base text-[#6b7280] mb-3 sm:mb-4">{job.jobTitle}</p>

              <p className="text-base sm:text-lg text-[#6b7280] leading-relaxed max-w-2xl sm:max-w-xl">
                {job.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Skills Section
const Skills = ({ skills, tools }: { skills: string[]; tools: string[] }) => {
  const all = [...skills, ...tools];

  return (
    <section id="skills" className="min-h-[70vh] py-20 sm:py-28 bg-[#0f0f0f] relative overflow-hidden">
      <div className="max-w-3xl sm:max-w-4xl md:max-w-5xl mx-auto px-4 sm:px-6 md:px-8 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 1 }}
        >
          <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-[#6b7280] uppercase mb-10 sm:mb-12">
            Technologies
          </p>

          <p className="text-lg sm:text-xl text-[#6b7280] leading-relaxed mb-12 sm:mb-16 max-w-xl sm:max-w-2xl">
            Tools change. Principles don't.
            <br className="hidden sm:block" /><br className="hidden sm:block" />
            Here's what I reach for most days.
          </p>

          <motion.div
            className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {all.map((item) => (
              <motion.span
                key={item}
                variants={fadeInUp}
                transition={{ type: "spring" }}
                className="text-xs sm:text-sm text-[#6b7280] px-4 sm:px-5 py-2 sm:py-2.5 border border-[#1e1e1e] hover:bg-[#1f1f2a] hover:text-white hover:border-[#3b82f6] transition-all duration-500"
                whileHover={{ scale: 1.05, y: -3 }}
              >
                {item}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Drive Section
const Drive = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const drives = [
    {
      title: "Curiosity over certainty",
      text: "The best developers I know are ones who admit what they don't know. I built a blockchain wallet app not because I was an expert, but because I wanted to understand how private keys actually work at protocol level."
    },
    {
      title: "Systems thinking",
      text: "Every line of code exists in a system—infrastructure, team, timeline, users. Understanding of whole system means you can build better parts."
    },
    {
      title: "Long-term perspective",
      text: "I've maintained relationships with companies long after projects ended. That happens when you build trust, not just features."
    }
  ];

  return (
    <section ref={sectionRef} className="min-h-[70vh] py-20 sm:py-28 bg-[#0f0f0f] relative overflow-hidden">
      {/* Parallax glow */}
      <motion.div
        className="absolute top-1/4 right-0 w-[45vw] h-[45vw] rounded-full bg-[#6366f1] opacity-[0.012] blur-3xl pointer-events-none"
        style={{ y: bgY }}
      />

      <div className="max-w-5xl sm:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 1 }}
          className="mb-10 sm:mb-12"
        >
          <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-[#6b7280] uppercase">
            What Drives Me
          </p>
        </motion.div>

        <motion.div
          className="space-y-24 sm:space-y-32 md:space-y-40"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {drives.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-normal mb-8 sm:mb-10 leading-[1.1]">
                {item.title}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-[#6b7280] leading-relaxed max-w-3xl sm:max-w-4xl md:max-w-5xl">
                {item.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Closing Section
const Closing = ({ social, profile }: { social: SocialType[]; profile: ProfileType }) => {
  const firstName = profile.fname.toUpperCase();
  const lastName = profile.lname.toUpperCase();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} id="contact" className="min-h-[70vh] flex items-center py-20 sm:py-28 bg-[#0f0f0f] relative overflow-hidden">
      {/* Parallax glow */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-[#3b82f6] opacity-[0.02] blur-3xl pointer-events-none"
        style={{ y: glowY }}
      />

      <div className="max-w-4xl sm:max-w-5xl mx-auto px-4 sm:px-6 md:px-8 w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 1 }}
          className="mb-10 sm:mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-10 sm:mb-12"
          >
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-semibold tracking-[0.06em] mb-4 sm:mb-6 leading-none">
              <span className="text-white">{firstName}</span>
              <span className="text-[#3b82f6] ml-1 sm:ml-2 md:ml-3">{lastName}</span>
            </div>
            <div className="text-[10px] sm:text-xs text-[#6b7280] uppercase tracking-[0.3em] font-display">
              {profile.profession}
            </div>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-normal leading-[1.05] mb-10 sm:mb-16 md:mb-20">
            If this resonates,<br />
            <span className="text-[#3b82f6]">we'll probably get along.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#6b7280] leading-relaxed mb-10 sm:mb-16 md:mb-20 max-w-lg sm:max-w-xl">
            I'm currently building at {profile.company}, always interested in meaningful work with people who care about what they make.
          </p>

          <motion.div
            className="flex justify-center gap-6 sm:gap-8 md:gap-12 mb-10 sm:mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            {social.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-4 sm:px-6 py-3.5 sm:py-4 bg-[#1f1f2a] border border-[#1e1e1e] text-[#6b7280] hover:text-white hover:border-[#3b82f6] transition-all duration-500"
                whileHover={{ scale: 1.1, y: -8 }}
                whileTap={{ scale: 0.95 }}
                aria-label={link.name}
              >
                <span className="text-[#3b82f6] group-hover:text-white transition-colors">
                  {getSocialIcon(link.name, "w-5 h-5 sm:w-6 sm:h-6")}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] via-[#6b7280] to-[#3b82f6] opacity-0 group-hover:opacity-10 transition-opacity" />
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            <motion.a
              href={`mailto:${profile.email}`}
              className="group inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#1f1f2a] border border-[#1e1e1e] text-[#6b7280] hover:text-white hover:border-[#3b82f6] transition-all duration-500 font-medium tracking-wider"
              whileHover={{ scale: 1.1, x: 8 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-sm sm:text-base">{profile.email}</span>
                <FiMail className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6] group-hover:text-white transition-colors" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] via-[#6b7280] to-[#3b82f6] opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const IndexPage: React.FC<IndexPageProps> = ({ data, location }) => {
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const profile = data.profile.nodes[0].profile;
  const social = data.social.nodes;
  const jobs = data.job.nodes;
  const projects = data.project.nodes;

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('portfolio-opening-seen')) {
      setStarted(true);
    }
  }, []);

  useEffect(() => {
    if (started) {
      window.scrollTo(0, 0);
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
    }
  }, [started]);

  // SSR hydration guard — render nothing until client mounts
  if (!mounted) return null;

  return (
    <Layout social={social} profile={profile} location={location} showFooter={started}>
      <Seo
        title={`${profile.fname} ${profile.lname} - ${profile.profession}`}
        description={profile.about}
        keywords={profile.skills.join(', ')}
      />

      <SkipLinks />

      {!started && <Opening profile={profile} onStart={() => setStarted(true)} />}

      {started && (
        <main id="main-content" className="min-h-screen">
          <Hero profile={profile} />
          <SectionDivider />
          <Statement />
          <SectionDivider />
          <Philosophy />
          <Projects projects={projects} />
          <Experience jobs={jobs} />
          <SectionDivider />
          <Skills skills={profile.skills} tools={profile.tools} />
          <Drive />
          <Closing social={social} profile={profile} />
        </main>
      )}
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

export default IndexPage;
