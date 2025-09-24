import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, Line, Float, Html } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';

// 3D Timeline Node
const TimelineNode = ({ position, color, isActive, onClick }: {
  position: [number, number, number];
  color: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isActive) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.2}>
      <Sphere
        ref={meshRef}
        args={[0.3, 32, 32]}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <meshStandardMaterial
          color={isActive ? '#00ffff' : color}
          emissive={hovered ? '#444444' : '#000000'}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      {/* Glowing ring around active node */}
      {isActive && (
        <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#004444"
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </Float>
  );
};

// Connection Lines
const ConnectionLine = ({ start, end }: {
  start: [number, number, number];
  end: [number, number, number];
}) => {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
  return (
    <Line
      points={points}
      color="#00ffff"
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
};

// 3D Timeline Scene
const Timeline3DScene = ({ activeIndex, onNodeClick }: {
  activeIndex: number;
  onNodeClick: (index: number) => void;
}) => {
  const positions: [number, number, number][] = [
    [-6, 2, 0],
    [-3, 0, 0],
    [0, 1, 0],
    [3, -1, 0],
    [6, 0, 0]
  ];

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, 5, 5]} intensity={0.8} color="#ff6b6b" />
      
      {/* Timeline Nodes */}
      {positions.map((position, index) => (
        <TimelineNode
          key={index}
          position={position}
          color={colors[index]}
          isActive={activeIndex === index}
          onClick={() => onNodeClick(index)}
        />
      ))}
      
      {/* Connection Lines */}
      {positions.slice(0, -1).map((start, index) => (
        <ConnectionLine
          key={index}
          start={start}
          end={positions[index + 1]}
        />
      ))}
      
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.1}>
          <Sphere
            args={[0.02, 8, 8]}
            position={[
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 5
            ]}
          >
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.2}
              transparent
              opacity={0.6}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
};

// Experience Data
const experienceData = [
  {
    company: "TechCorp Solutions",
    role: "Senior Full-Stack Developer",
    period: "2023 - Present",
    location: "Remote",
    description: "Leading development of scalable web applications using React, Node.js, and AWS. Architected microservices handling 1M+ requests/day.",
    technologies: ["React", "TypeScript", "Node.js", "AWS", "Docker", "PostgreSQL"],
    achievements: [
      "Reduced application load time by 65%",
      "Led a team of 6 developers",
      "Implemented CI/CD pipeline reducing deployment time by 80%"
    ],
    projects: [
      {
        name: "E-commerce Platform",
        impact: "Increased conversion rate by 35%"
      },
      {
        name: "Real-time Analytics Dashboard",
        impact: "Used by 50+ clients daily"
      }
    ]
  },
  {
    company: "InnovateLab",
    role: "Full-Stack Developer",
    period: "2022 - 2023",
    location: "San Francisco, CA",
    description: "Developed cutting-edge fintech applications with focus on security and performance. Collaborated with cross-functional teams.",
    technologies: ["Vue.js", "Python", "Django", "Redis", "PostgreSQL"],
    achievements: [
      "Built secure payment processing system",
      "Achieved 99.9% uptime for critical systems",
      "Mentored 3 junior developers"
    ],
    projects: [
      {
        name: "Crypto Trading Platform",
        impact: "$2M+ in daily trading volume"
      }
    ]
  },
  {
    company: "StartupXYZ",
    role: "Frontend Developer",
    period: "2021 - 2022",
    location: "New York, NY",
    description: "Specialized in creating responsive, accessible web interfaces. Worked closely with design team to implement pixel-perfect UIs.",
    technologies: ["React", "JavaScript", "Sass", "Webpack", "Jest"],
    achievements: [
      "Improved accessibility score to 98%",
      "Reduced bundle size by 40%",
      "Implemented design system used across 5 products"
    ],
    projects: [
      {
        name: "Customer Portal Redesign",
        impact: "30% increase in user satisfaction"
      }
    ]
  },
  {
    company: "WebDev Agency",
    role: "Junior Developer",
    period: "2020 - 2021",
    location: "Boston, MA",
    description: "Learned foundational web development skills while contributing to client projects. Focused on modern JavaScript and React development.",
    technologies: ["JavaScript", "React", "HTML5", "CSS3", "Git"],
    achievements: [
      "Completed 15+ client projects",
      "Earned React certification",
      "Contributed to open-source projects"
    ],
    projects: [
      {
        name: "Small Business Websites",
        impact: "Delivered 20+ websites on time"
      }
    ]
  },
  {
    company: "University Projects",
    role: "Computer Science Student",
    period: "2018 - 2020",
    location: "MIT",
    description: "Studied computer science fundamentals while working on innovative projects. Focused on algorithms, data structures, and software engineering.",
    technologies: ["Python", "Java", "C++", "MySQL", "Git"],
    achievements: [
      "Dean's List for 4 semesters",
      "Led hackathon winning team",
      "Published research paper on ML algorithms"
    ],
    projects: [
      {
        name: "AI Chess Engine",
        impact: "Beat 95% of human players"
      }
    ]
  }
];

