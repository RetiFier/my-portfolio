import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCode, FiLayers, FiDatabase, FiZap, FiCpu, FiGlobe, 
  FiPlus, FiFilter, FiSearch, FiX, FiChevronDown 
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

interface ExampleSidebarProps {
  examples: CodeExample[];
  selectedExample: CodeExample;
  onSelectExample: (example: CodeExample) => void;
  onCreateCustom: () => void;
  isCompact?: boolean;
}

const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'React Optimization': FiZap,
    'Async Programming': FiCpu,
    'Design Patterns': FiLayers,
    'Data Structures': FiDatabase,
    'Performance Utilities': FiZap,
    'Real-time Communication': FiGlobe,
    'Custom': FiPlus
  };

  const IconComponent = iconMap[category] || FiCode;
  return <IconComponent className="w-4 h-4" />;
};

const ComplexityBadge: React.FC<{ complexity?: string }> = ({ complexity }) => {
  if (!complexity) return null;

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'Expert': return nightOwl.error;
      case 'Advanced': return nightOwl.warning;
      case 'Intermediate': return nightOwl.accent;
      case 'Beginner': return nightOwl.success;
      default: return nightOwl.textDim;
    }
  };

  return (
    <span 
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{
        backgroundColor: getComplexityColor(complexity) + '20',
        color: getComplexityColor(complexity)
      }}
    >
      {complexity}
    </span>
  );
};

