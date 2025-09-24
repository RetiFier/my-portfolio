import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiCopy, FiDownload, FiRefreshCw, FiTerminal, 
  FiZap, FiCheckCircle, FiCode, FiInfo, FiActivity 
} from 'react-icons/fi';

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

interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  executable: boolean;
  category: string;
  complexity?: string;
  skills?: string[];
}

interface AIAssistance {
  type: 'suggestion' | 'warning' | 'error' | 'optimization';
  message: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
}

interface CodeEditorProps {
  selectedExample: CodeExample;
  userCode: string;
  setUserCode: (code: string) => void;
  isRunning: boolean;
  output: string;
  copied: boolean;
  aiAssistance: AIAssistance[];
  onRunCode: () => void;
  onCopyCode: () => void;
  onDownloadCode: () => void;
  onAnalyzeCode: (code: string) => void;
  isAnalyzing: boolean;
  debugInfo: string;
}

const CodeStats: React.FC<{
  code: string;
  aiAssistance: AIAssistance[];
}> = ({ code, aiAssistance }) => {
  const stats = [
    { 
      label: 'Lines', 
      value: code.split('\n').length, 
      icon: FiCode,
      color: nightOwl.accent 
    },
    { 
      label: 'Characters', 
      value: code.length, 
      icon: FiActivity,
      color: nightOwl.secondary 
    },
    { 
      label: 'AI Tips', 
      value: aiAssistance.length, 
      icon: FiInfo,
      color: nightOwl.warning 
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="p-3 rounded-lg border text-center"
          style={{
            backgroundColor: nightOwl.surface,
            borderColor: nightOwl.border
          }}
        >
          <stat.icon 
            className="w-4 h-4 mx-auto mb-1" 
            style={{ color: stat.color }} 
          />
          <div className="text-lg font-bold" style={{ color: nightOwl.text }}>
            {stat.value}
          </div>
          <div className="text-xs" style={{ color: nightOwl.textDim }}>
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const AIAssistancePanel: React.FC<{
  aiAssistance: AIAssistance[];
  isAnalyzing: boolean;
  debugInfo: string;
}> = ({ aiAssistance, isAnalyzing, debugInfo }) => {
  if (aiAssistance.length === 0 && !isAnalyzing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4"
    >
      <div className="p-4 rounded-lg border" style={{
        backgroundColor: nightOwl.darker,
        borderColor: nightOwl.border
      }}>
        <div className="flex items-center space-x-2 mb-3">
          <FiZap className="w-4 h-4" style={{ color: nightOwl.accent }} />
          <span className="font-medium text-sm" style={{ color: nightOwl.text }}>
            AI Assistant
          </span>
          {isAnalyzing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4"
            >
              <FiRefreshCw style={{ color: nightOwl.accent }} />
            </motion.div>
          )}
        </div>

        {isAnalyzing && (
          <div className="text-sm mb-2" style={{ color: nightOwl.textDim }}>
            {debugInfo}
          </div>
        )}

        <div className="space-y-2 max-h-32 overflow-y-auto">
          {aiAssistance.map((assistance, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-2 p-2 rounded text-sm"
              style={{
                backgroundColor: assistance.severity === 'high' ? nightOwl.error + '20' :
                               assistance.severity === 'medium' ? nightOwl.warning + '20' :
                               nightOwl.success + '20'
              }}
            >
              <div className="w-2 h-2 rounded-full mt-1.5" style={{
                backgroundColor: assistance.severity === 'high' ? nightOwl.error :
                               assistance.severity === 'medium' ? nightOwl.warning :
                               nightOwl.success
              }} />
              <div>
                <div style={{ color: nightOwl.text }}>{assistance.message}</div>
                {assistance.line && (
                  <div className="text-xs mt-1" style={{ color: nightOwl.textDim }}>
                    Line {assistance.line}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  selectedExample,
  userCode,
  setUserCode,
  isRunning,
  output,
  copied,
  aiAssistance,
  onRunCode,
  onCopyCode,
  onDownloadCode,
  onAnalyzeCode,
  isAnalyzing,
  debugInfo
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [userCode]);

  const handleCodeChange = (value: string) => {
    setUserCode(value);
    
    // Debounced AI analysis
    const timeoutId = setTimeout(() => {
      if (value.trim().length > 10) {
        onAnalyzeCode(value);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  return (
    <motion.div
      key={selectedExample.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b gap-3" 
           style={{ borderColor: nightOwl.border }}>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate" style={{ color: nightOwl.text }}>
            {selectedExample.title}
          </h3>
          <p className="text-sm mt-1 line-clamp-2" style={{ color: nightOwl.textDim }}>
            {selectedExample.description}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={onCopyCode}
            className="p-2 rounded-lg transition-colors"
            style={{ color: nightOwl.textDim }}
            title="Copy code"
          >
            {copied ? (
              <FiCheckCircle className="w-4 h-4" style={{ color: nightOwl.success }} />
            ) : (
              <FiCopy className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={onDownloadCode}
            className="p-2 rounded-lg transition-colors"
            style={{ color: nightOwl.textDim }}
            title="Download code"
          >
            <FiDownload className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg transition-colors sm:hidden"
            style={{ color: nightOwl.textDim }}
            title="Toggle fullscreen"
          >
            <FiTerminal className="w-4 h-4" />
          </button>
          
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50"
            style={{
              backgroundColor: nightOwl.accent,
              color: nightOwl.bg
            }}
          >
            {isRunning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiRefreshCw className="w-4 h-4" />
              </motion.div>
            ) : (
              <FiPlay className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isRunning ? 'Running...' : 'Run'}
            </span>
          </button>
        </div>
      </div>

      {/* Code Stats */}
      <div className="p-4 border-b" style={{ borderColor: nightOwl.border }}>
        <CodeStats code={userCode || selectedExample.code} aiAssistance={aiAssistance} />
      </div>

      {/* AI Assistance Panel */}
      <div className="px-4">
        <AIAssistancePanel 
          aiAssistance={aiAssistance}
          isAnalyzing={isAnalyzing}
          debugInfo={debugInfo}
        />
      </div>

      {/* Code Editor */}
      <div className={`flex-1 p-4 ${isExpanded ? 'fixed inset-0 z-50 bg-opacity-95' : ''}`}
           style={isExpanded ? { backgroundColor: nightOwl.bg } : {}}>
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 p-2 rounded-lg z-10"
            style={{ backgroundColor: nightOwl.surface, color: nightOwl.text }}
          >
            ✕
          </button>
        )}
        
        <textarea
          ref={textareaRef}
          value={userCode || selectedExample.code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className={`w-full font-mono text-sm resize-none focus:outline-none focus:ring-2 rounded-lg p-4 ${
            isExpanded ? 'h-5/6' : 'min-h-[300px] max-h-[500px]'
          }`}
          style={{
            backgroundColor: nightOwl.darker,
            color: nightOwl.text,
            border: `1px solid ${nightOwl.border}`,
            ringColor: nightOwl.accent
          }}
          placeholder="Start typing to modify the code..."
          spellCheck={false}
        />
      </div>

      {/* Output Panel */}
      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t p-4"
            style={{ borderColor: nightOwl.border }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <FiTerminal className="w-4 h-4" style={{ color: nightOwl.accent }} />
              <span className="font-medium text-sm" style={{ color: nightOwl.text }}>
                Output
              </span>
            </div>
            <pre 
              className="text-sm p-3 rounded-lg overflow-x-auto max-h-32"
              style={{
                backgroundColor: nightOwl.darker,
                color: nightOwl.text,
                border: `1px solid ${nightOwl.border}`
              }}
            >
              {output}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CodeEditor;
