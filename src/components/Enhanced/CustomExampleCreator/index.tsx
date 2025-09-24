import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface CustomExampleCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateExample: (example: CodeExample) => void;
}

const CustomExampleCreator: React.FC<CustomExampleCreatorProps> = ({
  isOpen,
  onClose,
  onCreateExample
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'javascript',
    complexity: 'Beginner',
    category: 'Custom',
    skills: '',
    code: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    if (formData.code.length < 10) {
      newErrors.code = 'Code must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const newExample: CodeExample = {
      id: `custom-${Date.now()}`,
      title: formData.title,
      description: formData.description || 'Custom user-created example',
      language: formData.language,
      complexity: formData.complexity,
      category: formData.category,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      code: formData.code,
      executable: true
    };

    onCreateExample(newExample);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      language: 'javascript',
      complexity: 'Beginner',
      category: 'Custom',
      skills: '',
      code: ''
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const codeTemplates = {
    javascript: `// JavaScript Example
function myFunction() {
  console.log('Hello World!');
  return 'Success';
}

// Test your function
myFunction();`,
    typescript: `// TypeScript Example
interface User {
  name: string;
  age: number;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

// Test your function
const user: User = { name: 'John', age: 30 };
console.log(greetUser(user));`,
    python: `# Python Example
def my_function():
    print("Hello World!")
    return "Success"

# Test your function
my_function()`,
    java: `// Java Example
public class MyClass {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
    
    public static String myFunction() {
        return "Success";
    }
}`,
    cpp: `// C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}`
  };

  const loadTemplate = () => {
    const template = codeTemplates[formData.language as keyof typeof codeTemplates] || codeTemplates.javascript;
    handleInputChange('code', template);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="rounded-lg border p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: nightOwl.surface,
              borderColor: nightOwl.border
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold" style={{ color: nightOwl.text }}>
                  Create Custom Example
                </h3>
                <p className="text-sm mt-1" style={{ color: nightOwl.textDim }}>
                  Build your own code example to showcase your skills
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
                style={{ 
                  backgroundColor: nightOwl.darker,
                  color: nightOwl.textDim 
                }}
              >
                ✕
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: nightOwl.text }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="My Awesome Algorithm"
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                      errors.title ? 'ring-2 ring-red-500' : ''
                    }`}
                    style={{
                      backgroundColor: nightOwl.darker,
                      borderColor: errors.title ? nightOwl.error : nightOwl.border,
                      color: nightOwl.text
                    }}
                  />
                  {errors.title && (
                    <p className="text-xs mt-1" style={{ color: nightOwl.error }}>
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: nightOwl.text }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what your code does and why it's useful..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: nightOwl.darker,
                      borderColor: nightOwl.border,
                      color: nightOwl.text
                    }}
                  />
                </div>

                {/* Language & Complexity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: nightOwl.text }}>
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: nightOwl.darker,
                        borderColor: nightOwl.border,
                        color: nightOwl.text
                      }}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: nightOwl.text }}>
                      Complexity
                    </label>
                    <select
                      value={formData.complexity}
                      onChange={(e) => handleInputChange('complexity', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: nightOwl.darker,
                        borderColor: nightOwl.border,
                        color: nightOwl.text
                      }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>

                {/* Category & Skills */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: nightOwl.text }}>
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="Algorithm, Data Structure, etc."
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: nightOwl.darker,
                        borderColor: nightOwl.border,
                        color: nightOwl.text
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: nightOwl.text }}>
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      placeholder="JavaScript, Algorithms, Problem Solving"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: nightOwl.darker,
                        borderColor: nightOwl.border,
                        color: nightOwl.text
                      }}
                    />
                  </div>
                </div>

                {/* Template Button */}
                <div>
                  <button
                    onClick={loadTemplate}
                    className="px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      borderColor: nightOwl.accent,
                      color: nightOwl.accent,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Load {formData.language} Template
                  </button>
                </div>
              </div>

              {/* Right Column - Code Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium" style={{ color: nightOwl.text }}>
                    Code *
                  </label>
                  <span className="text-xs" style={{ color: nightOwl.textDim }}>
                    {formData.code.length} characters
                  </span>
                </div>
                <textarea
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="// Write your code here..."
                  rows={20}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 font-mono text-sm ${
                    errors.code ? 'ring-2 ring-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: nightOwl.darker,
                    borderColor: errors.code ? nightOwl.error : nightOwl.border,
                    color: nightOwl.text
                  }}
                />
                {errors.code && (
                  <p className="text-xs mt-1" style={{ color: nightOwl.error }}>
                    {errors.code}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t" style={{ borderColor: nightOwl.border }}>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border transition-colors"
                style={{
                  borderColor: nightOwl.border,
                  color: nightOwl.textDim,
                  backgroundColor: 'transparent'
                }}
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border transition-colors"
                style={{
                  borderColor: nightOwl.border,
                  color: nightOwl.textDim,
                  backgroundColor: 'transparent'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: nightOwl.accent,
                  color: nightOwl.bg
                }}
              >
                Create Example
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomExampleCreator;
