import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCode, FiLayers, FiBarChart, FiMenu, FiX } from 'react-icons/fi';

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

type Mode = 'code' | 'visualization' | 'insights';

interface ModeOption {
  key: Mode;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

interface ModeSelectorProps {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
  isMobile?: boolean;
}

const modes: ModeOption[] = [
  {
    key: 'code',
    label: 'Code Editor',
    icon: FiCode,
    description: 'Interactive coding with AI assistance',
    color: nightOwl.accent
  },
  {
    key: 'visualization',
    label: 'Visualizations',
    icon: FiLayers,
    description: 'Algorithm flowcharts and animations',
    color: nightOwl.secondary
  },
  {
    key: 'insights',
    label: 'Recruiter Insights',
    icon: FiBarChart,
    description: 'Professional metrics and skill tracking',
    color: nightOwl.warning
  }
];

const ModeButton: React.FC<{
  mode: ModeOption;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
  index: number;
}> = ({ mode, isActive, onClick, isMobile, index }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all relative overflow-hidden ${
        isActive ? 'ring-2' : ''
      } ${isMobile ? 'w-full justify-start' : 'flex-col space-y-1 space-x-0 text-center min-w-[120px]'}`}
      style={{
        backgroundColor: isActive ? mode.color + '20' : nightOwl.surface,
        color: isActive ? mode.color : nightOwl.text,
        borderColor: isActive ? mode.color : nightOwl.border
      }}
      initial={{ opacity: 0, y: isMobile ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02,
        backgroundColor: isActive ? mode.color + '30' : nightOwl.selection
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background Animation */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="relative z-10 flex items-center space-x-3">
        <mode.icon className={`w-5 h-5 ${isMobile ? '' : 'mb-1'}`} />
        <div className={isMobile ? '' : 'text-center'}>
          <div className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
            {mode.label}
          </div>
          {isMobile && (
            <div className="text-xs opacity-75 mt-1">
              {mode.description}
            </div>
          )}
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && !isMobile && (
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full"
          style={{ backgroundColor: mode.color }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
};

const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
}> = ({ isOpen, onClose, activeMode, onModeChange }) => {
  const handleModeSelect = (mode: Mode) => {
    onModeChange(mode);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-20 left-4 right-4 z-50 p-4 rounded-lg border shadow-xl"
            style={{
              backgroundColor: nightOwl.surface,
              borderColor: nightOwl.border
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: nightOwl.text }}>
                Select Mode
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg"
                style={{ color: nightOwl.textDim }}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {modes.map((mode, index) => (
                <ModeButton
                  key={mode.key}
                  mode={mode}
                  isActive={activeMode === mode.key}
                  onClick={() => handleModeSelect(mode.key)}
                  isMobile={true}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ModeSelector: React.FC<ModeSelectorProps> = ({
  activeMode,
  onModeChange,
  isMobile = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isMobile) {
    const activeModeName = modes.find(m => m.key === activeMode)?.label || 'Select Mode';
    const activeModeColor = modes.find(m => m.key === activeMode)?.color || nightOwl.accent;

    return (
      <>
        <motion.button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg border"
          style={{
            backgroundColor: nightOwl.surface,
            borderColor: nightOwl.border,
            color: nightOwl.text
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeModeColor }}
            />
            <span className="font-medium">{activeModeName}</span>
          </div>
          <FiMenu className="w-5 h-5" style={{ color: nightOwl.textDim }} />
        </motion.button>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          activeMode={activeMode}
          onModeChange={onModeChange}
        />
      </>
    );
  }

  return (
    <div className="flex justify-center gap-3">
      {modes.map((mode, index) => (
        <ModeButton
          key={mode.key}
          mode={mode}
          isActive={activeMode === mode.key}
          onClick={() => onModeChange(mode.key)}
          index={index}
        />
      ))}
    </div>
  );
};

export default ModeSelector;