interface InteractiveTimelineProps {
  onAchievementUnlock: (achievement: string) => void;
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({ onAchievementUnlock }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewedAll, setViewedAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const handleNodeClick = (index: number) => {
    setActiveIndex(index);
    onAchievementUnlock('timeline_explorer');
    
    // Check if all nodes have been viewed
    const viewedNodes = JSON.parse(localStorage.getItem('viewedTimelineNodes') || '[]');
    if (!viewedNodes.includes(index)) {
      viewedNodes.push(index);
      localStorage.setItem('viewedTimelineNodes', JSON.stringify(viewedNodes));
      
      if (viewedNodes.length === experienceData.length && !viewedAll) {
        setViewedAll(true);
        onAchievementUnlock('timeline_master');
      }
    }
  };

  useEffect(() => {
    // Auto-cycle through timeline nodes
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % experienceData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentExperience = experienceData[activeIndex];

  return (
    <div ref={containerRef} className="relative min-h-screen py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black"></div>
      
      {/* 3D Timeline Background */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y, opacity }}
      >
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <Timeline3DScene 
            activeIndex={activeIndex} 
            onNodeClick={handleNodeClick}
          />
        </Canvas>
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Journey Through Experience
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Navigate through my professional journey. Each node represents a milestone in my career,
            showcasing growth, learning, and impact.
          </p>
        </motion.div>

        {/* Experience Details Card */}
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-4xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                <span className="text-cyan-400 font-semibold">{currentExperience.period}</span>
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-2">
                {currentExperience.role}
              </h3>
              
              <h4 className="text-xl text-purple-400 mb-4">
                {currentExperience.company} • {currentExperience.location}
              </h4>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                {currentExperience.description}
              </p>
              
              {/* Technologies */}
              <div className="mb-6">
                <h5 className="text-white font-semibold mb-3">Technologies Used</h5>
                <div className="flex flex-wrap gap-2">
                  {currentExperience.technologies.map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full text-sm text-cyan-300 border border-cyan-500/30"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              {/* Achievements */}
              <div className="mb-6">
                <h5 className="text-white font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  Key Achievements
                </h5>
                <ul className="space-y-2">
                  {currentExperience.achievements.map((achievement, index) => (
                    <motion.li
                      key={achievement}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-gray-300 flex items-start"
                    >
                      <span className="text-green-400 mr-2">✓</span>
                      {achievement}
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              {/* Featured Projects */}
              <div>
                <h5 className="text-white font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Featured Projects
                </h5>
                <div className="space-y-3">
                  {currentExperience.projects.map((project, index) => (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <h6 className="text-white font-medium mb-1">{project.name}</h6>
                      <p className="text-sm text-purple-300">{project.impact}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-center mt-8 gap-4">
            {experienceData.map((_, index) => (
              <button
                key={index}
                onClick={() => handleNodeClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'bg-cyan-400 scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Timeline Completion Badge */}
        {viewedAll && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-black font-bold"
          >
            🏆 Timeline Master Unlocked!
          </motion.div>
        )}
      </div>
    </div>
  );
};
