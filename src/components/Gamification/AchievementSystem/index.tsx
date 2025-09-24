import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

const achievements: Achievement[] = [
  {
    id: '3d_explorer',
    title: '3D Explorer',
    description: 'Interacted with the 3D hero scene',
    icon: '🌟',
    points: 10,
    rarity: 'common'
  },
  {
    id: 'journey_started',
    title: 'Journey Begun',
    description: 'Started exploring the portfolio',
    icon: '🚀',
    points: 5,
    rarity: 'common'
  },
  {
    id: 'timeline_explorer',
    title: 'Time Traveler',
    description: 'Explored the interactive timeline',
    icon: '⏰',
    points: 15,
    rarity: 'common'
  },
  {
    id: 'timeline_master',
    title: 'Timeline Master',
    description: 'Viewed all timeline entries',
    icon: '🏆',
    points: 50,
    rarity: 'rare'
  },
  {
    id: 'project_explorer',
    title: 'Project Scout',
    description: 'Discovered a project in the galaxy',
    icon: '🔭',
    points: 20,
    rarity: 'common'
  },
  {
    id: 'project_enthusiast',
    title: 'Project Enthusiast',
    description: 'Explored 3 different projects',
    icon: '💼',
    points: 30,
    rarity: 'rare'
  },
  {
    id: 'project_master',
    title: 'Project Master',
    description: 'Explored all projects in detail',
    icon: '🎯',
    points: 100,
    rarity: 'epic'
  },
  {
    id: 'deep_diver',
    title: 'Deep Diver',
    description: 'Opened a detailed project case study',
    icon: '🤿',
    points: 25,
    rarity: 'common'
  },
  {
    id: 'skill_explorer',
    title: 'Skill Seeker',
    description: 'Explored the skills constellation',
    icon: '🌌',
    points: 15,
    rarity: 'common'
  },
  {
    id: 'skill_enthusiast',
    title: 'Skill Enthusiast',
    description: 'Explored 10 different skills',
    icon: '⭐',
    points: 40,
    rarity: 'rare'
  },
  {
    id: 'skill_master',
    title: 'Skill Master',
    description: 'Explored all skills in the constellation',
    icon: '🧠',
    points: 75,
    rarity: 'epic'
  },
  {
    id: 'category_explorer',
    title: 'Category Explorer',
    description: 'Filtered skills by category',
    icon: '📂',
    points: 10,
    rarity: 'common'
  },
  {
    id: 'navigation_explorer',
    title: 'Navigator',
    description: 'Used the navigation dots',
    icon: '🧭',
    points: 5,
    rarity: 'common'
  },
  {
    id: 'portfolio_explorer',
    title: 'Portfolio Explorer',
    description: 'Clicked explore projects button',
    icon: '🗺️',
    points: 10,
    rarity: 'common'
  },
  {
    id: 'contact_interested',
    title: 'Connection Seeker',
    description: 'Showed interest in getting in touch',
    icon: '📧',
    points: 30,
    rarity: 'rare'
  },
  {
    id: 'resume_downloaded',
    title: 'Resume Hunter',
    description: 'Downloaded the resume',
    icon: '📄',
    points: 25,
    rarity: 'rare'
  },
  {
    id: 'konami_master',
    title: 'Konami Master',
    description: 'Discovered the secret Konami code',
    icon: '🎮',
    points: 200,
    rarity: 'legendary'
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Unlocked all achievements',
    icon: '👑',
    points: 500,
    rarity: 'legendary'
  }
];

const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common': return 'from-gray-400 to-gray-600';
    case 'rare': return 'from-blue-400 to-blue-600';
    case 'epic': return 'from-purple-400 to-purple-600';
    case 'legendary': return 'from-yellow-400 to-orange-500';
    default: return 'from-gray-400 to-gray-600';
  }
};

