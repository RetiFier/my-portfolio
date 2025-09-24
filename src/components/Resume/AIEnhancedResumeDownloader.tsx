import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiLoader, FiZap, FiStar, FiCpu, FiFileText } from 'react-icons/fi';
import { AIEnhancedResumeGenerator } from '../../utils/aiEnhancedResumeGenerator';

interface AIEnhancedResumeDownloaderProps {
  portfolioData: any;
  className?: string;
}

const AIEnhancedResumeDownloader: React.FC<AIEnhancedResumeDownloaderProps> = ({ 
  portfolioData, 
  className = '' 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Process portfolio data with AI enhancement
      const resumeData = await AIEnhancedResumeGenerator.processPortfolioData(portfolioData);
      
      // Generate enhanced HTML content
      const htmlContent = AIEnhancedResumeGenerator.generateEnhancedHTML(resumeData);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const enhancementType = resumeData.metadata.aiEnhanced ? 'AI_Enhanced' : 'Professional';
      const filename = `${resumeData.personal.fullName.replace(/\s+/g, '_')}_${enhancementType}_Resume_${timestamp}.html`;

      // Download the file
      AIEnhancedResumeGenerator.downloadHTML(htmlContent, filename);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Resume generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate resume');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Single Creative Download Button */}
      <div className="flex flex-col items-center">
        <motion.button
          onClick={handleDownload}
          disabled={isGenerating}
          className="group relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Main Button Container */}
          <div 
            className="relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[280px] flex items-center justify-center gap-3"
            style={{
              background: `linear-gradient(135deg, #82aaff 0%, #c792ea 50%, #addb67 100%)`,
              boxShadow: '0 8px 32px rgba(130, 170, 255, 0.3)',
              color: '#011627'
            }}
          >
            {/* Animated Background Overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
              style={{
                background: `linear-gradient(135deg, #c792ea 0%, #82aaff 50%, #ffcb8b 100%)`,
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full opacity-30"
                  style={{
                    background: '#ffffff',
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center gap-3">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FiCpu className="text-2xl" />
                    </motion.div>
                    <span>AI Crafting Resume...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <FiZap className="text-2xl" />
                    </motion.div>
                    <span>Download Portfolio</span>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <FiStar className="text-xl" style={{ color: '#ffcb8b' }} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Glow Effect */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, #82aaff 0%, #c792ea 100%)`,
                filter: 'blur(20px)',
                transform: 'scale(1.1)',
              }}
            />
          </div>

          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100"
            style={{ borderColor: '#82aaff' }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.button>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="mt-4 p-4 rounded-xl text-center max-w-md"
              style={{
                background: 'rgba(255, 88, 116, 0.1)',
                border: '1px solid #ff5874',
                color: '#ff5874'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiFileText className="text-lg" />
                <strong>Oops!</strong>
              </div>
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="mt-4 p-4 rounded-xl text-center max-w-md"
              style={{
                background: 'rgba(173, 219, 103, 0.1)',
                border: '1px solid #addb67',
                color: '#addb67'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5 }}
                >
                  <FiStar className="text-lg" />
                </motion.div>
                <strong>Success!</strong>
              </div>
              <p className="text-sm">Resume is ready!</p>
            </motion.div>
          )}
        </AnimatePresence>

  
      </div>
    </div>
  );
};

export default AIEnhancedResumeDownloader;
