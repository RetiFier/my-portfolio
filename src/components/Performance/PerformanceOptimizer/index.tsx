import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PerformanceMetrics {
  deviceMemory: number;
  hardwareConcurrency: number;
  connectionType: string;
  batteryLevel: number;
  isCharging: boolean;
  isLowEndDevice: boolean;
  reducedMotion: boolean;
  webGLSupported: boolean;
}

interface PerformanceSettings {
  enableParticles: boolean;
  particleCount: number;
  enable3DEffects: boolean;
  enableAnimations: boolean;
  enableAutoRotation: boolean;
  frameRate: number;
  quality: 'low' | 'medium' | 'high';
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  settings: PerformanceSettings;
  updateSettings: (newSettings: Partial<PerformanceSettings>) => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

// Hook for performance-aware components
export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceOptimizer');
  }
  return context;
};

// Device capability detection
const detectDeviceCapabilities = async (): Promise<PerformanceMetrics> => {
  // Device memory (navigator.deviceMemory is experimental)
  const deviceMemory = (navigator as any).deviceMemory || 4; // Default to 4GB

  // Hardware concurrency (CPU cores)
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;

  // Network connection type
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const connectionType = connection?.effectiveType || 'unknown';

  // Battery status
  let batteryLevel = 1;
  let isCharging = true;
  
  try {
    const battery = await (navigator as any).getBattery?.();
    if (battery) {
      batteryLevel = battery.level;
      isCharging = battery.charging;
    }
  } catch (error) {
    // Battery API not supported
  }

  // Check for reduced motion preference
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // WebGL support detection
  const canvas = document.createElement('canvas');
  const webGLSupported = !!(
    canvas.getContext('webgl') || 
    canvas.getContext('experimental-webgl') ||
    canvas.getContext('webgl2')
  );

  // Low-end device detection
  const isLowEndDevice = 
    deviceMemory <= 2 || 
    hardwareConcurrency <= 2 || 
    connectionType === 'slow-2g' || 
    connectionType === '2g' ||
    !webGLSupported;

  return {
    deviceMemory,
    hardwareConcurrency,
    connectionType,
    batteryLevel,
    isCharging,
    isLowEndDevice,
    reducedMotion,
    webGLSupported
  };
};

// Generate optimal settings based on device capabilities
const generateOptimalSettings = (metrics: PerformanceMetrics): PerformanceSettings => {
  if (metrics.isLowEndDevice || metrics.reducedMotion) {
    return {
      enableParticles: false,
      particleCount: 0,
      enable3DEffects: false,
      enableAnimations: !metrics.reducedMotion,
      enableAutoRotation: false,
      frameRate: 30,
      quality: 'low'
    };
  }

  if (metrics.deviceMemory <= 4 || metrics.batteryLevel < 0.2) {
    return {
      enableParticles: true,
      particleCount: 50,
      enable3DEffects: true,
      enableAnimations: true,
      enableAutoRotation: metrics.isCharging,
      frameRate: 30,
      quality: 'medium'
    };
  }

  // High-end device settings
  return {
    enableParticles: true,
    particleCount: 200,
    enable3DEffects: true,
    enableAnimations: true,
    enableAutoRotation: true,
    frameRate: 60,
    quality: 'high'
  };
};

