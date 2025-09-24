import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, Sphere, MeshDistortMaterial, Html, OrbitControls, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// Energy Field Particles
const EnergyField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(time + i) * 0.01;
      positions[i3] += Math.cos(time + i * 0.5) * 0.005;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const particles = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particles[i * 3] = (Math.random() - 0.5) * 20;
    particles[i * 3 + 1] = (Math.random() - 0.5) * 20;
    particles[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00ffff"
        size={0.1}
        transparent
        opacity={0.6}
      />
    </points>
  );
};

// Holographic Project Card
const ProjectCard3D = ({ 
  position, 
  project, 
  isSelected, 
  onClick 
}: {
  position: [number, number, number];
  project: any;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      if (isSelected) {
        meshRef.current.scale.setScalar(1.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
      } else {
        meshRef.current.scale.setScalar(hovered ? 1.05 : 1);
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Main card */}
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onClick}
        >
          <boxGeometry args={[2, 3, 0.1]} />
          <meshStandardMaterial
            color={isSelected ? "#00ffff" : "#1a1a2e"}
            transparent
            opacity={0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Holographic border */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[2.1, 3.1, 0.02]} />
          <meshStandardMaterial
            color="#00ffff"
            transparent
            opacity={0.3}
            emissive="#004444"
          />
        </mesh>
        
        {/* Project info overlay */}
        <Html
          position={[0, 0, 0.1]}
          center
          distanceFactor={10}
          occlude
        >
          <div className="w-40 h-60 p-4 text-center text-white bg-gradient-to-b from-transparent to-black/20 rounded-lg">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-24 object-cover rounded mb-2"
            />
            <h4 className="font-bold text-sm mb-1">{project.title}</h4>
            <p className="text-xs text-gray-300 mb-2">{project.shortDesc}</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {project.technologies.slice(0, 3).map((tech: string) => (
                <span key={tech} className="text-xs bg-cyan-500/20 px-1 py-0.5 rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </Html>
        
        {/* Selection glow */}
        {isSelected && (
          <Sphere args={[1.5, 32, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial
              color="#00ffff"
              transparent
              opacity={0.1}
              emissive="#00ffff"
              emissiveIntensity={0.2}
            />
          </Sphere>
        )}
      </Float>
    </group>
  );
};

// Energy Beams connecting to central hub
const EnergyBeam = ({ start, end }: {
  start: [number, number, number];
  end: [number, number, number];
}) => {
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  const direction = new THREE.Vector3().subVectors(
    new THREE.Vector3(...end),
    new THREE.Vector3(...start)
  );
  const distance = direction.length();
  
  return (
    <mesh
      ref={beamRef}
      position={[
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2
      ]}
      rotation={[0, Math.atan2(direction.x, direction.z), 0]}
    >
      <cylinderGeometry args={[0.02, 0.02, distance, 8]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#004444"
        transparent
        opacity={0.5}
      />
    </mesh>
  );
};

// 3D Galaxy Scene
const GalaxyScene = ({ 
  projects, 
  selectedProject, 
  onProjectSelect 
}: {
  projects: any[];
  selectedProject: number | null;
  onProjectSelect: (index: number) => void;
}) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 12);
  }, [camera]);

  const positions: [number, number, number][] = [
    [-4, 2, 0],
    [4, 2, 0],
    [-2, -2, 0],
    [2, -2, 0],
    [0, 0, 2],
    [-6, 0, -2]
  ];

  return (
    <>
      <Stars radius={300} depth={60} count={2000} factor={7} saturation={0} fade />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -10, 5]} intensity={1} color="#ff6b6b" />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />
      
      <EnergyField />
      
      {/* Central Hub */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.3}>
        <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#ffffff"
            distort={0.3}
            speed={2}
            emissive="#444444"
          />
        </Sphere>
      </Float>
      
      {/* Project Cards */}
      {projects.slice(0, 6).map((project, index) => (
        <React.Fragment key={index}>
          <ProjectCard3D
            position={positions[index]}
            project={project}
            isSelected={selectedProject === index}
            onClick={() => onProjectSelect(index)}
          />
          
          {/* Energy beam to center */}
          {selectedProject === index && (
            <EnergyBeam
              start={positions[index]}
              end={[0, 0, 0]}
            />
          )}
        </React.Fragment>
      ))}
      
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        maxDistance={20}
        minDistance={8}
      />
    </>
  );
};

