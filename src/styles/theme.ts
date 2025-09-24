// Advanced Dark Blue Theme System
export const darkBlueTheme = {
  // Primary Dark Blues
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  
  // Deep Navy Blues
  navy: {
    50: '#f0f4ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b'
  },
  
  // Midnight Blues
  midnight: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  
  // Accent Colors
  accent: {
    cyan: '#06b6d4',
    teal: '#14b8a6',
    emerald: '#10b981',
    yellow: '#f59e0b',
    orange: '#f97316',
    red: '#ef4444',
    pink: '#ec4899',
    purple: '#8b5cf6',
    indigo: '#6366f1'
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #2563eb  50%, #3b82f6 75%, #60a5fa 100%)',
    midnight: 'linear-gradient(135deg, #020617 0%, #0f172a 25%, #1e293b 50%, #334155 75%, #475569 100%)',
    ocean: 'linear-gradient(135deg, #1e3a8a 0%, #06b6d4 50%, #14b8a6 100%)',
    aurora: 'linear-gradient(135deg, #1e3a8a 0%, #8b5cf6 50%, #ec4899 100%)',
    matrix: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 30%, #06b6d4 60%, #10b981 100%)'
  },
  
  // Glass Effects
  glass: {
    light: 'rgba(59, 130, 246, 0.1)',
    medium: 'rgba(59, 130, 246, 0.2)',
    heavy: 'rgba(59, 130, 246, 0.3)',
    backdrop: 'backdrop-blur-md',
    border: 'rgba(59, 130, 246, 0.2)'
  },
  
  // Shadows
  shadows: {
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    glowLarge: '0 0 40px rgba(59, 130, 246, 0.4)',
    inner: 'inset 0 2px 4px rgba(59, 130, 246, 0.1)',
    elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    neon: '0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)'
  }
};

// Animation Presets
export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "backOut" }
  },
  
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
  },
  
  glow: {
    animate: {
      boxShadow: [
        '0 0 20px rgba(59, 130, 246, 0.3)',
        '0 0 40px rgba(59, 130, 246, 0.5)',
        '0 0 20px rgba(59, 130, 246, 0.3)'
      ]
    },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  
  pulse: {
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  
  float: {
    animate: { y: [-10, 10, -10] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  }
};

export default darkBlueTheme;
