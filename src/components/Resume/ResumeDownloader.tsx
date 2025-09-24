import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiFileText, FiSettings, FiX, FiCheck, FiLoader, FiImage } from 'react-icons/fi';
import { useResumeGenerator } from '../../hooks/useResumeGenerator';
import { ResumeOptions } from '../../utils/resumeGenerator';

interface ResumeDownloaderProps {
  portfolioData: any;
  className?: string;
}

const ResumeDownloader: React.FC<ResumeDownloaderProps> = ({ 
  portfolioData, 
  className = '' 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'creative'>('professional');
  const [includeProjects, setIncludeProjects] = useState(true);
  const [maxProjects, setMaxProjects] = useState(6);
  
  const { generateResume, isGenerating, error } = useResumeGenerator();

  const handleDownload = async (template: 'professional' | 'creative') => {
    const options: Partial<ResumeOptions> = {
      template,
      includeProjects,
      maxProjects,
      includeAllSkills: true,
    };

    await generateResume(portfolioData, options);
    setShowOptions(false);
  };

  const quickDownload = async (template: 'professional' | 'creative') => {
    await handleDownload(template);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Quick Download Buttons */}
      <div className="flex gap-3">
        <motion.button
          onClick={() => quickDownload('professional')}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <FiLoader className="animate-spin" />
          ) : (
            <FiFileText />
          )}
          Professional Resume
        </motion.button>

        <motion.button
          onClick={() => quickDownload('creative')}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <FiLoader className="animate-spin" />
          ) : (
            <FiImage />
          )}
          Creative Resume
        </motion.button>

        <motion.button
          onClick={() => setShowOptions(true)}
          className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiSettings />
          Options
        </motion.button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options Modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Resume Options</h3>
                <button
                  onClick={() => setShowOptions(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX />
                </button>
              </div>

              {/* Template Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Template Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedTemplate('professional')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedTemplate === 'professional'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FiFileText className="text-blue-600" />
                      <span className="font-semibold">Professional</span>
                      {selectedTemplate === 'professional' && (
                        <FiCheck className="text-blue-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Clean, ATS-friendly format perfect for corporate environments
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedTemplate('creative')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedTemplate === 'creative'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FiImage className="text-purple-600" />
                      <span className="font-semibold">Creative</span>
                      {selectedTemplate === 'creative' && (
                        <FiCheck className="text-purple-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Modern design with visual elements for creative roles
                    </p>
                  </button>
                </div>
              </div>

              {/* Project Options */}
              <div className="mb-6">
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={includeProjects}
                    onChange={(e) => setIncludeProjects(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Include Projects Section
                  </span>
                </label>

                {includeProjects && (
                  <div className="ml-7">
                    <label className="block text-xs text-gray-600 mb-2">
                      Maximum Projects: {maxProjects}
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={maxProjects}
                      onChange={(e) => setMaxProjects(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <motion.button
                onClick={() => handleDownload(selectedTemplate)}
                disabled={isGenerating}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedTemplate === 'creative'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FiDownload />
                    Generate & Download Resume
                  </>
                )}
              </motion.button>

              {/* Info Text */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Resume will be generated with current date and dynamically updated content
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeDownloader;
