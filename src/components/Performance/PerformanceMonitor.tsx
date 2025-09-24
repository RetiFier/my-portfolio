import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  connectionType: string;
}

interface PerformanceMonitorProps {
  showMetrics?: boolean;
  onPerformanceChange?: (metrics: PerformanceMetrics) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  initialCompact?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showMetrics = false,
  onPerformanceChange,
  position = 'top-right',
  initialCompact = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    loadTime: 0,
    connectionType: 'unknown'
  });
  const [isVisible, setIsVisible] = useState(showMetrics);
  const [isCompact, setIsCompact] = useState(initialCompact || window.innerWidth < 768);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    // FPS monitoring
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        setMetrics(prev => ({ ...prev, fps }));
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    // Memory monitoring (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = Math.round((performance as any).memory.usedJSHeapSize / 1048576); // MB
        setMetrics(prev => ({ ...prev, memory }));
      }
    };

    // Connection type detection
    const getConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        return connection.effectiveType || 'unknown';
      }
      return 'unknown';
    };

    // Load time measurement
    const measureLoadTime = () => {
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        setMetrics(prev => ({ ...prev, loadTime: Math.round(loadTime) }));
      }
    };

    // Initialize measurements
    measureFPS();
    measureMemory();
    measureLoadTime();
    
    setMetrics(prev => ({ 
      ...prev, 
      connectionType: getConnectionType() 
    }));

    // Set up intervals
    const memoryInterval = setInterval(measureMemory, 2000);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(memoryInterval);
    };
  }, []);

  useEffect(() => {
    if (onPerformanceChange) {
      onPerformanceChange(metrics);
    }
  }, [metrics, onPerformanceChange]);

  // Auto-hide if performance is good
  useEffect(() => {
    if (showMetrics && metrics.fps < 30) {
      setIsVisible(true);
    } else if (showMetrics) {
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [metrics.fps, showMetrics]);
  
  // Check for mobile devices and set compact mode
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsCompact(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcut to toggle metrics (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
      // Toggle compact mode with Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        setIsCompact(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const getPerformanceColor = (fps: number) => {
    if (fps >= 50) return '#10b981'; // green
    if (fps >= 30) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  // Get position classes based on position prop
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'top-right':
      default: return 'top-4 right-4';
    }
  };

  // Toggle button for compact mode
  const FloatingToggle = () => (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      onClick={() => setIsVisible(true)}
      className={`fixed ${getPositionClasses()} z-50 p-2 rounded-full shadow-lg bg-black/70 backdrop-blur-sm border border-gray-700 text-white`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FiActivity size={16} />
    </motion.button>
  );

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`fixed ${getPositionClasses()} z-50 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 ${isCompact ? 'p-2' : 'p-3'} text-xs font-mono text-white touch-none`}
          style={{ maxWidth: '90vw', minWidth: isCompact ? 'auto' : '150px' }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <FiActivity className="mr-1" size={12} />
              {!isCompact && <span className="font-semibold text-xs">Performance</span>}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsCompact(!isCompact)}
                className="text-gray-400 hover:text-white p-1"
                title={isCompact ? "Expand" : "Compact mode"}
              >
                {isCompact ? <FiMaximize2 size={10} /> : <FiMinimize2 size={10} />}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white p-1"
                title="Close"
              >
                <FiX size={10} />
              </button>
            </div>
          </div>
          
          {isCompact ? (
            // Compact view - just FPS
            <div className="flex items-center justify-center">
              <span style={{ color: getPerformanceColor(metrics.fps) }} className="font-bold">
                {metrics.fps} FPS
              </span>
            </div>
          ) : (
            // Full view
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>FPS:</span>
                <span style={{ color: getPerformanceColor(metrics.fps) }}>
                  {metrics.fps}
                </span>
              </div>
              
              {metrics.memory > 0 && (
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="text-blue-400">{metrics.memory}MB</span>
                </div>
              )}
              
              {metrics.loadTime > 0 && (
                <div className="flex justify-between">
                  <span>Load:</span>
                  <span className="text-purple-400">{metrics.loadTime}ms</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="text-cyan-400">{metrics.connectionType}</span>
              </div>
              
              <div className="mt-1 pt-1 border-t border-gray-700 text-[10px] text-gray-400">
                Drag to move • Ctrl+Shift+P/C
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <FloatingToggle />
      )}
    </AnimatePresence>
  );
};

export default PerformanceMonitor;