interface AchievementSystemProps {
  achievements: string[];
  onAchievementUnlock: (achievement: string) => void;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  achievements: unlockedIds, 
  onAchievementUnlock 
}) => {
  const [showNotification, setShowNotification] = useState<Achievement | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [previousUnlocked, setPreviousUnlocked] = useState<string[]>([]);

  // Konami code detection
  useEffect(() => {
    const konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    let userInput: string[] = [];

    const handleKeyDown = (event: KeyboardEvent) => {
      userInput.push(event.code);
      userInput = userInput.slice(-konamiCode.length);
      
      if (userInput.join(',') === konamiCode.join(',')) {
        onAchievementUnlock('konami_master');
        userInput = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAchievementUnlock]);

  // Check for new achievements
  useEffect(() => {
    const newAchievements = unlockedIds.filter(id => !previousUnlocked.includes(id));
    
    if (newAchievements.length > 0) {
      const latestAchievement = achievements.find(a => a.id === newAchievements[newAchievements.length - 1]);
      if (latestAchievement) {
        setShowNotification(latestAchievement);
        setTimeout(() => setShowNotification(null), 5000);
      }
    }
    
    setPreviousUnlocked(unlockedIds);
  }, [unlockedIds, previousUnlocked]);

  // Calculate total points
  useEffect(() => {
    const points = achievements
      .filter(achievement => unlockedIds.includes(achievement.id))
      .reduce((sum, achievement) => sum + achievement.points, 0);
    setTotalPoints(points);
  }, [unlockedIds]);

  // Check for completionist achievement
  useEffect(() => {
    const nonCompletionistAchievements = achievements.filter(a => a.id !== 'completionist');
    const unlockedNonCompletionist = unlockedIds.filter(id => id !== 'completionist');
    
    if (unlockedNonCompletionist.length === nonCompletionistAchievements.length && 
        !unlockedIds.includes('completionist')) {
      onAchievementUnlock('completionist');
    }
  }, [unlockedIds, onAchievementUnlock]);

  const unlockedAchievements = achievements.filter(a => unlockedIds.includes(a.id));
  const progressPercentage = (unlockedAchievements.length / achievements.length) * 100;

  return (
    <>
      {/* Achievement Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 min-w-80"
          >
            <div className="flex items-center">
              <div className={`text-3xl mr-4 p-2 rounded-full bg-gradient-to-r ${getRarityColor(showNotification.rarity)}`}>
                {showNotification.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">Achievement Unlocked!</h3>
                <p className="text-cyan-400 font-semibold">{showNotification.title}</p>
                <p className="text-gray-300 text-sm">{showNotification.description}</p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400 text-sm">+{showNotification.points} points</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs bg-gradient-to-r ${getRarityColor(showNotification.rarity)} text-white`}>
                    {showNotification.rarity.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Panel Toggle */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed top-6 right-6 z-40 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          🏆
          {unlockedAchievements.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unlockedAchievements.length}
            </div>
          )}
        </div>
      </motion.button>

      {/* Achievement Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-6 z-30 w-96 max-h-[80vh] bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Achievements</h3>
                  <p className="text-sm opacity-90">
                    {unlockedAchievements.length}/{achievements.length} unlocked
                  </p>
                </div>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  ×
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3 bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-white rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="text-sm mt-1 text-center">
                {totalPoints} total points earned
              </div>
            </div>

            {/* Achievement List */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {achievements.map((achievement) => {
                  const isUnlocked = unlockedIds.includes(achievement.id);
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        isUnlocked
                          ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}/20 border-white/30`
                          : 'bg-white/5 border-white/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`text-2xl mr-3 ${isUnlocked ? '' : 'grayscale'}`}>
                          {isUnlocked ? achievement.icon : '🔒'}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-sm ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                            {isUnlocked ? achievement.description : '???'}
                          </p>
                          <div className="flex items-center mt-1 gap-2">
                            <span className={`text-xs ${isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                              {achievement.points} points
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                              {achievement.rarity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm">
                Keep exploring to unlock more achievements!
              </p>
              {progressPercentage === 100 && (
                <motion.p
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-yellow-400 font-bold mt-2"
                >
                  🎉 Congratulations! You're a true explorer! 🎉
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
