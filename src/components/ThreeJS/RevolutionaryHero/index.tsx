import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, Sphere, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Typed } from '../../Typed';

// Animated Code Particles
const CodeParticles = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = new THREE.Object3D();
  const particles = 50;

  useFrame((state) => {
    if (!meshRef.current) return;

    for (let i = 0; i < particles; i++) {
      const time = state.clock.elapsedTime;
      const x = Math.sin(time + i) * 10;
      const y = Math.sin(time * 0.5 + i) * 8;
      const z = Math.cos(time + i) * 5;

      tempObject.position.set(x, y, z);
      tempObject.rotation.x = time + i;
      tempObject.rotation.y = time * 0.5 + i;
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particles]}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial 
        color="#00ffff" 
        emissive="#004444" 
        transparent 
        opacity={0.6} 
      />
    </instancedMesh>
  );
};

// Interactive Avatar
const DeveloperAvatar = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere
        ref={meshRef}
        args={[1.5, 64, 64]}
        position={[3, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={hovered ? "#ff6b6b" : "#4ecdc4"}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.4}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Holographic Ring */}
      <mesh position={[3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#004444"
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
};

// 3D Hero Scene
const HeroScene = ({ onInteraction }: { onInteraction: () => void }) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 10);
  }, [camera]);

  return (
    <>
      <Stars radius={300} depth={60} count={1000} factor={7} saturation={0} fade />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -10, 5]} intensity={1} color="#ff6b6b" />
      
      <CodeParticles />
      <DeveloperAvatar />
      
      {/* 3D Text */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[-3, 2, 0]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          RETI FIER
        </Text>
        <Text
          position={[-3, 1, 0]}
          fontSize={0.4}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Regular.woff"
        >
          Full-Stack Developer
        </Text>
      </Float>
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        onChange={onInteraction}
      />
    </>
  );
};

// Real-time Stats Component
const RealTimeStats = () => {
  const [stats, setStats] = useState({
    experience: 0,
    projects: 0,
    linesOfCode: 0,
    commits: 0
  });

  useEffect(() => {
    // Animate counters
    const targetStats = {
      experience: 5.5,
      projects: 47,
      linesOfCode: 125000,
      commits: 1847
    };

    const duration = 3000; // 3 seconds
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setStats({
        experience: Math.round(targetStats.experience * easedProgress * 10) / 10,
        projects: Math.round(targetStats.projects * easedProgress),
        linesOfCode: Math.round(targetStats.linesOfCode * easedProgress),
        commits: Math.round(targetStats.commits * easedProgress)
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      {[
        { label: 'Years Experience', value: stats.experience, suffix: '+' },
        { label: 'Projects Completed', value: stats.projects, suffix: '+' },
        { label: 'Lines of Code', value: stats.linesOfCode.toLocaleString(), suffix: '+' },
        { label: 'GitHub Commits', value: stats.commits, suffix: '+' }
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          className="text-center p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-3xl font-bold text-cyan-400 mb-2">
            {stat.value}{stat.suffix}
          </div>
          <div className="text-sm text-gray-300">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Tech Stack Radar
const TechRadar = () => {
  const skills = [
    { name: 'React', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Node.js', level: 88 },
    { name: 'Python', level: 85 },
    { name: 'AWS', level: 82 },
    { name: 'Docker', level: 80 }
  ];

  return (
    <motion.div 
      className="relative w-64 h-64 mx-auto mb-12"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
    >
      <svg className="w-full h-full" viewBox="0 0 200 200">
        {/* Radar circles */}
        {[40, 60, 80, 100].map((radius, index) => (
          <circle
            key={radius}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}
        
        {/* Skill points */}
        {skills.map((skill, index) => {
          const angle = (index * 60) * (Math.PI / 180);
          const radius = skill.level;
          const x = 100 + radius * Math.cos(angle - Math.PI / 2);
          const y = 100 + radius * Math.sin(angle - Math.PI / 2);
          
          return (
            <g key={skill.name}>
              <motion.circle
                cx={x}
                cy={y}
                r="4"
                fill="#00ffff"
                initial={{ r: 0 }}
                animate={{ r: 4 }}
                transition={{ delay: 2 + index * 0.1 }}
              />
              <text
                x={x + 10}
                y={y}
                fill="white"
                fontSize="10"
                className="font-semibold"
              >
                {skill.name}
              </text>
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
};

interface RevolutionaryHeroProps {
  onAchievementUnlock: (achievement: string) => void;
}

export const RevolutionaryHero: React.FC<RevolutionaryHeroProps> = ({ onAchievementUnlock }) => {
  const [codeStrings] = useState([
    'const developer = new FullStackEngineer("Reti Fier");',
    'developer.skills.push("React", "TypeScript", "Node.js");',
    'if (developer.passionate && developer.innovative) {',
    '  return "Let\'s build something amazing!";',
    '}',
    '// Always learning, always creating...'
  ]);

  return (
    <div className="relative h-screen flex items-center justify-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <HeroScene onInteraction={() => onAchievementUnlock('3d_explorer')} />
        </Canvas>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <h1 className="text-6xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome to the Future
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience interactive development like never before. Where code meets creativity, and innovation drives excellence.
          </p>
        </motion.div>

        {/* Live Coding Animation */}
        <motion.div 
          className="bg-gray-900 rounded-lg p-6 mb-12 max-w-2xl mx-auto text-left font-mono text-green-400"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-400 ml-2">live-coding.ts</span>
          </div>
          <Typed
            strings={codeStrings}
            typeSpeed={50}
            backSpeed={30}
            backDelay={2000}
            loop={true}
            showCursor={true}
            cursorChar="_"
          />
        </motion.div>

        {/* Real-time Stats */}
        <RealTimeStats />

        {/* Tech Radar */}
        <TechRadar />

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onAchievementUnlock('journey_started');
              document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Start the Journey
          </motion.button>
          <motion.button
            className="px-8 py-4 border-2 border-purple-500 rounded-lg font-semibold text-lg hover:bg-purple-500 hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAchievementUnlock('portfolio_explorer')}
          >
            Explore Projects
          </motion.button>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </div>
  );
};
