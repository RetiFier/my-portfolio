import React, { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ResumeData, ResumeDataProcessor, ResumeOptions } from '../utils/resumeGenerator';
import ProfessionalTemplate from '../components/Resume/ProfessionalTemplate';
import CreativeTemplate from '../components/Resume/CreativeTemplate';

export interface UseResumeGeneratorReturn {
  generateResume: (portfolioData: any, options?: Partial<ResumeOptions>) => Promise<void>;
  downloadResume: (blob: Blob, filename: string) => void;
  isGenerating: boolean;
  error: string | null;
}

export const useResumeGenerator = (): UseResumeGeneratorReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResume = useCallback(async (
    portfolioData: any, 
    options: Partial<ResumeOptions> = {}
  ) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Default options
      const defaultOptions: ResumeOptions = {
        template: 'professional',
        includeProjects: true,
        maxProjects: 6,
        includeAllSkills: true,
        customSections: [],
      };

      const finalOptions = { ...defaultOptions, ...options };

      // Process portfolio data into resume format
      const resumeData: ResumeData = ResumeDataProcessor.processPortfolioData(portfolioData);
      const metadata = ResumeDataProcessor.getResumeMetadata();

      // Select template component
      const TemplateComponent = finalOptions.template === 'creative' 
        ? CreativeTemplate 
        : ProfessionalTemplate;

      // Generate PDF
      const blob = await pdf(
        React.createElement(TemplateComponent, { data: resumeData, metadata })
      ).toBlob();

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const templateType = finalOptions.template === 'creative' ? 'Creative' : 'Professional';
      const filename = `${resumeData.personal.fullName.replace(/\s+/g, '_')}_${templateType}_Resume_${timestamp}.pdf`;

      // Download the file
      downloadResume(blob, filename);

    } catch (err) {
      console.error('Resume generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate resume');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadResume = useCallback((blob: Blob, filename: string) => {
    try {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download resume');
    }
  }, []);

  return {
    generateResume,
    downloadResume,
    isGenerating,
    error,
  };
};

export default useResumeGenerator;