const ExampleCard: React.FC<{
  example: CodeExample;
  isSelected: boolean;
  onClick: () => void;
  index: number;
  isCompact?: boolean;
}> = ({ example, isSelected, onClick, index, isCompact }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full p-3 rounded-lg border text-left transition-all mb-2 ${
        isSelected ? 'ring-2' : ''
      } ${isCompact ? 'p-2' : ''}`}
      style={{
        backgroundColor: isSelected ? nightOwl.selection : nightOwl.surface,
        borderColor: isSelected ? nightOwl.accent : nightOwl.border
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start space-x-3">
        <div 
          className={`p-2 rounded-lg flex-shrink-0 ${isCompact ? 'p-1.5' : ''}`}
          style={{ backgroundColor: nightOwl.darker }}
        >
          <CategoryIcon category={example.category} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-medium truncate ${isCompact ? 'text-sm' : ''}`} 
                style={{ color: nightOwl.text }}>
              {example.title}
            </h4>
            {example.id === 'custom-example' && (
              <FiPlus className="w-4 h-4 flex-shrink-0" style={{ color: nightOwl.accent }} />
            )}
          </div>
          
          {!isCompact && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: nightOwl.textDim }}>
              {example.category}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <ComplexityBadge complexity={example.complexity} />
            {example.skills && example.skills.length > 0 && (
              <span className="text-xs" style={{ color: nightOwl.textDim }}>
                {example.skills.length} skills
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

const FilterPanel: React.FC<{
  categories: string[];
  complexities: string[];
  selectedCategory: string;
  selectedComplexity: string;
  onCategoryChange: (category: string) => void;
  onComplexityChange: (complexity: string) => void;
  onClear: () => void;
}> = ({ 
  categories, 
  complexities, 
  selectedCategory, 
  selectedComplexity, 
  onCategoryChange, 
  onComplexityChange,
  onClear 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-lg border"
        style={{
          backgroundColor: nightOwl.surface,
          borderColor: nightOwl.border,
          color: nightOwl.text
        }}
      >
        <div className="flex items-center space-x-2">
          <FiFilter className="w-4 h-4" />
          <span className="text-sm">Filters</span>
          {(selectedCategory !== 'All' || selectedComplexity !== 'All') && (
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: nightOwl.accent }} />
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 rounded-lg border space-y-3"
            style={{
              backgroundColor: nightOwl.darker,
              borderColor: nightOwl.border
            }}
          >
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: nightOwl.textDim }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full p-2 rounded text-sm"
                style={{
                  backgroundColor: nightOwl.surface,
                  color: nightOwl.text,
                  border: `1px solid ${nightOwl.border}`
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Complexity Filter */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: nightOwl.textDim }}>
                Complexity
              </label>
              <select
                value={selectedComplexity}
                onChange={(e) => onComplexityChange(e.target.value)}
                className="w-full p-2 rounded text-sm"
                style={{
                  backgroundColor: nightOwl.surface,
                  color: nightOwl.text,
                  border: `1px solid ${nightOwl.border}`
                }}
              >
                {complexities.map(complexity => (
                  <option key={complexity} value={complexity}>{complexity}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(selectedCategory !== 'All' || selectedComplexity !== 'All') && (
              <button
                onClick={onClear}
                className="w-full p-2 rounded text-sm border transition-colors"
                style={{
                  borderColor: nightOwl.border,
                  color: nightOwl.textDim
                }}
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ExampleSidebar: React.FC<ExampleSidebarProps> = ({
  examples,
  selectedExample,
  onSelectExample,
  onCreateCustom,
  isCompact = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedComplexity, setSelectedComplexity] = useState('All');

  // Get unique categories and complexities
  const categories = ['All', ...Array.from(new Set(examples.map(ex => ex.category)))];
  const complexities = ['All', ...Array.from(new Set(examples.map(ex => ex.complexity).filter((c): c is string => Boolean(c))))];

  // Filter examples
  const filteredExamples = examples.filter(example => {
    const matchesSearch = example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         example.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         example.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || example.category === selectedCategory;
    const matchesComplexity = selectedComplexity === 'All' || example.complexity === selectedComplexity;

    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const handleExampleClick = (example: CodeExample) => {
    if (example.id === 'custom-example') {
      onCreateCustom();
    } else {
      onSelectExample(example);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedComplexity('All');
    setSearchQuery('');
  };

  return (
    <div className={`h-full flex flex-col ${isCompact ? 'w-64' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: nightOwl.border }}>
        <h3 className={`font-semibold mb-3 ${isCompact ? 'text-sm' : ''}`} 
            style={{ color: nightOwl.text }}>
          Code Examples
        </h3>
        
        {/* Search */}
        <div className="relative mb-3">
          <FiSearch 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
            style={{ color: nightOwl.textDim }} 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search examples..."
            className={`w-full pl-10 pr-8 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
              isCompact ? 'text-sm py-1.5' : ''
            }`}
            style={{
              backgroundColor: nightOwl.darker,
              borderColor: nightOwl.border,
              color: nightOwl.text
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <FiX className="w-4 h-4" style={{ color: nightOwl.textDim }} />
            </button>
          )}
        </div>

        {/* Filters */}
        {!isCompact && (
          <FilterPanel
            categories={categories}
            complexities={complexities}
            selectedCategory={selectedCategory}
            selectedComplexity={selectedComplexity}
            onCategoryChange={setSelectedCategory}
            onComplexityChange={setSelectedComplexity}
            onClear={clearFilters}
          />
        )}
      </div>

      {/* Examples List */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredExamples.length === 0 ? (
          <div className="text-center py-8">
            <FiSearch className="w-8 h-8 mx-auto mb-2" style={{ color: nightOwl.textDim }} />
            <p className="text-sm" style={{ color: nightOwl.textDim }}>
              No examples found
            </p>
            <button
              onClick={clearFilters}
              className="text-xs mt-2 underline"
              style={{ color: nightOwl.accent }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredExamples.map((example, index) => (
              <ExampleCard
                key={example.id}
                example={example}
                isSelected={selectedExample.id === example.id}
                onClick={() => handleExampleClick(example)}
                index={index}
                isCompact={isCompact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t" style={{ borderColor: nightOwl.border }}>
        <div className="text-xs text-center" style={{ color: nightOwl.textDim }}>
          {filteredExamples.length} of {examples.length} examples
        </div>
      </div>
    </div>
  );
};

export default ExampleSidebar;
