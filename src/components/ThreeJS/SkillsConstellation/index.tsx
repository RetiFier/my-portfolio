import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Sphere, Line, Float, OrbitControls, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Skill Node Component
const SkillNode = ({ 
  position, 
  skill, 
  isActive, 
  connections,
  onClick 
}: {
  position: [number, number, number];
  skill: any;
  isActive: boolean;
  connections: number[];
  onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = isActive ? 1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1 : 
                   hovered ? 1.1 : 1;
      meshRef.current.scale.setScalar(scale);
      
      // Gentle floating motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  // Size based on proficiency level
  const size = 0.2 + (skill.proficiency / 100) * 0.3;
  const color = skill.category === 'frontend' ? '#ff6b6b' :
               skill.category === 'backend' ? '#4ecdc4' :
               skill.category === 'database' ? '#45b7d1' :
               skill.category === 'cloud' ? '#96ceb4' :
               skill.category === 'tools' ? '#feca57' : '#c7ecee';

  return (
    <group ref={meshRef} position={position}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.1}>
        <Sphere
          args={[size, 32, 32]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onClick}
        >
          <meshStandardMaterial
            color={color}
            emissive={isActive ? color : '#000000'}
            emissiveIntensity={isActive ? 0.3 : 0}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        
        {/* Skill name */}
        <Text
          position={[0, size + 0.3, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {skill.name}
        </Text>
        
        {/* Proficiency ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size + 0.1, 0.01, 16, 100]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={skill.proficiency / 100}
          />
        </mesh>
      </Float>
    </group>
  );
};

// Connection Line Component
const SkillConnection = ({ 
  start, 
  end, 
  active 
}: {
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
}) => {
  const lineRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = active ? 
        0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.2 : 0.2;
    }
  });

  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];

  return (
    <Line
      ref={lineRef}
      points={points}
      color={active ? "#00ffff" : "#ffffff"}
      lineWidth={active ? 3 : 1}
      transparent
      opacity={active ? 0.6 : 0.2}
    />
  );
};

// Constellation Background
const ConstellationBackground = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 300;

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
    }
  });

  const particles = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = 20 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    particles[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particles[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particles[i * 3 + 2] = radius * Math.cos(phi);
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
        color="#ffffff"
        size={0.05}
        transparent
        opacity={0.4}
      />
    </points>
  );
};

// 3D Skills Scene
const SkillsScene = ({ 
  skills, 
  activeSkill, 
  onSkillClick 
}: {
  skills: any[];
  activeSkill: number | null;
  onSkillClick: (index: number) => void;
}) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 15);
  }, [camera]);

  // Arrange skills in a 3D sphere formation
  const positions: [number, number, number][] = skills.map((_, index) => {
    const phi = Math.acos(-1 + (2 * index) / skills.length);
    const theta = Math.sqrt(skills.length * Math.PI) * phi;
    const radius = 8;
    
    return [
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    ];
  });

  // Define connections based on skill relationships
  const connections = skills.map((skill, index) => {
    return skills
      .map((otherSkill, otherIndex) => {
        if (index === otherIndex) return -1;
        
        // Connect skills in same category or related technologies
        if (skill.category === otherSkill.category || 
            skill.relatedTo?.includes(otherSkill.name) ||
            otherSkill.relatedTo?.includes(skill.name)) {
          return otherIndex;
        }
        return -1;
      })
      .filter(i => i !== -1);
  });

  return (
    <>
      <Stars radius={300} depth={60} count={1500} factor={7} saturation={0} fade />
      <ConstellationBackground />
      
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00ffff" />
      
      {/* Central core */}
      <Float speed={0.5} rotationIntensity={0.5} floatIntensity={0.3}>
        <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            emissive="#ffffff"
            emissiveIntensity={0.1}
          />
        </Sphere>
      </Float>
      
      {/* Skill nodes */}
      {skills.map((skill, index) => (
        <SkillNode
          key={skill.name}
          position={positions[index]}
          skill={skill}
          isActive={activeSkill === index}
          connections={connections[index]}
          onClick={() => onSkillClick(index)}
        />
      ))}
      
      {/* Connections */}
      {activeSkill !== null && connections[activeSkill].map((connectionIndex) => (
        <SkillConnection
          key={`${activeSkill}-${connectionIndex}`}
          start={positions[activeSkill]}
          end={positions[connectionIndex]}
          active={true}
        />
      ))}
      
      {/* Static connections for constellation effect */}
      {skills.map((skill, index) => (
        connections[index].slice(0, 2).map((connectionIndex) => (
          <SkillConnection
            key={`static-${index}-${connectionIndex}`}
            start={positions[index]}
            end={positions[connectionIndex]}
            active={false}
          />
        ))
      )).flat()}
      
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        maxDistance={25}
        minDistance={10}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Skills data
const skillsData = [
  // Frontend
  { name: 'React', proficiency: 95, category: 'frontend', relatedTo: ['JavaScript', 'TypeScript', 'Next.js'] },
  { name: 'TypeScript', proficiency: 90, category: 'frontend', relatedTo: ['JavaScript', 'React', 'Node.js'] },
  { name: 'Next.js', proficiency: 88, category: 'frontend', relatedTo: ['React', 'Vercel', 'Node.js'] },
  { name: 'Vue.js', proficiency: 85, category: 'frontend', relatedTo: ['JavaScript', 'Nuxt.js'] },
  { name: 'Three.js', proficiency: 82, category: 'frontend', relatedTo: ['JavaScript', 'WebGL'] },
  { name: 'CSS/Sass', proficiency: 90, category: 'frontend', relatedTo: ['HTML', 'JavaScript'] },
  
  // Backend
  { name: 'Node.js', proficiency: 92, category: 'backend', relatedTo: ['JavaScript', 'Express', 'TypeScript'] },
  { name: 'Python', proficiency: 88, category: 'backend', relatedTo: ['Django', 'FastAPI', 'Machine Learning'] },
  { name: 'Express.js', proficiency: 90, category: 'backend', relatedTo: ['Node.js', 'JavaScript'] },
  { name: 'Django', proficiency: 85, category: 'backend', relatedTo: ['Python', 'REST APIs'] },
  { name: 'GraphQL', proficiency: 80, category: 'backend', relatedTo: ['APIs', 'Node.js'] },
  { name: 'REST APIs', proficiency: 95, category: 'backend', relatedTo: ['Node.js', 'Python'] },
  
  // Database
  { name: 'PostgreSQL', proficiency: 88, category: 'database', relatedTo: ['SQL', 'Node.js'] },
  { name: 'MongoDB', proficiency: 85, category: 'database', relatedTo: ['Node.js', 'NoSQL'] },
  { name: 'Redis', proficiency: 82, category: 'database', relatedTo: ['Caching', 'Node.js'] },
  { name: 'MySQL', proficiency: 80, category: 'database', relatedTo: ['SQL', 'PHP'] },
  
  // Cloud & DevOps
  { name: 'AWS', proficiency: 87, category: 'cloud', relatedTo: ['Docker', 'Kubernetes', 'CI/CD'] },
  { name: 'Docker', proficiency: 85, category: 'cloud', relatedTo: ['Kubernetes', 'AWS', 'CI/CD'] },
  { name: 'Kubernetes', proficiency: 75, category: 'cloud', relatedTo: ['Docker', 'AWS'] },
  { name: 'Vercel', proficiency: 90, category: 'cloud', relatedTo: ['Next.js', 'React'] },
  { name: 'Netlify', proficiency: 85, category: 'cloud', relatedTo: ['React', 'JAMstack'] },
  
  // Tools & Others
  { name: 'Git', proficiency: 95, category: 'tools', relatedTo: ['GitHub', 'CI/CD'] },
  { name: 'Webpack', proficiency: 80, category: 'tools', relatedTo: ['JavaScript', 'React'] },
  { name: 'Jest', proficiency: 85, category: 'tools', relatedTo: ['Testing', 'JavaScript'] },
  { name: 'Cypress', proficiency: 78, category: 'tools', relatedTo: ['Testing', 'E2E'] },
  { name: 'Figma', proficiency: 75, category: 'tools', relatedTo: ['Design', 'UI/UX'] }
];

interface SkillsConstellationProps {
  onAchievementUnlock: (achievement: string) => void;
}

export const SkillsConstellation: React.FC<SkillsConstellationProps> = ({ onAchievementUnlock }) => {
  const [activeSkill, setActiveSkill] = useState<number | null>(null);
  const [exploredSkills, setExploredSkills] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleSkillClick = (index: number) => {
    setActiveSkill(index);
    onAchievementUnlock('skill_explorer');
    
    // Track explored skills
    if (!exploredSkills.includes(index)) {
      const newExplored = [...exploredSkills, index];
      setExploredSkills(newExplored);
      
      if (newExplored.length === 10) {
        onAchievementUnlock('skill_enthusiast');
      } else if (newExplored.length === skillsData.length) {
        onAchievementUnlock('skill_master');
      }
    }
  };

  const categories = ['all', 'frontend', 'backend', 'database', 'cloud', 'tools'];
  const filteredSkills = selectedCategory === 'all' ? 
    skillsData : 
    skillsData.filter(skill => skill.category === selectedCategory);

  const currentSkill = activeSkill !== null ? skillsData[activeSkill] : null;

  return (
    <div className="relative min-h-screen py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-900/20 to-black"></div>
      
      {/* 3D Constellation Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
          <SkillsScene 
            skills={filteredSkills}
            activeSkill={activeSkill}
            onSkillClick={handleSkillClick}
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
            Skills Constellation
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Explore my technical universe. Each star represents a skill, connected by relationships and expertise levels.
            Navigate through the constellation to discover proficiencies and connections.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setActiveSkill(null);
                onAchievementUnlock('category_explorer');
              }}
              className={`px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-cyan-500 border-cyan-500 text-white'
                  : 'border-cyan-500/30 text-cyan-400 hover:border-cyan-500/60'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Skills Legend */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="fixed left-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white text-sm z-20 max-w-xs"
        >
          <h4 className="font-bold mb-3">Skills Universe</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Frontend</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
              <span>Backend</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Database</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Cloud/DevOps</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Tools</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="text-xs text-gray-300">
              Size = Proficiency Level<br/>
              Click to explore connections<br/>
              Drag to rotate view
            </div>
          </div>
        </motion.div>

        {/* Skill Details Panel */}
        {currentSkill && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 w-80 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 z-20"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white">{currentSkill.name}</h3>
              <button
                onClick={() => setActiveSkill(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Proficiency</span>
                <span className="text-cyan-400 font-bold">{currentSkill.proficiency}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentSkill.proficiency}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-gray-300">Category</span>
              <div className="mt-1">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-sm text-purple-300 border border-purple-500/30">
                  {currentSkill.category}
                </span>
              </div>
            </div>
            
            {currentSkill.relatedTo && currentSkill.relatedTo.length > 0 && (
              <div>
                <span className="text-gray-300">Related Technologies</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentSkill.relatedTo.map((tech) => (
                    <span 
                      key={tech}
                      className="text-xs bg-cyan-500/20 px-2 py-1 rounded text-cyan-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="fixed right-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white text-sm z-20"
        >
          <h4 className="font-bold mb-3">Exploration Stats</h4>
          <div className="space-y-2">
            <div>Skills Explored: {exploredSkills.length}/{skillsData.length}</div>
            <div>Current View: {selectedCategory}</div>
            <div>Active Connections: {currentSkill ? currentSkill.relatedTo?.length || 0 : 0}</div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 left-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 text-white text-sm z-20"
        >
          <div className="space-y-2">
            <div>🖱️ Click skills to explore</div>
            <div>🔄 Auto-rotation enabled</div>
            <div>🔍 Scroll to zoom</div>
            <div>🌟 Larger stars = Higher proficiency</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
