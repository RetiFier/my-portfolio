import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCheckCircle, FiTarget, FiAward, FiCode, FiUsers } from 'react-icons/fi';

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

interface RecruiterInsight {
  category: 'skills' | 'quality' | 'methodology' | 'adaptation' | 'collaboration';
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  icon?: React.ComponentType<any>;
}

interface SkillDemonstration {
  skill: string;
  demonstrated: boolean;
  examples: string[];
  proficiency: number;
  lastUsed: Date;
}

interface RecruiterInsightsProps {
  insights: RecruiterInsight[];
  skillDemonstrations: SkillDemonstration[];
}

const MetricCard: React.FC<{
  insight: RecruiterInsight;
  index: number;
}> = ({ insight, index }) => {
  const getIcon = () => {
    switch (insight.category) {
      case 'skills':
        return FiCode;
      case 'quality':
        return FiTarget;
      case 'methodology':
        return FiAward;
      case 'adaptation':
        return FiTrendingUp;
      case 'collaboration':
        return FiUsers;
      default:
        return FiTarget;
    }
  };

  const IconComponent = insight.icon || getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-6 rounded-lg border relative overflow-hidden"
      style={{
        backgroundColor: nightOwl.surface,
        borderColor: nightOwl.border
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-transparent to-current" 
             style={{ color: nightOwl.accent }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: nightOwl.darker }}>
              <IconComponent className="w-5 h-5" style={{ color: nightOwl.accent }} />
            </div>
            <h4 className="font-bold text-lg" style={{ color: nightOwl.text }}>
              {insight.metric}
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold" style={{ color: nightOwl.accent }}>
              {insight.value}
            </span>
            <div className="text-center">
              <span className="text-sm" style={{ color: nightOwl.textDim }}>/100</span>
              {insight.trend === 'up' && (
                <FiTrendingUp className="w-4 h-4 ml-1" style={{ color: nightOwl.success }} />
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-3 rounded-full" style={{ backgroundColor: nightOwl.darker }}>
            <motion.div
              className="h-3 rounded-full relative overflow-hidden"
              style={{ backgroundColor: nightOwl.accent }}
              initial={{ width: 0 }}
              animate={{ width: `${insight.value}%` }}
              transition={{ duration: 1.5, delay: index * 0.1 }}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  duration: 2, 
                  delay: index * 0.1 + 1.5,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>
        </div>
        
        <p className="text-sm leading-relaxed" style={{ color: nightOwl.textDim }}>
          {insight.description}
        </p>

        {/* Category Badge */}
        <div className="mt-3">
          <span 
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: nightOwl.accent + '20',
              color: nightOwl.accent
            }}
          >
            {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const SkillMatrix: React.FC<{
  skills: SkillDemonstration[];
}> = ({ skills }) => {
  return (
    <div className="rounded-lg border p-6" style={{
      backgroundColor: nightOwl.surface,
      borderColor: nightOwl.border
    }}>
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-xl" style={{ color: nightOwl.text }}>
          Skills Demonstration Matrix
        </h4>
        <div className="text-sm" style={{ color: nightOwl.textDim }}>
          {skills.filter(s => s.demonstrated).length} / {skills.length} demonstrated
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.skill}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-lg border relative"
            style={{
              backgroundColor: nightOwl.darker,
              borderColor: skill.demonstrated ? nightOwl.success : nightOwl.border
            }}
          >
            {/* Skill Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm" style={{ color: nightOwl.text }}>
                {skill.skill}
              </span>
              {skill.demonstrated && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                >
                  <FiCheckCircle className="w-4 h-4" style={{ color: nightOwl.success }} />
                </motion.div>
              )}
            </div>

            {/* Proficiency Level */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1" style={{ color: nightOwl.textDim }}>
                <span>Proficiency</span>
                <span>{skill.proficiency}%</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: nightOwl.surface }}>
                <motion.div
                  className="h-2 rounded-full"
                  style={{ 
                    backgroundColor: skill.demonstrated ? nightOwl.success : nightOwl.textDim 
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.proficiency}%` }}
                  transition={{ duration: 1, delay: index * 0.05 }}
                />
              </div>
            </div>

            {/* Examples */}
            {skill.examples.length > 0 && (
              <div>
                <div className="text-xs mb-1" style={{ color: nightOwl.textDim }}>
                  Examples:
                </div>
                <div className="flex flex-wrap gap-1">
                  {skill.examples.slice(0, 2).map((example, exIndex) => (
                    <span
                      key={exIndex}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: nightOwl.accent + '20',
                        color: nightOwl.accent
                      }}
                    >
                      {example}
                    </span>
                  ))}
                  {skill.examples.length > 2 && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: nightOwl.textDim + '20',
                        color: nightOwl.textDim
                      }}
                    >
                      +{skill.examples.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Last Used Indicator */}
            <div className="mt-2 text-xs" style={{ color: nightOwl.textDim }}>
              Last used: {skill.lastUsed.toLocaleDateString()}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const RecruiterInsights: React.FC<RecruiterInsightsProps> = ({
  insights,
  skillDemonstrations
}) => {
  const overallScore = Math.round(
    insights.reduce((sum, insight) => sum + insight.value, 0) / insights.length
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
          style={{ backgroundColor: nightOwl.accent + '20' }}
        >
          <span className="text-3xl font-bold" style={{ color: nightOwl.accent }}>
            {overallScore}
          </span>
        </motion.div>
        <h3 className="text-2xl font-bold mb-4" style={{ color: nightOwl.text }}>
          Professional Skills & Recruiter Insights
        </h3>
        <p style={{ color: nightOwl.textDim }}>
          Quantified technical proficiency and professional development metrics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {insights.map((insight, index) => (
          <MetricCard
            key={insight.metric}
            insight={insight}
            index={index}
          />
        ))}
      </div>

      {/* Skills Matrix */}
      <SkillMatrix skills={skillDemonstrations} />

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { 
            label: 'Overall Score', 
            value: overallScore, 
            suffix: '/100',
            color: nightOwl.accent 
          },
          { 
            label: 'Skills Demonstrated', 
            value: skillDemonstrations.filter(s => s.demonstrated).length,
            suffix: `/${skillDemonstrations.length}`,
            color: nightOwl.success 
          },
          { 
            label: 'Avg Proficiency', 
            value: Math.round(
              skillDemonstrations.reduce((sum, skill) => sum + skill.proficiency, 0) / 
              skillDemonstrations.length
            ),
            suffix: '%',
            color: nightOwl.warning 
          },
          { 
            label: 'Growth Metrics', 
            value: insights.filter(i => i.trend === 'up').length,
            suffix: ` trending up`,
            color: nightOwl.secondary 
          }
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="text-center p-4 rounded-lg border"
            style={{
              backgroundColor: nightOwl.surface,
              borderColor: nightOwl.border
            }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
              {stat.value}<span className="text-sm">{stat.suffix}</span>
            </div>
            <div className="text-xs" style={{ color: nightOwl.textDim }}>
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default RecruiterInsights;
