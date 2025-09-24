import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiSkipForward, FiRotateCcw, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

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

interface VisualizationStep {
  id: number;
  description: string;
  data: any;
  highlight?: string[];
  nodeType?: 'start' | 'process' | 'decision' | 'end';
  connections?: number[];
}

interface VisualizationType {
  type: 'algorithm' | 'dataStructure' | 'apiFlow' | 'stateManagement' | 'database';
  steps?: VisualizationStep[];
  data?: any;
}

interface AlgorithmVisualizerProps {
  visualization: VisualizationType;
  title: string;
  isActive: boolean;
  onComplete?: () => void;
}

const FlowchartNode: React.FC<{
  step: VisualizationStep;
  isActive: boolean;
  isCompleted: boolean;
  position: { x: number; y: number };
  index: number;
}> = ({ step, isActive, isCompleted, position, index }) => {
  const getNodeStyle = () => {
    switch (step.nodeType || 'process') {
      case 'start':
        return {
          borderRadius: '50%',
          backgroundColor: isActive ? nightOwl.success : isCompleted ? nightOwl.success + '80' : nightOwl.surface,
          borderColor: nightOwl.success
        };
      case 'decision':
        return {
          borderRadius: '8px',
          backgroundColor: isActive ? nightOwl.warning : isCompleted ? nightOwl.warning + '80' : nightOwl.surface,
          borderColor: nightOwl.warning,
          transform: 'rotate(45deg)'
        };
      case 'end':
        return {
          borderRadius: '50%',
          backgroundColor: isActive ? nightOwl.error : isCompleted ? nightOwl.error + '80' : nightOwl.surface,
          borderColor: nightOwl.error
        };
      default:
        return {
          borderRadius: '8px',
          backgroundColor: isActive ? nightOwl.accent : isCompleted ? nightOwl.accent + '80' : nightOwl.surface,
          borderColor: nightOwl.accent
        };
    }
  };

  return (
    <motion.div
      className="absolute flex items-center justify-center border-2 cursor-pointer"
      style={{
        left: position.x,
        top: position.y,
        width: '120px',
        height: '80px',
        ...getNodeStyle()
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isActive ? 1.1 : 1, 
        opacity: 1,
        boxShadow: isActive ? `0 0 20px ${nightOwl.accent}50` : 'none'
      }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <div 
        className="text-center p-2"
        style={{ 
          transform: step.nodeType === 'decision' ? 'rotate(-45deg)' : 'none',
          color: isActive || isCompleted ? nightOwl.bg : nightOwl.text
        }}
      >
        <div className="text-xs font-medium mb-1">
          Step {step.id}
        </div>
        <div className="text-xs leading-tight">
          {step.description.length > 25 ? 
            step.description.substring(0, 25) + '...' : 
            step.description
          }
        </div>
        {isCompleted && (
          <FiCheckCircle className="w-4 h-4 mx-auto mt-1" />
        )}
      </div>
    </motion.div>
  );
};

const ConnectionLine: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
  delay: number;
}> = ({ from, to, isActive, delay }) => {
  const length = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;

  return (
    <motion.div
      className="absolute origin-left"
      style={{
        left: from.x + 60,
        top: from.y + 40,
        width: length,
        height: '2px',
        backgroundColor: isActive ? nightOwl.accent : nightOwl.border,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%'
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: isActive ? 1 : 0.3 }}
      transition={{ duration: 0.5, delay }}
    >
      {isActive && (
        <motion.div
          className="absolute right-0 top-1/2 transform -translate-y-1/2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
        >
          <FiArrowRight 
            className="w-4 h-4" 
            style={{ color: nightOwl.accent }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

const DataDisplay: React.FC<{
  data: any;
  isActive: boolean;
}> = ({ data, isActive }) => {
  if (!data || typeof data !== 'object') return null;

  return (
    <motion.div
      className="mt-4 p-4 rounded-lg border"
      style={{
        backgroundColor: nightOwl.darker,
        borderColor: isActive ? nightOwl.accent : nightOwl.border
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0.7, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-sm font-medium mb-2" style={{ color: nightOwl.accent }}>
        Current State:
      </div>
      <div className="space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between text-xs">
            <span style={{ color: nightOwl.textDim }}>{key}:</span>
            <span style={{ color: nightOwl.text }}>
              {Array.isArray(value) ? `[${value.join(', ')}]` : String(value)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({
  visualization,
  title,
  isActive,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = visualization.steps || [];

  // Calculate positions for flowchart layout
  const getNodePosition = (index: number, total: number) => {
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    return {
      x: col * 180 + 50,
      y: row * 120 + 50
    };
  };

  useEffect(() => {
    if (!isActive) {
      setIsPlaying(false);
      return;
    }

    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setCurrentStep(prev => prev + 1);
      }, 2000);

      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setIsPlaying(false);
      onComplete?.();
    }
  }, [isPlaying, currentStep, steps.length, isActive, onComplete]);

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      handleReset();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(false);
  };

  if (!isActive || steps.length === 0) return null;

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold" style={{ color: nightOwl.text }}>
          {title} Visualization
        </h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlay}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: nightOwl.accent,
              color: nightOwl.bg
            }}
          >
            {isPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep >= steps.length - 1}
            className="p-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: nightOwl.surface,
              color: nightOwl.text
            }}
          >
            <FiSkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: nightOwl.surface,
              color: nightOwl.text
            }}
          >
            <FiRotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2" style={{ color: nightOwl.textDim }}>
          <span>Progress</span>
          <span>{currentStep + 1} / {steps.length}</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: nightOwl.darker }}>
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: nightOwl.accent }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Flowchart Visualization */}
      <div 
        className="relative border rounded-lg p-6 mb-4 overflow-auto"
        style={{
          backgroundColor: nightOwl.surface,
          borderColor: nightOwl.border,
          minHeight: '400px'
        }}
      >
        {/* Render Nodes */}
        {steps.map((step, index) => {
          const position = getNodePosition(index, steps.length);
          return (
            <FlowchartNode
              key={step.id}
              step={step}
              isActive={index === currentStep}
              isCompleted={completedSteps.has(index)}
              position={position}
              index={index}
            />
          );
        })}

        {/* Render Connections */}
        {steps.map((step, index) => {
          if (index >= steps.length - 1) return null;
          
          const fromPos = getNodePosition(index, steps.length);
          const toPos = getNodePosition(index + 1, steps.length);
          
          return (
            <ConnectionLine
              key={`connection-${index}`}
              from={fromPos}
              to={toPos}
              isActive={index <= currentStep}
              delay={index * 0.1}
            />
          );
        })}
      </div>

      {/* Current Step Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: nightOwl.darker,
            borderColor: nightOwl.accent
          }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: nightOwl.accent }}
            />
            <span className="font-medium text-sm" style={{ color: nightOwl.text }}>
              Step {currentStep + 1}: {steps[currentStep]?.description}
            </span>
          </div>
          
          {steps[currentStep]?.data && (
            <DataDisplay 
              data={steps[currentStep].data} 
              isActive={true}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AlgorithmVisualizer;
