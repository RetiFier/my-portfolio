import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiStar, FiZap, FiTarget, FiTrendingUp, FiEye, FiCode, FiMessageSquare } from 'react-icons/fi';

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

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

interface UserStats {
  totalPoints: number;
  level: number;
  achievements: number;
  timeSpent: number;
  sectionsVisited: Set<string>;
  interactionsCount: number;
}

// Enhanced achievement system with more achievements
const achievements: Achievement[] = [
  {
    id: 'portfolio_visitor',
    title: 'Portfolio Visitor',
    description: 'Welcome! You\'ve started exploring',
    points: 10,
    rarity: 'common',
    icon: '👋'
  },
  {
    id: 'section_explorer',
    title: 'Section Explorer',
    description: 'Visited 3 different sections',
    points: 25,
    rarity: 'common',
    icon: '🔍'
  },
  {
    id: 'time_traveler',
    title: 'Time Traveler',
    description: 'Spent 2+ minutes exploring',
    points: 30,
    rarity: 'rare',
    icon: '⏰'
  },
  {
    id: 'interaction_master',
    title: 'Interaction Master',
    description: 'Clicked on 5+ interactive elements',
    points: 40,
    rarity: 'rare',
    icon: '🎯'
  },
  {
    id: 'code_enthusiast',
    title: 'Code Enthusiast',
    description: 'Explored the code playground',
    points: 50,
    rarity: 'epic',
    icon: '💻'
  },
  {
    id: 'ai_conversationalist',
    title: 'AI Conversationalist',
    description: 'Had a chat with the AI assistant',
    points: 60,
    rarity: 'epic',
    icon: '🤖'
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Explored every section thoroughly',
    points: 100,
    rarity: 'legendary',
    icon: '🏆'
  }
];

const AdvancedGamification: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    achievements: 0,
    timeSpent: 0,
    sectionsVisited: new Set(),
    interactionsCount: 0
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [showNotification, setShowNotification] = useState<Achievement | null>(null);
  const [startTime] = useState(Date.now());
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized unlock function to prevent infinite loops
  const unlockAchievement = useCallback((id: string) => {
    if (unlockedAchievements.has(id)) return;

    const achievement = achievements.find(a => a.id === id);
    if (!achievement) return;

    setUnlockedAchievements(prev => new Set([...prev, id]));
    setUserStats(prev => {
      const newPoints = prev.totalPoints + achievement.points;
      return {
        ...prev,
        totalPoints: newPoints,
        achievements: prev.achievements + 1,
        level: Math.floor(newPoints / 100) + 1
      };
    });

    setShowNotification(achievement);
    setTimeout(() => setShowNotification(null), 4000);
  }, [unlockedAchievements]);

  // Track section visits
  const trackSectionVisit = useCallback((sectionId: string) => {
    setUserStats(prev => {
      const newSections = new Set([...prev.sectionsVisited, sectionId]);
      
      // Check for section-based achievements
      if (newSections.size >= 3 && !unlockedAchievements.has('section_explorer')) {
        setTimeout(() => unlockAchievement('section_explorer'), 500);
      }
      if (newSections.size >= 6 && !unlockedAchievements.has('completionist')) {
        setTimeout(() => unlockAchievement('completionist'), 500);
      }
      
      return {
        ...prev,
        sectionsVisited: newSections
      };
    });
  }, [unlockAchievement, unlockedAchievements]);

  // Track interactions
  const trackInteraction = useCallback((type?: string) => {
    setUserStats(prev => {
      const newCount = prev.interactionsCount + 1;
      
      // Check for interaction-based achievements
      if (newCount >= 5 && !unlockedAchievements.has('interaction_master')) {
        setTimeout(() => unlockAchievement('interaction_master'), 500);
      }
      
      // Special achievements based on interaction type
      if (type === 'code' && !unlockedAchievements.has('code_enthusiast')) {
        setTimeout(() => unlockAchievement('code_enthusiast'), 500);
      }
      if (type === 'ai' && !unlockedAchievements.has('ai_conversationalist')) {
        setTimeout(() => unlockAchievement('ai_conversationalist'), 500);
      }
      
      return {
        ...prev,
        interactionsCount: newCount
      };
    });
  }, [unlockAchievement, unlockedAchievements]);

  // Initialize and time tracking
  useEffect(() => {
    if (!isInitialized) {
      // Welcome achievement
      setTimeout(() => {
        unlockAchievement('portfolio_visitor');
        setIsInitialized(true);
      }, 1000);
    }

    // Time tracking
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      setUserStats(prev => ({ ...prev, timeSpent }));
      
      // Time-based achievements
      if (timeSpent >= 120 && !unlockedAchievements.has('time_traveler')) {
        unlockAchievement('time_traveler');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, unlockAchievement, unlockedAchievements, isInitialized]);

  // Global tracking setup (only once)
  useEffect(() => {
    (window as any).portfolioGamification = {
      trackInteraction,
      trackSectionVisit,
      unlockAchievement
    };
  }, [trackInteraction, trackSectionVisit, unlockAchievement]);

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return nightOwl.textDim;
      case 'rare': return nightOwl.accent;
      case 'epic': return nightOwl.secondary;
      case 'legendary': return nightOwl.warning;
      default: return nightOwl.textDim;
    }
  };

  return (
    <>
      {/* Enhanced Floating Stats */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        <div 
          className="rounded-lg p-3 backdrop-blur-sm border shadow-lg"
          style={{
            backgroundColor: nightOwl.surface + 'E6',
            borderColor: nightOwl.border
          }}
        >
          <div className="flex items-center space-x-3 text-sm">
            <div style={{ color: nightOwl.accent }}>
              <FiAward className="w-4 h-4" />
            </div>
            <div style={{ color: nightOwl.text }}>
              <div className="font-medium">Level {userStats.level}</div>
              <div className="text-xs" style={{ color: nightOwl.textDim }}>
                {userStats.totalPoints} pts • {userStats.achievements} achievements
              </div>
            </div>
          </div>
          
          {/* Progress bar for next level */}
          <div className="mt-2">
            <div 
              className="w-full h-1 rounded-full"
              style={{ backgroundColor: nightOwl.darker }}
            >
              <motion.div
                className="h-1 rounded-full"
                style={{ backgroundColor: nightOwl.accent }}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((userStats.totalPoints % 100) / 100) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Achievement Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -50, scale: 0.8, x: 100 }}
            className="fixed top-4 right-4 z-50 rounded-lg p-4 max-w-sm border shadow-xl"
            style={{
              backgroundColor: nightOwl.surface,
              borderColor: getRarityColor(showNotification.rarity)
            }}
          >
            <div className="flex items-start space-x-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ 
                  backgroundColor: getRarityColor(showNotification.rarity) + '20',
                  border: `2px solid ${getRarityColor(showNotification.rarity)}`
                }}
              >
                {showNotification.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-bold text-sm" style={{ color: nightOwl.text }}>
                    Achievement Unlocked!
                  </h4>
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ 
                      backgroundColor: getRarityColor(showNotification.rarity) + '20',
                      color: getRarityColor(showNotification.rarity)
                    }}
                  >
                    {showNotification.rarity.toUpperCase()}
                  </span>
                </div>
                <p className="font-medium text-sm mb-1" style={{ color: nightOwl.text }}>
                  {showNotification.title}
                </p>
                <p className="text-xs mb-2" style={{ color: nightOwl.textDim }}>
                  {showNotification.description}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-bold" style={{ color: nightOwl.success }}>
                    +{showNotification.points} points
                  </p>
                  <FiStar className="w-3 h-3" style={{ color: nightOwl.success }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdvancedGamification;