// Project Details Modal
const ProjectDetailsModal = ({ project, onClose }: {
  project: any;
  onClose: () => void;
}) => {
  if (!project) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
            
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Technologies Used</h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string) => (
                    <span 
                      key={tech}
                      className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full text-sm text-cyan-300 border border-cyan-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Project Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  {project.metrics.map((metric: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="text-cyan-400 text-2xl font-bold">{metric.value}</div>
                      <div className="text-gray-300 text-sm">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">{project.title}</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Problem Statement</h4>
                <p className="text-gray-300">{project.problem}</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Solution Approach</h4>
                <p className="text-gray-300">{project.solution}</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Impact & Results</h4>
                <p className="text-gray-300">{project.impact}</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Key Features</h4>
                <ul className="space-y-2">
                  {project.features.map((feature: string, index: number) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <motion.a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Live Demo
              </motion.a>
              <motion.a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border-2 border-purple-500 rounded-lg font-semibold hover:bg-purple-500 hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Code
              </motion.a>
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
};

// Sample project data
const projectsData = [
  {
    title: "E-Commerce Platform",
    shortDesc: "Full-stack marketplace",
    image: "/images/project1.jpg",
    technologies: ["React", "Node.js", "PostgreSQL", "AWS", "Stripe"],
    problem: "Small businesses needed an affordable, feature-rich e-commerce solution that could compete with major platforms.",
    solution: "Built a comprehensive marketplace with advanced features like real-time inventory, automated pricing, and integrated analytics.",
    impact: "Enabled 200+ small businesses to increase online sales by 300% on average within 6 months.",
    features: [
      "Real-time inventory management",
      "Advanced search and filtering",
      "Integrated payment processing",
      "Vendor dashboard and analytics",
      "Mobile-responsive design"
    ],
    metrics: [
      { label: "Active Users", value: "50K+" },
      { label: "Transactions", value: "$2M+" },
      { label: "Uptime", value: "99.9%" },
      { label: "Page Load", value: "<2s" }
    ],
    liveUrl: "https://demo-ecommerce.example.com",
    githubUrl: "https://github.com/example/ecommerce"
  },
  {
    title: "AI Analytics Dashboard",
    shortDesc: "ML-powered insights",
    image: "/images/project2.jpg",
    technologies: ["React", "Python", "TensorFlow", "D3.js", "Docker"],
    problem: "Companies struggled to extract actionable insights from their vast amounts of business data.",
    solution: "Developed an AI-powered dashboard that automatically generates insights and predictions from business data.",
    impact: "Helped 100+ companies make data-driven decisions, resulting in 25% average increase in operational efficiency.",
    features: [
      "Automated data analysis",
      "Predictive modeling",
      "Interactive visualizations",
      "Custom report generation",
      "Real-time alerts"
    ],
    metrics: [
      { label: "Data Points", value: "1B+" },
      { label: "Accuracy", value: "94%" },
      { label: "Processing", value: "<5min" },
      { label: "Clients", value: "100+" }
    ],
    liveUrl: "https://demo-analytics.example.com",
    githubUrl: "https://github.com/example/analytics"
  },
  {
    title: "Crypto Trading Bot",
    shortDesc: "Automated trading system",
    image: "/images/project3.jpg",
    technologies: ["Python", "WebSocket", "Redis", "PostgreSQL", "Docker"],
    problem: "Manual crypto trading was time-consuming and emotion-driven, leading to suboptimal results.",
    solution: "Created an intelligent trading bot using machine learning algorithms to execute optimal trades 24/7.",
    impact: "Generated 45% annual returns while reducing risk by 30% compared to manual trading.",
    features: [
      "Multi-exchange support",
      "Risk management algorithms",
      "Backtesting framework",
      "Real-time notifications",
      "Portfolio optimization"
    ],
    metrics: [
      { label: "Annual Return", value: "45%" },
      { label: "Win Rate", value: "68%" },
      { label: "Trades/Day", value: "150+" },
      { label: "Assets", value: "50+" }
    ],
    liveUrl: "https://demo-trading.example.com",
    githubUrl: "https://github.com/example/trading-bot"
  },
  {
    title: "Smart Home IoT Platform",
    shortDesc: "Connected home automation",
    image: "/images/project4.jpg",
    technologies: ["React Native", "Node.js", "MQTT", "MongoDB", "AWS IoT"],
    problem: "Existing smart home solutions were fragmented and difficult to integrate across different brands.",
    solution: "Built a unified platform that connects and controls all smart home devices from a single interface.",
    impact: "Simplified smart home management for 10K+ users, reducing energy consumption by 20% on average.",
    features: [
      "Universal device compatibility",
      "Voice control integration",
      "Energy monitoring",
      "Automated routines",
      "Security features"
    ],
    metrics: [
      { label: "Connected Devices", value: "500K+" },
      { label: "Energy Saved", value: "20%" },
      { label: "Response Time", value: "<100ms" },
      { label: "Uptime", value: "99.8%" }
    ],
    liveUrl: "https://demo-smarthome.example.com",
    githubUrl: "https://github.com/example/smart-home"
  },
  {
    title: "Video Conferencing App",
    shortDesc: "Real-time communication",
    image: "/images/project5.jpg",
    technologies: ["WebRTC", "Socket.io", "React", "Node.js", "Redis"],
    problem: "During remote work surge, companies needed secure, reliable video conferencing with advanced features.",
    solution: "Developed a high-quality video conferencing platform with screen sharing, recording, and collaboration tools.",
    impact: "Facilitated 1M+ hours of meetings for 500+ companies during the pandemic transition.",
    features: [
      "HD video/audio quality",
      "Screen sharing & recording",
      "Virtual backgrounds",
      "Breakout rooms",
      "End-to-end encryption"
    ],
    metrics: [
      { label: "Meeting Hours", value: "1M+" },
      { label: "Concurrent Users", value: "10K+" },
      { label: "Audio Quality", value: "98%" },
      { label: "Latency", value: "<50ms" }
    ],
    liveUrl: "https://demo-video.example.com",
    githubUrl: "https://github.com/example/video-app"
  },
  {
    title: "Blockchain Supply Chain",
    shortDesc: "Transparent logistics",
    image: "/images/project6.jpg",
    technologies: ["Solidity", "Web3.js", "React", "Node.js", "IPFS"],
    problem: "Supply chains lacked transparency, making it difficult to verify product authenticity and track origins.",
    solution: "Created a blockchain-based system that provides complete transparency and traceability throughout the supply chain.",
    impact: "Reduced fraud by 80% and improved consumer trust for 50+ brands across various industries.",
    features: [
      "Product authenticity verification",
      "Real-time tracking",
      "Smart contract automation",
      "Decentralized storage",
      "Consumer transparency portal"
    ],
    metrics: [
      { label: "Products Tracked", value: "1M+" },
      { label: "Fraud Reduction", value: "80%" },
      { label: "Brands", value: "50+" },
      { label: "Countries", value: "25+" }
    ],
    liveUrl: "https://demo-blockchain.example.com",
    githubUrl: "https://github.com/example/supply-chain"
  }
];

interface ProjectsGalaxyProps {
  onAchievementUnlock: (achievement: string) => void;
}

export const ProjectsGalaxy: React.FC<ProjectsGalaxyProps> = ({ onAchievementUnlock }) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [exploredProjects, setExploredProjects] = useState<number[]>([]);

  const handleProjectSelect = (index: number) => {
    setSelectedProject(index);
    onAchievementUnlock('project_explorer');
    
    // Track explored projects
    if (!exploredProjects.includes(index)) {
      const newExplored = [...exploredProjects, index];
      setExploredProjects(newExplored);
      
      if (newExplored.length === 3) {
        onAchievementUnlock('project_enthusiast');
      } else if (newExplored.length === projectsData.length) {
        onAchievementUnlock('project_master');
      }
    }
  };

  const handleProjectDetails = () => {
    if (selectedProject !== null) {
      setShowModal(true);
      onAchievementUnlock('deep_diver');
    }
  };

  return (
    <div className="relative min-h-screen py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-900/20 to-black"></div>
      
      {/* 3D Galaxy Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
          <GalaxyScene 
            projects={projectsData}
            selectedProject={selectedProject}
            onProjectSelect={handleProjectSelect}
          />
        </Canvas>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Projects Galaxy
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Navigate through my project universe. Each card represents a unique solution,
            showcasing innovation, technical excellence, and real-world impact.
          </p>
          <div className="text-cyan-400 text-lg">
            Click on any project to explore • {exploredProjects.length}/{projectsData.length} discovered
          </div>
        </motion.div>

        {/* Project Info Panel */}
        <AnimatePresence>
          {selectedProject !== null && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-6 left-6 right-6 lg:left-auto lg:w-96 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 z-20"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">
                  {projectsData[selectedProject].title}
                </h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              
              <p className="text-gray-300 mb-4">
                {projectsData[selectedProject].shortDesc}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {projectsData[selectedProject].technologies.slice(0, 4).map((tech) => (
                  <span 
                    key={tech}
                    className="text-xs bg-cyan-500/20 px-2 py-1 rounded text-cyan-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              <motion.button
                onClick={handleProjectDetails}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Full Case Study
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed top-6 left-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white text-sm z-20"
        >
          <div className="space-y-2">
            <div>🖱️ Click projects to select</div>
            <div>🔄 Drag to rotate view</div>
            <div>🔍 Scroll to zoom</div>
          </div>
        </motion.div>
      </div>
      
      {/* Project Details Modal */}
      <AnimatePresence>
        {showModal && selectedProject !== null && (
          <ProjectDetailsModal
            project={projectsData[selectedProject]}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
