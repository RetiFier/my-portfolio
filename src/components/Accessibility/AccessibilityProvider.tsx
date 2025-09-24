import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  focusVisible: boolean;
  screenReaderMode: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  focusVisible: true,
  screenReaderMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Detect system preferences
  useEffect(() => {
    const detectSystemPreferences = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      setSettings(prev => ({
        ...prev,
        reducedMotion,
        highContrast,
      }));
    };

    detectSystemPreferences();

    // Listen for changes in system preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Screen reader mode
    if (settings.screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }
  }, [settings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + M: Toggle reduced motion
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
      }
      
      // Alt + C: Toggle high contrast
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
      }
      
      // Alt + +: Increase font size
      if (e.altKey && e.key === '=') {
        e.preventDefault();
        setSettings(prev => ({
          ...prev,
          fontSize: prev.fontSize === 'small' ? 'medium' : 
                   prev.fontSize === 'medium' ? 'large' : 'large'
        }));
      }
      
      // Alt + -: Decrease font size
      if (e.altKey && e.key === '-') {
        e.preventDefault();
        setSettings(prev => ({
          ...prev,
          fontSize: prev.fontSize === 'large' ? 'medium' : 
                   prev.fontSize === 'medium' ? 'small' : 'small'
        }));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;
