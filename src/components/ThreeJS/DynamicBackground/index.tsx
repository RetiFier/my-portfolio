import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// Matrix-style Code Rain
const CodeRain = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dropCount = 100;

  const vertexShader = `
    attribute float opacity;
    attribute float speed;
    varying float vOpacity;
    
    void main() {
      vOpacity = opacity;
      vec3 pos = position;
      pos.y = mod(pos.y - speed * 0.1, 20.0) - 10.0;
      
      vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying float vOpacity;
    
    void main() {
      gl_FragColor = vec4(0.0, 1.0, 0.3, vOpacity * 0.6);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  useEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const opacities = new Float32Array(dropCount);
    const speeds = new Float32Array(dropCount);

    for (let i = 0; i < dropCount; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 50,
        Math.random() * 20 - 10,
        (Math.random() - 0.5) * 50
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      opacities[i] = Math.random();
      speeds[i] = 0.5 + Math.random() * 2;
    }

    meshRef.current.geometry.setAttribute('opacity', new THREE.InstancedBufferAttribute(opacities, 1));
    meshRef.current.geometry.setAttribute('speed', new THREE.InstancedBufferAttribute(speeds, 1));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, dropCount]}>
      <planeGeometry args={[0.1, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        uniforms={{
          time: { value: 0 }
        }}
      />
    </instancedMesh>
  );
};

// Particle Network System
const ParticleNetwork = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const particleCount = 150;

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const linePositions = linesRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    // Update particle positions
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(time + i) * 0.002;
      positions[i3] += Math.cos(time + i * 0.5) * 0.001;
    }

    // Create connections between nearby particles
    let lineIndex = 0;
    for (let i = 0; i < particleCount && lineIndex < linePositions.length; i++) {
      for (let j = i + 1; j < particleCount && lineIndex < linePositions.length; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < 5) {
          linePositions[lineIndex] = positions[i * 3];
          linePositions[lineIndex + 1] = positions[i * 3 + 1];
          linePositions[lineIndex + 2] = positions[i * 3 + 2];
          linePositions[lineIndex + 3] = positions[j * 3];
          linePositions[lineIndex + 4] = positions[j * 3 + 1];
          linePositions[lineIndex + 5] = positions[j * 3 + 2];
          lineIndex += 6;
        }
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Initialize particles
  const particles = new Float32Array(particleCount * 3);
  const connections = new Float32Array(particleCount * particleCount * 6);

  for (let i = 0; i < particleCount; i++) {
    particles[i * 3] = (Math.random() - 0.5) * 30;
    particles[i * 3 + 1] = (Math.random() - 0.5) * 30;
    particles[i * 3 + 2] = (Math.random() - 0.5) * 15;
  }

  return (
    <group>
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
          size={0.05}
          transparent
          opacity={0.6}
        />
      </points>
      
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length / 3}
            array={connections}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.1}
        />
      </lineSegments>
    </group>
  );
};

// Circuit Board Pattern
const CircuitBoard = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.001;
    }
  });

  const paths = [
    { start: [-20, -15, -5], end: [20, -15, -5] },
    { start: [-15, -20, -5], end: [-15, 20, -5] },
    { start: [0, -20, -5], end: [0, 20, -5] },
    { start: [15, -20, -5], end: [15, 20, -5] },
    { start: [-20, 0, -5], end: [20, 0, -5] },
    { start: [-20, 15, -5], end: [20, 15, -5] }
  ];

  return (
    <group ref={groupRef}>
      {paths.map((path, index) => (
        <mesh key={index}>
          <boxGeometry args={[
            Math.abs(path.end[0] - path.start[0]) || 0.1,
            Math.abs(path.end[1] - path.start[1]) || 0.1,
            0.02
          ]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#004444"
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
      
      {/* Circuit nodes */}
      {[-15, 0, 15].map(x => 
        [-15, 0, 15].map(y => (
          <mesh key={`${x}-${y}`} position={[x, y, -5]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#004444"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))
      )}
    </group>
  );
};

// Background Scene Component
const BackgroundScene = ({ mode }: { mode: 'matrix' | 'network' | 'circuit' | 'stars' }) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 10);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.3} color="#00ffff" />
      
      {mode === 'matrix' && <CodeRain />}
      {mode === 'network' && <ParticleNetwork />}
      {mode === 'circuit' && <CircuitBoard />}
      {mode === 'stars' && <Stars radius={300} depth={60} count={2000} factor={7} saturation={0} fade />}
    </>
  );
};

interface DynamicBackgroundProps {
  mode?: 'matrix' | 'network' | 'circuit' | 'stars' | 'auto';
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ mode = 'auto' }) => {
  const [currentMode, setCurrentMode] = useState<'matrix' | 'network' | 'circuit' | 'stars'>('stars');
  const [isDayMode, setIsDayMode] = useState(false);

  // Auto-cycle background modes
  useEffect(() => {
    if (mode === 'auto') {
      const modes: ('matrix' | 'network' | 'circuit' | 'stars')[] = ['stars', 'network', 'circuit', 'matrix'];
      let currentIndex = 0;

      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % modes.length;
        setCurrentMode(modes[currentIndex]);
      }, 15000); // Change every 15 seconds

      return () => clearInterval(interval);
    } else if (mode !== 'auto') {
      setCurrentMode(mode);
    }
  }, [mode]);

  // Day/night cycle based on time
  useEffect(() => {
    const hour = new Date().getHours();
    setIsDayMode(hour >= 6 && hour < 18);
  }, []);

  const backgroundStyle = isDayMode
    ? 'bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300'
    : 'bg-gradient-to-b from-black via-gray-900 to-black';

  return (
    <div className={`absolute inset-0 transition-all duration-1000 ${backgroundStyle}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ opacity: isDayMode ? 0.3 : 0.8 }}
      >
        <BackgroundScene mode={currentMode} />
      </Canvas>
      
      {/* Background Mode Indicator */}
      <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-lg rounded-lg p-2 text-white text-xs">
        Background: {currentMode}
        {mode === 'auto' && ' (auto)'}
      </div>
      
      {/* Day/Night Indicator */}
      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-lg rounded-lg p-2 text-white text-xs">
        {isDayMode ? '☀️ Day Mode' : '🌙 Night Mode'}
      </div>
    </div>
  );
};