interface PerformanceOptimizerProps {
  children: ReactNode;
  enableDebug?: boolean;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ 
  children, 
  enableDebug = false 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    deviceMemory: 4,
    hardwareConcurrency: 2,
    connectionType: 'unknown',
    batteryLevel: 1,
    isCharging: true,
    isLowEndDevice: false,
    reducedMotion: false,
    webGLSupported: true
  });

  const [settings, setSettings] = useState<PerformanceSettings>({
    enableParticles: true,
    particleCount: 100,
    enable3DEffects: true,
    enableAnimations: true,
    enableAutoRotation: true,
    frameRate: 60,
    quality: 'high'
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializePerformance = async () => {
      try {
        const detectedMetrics = await detectDeviceCapabilities();
        const optimalSettings = generateOptimalSettings(detectedMetrics);
        
        setMetrics(detectedMetrics);
        setSettings(optimalSettings);
        setIsInitialized(true);

        // Log performance optimization results
        if (enableDebug) {
          console.log('Performance Optimizer initialized:', {
            metrics: detectedMetrics,
            settings: optimalSettings
          });
        }
      } catch (error) {
        console.warn('Failed to detect device capabilities:', error);
        setIsInitialized(true);
      }
    };

    initializePerformance();
  }, [enableDebug]);

  // Monitor battery changes
  useEffect(() => {
    let battery: any;

    const handleBatteryChange = () => {
      if (battery) {
        const newBatteryLevel = battery.level;
        const newIsCharging = battery.charging;
        
        setMetrics(prev => ({
          ...prev,
          batteryLevel: newBatteryLevel,
          isCharging: newIsCharging
        }));

        // Adjust settings based on battery level
        if (newBatteryLevel < 0.2 && !newIsCharging) {
          setSettings(prev => ({
            ...prev,
            enableAutoRotation: false,
            particleCount: Math.min(prev.particleCount, 50),
            frameRate: 30,
            quality: 'low'
          }));
        } else if (newBatteryLevel > 0.5 || newIsCharging) {
          // Restore performance settings
          const optimalSettings = generateOptimalSettings(metrics);
          setSettings(optimalSettings);
        }
      }
    };

    const setupBatteryMonitoring = async () => {
      try {
        battery = await (navigator as any).getBattery?.();
        if (battery) {
          battery.addEventListener('levelchange', handleBatteryChange);
          battery.addEventListener('chargingchange', handleBatteryChange);
        }
      } catch (error) {
        // Battery API not supported
      }
    };

    setupBatteryMonitoring();

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', handleBatteryChange);
        battery.removeEventListener('chargingchange', handleBatteryChange);
      }
    };
  }, [metrics]);

  // Monitor connection changes
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    const handleConnectionChange = () => {
      const newConnectionType = connection?.effectiveType || 'unknown';
      
      setMetrics(prev => ({
        ...prev,
        connectionType: newConnectionType
      }));

      // Adjust settings for slow connections
      if (newConnectionType === 'slow-2g' || newConnectionType === '2g') {
        setSettings(prev => ({
          ...prev,
          enableParticles: false,
          enable3DEffects: false,
          quality: 'low'
        }));
      }
    };

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  const updateSettings = (newSettings: Partial<PerformanceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Optimizing performance...</p>
        </div>
      </div>
    );
  }

  return (
    <PerformanceContext.Provider value={{ metrics, settings, updateSettings }}>
      {children}
      
      {enableDebug && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs">
          <h3 className="font-bold mb-2">Performance Debug</h3>
          <div className="space-y-1">
            <div>Device Memory: {metrics.deviceMemory}GB</div>
            <div>CPU Cores: {metrics.hardwareConcurrency}</div>
            <div>Connection: {metrics.connectionType}</div>
            <div>Battery: {Math.round(metrics.batteryLevel * 100)}% {metrics.isCharging ? '⚡' : '🔋'}</div>
            <div>WebGL: {metrics.webGLSupported ? '✅' : '❌'}</div>
            <div>Low-end: {metrics.isLowEndDevice ? '✅' : '❌'}</div>
            <div>Reduced Motion: {metrics.reducedMotion ? '✅' : '❌'}</div>
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div>Quality: {settings.quality}</div>
              <div>Particles: {settings.enableParticles ? settings.particleCount : 0}</div>
              <div>3D Effects: {settings.enable3DEffects ? '✅' : '❌'}</div>
              <div>FPS Target: {settings.frameRate}</div>
            </div>
          </div>
        </div>
      )}
    </PerformanceContext.Provider>
  );
};

// Progressive Enhancement Wrapper
interface ProgressiveEnhancementProps {
  children: ReactNode;
  fallback?: ReactNode;
  minRequirements?: {
    webGL?: boolean;
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
}

export const ProgressiveEnhancement: React.FC<ProgressiveEnhancementProps> = ({
  children,
  fallback,
  minRequirements = {}
}) => {
  const { metrics } = usePerformance();

  const meetsRequirements = 
    (!minRequirements.webGL || metrics.webGLSupported) &&
    (!minRequirements.deviceMemory || metrics.deviceMemory >= minRequirements.deviceMemory) &&
    (!minRequirements.hardwareConcurrency || metrics.hardwareConcurrency >= minRequirements.hardwareConcurrency);

  if (!meetsRequirements && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Safe 3D Canvas wrapper with error boundaries
interface Safe3DCanvasProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const Safe3DCanvas: React.FC<Safe3DCanvasProps> = ({ children, fallback }) => {
  const { metrics } = usePerformance();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError || !metrics.webGLSupported) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        {fallback || (
          <div className="text-white text-center">
            <div className="text-4xl mb-4">🎨</div>
            <p>3D content not available</p>
            <p className="text-sm text-gray-400">WebGL not supported or error occurred</p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
