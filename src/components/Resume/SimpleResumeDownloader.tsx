import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiFileText, FiSettings, FiX, FiCheck, FiLoader, FiImage, FiPrinter } from 'react-icons/fi';
import { SimpleResumeGenerator } from '../../utils/simpleResumeGenerator';

interface SimpleResumeDownloaderProps {
  portfolioData: any;
  className?: string;
}

const SimpleResumeDownloader: React.FC<SimpleResumeDownloaderProps> = ({ 
  portfolioData, 
  className = '' 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'creative'>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (template: 'professional' | 'creative') => {
    setIsGenerating(true);
    setError(null);

    try {
      // Process portfolio data
      const resumeData = SimpleResumeGenerator.processPortfolioData(portfolioData);
      
      // Generate HTML content
      const htmlContent = template === 'creative' 
        ? SimpleResumeGenerator.generateCreativeHTML(resumeData)
        : SimpleResumeGenerator.generateProfessionalHTML(resumeData);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const templateType = template === 'creative' ? 'Creative' : 'Professional';
      const filename = `${resumeData.personal.fullName.replace(/\s+/g, '_')}_${templateType}_Resume_${timestamp}.html`;

      // Download the file
      SimpleResumeGenerator.downloadHTML(htmlContent, filename);
      
      setShowOptions(false);
    } catch (err) {
      console.error('Resume generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate resume');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = (template: 'professional' | 'creative') => {
    try {
      const resumeData = SimpleResumeGenerator.processPortfolioData(portfolioData);
      const htmlContent = template === 'creative' 
        ? SimpleResumeGenerator.generateCreativeHTML(resumeData)
        : SimpleResumeGenerator.generateProfessionalHTML(resumeData);

      // Open in new window for preview
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }
    } catch (err) {
      console.error('Preview error:', err);
      setError('Failed to generate preview');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Quick Download Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <motion.button
          onClick={() => handleDownload('professional')}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
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
          onClick={() => handleDownload('creative')}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
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
          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
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
            className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      {!error && !isGenerating && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-sm text-gray-600 text-center"
        >
          Resume will be downloaded as HTML file (can be printed to PDF)
        </motion.p>
      )}

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
                <div className="grid grid-cols-1 gap-3">
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

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => handlePreview(selectedTemplate)}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiPrinter />
                  Preview
                </motion.button>

                <motion.button
                  onClick={() => handleDownload(selectedTemplate)}
                  disabled={isGenerating}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                      Download
                    </>
                  )}
                </motion.button>
              </div>

              {/* Info Text */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> Download as HTML, then open in browser and print to PDF for best results. 
                  The resume includes current date and dynamically updated content.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleResumeDownloader;
